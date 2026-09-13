# new-life -- autonomiczny agent paper-tradingowy na Polymarket

Symulowany (paper trading) agent, który skanuje rynki Polymarket w poszukiwaniu
mispricingu, sizuje pozycje kryterium Kelly'ego i loguje każdą decyzję.
**Żadne prawdziwe pieniądze nie są używane** -- cały kapitał i wszystkie
transakcje są wirtualne.

## ⚠️ Ważne ograniczenie środowiska, w którym to powstało

Ten projekt został zbudowany w zdalnej, piaskownicowej sesji Claude Code,
której polityka sieciowa **blokuje wychodzące połączenia HTTPS do
`gamma-api.polymarket.com`, `clob.polymarket.com` i `polymarket.com`**
(proxy organizacji odpowiada 403 na CONNECT). Sprawdziłem to bezpośrednio
(`curl`, `requests`, a nawet natywne narzędzie `WebFetch`) -- każda próba
kończy się tym samym blokiem na poziomie polityki, nie da się tego obejść
z tej sesji.

Konsekwencje:
- Kod klienta API (`agent/polymarket_client.py`) jest napisany zgodnie z
  publicznie udokumentowanym kształtem Gamma API i **przetestowany
  jednostkowo w trybie offline** (patrz `tests/`), ale **nie został
  zweryfikowany na żywym endpoincie** z tego środowiska.
- Przed pierwszym prawdziwym 48-godzinnym runem uruchom lokalnie (na
  maszynie/w środowisku z normalnym dostępem do internetu):
  ```
  python main.py selftest
  ```
  To pojedyncze zapytanie do `gamma-api.polymarket.com/markets?limit=1`,
  które potwierdzi, że kształt odpowiedzi wciąż pasuje do parsera.
- Wszystko inne (logika Kelly'ego, fair value, portfolio, stan, raport,
  CLI) jest przetestowane i działa w trybie `--offline` na syntetycznym
  fixture (`data/fixtures/sample_markets.json` -- jawnie oznaczony jako
  dane syntetyczne, NIE prawdziwe dane z Polymarket).

## 1. Architektura

```
                     ┌────────────────────┐
                     │     main.py (CLI)   │
                     └─────────┬──────────┘
                               │
                     ┌─────────▼──────────┐
                     │   agent/loop.py     │  AgentLoop: cykl co N minut,
                     │   (AgentLoop)       │  zegar 48h, resume ze stanu
                     └───┬─────────────┬───┘
           ┌─────────────┘             └─────────────┐
┌──────────▼───────────┐                    ┌─────────▼──────────┐
│ polymarket_client.py  │                    │   portfolio.py      │
│ Gamma API -> Market[] │                    │ bankroll, pozycje,  │
│ (+ tryb offline)      │                    │ historia transakcji │
└──────────┬────────────┘                    └─────────┬──────────┘
           │                                            │
┌──────────▼───────────┐        ┌───────────┐  ┌────────▼──────────┐
│   fair_value.py       │◄───────┤sentiment.py│  │     kelly.py       │
│ MispricingScanner:     │        │lekcyk/Grok │  │ f* = (p-c)/(1-c)   │
│ base+sentyment,        │        └───────────┘  │ + limity 6%/bankroll│
│ renormalizacja multi-  │                       └────────────────────┘
│ outcome                │
└──────────┬─────────────┘
           │ Opportunity[]
┌──────────▼─────────────┐        ┌─────────────────────┐
│  decision_log.py         │        │   state_store.py      │
│  JSONL + log konsola/plik│        │   atomowy zapis/odczyt │
└───────────────────────────┘        │   data/state.json      │
                                     └─────────────────────┘
                                              │
                                     ┌────────▼──────────┐
                                     │    report.py        │
                                     │  raport końcowy .md │
                                     └────────────────────┘
```

Przepływ jednego cyklu (`AgentLoop.run_cycle`, `agent/loop.py`):
1. Pobierz aktywne rynki (`PolymarketClient.fetch_active_markets`).
2. Zeskanuj pod kątem mispricingu (`FairValueEngine.scan`).
3. Sprawdź warunki wyjścia dla otwartych pozycji (`Portfolio.evaluate_exits`).
4. Dla każdej okazji: policz sizing Kelly'ego, otwórz pozycję jeśli sizing > 0
   i jest miejsce w portfelu.
5. Zaloguj każdą decyzję (wejście / pominięcie / zamknięcie) i zapisz stan.

## 2. Struktura folderów

```
new-life/
├── main.py                    # CLI: run / once / report / selftest
├── requirements.txt            # jedyna zależność: requests
├── agent/
│   ├── config.py                # AgentConfig (wszystkie progi, env-overridable)
│   ├── models.py                 # Market, Opportunity, Position, Trade, Side
│   ├── polymarket_client.py       # Gamma API client + parsowanie + offline fixture
│   ├── sentiment.py                # SimpleLexiconSentimentAnalyzer + GrokSentimentAnalyzer
│   ├── fair_value.py                # FairValueEngine + MispricingScanner (scan())
│   ├── kelly.py                      # wzór Kelly'ego + fractional Kelly + capy
│   ├── portfolio.py                   # bankroll, pozycje, historia, P&L
│   ├── decision_log.py                 # logowanie decyzji (konsola+plik+JSONL)
│   ├── state_store.py                   # atomowy zapis/odczyt stanu (resume)
│   ├── loop.py                           # AgentLoop: cykl + pętla 48h
│   └── report.py                          # generator raportu końcowego .md
├── data/
│   ├── fixtures/sample_markets.json       # SYNTETYCZNE dane testowe (nie realne)
│   ├── state.json                          # (generowane) stan runu -- do resume
│   ├── report.md                            # (generowane) raport końcowy
│   └── logs/
│       ├── agent.log                         # (generowane) log czytelny dla człowieka
│       └── decisions.jsonl                    # (generowane) log decyzji JSON-per-linia
└── tests/                                      # testy jednostkowe (unittest, stdlib)
```

## 3. Uruchomienie

Wymaga tylko Pythona 3.10+ i pakietu `requests`:

```bash
cd new-life
pip install -r requirements.txt

# Szybki test bez sieci (5 syntetycznych rynków z fixture):
python main.py --offline once

# Sprawdzenie, czy żywe API wciąż odpowiada w oczekiwanym kształcie
# (wymaga normalnego dostępu do internetu -- patrz sekcja o ograniczeniu wyżej):
python main.py selftest

# Właściwy 48-godzinny run (Ctrl+C bezpiecznie przerywa -- stan jest
# zapisywany po każdym cyklu, więc `python main.py run` wznowi od miejsca
# przerwania, z tym samym zegarem 48h liczonym od pierwszego startu):
python main.py run

# Raport w dowolnym momencie, bez czekania na koniec runu:
python main.py report
```

Parametry CLI: `--offline`, `--hours N` (nadpisuje 48h), `--interval N`
(nadpisuje 10 minut) -- np. `python main.py run --hours 0.5 --interval 1`
do szybkiego testu pętli.

## 4. Pobieranie danych z Polymarket

`agent/polymarket_client.py` używa publicznego, nieautoryzowanego
endpointu `GET https://gamma-api.polymarket.com/markets` z paginacją
(`limit`/`offset`), filtrami `active=true&closed=false` i sortowaniem po
`volume24hr`, żeby najpierw pobierać najbardziej płynne rynki. Domyślnie
zbiera do 500 surowych rekordów rynków (`AGENT_MAX_MARKETS`), co przy
średnio 2 outcome'ach na rynek daje ~600-1000 wierszy outcome-poziomu do
analizy -- z zapasem ponad wymagane 300-500.

Pola `outcomes` i `outcomePrices` Gamma API zwraca jako **stringi
zawierające JSON** (np. `"[\"Yes\", \"No\"]"`), nie jako natywne listy --
`_parse_json_list()` obsługuje oba warianty. Pole `bestBid`/`bestAsk` na
poziomie rynku opisuje książkę zleceń **tylko pierwszego (głównego)
outcome'u**; dla klasycznego rynku Yes/No dopełniający book jest liczony
z tożsamości `bid_no = 1 - ask_yes`, `ask_no = 1 - bid_yes` (Polymarket:
kupno "No" = sprzedaż "Yes" na komplementarnych tokenach); dla rynków z
więcej niż dwoma outcome'ami nie ma takiej tożsamości, więc dla
outcome'ów innych niż pierwszy używana jest tylko cena z `outcomePrices`.

## 5. Fair value i wykrywanie mispricingu

**Uczciwe zastrzeżenie**: cena rynkowa na Polymarket JEST już
zagregowaną wyceną fair-value tłumu. Ten projekt nie ma dostępu do
prawdziwej przewagi informacyjnej ani zweryfikowanego źródła sentymentu
(patrz niżej), więc "fair value" to przejrzysta, w pełni czytelna
**heurystyka**, nie żadna gwarantowana alfa:

- Rynki binarne (Yes/No): fair value = midpoint książki zleceń (bid+ask)/2,
  skorygowany o mały, ograniczony sygnał sentymentu z tekstu pytania/opisu
  (domyślnie maks. ±5 punktów procentowych przy sentymencie ±1 --
  `AGENT_SENTIMENT_WEIGHT`).
- Rynki wieloopcyjne (>2 outcome'y, np. wybory z wieloma kandydatami): ceny
  są renormalizowane do sumy 1 -- odchylenie od 1 w surowych cenach to
  realny, mechaniczny sygnał (over/under-round), niezależny od sentymentu.
- Mispricing = |fair_value - cena_wejścia| >= progu (domyślnie 8%,
  `AGENT_MISPRICING_THRESHOLD`). Agent tylko kupuje (nie modeluje shortów)
  -- jeśli edge wskazuje na przewartościowanie danego outcome'u, okazja na
  drugiej stronie tego samego rynku (dopełniającym outcome) i tak
  pojawi się naturalnie przy jego własnej analizie w tej samej iteracji.

Sentyment (`agent/sentiment.py`):
- `SimpleLexiconSentimentAnalyzer` -- prosta analiza słów kluczowych
  (pozytywne/negatywne), zawsze dostępna, bez zależności zewnętrznych.
  To celowo prosty heurystyk, nie prawdziwe NLP (brak obsługi negacji,
  sarkazmu, kontekstu).
- `GrokSentimentAnalyzer` -- wywołuje xAI Grok (`api.x.ai`), aktywowany
  automatycznie gdy ustawiona jest zmienna środowiskowa `XAI_API_KEY`.
  **Niezweryfikowany na żywo** z tego samego powodu co Polymarket API --
  `api.x.ai` jest objęte tą samą blokadą sieciową w tym środowisku. Zawsze
  posiada fallback do analizatora leksykalnego przy jakimkolwiek błędzie
  (nigdy nie wywala pętli agenta).

## 6. Sizing pozycji (Kelly)

`agent/kelly.py` implementuje pełny wzór Kelly'ego dla zakupu udziału po
cenie `price` przy przekonaniu o prawdopodobieństwie `p`:

```
f* = (p - price) / (1 - price)
```

(wyprowadzenie w docstringu modułu). Stosowane są dwa zabezpieczenia:
- **Fractional Kelly** (domyślnie 0.5x, `AGENT_KELLY_MULTIPLIER`) --
  standardowa praktyka redukcji wariancji, uzasadniona tym, że nasza
  "fair value" to heurystyka, nie zweryfikowane prawdziwe prawdopodobieństwo.
- **Twardy limit 6% bankrolla na pozycję** (`AGENT_MAX_POSITION_PCT`), zgodnie
  z wymaganiem zadania -- wygrywa, gdy Kelly wskazałby więcej.

## 7. Zarządzanie pozycjami i wyjścia

`Portfolio.evaluate_exits()` zamyka pozycję (w tej kolejności):
1. rynek się rozwiązał (`closed=true`) -> rozliczenie po 1.0/0.0,
2. take-profit (domyślnie +15% niezrealizowanego zysku),
3. stop-loss (domyślnie -10%),
4. edge się zamknął (różnica cena-fair_value_z_wejścia < 2%).

Na koniec 48h (lub `python main.py once`) wszystkie otwarte pozycje są
zamykane po aktualnej cenie rynkowej (`close_all_at_market`), żeby raport
końcowy zawsze pokazywał w pełni zrealizowany P&L.

## 8. Kapitał: PLN vs USD

Zadanie definiuje kapitał jako "200 PLN (≈50 USD)". Polymarket jest
denominowany w USDC (cena udziału = prawdopodobieństwo w USD), więc
księga główna jest prowadzona w USD (`AGENT_STARTING_BANKROLL_USD=50`),
a `AGENT_USD_PLN_RATE` (domyślnie **stały** 4.00) służy wyłącznie do
wyświetlania kwot w PLN w logach/raporcie. To **nie jest kurs
live** -- nie ma tu żadnego pobierania kursu NBP/rynkowego w czasie
rzeczywistym; jeśli potrzebny jest dokładny przelicznik, ustaw
`AGENT_USD_PLN_RATE` ręcznie na aktualny kurs.

## 9. Logowanie

- Logi czytelne dla człowieka -> konsola + `data/logs/agent.log` (rotacja
  10MB x 5 plików).
- Logi decyzji -> `data/logs/decisions.jsonl`, jeden JSON na linię, zdarzenia:
  `cycle_start`, `scan_result`, `enter_position`, `skip_opportunity`,
  `close_position`, `cycle_end`, `error`. Każdy wpis `enter_position` i
  `skip_opportunity` zawiera pełne uzasadnienie liczbowe (fair value, edge,
  sentyment, sizing).

## 10. Konfiguracja (zmienne środowiskowe)

Wszystkie z sensownymi wartościami domyślnymi w `agent/config.py`, m.in.:
`AGENT_STARTING_BANKROLL_USD`, `AGENT_USD_PLN_RATE`,
`AGENT_CYCLE_INTERVAL_MIN` (10), `AGENT_RUN_HOURS` (48),
`AGENT_MIN_MARKETS`/`AGENT_MAX_MARKETS` (300/500),
`AGENT_MISPRICING_THRESHOLD` (0.08), `AGENT_SENTIMENT_WEIGHT` (0.05),
`AGENT_KELLY_MULTIPLIER` (0.5), `AGENT_MAX_POSITION_PCT` (0.06),
`AGENT_MAX_OPEN_POSITIONS` (15), `AGENT_TAKE_PROFIT_PCT` (0.15),
`AGENT_STOP_LOSS_PCT` (0.10), `XAI_API_KEY` (opcjonalny, do Groka).

## 11. Testy

```bash
python -m unittest discover -s tests -v
```

29 testów jednostkowych (bez potrzeby sieci) pokrywających: wzór Kelly'ego
i capy, silnik fair value (rynki binarne, wieloopcyjne, filtry płynności),
portfolio (otwieranie/zamykanie, take-profit/stop-loss/edge/rozwiązanie
rynku, serializacja do JSON), oraz parsowanie klienta Polymarket w trybie
offline (w tym przypadki brzegowe podwójnie zakodowanego JSON-a).

## 12. Znane ograniczenia (uczciwie, bez zmyślania)

- Klient API nie był przetestowany na żywym Polymarket z tego środowiska
  (patrz sekcja 0/ostrzeżenie na górze) -- uruchom `selftest` lokalnie
  przed właściwym runem.
- Analiza sentymentu to prosty leksykon słów kluczowych; ścieżka Grok
  istnieje i jest zaimplementowana wg dokumentacji xAI, ale też
  niezweryfikowana na żywo w tym środowisku.
- "Fair value" nie jest prawdziwą przewagą informacyjną -- to
  przejrzysta heurystyka (patrz sekcja 5); traktuj wyniki symulacji jako
  test architektury/logiki decyzyjnej, nie dowód na zyskowną strategię.
- Kurs USD/PLN jest stałą konfiguracyjną, nie danymi rynkowymi live.
- Brak modelowania poślizgu cenowego (slippage) i głębokości książki
  zleceń przy większych zleceniach -- transakcje wykonują się w całości
  po `best_ask`/`best_bid` niezależnie od rozmiaru pozycji.
