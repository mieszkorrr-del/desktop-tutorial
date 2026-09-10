# STACK DARMOWY v2 — bez znaków wodnych, bez limitów minut

Uzupełnienie `BRIEF-MONTAZ-TIKTOK.md`. Research: 10.09.2026.
**Twarda zasada:** nic, co nakłada znak wodny albo liczy minuty. To wyklucza darmowe plany
OpusClip i Descript jako źródło materiału do publikacji — zostają wyłącznie jako narzędzia analizy.

---

## 1. NOWY RDZEŃ: DaVinci Resolve (wersja darmowa) sterowany przez MCP

To jest odpowiedź na pytanie „czy Claude może podłączyć się do programu do montażu".
Może — i to do najlepszego darmowego programu na rynku.

### Dlaczego Resolve, a nie ffmpeg do wszystkiego

Weryfikacja darmowej wersji (stan na wrzesień 2026):

- **Brak znaku wodnego.** Zwykły eksport z darmowej wersji jest czysty.
- Eksport do **UHD 3840×2160 @ 60 fps, 8-bit**. Powyżej (DCI 4K, 6K, 8K, 10-bit, >60 fps) — Studio.
- Pełne **Fusion** (kompozycja, animacja) i **Fairlight** (audio) w darmowej wersji.
- Bez subskrypcji, bez konta, bez limitu czasu.
- ⚠️ Jedyny wyjątek: jeśli użyjesz efektu dostępnego wyłącznie w Studio, TEN efekt wyświetli znak
  wodny. Nie używaj Studio-only ResolveFX i eksport zostaje czysty.

Do TikToka (1080×1920) sufit 4K/60 jest kompletnie bez znaczenia.

**Do tego rzeczy, których w ffmpeg nie zrobisz sensownie:** zoom punch na keyframe'ach, animowany
tekst, tracking, node'owy color grading, warstwy, krzywe głośności.

### 1a. hiteshK03/davinci-resolve-mcp — REKOMENDACJA GŁÓWNA

`github.com/hiteshK03/davinci-resolve-mcp`

Jedyny znaleziony MCP do Resolve, który **działa na darmowej wersji**. Reszta wymaga Studio ($295),
bo używa „external scripting" — funkcji zablokowanej za paywallem.

Obejście jest sprytne: skrypt-most (`CursorBridge.py`) uruchamiany **wewnątrz Resolve** przez
menu Workspace → Scripts, które jest dostępne dla wszystkich. Most otwiera połączenie na localhost,
a serwer MCP z nim gada.

```
Claude → MCP → resolve_mcp_bridge.py → HTTP localhost → CursorBridge.py (w Resolve) → API Resolve
```

Konfiguracja pod Windows jest w README:

```json
{"mcpServers":{"davinci-resolve":{"command":"cmd.exe",
 "args":["/c","C:\\ścieżka\\venv\\Scripts\\python.exe","C:\\ścieżka\\src\\resolve_mcp_bridge.py"]}}}
```

Przykłady komend z README: import do media poola, marker w konkretnej sekundzie, tytuł Text+ przy
playheadzie, zmiana opacity klipu, zoom klipu do 120% i przesunięcie, transkrypcja audio z timeline'u,
izolacja wokalu, usunięcie tła z klipu, LUT na node, render MP4 H.265, eksport FCPXML, grab stilla.

⚠️ **Sprzeczność w samym repo, sprawdź to pierwsze:** opis repozytorium mówi o **44 narzędziach**,
a treść README o **155 z 162 działających na Free**. Nie wiem, która liczba jest aktualna.
Zweryfikuj empirycznie po instalacji, zanim zbudujesz na tym pipeline.
Autor deklaruje, że 7 niedziałających na Free to funkcje Neural Engine ze Studio i że do każdej
dołożył darmowy lokalny zamiennik na CPU.

### 1b. wassermanproductions/unofficial-davinci-mcp — DRUGI WYBÓR

`github.com/wassermanproductions/unofficial-davinci-mcp` · Apache-2.0

Inna filozofia: zamiast sterować Resolve na żywo, **generuje czyste pliki importowe (FCPXML, LUT)
dla darmowej edycji**. Tieruje narzędzia — `both` = działa na Free lub Studio, `live` = wymaga Studio.

Ma dokładnie to, czego potrzebuję do montażu z gry:

- **beat-aware music cuts** — cięcia na beat, siatka beatów liczona numerycznie
- estymacja BPM, czasów beatów, downbeatu i siły onsetów
- **EBU R128 loudness** — czyli te -14 LUFS bez ręcznego liczenia
- color match do klatki referencyjnej, wypalany do 33-punktowego LUT-a `.cube`
- dialogue tightening

Kluczowa zaleta bezpieczeństwa: **każde narzędzie modyfikujące ma domyślnie `dry_run=true`** i zwraca
plan. Żeby cokolwiek zmienić, trzeba świadomie dać `dry_run=false` i `confirm=true`.
Wszystko stoi na stdlib + numpy + ffmpeg, bez chmury.

Filozofia autora warta zacytowania: serwer robi deterministyczną robotę numeryczną, której LLM nie
powinien zgadywać — siatki beatów, matematykę LUT-ów, loudness, FCPXML.

### 1c. znznzna/davinci-cli — jeśli wolisz plugin do Claude Code

```
/plugin marketplace add znznzna/davinci-cli
/plugin install davinci-cli@davinci-cli
```

CLI + MCP, ~90 komend, agent czyta `SKILL.md`. ⚠️ Łączy się bezpośrednio z API skryptowym Resolve,
czyli **prawdopodobnie wymaga Studio**. Repo ma komendę `dr system edition` do sprawdzenia edycji —
odpal ją zaraz po instalacji i jeśli pokaże, że Free nie wystarcza, odinstaluj i wróć do 1a.

---

## 2. Zmieniony przepływ pracy

Stary plan zakładał, że wszystko robimy w Pythonie. To był błąd — walka z ffmpeg o zoom punche
i animowany tekst to strata czasu, skoro Resolve robi to lepiej i za darmo.

```
1. auto-editor  →  wykrywa cięcia (audio + motion)
                   auto-editor klip.mp4 --export resolve
                   ↑ TO JEST MOST: auto-editor natywnie eksportuje timeline do Resolve

2. Resolve      →  Claude przez MCP układa timeline, dokłada zoom punche,
                   tekst, tranzycje, grade

3. faster-whisper → napisy PL, word-level, jako ASS
                   (albo transkrypcja przez MCP prosto z timeline'u)

4. Resolve      →  render czysty, 1080×1920, H.264/H.265
```

Punkt 1 jest darmowy prezent: auto-editor **już umie** eksportować do Resolve, Premiere, Final Cut
i ShotCut. Nie trzeba nic pisać.

---

## 3. Co realnie poprawia oglądalność — i czym to zrobić za darmo

To jest część „żeby lepiej się oglądało". Każda pozycja to konkretna technika, nie ogólnik.

| Technika | Dlaczego działa | Czym za darmo |
|---|---|---|
| **Hook w 0–2 s** | Pierwsze 3 sekundy decydują o completion rate. Tekst zapowiadający pointę, zanim ona nastąpi | Resolve Text+ w górnej 1/3 kadru (unikaj środka i strefy UI TikToka) |
| **Zoom punch na uderzeniu** | Przykuwa oko dokładnie tam, gdzie coś się dzieje | Keyframe'y skali w Resolve; timing z BPM z 1b |
| **Napisy słowo-po-słowie** | Ogromna część ogląda bez dźwięku; podświetlane słowo trzyma wzrok | faster-whisper + ASS/libass, albo transkrypcja przez MCP |
| **Cięcie na beat** | Montaż „czuje się" zrobiony przez człowieka, nie przez skrypt | `unofficial-davinci-mcp` (beat grid) albo BeatSync-Engine |
| **Gęstość cięć zależna od energii** | Spokojne fragmenty dłuższe ujęcia, drop = szybkie cięcia | BeatSync-Engine (Energy-Wave Cut Density) |
| **Cięcie na granicy ujęcia** | Klip nie zaczyna się od połowy ruchu ani połowy przejścia | TransNetV2 — 31 MB ONNX, licencja MIT, lokalnie (używa go hotclip) |
| **SFX na cięciu** | Whoosh/impact maskuje cięcie i podbija dynamikę | patrz niżej |
| **Głośność -14 LUFS** | Standard TikTok/Reels; skoki głośności między klipami wyglądają amatorsko | `ffmpeg loudnorm`, albo EBU R128 z 1b, albo Fairlight |
| **Speed ramp zamiast cięcia** | Zachowuje kontekst i daje rytm bez gubienia akcji | `auto-editor --edit:2 audio:-12dB --when:2 speed:1.5` |
| **Bez martwych klatek na końcu** | Widz odpływa w ostatniej sekundzie zamiast zapętlić | ostatnia klatka = pointa, nie ekran ładowania |

### Dźwięk — uczciwie

Nie mam zweryfikowanego źródła darmowej muzyki, na którym mógłbym ci obiecać bezpieczeństwo prawne
na TikToku. Trzy ścieżki, w kolejności ryzyka:

1. **Biblioteka dźwięków wewnątrz TikToka** — najbezpieczniejsza dla samej platformy, bo licencja jest
   po stronie TikToka. Minus: nie wyrenderujesz tego lokalnie, dokładasz w aplikacji.
2. **Pixabay / Freesound** — popularne wśród twórców, ale **licencja różni się plik po pliku**.
   Sprawdzaj każdy osobno, nie zakładaj, że cała biblioteka jest jednakowa.
3. **MAGNIFIC `audio_music_generate` / `audio_sfx_generate`** — masz to już podpięte, materiał jest
   generowany więc bez roszczeń, ale **kosztuje kredyty**. Odpal `simulate_cost` przed użyciem.

---

## 4. Aktualna lista — wszystko darmowe, bez znaku wodnego

**Rdzeń:**
- DaVinci Resolve (darmowa) — montaż, efekty, render
- `hiteshK03/davinci-resolve-mcp` — sterowanie Resolve przez Claude na darmowej wersji
- `wassermanproductions/unofficial-davinci-mcp` — beat grid, loudness, LUT, FCPXML (Apache-2.0)
- ffmpeg / ffprobe

**Analiza i cięcie:**
- `auto-editor` (pip) + skill `npx skills add WyattBlue/auto-editor`
- skill `npx skills add fabriqaai/ffmpeg-analyse-video-skill` — Claude ogląda klatki
- `faster-whisper` — napisy PL, lokalnie, GPU
- TransNetV2 — granice ujęć (MIT)

**Montaż pod muzykę:**
- `Merserk/BeatSync-Engine` — gęstość cięć od energii utworu, tagowanie akcji przez Qwen3-VL

**Podpięte connectory — tylko tam, gdzie nie ma znaku wodnego:**
- MAGNIFIC — `video_cut`, `video_zoom`, `video_extract_frames`, `video_extract_audio` opisane jako
  darmowe/bez AI. Reszta przez `simulate_cost`.
- OpusClip / Descript — **wyłącznie jako źródło danych** (gdzie są momenty, transkrypt).
  Ich eksporty nie idą do publikacji.

---

## 5. Kolejność wdrożenia — nie rób wszystkiego naraz

1. Zainstaluj Resolve (darmowy) i zrób ręcznie jeden short od zera. Musisz wiedzieć, jak wygląda cel,
   zanim to zautomatyzujesz.
2. Podepnij `hiteshK03/davinci-resolve-mcp`. **Policz, ile narzędzi faktycznie działa** — 44 czy 155.
   Zapisz wynik.
3. Test mostu: `auto-editor klip.mp4 --export resolve` → import do Resolve → sprawdź, czy cięcia
   trafiają tam, gdzie powinny.
4. Dopiero teraz `unofficial-davinci-mcp` i cięcie na beat.
5. BeatSync-Engine na końcu — najcięższy setup, największy zysk wizualny.

Po każdym kroku jeden gotowy short. Jeśli krok nie daje lepszego shorta niż poprzedni — wywal go.

---

## 6. Czego nie sprawdziłem

- Wszystkie trzy MCP do Resolve znam z README, nie uruchamiałem żadnego. Sprzeczność 44 vs 155
  narzędzi w 1a jest realnym ryzykiem.
- Nie wiem, czy `unofficial-davinci-mcp` i `davinci-resolve-mcp` da się mieć podpięte jednocześnie
  bez konfliktu o połączenie z Resolve. Zakładaj, że nie, dopóki nie sprawdzisz.
- Limity darmowego Resolve potwierdzone w kilku niezależnych źródłach, ale nie u samego Blackmagic
  — przy wątpliwościach sprawdź na blackmagicdesign.com.
- Licencji konkretnych plików audio nie weryfikowałem i nie zamierzam zgadywać.
