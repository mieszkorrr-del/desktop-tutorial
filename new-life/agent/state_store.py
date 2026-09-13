"""Atomic JSON persistence for the agent's run state, so a run can be
killed and resumed without losing the portfolio or the 48h run clock."""

from __future__ import annotations

import json
import logging
import os
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

from .config import AgentConfig
from .portfolio import Portfolio

logger = logging.getLogger("agent.state_store")


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class RunState:
    """Everything needed to resume a run: the portfolio plus the run clock."""

    def __init__(self, config: AgentConfig, run_started_at_iso: Optional[str] = None):
        self.config = config
        self.portfolio = Portfolio(config)
        self.run_started_at_iso = run_started_at_iso or _now_iso()
        self.last_cycle_at_iso: Optional[str] = None

    def to_dict(self) -> dict[str, Any]:
        return {
            "run_started_at_iso": self.run_started_at_iso,
            "last_cycle_at_iso": self.last_cycle_at_iso,
            "portfolio": self.portfolio.to_dict(),
        }

    @classmethod
    def from_dict(cls, config: AgentConfig, data: dict[str, Any]) -> "RunState":
        state = cls(config, run_started_at_iso=data.get("run_started_at_iso"))
        state.last_cycle_at_iso = data.get("last_cycle_at_iso")
        state.portfolio = Portfolio.from_dict(config, data["portfolio"])
        return state


def save_state(config: AgentConfig, state: RunState) -> None:
    """Write state.json atomically (write to temp file, then os.replace) so
    a crash mid-write never corrupts the last good state."""
    config.ensure_dirs()
    payload = json.dumps(state.to_dict(), indent=2, default=str)
    target = Path(config.state_file)
    fd, tmp_path = tempfile.mkstemp(dir=str(target.parent), prefix=".state_", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(payload)
        os.replace(tmp_path, target)
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def load_state(config: AgentConfig) -> Optional[RunState]:
    target = Path(config.state_file)
    if not target.exists():
        return None
    try:
        with open(target, "r", encoding="utf-8") as f:
            data = json.load(f)
        return RunState.from_dict(config, data)
    except (json.JSONDecodeError, KeyError) as exc:
        logger.error("Failed to load state from %s (%s) -- starting a fresh run", target, exc)
        return None
