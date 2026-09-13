import unittest

from agent.kelly import kelly_fraction, size_position


class TestKellyFraction(unittest.TestCase):
    def test_positive_edge(self):
        # fair value 0.60, price 0.50 -> edge 0.10, f* = 0.10 / 0.50 = 0.20
        self.assertAlmostEqual(kelly_fraction(0.60, 0.50), 0.20, places=6)

    def test_no_edge_returns_zero(self):
        self.assertEqual(kelly_fraction(0.50, 0.50), 0.0)

    def test_negative_edge_returns_zero(self):
        self.assertEqual(kelly_fraction(0.40, 0.50), 0.0)

    def test_degenerate_prices_return_zero(self):
        self.assertEqual(kelly_fraction(0.9, 0.0), 0.0)
        self.assertEqual(kelly_fraction(0.9, 1.0), 0.0)

    def test_full_edge_case(self):
        # fair value 1.0 (certain win), price 0.5 -> f* = 0.5/0.5 = 1.0 (bet everything)
        self.assertAlmostEqual(kelly_fraction(1.0, 0.5), 1.0, places=6)


class TestSizePosition(unittest.TestCase):
    def test_half_kelly_applied(self):
        result = size_position(
            fair_probability=0.60,
            price=0.50,
            bankroll_usd=100.0,
            kelly_multiplier=0.5,
            max_position_pct=0.50,  # high cap so kelly binds, not the cap
            min_position_usd=0.0,
        )
        # full kelly f*=0.20, half-kelly -> 0.10 -> $10 on $100 bankroll
        self.assertAlmostEqual(result.kelly_fraction_applied, 0.10, places=6)
        self.assertAlmostEqual(result.position_usd, 10.0, places=6)
        self.assertEqual(result.capped_by, "kelly")

    def test_max_position_pct_caps_large_edge(self):
        result = size_position(
            fair_probability=0.95,
            price=0.10,  # huge edge -> full kelly would be enormous
            bankroll_usd=200.0,
            kelly_multiplier=1.0,
            max_position_pct=0.06,
            min_position_usd=0.0,
        )
        self.assertEqual(result.capped_by, "max_position_pct")
        self.assertAlmostEqual(result.position_usd, 0.06 * 200.0, places=6)

    def test_below_min_position_returns_zero(self):
        result = size_position(
            fair_probability=0.51,
            price=0.50,
            bankroll_usd=10.0,
            kelly_multiplier=0.5,
            max_position_pct=0.06,
            min_position_usd=5.0,
        )
        self.assertEqual(result.position_usd, 0.0)
        self.assertEqual(result.capped_by, "min_position_floor")

    def test_no_edge_yields_zero_position(self):
        result = size_position(
            fair_probability=0.50,
            price=0.55,
            bankroll_usd=100.0,
            kelly_multiplier=0.5,
            max_position_pct=0.06,
            min_position_usd=0.0,
        )
        self.assertEqual(result.position_usd, 0.0)


if __name__ == "__main__":
    unittest.main()
