"""Kelly-criterion position sizing for a binary buy-and-hold-to-resolution
share purchase on a prediction market.

Derivation (kept here so the formula is checkable, not asserted):

Buying one share of an outcome costs `price` (in [0, 1], since payout on
resolution is exactly 1). Investing fraction f of bankroll BR buys f*BR/price
shares. Terminal wealth is:
  - if the outcome resolves YES (believed probability p): BR*(1 - f + f/price)
  - if it resolves NO (probability 1-p):                   BR*(1 - f)

Maximizing E[log(wealth)] over f and solving dE/df = 0 gives the classic
result:

    f* = (p - price) / (1 - price)         for price in (0, 1)

which is exactly edge / (1 - price), where edge = p - price. f* is only
meaningful (a real bet you'd want to make) when edge > 0; a non-positive
edge means Kelly says bet nothing (f* <= 0).
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class SizingResult:
    kelly_fraction_raw: float  # full-Kelly f*, before the safety multiplier
    kelly_fraction_applied: float  # after multiplier and bankroll cap
    position_usd: float
    capped_by: str  # "kelly" | "max_position_pct" | "bankroll" | "min_position_floor" | "none"


def kelly_fraction(fair_probability: float, price: float) -> float:
    """Full-Kelly fraction of bankroll to stake buying at `price` when the
    true probability of winning is `fair_probability`. Returns 0 if there
    is no positive edge or price is degenerate (0 or 1)."""
    if price <= 0.0 or price >= 1.0:
        return 0.0
    edge = fair_probability - price
    if edge <= 0.0:
        return 0.0
    return edge / (1.0 - price)


def size_position(
    fair_probability: float,
    price: float,
    bankroll_usd: float,
    kelly_multiplier: float,
    max_position_pct: float,
    min_position_usd: float,
) -> SizingResult:
    """Apply fractional Kelly, then cap at `max_position_pct` of bankroll.

    `kelly_multiplier` < 1 implements "fractional Kelly" (e.g. 0.5 = half
    Kelly), a standard practitioner adjustment that trades some growth
    rate for materially lower variance/drawdown -- appropriate here since
    our fair-value estimate is a heuristic, not a verified true
    probability (see fair_value.py).
    """
    f_raw = kelly_fraction(fair_probability, price)
    f_applied = f_raw * kelly_multiplier

    capped_by = "kelly"
    if f_applied > max_position_pct:
        f_applied = max_position_pct
        capped_by = "max_position_pct"

    position_usd = f_applied * bankroll_usd
    if position_usd > bankroll_usd:
        position_usd = bankroll_usd
        capped_by = "bankroll"

    if position_usd < min_position_usd:
        return SizingResult(
            kelly_fraction_raw=f_raw,
            kelly_fraction_applied=0.0,
            position_usd=0.0,
            capped_by="min_position_floor",
        )

    return SizingResult(
        kelly_fraction_raw=f_raw,
        kelly_fraction_applied=f_applied,
        position_usd=position_usd,
        capped_by=capped_by,
    )
