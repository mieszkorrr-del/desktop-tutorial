/* Moduł treningowy: 12-tygodniowy program bieżni + trening siłowy w domu.
   Program jest ułożony pod osobę z wysoką masą ciała — zaczyna od marszu
   z nachyleniem zamiast biegu, bo przy każdym kroku biegu na staw kolanowy
   działa siła rzędu 3–4× masy ciała, a przy marszu ok. 1,2×. Bieganie
   wchodzi dopiero wtedy, gdy masa spadnie i wzmocni się aparat ruchu. */

/* MET — koszt energetyczny aktywności. Kalorie = MET × masa[kg] × czas[h].
   Wartości z Kompendium Aktywności Fizycznej (Ainsworth i wsp.). */
const MET = {
  marsz_wolny: 3.0,      // 4,0–4,5 km/h, płasko
  marsz: 3.8,            // 5,0 km/h, płasko
  marsz_szybki: 5.0,     // 5,5–6,0 km/h, płasko
  marsz_nachylenie: 6.3, // 5,0–5,5 km/h, nachylenie 4–6%
  marsz_stromy: 8.0,     // 5,0 km/h, nachylenie 8–12%
  trucht: 8.3,           // 8 km/h
  sila: 5.0              // trening oporowy w umiarkowanym tempie
};

/* 12 tygodni progresji. Każdy tydzień: liczba sesji, czas, prędkość,
   nachylenie i opis. Progresja idzie najpierw czasem, potem nachyleniem,
   a dopiero na końcu prędkością — to kolejność najbezpieczniejsza
   dla stawów. */
const TREADMILL = [
  { week: 1,  sessions: 3, minutes: 25, speed: '4,5–5,0', incline: '2%', met: 'marsz',
    desc: 'Wchodzenie w rytm. Masz móc swobodnie rozmawiać przez cały czas — jeśli nie możesz, zwolnij.' },
  { week: 2,  sessions: 3, minutes: 30, speed: '4,5–5,0', incline: '2%', met: 'marsz',
    desc: 'Ten sam wysiłek, 5 minut dłużej. Nic więcej nie zmieniamy.' },
  { week: 3,  sessions: 4, minutes: 30, speed: '5,0', incline: '4%', met: 'marsz_nachylenie',
    desc: 'Czwarta sesja w tygodniu i pierwsze prawdziwe nachylenie. Nie trzymaj się poręczy — to obniża koszt energetyczny o jedną trzecią.' },
  { week: 4,  sessions: 4, minutes: 35, speed: '5,0', incline: '4%', met: 'marsz_nachylenie',
    desc: 'Utrwalamy. Jeśli tydzień 3 był ciężki, powtórz go zamiast iść dalej — to nie jest cofanie się.' },
  { week: 5,  sessions: 4, minutes: 35, speed: '5,0–5,5', incline: '5%', met: 'marsz_nachylenie',
    desc: 'Pierwsze interwały nachylenia: 3 minuty na 5%, 2 minuty na 2%, i tak na zmianę.' },
  { week: 6,  sessions: 4, minutes: 40, speed: '5,0–5,5', incline: '5%', met: 'marsz_nachylenie',
    desc: 'Czterdzieści minut to próg, od którego sesja realnie liczy się w tygodniowym bilansie.' },
  { week: 7,  sessions: 4, minutes: 40, speed: '5,5', incline: '6%', met: 'marsz_nachylenie',
    desc: 'Interwały: 4 minuty na 6%, 2 minuty na 2%. Oddech ma być wyraźnie przyspieszony, ale kontrolowany.' },
  { week: 8,  sessions: 4, minutes: 40, speed: '5,5', incline: '8%', met: 'marsz_stromy',
    desc: 'Ostre podbiegi marszem: 3 minuty na 8%, 3 minuty na 2%. To spala więcej niż trucht i nie obciąża kolan.' },
  { week: 9,  sessions: 4, minutes: 45, speed: '5,5', incline: '6–8%', met: 'marsz_stromy',
    desc: 'Najdłuższe sesje programu. Jeśli waga spadła o 5+ kg, kolana już to odczuły na plus.' },
  { week: 10, sessions: 4, minutes: 45, speed: '5,5–6,0', incline: '6%', met: 'marsz_stromy',
    desc: 'Podnosimy prędkość. Trucht wprowadzaj TYLKO jeśli nie masz bólu kolan ani stóp — 1 minuta truchtu na 4 minuty marszu.' },
  { week: 11, sessions: 4, minutes: 45, speed: '6,0', incline: '4–8%', met: 'marsz_stromy',
    desc: 'Mieszane: 10 min rozgrzewki, 25 min interwałów nachylenia, 10 min schłodzenia.' },
  { week: 12, sessions: 5, minutes: 45, speed: '6,0', incline: '4–8%', met: 'marsz_stromy',
    desc: 'Tydzień sprawdzianu. Piąta sesja i utrzymanie tempa — po nim program zaczyna się od nowa, ale z niższą masą ciała.' }
];

/* Trening siłowy — dwie sesje na zmianę (A, B), bez sprzętu.
   Obciążenie zewnętrzne: plecak z butelkami wody (1 litr = 1 kg).
   Wszystkie ćwiczenia dobrane tak, by nie było fazy lotu (skoków)
   ani pełnego obciążenia kolan w głębokim zgięciu. */
const STRENGTH = {
  A: {
    name: 'Trening A — nogi i plecy',
    exercises: [
      { name: 'Przysiad do krzesła', sets: '3 × 8–12',
        how: 'Stań tyłem do krzesła, opuszczaj się aż pośladki dotkną siedziska, wstań. Kolana kieruj na zewnątrz, ciężar na piętach.',
        why: 'Największa grupa mięśniowa ciała — najwięcej spalonych kalorii i ochrona mięśni ud w deficycie.' },
      { name: 'Martwy ciąg z plecakiem', sets: '3 × 10–12',
        how: 'Plecak w dłoniach, nogi lekko ugięte, plecy proste. Odchyl biodra w tył, opuść plecak do połowy goleni, wróć napinając pośladki.',
        why: 'Wzmacnia całą tylną taśmę ciała — to ona odciąża odcinek lędźwiowy przy dużej masie brzucha.' },
      { name: 'Wiosłowanie plecakiem w opadzie', sets: '3 × 10–12',
        how: 'Pochyl się z prostymi plecami, plecak w obu rękach, przyciągaj go do brzucha ściągając łopatki.',
        why: 'Przeciwwaga dla siedzenia przy biurku i podstawa zdrowej postawy.' },
      { name: 'Mostek biodrowy', sets: '3 × 12–15',
        how: 'Leż na plecach, stopy przy pośladkach. Unieś biodra, ściśnij pośladki na sekundę u góry, opuść.',
        why: 'Buduje pośladki bez żadnego obciążenia kolan.' },
      { name: 'Wznosy na palce', sets: '3 × 15–20',
        how: 'Stań na stopniu lub progu, opuść pięty poniżej poziomu, unieś się wysoko.',
        why: 'Łydki amortyzują każdy krok na bieżni — silniejsze łydki to mniej bólu stóp.' }
    ]
  },
  B: {
    name: 'Trening B — góra ciała i brzuch',
    exercises: [
      { name: 'Pompki o blat kuchenny', sets: '3 × 8–12',
        how: 'Ręce na blacie szerzej niż barki, ciało w jednej linii. Im niższa powierzchnia, tym trudniej — z czasem schodź na krzesło, potem na podłogę.',
        why: 'Wersja skalowalna: te same mięśnie co klasyczne pompki, ale bez konieczności udźwignięcia całej masy ciała od pierwszego dnia.' },
      { name: 'Wyciskanie plecaka nad głowę', sets: '3 × 10–12',
        how: 'Stój prosto, plecak na wysokości klatki, wypchnij go nad głowę. Nie wyginaj pleców w łuk.',
        why: 'Barki i tricepsy — pomaga w codziennym podnoszeniu rzeczy nad głowę.' },
      { name: 'Odwodzenie ramion z butelkami', sets: '3 × 12–15',
        how: 'Butelka 1–1,5 l w każdej ręce, unoś ramiona bokiem do wysokości barków, opuszczaj powoli.',
        why: 'Stabilizuje staw barkowy — najczęściej zaniedbywany przy treningu w domu.' },
      { name: 'Deska (plank)', sets: '3 × 20–40 s',
        how: 'Na przedramionach i kolanach (wersja łatwiejsza) lub na stopach. Napnij brzuch i pośladki, biodra nie mogą opadać.',
        why: 'Uczy trzymania tułowia — bezpośrednio przekłada się na mniejsze bóle krzyża.' },
      { name: 'Marsz w miejscu z wysokim kolanem', sets: '3 × 45 s',
        how: 'Spokojne unoszenie kolan na przemian, bez podskoków. Ręce pracują.',
        why: 'Domykający element cardio, bez fazy lotu i bez uderzenia w stawy.' }
    ]
  }
};

/* Tygodniowy układ: bieżnia + siła nie powinny lądować tego samego dnia
   na starcie, bo regeneracja przy deficycie jest wolniejsza. */
const WEEK_TEMPLATE = [
  { day: 'Poniedziałek', plan: 'Bieżnia' },
  { day: 'Wtorek', plan: 'Siła A' },
  { day: 'Środa', plan: 'Bieżnia' },
  { day: 'Czwartek', plan: 'Odpoczynek lub spacer' },
  { day: 'Piątek', plan: 'Bieżnia' },
  { day: 'Sobota', plan: 'Siła B' },
  { day: 'Niedziela', plan: 'Bieżnia lub odpoczynek' }
];

const TRAINING_TIPS = [
  'Nie trzymaj się poręczy bieżni. Podparcie obniża koszt energetyczny nawet o jedną trzecią — wyświetlacz pokaże więcej kalorii, niż faktycznie spalisz.',
  'Licznik kalorii na bieżni zwykle zawyża, bo nie zna Twojej masy ani sprawności. Wpisy w tej aplikacji liczą się z Twojej wagi i są bliżej prawdy.',
  'Ból mięśni dzień po treningu jest normalny. Ból stawu — kolana, biodra, stopy — nie jest. Przy bólu stawu zejdź z nachylenia i skróć sesję.',
  'Trening siłowy nie spala dużo kalorii w trakcie, ale decyduje o tym, czy tracisz tłuszcz, czy mięśnie. Nie odpuszczaj go dla dłuższego cardio.',
  'Buty do biegania z amortyzacją, nie trampki. Przy Twojej masie to nie jest fanaberia, tylko ochrona ścięgna Achillesa i rozcięgna podeszwowego.',
  'Dzień odpoczynku to część planu, nie odpuszczenie. Mięsień rośnie w regeneracji, nie w trakcie serii.',
  'Jeśli ważysz się po treningu, zobaczysz spadek — to woda wypocona, wraca po wypiciu. Waż się rano, przed treningiem.',
  'Nawodnienie: przy 45 minutach marszu tracisz ok. 0,5–1 litra potu. Uzupełnij, bo odwodnienie potrafi udawać głód.'
];
