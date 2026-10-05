# BOT TRADING 3.0

Projekt botów tradingowych pod TradeLocker Studio. Start: EUR/USD, scalping M1–M5.

## Status

Etap 1 z 5: strategia napisana, nieprzetestowana w Studio.

| # | Etap | Status |
|---|------|--------|
| 1 | Strategia v1 napisana w formacie Studio | zrobione |
| 2 | Backtest w Studio na okresie treningowym | — |
| 3 | Weryfikacja na nietkniętym okresie | — |
| 4 | Kilka tygodni na demo | — |
| 5 | Decyzja o realnych środkach | — |

## Struktura

```
C:\BOT TRADING 3.0\
├─ CLAUDE.md          zasady projektu dla Claude Code
├─ README.md          ten plik
├─ strategies\        kod botów (jeden plik = jedna strategia)
├─ backtests\         wyniki, screeny, eksporty z Studio
├─ data\              dane historyczne (poza gitem)
└─ docs\              decyzje i notatki
```

## Strategie

### eurusd_scalper_v1.py

Pullback w kierunku trendu: EMA 200 jako filtr trendu, wejście na powrocie RSI(7)
z wyprzedania lub wykupienia, SL = 1,5 × ATR (4–15 pipsów), TP = 1,5 × SL.
Dodatkowo: filtr godzin sesji, filtr zmienności, time stop po 15 świecach,
maks. 8 transakcji dziennie, stop po 3 stratach dziennie.

Przetestowana technicznie w czystym Backtraderze na danych syntetycznych: działa,
nie dubluje pozycji, nie odwraca ich przez osierocone zlecenia, limity dzienne
i time stop reagują poprawnie. **To test techniczny, nie test zyskowności.**

Tryb wyjścia przełączany parametrem `exit_mode`:
- `"bracket"` — SL i TP jako zlecenia (preferowane, jeśli Studio to obsłuży)
- `"manual"` — bot pilnuje poziomów sam na każdej świecy

## Do sprawdzenia w Studio

- Czy Studio przyjmuje `buy_bracket` / `sell_bracket`.
- Czy otwarta pozycja pokazuje SL i TP w panelu pozycji. Jeśli nie, po zamknięciu apki pozycja zostaje bez ochrony.
- W jakiej strefie czasowej są świece (od tego zależą godziny sesji w kodzie).
- Czy backtest uwzględnia spread i prowizję brokera.

## Zanim cokolwiek pójdzie na realne pieniądze

- [ ] Wynik dodatni na okresie weryfikacyjnym, którego nie używaliśmy do strojenia
- [ ] Koszty transakcyjne policzone w backteście
- [ ] Minimum kilka tygodni na demo z liczbą transakcji pozwalającą cokolwiek wnioskować
- [ ] Max obsunięcie kapitału policzone i zaakceptowane
- [ ] Ustalone, co bot robi po restarcie komputera z otwartą pozycją
