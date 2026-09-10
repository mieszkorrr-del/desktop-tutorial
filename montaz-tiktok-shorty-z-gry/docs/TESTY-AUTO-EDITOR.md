# Testy auto-editor — trzy warianty `--edit`

Środowisko testu: Ubuntu 24.04 (sesja chmurowa), `auto-editor 29.3.1` (pip), brak GPU.
Ważne: test wykonany na **syntetycznym klipie**, nie na materiale z `input/` — zgodnie
z poleceniem, żeby wynik był w 100% powtarzalny i żeby dało się precyzyjnie ocenić,
który sygnał (audio czy ruch) wygrywa w kontrolowanych warunkach.

## Klip testowy

20 s, cztery 5-sekundowe segmenty zaprojektowane tak, żeby audio i ruch **rozjeżdżały się**
niezależnie od siebie — to jedyny sposób, żeby empirycznie zobaczyć różnicę między
`--edit audio`, `--edit motion` i ich sumą:

| Segment | Czas | Obraz | Dźwięk | Powinien przetrwać? |
|---|---|---|---|---|
| A | 0–5s | ruch (mandelbrot) | ton 800Hz | tak — wszędzie |
| B | 5–10s | statyka (szare tło) | cisza | nie — martwy fragment, wszędzie |
| C | 10–15s | statyka (niebieskie tło) | ton 440Hz | tylko gdy liczy się dźwięk |
| D | 15–20s | ruch (mandelbrot) | cisza | tylko gdy liczy się ruch |

C i D to sedno testu: C symuluje np. ekran ekwipunku z dialogiem (dźwięk bez ruchu),
D symuluje cichą, intensywną akcję bez komentarza (ruch bez dźwięku) — dokładnie
przypadek, o którym mówi brief ("gry singleplayer, często bez kill-feedu i bez komentarza").

Zbudowany przez `filter_complex concat` (nie demuxer `-f concat`) — pierwsza próba
demuxerem dała uszkodzoną ścieżkę audio w ostatnim segmencie (patrz niżej), więc
zmieniłem metodę budowy i zweryfikowałem poziomy audio (`auto-editor levels`) przed
testem właściwym.

## Wyniki (zmierzone, `--preview` + `--export clip-sequence`)

| Wariant | Komenda | Wycięto | Zostawiono | Liczba klipów | Co konkretnie przetrwało |
|---|---|---|---|---|---|
| 1 — audio | `--edit "audio:threshold=-19dB" --margin 0.3sec,1.5sec` | 6,76s (33,7%) | 13,28s | 2 | A (6,48s z marginesem) + C (6,80s z marginesem). **D odpadło całkowicie.** |
| 2 — motion | `--edit "motion:threshold=0.02"` | 9,16s (45,7%) | 10,88s | 3 | A (5,24s) + 0,44s artefakt na cięciu C→D + D (5,20s, ciche!). **C odpadło całkowicie.** |
| 3 — or | `--edit "(or audio:0.03 motion:0.06)"` | 4,56s (22,75%) | 15,48s | 2 | A (5,24s) + C+D razem (10,24s, bez przerwy między nimi). **Tylko B odpadło.** |

Weryfikacja "co przetrwało" nie jest domysłem z agregatów — wyeksportowałem każdy
wariant jako osobne pliki (`--export clip-sequence`) i zmierzyłem długość + średni
poziom audio (`auto-editor levels`) każdego kawałka, żeby jednoznacznie przypisać go
do segmentu źródłowego (dane w `work/synthetic_test/`, nieskomitowane — duże pliki robocze).

## Wniosek

**Wariant 3 (`or audio motion`) jako jedyny trafił w 100% zgodnie z projektem testu** —
zostawił zarówno "ciche‑ale‑ruchome" (D), jak i "głośne‑ale‑statyczne" (C), wycinając
tylko prawdziwie martwy fragment (B).

- Wariant 1 (sam dźwięk) **traci realną akcję bez komentarza/SFX** — dokładnie
  scenariusz, przed którym ostrzega brief dla gier singleplayer bez kill-feedu.
- Wariant 2 (sam ruch) **traci sceny z ważnym dźwiękiem, ale bez ruchu obrazu**
  (np. dialog na tle statycznego menu/ekwipunku, cutscenka z małą ilością ruchu kamery).
- Dodatkowo wariant 2 wygenerował krótki (0,44s) fałszywy pozytyw dokładnie na twardym
  cięciu między segmentami — spodziewany artefakt: nagła zmiana kadru wygląda dla
  detektora ruchu jak chwilowy "ruch". W realnym materiale (płynne ujęcia) to nie powinno
  występować w tej skali, ale warto o tym pamiętać przy klipach z twardymi cięciami sceny.

**Rekomendacja do `montaz.py`:** domyślny edit = wariant 3 (`or audio motion`), z osobno
strojonymi progami dla obu sygnałów. Warianty 1 i 2 zostają dostępne jako opcje ręczne,
gdy materiał jest jednoznacznie jednego typu (np. czysty walkthrough z komentarzem —
wtedy `audio` samo wystarczy i jest tańsze obliczeniowo).

## Potwierdzone przy okazji (fakty, nie domysły)

- Składnia `--margin 0.3sec,1.5sec` (dwie wartości oddzielone przecinkiem) **działa** w
  auto-editor 29.3.1 — `--help` pokazuje tylko pojedynczy `LENGTH`, ale empirycznie dwie
  wartości (before,after) są akceptowane bez błędu.
- `--edit "(or audio:X motion:Y)"` — składnia logiczna z nawiasem i operatorem `or`
  działa dokładnie tak, jak w README.
- `npx skills add WyattBlue/auto-editor -a claude-code -y` zainstalował 4 skille
  (`auto-editor`, `auto-editor-effects`, `auto-editor-export`, `auto-editor-transcribe`)
  do `.claude/skills/` w tej sesji — za pierwszym razem classifier trybu auto to
  zablokował (osobna decyzja bezpieczeństwa), za drugim razem (po wyraźnej zgodzie
  na kontynuację) przeszło bez problemu.
