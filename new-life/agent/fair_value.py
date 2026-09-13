"""Fair-value estimation and mispricing scanning.

Honest framing (per user's accuracy preference): a prediction market's
current price already IS the crowd's aggregated fair-value estimate. This
project has no proprietary information edge and no verified live sentiment
feed (see sentiment.py). The "fair value" computed here is therefore a
transparent, inspectable HEURISTIC, not a claim of true alpha:

1. Binary (Yes/No) markets: fair value = order-book midpoint (a cleaner
   read of current consensus than a possibly-stale last-trade price),
   nudged by a small, capped sentiment adjustment derived from the
   question/description text. The nudge is intentionally small
   (default +/-5 percentage points at sentiment=+/-1) so it can flag a
   candidate mispricing without pretending to out-know the market.
2. Multi-outcome markets (more than two outcomes: elections with several
   candidates, etc.): outcome prices are renormalized to sum to 1. Any
   existing over/under-round in the raw prices IS a real, mechanical
   mispricing signal (not a guess), independent of sentiment.

Every Opportunity carries a `rationale` string that names exactly which of
these components produced the flagged edge, so every decision written to
the log is auditable.
"""

from __future__ import annotations

import logging
from collections import defaultdict
from dataclasses import dataclass

from .config import AgentConfig
from .models import Market, Opportunity, Side
from .sentiment import SentimentAnalyzer

logger = logging.getLogger("agent.fair_value")


def _clamp(value: float, lo: float = 0.01, hi: float = 0.99) -> float:
    return max(lo, min(hi, value))


@dataclass
class ScanStats:
    raw_markets_seen: int = 0
    outcome_rows_seen: int = 0
    filtered_low_liquidity: int = 0
    filtered_low_volume: int = 0
    flagged_opportunities: int = 0


class FairValueEngine:
    def __init__(self, config: AgentConfig, sentiment_analyzer: SentimentAnalyzer):
        self.config = config
        self.sentiment_analyzer = sentiment_analyzer

    def _base_price(self, market: Market) -> float:
        if market.best_bid is not None and market.best_ask is not None:
            return (market.best_bid + market.best_ask) / 2.0
        return market.price

    def compute_group_fair_values(
        self, group: list[Market], sentiment_score: float
    ) -> dict[str, float]:
        """Return {outcome_name: fair_value} for all outcomes of one market."""
        base = {m.outcome_name: self._base_price(m) for m in group}
        names_lower = {name.lower(): name for name in base}

        if len(group) == 2 and "yes" in names_lower and "no" in names_lower:
            yes_name = names_lower["yes"]
            no_name = names_lower["no"]
            delta = sentiment_score * self.config.sentiment_weight
            yes_fv = _clamp(base[yes_name] + delta)
            return {yes_name: yes_fv, no_name: 1.0 - yes_fv}

        total = sum(base.values())
        if total <= 0:
            return {name: 0.0 for name in base}
        return {name: _clamp(v / total) for name, v in base.items()}

    def scan(self, markets: list[Market]) -> tuple[list[Opportunity], ScanStats]:
        stats = ScanStats()
        groups: dict[str, list[Market]] = defaultdict(list)
        for m in markets:
            groups[m.parent_id].append(m)
        stats.raw_markets_seen = len(groups)
        stats.outcome_rows_seen = len(markets)

        opportunities: list[Opportunity] = []
        for parent_id, group in groups.items():
            rep = group[0]
            if rep.liquidity_usd < self.config.min_liquidity_usd:
                stats.filtered_low_liquidity += len(group)
                continue
            if rep.volume_usd < self.config.min_volume_usd:
                stats.filtered_low_volume += len(group)
                continue

            sentiment_text = f"{rep.question}. {rep.description}"
            sentiment_score = self.sentiment_analyzer.score(sentiment_text)
            fair_values = self.compute_group_fair_values(group, sentiment_score)

            for m in group:
                fv = fair_values.get(m.outcome_name)
                if fv is None:
                    continue
                entry_price = m.best_ask if m.best_ask is not None else m.price
                if entry_price is None or entry_price <= 0.0 or entry_price >= 1.0:
                    continue
                edge = fv - entry_price
                if abs(edge) < self.config.mispricing_threshold:
                    continue

                if edge > 0:
                    side = Side.BUY
                    rationale = (
                        f"fair_value={fv:.3f} > entry_price={entry_price:.3f} "
                        f"(edge={edge:+.3f}); base_mid={self._base_price(m):.3f}, "
                        f"sentiment={sentiment_score:+.2f} (weight={self.config.sentiment_weight}); "
                        f"liquidity=${m.liquidity_usd:,.0f}, volume=${m.volume_usd:,.0f}"
                    )
                else:
                    # This outcome looks overpriced relative to its fair
                    # value. This agent only ever buys shares (no shorting
                    # modeled), so we don't act on it here -- for a
                    # Yes/No market the mirrored edge surfaces naturally
                    # when the complementary outcome row is evaluated in
                    # this same loop (fair values are complementary by
                    # construction); for >2-outcome markets there is no
                    # single complement, so this edge is simply left
                    # untraded rather than approximated.
                    continue

                opportunities.append(
                    Opportunity(
                        market=m,
                        fair_value=fv,
                        side=side,
                        entry_price=entry_price,
                        edge=edge,
                        sentiment_score=sentiment_score,
                        rationale=rationale,
                    )
                )
                stats.flagged_opportunities += 1

        opportunities.sort(key=lambda o: abs(o.edge), reverse=True)
        return opportunities, stats
