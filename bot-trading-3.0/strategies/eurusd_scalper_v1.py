import backtrader as bt


class EURUSDScalperV1(bt.Strategy):
    """
    EUR/USD scalper v1 (M1-M5) - pullback w kierunku trendu.

    LOGIKA:
      Trend:   cena i EMA(21) po tej samej stronie EMA(200)
      Wejscie: RSI(7) wraca z wyprzedania (long) / wykupienia (short)
      Filtr:   tylko w godzinach sesji + ATR w rozsadnym zakresie
      Wyjscie: SL = 1.5 x ATR (min/max w pipsach), TP = SL x 1.5,
               time stop po X swiecach, zamkniecie na koniec sesji
      Ryzyko:  max transakcji dziennie, stop po X stratach dziennie

    To jest baza do testow, NIE gotowa strategia z przewaga.
    """

    params = {
        # --- wielkosc pozycji (sizer TradeLocker) ---
        "sizer": "FixedLotSizer",
        "sizer_lots": 0.01,

        # --- trend ---
        "ema_trend": 200,
        "ema_fast": 21,

        # --- wejscie ---
        "rsi_period": 7,
        "rsi_low": 30,
        "rsi_high": 70,

        # --- zmiennosc / SL / TP ---
        "atr_period": 14,
        "pip": 0.0001,          # EUR/USD: 1 pips = 0.0001
        "min_atr_pips": 0.8,    # ponizej = martwy rynek, nie gramy
        "max_atr_pips": 15.0,   # powyzej = newsy/chaos, nie gramy
        "sl_atr_mult": 1.5,
        "min_sl_pips": 4.0,     # SL musi byc kilka razy wiekszy niz spread
        "max_sl_pips": 15.0,
        "rr": 1.5,              # TP = SL x rr

        # --- czas ---
        "session_start_hour": 7,   # godzina wg czasu danych (sprawdz strefe w Studio!)
        "session_end_hour": 16,
        "close_at_session_end": True,
        "max_bars_in_trade": 15,

        # --- limity dzienne ---
        "max_trades_per_day": 8,
        "max_losses_per_day": 3,

        # --- tryb wyjscia ---
        # "bracket" = SL/TP jako zlecenia (bezpieczniej, jesli Studio to wspiera)
        # "manual"  = bot sam sprawdza SL/TP na kazdej swiecy
        "exit_mode": "bracket",

        "verbose": True,
    }

    def __init__(self):
        p = self.p
        self.ema_trend = bt.ind.EMA(self.data.close, period=p.ema_trend)
        self.ema_fast = bt.ind.EMA(self.data.close, period=p.ema_fast)
        self.rsi = bt.ind.RSI(self.data.close, period=p.rsi_period, safediv=True)
        self.atr = bt.ind.ATR(self.data, period=p.atr_period)

        self.entry_order = None
        self.exit_orders = []   # SL/TP (bracket) albo zlecenie zamkniecia
        self.sl_price = None
        self.tp_price = None
        self.bars_in_trade = 0
        self.closing = False    # trwa zamykanie - nie dubluj zlecen

        self.current_day = None
        self.trades_today = 0
        self.losses_today = 0

    # ---------------------------------------------------------------- helpers
    def log(self, txt):
        if self.p.verbose:
            dt = self.data.datetime.datetime(0)
            print(f"{dt:%Y-%m-%d %H:%M} | {txt}")

    def _alive(self, order):
        return order is not None and order.alive()

    def _is_entry(self, order):
        # broker przekazuje kopie zlecen, wiec porownujemy po numerze (ref)
        return self.entry_order is not None and order.ref == self.entry_order.ref

    def _busy(self):
        # czeka na wejscie albo ma zlecenia wyjscia w toku
        return self._alive(self.entry_order) or any(self._alive(o) for o in self.exit_orders)

    def _in_session(self, dt):
        return self.p.session_start_hour <= dt.hour < self.p.session_end_hour

    def _reset_day_if_needed(self, dt):
        if self.current_day != dt.date():
            self.current_day = dt.date()
            self.trades_today = 0
            self.losses_today = 0

    def _close_all(self, reason):
        # najpierw anuluj SL/TP, dopiero potem zamknij - inaczej osierocone
        # zlecenie moze otworzyc pozycje w druga strone
        for o in self.exit_orders:
            if self._alive(o):
                self.cancel(o)
        self.exit_orders = []
        if self.position:
            self.log(f"ZAMKNIECIE: {reason}")
            self.closing = True
            self.exit_orders = [self.close()]

    # --------------------------------------------------------------- notify
    def notify_order(self, order):
        if order.status in [order.Submitted, order.Accepted]:
            return

        if order.status == order.Completed:
            side = "BUY" if order.isbuy() else "SELL"
            self.log(f"{side} wykonane @ {order.executed.price:.5f}")
            if self._is_entry(order):
                self.bars_in_trade = 0
                if self.p.exit_mode == "manual":
                    # przelicz SL/TP od faktycznej ceny wejscia
                    dist = abs(self.tp_price - self.sl_price) / (1 + self.p.rr)
                    px = order.executed.price
                    if order.isbuy():
                        self.sl_price, self.tp_price = px - dist, px + dist * self.p.rr
                    else:
                        self.sl_price, self.tp_price = px + dist, px - dist * self.p.rr

        elif order.status in [order.Canceled, order.Margin, order.Rejected]:
            if self._is_entry(order):
                self.log(f"Wejscie odrzucone/anulowane (status {order.getstatusname()})")

    def notify_trade(self, trade):
        if trade.isclosed:
            pnl = trade.pnlcomm
            if pnl < 0:
                self.losses_today += 1
            self.log(f"TRADE ZAMKNIETY pnl={pnl:.2f} | straty dzis: {self.losses_today}")
            self.entry_order = None
            self.exit_orders = []
            self.sl_price = self.tp_price = None
            self.closing = False

    # ----------------------------------------------------------------- next
    def next(self):
        p = self.p
        dt = self.data.datetime.datetime(0)
        self._reset_day_if_needed(dt)

        # ---------- zarzadzanie otwarta pozycja ----------
        if self.position:
            if self.closing:
                return
            self.bars_in_trade += 1

            if p.close_at_session_end and not self._in_session(dt):
                self._close_all("koniec sesji")
                return

            if self.bars_in_trade >= p.max_bars_in_trade:
                self._close_all(f"time stop ({p.max_bars_in_trade} swiec)")
                return

            if p.exit_mode == "manual":
                c = self.data.close[0]
                long_pos = self.position.size > 0
                if (long_pos and c <= self.sl_price) or (not long_pos and c >= self.sl_price):
                    self._close_all("SL")
                elif (long_pos and c >= self.tp_price) or (not long_pos and c <= self.tp_price):
                    self._close_all("TP")
            return

        # ---------- szukanie wejscia ----------
        if self._busy():
            return
        if not self._in_session(dt):
            return
        if self.trades_today >= p.max_trades_per_day or self.losses_today >= p.max_losses_per_day:
            return

        atr_pips = self.atr[0] / p.pip
        if not (p.min_atr_pips <= atr_pips <= p.max_atr_pips):
            return

        c = self.data.close[0]
        uptrend = c > self.ema_trend[0] and self.ema_fast[0] > self.ema_trend[0]
        downtrend = c < self.ema_trend[0] and self.ema_fast[0] < self.ema_trend[0]

        long_signal = uptrend and self.rsi[-1] < p.rsi_low <= self.rsi[0]
        short_signal = downtrend and self.rsi[-1] > p.rsi_high >= self.rsi[0]
        if not (long_signal or short_signal):
            return

        sl_pips = min(max(atr_pips * p.sl_atr_mult, p.min_sl_pips), p.max_sl_pips)
        sl_dist = sl_pips * p.pip
        tp_dist = sl_dist * p.rr

        if long_signal:
            self.sl_price, self.tp_price = c - sl_dist, c + tp_dist
        else:
            self.sl_price, self.tp_price = c + sl_dist, c - tp_dist

        side = "LONG" if long_signal else "SHORT"
        self.log(f"SYGNAL {side} @ ~{c:.5f} | SL {sl_pips:.1f} pips | TP {sl_pips * p.rr:.1f} pips")

        if p.exit_mode == "bracket":
            fn = self.buy_bracket if long_signal else self.sell_bracket
            orders = fn(exectype=bt.Order.Market,
                        stopprice=self.sl_price,
                        limitprice=self.tp_price)
            self.entry_order = orders[0]
            self.exit_orders = orders[1:]
        else:
            self.entry_order = self.buy() if long_signal else self.sell()
            self.exit_orders = []

        self.trades_today += 1

    def stop(self):
        self.log(f"KONIEC | wartosc konta: {self.broker.getvalue():.2f}")
