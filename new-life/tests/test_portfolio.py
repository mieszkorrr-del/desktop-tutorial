import unittest

from agent.config import AgentConfig
from agent.kelly import size_position
from agent.models import Opportunity, Side
from agent.portfolio import Portfolio
from tests.helpers import make_market


def make_opportunity(outcome_name="Yes", entry_price=0.50, fair_value=0.60, parent_id="1"):
    market = make_market(outcome_name, entry_price, parent_id=parent_id)
    edge = fair_value - entry_price
    return Opportunity(
        market=market,
        fair_value=fair_value,
        side=Side.BUY,
        entry_price=entry_price,
        edge=edge,
        sentiment_score=0.0,
        rationale="test",
    )


class TestPortfolioOpenClose(unittest.TestCase):
    def setUp(self):
        self.config = AgentConfig()
        self.portfolio = Portfolio(self.config, starting_bankroll_usd=100.0)

    def test_open_position_deducts_bankroll(self):
        opp = make_opportunity(entry_price=0.50, fair_value=0.60)
        sizing = size_position(0.60, 0.50, self.portfolio.bankroll_usd, 0.5, 0.5, 0.0)
        position = self.portfolio.open_position(opp, sizing)
        self.assertIsNotNone(position)
        self.assertAlmostEqual(self.portfolio.bankroll_usd, 100.0 - sizing.position_usd, places=6)
        self.assertIn(position.position_id, self.portfolio.open_positions)

    def test_close_position_realizes_pnl_and_credits_bankroll(self):
        opp = make_opportunity(entry_price=0.50, fair_value=0.60)
        sizing = size_position(0.60, 0.50, self.portfolio.bankroll_usd, 1.0, 1.0, 0.0)
        position = self.portfolio.open_position(opp, sizing)
        bankroll_after_open = self.portfolio.bankroll_usd

        trade = self.portfolio.close_position(position.position_id, exit_price=0.70, reason="take_profit")

        self.assertIsNotNone(trade)
        expected_proceeds = position.shares * 0.70
        self.assertAlmostEqual(self.portfolio.bankroll_usd, bankroll_after_open + expected_proceeds, places=6)
        self.assertAlmostEqual(trade.pnl_usd, expected_proceeds - position.cost_usd, places=6)
        self.assertNotIn(position.position_id, self.portfolio.open_positions)
        self.assertEqual(len(self.portfolio.trade_history), 1)

    def test_max_open_positions_enforced(self):
        self.config.max_open_positions = 1
        opp1 = make_opportunity(parent_id="1")
        sizing1 = size_position(0.60, 0.50, self.portfolio.bankroll_usd, 0.1, 0.06, 0.0)
        self.portfolio.open_position(opp1, sizing1)
        self.assertFalse(self.portfolio.can_open_new_position())


class TestPortfolioExits(unittest.TestCase):
    def setUp(self):
        self.config = AgentConfig()
        self.config.take_profit_pct = 0.15
        self.config.stop_loss_pct = 0.10
        self.config.exit_edge_threshold = 0.02
        self.portfolio = Portfolio(self.config, starting_bankroll_usd=100.0)

    def _open(self, entry_price, fair_value):
        opp = make_opportunity(entry_price=entry_price, fair_value=fair_value)
        sizing = size_position(fair_value, entry_price, self.portfolio.bankroll_usd, 1.0, 1.0, 0.0)
        return self.portfolio.open_position(opp, sizing)

    def test_take_profit_triggers(self):
        position = self._open(entry_price=0.50, fair_value=0.70)
        # price rallies well above entry -> unrealized gain exceeds 15%
        current_market = make_market("Yes", 0.60, parent_id="1", best_bid=0.60, best_ask=0.61)
        trades = self.portfolio.evaluate_exits({position.market_id: current_market})
        self.assertEqual(len(trades), 1)
        self.assertEqual(trades[0].close_reason, "take_profit")

    def test_stop_loss_triggers(self):
        position = self._open(entry_price=0.50, fair_value=0.70)
        current_market = make_market("Yes", 0.40, parent_id="1", best_bid=0.40, best_ask=0.41)
        trades = self.portfolio.evaluate_exits({position.market_id: current_market})
        self.assertEqual(len(trades), 1)
        self.assertEqual(trades[0].close_reason, "stop_loss")

    def test_market_resolved_settles(self):
        position = self._open(entry_price=0.50, fair_value=0.70)
        current_market = make_market("Yes", 0.99, parent_id="1", closed=True)
        trades = self.portfolio.evaluate_exits({position.market_id: current_market})
        self.assertEqual(len(trades), 1)
        self.assertEqual(trades[0].close_reason, "market_resolved")
        self.assertEqual(trades[0].exit_price, 1.0)

    def test_no_quote_leaves_position_open(self):
        self._open(entry_price=0.50, fair_value=0.70)
        trades = self.portfolio.evaluate_exits({})
        self.assertEqual(len(trades), 0)
        self.assertEqual(len(self.portfolio.open_positions), 1)


class TestPortfolioSerialization(unittest.TestCase):
    def test_roundtrip(self):
        config = AgentConfig()
        portfolio = Portfolio(config, starting_bankroll_usd=100.0)
        opp = make_opportunity(entry_price=0.50, fair_value=0.60)
        sizing = size_position(0.60, 0.50, portfolio.bankroll_usd, 0.5, 0.5, 0.0)
        portfolio.open_position(opp, sizing)
        portfolio.close_position(list(portfolio.open_positions.keys())[0], 0.55, "edge_closed")
        portfolio.cycles_completed = 3

        data = portfolio.to_dict()
        restored = Portfolio.from_dict(config, data)

        self.assertAlmostEqual(restored.bankroll_usd, portfolio.bankroll_usd, places=6)
        self.assertEqual(restored.cycles_completed, 3)
        self.assertEqual(len(restored.trade_history), 1)
        self.assertEqual(restored.trade_history[0].close_reason, "edge_closed")


if __name__ == "__main__":
    unittest.main()
