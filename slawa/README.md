# Sława: szczery doradca wzrostu dla @pysiex_

Bot, który robi to samo co aplikacje typu Blow Up (analiza kanału, pomysły, skrypty, analiza viralowych filmów, crosspost), tylko bez obiecywania viralowości i bez zmyślonych liczb. Rozdziela fakty od hipotez, mówi, czego nie wie, i nie słodzi.

## Pliki

| Plik | Co to jest |
|---|---|
| `prompt_systemowy.md` | „Mózg” bota: osobowość, zasady szczerości, tryby pracy. To jest najważniejszy plik. |
| `profil_kanalu.md` | Dane o twoim kanale. Uzupełnij je, a bot nie będzie musiał dopytywać o to samo. |
| `slawa_bot.py` | Czat w terminalu przez Claude API (opcja B). |

## Opcja A: bez programowania, w aplikacji Claude (polecana na start)

Działa na telefonie i komputerze, nie wymaga klucza API ani instalowania czegokolwiek. Potrzebny jest plan Claude, który obsługuje Projekty.

1. Na claude.ai albo w aplikacji: **Projekty → Nowy projekt**, nazwa „Sława”.
2. W **instrukcjach projektu** wklej całą treść `prompt_systemowy.md`.
3. Do **wiedzy projektu** dodaj `profil_kanalu.md` (najlepiej uzupełniony).
4. Każdą rozmowę o kanale zaczynaj w tym projekcie. Zrzuty ekranu ze statystyk możesz wrzucać prosto do czatu.

Wskazówka: jeśli w rozmowie jest włączone wyszukiwanie w sieci, bot może sprawdzać aktualne trendy i podawać źródła. Bez wyszukiwania oznacza informacje o trendach jako „do sprawdzenia”.

## Opcja B: własny bot w terminalu (Claude API)

Daje pełną kontrolę i zapisuje historię lokalnie, ale płacisz za każde zapytanie (patrz Koszty).

```bash
cd slawa
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY=twój_klucz   # Windows: setx ANTHROPIC_API_KEY twój_klucz
python slawa_bot.py
```

Klucz tworzysz w konsoli Anthropic (platform.claude.com). Nigdy nie wpisuj go do plików w repozytorium.

Komendy w czacie:

- `/obraz statystyki.png Co jest nie tak z retencją?` wysyła zrzut ekranu (PNG, JPG, GIF, WEBP, do 5 MB).
- `"""` w osobnej linii zaczyna wklejanie wielu linii (np. tabeli statystyk), a kolejne `"""` kończy.
- `/nowa` archiwizuje rozmowę i zaczyna nową.
- `/koszt` pokazuje zużycie tokenów i szacunkowy koszt sesji.
- `/pomoc` i `/wyjscie`.

Tryby bota (piszesz je jako zwykłą wiadomość, działają też w opcji A): `/audyt`, `/diagnoza`, `/pomysly`, `/skrypt`, `/viral`, `/postmortem`, `/plan`, `/crosspost`, `/ocena`.

Ustawienia przez zmienne środowiskowe:

- `SLAWA_EFFORT=low|medium|high|xhigh|max` (domyślnie `medium`). Wyższy poziom daje staranniejsze odpowiedzi, ale jest wolniejszy i droższy. Do audytów warto `high`.
- `SLAWA_MODEL` (domyślnie `claude-opus-5-5`).

Co się dzieje pod spodem:

- Historia zapisuje się w `historia.json` po każdej wymianie, atomowo, więc awaria nie uszkodzi pliku. Po ponownym uruchomieniu rozmowa toczy się dalej.
- Logi techniczne (bez treści rozmów) trafiają do `slawa.log`.
- Prompt systemowy i rozmowa są cache'owane, więc kolejne wiadomości są tańsze.
- Włączony jest serwerowy fallback (`fallbacks: "default"`): jeśli filtr bezpieczeństwa modelu omyłkowo odrzuci pytanie, API samo ponowi je na zalecanym modelu zapasowym. Bot pokaże wtedy, który model odpowiedział.
- `historia*.json` i `slawa.log` są w `.gitignore`, bo mogą zawierać twoje dane.

## Koszty (opcja B, szacunek)

Claude Opus 5.5 kosztuje 4 $ za milion tokenów wejściowych i 20 $ za milion wyjściowych (odczyt z cache: 0,20 $). Sam prompt systemowy z profilem to kilka tysięcy tokenów. Jedna wymiana w krótkiej rozmowie to orientacyjnie kilka centów, a w długiej rozmowie albo przy zrzutach ekranu więcej, bo cała historia jest wysyłana za każdym razem. Faktyczne koszty sprawdzisz w konsoli Anthropic, a w czacie orientacyjnie przez `/koszt`. Gdy rozmowa się rozrośnie, zacznij nową przez `/nowa`, a najważniejsze ustalenia przepisz do `profil_kanalu.md`.

## Uczciwie o ograniczeniach

- Bot **nie ma dostępu** do twoich kont na TikToku ani Instagramie. Widzi tylko to, co mu wkleisz albo pokażesz na zrzucie. Bez danych dostaniesz ogólniki, a z danymi konkretną diagnozę.
- Nie zna wewnętrznych wag algorytmów, bo nikt spoza platform ich nie zna. Opiera się na tym, co TikTok i Instagram same publicznie deklarują, i oznacza resztę jako hipotezy.
- Wiedza o platformach w prompcie może się zestarzeć. Jeśli platforma coś zmieni, popraw sekcję „Co wiadomo o platformach” w `prompt_systemowy.md`.
- To narzędzie do myślenia i planowania. Nagrać i wrzucić musisz sam(a), a o wyniku zdecydują widzowie.
