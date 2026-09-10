# BRIEF DLA CLAUDE CODE — montaż shortów z gry pod TikToka

**Kontekst:** Windows, mocny PC z GPU NVIDIA, Python 3.11, projekt `montaz-tiktok-shorty-z-gry`.
**Cel:** wrzucam surowy klip z gry → wychodzi gotowy pionowy short (9:16) z tempem, napisami i hookiem.
**Data researchu:** 10.09.2026. Wszystko poniżej pochodzi z README repozytoriów, nie z audytu kodu.

---

## 0. Zasada nadrzędna dla agenta

Nie instaluj wszystkiego naraz. Idź warstwami, po każdej warstwie zrób test na jednym prawdziwym klipie
i pokaż wynik. Jeśli narzędzie nie działa na Windowsie w 15 minut — odpuść i zapisz to w `docs/ODRZUCONE.md`
z powodem. Nie obchodź problemu WSL-em bez pytania.

---

## 1. Fundament (obowiązkowo, najpierw)

```powershell
winget install Gyan.FFmpeg          # ffmpeg + ffprobe w PATH
ffmpeg -version; ffprobe -version   # weryfikacja
python -m pip install auto-editor
```

`ffmpeg` + `ffprobe` to wspólny mianownik dosłownie wszystkich narzędzi poniżej. Bez tego nic nie ruszy.

---

## 2. Skille do Claude Code — instaluj w tej kolejności

### 2.1 auto-editor — pierwsze cięcie (PRIORYTET 1)

```powershell
npx skills add WyattBlue/auto-editor
```

Repo: `github.com/WyattBlue/auto-editor` · pip: `auto-editor` · CLI, natywnie Windows.

To jest najważniejsze narzędzie w całym stacku i jedyne, które ma **oficjalny wpis skilla w README projektu**
(czyli autor sam go utrzymuje, a nie ktoś obcy). Robi „first pass" — wywala martwe miejsca.

Kluczowe dla gameplayu:

```bash
auto-editor klip.mp4 --edit audio:threshold=-19dB --margin 0.3s,1.5sec
auto-editor klip.mp4 --edit motion:threshold=0.02          # cięcie po ruchu, nie po dźwięku
auto-editor klip.mp4 --edit "(or audio:0.03 motion:0.06)"  # oba sygnały razem
auto-editor klip.mp4 --edit:2 audio:-12dB --when:2 speed:1.5   # nudne fragmenty przyspiesz zamiast wycinać
auto-editor klip.mp4 --export clip-sequence                # osobne pliki zamiast jednego renderu
```

Ten `--edit motion` to jest odpowiedź na gry bez kill-feedu (RPG, survival, horror): tam gdzie nic się nie
rusza, tam nie ma treści. A `--when speed:1.5` daje montażowi rytm bez wycinania kontekstu.

Eksportuje też timeline do Premiere / DaVinci Resolve / Final Cut / ShotCut — jak coś wyjdzie źle,
poprawisz ręcznie zamiast renderować od zera.

### 2.2 ffmpeg-analyse-video-skill — Claude „ogląda" klip (PRIORYTET 2)

```powershell
npx skills add fabriqaai/ffmpeg-analyse-video-skill
```

Repo: `github.com/fabriqaai/ffmpeg-analyse-video-skill`

Wyciąga klatki przez ffmpeg i puszcza je przez model wizyjny, generując opis z timestampami.
Sztuczka architektoniczna: klatki czyta wyłącznie w **sub-agentach**, a do głównego kontekstu wraca sam
tekst. Bez tego jeden 10-minutowy klip zapcha kontekst i sesja umrze.

To jest brakujący element: żeby Claude Code wybrał najlepszy moment, musi ten klip najpierw zobaczyć.
Detektory kill-feedu tego nie zastąpią.

### 2.3 video-edit-cli — montaż jako plan JSON (PRIORYTET 3, z zastrzeżeniem)

```powershell
npx skills add computerlovetech/video-edit-cli --skill video-edit-cli
uv tool install video-edit-cli
video-edit-cli doctor
```

Repo: `github.com/computerlovetech/video-edit-cli` · MIT · PyPI

Najlepiej zaprojektowane koncepcyjnie narzędzie z całej listy. Agent zbiera dowody (transkrypt, klatki,
waveform), pisze **edit plan** — listę „keep" z polem `reason` przy każdym cięciu — a CLI to waliduje i
renderuje. Każdy plik dostaje sidecar `*.provenance.json`. Źródła nigdy nie są modyfikowane.

```json
{"plan_id":"rough-cut-1","timeline":[
  {"source":"src-1","in":0.5,"out":42.1,"reason":"keep intro"},
  {"source":"src-1","in":55.0,"out":120.4,"reason":"false start removed at 42.1-55.0"}]}
```

Umie: shorts 9:16 z wypalonymi napisami, transkrypt Whisper na poziomie słów, SRT/VTT, mastering audio.

⚠️ **DWA CZERWONE FLAGI, przeczytaj zanim zainstalujesz:**
- README mówi wprost: *„Runs on macOS and Linux. Windows is untested; use WSL."*
- Repo ma **0 gwiazdek** i 41 commitów. Ma testy w CI i licencję MIT, ale nikt tego nie używa poza autorem.

Traktuj to jako eksperyment. Jeśli `video-edit-cli doctor` sypie się na Windowsie — nie walcz, ale
**skopiuj sam wzorzec edit-planu do naszego własnego pipeline'u**, bo ten wzorzec jest wart więcej niż
narzędzie. My i tak chcemy własny `montaz.py`.

### 2.4 Remotion — intro, outro, hook cards, overlaye

```powershell
npx skills add remotion
```

Oficjalny skill Remotion (react → MP4). Do tego, czego ffmpeg nie zrobi ładnie: animowany hook
w pierwszych 3 sekundach, licznik, nazwa gry, końcowy CTA pod subskrypcję.

Bonus: `github.com/remotion-dev/template-tiktok` — napisy w stylu TikToka na whisper.cpp.
⚠️ Domyślnie ciągnie model `medium.en` (1.5 GB, tylko angielski). **Pod polski trzeba zmienić
`WHISPER_MODEL` w `whisper-config.mjs` na wariant bez sufiksu `.en`.**

---

## 3. Silnik montażu — to jest ta część „fajnie zmontuj"

### BeatSync-Engine (REKOMENDACJA)

Repo: `github.com/Merserk/BeatSync-Engine`

To nie jest clipper — to jest maszyna do montażu AMV/GMV i według opisu najlepiej trafia w to,
czego chcę (montaż z gry pod muzykę, nie gadające głowy).

Co robi wg README:
- **Energy-Wave Cut Density** — spokojne fragmenty trzymają ujęcie dłużej, dropy i uderzenia tną szybciej
- **Song Structure Detection** — wykrywa intro / zwrotkę / refren / bridge / drop / build / outro
- **Rhythm Feature Analysis** — kick, clap, bas, hi-hat, novelty, impact, kotwice taktów i fraz
- **Source Video Moment Library** — skanuje materiał pod kątem ruchu, jakości, zmian sceny, akcji
- **Qwen3-VL Semantic Tags** — lokalne tagowanie wizyjne (action, combat, chase, beauty, drops) przez
  llama.cpp na Vulkanie
- **Audio-Visual Planner** — dobiera konkretne momenty zamiast losować klipy
- Eksport NVENC H.264 / H.265, albo libx264, albo ścieżka ProRes 422 Proxy

Windows-friendly z definicji: przenośne środowisko Pythona, `bin/llama-bin-win-vulkan-x64/`,
`cupy-cuda13x[ctk]` dociąga runtime CUDA sam — **nie trzeba osobno instalować CUDA Toolkit**.
Wymaga sterowników z Vulkanem, a NVENC wymaga karty NVIDIA (mam).

**Zadanie:** postaw to, przetestuj na jednym klipie + jednym utworze, oceń czy cięcia trafiają w beat.
Jeśli tak — to jest nasz główny silnik „urozmaicania", a auto-editor robi tylko preprocessing.

---

## 4. Napisy pod TikToka

Wybierz **jedno**, nie trzy:

| Opcja | Instalacja | Uwaga |
|---|---|---|
| **captacity** | `pip install captacity[local_whisper]` | Najprościej. Podświetlanie słowa (`highlight_current_word`), własny font, kolor, obrys, cień, `line_count=1`. Oparty na MoviePy → wolny przy długich plikach. |
| **faster-whisper + ASS/libass** | `pip install faster-whisper` + ffmpeg | Szybsze, GPU, pełna kontrola nad stylem. Więcej roboty, ale to jest wersja „system", nie „skrypt". |
| **Remotion template-tiktok** | patrz 2.4 | Najładniejsze karaoke, najcięższy setup. |

**Rekomendacja: zacznij od captacity, żeby zobaczyć efekt na oczy, a docelowo przepisz na
faster-whisper + ASS.** I ustaw polski model — domyślne `.en` zrobi z polskiego bełkot.

---

## 5. Gdyby wchodziły klipy z VOD-ów z Twitcha

Streamuję jako `Pysiex_`, więc jak zaczniemy ciąć całe transmisje zamiast pojedynczych klipów:

- **`mutonby/openshorts`** (2,9k ⭐, MIT) — jedyne narzędzie z listy, które ma **gotowy MCP server i API dla
  agentów**, czyli Claude Code może nim sterować bez pisania kleju. Ma AI moment detection, face tracking,
  napisy, dubbing. ⚠️ Self-host wymaga Dockera.
- **`twitch_auto_clipper`** (`pip install twitch_auto_clipper`) — nasłuchuje czatu i tworzy klip Twitcha, gdy
  aktywność przekroczy próg (osobne wagi dla emotek i zwykłych wiadomości, parametr
  `clipable_message_ratio`). Wymaga `TWITCH_CLIENT_ID` i `CLIENT_SECRET`. **Czat widzi śmieszne momenty
  lepiej niż jakikolwiek model wizyjny** — to najtańszy dobry sygnał, jaki mam.
- **`op7418/Youtube-clipper-skill`** (633 ⭐, `npx skills add https://github.com/op7418/Youtube-clipper-skill`)
  — semantyczne rozdziały + cięcie + wypalanie napisów. ⚠️ Domyślnie tłumaczy na chiński/angielski,
  trzeba przekonfigurować. Wymaga `yt-dlp`, `ffmpeg` z libass, `pysrt`.

---

## 6. Świadomie ODRZUCONE — nie proponuj mi tego ponownie

| Narzędzie | Dlaczego nie |
|---|---|
| `Noah-Grimaldi/auto-gaming-montage-maker` | Modele YOLOv8 wytrenowane pod kill-feedy 10 strzelanek (Fortnite, Apex, Valorant, CoD, Overwatch, R6, Destiny 2, PUBG, Rocket League, Minecraft). W RPG/singleplayer nie ma czego wykrywać. |
| `github.com/topics/short-game` | Temat o gatunku krótkich gier, zero związku z montażem. |
| Segra (topic `game-recording`) | To nagrywarka (klon OBS), nie montażownia. |
| `xixihhhh/hotclip` | Kuszące (aplikacja Windows, lokalnie, bez znaku wodnego, AGPL-3.0), ale: highlighty wykrywa **z mowy** — pod gameplay bez komentarza bezużyteczne; ASR pod chiński; **MCP server jest dopiero w roadmapie v0.8, nie istnieje**. |
| `browser-use/video-use` | Dobry skill do Claude Code, ale instalacja to `ln -s` + `brew` + klucz ElevenLabs, a logika stoi na wycinaniu „ymm/eee" z transkryptu. Pod gadające głowy — tak. Pod gameplay — nie. |

---

## 7. Docelowa struktura projektu

```
montaz-tiktok-shorty-z-gry/
├─ input/                    # tu wrzucam surowe klipy
├─ work/                     # pośrednie, kasowalne
├─ output/                   # gotowe shorty
├─ music/                    # podkłady do BeatSync
├─ presets/
│   ├─ tiktok-9x16.json      # 1080x1920, 30fps, -14 LUFS
│   └─ napisy-pl.json        # font, kolor, obrys, pozycja
├─ scripts/
│   ├─ to_vertical.py        # ✅ już działa
│   ├─ trim_silence.py       # ✅ już działa
│   ├─ auto_captions.py      # ⚠️ napisany, nieprzetestowany (blokada sieci w chmurze)
│   └─ montaz.py             # ← DO NAPISANIA: orkiestrator całości
└─ docs/
    ├─ ANALIZA-NARZEDZI.md   # ✅ istnieje
    └─ ODRZUCONE.md          # ← nowy, patrz sekcja 6
```

**`montaz.py` — docelowy pipeline:**

```
1. probe            → ffprobe: rozdzielczość, fps, czy jest ścieżka audio
2. analiza          → skill 2.2 wypluwa opis z timestampami; równolegle waveform (peaki = moje reakcje)
3. plan             → edit plan JSON w formacie z 2.3, z polem `reason` przy KAŻDYM cięciu
4. akceptacja       → pokaż mi plan tekstem ZANIM zaczniesz renderować
5. cięcie           → auto-editor lub ffmpeg wg planu
6. kadr             → to_vertical.py, 9:16
7. rytm             → BeatSync-Engine, jeśli jest podkład w music/
8. napisy           → auto_captions.py, model PL
9. hook             → Remotion: tekst w górnej 1/3 przez pierwsze 2 sekundy
10. master          → loudnorm do -14 LUFS (standard TikTok/Reels), NVENC
```

Punkt 4 jest nienegocjowalny. Nie renderuj 10 minut, żeby pokazać mi coś, co odrzucę po 3 sekundach.

---

## 8. Czego NIE zweryfikowałem — traktuj jako hipotezy

- Czytałem README, nie kod. Żadne z narzędzi z sekcji 3 i 5 nie zostało uruchomione.
- Liczby gwiazdek to stan na 10.09.2026.
- `auto_captions.py` z poprzedniej sesji **nie został przetestowany end-to-end** — sesja chmurowa miała
  zablokowane pobieranie wag Whispera (potwierdzone 403 z proxy). Na moim komputerze powinno pójść, ale
  „powinno" to nie „działa". Zweryfikuj to jako pierwsze.
- `PySceneDetect` (wykrywanie zmian ujęć) — znam z nazwy, nie sprawdzałem go w tym researchu.
  Może się przydać w kroku 2, ale zweryfikuj sam zanim wciągniesz do pipeline'u.
