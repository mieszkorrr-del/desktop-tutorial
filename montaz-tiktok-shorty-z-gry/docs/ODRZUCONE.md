# Świadomie odrzucone — nie proponować ponownie

Log narzędzi/kroków, które rozważaliśmy i odrzuciliśmy, z powodem. Cel: nie wracać
do tych samych ślepych uliczek w kolejnych sesjach.

| Narzędzie / krok | Powód odrzucenia | Źródło decyzji |
|---|---|---|
| `Noah-Grimaldi/auto-gaming-montage-maker` | Modele YOLOv8 wytrenowane pod kill-feedy 10 konkretnych strzelanek (Fortnite, Apex, Valorant, CoD, Overwatch, R6, Destiny 2, PUBG, Rocket League, Minecraft). W RPG/singleplayer bez kill-feedu nie ma czego wykrywać. | BRIEF-MONTAZ-TIKTOK.md §6 |
| `github.com/topics/short-game` | Temat GitHub o gatunku krótkich gier (indie/jam), zero związku z montażem wideo. | BRIEF-MONTAZ-TIKTOK.md §6 |
| Segra (`topics/game-recording`) | To nagrywarka (klon OBS z replay bufferem), nie narzędzie montażu. | BRIEF-MONTAZ-TIKTOK.md §6 |
| `xixihhhh/hotclip` | Highlighty wykrywa z **mowy** — bezużyteczne przy gameplayu bez komentarza. ASR nastawiony pod chiński. MCP server jest dopiero w roadmapie v0.8, nie istnieje jeszcze w repo. | BRIEF-MONTAZ-TIKTOK.md §6 |
| `browser-use/video-use` | Dobry skill do Claude Code, ale logika opiera się na wycinaniu wypełniaczy ("ymm/eee") z transkryptu mowy — działa dla gadających głów, nie dla gameplayu. Instalacja dodatkowo wymaga `brew` + klucza ElevenLabs. | BRIEF-MONTAZ-TIKTOK.md §6 |
| `computerlovetech/video-edit-cli` jako zależność | Koncepcyjnie najlepszy wzorzec (edit plan JSON z polem `reason` per cięcie), ale repo ma 0 gwiazdek i README wprost mówi "Windows is untested; use WSL" — nie instalujemy jako zależności, tylko kopiujemy wzorzec JSON do własnego `montaz.py`. | BRIEF-MONTAZ-TIKTOK.md §2.3 |
| Zbudowanie wszystkiego czysto w Pythonie/ffmpeg (zoom punch, animowany tekst, tranzycje) | Zmiana architektury: DaVinci Resolve (darmowy) robi to lepiej i szybciej niż ręczne filtry ffmpeg — walka z keyframe'ami zoomu w samym ffmpeg to strata czasu, skoro Resolve ma to wbudowane za darmo. | STACK-DARMOWY-v2.md §2 |
| OpusClip / Descript jako źródło publikowanego renderu | Darmowe plany nakładają znak wodny / liczą minuty — sprzeczne z twardym ograniczeniem "zero znaków wodnych, zero limitów". Zostają wyłącznie jako narzędzia analizy (transkrypt, momenty), nie jako źródło pliku do publikacji. | STACK-DARMOWY-v2.md §4 |
| Kroki 3, 5, 6 z briefu (MCP do Resolve, `unofficial-davinci-mcp`, `BeatSync-Engine`) w sesji chmurowej | Wymagają realnie działającego DaVinci Resolve (GUI) i/lub GPU NVIDIA. Ta sesja to headless kontener Linux bez GPU i bez Resolve — strukturalnie niewykonalne tutaj, nie kwestia braku czasu. Do wykonania w lokalnej sesji Claude Code na Windowsie. | Ustalone w tej sesji, 10.09.2026 |
| `divyaprakash0426/autoshorts` | **Zweryfikowane bezpośrednio w README repo, nie domysł:** wymaga wprost `"NVIDIA GPU with CUDA support"`, `"CUDA Toolkit with nvcc"`, pakietu `cupy` (CUDA-accelerated NumPy, brak odpowiednika ROCm w projekcie) i NVENC do renderu; Docker odpalany przez `docker run --gpus all` (NVIDIA Container Toolkit). Zero wzmianek o AMD/ROCm w całym repozytorium. Potwierdzone GPU w tym projekcie to **AMD Radeon RX 9070 XT** — niekompatybilne bez przepisania backendu GPU, nie próbować obchodzić. | Zweryfikowane w tej sesji, 10.09.2026 (wcześniej błędnie wpisane jako "prawdopodobnie nie zadziała" — poprawione po realnym sprawdzeniu README) |
