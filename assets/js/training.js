/* Moduł treningowy: 12-tygodniowy program bieżni + trening siłowy w domu.
   Program jest ułożony pod osobę z wysoką masą ciała — zaczyna od marszu
   z nachyleniem zamiast biegu, bo przy każdym kroku biegu na staw kolanowy
   działa siła rzędu 3–4× masy ciała, a przy marszu ok. 1,2×. Bieganie
   wchodzi dopiero wtedy, gdy masa spadnie i wzmocni się aparat ruchu. */

/* MET — koszt energetyczny aktywności. Kalorie = MET × masa[kg] × czas[h].
   Wartości z Kompendium Aktywności Fizycznej (Ainsworth i wsp.). */
const MET = {
  marsz_wolny: 3.0,      // 4,0–4,5 km/h, płasko
  marsz: 3.5,            // 5,0 km/h, płasko
  marsz_szybki: 4.3,     // 5,5–6,0 km/h, płasko
  marsz_nachylenie: 5.6, // 5,0–5,5 km/h, nachylenie 4–6%
  marsz_stromy: 7.4,     // 5,0–5,5 km/h, nachylenie 8–12%
  trucht: 8.3,           // 8 km/h
  sila: 3.5              // trening oporowy początkującego, z przerwami
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
  { week: 3,  sessions: 4, minutes: 30, speed: '5,0', incline: '2%', met: 'marsz',
    desc: 'Czwarta sesja w tygodniu — i na razie NIC więcej. Dokładanie objętości i nachylenia naraz to najczęstszy moment kontuzji.' },
  { week: 4,  sessions: 4, minutes: 30, speed: '5,0', incline: '4%', met: 'marsz_nachylenie',
    desc: 'Teraz pierwsze prawdziwe nachylenie, przy niezmienionym czasie. Nie trzymaj się poręczy — to obniża koszt energetyczny o jedną trzecią.' },
  { week: 5,  sessions: 4, minutes: 35, speed: '5,0–5,5', incline: '5%', met: 'marsz_nachylenie',
    desc: 'Pierwsze interwały nachylenia: 3 minuty na 5%, 2 minuty na 2%, i tak na zmianę.' },
  { week: 6,  sessions: 4, minutes: 40, speed: '5,0–5,5', incline: '5%', met: 'marsz_nachylenie',
    desc: 'Czterdzieści minut to próg, od którego sesja realnie liczy się w tygodniowym bilansie.' },
  { week: 7,  sessions: 4, minutes: 40, speed: '5,5', incline: '6%', met: 'marsz_nachylenie',
    desc: 'Interwały: 4 minuty na 6%, 2 minuty na 2%. Oddech ma być wyraźnie przyspieszony, ale kontrolowany.' },
  { week: 8,  sessions: 3, minutes: 30, speed: '5,0', incline: '4%', met: 'marsz_nachylenie',
    desc: 'TYDZIEŃ LŻEJSZY. Mniej objętości, ta sama technika. To nie jest nagroda ani cofnięcie — regeneracja przy deficycie idzie wolniej i organizm musi nadgonić.' },
  { week: 9,  sessions: 4, minutes: 45, speed: '5,5', incline: '7%', met: 'marsz_stromy',
    desc: 'Wracamy z zapasem. Interwały: 3 minuty na 7%, 3 minuty na 2%. Jeśli waga spadła o 5+ kg, kolana już to odczuły na plus.' },
  { week: 10, sessions: 4, minutes: 45, speed: '5,5–6,0', incline: '6%', met: 'marsz_stromy',
    desc: 'Podnosimy prędkość. Trucht wprowadzaj TYLKO jeśli nie masz bólu kolan ani stóp — 1 minuta truchtu na 4 minuty marszu.' },
  { week: 11, sessions: 4, minutes: 45, speed: '6,0', incline: '4–8%', met: 'marsz_stromy',
    desc: 'Mieszane: 10 min rozgrzewki, 25 min interwałów nachylenia, 10 min schłodzenia.' },
  { week: 12, sessions: 4, minutes: 45, speed: '6,0', incline: '4–8%', met: 'marsz_stromy',
    desc: 'Tydzień sprawdzianu. Utrzymaj tempo z tygodnia 11 — po nim program zaczyna się od nowa, ale z niższą masą ciała i mocniejszymi nogami.' }
];

/* Trening siłowy — dwie sesje na zmianę (A, B), bez sprzętu.
   Obciążenie zewnętrzne: plecak z butelkami wody (1 litr = 1 kg).
   Wszystkie ćwiczenia dobrane tak, by nie było fazy lotu (skoków)
   ani pełnego obciążenia kolan w głębokim zgięciu. */
const STRENGTH = {
  A: {
    name: 'Trening A — nogi i plecy',
    exercises: [
      { name: 'Przysiad do krzesła', sets: '3 × 8–12', fig: 'przysiad',
        how: 'Stań tyłem do krzesła, opuszczaj się aż pośladki dotkną siedziska, wstań. Kolana kieruj na zewnątrz, ciężar na całej stopie — nie na samych piętach.',
        why: 'Największa grupa mięśniowa ciała — najwięcej spalonych kalorii i ochrona mięśni ud w deficycie.' },
      { name: 'Martwy ciąg z plecakiem', sets: '3 × 10–12', fig: 'ciag',
        how: 'Plecak w dłoniach, nogi lekko ugięte, plecy proste. Odchyl biodra w tył, opuść plecak do wysokości kolan, wróć napinając pośladki. Niżej schodź dopiero wtedy, gdy plecy zostają proste.',
        why: 'Wzmacnia całą tylną taśmę ciała — to ona odciąża odcinek lędźwiowy przy dużej masie brzucha.' },
      { name: 'Wiosłowanie plecakiem w opadzie', sets: '3 × 10–12', fig: 'wioslo',
        how: 'Pochyl się z prostymi plecami, plecak w obu rękach, przyciągaj go do brzucha ściągając łopatki.',
        why: 'Przeciwwaga dla siedzenia przy biurku i podstawa zdrowej postawy.' },
      { name: 'Mostek biodrowy', sets: '3 × 12–15', fig: 'mostek',
        how: 'Leż na plecach, stopy przy pośladkach. Unieś biodra, ściśnij pośladki na sekundę u góry, opuść.',
        why: 'Buduje pośladki bez żadnego obciążenia kolan.' },
      { name: 'Wznosy na palce', sets: '3 × 15–20', fig: 'palce',
        how: 'Pierwsze 4 tygodnie na płaskiej podłodze, tylko ruch w górę. Od tygodnia 5 możesz stanąć na stopniu i opuszczać pięty poniżej poziomu.',
        why: 'Łydki amortyzują każdy krok na bieżni — silniejsze łydki to mniej bólu stóp.' }
    ]
  },
  B: {
    name: 'Trening B — góra ciała i brzuch',
    exercises: [
      { name: 'Pompki o blat kuchenny', sets: '3 × 8–12', fig: 'pompki',
        how: 'Ręce na blacie szerzej niż barki, ciało w jednej linii. Im niższa powierzchnia, tym trudniej — z czasem schodź na krzesło, potem na podłogę.',
        why: 'Wersja skalowalna: te same mięśnie co klasyczne pompki, ale bez konieczności udźwignięcia całej masy ciała od pierwszego dnia.' },
      { name: 'Wyciskanie plecaka nad głowę', sets: '3 × 10–12', fig: 'wyciskanie',
        how: 'Stój prosto, plecak na wysokości klatki, wypchnij go nad głowę. Nie wyginaj pleców w łuk.',
        why: 'Barki i tricepsy — pomaga w codziennym podnoszeniu rzeczy nad głowę.' },
      { name: 'Odwodzenie ramion z butelkami', sets: '3 × 12–15', fig: 'odwodzenie',
        how: 'Butelka 1–1,5 l w każdej ręce, unoś ramiona bokiem do wysokości barków, opuszczaj powoli.',
        why: 'Stabilizuje staw barkowy — najczęściej zaniedbywany przy treningu w domu.' },
      { name: 'Deska (plank)', sets: '3 × 20–40 s', fig: 'deska',
        how: 'Na przedramionach i kolanach (wersja łatwiejsza) lub na stopach. Napnij brzuch i pośladki, biodra nie mogą opadać.',
        why: 'Uczy trzymania tułowia — bezpośrednio przekłada się na mniejsze bóle krzyża.' },
      { name: 'Marsz w miejscu z wysokim kolanem', sets: '3 × 45 s', fig: 'marsz',
        how: 'Spokojne unoszenie kolan na przemian, bez podskoków. Ręce pracują.',
        why: 'Domykający element cardio, bez fazy lotu i bez uderzenia w stawy.' }
    ]
  }
};

/* Zamienniki ćwiczeń — po trzy do każdego. Powód jest zawsze podany,
   bo "nie mogę tego zrobić" znaczy co innego przy bólu kolana, a co
   innego przy braku sprzętu. */
const ALTS = {
  przysiad: [
    { name: 'Wstawanie z krzesła bez rąk', why: 'Gdy pełny przysiad jest za ciężki — ten sam ruch, mniejszy zakres.' },
    { name: 'Przysiad przy futrynie', why: 'Trzymasz się framugi i schodzisz niżej. Ręce odciążają kolana.' },
    { name: 'Mostek biodrowy', why: 'Gdy kolana bolą — pośladki pracują bez żadnego zgięcia kolana pod obciążeniem.' }
  ],
  ciag: [
    { name: 'Martwy ciąg z reklamówką z zakupami', why: 'Gdy nie masz plecaka — działa każdy ciężar w dłoniach.' },
    { name: 'Skłon biodrowy bez obciążenia', why: 'Gdy boli krzyż — uczy samego ruchu, zanim dołożysz kilogramy.' },
    { name: 'Unoszenie tułowia leżąc na brzuchu', why: 'Gdy w ogóle nie możesz stać — prostownik grzbietu pracuje na podłodze.' }
  ],
  wioslo: [
    { name: 'Wiosłowanie jednorącz o krzesło', why: 'Gdy boli krzyż — jedna ręka na oparciu odciąża plecy.' },
    { name: 'Przyciąganie ręcznika napiętego przed sobą', why: 'Gdy nie masz nic do trzymania — napinasz ręcznik i ściągasz łopatki.' },
    { name: 'Odwodzenie ramion w opadzie z butelkami', why: 'Gdy plecak jest za ciężki — lżejszy wariant na te same mięśnie.' }
  ],
  mostek: [
    { name: 'Mostek jednonóż', why: 'Gdy wersja podstawowa jest za łatwa — dwa razy większe obciążenie.' },
    { name: 'Napinanie pośladków na stojąco', why: 'Gdy nie możesz leżeć — 20 mocnych napięć po 3 sekundy.' },
    { name: 'Odwodzenie nogi leżąc na boku', why: 'Gdy boli krzyż — pośladek średni bez ruchu kręgosłupa.' }
  ],
  palce: [
    { name: 'Wznosy na palce na płaskiej podłodze', why: 'Gdy nie masz stopnia ani progu.' },
    { name: 'Wznosy na jednej nodze', why: 'Gdy obie nogi to za mało — łydka dostaje podwójne obciążenie.' },
    { name: 'Marsz na palcach przez 30 sekund', why: 'Gdy chcesz wariant dynamiczny.' }
  ],
  pompki: [
    { name: 'Pompki o ścianę', why: 'Gdy blat jest za trudny — najłatwiejsza wersja, jaka istnieje.' },
    { name: 'Pompki na kolanach', why: 'Gdy chcesz zejść niżej, ale nie udźwigniesz jeszcze całego ciała.' },
    { name: 'Wyciskanie plecaka leżąc', why: 'Gdy boli nadgarstek — ten sam ruch bez obciążania dłoni.' }
  ],
  wyciskanie: [
    { name: 'Wyciskanie butelek nad głowę', why: 'Gdy plecak jest za ciężki.' },
    { name: 'Wyciskanie na siedząco', why: 'Gdy boli krzyż — oparcie krzesła eliminuje wyginanie pleców.' },
    { name: 'Unoszenie ramion w przód', why: 'Gdy bark nie pozwala wyjść nad głowę — mniejszy zakres.' }
  ],
  odwodzenie: [
    { name: 'Odwodzenie z jedną butelką na zmianę', why: 'Gdy obie ręce naraz są za trudne.' },
    { name: 'Odwodzenie leżąc na boku', why: 'Gdy bark boli w staniu — brak obciążenia stawu w pionie.' },
    { name: 'Krążenia ramion bez obciążenia', why: 'Gdy rozgrzewasz bark albo wracasz po przerwie.' }
  ],
  deska: [
    { name: 'Deska na kolanach', why: 'Gdy pełna deska rozjeżdża biodra po 10 sekundach.' },
    { name: 'Deska o blat kuchenny', why: 'Gdy nie chcesz schodzić na podłogę — kąt robi robotę za Ciebie.' },
    { name: 'Napinanie brzucha na leżąco', why: 'Gdy boli krzyż — dociskasz lędźwie do podłogi i trzymasz 10 sekund.' }
  ],
  marsz: [
    { name: 'Marsz w miejscu bez unoszenia kolan', why: 'Gdy biodro protestuje przy wysokim kolanie.' },
    { name: 'Wchodzenie na stopień', why: 'Gdy masz schody — więcej pracy nóg przy tym samym bezpieczeństwie.' },
    { name: '5 minut spokojnego marszu po mieszkaniu', why: 'Gdy jest naprawdę ciężki dzień. Cokolwiek bije zero.' }
  ]
};

/* Każda sesja bieżni ma tę samą ramę. Przy dużej masie ciała wejście
   od razu na nachylenie to skok ciśnienia i pełne obciążenie zimnego
   rozcięgna podeszwowego. */
const SESSION_FRAME = [
  { phase: 'Rozgrzewka', time: '5 min', what: 'Marsz 3,5–4 km/h, bez nachylenia. Ma być za łatwo.' },
  { phase: 'Część główna', time: 'wg tygodnia', what: 'Prędkość i nachylenie z planu na dany tydzień.' },
  { phase: 'Schłodzenie', time: '5 min', what: 'Marsz 3,5 km/h, nachylenie 0%. Tętno ma zejść, zanim zejdziesz z bieżni.' },
  { phase: 'Rozciąganie', time: '2 min', what: 'Łydka o ścianę i zginacz biodra w wykroku — po 30 s na stronę.' }
];

/* Progresywne przeciążenie — bez tego trening siłowy przestaje chronić
   mięśnie po ok. czterech tygodniach, czyli przestaje robić to, po co jest. */
const STRENGTH_PROGRESSION =
  'Gdy w KAŻDEJ serii zrobisz górną liczbę powtórzeń (np. 3 × 12), dołóż ' +
  'litr wody do plecaka i wróć do dolnej granicy (3 × 8). Przy ćwiczeniach ' +
  'bez obciążenia zamiast wody zmień wersję na trudniejszą — np. pompki ' +
  'z blatu na krzesło. To jedyny sposób, żeby siła dalej działała.';

/* Tygodniowy układ: bieżnia i siła nie lądują tego samego dnia, a dni
   odpoczynku są dwa — przy deficycie 500 kcal regeneracja jest wolniejsza
   i jeden dzień nie wystarcza osobie zaczynającej od zera. */
const WEEK_TEMPLATE = [
  { day: 'Poniedziałek', plan: 'Bieżnia' },
  { day: 'Wtorek', plan: 'Siła A' },
  { day: 'Środa', plan: 'Bieżnia' },
  { day: 'Czwartek', plan: 'Odpoczynek' },
  { day: 'Piątek', plan: 'Bieżnia' },
  { day: 'Sobota', plan: 'Siła B' },
  { day: 'Niedziela', plan: 'Odpoczynek lub spokojny spacer' }
];

const TRAINING_TIPS = [
  'Nie trzymaj się poręczy bieżni. Podparcie obniża koszt energetyczny nawet o jedną trzecią — wyświetlacz pokaże więcej kalorii, niż faktycznie spalisz.',
  'Licznik kalorii na bieżni zwykle zawyża, bo nie zna Twojej masy ani sprawności. Wpisy w tej aplikacji liczą się z Twojej wagi i są bliżej prawdy.',
  'Ból mięśni dzień po treningu jest normalny. Ból stawu — kolana, biodra, stopy — nie jest. Przy bólu stawu zejdź z nachylenia i skróć sesję.',
  'Trening siłowy nie spala dużo kalorii w trakcie, ale decyduje o tym, czy tracisz tłuszcz, czy mięśnie. Nie odpuszczaj go dla dłuższego cardio.',
  'Buty do biegania z amortyzacją, nie trampki. Przy Twojej masie to nie jest fanaberia, tylko ochrona ścięgna Achillesa i rozcięgna podeszwowego.',
  'Dzień odpoczynku to część planu, nie odpuszczenie. Mięsień rośnie w regeneracji, nie w trakcie serii.',
  'Jeśli ważysz się po treningu, zobaczysz spadek — to woda wypocona, wraca po wypiciu. Waż się rano, przed treningiem.',
  'Nawodnienie: przy 45 minutach marszu tracisz ok. 0,5–1 litra potu. Uzupełnij, bo odwodnienie potrafi udawać głód.',
  'Skala wysiłku 1–10: przez większość sesji trzymaj 6–7, czyli "ciężko, ale dam radę mówić krótkimi zdaniami". Powyżej 8 schodź z nachylenia.',
  'Bierzesz leki na ciśnienie? Beta-blokery zaniżają tętno, więc pomiar pulsu przestaje mówić prawdę o wysiłku. Kieruj się oddechem i skalą 1–10.',
  'Bierzesz leki na cukrzycę? Trening plus deficyt to ryzyko niedocukrzenia. Miej przy sobie coś słodkiego i nie ćwicz na zupełnie pusty żołądek.'
];
