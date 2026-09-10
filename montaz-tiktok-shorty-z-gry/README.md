# Montaż klipów z gry pod TikToka / Shorts

Projekt do zamiany surowych klipów z gry na gotowe, pionowe filmiki (9:16)
pod TikToka, Instagram Reels i YouTube Shorts.

**Obowiązująca architektura: [`docs/STACK-DARMOWY-v2.md`](docs/STACK-DARMOWY-v2.md).**
Starszy [`docs/BRIEF-MONTAZ-TIKTOK.md`](docs/BRIEF-MONTAZ-TIKTOK.md) zostaje jako
kontekst historyczny — tam, gdzie dokumenty się różnią, wygrywa v2. Skrót zmiany:
NIE budujemy wszystkiego w Pythonie/ffmpeg. `auto-editor` wykrywa cięcia, timeline
układa się w DaVinci Resolve (darmowa edycja, bez znaku wodnego) sterowanym przez
MCP, render wychodzi czysty z Resolve.

Pełna analiza przejrzanych narzędzi z GitHuba (porównanie, licencje, wymagania)
jest w [`docs/ANALIZA-NARZEDZI.md`](docs/ANALIZA-NARZEDZI.md). Lista świadomie
odrzuconych opcji z powodami: [`docs/ODRZUCONE.md`](docs/ODRZUCONE.md).

## ⚠️ Ta sesja (chmura, headless) vs. sesja lokalna (Windows + GPU)

Ten projekt jest rozwijany w dwóch różnych środowiskach Claude Code jednocześnie:

- **Sesja chmurowa** (w której powstał ten plik) — Linux, brak GPU, brak DaVinci
  Resolve. Może: strukturę repo, `auto-editor` (wykrywanie cięć, działa na CPU),
  dokumentację, szkielety skryptów.
- **Sesja lokalna** (Windows, GPU) — jedyne miejsce, gdzie da się zrobić most do
  DaVinci Resolve (MCP), test `unofficial-davinci-mcp` (beat grid, EBU R128) i
  `BeatSync-Engine`. Te trzy elementy **strukturalnie nie działają w sesji
  chmurowej** — to nie brak czasu, tylko brak GUI Resolve i GPU w kontenerze.

Nie mieszaj poleceń między sesjami — komendy z `nvidia-smi`, `findstr`, ścieżkami
`C:\...` czy odwołaniami do zainstalowanego Resolve są dla sesji lokalnej.

## Struktura

```
montaz-tiktok-shorty-z-gry/
├── input/                    # tu wrzucam surowe klipy
├── work/                     # pośrednie, kasowalne (np. klipy testowe)
├── output/                   # gotowe shorty
├── music/                    # podkłady do beat-sync
├── presets/
│   ├── tiktok-9x16.json      # 1080x1920, -14 LUFS
│   └── napisy-pl.json        # font, model Whisper, pozycja napisów
├── scripts/
│   ├── to_vertical.py        # ✅ działa (fallback bez Resolve)
│   ├── trim_silence.py       # ✅ działa (fallback bez Resolve)
│   ├── auto_captions.py      # ⚠️ napisany, zablokowany siecią w tej sesji
│   ├── highlight_punch.py    # ✅ działa (zoom+slowmo na wskazanym momencie)
│   └── montaz.py             # ⚠️ szkielet orkiestratora, kroki Resolve = zaślepki
└── docs/
    ├── ANALIZA-NARZEDZI.md      # ✅ analiza ogólna (research pierwotny)
    ├── BRIEF-MONTAZ-TIKTOK.md   # starszy brief (kontekst historyczny)
    ├── STACK-DARMOWY-v2.md      # ✅ OBOWIĄZUJĄCA architektura
    ├── TESTY-AUTO-EDITOR.md     # ✅ zmierzone wyniki 3 wariantów --edit
    ├── WERYFIKACJA-MCP.md       # ⬜ szablon — wypełnić w sesji lokalnej
    └── ODRZUCONE.md             # log odrzuconych narzędzi z powodami
```

## auto-editor (rdzeń wykrywania cięć, zgodnie z v2)

Zainstalowany i przetestowany w tej sesji: `pip install auto-editor` (29.3.1) +
`npx skills add WyattBlue/auto-editor` (4 skille w `.claude/skills/`). Pełne wyniki
testu trzech wariantów `--edit` na syntetycznym klipie: [`docs/TESTY-AUTO-EDITOR.md`](docs/TESTY-AUTO-EDITOR.md).

Skrót: wariant łączony `--edit "(or audio:0.03 motion:0.06)"` jako jedyny poprawnie
złapał zarówno ciche-ale-ruchome, jak i głośne-ale-statyczne fragmenty — ustawiony
jako domyślny w `scripts/montaz.py`.

```bash
auto-editor klip.mp4 --edit "(or audio:0.03 motion:0.06)" --preview   # tylko statystyki
auto-editor klip.mp4 --edit "(or audio:0.03 motion:0.06)" --export resolve  # most do Resolve
```

## Własny pipeline (`scripts/`)

Zamiast instalować całą ciężką platformę (Docker, GPU, klucze API), projekt
zawiera lekki, własny zestaw skryptów zbudowany na tych samych podstawowych
klockach, których używają wszystkie przeanalizowane narzędzia: **FFmpeg**
(cięcie/kadrowanie wideo) i **Whisper** (automatyczne napisy).

| Skrypt | Co robi | Status w tej sesji |
|---|---|---|
| `to_vertical.py` | Zmienia kadr 16:9 → 9:16 (tryb `crop` — twarde przycięcie środka; tryb `blur` — rozmyte tło + ostry środek) | ✅ **przetestowane, działa** |
| `trim_silence.py` | Wycina ciche/martwe fragmenty klipu (bez ML, próg głośności) | ✅ **przetestowane, działa** |
| `auto_captions.py` | Whisper transkrybuje audio → wypala napisy przez FFmpeg | ⚠️ **kod gotowy, ale patrz ograniczenie niżej** |
| `pipeline.py` | Spina wszystko w jeden krok: trim → crop → napisy | zależny od `auto_captions.py` |

### Przykłady użycia

```bash
# tylko przycięcie na pion (celownik/akcja na środku ekranu — typowe w FPS)
python3 scripts/to_vertical.py input/klip.mp4 output/klip_pion.mp4 --mode crop

# wycięcie ciszy
python3 scripts/trim_silence.py input/klip.mp4 output/klip_bez_ciszy.mp4

# pełny pipeline
python3 scripts/pipeline.py input/klip.mp4 output/gotowy.mp4 --vertical-mode crop
```

### Ważne, sprawdzone ograniczenie tej sesji (nie zgaduję — to zmierzony fakt)

Ta chmurowa sesja Claude Code ma **ograniczony dostęp do sieci** (polityka
firmowa/organizacyjna) — działa `pip install` (PyPI) i `git`, ale pobieranie
plików z dowolnych zewnętrznych CDN-ów (np. wag modelu Whisper z
`openaipublic.azureedge.net`) jest **blokowane przez proxy (403)**. Sprawdziłem
to bezpośrednio, próbując uruchomić `auto_captions.py` — kod działa poprawnie,
ale pobieranie modelu Whisper zakończyło się błędem `Tunnel connection failed:
403 Forbidden`.

**Co to oznacza praktycznie:**
- `to_vertical.py` i `trim_silence.py` działają w 100% już teraz w tej sesji —
  mogę nimi realnie obrabiać klipy, które mi wgrasz w tym czacie.
- `auto_captions.py` (i każde inne narzędzie z listy w `docs/ANALIZA-NARZEDZI.md`
  oparte o Whisper/AI wymagające pobrania wag modelu — czyli praktycznie
  wszystkie poza tymi dwoma skryptami) **nie pobierze modelu w tej konkretnej
  sesji chmurowej**. Zadziała bez problemu na Twoim własnym komputerze
  (normalny dostęp do internetu) albo w sesji z inną polityką sieciową.

## Rekomendacja narzędzi zewnętrznych (do uruchomienia lokalnie)

Skrót z pełnej analizy w `docs/ANALIZA-NARZEDZI.md` — **wybór zależy od
odpowiedzi na dwa pytania: w co grasz i czy masz kartę Nvidia**, więc poniżej
są warianty, nie jedna sztywna rekomendacja:

1. **[auto-gaming-montage-maker](https://github.com/Noah-Grimaldi/auto-gaming-montage-maker)**
   — jeśli grasz w jedną z 10 obsługiwanych gier (Fortnite, Apex, Valorant,
   CoD, Overwatch, Minecraft, R6 Siege, Destiny 2, PUBG, Rocket League).
   Ma gotowy instalator, sam wykrywa killi/eliminacje (YOLOv8).
2. ~~**[autoshorts](https://github.com/divyaprakash0426/autoshorts)**~~ —
   **ODRZUCONE, zweryfikowane.** README projektu wymaga wprost: `"NVIDIA GPU
   with CUDA support"`, `"CUDA Toolkit with nvcc"`, `cupy` (CUDA-accelerated
   NumPy — nie ma tu ścieżki ROCm, to osobny pakiet od zera) i NVENC do
   renderu, a Docker odpala się przez `docker run --gpus all` (NVIDIA Container
   Toolkit, nie działa z AMD). **Zero wzmianek o AMD/ROCm w całym repo.** Na
   potwierdzonym GPU **AMD Radeon RX 9070 XT** to się nie uruchomi bez
   przepisania całego backendu GPU — nie testować, nie próbować "obejść".
   Przeniesione do `docs/ODRZUCONE.md`.
3. **[short-video-maker](https://github.com/gyoridavid/short-video-maker)** /
   **[openshorts](https://github.com/mutonby/openshorts)** — jeśli docelowo
   chcesz postawić trwały serwis (Docker) do masowej produkcji shortów, nie
   tylko z gier. Oba mają serwer MCP, więc dają się podłączyć bezpośrednio
   jako narzędzie do agenta AI.

## Jak dalej pracować

Wrzuć klip do `input/` (albo prześlij go w tym czacie) i powiedz, co mam z
nim zrobić — mogę od razu puścić `to_vertical.py` / `trim_silence.py` na
realnym materiale.
