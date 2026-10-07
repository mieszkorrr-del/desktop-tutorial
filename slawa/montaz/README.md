# Bot montażowy Sławy (wersja 1)

Robi z pionowego klipu ze streamu (kamerka u góry, gra na dole) klip według `../przepis_montazowy.yaml`:

- przekadrowanie na 1080×1920; kamerka zajmuje 40% ekranu zamiast ok. 33%,
- tekst-hook (etykieta sytuacji) od 0 s do najgłośniejszej reakcji, najwyżej 8 s; słowa w `*gwiazdkach*` są czerwone,
- zoom na grę w głośnych momentach i powiększenie twarzy w najgłośniejszym,
- opcjonalnie efekt dźwiękowy na kulminacjach (`--efekt`) i napisy z mowy (`--napisy`),
- wyrównanie głośności do -14 LUFS.

Klipów nie publikuje. Każdy obejrzyj i wrzuć sam.

## Instalacja (Windows)

1. Python 3.10+ z python.org (przy instalacji zaznacz „Add Python to PATH”).
2. ffmpeg: w terminalu `winget install ffmpeg`, potem zamknij i otwórz terminal ponownie.
3. W folderze `slawa/montaz`:
   ```
   pip install -r requirements.txt
   ```
4. Napisy (opcjonalnie): `pip install faster-whisper`. Pierwsze użycie pobiera model (model `small` to kilkaset MB).

## Użycie

```
python montuj.py "C:\ZROBIONE CLIPY CLAUDE\tututu\klip.mp4" --hook "Ale mi *PRZYKRO*"
python montuj.py klip.mp4 --hook "1 HP vs *TRZECH*" --dlugosc 22 --napisy
python montuj.py klip.mp4 --hook "Kradnę *BARONA*?" --start 3.5 --koniec 25 --efekt boom.wav
```

Wynik trafia obok źródła jako `<nazwa>_slawa.mp4`. Log techniczny zapisuje się w `montaz.log`.

| Opcja | Co robi |
|---|---|
| `--hook` | tekst na start, 2–5 słów, prawdziwy |
| `--dlugosc N` | wybiera N-sekundowy fragment z największą liczbą głośnych momentów |
| `--start` / `--koniec` | ręczne cięcie (sekundy) |
| `--efekt plik.wav` | efekt dźwiękowy na każdej kulminacji (użyj efektu, do którego masz prawa) |
| `--napisy` | napisy z mowy, po polsku, 1–3 słowa naraz, aktualne słowo na żółto; przekleństwa maskowane (np. K***A) |
| `--bez-cenzury` | napisy bez maskowania przekleństw |
| `--model medium` | dokładniejsza, ale wolniejsza transkrypcja (domyślnie `small`) |
| `--uklad` | inny plik układu (inna kamera, inny format) |

## Wiele klipów naraz (folder)

Trzy kroki:

1. **Analiza.** Bot przegląda każdy klip, wybiera najlepszy fragment (domyślnie 22 s, z największą liczbą głośnych momentów), robi transkrypcję i zapisuje plan:
   ```
   python montuj.py "C:\ścieżka\do\folderu" --analiza --dlugosc 22
   ```
   Powstają `slawa_plan.csv` i folder `slawa_transkrypcje` (pełne transkrypcje ze znacznikami czasu, pliki .txt).
2. **Plan.** W `slawa_plan.csv` (otwiera się w Excelu) dla każdego klipu ustaw `start`, `koniec` i `hook`. Klipy do pominięcia oznacz w kolumnie `status` jako `pomin`. Plan może za Ciebie uzupełnić lokalny Claude, czytając transkrypcje.
3. **Montaż wszystkiego:**
   ```
   python montuj.py --plan "C:\ścieżka\do\folderu\slawa_plan.csv"
   ```
   Gotowe klipy trafiają do podfolderu `gotowe`. Po każdym klipie bot zapisuje w planie status (`gotowe` albo `blad`), więc po przerwaniu wystarczy uruchomić to samo polecenie, a bot dokończy resztę. Klipy z `blad` próbuje ponownie.

Analizę można powtórzyć po dodaniu nowych plików: bot dopisze do planu tylko nowe klipy, a transkrypcji nie robi drugi raz.

## Logger zdarzeń z gry (najmocniejszy sygnał dla VOD)

Przed streamem uruchom w osobnym oknie PowerShell i zostaw włączony:
```
python lol_logger.py --plik "C:\stream\zdarzenia.csv"
```
W trakcie każdej gry co 2 s czyta lokalne API klienta LoL (tylko odczyt, adres 127.0.0.1:2999) i zapisuje Twoje zabójstwa, śmierci, multikille, smoki, barony i kradzieże z godziną zegarową. Potem dodaj do wyszukiwarki momentów:
```
--zdarzenia-lol "C:\stream\zdarzenia.csv" --poczatek-nagrania "2026-10-07 18:02:15"
```
`--poczatek-nagrania` to godzina startu nagrania (startu streamu), widoczna na Twitchu przy nagraniu. Logger przetestowałem na symulowanym API; na prawdziwej grze do sprawdzenia jest dopasowanie Twojej nazwy (Riot ID).

## Dziennik klipów

Każdy zmontowany klip dopisuje swoje cechy (długość, hook, liczba słów hooka, napisy, kulminacje) do `slawa_dziennik.csv` obok gotowych plików. Po 7 dniach od publikacji uzupełnij kolumny ze statystykami z TikTok Studio. Po kilkunastu klipach będzie widać, które cechy idą w parze z lepszą retencją. Porównuj grupy klipów, a nie pojedynczy wiral.

## Cały stream (VOD z Twitcha) → najlepsze momenty

1. **Pobierz nagranie i czat.**
   - Nagranie: panel twórcy na Twitchu (Producent wideo → menu przy transmisji → Pobierz) albo program TwitchDownloader (darmowy, github.com/lay295/TwitchDownloader).
   - Czat: TwitchDownloader, zakładka/komenda „chat download”, format JSON. Dokładne polecenia sprawdź w `TwitchDownloaderCLI --help`, bo zależą od wersji programu.
   - Twitch przechowuje nagrania tylko przez ograniczony czas (zależnie od statusu konta), więc pobieraj je od razu po streamie.
2. **Znajdź momenty** (głośność + wybuchy czatu, z wyprzedzeniem 45 s i 15 s po kulminacji):
   ```
   python znajdz_momenty.py "C:\stream\vod.mp4" --czat "C:\stream\czat.json" --ile 30
   ```
   Powstaje folder `vod_momenty` z 30 fragmentami (60 s każdy) i `momenty.csv` (punktacja + próbka czatu). Bez `--czat` liczy się tylko głośność.
3. **Ustaw układ kadru raz** (nagranie jest poziome, kamerka jest w rogu):
   ```
   python montuj.py "C:\stream\vod_momenty\moment_01_....mp4" --uklad uklad_vod_twitch.yaml --podglad-ukladu 20
   ```
   Otwórz powstały plik `_uklad.png` i popraw w `uklad_vod_twitch.yaml` prostokąt `kamerka` i punkt `twarz_x/twarz_y`, aż czerwona ramka obejmie kamerkę.
4. **Dalej jak zwykle** (z `--uklad uklad_vod_twitch.yaml`):
   ```
   python montuj.py "C:\stream\vod_momenty" --analiza --dlugosc 22 --uklad uklad_vod_twitch.yaml
   python montuj.py --plan "C:\stream\vod_momenty\slawa_plan.csv" --uklad uklad_vod_twitch.yaml
   ```

Wyszukiwarka znajduje **kandydatów** (głośno, czat szaleje), a nie żarty. Wybór sytuacji z puentą robi lokalny Claude z transkrypcji, a ostatnie słowo należy do Ciebie. Format czatu z TwitchDownloader (pola `content_offset_seconds`, `message.body`) sprawdziłem tylko na pliku testowym, nie na prawdziwym eksporcie.

## Kilka nagrań naraz (np. 4 streamy w jednym folderze)

```
python znajdz_momenty.py "C:\ZROBIONE CLIPY CLAUDE\tututu\live" --ile 15
python montuj.py "C:\ZROBIONE CLIPY CLAUDE\tututu\live\_momenty" --analiza --dlugosc 22 --uklad uklad_vod_twitch.yaml
(lokalny Claude uzupełnia slawa_plan.csv)
python montuj.py --plan "C:\ZROBIONE CLIPY CLAUDE\tututu\live\_momenty\slawa_plan.csv" --uklad uklad_vod_twitch.yaml --folder-wyjsciowy "C:\ZROBIONE CLIPY CLAUDE\tututu\klipy z live"
```
Czat dla każdego nagrania bot szuka sam jako `<nazwa nagrania>.json` obok pliku. Domyślnie bierze najwyżej 3 momenty na godzinę nagrania (`--max-na-godzine`), żeby kandydaci nie pochodzili z jednego głośnego fragmentu. Głośność zapisuje w `_momenty\<nagranie>.glosnosc.json`, więc ponowne uruchomienie z innymi ustawieniami jest szybkie. Analiza zapisuje też klatkę z każdego fragmentu w `slawa_klatki` (żeby było widać, w co grasz). Fragmenty ze wszystkich nagrań trafiają do jednego folderu `_momenty` z nazwą nagrania na początku. Szeroki kadr gry (więcej mapy) włącza `gra_proporcje: 1.33` w `uklad_vod_twitch.yaml`.

## Układ kadru

`uklad_pysiex.yaml` jest ustawiony pod Twoje obecne klipy 882×1568: granica kamerki i gry na 32,8% wysokości, twarz w punkcie (66%, 17%). Jeśli zmienisz układ kamerki w OBS, popraw te liczby.

## Ograniczenia (uczciwie)

- **Kulminacje to skoki głośności.** Bot nie odróżnia Twojego krzyku od wybuchu w grze i nie rozumie humoru.
- **Memów i historii (styl wzorów A i B) nie robi.** Zostają dla Ciebie albo dla wersji 2.
- Transkrypcja działa na Windowsie (sprawdzone 2026-10-07 na klipie „ale tak bezemnie”). Bot sam wczytuje dźwięk, bo faster-whisper 1.2.1 nie współpracuje z PyAV 19.
- Liczba kulminacji rośnie z długością klipu (domyślnie 4 na każde 30 s). Reszta jest przetestowana na klipie „ale mi przykro” (27,5 s, render ok. 1 min).
- Na Windowsie bot użyje czcionki Impact, a jeśli jej nie ma, Arial Bold.
