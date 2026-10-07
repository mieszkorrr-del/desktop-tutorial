# Bot montażowy Sławy (wersja 1)

Robi z pionowego klipu ze streamu (kamerka u góry, gra na dole) klip według `../przepis_montazowy.yaml`:

- przekadrowanie na 1080×1920; kamerka zajmuje 40% ekranu zamiast ok. 33%,
- tekst-hook na pierwsze 1,8 s; słowa w `*gwiazdkach*` są czerwone,
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
| `--dlugosc N` | tnie do N sekund wokół najgłośniejszego momentu |
| `--start` / `--koniec` | ręczne cięcie (sekundy) |
| `--efekt plik.wav` | efekt dźwiękowy na każdej kulminacji (użyj efektu, do którego masz prawa) |
| `--napisy` | napisy z mowy, po polsku, 1–3 słowa naraz; przekleństwa maskowane (np. K***A) |
| `--bez-cenzury` | napisy bez maskowania przekleństw |
| `--model medium` | dokładniejsza, ale wolniejsza transkrypcja (domyślnie `small`) |
| `--uklad` | inny plik układu (inna kamera, inny format) |

## Układ kadru

`uklad_pysiex.yaml` jest ustawiony pod Twoje obecne klipy 882×1568: granica kamerki i gry na 32,8% wysokości, twarz w punkcie (66%, 17%). Jeśli zmienisz układ kamerki w OBS, popraw te liczby.

## Ograniczenia (uczciwie)

- **Kulminacje to skoki głośności.** Bot nie odróżnia Twojego krzyku od wybuchu w grze i nie rozumie humoru.
- **Memów i historii (styl wzorów A i B) nie robi.** Zostają dla Ciebie albo dla wersji 2.
- Transkrypcja działa na Windowsie (sprawdzone 2026-10-07 na klipie „ale tak bezemnie”). Bot sam wczytuje dźwięk, bo faster-whisper 1.2.1 nie współpracuje z PyAV 19.
- Liczba kulminacji rośnie z długością klipu (domyślnie 4 na każde 30 s). Reszta jest przetestowana na klipie „ale mi przykro” (27,5 s, render ok. 1 min).
- Na Windowsie bot użyje czcionki Impact, a jeśli jej nie ma, Arial Bold.
