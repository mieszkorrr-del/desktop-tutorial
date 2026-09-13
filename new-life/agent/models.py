"""Core data structures shared across the agent."""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Optional


class Side(str, Enum):
    """The trade direction on a specific outcome-token.

    Only BUY is ever produced by this agent (no shorting is modeled -- see
    fair_value.py). This is deliberately NOT named YES/NO to avoid
    colliding with `Market.outcome_name`, which is often literally the
    string "Yes" or "No" -- "buy the Yes outcome" and "buy the No outcome"
    are both a BUY.
    """

    BUY = "BUY"


@dataclass
class Market:
    """A snapshot of one Polymarket binary (or single-outcome-slice) market.

    For multi-outcome events, Polymarket still exposes each outcome as its
    own market/token with its own price, so this shape covers both cases:
    ``outcome_name`` distinguishes the specific outcome when a question has
    more than two possible answers.
    """

    market_id: str
    parent_id: str  # raw Polymarket market id shared by all outcomes of one question
    condition_id: str
    question: str
    slug: str
    outcome_name: str
    price: float  # implied probability of `outcome_name`, in [0, 1]
    best_bid: Optional[float]
    best_ask: Optional[float]
    volume_usd: float
    liquidity_usd: float
    end_date_iso: Optional[str]
    category: Optional[str]
    description: str = ""
    active: bool = True
    closed: bool = False
    fetched_at: float = field(default_factory=time.time)

    @property
    def spread(self) -> Optional[float]:
        if self.best_bid is None or self.best_ask is None:
            return None
        return max(0.0, self.best_ask - self.best_bid)


@dataclass
class Opportunity:
    """A flagged mispricing on one market/outcome, before sizing."""

    market: Market
    fair_value: float
    side: Side  # which side (YES on outcome_name, or its NO) has positive edge
    entry_price: float  # price paid per share for `side`
    edge: float  # fair_value_for_side - entry_price, always >= threshold
    sentiment_score: float
    rationale: str


@dataclass
class Position:
    position_id: str
    market_id: str
    question: str
    outcome_name: str
    side: Side
    entry_price: float
    shares: float
    cost_usd: float
    fair_value_at_entry: float
    opened_at: float
    opened_at_iso: str
    rationale: str
    closed: bool = False
    close_price: Optional[float] = None
    closed_at: Optional[float] = None
    closed_at_iso: Optional[str] = None
    close_reason: Optional[str] = None
    realized_pnl_usd: Optional[float] = None

    def mark_to_market_value(self, current_price: float) -> float:
        return self.shares * current_price

    def unrealized_pnl(self, current_price: float) -> float:
        return self.mark_to_market_value(current_price) - self.cost_usd

    @staticmethod
    def new_id() -> str:
        return uuid.uuid4().hex[:12]


@dataclass
class Trade:
    """A completed (closed) trade, kept for the trade history / report."""

    position_id: str
    market_id: str
    question: str
    outcome_name: str
    side: Side
    entry_price: float
    exit_price: float
    shares: float
    cost_usd: float
    proceeds_usd: float
    pnl_usd: float
    pnl_pct: float
    opened_at_iso: str
    closed_at_iso: str
    close_reason: str
    rationale: str

    def to_dict(self) -> dict[str, Any]:
        d = dict(self.__dict__)
        d["side"] = self.side.value
        return d
