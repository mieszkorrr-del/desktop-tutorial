import unittest

from agent.config import AgentConfig
from agent.fair_value import FairValueEngine
from agent.sentiment import SentimentAnalyzer
from tests.helpers import make_market


class StubSentimentAnalyzer(SentimentAnalyzer):
    """Returns a fixed score regardless of input, so fair-value tests are
    deterministic and independent of the lexicon's word list."""

    def __init__(self, fixed_score: float):
        self.fixed_score = fixed_score

    def score(self, text: str) -> float:
        return self.fixed_score


class TestFairValueEngine(unittest.TestCase):
    def setUp(self):
        self.config = AgentConfig()
        self.config.sentiment_weight = 0.05
        self.config.mispricing_threshold = 0.08
        self.config.min_liquidity_usd = 0.0
        self.config.min_volume_usd = 0.0

    def test_binary_market_positive_sentiment_shifts_fair_value_up(self):
        engine = FairValueEngine(self.config, StubSentimentAnalyzer(1.0))
        yes = make_market("Yes", 0.50)
        no = make_market("No", 0.50)
        fair_values = engine.compute_group_fair_values([yes, no], sentiment_score=1.0)
        # base mid ~0.50, sentiment=+1 * weight 0.05 -> yes fair value ~0.55
        self.assertAlmostEqual(fair_values["Yes"], 0.55, places=6)
        self.assertAlmostEqual(fair_values["No"], 0.45, places=6)

    def test_multi_outcome_renormalizes_to_sum_one(self):
        engine = FairValueEngine(self.config, StubSentimentAnalyzer(0.0))
        a = make_market("Candidate A", 0.40, parent_id="2")
        b = make_market("Candidate B", 0.40, parent_id="2")
        c = make_market("Candidate C", 0.30, parent_id="2")
        fair_values = engine.compute_group_fair_values([a, b, c], sentiment_score=0.0)
        total = sum(fair_values.values())
        self.assertAlmostEqual(total, 1.0, places=6)

    def test_scan_flags_mispricing_above_threshold(self):
        # Sentiment is maximally positive; bump the weight so the resulting
        # nudge clears the 8% threshold (default weight caps the nudge at
        # 5pp by design -- see fair_value.py), to isolate scan()'s
        # flagging/filtering logic from the weight calibration itself.
        self.config.sentiment_weight = 0.15
        engine = FairValueEngine(self.config, StubSentimentAnalyzer(1.0))
        yes = make_market("Yes", 0.40, best_bid=0.39, best_ask=0.40)
        no = make_market("No", 0.60, best_bid=0.60, best_ask=0.61)
        opportunities, stats = engine.scan([yes, no])
        self.assertEqual(stats.raw_markets_seen, 1)
        self.assertTrue(any(o.market.outcome_name == "Yes" for o in opportunities))
        yes_opp = next(o for o in opportunities if o.market.outcome_name == "Yes")
        self.assertGreaterEqual(yes_opp.edge, self.config.mispricing_threshold)

    def test_scan_respects_liquidity_filter(self):
        self.config.min_liquidity_usd = 100000.0  # higher than fixture's liquidity
        engine = FairValueEngine(self.config, StubSentimentAnalyzer(1.0))
        yes = make_market("Yes", 0.40)
        no = make_market("No", 0.60)
        opportunities, stats = engine.scan([yes, no])
        self.assertEqual(len(opportunities), 0)
        self.assertGreater(stats.filtered_low_liquidity, 0)

    def test_scan_skips_below_threshold_mispricing(self):
        engine = FairValueEngine(self.config, StubSentimentAnalyzer(0.0))
        yes = make_market("Yes", 0.50, best_bid=0.495, best_ask=0.505)
        no = make_market("No", 0.50, best_bid=0.495, best_ask=0.505)
        opportunities, _ = engine.scan([yes, no])
        self.assertEqual(len(opportunities), 0)


if __name__ == "__main__":
    unittest.main()
