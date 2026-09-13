"""Shared test fixtures."""

from agent.models import Market


def make_market(outcome_name: str, price: float, parent_id: str = "1", **overrides) -> Market:
    defaults = dict(
        market_id=f"{parent_id}:{outcome_name}",
        parent_id=parent_id,
        condition_id="0xabc",
        question="Will X happen?",
        slug="will-x-happen",
        outcome_name=outcome_name,
        price=price,
        best_bid=price - 0.01,
        best_ask=price + 0.01,
        volume_usd=10000.0,
        liquidity_usd=5000.0,
        end_date_iso="2026-12-31T00:00:00Z",
        category="Test",
        description="Some description.",
    )
    defaults.update(overrides)
    return Market(**defaults)
