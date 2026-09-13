"""Client for fetching active markets from Polymarket's public Gamma API.

Endpoint used: ``GET {base}/markets`` on https://gamma-api.polymarket.com
This is Polymarket's public, unauthenticated read API (no API key needed).
Reference shape of one raw market record (fields relevant to us):

    {
      "id": "...", "conditionId": "...", "question": "...", "slug": "...",
      "outcomes": "[\"Yes\", \"No\"]",        # JSON-encoded list, as a STRING
      "outcomePrices": "[\"0.62\", \"0.38\"]", # JSON-encoded list of strings
      "bestBid": 0.61, "bestAsk": 0.63,
      "volume": "12345.6", "liquidity": "3456.2",
      "active": true, "closed": false,
      "endDate": "2026-01-01T00:00:00Z", "category": "Politics",
      "description": "..."
    }

Gamma frequently double-encodes list fields as JSON strings rather than
native JSON arrays -- ``_parse_json_list`` below handles both shapes so a
future schema tweak degrades gracefully (skips the market with a logged
warning) instead of crashing the whole scan.

IMPORTANT / verified limitation: this module has NOT been exercised
against the live API from within this project's development sandbox --
outbound HTTPS to ``gamma-api.polymarket.com`` is blocked there by an
organization egress policy (CONNECT -> 403). The request/parsing logic
below follows Polymarket's publicly documented Gamma API shape, and is
covered by offline unit tests using a hand-written fixture, but it should
be smoke-tested against the real endpoint in an environment with network
access before being trusted for real scans. Run
``python main.py selftest`` for a quick live connectivity + shape check.
"""

from __future__ import annotations

import json
import logging
import time
from typing import Any, Optional

import requests

from .config import AgentConfig
from .models import Market

logger = logging.getLogger("agent.polymarket_client")


class PolymarketClientError(Exception):
    pass


def _parse_json_list(value: Any) -> list[Any]:
    """Gamma API list fields sometimes arrive as a real list, sometimes as
    a JSON-encoded string, and sometimes double-encoded. Normalize all of
    those into a plain Python list; return [] if it cannot be parsed."""
    if value is None:
        return []
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except json.JSONDecodeError:
            return []
        if isinstance(parsed, list):
            return parsed
        return []
    return []


def _to_float(value: Any) -> Optional[float]:
    if value is None or value == "":
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


class PolymarketClient:
    """Fetches and normalizes active markets from the Gamma API."""

    def __init__(self, config: AgentConfig, session: Optional[requests.Session] = None):
        self.config = config
        self.session = session or requests.Session()

    # -- public API -------------------------------------------------------

    def fetch_active_markets(self, target_count: int) -> list[Market]:
        """Fetch and flatten at least ``target_count`` market/outcome pairs
        (capped at ``config.max_markets_per_scan`` raw market records)."""
        if self.config.offline_mode:
            raw_markets = self._load_offline_fixture()
        else:
            raw_markets = self._fetch_raw_markets_paginated(
                max(target_count, self.config.min_markets_per_scan)
            )

        markets: list[Market] = []
        skipped = 0
        for raw in raw_markets:
            parsed = self._parse_markets_from_raw(raw)
            if not parsed:
                skipped += 1
                continue
            markets.extend(parsed)

        if skipped:
            logger.warning("Skipped %d raw market records that failed to parse", skipped)
        logger.info(
            "Fetched %d raw markets -> %d outcome-level Market objects",
            len(raw_markets),
            len(markets),
        )
        return markets

    # -- HTTP / pagination --------------------------------------------------

    def _fetch_raw_markets_paginated(self, target_count: int) -> list[dict[str, Any]]:
        page_size = 100
        offset = 0
        collected: list[dict[str, Any]] = []
        base_url = f"{self.config.gamma_api_base_url.rstrip('/')}/markets"

        while len(collected) < min(target_count, self.config.max_markets_per_scan):
            params = {
                "limit": page_size,
                "offset": offset,
                "active": "true",
                "closed": "false",
                "order": "volume24hr",
                "ascending": "false",
            }
            page = self._get_json_with_retries(base_url, params)
            if not page:
                break
            # Some Gamma deployments wrap the array in {"data": [...]}.
            items = page.get("data", page) if isinstance(page, dict) else page
            if not isinstance(items, list) or not items:
                break
            collected.extend(items)
            if len(items) < page_size:
                break  # last page
            offset += page_size

        return collected[: self.config.max_markets_per_scan]

    def _get_json_with_retries(self, url: str, params: dict[str, Any]) -> Any:
        last_error: Optional[Exception] = None
        for attempt in range(1, self.config.http_max_retries + 1):
            try:
                resp = self.session.get(url, params=params, timeout=self.config.http_timeout_seconds)
                resp.raise_for_status()
                return resp.json()
            except (requests.RequestException, ValueError) as exc:
                last_error = exc
                wait = min(2 ** attempt, 15)
                logger.warning(
                    "Gamma API request failed (attempt %d/%d): %s -- retrying in %ds",
                    attempt,
                    self.config.http_max_retries,
                    exc,
                    wait,
                )
                if attempt < self.config.http_max_retries:
                    time.sleep(wait)
        logger.error("Gamma API request permanently failed for %s: %s", url, last_error)
        return None

    # -- offline fixture ----------------------------------------------------

    def _load_offline_fixture(self) -> list[dict[str, Any]]:
        path = self.config.offline_fixture_file
        if not path.exists():
            raise PolymarketClientError(
                f"Offline mode is on but fixture file is missing: {path}"
            )
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data.get("data", data) if isinstance(data, dict) else data

    # -- parsing --------------------------------------------------------------

    def _parse_markets_from_raw(self, raw: dict[str, Any]) -> list[Market]:
        try:
            outcomes = _parse_json_list(raw.get("outcomes"))
            prices = _parse_json_list(raw.get("outcomePrices"))
            if not outcomes or not prices or len(outcomes) != len(prices):
                return []

            market_id = str(raw.get("id", ""))
            condition_id = str(raw.get("conditionId", ""))
            question = raw.get("question", "").strip()
            slug = raw.get("slug", "")
            volume_usd = _to_float(raw.get("volume")) or 0.0
            liquidity_usd = _to_float(raw.get("liquidity")) or 0.0
            end_date = raw.get("endDate")
            category = raw.get("category")
            description = raw.get("description", "") or ""
            active = bool(raw.get("active", True))
            closed = bool(raw.get("closed", False))
            # Gamma's top-level bestBid/bestAsk describe ONE order book --
            # the primary (first, index 0) outcome's. They must not be
            # reused verbatim for other outcomes. For the classic two-
            # outcome Yes/No case the complementary book can be derived
            # exactly (buying No == selling Yes on Polymarket's
            # complementary-token design): bid_no = 1 - ask_yes,
            # ask_no = 1 - bid_yes. Beyond two outcomes there is no such
            # identity, so non-primary outcomes fall back to `price` alone
            # (best_bid/best_ask left None) rather than a wrong number.
            primary_best_bid = _to_float(raw.get("bestBid"))
            primary_best_ask = _to_float(raw.get("bestAsk"))

            if not market_id or not question:
                return []

            results = []
            for idx, (outcome_name, price_raw) in enumerate(zip(outcomes, prices)):
                price = _to_float(price_raw)
                if price is None or price < 0.0 or price > 1.0:
                    continue

                if idx == 0:
                    best_bid, best_ask = primary_best_bid, primary_best_ask
                elif len(outcomes) == 2 and primary_best_bid is not None and primary_best_ask is not None:
                    best_bid, best_ask = 1.0 - primary_best_ask, 1.0 - primary_best_bid
                else:
                    best_bid, best_ask = None, None

                results.append(
                    Market(
                        market_id=f"{market_id}:{outcome_name}",
                        parent_id=market_id,
                        condition_id=condition_id,
                        question=question,
                        slug=slug,
                        outcome_name=str(outcome_name),
                        price=price,
                        best_bid=best_bid,
                        best_ask=best_ask,
                        volume_usd=volume_usd,
                        liquidity_usd=liquidity_usd,
                        end_date_iso=end_date,
                        category=category,
                        description=description,
                        active=active,
                        closed=closed,
                    )
                )
            return results
        except Exception:
            logger.exception("Failed to parse raw market record id=%s", raw.get("id"))
            return []

    def check_live_connectivity(self) -> tuple[bool, str]:
        """Quick one-request smoke test against the real Gamma API.

        Returns (ok, message). Never raises -- used by ``main.py selftest``.
        """
        url = f"{self.config.gamma_api_base_url.rstrip('/')}/markets"
        try:
            resp = self.session.get(url, params={"limit": 1}, timeout=self.config.http_timeout_seconds)
            resp.raise_for_status()
            data = resp.json()
            items = data.get("data", data) if isinstance(data, dict) else data
            if isinstance(items, list) and items:
                return True, f"received {len(items)} record(s) from {url}"
            return False, f"Reached {url} but got an unexpected/empty payload shape"
        except requests.RequestException as exc:
            return False, f"Could not reach {url}: {exc}"
