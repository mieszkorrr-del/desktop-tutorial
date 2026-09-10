# Montaż klipów z gry pod TikToka / Shorts

Projekt do zamiany surowych klipów z gry na gotowe, pionowe filmiki (9:16)
pod TikToka, Instagram Reels i YouTube Shorts.

Pełna analiza przejrzanych narzędzi z GitHuba (porównanie, licencje, wymagania,
rekomendacje zależnie od gry/sprzętu) jest w
[`docs/ANALIZA-NARZEDZI.md`](docs/ANALIZA-NARZEDZI.md).

## Struktura

```
montaz-tiktok-shorty-z-gry/
├── input/    -> tu trafiają surowe klipy do zmontowania
├── output/   -> tu trafiają gotowe montaże
├── scripts/  -> własny pipeline FFmpeg + Whisper (patrz niżej)
└── docs/     -> analiza porównawcza narzędzi z GitHuba
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
2. **[autoshorts](https://github.com/divyaprakash0426/autoshorts)** — jeśli
   grasz w cokolwiek innego i masz kartę Nvidia 6GB+ VRAM — wykrywa "epickie
   momenty" uniwersalnie przez AI (OpenAI/Gemini), dorzuca lektora TTS.
3. **[short-video-maker](https://github.com/gyoridavid/short-video-maker)** /
   **[openshorts](https://github.com/mutonby/openshorts)** — jeśli docelowo
   chcesz postawić trwały serwis (Docker) do masowej produkcji shortów, nie
   tylko z gier. Oba mają serwer MCP, więc dają się podłączyć bezpośrednio
   jako narzędzie do agenta AI.

## Jak dalej pracować

Wrzuć klip do `input/` (albo prześlij go w tym czacie) i powiedz, co mam z
nim zrobić — mogę od razu puścić `to_vertical.py` / `trim_silence.py` na
realnym materiale.
