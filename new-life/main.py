#!/usr/bin/env python3
"""CLI entrypoint for the Polymarket paper-trading agent.

Commands:
  run        Start (or resume, if data/state.json exists) the continuous
             loop for `--hours` hours, scanning every `--interval` minutes.
  once       Run exactly one cycle and exit (useful for smoke-testing).
  report     Regenerate data/report.md from the current saved state,
             without running anything.
  selftest   Check live connectivity to the real Polymarket Gamma API.
             This requires actual network access -- see README.md for why
             it fails in network-restricted sandboxes.
"""

from __future__ import annotations

import argparse
import sys

from agent.config import AgentConfig
from agent.decision_log import setup_logging
from agent.loop import AgentLoop
from agent.polymarket_client import PolymarketClient
from agent.report import generate_report
from agent.state_store import load_state


def build_config(args: argparse.Namespace) -> AgentConfig:
    config = AgentConfig()
    if args.offline:
        config.offline_mode = True
    if getattr(args, "hours", None) is not None:
        config.run_duration_hours = args.hours
    if getattr(args, "interval", None) is not None:
        config.cycle_interval_minutes = args.interval
    return config


def cmd_run(args: argparse.Namespace) -> int:
    config = build_config(args)
    setup_logging(config)
    loop = AgentLoop(config)
    loop.run()
    print(f"\nRun finished. Report written to {config.report_file}")
    report = generate_report(config, loop.state.portfolio)
    print(report)
    return 0


def cmd_once(args: argparse.Namespace) -> int:
    config = build_config(args)
    setup_logging(config)
    loop = AgentLoop(config)
    loop.run(max_cycles=1)
    return 0


def cmd_report(args: argparse.Namespace) -> int:
    config = build_config(args)
    state = load_state(config)
    if state is None:
        print(f"No saved state found at {config.state_file}. Run `python main.py run` first.")
        return 1
    report = generate_report(config, state.portfolio)
    print(report)
    return 0


def cmd_selftest(args: argparse.Namespace) -> int:
    config = build_config(args)
    client = PolymarketClient(config)
    ok, message = client.check_live_connectivity()
    print(("OK: " if ok else "FAILED: ") + message)
    return 0 if ok else 1


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Polymarket paper-trading agent")
    parser.add_argument("--offline", action="store_true", help="use the local fixture instead of live API")
    parser.add_argument("--hours", type=float, default=None, help="override run duration in hours")
    parser.add_argument("--interval", type=int, default=None, help="override cycle interval in minutes")

    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("run", help="start/resume the continuous loop").set_defaults(func=cmd_run)
    sub.add_parser("once", help="run a single cycle and exit").set_defaults(func=cmd_once)
    sub.add_parser("report", help="regenerate the report from saved state").set_defaults(func=cmd_report)
    sub.add_parser("selftest", help="check live connectivity to the Gamma API").set_defaults(func=cmd_selftest)

    args = parser.parse_args(argv)
    return args.func(args)


if __name__ == "__main__":
    sys.exit(main())
