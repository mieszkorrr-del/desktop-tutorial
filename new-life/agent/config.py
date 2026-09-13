"""Central configuration for the agent.

All values have sane defaults matching the project spec and can be
overridden with environment variables (see the ``env`` name next to each
field below). No config file / YAML dependency is required on purpose,
so the project only needs the ``requests`` package to run.
"""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path


def _env_float(name: str, default: float) -> float:
    value = os.environ.get(name)
    return float(value) if value not in (None, "") else default


def _env_int(name: str, default: int) -> int:
    value = os.environ.get(name)
    return int(value) if value not in (None, "") else default


def _env_bool(name: str, default: bool) -> bool:
    value = os.environ.get(name)
    if value in (None, ""):
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")


PROJECT_ROOT = Path(__file__).resolve().parent.parent


@dataclass
class AgentConfig:
    # --- Capital -----------------------------------------------------
    # The task frames capital in PLN (200 PLN ~= 50 USD). Polymarket
    # itself is USDC-denominated (share price == implied probability in
    # USD), so the ledger of record is USD internally; ``usd_pln_rate``
    # is only used to render PLN figures in logs/report. This is a
    # fixed, configurable assumption, NOT a live FX feed -- there is no
    # live-rate lookup in this project, and that is stated here
    # explicitly rather than silently guessed.
    starting_bankroll_usd: float = field(
        default_factory=lambda: _env_float("AGENT_STARTING_BANKROLL_USD", 50.0)
    )
    usd_pln_rate: float = field(
        default_factory=lambda: _env_float("AGENT_USD_PLN_RATE", 4.0)
    )

    # --- Timing --------------------------------------------------------
    cycle_interval_minutes: int = field(
        default_factory=lambda: _env_int("AGENT_CYCLE_INTERVAL_MIN", 10)
    )
    run_duration_hours: float = field(
        default_factory=lambda: _env_float("AGENT_RUN_HOURS", 48.0)
    )

    # --- Market scanning -------------------------------------------------
    min_markets_per_scan: int = field(
        default_factory=lambda: _env_int("AGENT_MIN_MARKETS", 300)
    )
    max_markets_per_scan: int = field(
        default_factory=lambda: _env_int("AGENT_MAX_MARKETS", 500)
    )
    gamma_api_base_url: str = field(
        default_factory=lambda: os.environ.get(
            "AGENT_GAMMA_API_URL", "https://gamma-api.polymarket.com"
        )
    )
    http_timeout_seconds: float = field(
        default_factory=lambda: _env_float("AGENT_HTTP_TIMEOUT", 20.0)
    )
    http_max_retries: int = field(
        default_factory=lambda: _env_int("AGENT_HTTP_MAX_RETRIES", 3)
    )

    # --- Mispricing / fair value -----------------------------------------
    mispricing_threshold: float = field(
        default_factory=lambda: _env_float("AGENT_MISPRICING_THRESHOLD", 0.08)
    )
    sentiment_weight: float = field(
        default_factory=lambda: _env_float("AGENT_SENTIMENT_WEIGHT", 0.05)
    )
    min_liquidity_usd: float = field(
        default_factory=lambda: _env_float("AGENT_MIN_LIQUIDITY_USD", 1000.0)
    )
    min_volume_usd: float = field(
        default_factory=lambda: _env_float("AGENT_MIN_VOLUME_USD", 500.0)
    )

    # --- Position sizing (Kelly) ------------------------------------------
    kelly_fraction_multiplier: float = field(
        default_factory=lambda: _env_float("AGENT_KELLY_MULTIPLIER", 0.5)
    )
    max_position_pct_of_bankroll: float = field(
        default_factory=lambda: _env_float("AGENT_MAX_POSITION_PCT", 0.06)
    )
    max_open_positions: int = field(
        default_factory=lambda: _env_int("AGENT_MAX_OPEN_POSITIONS", 15)
    )
    min_position_usd: float = field(
        default_factory=lambda: _env_float("AGENT_MIN_POSITION_USD", 0.50)
    )

    # --- Position exit rules -----------------------------------------------
    take_profit_pct: float = field(
        default_factory=lambda: _env_float("AGENT_TAKE_PROFIT_PCT", 0.15)
    )
    stop_loss_pct: float = field(
        default_factory=lambda: _env_float("AGENT_STOP_LOSS_PCT", 0.10)
    )
    exit_edge_threshold: float = field(
        default_factory=lambda: _env_float("AGENT_EXIT_EDGE_THRESHOLD", 0.02)
    )

    # --- Sentiment source --------------------------------------------------
    grok_api_key: str = field(default_factory=lambda: os.environ.get("XAI_API_KEY", ""))
    grok_api_base_url: str = field(
        default_factory=lambda: os.environ.get("XAI_API_BASE_URL", "https://api.x.ai/v1")
    )
    grok_model: str = field(
        default_factory=lambda: os.environ.get("XAI_MODEL", "grok-2-latest")
    )

    # --- Paths --------------------------------------------------------------
    data_dir: Path = field(default_factory=lambda: PROJECT_ROOT / "data")
    state_file: Path = field(default_factory=lambda: PROJECT_ROOT / "data" / "state.json")
    decisions_log_file: Path = field(
        default_factory=lambda: PROJECT_ROOT / "data" / "logs" / "decisions.jsonl"
    )
    agent_log_file: Path = field(
        default_factory=lambda: PROJECT_ROOT / "data" / "logs" / "agent.log"
    )
    report_file: Path = field(
        default_factory=lambda: PROJECT_ROOT / "data" / "report.md"
    )
    offline_fixture_file: Path = field(
        default_factory=lambda: PROJECT_ROOT / "data" / "fixtures" / "sample_markets.json"
    )

    # --- Misc ---------------------------------------------------------------
    offline_mode: bool = field(default_factory=lambda: _env_bool("AGENT_OFFLINE_MODE", False))
    random_seed: int | None = field(
        default_factory=lambda: (
            int(os.environ["AGENT_RANDOM_SEED"]) if os.environ.get("AGENT_RANDOM_SEED") else None
        )
    )

    def ensure_dirs(self) -> None:
        self.data_dir.mkdir(parents=True, exist_ok=True)
        self.decisions_log_file.parent.mkdir(parents=True, exist_ok=True)
        self.agent_log_file.parent.mkdir(parents=True, exist_ok=True)
