# Dziennik decyzji

Każda zmiana logiki wejścia lub wyjścia: co zmienione, dlaczego, wynik przed i po.
Najnowsze wpisy na górze.

---

## 2026-10-05 · eurusd_scalper_v1 · ponowienie odrzuconego zamknięcia

**Co zmienione:** w `notify_order` dodana gałąź dla odrzuconego/anulowanego zlecenia
zamknięcia (status `Canceled` / `Margin` / `Rejected`, zlecenie z `exit_orders` przy
`closing = True`). Bot loguje błąd, zeruje `closing` i `exit_orders`, więc na kolejnej
świecy ponawia zamknięcie przez normalną ścieżkę (`koniec sesji` / `time stop` / SL / TP).
Logika wejścia i warunki wyjścia bez zmian.

**Dlaczego:** `_close_all` najpierw anuluje SL/TP, potem ustawia `closing = True` i wysyła
zlecenie zamknięcia. `closing` było zerowane tylko w `notify_trade`, czyli dopiero po
zamknięciu transakcji. Gdy broker odrzuci zlecenie zamknięcia, transakcja nigdy się nie
zamyka, `next()` za każdym razem wychodzi na `if self.closing: return`, a pozycja zostaje
otwarta bez SL i TP do końca działania bota.

**Wynik przed i po** (`tests/test_techniczny.py`, dane syntetyczne M1, 20 dni):

| Przypadek | Przed | Po |
|---|---|---|
| Normalny przebieg, bracket, seed 1/2/3: liczba transakcji | 117 / 117 / 125 | 117 / 117 / 125 |
| Normalny przebieg, manual, seed 1/2/3: liczba transakcji | 117 / 116 / 125 | 117 / 116 / 125 |
| Pierwsze zamknięcie odrzucone: najdłuższy przestój z otwartą pozycją | 28 305 świec (do końca danych) | 2 świece |
| Pierwsze zamknięcie odrzucone: zamknięte transakcje | 0 | 117 |

To test mechaniki zleceń, nie zyskowności.

**Do sprawdzenia w Studio:** czy TradeLocker zgłasza odrzucenie zamknięcia przez
`notify_order` ze statusem `Rejected` / `Margin` / `Canceled`. Jeśli nie, ta ścieżka się nie odpali.

---

## 2026-10-05 · eurusd_scalper_v1 · wersja startowa

Strategia v1 dodana do projektu. Opis logiki w `README.md`. Brak backtestu w Studio.

<!-- Jeśli masz już własny plik decyzje.md, przenieś do niego powyższe wpisy, a ten plik zastąp swoim. -->
