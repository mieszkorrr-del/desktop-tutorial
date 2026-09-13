"""Text sentiment scoring for market questions/descriptions.

Two implementations, per the task spec ("jeśli możliwe -- przez Grok lub
prostą analizę tekstu"):

- ``SimpleLexiconSentimentAnalyzer``: a small hand-built keyword lexicon.
  This is a crude heuristic, not real NLP -- it exists as the always-available
  fallback and is honest about that limitation (see its docstring).
- ``GrokSentimentAnalyzer``: calls xAI's Grok chat-completions API. Requires
  ``XAI_API_KEY``. NOT exercised in this project's sandbox: outbound access
  to api.x.ai is also blocked by the same egress policy that blocks
  Polymarket (see agent/polymarket_client.py docstring), so this
  implementation is written to xAI's documented OpenAI-compatible API shape
  but is otherwise unverified live. It always wraps a fallback analyzer and
  never raises -- any HTTP/parse error is logged and delegated to the
  fallback so a flaky sentiment provider can never take the whole agent down.
"""

from __future__ import annotations

import json
import logging
import re
from abc import ABC, abstractmethod
from typing import Optional

import requests

from .config import AgentConfig

logger = logging.getLogger("agent.sentiment")

_POSITIVE_WORDS = {
    "win", "wins", "winning", "surge", "surging", "record", "breakthrough",
    "success", "successful", "strong", "strength", "boost", "boosting",
    "optimistic", "confidence", "confident", "rally", "rallying", "growth",
    "gain", "gains", "favorite", "favored", "momentum", "positive",
    "approve", "approved", "approval", "recover", "recovery", "beat",
    "beats", "upgrade", "upgraded", "bullish", "decisive", "landslide",
}

_NEGATIVE_WORDS = {
    "lose", "loses", "losing", "loss", "crash", "crashing", "collapse",
    "collapsing", "fail", "failure", "failed", "weak", "weakness",
    "decline", "declining", "pessimistic", "doubt", "doubtful", "risk",
    "risky", "scandal", "controversy", "injury", "injured", "disaster",
    "disastrous", "downgrade", "downgraded", "bearish", "worried",
    "worry", "concern", "concerns", "setback", "denied", "reject",
    "rejected", "cancel", "cancelled", "delay", "delayed",
}

_WORD_RE = re.compile(r"[a-zA-Z']+")


class SentimentAnalyzer(ABC):
    @abstractmethod
    def score(self, text: str) -> float:
        """Return a sentiment polarity score in [-1.0, 1.0]."""
        raise NotImplementedError


class SimpleLexiconSentimentAnalyzer(SentimentAnalyzer):
    """Keyword-counting sentiment. English-only, no negation handling.

    This is intentionally simple ("prosta analiza tekstu" per spec): it
    counts positive vs. negative keyword hits and normalizes by the total
    number of hits. It has no real language understanding, cannot detect
    negation ("not a disaster"), sarcasm, or domain nuance -- it is a weak
    signal used with a small, capped weight in FairValueEngine, not a
    source of truth.
    """

    def score(self, text: str) -> float:
        if not text:
            return 0.0
        words = [w.lower() for w in _WORD_RE.findall(text)]
        if not words:
            return 0.0
        pos_hits = sum(1 for w in words if w in _POSITIVE_WORDS)
        neg_hits = sum(1 for w in words if w in _NEGATIVE_WORDS)
        total_hits = pos_hits + neg_hits
        if total_hits == 0:
            return 0.0
        return (pos_hits - neg_hits) / total_hits


class GrokSentimentAnalyzer(SentimentAnalyzer):
    """Sentiment via xAI's Grok chat-completions API, with automatic
    fallback to another analyzer on any failure. See module docstring for
    the "not live-tested" caveat."""

    def __init__(self, config: AgentConfig, fallback: SentimentAnalyzer,
                 session: Optional[requests.Session] = None):
        self.config = config
        self.fallback = fallback
        self.session = session or requests.Session()

    def score(self, text: str) -> float:
        if not text or not self.config.grok_api_key:
            return self.fallback.score(text)
        try:
            return self._score_via_grok(text)
        except Exception as exc:  # noqa: BLE001 -- any failure must fall back, never crash the loop
            logger.warning("Grok sentiment call failed (%s) -- falling back to lexicon analyzer", exc)
            return self.fallback.score(text)

    def _score_via_grok(self, text: str) -> float:
        url = f"{self.config.grok_api_base_url.rstrip('/')}/chat/completions"
        prompt = (
            "Rate the sentiment of the following prediction-market question/"
            "description as it relates to the likelihood of the described "
            "event happening. Respond with ONLY a single number between -1 "
            "(strongly suggests the event will NOT happen / very negative) "
            "and 1 (strongly suggests it WILL happen / very positive), no "
            f"other text.\n\nText: {text[:2000]}"
        )
        payload = {
            "model": self.config.grok_model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.0,
            "max_tokens": 10,
        }
        headers = {
            "Authorization": f"Bearer {self.config.grok_api_key}",
            "Content-Type": "application/json",
        }
        resp = self.session.post(
            url, headers=headers, data=json.dumps(payload),
            timeout=self.config.http_timeout_seconds,
        )
        resp.raise_for_status()
        data = resp.json()
        content = data["choices"][0]["message"]["content"].strip()
        value = float(re.findall(r"-?\d*\.?\d+", content)[0])
        return max(-1.0, min(1.0, value))


def build_sentiment_analyzer(config: AgentConfig) -> SentimentAnalyzer:
    """Factory: uses Grok when an API key is configured, else the simple
    lexicon analyzer alone."""
    simple = SimpleLexiconSentimentAnalyzer()
    if config.grok_api_key:
        logger.info("XAI_API_KEY set -- using GrokSentimentAnalyzer (with lexicon fallback)")
        return GrokSentimentAnalyzer(config, fallback=simple)
    logger.info("No XAI_API_KEY -- using SimpleLexiconSentimentAnalyzer only")
    return simple
