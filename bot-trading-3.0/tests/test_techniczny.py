"""
Test TECHNICZNY strategii eurusd_scalper_v1 w czystym Backtraderze.

Sprawdza mechanike zlecen na danych syntetycznych, NIE zyskownosc:
  - pozycja nigdy nie przekracza jednej stawki (brak dublowania),
  - pozycja nigdy nie odwraca sie przez osierocone zlecenie,
  - limit transakcji dziennie jest respektowany,
  - po odrzuceniu zlecenia zamkniecia bot nie zamarza z otwarta pozycja.

Uruchomienie (z katalogu projektu):
    pip install backtrader pandas
    python tests\\test_techniczny.py
"""
import datetime as dt
import os
import random
import sys

import backtrader as bt
import pandas as pd

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "strategies"))
from eurusd_scalper_v1 import EURUSDScalperV1  # noqa: E402

STAKE = 1000
DAYS = 20


def make_data(seed, n=60 * 24 * DAYS):
    """Syntetyczne swiece M1: bladzenie losowe z odcinkami trendu, wieksza zmiennosc w sesji."""
    random.seed(seed)
    t0 = dt.datetime(2024, 1, 1)
    px, drift, rows = 1.10, 0.0, []
    for i in range(n):
        t = t0 + dt.timedelta(minutes=i)
        if i % 3000 == 0:
            drift = random.choice([-1, 1]) * 0.000004
        vol = 0.00006 if 7 <= t.hour < 16 else 0.00002
        o = px
        c = o + drift + random.gauss(0, vol)
        h = max(o, c) + abs(random.gauss(0, vol / 2))
        lo = min(o, c) - abs(random.gauss(0, vol / 2))
        rows.append((t, o, h, lo, c, 100))
        px = c
    df = pd.DataFrame(rows, columns=["datetime", "open", "high", "low", "close", "volume"])
    return df.set_index("datetime")


class Probe(EURUSDScalperV1):
    """Strategia z licznikami do asercji."""

    def __init__(self):
        super().__init__()
        self.max_abs = 0
        self.flips = 0
        self.prev = 0
        self.closed = 0
        self.per_day = {}
        self.stuck_run = 0
        self.max_stuck_run = 0

    def next(self):
        size = self.position.size
        if self.prev and size and (size > 0) != (self.prev > 0):
            self.flips += 1
        self.max_abs = max(self.max_abs, abs(size))
        self.prev = size

        before = self.trades_today
        super().next()
        if self.trades_today > before:
            d = self.data.datetime.date(0)
            self.per_day[d] = self.per_day.get(d, 0) + 1

        if self.position and self.closing:
            self.stuck_run += 1
            self.max_stuck_run = max(self.max_stuck_run, self.stuck_run)
        else:
            self.stuck_run = 0

    def notify_trade(self, trade):
        super().notify_trade(trade)
        if trade.isclosed:
            self.closed += 1


class RejectFirstCloseBroker(bt.brokers.BackBroker):
    """Odrzuca pierwsze zlecenie oznaczone reject_me=True (symulacja odrzucenia przez brokera)."""

    def submit(self, order, check=True):
        if getattr(order.info, "reject_me", False) and not getattr(self, "_rejected_once", False):
            self._rejected_once = True
            order.reject(self)
            self.notify(order)
            return order
        return super().submit(order, check)


class ProbeRejectFirstClose(Probe):
    def __init__(self):
        super().__init__()
        self._flagged = False

    def close(self, *args, **kwargs):
        if not self._flagged:
            self._flagged = True
            kwargs["reject_me"] = True
        return super().close(*args, **kwargs)


def run(strategy, exit_mode, seed, broker=None):
    cerebro = bt.Cerebro(stdstats=False)
    if broker is not None:
        cerebro.broker = broker
    cerebro.broker.setcash(10000)
    cerebro.adddata(bt.feeds.PandasData(dataname=make_data(seed), timeframe=bt.TimeFrame.Minutes))
    cerebro.addstrategy(strategy, exit_mode=exit_mode, verbose=False)
    cerebro.addsizer(bt.sizers.FixedSize, stake=STAKE)
    return cerebro.run()[0]


def main():
    failures = []

    def check(cond, msg):
        print(("OK   " if cond else "FAIL ") + msg)
        if not cond:
            failures.append(msg)

    for mode in ("bracket", "manual"):
        for seed in (1, 2, 3):
            s = run(Probe, mode, seed)
            tag = f"[{mode} seed={seed}]"
            check(s.closed > 0, f"{tag} sa zamkniete transakcje ({s.closed})")
            check(s.max_abs <= STAKE, f"{tag} brak dublowania pozycji (max |pos| = {s.max_abs})")
            check(s.flips == 0, f"{tag} brak odwrocenia pozycji (flips = {s.flips})")
            max_day = max(s.per_day.values()) if s.per_day else 0
            check(max_day <= s.p.max_trades_per_day, f"{tag} limit dzienny ({max_day} <= {s.p.max_trades_per_day})")

        s = run(ProbeRejectFirstClose, mode, 1, broker=RejectFirstCloseBroker())
        tag = f"[{mode} odrzucone zamkniecie]"
        check(s.max_stuck_run <= 2, f"{tag} bot nie zamarza (najdluzszy przestoj = {s.max_stuck_run} swiec)")
        check(s.closed > 0, f"{tag} handel trwa dalej ({s.closed} transakcji)")

    print()
    if failures:
        print(f"NIEUDANE: {len(failures)}")
        sys.exit(1)
    print("Wszystkie testy techniczne przeszly. To NIE jest test zyskownosci.")


if __name__ == "__main__":
    main()
