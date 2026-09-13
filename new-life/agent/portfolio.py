"""Virtual bankroll, open positions, and trade history.

Everything here is paper trading: no real money, no real orders are ever
sent anywhere. `Portfolio` is the single source of truth for P&L and is
fully (de)serializable to JSON so a run can be interrupted and resumed
(see state_store.py).
"""

from __future__ import annotations

import logging
import time
from dataclasses import asdict
from datetime import datetime, timezone
from typing import Any, Optional

from .config import AgentConfig
from .kelly import SizingResult
from .models import Market, Opportunity, Position, Side, Trade

logger = logging.getLogger("agent.portfolio")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class Portfolio:
    def __init__(self, config: AgentConfig, starting_bankroll_usd: Optional[float] = None):
        self.config = config
        self.starting_bankroll_usd = (
            starting_bankroll_usd
            if starting_bankroll_usd is not None
            else config.starting_bankroll_usd
        )
        self.bankroll_usd = self.starting_bankroll_usd
        self.open_positions: dict[str, Position] = {}
        self.trade_history: list[Trade] = []
        self.cycles_completed: int = 0
        self.created_at_iso: str = _now_iso()

    # -- capital & exposure helpers -----------------------------------------

    def invested_usd(self) -> float:
        return sum(p.cost_usd for p in self.open_positions.values())

    def equity_usd(self, latest_price_by_market_id: dict[str, float]) -> float:
        mtm = 0.0
        for p in self.open_positions.values():
            price = latest_price_by_market_id.get(p.market_id, p.entry_price)
            mtm += p.mark_to_market_value(price)
        return self.bankroll_usd + mtm

    def can_open_new_position(self) -> bool:
        return len(self.open_positions) < self.config.max_open_positions

    # -- opening --------------------------------------------------------------

    def open_position(self, opportunity: Opportunity, sizing: SizingResult) -> Optional[Position]:
        if sizing.position_usd <= 0.0:
            return None
        if sizing.position_usd > self.bankroll_usd:
            logger.warning(
                "Sizing (%.2f USD) exceeds available bankroll (%.2f USD); skipping open",
                sizing.position_usd,
                self.bankroll_usd,
            )
            return None

        shares = sizing.position_usd / opportunity.entry_price
        now = time.time()
        position = Position(
            position_id=Position.new_id(),
            market_id=opportunity.market.market_id,
            question=opportunity.market.question,
            outcome_name=opportunity.market.outcome_name,
            side=opportunity.side,
            entry_price=opportunity.entry_price,
            shares=shares,
            cost_usd=sizing.position_usd,
            fair_value_at_entry=opportunity.fair_value,
            opened_at=now,
            opened_at_iso=_now_iso(),
            rationale=opportunity.rationale,
        )
        self.bankroll_usd -= sizing.position_usd
        self.open_positions[position.position_id] = position
        return position

    # -- closing ----------------------------------------------------------------

    def close_position(self, position_id: str, exit_price: float, reason: str) -> Optional[Trade]:
        position = self.open_positions.pop(position_id, None)
        if position is None:
            return None

        exit_price = max(0.0, min(1.0, exit_price))
        proceeds = position.shares * exit_price
        pnl = proceeds - position.cost_usd
        pnl_pct = (pnl / position.cost_usd) if position.cost_usd > 0 else 0.0

        position.closed = True
        position.close_price = exit_price
        position.closed_at = time.time()
        position.closed_at_iso = _now_iso()
        position.close_reason = reason
        position.realized_pnl_usd = pnl

        self.bankroll_usd += proceeds

        trade = Trade(
            position_id=position.position_id,
            market_id=position.market_id,
            question=position.question,
            outcome_name=position.outcome_name,
            side=position.side,
            entry_price=position.entry_price,
            exit_price=exit_price,
            shares=position.shares,
            cost_usd=position.cost_usd,
            proceeds_usd=proceeds,
            pnl_usd=pnl,
            pnl_pct=pnl_pct,
            opened_at_iso=position.opened_at_iso,
            closed_at_iso=position.closed_at_iso,
            close_reason=reason,
            rationale=position.rationale,
        )
        self.trade_history.append(trade)
        return trade

    def evaluate_exits(self, latest_market_by_id: dict[str, Market]) -> list[Trade]:
        """Check every open position against exit rules and close the ones
        that trigger. Rules (first match wins), in order:

        1. Market resolved (closed=True upstream) -> settle at 1.0 or 0.0
           implied by its current price (>=0.5 -> won, <0.5 -> lost). This
           is an approximation: Gamma does not always flip price cleanly to
           exactly 0/1 the instant a market closes, so mid-resolution
           settlement price is used as the best available signal.
        2. Take-profit: unrealized gain >= take_profit_pct of cost.
        3. Stop-loss: unrealized loss >= stop_loss_pct of cost.
        4. Edge exhausted: the mispricing that justified entry has closed
           to within `exit_edge_threshold` (using entry fair value as the
           still-relevant reference, since we don't recompute fair value
           every cycle for positions not currently being re-scanned as
           opportunities).
        """
        closed_trades: list[Trade] = []
        for position_id in list(self.open_positions.keys()):
            position = self.open_positions[position_id]
            market = latest_market_by_id.get(position.market_id)
            if market is None:
                continue  # no fresh quote this cycle; leave it open

            if market.closed:
                settle_price = 1.0 if market.price >= 0.5 else 0.0
                closed_trades.append(
                    self.close_position(position_id, settle_price, "market_resolved")
                )
                continue

            current_price = market.best_bid if market.best_bid is not None else market.price
            unrealized_pct = position.unrealized_pnl(current_price) / position.cost_usd

            if unrealized_pct >= self.config.take_profit_pct:
                closed_trades.append(self.close_position(position_id, current_price, "take_profit"))
                continue
            if unrealized_pct <= -self.config.stop_loss_pct:
                closed_trades.append(self.close_position(position_id, current_price, "stop_loss"))
                continue

            remaining_edge = position.fair_value_at_entry - current_price
            if remaining_edge < self.config.exit_edge_threshold:
                closed_trades.append(self.close_position(position_id, current_price, "edge_closed"))
                continue

        return [t for t in closed_trades if t is not None]

    def close_all_at_market(self, latest_market_by_id: dict[str, Market], reason: str) -> list[Trade]:
        trades = []
        for position_id in list(self.open_positions.keys()):
            position = self.open_positions[position_id]
            market = latest_market_by_id.get(position.market_id)
            price = (
                (market.best_bid if market.best_bid is not None else market.price)
                if market is not None
                else position.entry_price
            )
            trade = self.close_position(position_id, price, reason)
            if trade is not None:
                trades.append(trade)
        return trades

    # -- stats ------------------------------------------------------------------

    def win_rate(self) -> float:
        if not self.trade_history:
            return 0.0
        wins = sum(1 for t in self.trade_history if t.pnl_usd > 0)
        return wins / len(self.trade_history)

    def realized_pnl_usd(self) -> float:
        return sum(t.pnl_usd for t in self.trade_history)

    # -- serialization ---------------------------------------------------------

    def to_dict(self) -> dict[str, Any]:
        return {
            "starting_bankroll_usd": self.starting_bankroll_usd,
            "bankroll_usd": self.bankroll_usd,
            "cycles_completed": self.cycles_completed,
            "created_at_iso": self.created_at_iso,
            "open_positions": {
                pid: {**asdict(p), "side": p.side.value}
                for pid, p in self.open_positions.items()
            },
            "trade_history": [t.to_dict() for t in self.trade_history],
        }

    @classmethod
    def from_dict(cls, config: AgentConfig, data: dict[str, Any]) -> "Portfolio":
        portfolio = cls(config, starting_bankroll_usd=data.get("starting_bankroll_usd"))
        portfolio.bankroll_usd = data["bankroll_usd"]
        portfolio.cycles_completed = data.get("cycles_completed", 0)
        portfolio.created_at_iso = data.get("created_at_iso", _now_iso())

        for pid, pdict in data.get("open_positions", {}).items():
            pdict = dict(pdict)
            pdict["side"] = Side(pdict["side"])
            portfolio.open_positions[pid] = Position(**pdict)

        for tdict in data.get("trade_history", []):
            tdict = dict(tdict)
            tdict["side"] = Side(tdict["side"])
            portfolio.trade_history.append(Trade(**tdict))

        return portfolio
