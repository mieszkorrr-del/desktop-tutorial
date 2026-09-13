import unittest

from agent.config import AgentConfig
from agent.polymarket_client import PolymarketClient, _parse_json_list, _to_float


class TestParsingHelpers(unittest.TestCase):
    def test_parse_json_list_from_string(self):
        self.assertEqual(_parse_json_list('["Yes", "No"]'), ["Yes", "No"])

    def test_parse_json_list_from_real_list(self):
        self.assertEqual(_parse_json_list(["Yes", "No"]), ["Yes", "No"])

    def test_parse_json_list_invalid_returns_empty(self):
        self.assertEqual(_parse_json_list("not json"), [])
        self.assertEqual(_parse_json_list(None), [])
        self.assertEqual(_parse_json_list(123), [])

    def test_to_float(self):
        self.assertEqual(_to_float("0.55"), 0.55)
        self.assertIsNone(_to_float(None))
        self.assertIsNone(_to_float(""))
        self.assertIsNone(_to_float("not a number"))


class TestOfflineFixtureLoading(unittest.TestCase):
    def setUp(self):
        self.config = AgentConfig()
        self.config.offline_mode = True

    def test_fetch_active_markets_parses_fixture(self):
        client = PolymarketClient(self.config)
        markets = client.fetch_active_markets(target_count=500)
        # fixture has 5 raw markets, each with 2 outcomes -> 10 Market rows
        self.assertEqual(len(markets), 10)
        questions = {m.question for m in markets}
        self.assertIn("Will the Fed cut rates in Q4 2026?", questions)

    def test_outcome_prices_sum_to_one_for_binary_markets(self):
        client = PolymarketClient(self.config)
        markets = client.fetch_active_markets(target_count=500)
        by_parent: dict[str, list] = {}
        for m in markets:
            by_parent.setdefault(m.parent_id, []).append(m)
        for parent_id, group in by_parent.items():
            total = sum(m.price for m in group)
            self.assertAlmostEqual(total, 1.0, places=6, msg=f"parent {parent_id}")

    def test_missing_fixture_raises_clear_error(self):
        self.config.offline_fixture_file = self.config.offline_fixture_file.parent / "does_not_exist.json"
        client = PolymarketClient(self.config)
        with self.assertRaises(Exception):
            client.fetch_active_markets(target_count=10)


if __name__ == "__main__":
    unittest.main()
