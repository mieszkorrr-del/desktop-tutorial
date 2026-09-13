"""The agent's main cycle and the 48h run loop."""

from __future__ import annotations

import logging
import time
from datetime import datetime, timedelta, timezone
from typing import Callable, Optional

from .config import AgentConfig
from .decision_log import DecisionLogger
from .fair_value import FairValueEngine
from .kelly import size_position
from .models import Market
from .polymarket_client import PolymarketClient
from .sentiment import build_sentiment_analyzer
from .state_store import RunState, load_state, save_state

logger = logging.getLogger("agent.loop")


class AgentLoop:
    def __init__(
        self,
        config: AgentConfig,
        client: Optional[PolymarketClient] = None,
        fair_value_engine: Optional[FairValueEngine] = None,
        decision_logger: Optional[DecisionLogger] = None,
    ):
        self.config = config
        self.client = client or PolymarketClient(config)
        self.fair_value_engine = fair_value_engine or FairValueEngine(
            config, build_sentiment_analyzer(config)
        )
        self.decision_logger = decision_logger or DecisionLogger(config)
        self.state: RunState = load_state(config) or RunState(config)

        if load_state(config) is not None:
            logger.info(
                "Resumed existing run from %s (started %s, %d cycles completed, bankroll=$%.2f)",
                config.state_file,
                self.state.run_started_at_iso,
                self.state.portfolio.cycles_completed,
                self.state.portfolio.bankroll_usd,
            )
        else:
            logger.info(
                "Starting a new run: bankroll=$%.2f (~%.0f PLN @ rate %.2f)",
                self.state.portfolio.bankroll_usd,
                self.state.portfolio.bankroll_usd * config.usd_pln_rate,
                config.usd_pln_rate,
            )

    # -- one cycle --------------------------------------------------------------

    def run_cycle(self) -> None:
        portfolio = self.state.portfolio
        cycle_number = portfolio.cycles_completed + 1
        self.decision_logger.log_cycle_start(cycle_number, portfolio.bankroll_usd, len(portfolio.open_positions))

        try:
            markets = self.client.fetch_active_markets(self.config.max_markets_per_scan)
        except Exception as exc:  # noqa: BLE001 -- a fetch failure must not kill the loop
            self.decision_logger.log_error(cycle_number, f"market fetch failed: {exc}")
            markets = []

        latest_market_by_id: dict[str, Market] = {m.market_id: m for m in markets}

        opportunities, scan_stats = self.fair_value_engine.scan(markets)
        self.decision_logger.log_scan_result(
            cycle_number, scan_stats.outcome_rows_seen, scan_stats.raw_markets_seen, len(opportunities)
        )

        for trade in portfolio.evaluate_exits(latest_market_by_id):
            self.decision_logger.log_closed(cycle_number, trade)

        held_market_ids = {p.market_id for p in portfolio.open_positions.values()}
        for opportunity in opportunities:
            if not portfolio.can_open_new_position():
                self.decision_logger.log_skipped(cycle_number, opportunity, "max_open_positions_reached")
                continue
            if opportunity.market.market_id in held_market_ids:
                self.decision_logger.log_skipped(cycle_number, opportunity, "already_holding_this_outcome")
                continue

            sizing = size_position(
                fair_probability=opportunity.fair_value,
                price=opportunity.entry_price,
                bankroll_usd=portfolio.bankroll_usd,
                kelly_multiplier=self.config.kelly_fraction_multiplier,
                max_position_pct=self.config.max_position_pct_of_bankroll,
                min_position_usd=self.config.min_position_usd,
            )
            if sizing.position_usd <= 0.0:
                self.decision_logger.log_skipped(cycle_number, opportunity, f"sizing_zero:{sizing.capped_by}")
                continue

            position = portfolio.open_position(opportunity, sizing)
            if position is None:
                self.decision_logger.log_skipped(cycle_number, opportunity, "open_failed")
                continue

            self.decision_logger.log_entered(cycle_number, opportunity, sizing, position)
            held_market_ids.add(opportunity.market.market_id)

        portfolio.cycles_completed = cycle_number
        self.state.last_cycle_at_iso = datetime.now(timezone.utc).isoformat()
        equity = portfolio.equity_usd(
            {m.market_id: (m.best_bid if m.best_bid is not None else m.price) for m in markets}
        )
        self.decision_logger.log_cycle_end(cycle_number, portfolio.bankroll_usd, equity, len(portfolio.open_positions))

        save_state(self.config, self.state)

    # -- the 48h loop --------------------------------------------------------------

    def run(self, sleep_fn: Callable[[float], None] = time.sleep, max_cycles: Optional[int] = None) -> None:
        run_start = datetime.fromisoformat(self.state.run_started_at_iso)
        deadline = run_start + timedelta(hours=self.config.run_duration_hours)
        interval_seconds = self.config.cycle_interval_minutes * 60

        cycles_run = 0
        while datetime.now(timezone.utc) < deadline:
            cycle_start = time.monotonic()
            try:
                self.run_cycle()
            except Exception:
                logger.exception("Unhandled error in run_cycle -- continuing loop")
            cycles_run += 1

            if max_cycles is not None and cycles_run >= max_cycles:
                break

            elapsed = time.monotonic() - cycle_start
            remaining_to_deadline = (deadline - datetime.now(timezone.utc)).total_seconds()
            sleep_for = max(0.0, min(interval_seconds - elapsed, remaining_to_deadline))
            if sleep_for > 0:
                sleep_fn(sleep_for)

        self._finalize()

    def _finalize(self) -> None:
        logger.info("Run duration reached -- closing all open positions at current market price")
        try:
            markets = self.client.fetch_active_markets(self.config.max_markets_per_scan)
            latest_market_by_id = {m.market_id: m for m in markets}
        except Exception as exc:  # noqa: BLE001
            logger.warning("Could not fetch final prices (%s); closing at entry price instead", exc)
            latest_market_by_id = {}

        trades = self.state.portfolio.close_all_at_market(latest_market_by_id, "run_ended")
        for trade in trades:
            self.decision_logger.log_closed(self.state.portfolio.cycles_completed, trade)
        save_state(self.config, self.state)
