# Analiza narzędzi do automatycznego montażu klipów z gry pod TikToka/Shorts

Data researchu: 2026-09-10. Wszystkie dane pochodzą z bezpośredniego odczytu stron
GitHub (README, liczba gwiazdek, opisy) — nie są zgadywane. Tam, gdzie coś nie było
widoczne na stronie (np. dokładna data ostatniego commita), jest to zaznaczone
wprost jako „brak danych”, a nie domyślane.

## 1. Skrót — czego szukaliśmy

Cel: znaleźć gotowe narzędzia (open source, GitHub), które pomogą zamienić surowe
klipy z gry w gotowe pionowe (9:16) filmiki pod TikToka/Shorts — najlepiej
z automatycznym wykrywaniem najlepszych momentów, napisami i efektami.

## 2. Sprostowanie ważnej pomyłki

**`github.com/topics/short-game` NIE dotyczy filmów.** To temat GitHub dla
gatunku „krótkich gier” (małe gry indie, jam-game'y — np. `capybara`,
`dungeon-dance-dance`, `ultraman-rumble`). Zero związku z montażem wideo.
Warto to wiedzieć, żeby nie tracić czasu na przeszukiwanie tego tematu dalej.

## 3. Przeanalizowane repozytoria — tabela porównawcza

| Repozytorium | Do czego służy | Wejście → wyjście | Wykrywanie hitów w grze | Napisy (AI) | Wymagania | Licencja / popularność |
|---|---|---|---|---|---|---|
| [Noah-Grimaldi/auto-gaming-montage-maker](https://github.com/Noah-Grimaldi/auto-gaming-montage-maker) | Montaż konkretnie **z gier** — wykrywa killi/eliminacje/wygrane | surowy gameplay (mp4/avi/mkv/mov/wmv/flv/webm, 480p–4K) → gotowy montaż z muzyką/introem | **Tak, YOLOv8** — wytrenowane modele dla 10 gier: Fortnite, Apex, Valorant, CoD, Overwatch, Minecraft, R6 Siege, Destiny 2, PUBG, Rocket League. Skuteczność różna: CS:GO/Valorant 5/5, Overwatch/Minecraft 3/5 | Tak (Whisper) | Python 3.10, YOLOv8, OpenCV, MoviePy, FFmpeg. Ma gotowy instalator Win/Mac/Linux | Licencja nie podana wprost w README; 132 commity |
| [divyaprakash0426/autoshorts](https://github.com/divyaprakash0426/autoshorts) | Uniwersalny montaż z **dowolnego** gameplayu (nie ogranicza się do konkretnych gier) | folder z gameplayem → klipy z napisami/lektorem w output/ | Tak, ale przez AI (OpenAI/Gemini) lub tryb lokalny heurystyczny — wykrywa 7 kategorii: akcja, śmieszne, clutch, niespodzianka, fail, hype, umiejętności | Tak (Whisper) + **lektor TTS** (Qwen3-TTS, 10+ języków) | Python 3.10, PyTorch, **wymaga GPU Nvidia 6GB+ VRAM**, klucz API OpenAI/Gemini (koszt), Docker opcjonalnie | MIT, 199 ⭐, 18 forków, rozwijany aktywnie |
| [gyoridavid/short-video-maker](https://github.com/gyoridavid/short-video-maker) | Silnik **składania** gotowych elementów (TTS + napisy + tło + muzyka) w film pionowy. **Nie analizuje Twojego gameplayu** — pobiera tło z Pexels albo używasz własnych klipów | tekst/prompt (+ opcjonalnie własne klipy) → gotowy film z napisami i muzyką | Nie (to nie jest narzędzie do wycinania hitów z Twojego materiału) | Tak (Whisper.cpp) | Node.js 22+, Docker, klucz API Pexels, Remotion, FFmpeg. **Ma serwer MCP** — można podłączyć bezpośrednio do agenta AI (Claude) | MIT, **1,3k ⭐**, 423 forki, 122 commity — najdojrzalszy pod względem community |
| [mutonby/openshorts](https://github.com/mutonby/openshorts) | Najbardziej rozbudowana platforma — cięcie długich wideo na viralowe shorty + face tracking + dubbing + publikacja | długi film/URL → 3–15 gotowych shortów 9:16 z napisami, dubbingiem, hookami | Ogólne wykrywanie „momentów" przez Google Gemini (nie specyficzne dla gier) | Tak (faster-whisper) + dubbing ElevenLabs | Docker + Docker Compose, 8GB+ RAM, klucze API (Gemini, fal.ai, ElevenLabs) — self-host darmowy, ale usługi AI kosztują. **Też ma serwer MCP dla agentów** | MIT (rdzeń) + osobna licencja dla części hostingowej; **~4000 ⭐**, 1000+ forków, 419 commitów — najpopularniejszy z całej listy |
| [Segra](https://github.com/segergon/segra) *(temat `game-recording`)* | To narzędzie do **nagrywania**, nie montażu — replay buffer na bazie OBS z auto-highlightami dla CS2/LoL/Dota2 | rozgrywka na żywo → nagrane klipy | Tak, ale na etapie nagrywania, nie post-produkcji | Nie wspomniano | Wymaga OBS | 208 ⭐ |

## 4. Wspólny mianownik wszystkich narzędzi

Każde z powyższych opiera się finalnie na **FFmpeg** (cięcie/kodowanie) i w
większości na **Whisper** (automatyczne napisy). To są dwa realne, sprawdzone
elementy, które da się złożyć w prosty, własny pipeline bez instalowania całych
platform.

## 5. Ograniczenie tego środowiska (ważne, sprawdzone faktycznie)

To środowisko chmurowe (sesja Claude Code), w którym pracujemy, **nie ma**:
- GPU (`nvidia-smi` niedostępne),
- domyślnie zainstalowanego FFmpeg ani Whisper (zainstalowano je ręcznie w
  ramach tej sesji, żeby przygotować działający pipeline).

To oznacza:
- Narzędzia wymagające **GPU 6GB+ VRAM** (`autoshorts`) **nie uruchomią się
  praktycznie w tej sesji** — nadają się do uruchomienia lokalnie na Twoim
  komputerze z kartą Nvidia.
- Narzędzia oparte o **YOLOv8 + gotowe modele per gra** (`auto-gaming-montage-maker`)
  też najlepiej uruchamiać lokalnie (mają gotowy instalator Win/Mac/Linux) —
  w tej sesji dałoby się je uruchomić technicznie (CPU), ale wolno i bez
  gwarancji, że wytrenowane modele zadziałają identycznie.
- Narzędzia wymagające Docker + wiele usług (`short-video-maker`, `openshorts`)
  są ciężkie do postawienia w jednorazowej, efemerycznej sesji — mają sens jako
  **osobny, trwały serwis** (Twój komputer/serwer), niekoniecznie tutaj.

**Dlatego w tym projekcie przygotowany jest lekki, własny pipeline oparty o
FFmpeg + Whisper** (`../scripts/`), który realnie działa w tej sesji na
klipach, które mi wgrasz — bez GPU, bez kluczy API, bez Dockera. To pokrywa
podstawowe „musisz mieć": kadr 9:16, automatyczne napisy, wycinanie ciszy.

## 6. Rekomendacja (zależna od Twoich odpowiedzi — patrz pytanie w rozmowie)

- **Chcesz, żebym montował klipy bezpośrednio w tym czacie** (wgrywasz plik,
  dostajesz gotowy output) → używamy własnego pipeline'u z `scripts/`
  (FFmpeg + Whisper), inspirowanego dobrymi praktykami z powyższych projektów.
  To działa już teraz, bez dodatkowej instalacji z Twojej strony.
- **Grasz w jedną z 10 gier obsługiwanych przez `auto-gaming-montage-maker`**
  (Fortnite, Apex, Valorant, CoD, Overwatch, Minecraft, R6 Siege, Destiny 2,
  PUBG, Rocket League) i chcesz automatyczne wykrywanie killi/eliminacji z
  gotowego instalatora → warto zainstalować to narzędzie **lokalnie na swoim
  PC** (ma installer, nie wymaga configu API).
- **Chcesz uniwersalne wykrywanie „epickich momentów” niezależnie od gry**,
  masz kartę Nvidia z 6GB+ VRAM i nie przeszkadza Ci klucz API (OpenAI/Gemini)
  → `autoshorts` lokalnie na swoim PC.
- **Chcesz docelowo postawić własny, trwały serwis do masowej produkcji
  shortów** (nie tylko z gier) z dubbingiem i publikacją na social media →
  `openshorts` (najdojrzalszy, najpopularniejszy, ale najcięższy setup).
