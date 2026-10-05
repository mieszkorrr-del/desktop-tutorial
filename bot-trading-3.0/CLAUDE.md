# BOT TRADING 3.0

## Czym jest ten projekt

Boty tradingowe pod **TradeLocker Studio** (Backtrader). Rynek startowy: EUR/USD, scalping M1–M5.
Etap: budowa i walidacja strategii na danych historycznych i koncie demo. **Zero realnych pieniędzy.**

## Granice projektu

- Ten projekt jest **całkowicie oddzielny** od `D:\BOT TRADING` i `D:\bot trading 2.0`.
- Nie importuj stamtąd kodu, konfiguracji, strategii ani założeń. Nie odwołuj się do tamtych projektów.
- Jeśli czegoś brakuje, buduj to tutaj od zera.

## Środowisko

- Windows, PowerShell, ścieżki ze spacjami — cytuj je.
- Python 3.11, Backtrader.
- Kod docelowo wklejany do TradeLocker Studio (aplikacja desktop), więc strategia musi być jednym plikiem bez lokalnych importów.

## Format strategii

- Klasa dziedziczy po `bt.Strategy`.
- Parametry w `params` jako słownik, razem z sizerem TradeLockera (`"sizer": "FixedLotSizer", "sizer_lots": 0.01`).
- Zero zależności spoza Backtradera, chyba że zostanie potwierdzone, że Studio je przyjmuje.
- Każda strategia ma: limit transakcji dziennie, limit strat dziennie, time stop i twardy SL.

## Zasady pracy

- Kod ma być kompletny i uruchamialny. Uproszczenia i placeholdery oznaczaj w komentarzu.
- Nie używaj funkcji ani parametrów, co do których nie masz pewności. Jak nie wiesz, oznacz „do sprawdzenia w dokumentacji" zamiast zgadywać.
- Żadnych kluczy API, loginów ani haseł w kodzie i w repo. Sekrety idą do `.env`, który jest w `.gitignore`.
- Obsługa błędów i logowanie są obowiązkowe, nie opcjonalne.
- Przy każdej zmianie logiki wejścia lub wyjścia dopisz wpis do `docs/decyzje.md`: co zmienione, dlaczego, jaki był wynik przed i po.

## Zasady walidacji (nieprzekraczalne)

1. Backtest na okresie treningowym służy do strojenia.
2. Weryfikacja na osobnym okresie, którego nie dotykaliśmy przy strojeniu. Jeśli tam wynik się rozsypuje, strategia jest dopasowana do historii i idzie do kosza.
3. Backtest bez uwzględnienia spreadu i prowizji jest nieważny. Przy SL rzędu 4 pipsów koszty decydują o wszystkim.
4. Minimum kilka tygodni na demo przed jakąkolwiek rozmową o realnym koncie.
5. Nie obiecujemy zysków ani w kodzie, ani w notatkach. Raportujemy liczby.

## Czego nie robimy

- Nie testujemy 9 wariantów i nie wybieramy najlepszego po wyniku backtestu. To nie jest walidacja, tylko dopasowanie do szumu.
- Nie dokładamy wskaźników, żeby poprawić krzywą kapitału na okresie treningowym.
- Nie podłączamy realnego konta, dopóki punkty 1–4 nie są odhaczone.
