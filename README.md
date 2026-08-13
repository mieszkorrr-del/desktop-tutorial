# 🥗 Kuchnia — przepisy i plan redukcji

Aplikacja do gotowania i chudnięcia w jednym. Nie wymyślone „dietetyczne cuda”,
tylko normalne dania — klasyki w wersji, która mieści się w deficycie
kalorycznym — plus narzędzia, które pilnują, żeby redukcja faktycznie szła
do przodu.

Działa w przeglądarce, bez instalacji, bez konta i bez serwera.
**Otwórz plik `index.html`** — to wszystko.

## Co potrafi

### 🧊 Co mam w lodówce
Wpisujesz produkty po przecinku (`kurczak, ryż, papryka, jogurt`), wybierasz
posiłek — śniadanie, obiad, kolację, deser albo przekąskę — a aplikacja
dopasowuje przepisy i dzieli je na trzy grupy:

- **Zrobisz od ręki** — masz komplet składników,
- **Blisko** — brakuje 1–2 rzeczy (wypisanych z nazwy),
- **Warto dokupić kilka składników.**

Sól, pieprz, oliwa, czosnek i podstawowe przyprawy są zakładane z góry —
nikt nie liczy ich jako braków.

### 📖 Przepisy
32 przepisy z kaloriami i makroskładnikami na porcję. Wyszukiwarka po nazwie
i po składniku, filtry (kategoria, maks. kcal, maks. czas, tagi typu
*wysokobiałkowe*, *wegetariańskie*, *meal prep*), ulubione i przeliczanie
ilości składników przy zmianie liczby porcji. Możesz też dodawać własne
przepisy — trafiają do tej samej wyszukiwarki i do modułu lodówki.

### 📅 Plan tygodnia
Pięć posiłków na każdy dzień, z sumą kalorii i informacją, czy mieścisz się
w celu — a także ostrzeżeniem, gdy jesz **za mało** (to na redukcji równie
częsty błąd co przejadanie się). Slot może trzymać wielokrotność porcji
(1,5 porcji obiadu), więc plan da się dopasować do realnego apetytu.
Przycisk **Ułóż automatycznie** generuje tydzień celujący w Twoje
zapotrzebowanie.

### 🛒 Lista zakupów
Generowana z planu tygodnia. Te same składniki z różnych przepisów są
sumowane i przeliczane na faktyczną liczbę porcji, z odhaczaniem zakupów.

### 📈 Postępy
Dziennik wagi z wykresem, linią celu, różnicami dzień do dnia i trendem
liczonym jako **średnia z 7 dni względem poprzednich 7** — bo pojedynczy
pomiar to w dużej mierze woda, nie tłuszcz.

### 👤 Profil i wyliczenia
Na podstawie płci, wieku, wzrostu, wagi i aktywności aplikacja liczy:

- **BMR** wzorem Mifflina-St Jeora (spoczynkowa przemiana materii),
- **TDEE** (całkowite zapotrzebowanie),
- **cel kaloryczny** na redukcji — nigdy poniżej BMR,
- **makroskładniki** (białko 1,8 g/kg masy ciała, tłuszcze ~27% energii, reszta węglowodany),
- **BMI** i prognozę, kiedy osiągniesz wagę docelową.

## Dane

Wszystko zapisuje się **wyłącznie w Twojej przeglądarce** (localStorage).
Nic nie wychodzi na zewnątrz. Minus tego rozwiązania: wyczyszczenie danych
przeglądarki kasuje historię — w zakładce **Profil** jest eksport i import
kopii zapasowej w JSON. Rób ją co jakiś czas.

## Struktura

```
index.html            interfejs i widoki
assets/css/style.css  style (jasny i ciemny motyw)
assets/js/data.js     przepisy, wskazówki, słownik składników
assets/js/store.js    zapis danych + kalkulacje (BMR, TDEE, makro, trend)
assets/js/app.js      logika widoków, dopasowanie z lodówki, plan, zakupy
```

Czysty HTML/CSS/JS — bez frameworków, bez zależności, bez kroku budowania.

## Zastrzeżenie

Wartości odżywcze przepisów to szacunki liczone ze standardowych gramatur
produktów — dobre przybliżenie (±10%), nie pomiar laboratoryjny. Wzory na
zapotrzebowanie potrafią mylić się o 10–15%, dlatego realną weryfikacją jest
zmiana wagi w czasie — stąd dziennik.

To narzędzie organizacyjne, nie porada medyczna. Przy chorobach przewlekłych,
przyjmowanych lekach, ciąży lub planowanym dużym deficycie skonsultuj plan
z lekarzem albo dietetykiem klinicznym.
