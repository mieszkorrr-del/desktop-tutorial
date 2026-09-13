"""Structured decision logging.

Every decision the agent makes (enter a position, skip a candidate, close
a position) is written to two places:

1. A human-readable line via the standard `logging` module, which goes to
   both the console and ``data/logs/agent.log`` (see ``setup_logging``).
2. A machine-readable JSON line appended to ``data/logs/decisions.jsonl``,
   so the full decision history can be replayed/audited/analyzed later
   without re-parsing log prose.
"""

from __future__ import annotations

import json
import logging
import logging.handlers
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .config import AgentConfig
from .kelly import SizingResult
from .models import Opportunity, Position, Trade

logger = logging.getLogger("agent.decisions")


def setup_logging(config: AgentConfig) -> None:
    config.ensure_dirs()
    root = logging.getLogger("agent")
    root.setLevel(logging.INFO)
    root.handlers.clear()

    fmt = logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")

    console_handler = logging.StreamHandler()
    console_handler.setFormatter(fmt)
    root.addHandler(console_handler)

    file_handler = logging.handlers.RotatingFileHandler(
        config.agent_log_file, maxBytes=10_000_000, backupCount=5, encoding="utf-8"
    )
    file_handler.setFormatter(fmt)
    root.addHandler(file_handler)


class DecisionLogger:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.config.ensure_dirs()

    def _write_jsonl(self, record: dict[str, Any]) -> None:
        record.setdefault("ts_iso", datetime.now(timezone.utc).isoformat())
        record.setdefault("ts_unix", time.time())
        with open(self.config.decisions_log_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(record, default=str) + "\n")

    def log_cycle_start(self, cycle_number: int, bankroll_usd: float, open_positions: int) -> None:
        logger.info(
            "=== Cycle %d start | bankroll=$%.2f | open_positions=%d ===",
            cycle_number,
            bankroll_usd,
            open_positions,
        )
        self._write_jsonl(
            {
                "event": "cycle_start",
                "cycle": cycle_number,
                "bankroll_usd": bankroll_usd,
                "open_positions": open_positions,
            }
        )

    def log_scan_result(self, cycle_number: int, markets_scanned: int, raw_markets: int, opportunities_found: int) -> None:
        logger.info(
            "Scan: %d raw markets -> %d outcome rows scanned, %d opportunities flagged (>= %.0f%% mispricing)",
            raw_markets,
            markets_scanned,
            opportunities_found,
            self.config.mispricing_threshold * 100,
        )
        self._write_jsonl(
            {
                "event": "scan_result",
                "cycle": cycle_number,
                "raw_markets": raw_markets,
                "outcome_rows_scanned": markets_scanned,
                "opportunities_found": opportunities_found,
            }
        )

    def log_entered(self, cycle_number: int, opportunity: Opportunity, sizing: SizingResult, position: Position) -> None:
        logger.info(
            "ENTER %s | %s [%s] @ %.3f | fair_value=%.3f edge=%+.3f | size=$%.2f (kelly_raw=%.3f applied=%.3f, capped_by=%s)",
            position.position_id,
            opportunity.market.question,
            opportunity.market.outcome_name,
            opportunity.entry_price,
            opportunity.fair_value,
            opportunity.edge,
            sizing.position_usd,
            sizing.kelly_fraction_raw,
            sizing.kelly_fraction_applied,
            sizing.capped_by,
        )
        self._write_jsonl(
            {
                "event": "enter_position",
                "cycle": cycle_number,
                "position_id": position.position_id,
                "market_id": opportunity.market.market_id,
                "question": opportunity.market.question,
                "outcome": opportunity.market.outcome_name,
                "entry_price": opportunity.entry_price,
                "fair_value": opportunity.fair_value,
                "edge": opportunity.edge,
                "sentiment_score": opportunity.sentiment_score,
                "position_usd": sizing.position_usd,
                "kelly_fraction_raw": sizing.kelly_fraction_raw,
                "kelly_fraction_applied": sizing.kelly_fraction_applied,
                "capped_by": sizing.capped_by,
                "rationale": opportunity.rationale,
            }
        )

    def log_skipped(self, cycle_number: int, opportunity: Opportunity, reason: str) -> None:
        logger.info(
            "SKIP | %s [%s] @ %.3f | fair_value=%.3f edge=%+.3f | reason=%s",
            opportunity.market.question,
            opportunity.market.outcome_name,
            opportunity.entry_price,
            opportunity.fair_value,
            opportunity.edge,
            reason,
        )
        self._write_jsonl(
            {
                "event": "skip_opportunity",
                "cycle": cycle_number,
                "market_id": opportunity.market.market_id,
                "question": opportunity.market.question,
                "outcome": opportunity.market.outcome_name,
                "entry_price": opportunity.entry_price,
                "fair_value": opportunity.fair_value,
                "edge": opportunity.edge,
                "reason": reason,
            }
        )

    def log_closed(self, cycle_number: int, trade: Trade) -> None:
        logger.info(
            "CLOSE %s | %s [%s] entry=%.3f exit=%.3f | pnl=$%+.2f (%+.1f%%) | reason=%s",
            trade.position_id,
            trade.question,
            trade.outcome_name,
            trade.entry_price,
            trade.exit_price,
            trade.pnl_usd,
            trade.pnl_pct * 100,
            trade.close_reason,
        )
        self._write_jsonl({"event": "close_position", "cycle": cycle_number, **trade.to_dict()})

    def log_cycle_end(self, cycle_number: int, bankroll_usd: float, equity_usd: float, open_positions: int) -> None:
        logger.info(
            "=== Cycle %d end | bankroll=$%.2f | equity=$%.2f | open_positions=%d ===",
            cycle_number,
            bankroll_usd,
            equity_usd,
            open_positions,
        )
        self._write_jsonl(
            {
                "event": "cycle_end",
                "cycle": cycle_number,
                "bankroll_usd": bankroll_usd,
                "equity_usd": equity_usd,
                "open_positions": open_positions,
            }
        )

    def log_error(self, cycle_number: int, message: str) -> None:
        logger.error("Cycle %d error: %s", cycle_number, message)
        self._write_jsonl({"event": "error", "cycle": cycle_number, "message": message})
