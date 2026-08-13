/* Baza przepisów — klasyczne, realne dania w wersji sprzyjającej redukcji.
   Wartości odżywcze to szacunki na 1 porcję, liczone ze standardowych
   gramatur produktów (tabele wartości odżywczych). Traktuj je jako
   dobre przybliżenie (±10%), nie jako pomiar laboratoryjny. */

const MEALS = {
  sniadanie: 'Śniadanie',
  obiad: 'Obiad',
  kolacja: 'Kolacja',
  deser: 'Deser',
  przekaska: 'Przekąska'
};

const RECIPES = [
  {
    id: 'owsianka-proteinowa',
    name: 'Owsianka proteinowa z jagodami',
    meal: 'sniadanie',
    time: 10,
    servings: 1,
    kcal: 385, protein: 28, fat: 9, carbs: 51,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'szybkie'],
    ingredients: [
      { name: 'płatki owsiane górskie', qty: 50, unit: 'g' },
      { name: 'mleko 1,5%', qty: 200, unit: 'ml' },
      { name: 'odżywka białkowa waniliowa', qty: 25, unit: 'g' },
      { name: 'jagody (mogą być mrożone)', qty: 80, unit: 'g' },
      { name: 'siemię lniane mielone', qty: 5, unit: 'g' }
    ],
    steps: [
      'Płatki zalej mlekiem i gotuj 4–5 minut na małym ogniu, mieszając.',
      'Zdejmij z ognia i odstaw na 2 minuty, żeby lekko przestygło.',
      'Wmieszaj odżywkę białkową (do gorącego się zwarzy — dlatego czekamy).',
      'Dodaj jagody i siemię lniane.'
    ],
    tip: 'Białko rano najmocniej tłumi głód w ciągu dnia — to jedno z najlepiej udokumentowanych zjawisk w redukcji.'
  },
  {
    id: 'jajecznica-szpinak',
    name: 'Jajecznica ze szpinakiem i pomidorkami',
    meal: 'sniadanie',
    time: 12,
    servings: 1,
    kcal: 330, protein: 24, fat: 21, carbs: 9,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'bezglutenowe', 'szybkie'],
    ingredients: [
      { name: 'jajka', qty: 3, unit: 'szt' },
      { name: 'szpinak świeży', qty: 100, unit: 'g' },
      { name: 'pomidorki koktajlowe', qty: 100, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 5, unit: 'ml' },
      { name: 'sól, pieprz', qty: 1, unit: 'szczypta' }
    ],
    steps: [
      'Na patelni rozgrzej oliwę, wrzuć przekrojone pomidorki, smaż 2 minuty.',
      'Dodaj szpinak i smaż, aż zwiędnie (ok. 1 minuta).',
      'Wlej roztrzepane jajka i mieszaj na małym ogniu do ścięcia.',
      'Dopraw solą i pieprzem.'
    ],
    tip: 'Dwie duże garście warzyw kosztują ~25 kcal, a wypełniają talerz i żołądek.'
  },
  {
    id: 'twarog-rzodkiewka',
    name: 'Twaróg z rzodkiewką i szczypiorkiem',
    meal: 'sniadanie',
    time: 8,
    servings: 1,
    kcal: 335, protein: 32, fat: 8, carbs: 33,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'twaróg półtłusty', qty: 150, unit: 'g' },
      { name: 'jogurt naturalny', qty: 30, unit: 'g' },
      { name: 'rzodkiewki', qty: 60, unit: 'g' },
      { name: 'szczypiorek', qty: 10, unit: 'g' },
      { name: 'chleb żytni razowy', qty: 60, unit: 'g' }
    ],
    steps: [
      'Twaróg rozgnieć widelcem z jogurtem.',
      'Rzodkiewki pokrój w plasterki, szczypiorek posiekaj.',
      'Wymieszaj, dopraw solą i pieprzem.',
      'Podawaj z kromkami chleba żytniego.'
    ],
    tip: 'Chleb żytni na zakwasie ma niższy indeks glikemiczny niż pszenny — dłużej trzyma sytość.'
  },
  {
    id: 'omlet-indyk',
    name: 'Omlet z indykiem i papryką',
    meal: 'sniadanie',
    time: 15,
    servings: 1,
    kcal: 355, protein: 38, fat: 18, carbs: 8,
    tags: ['wysokobiałkowe', 'bezglutenowe'],
    ingredients: [
      { name: 'jajka', qty: 3, unit: 'szt' },
      { name: 'pierś z indyka (wędzona lub gotowana)', qty: 60, unit: 'g' },
      { name: 'papryka czerwona', qty: 100, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 5, unit: 'ml' },
      { name: 'szczypiorek', qty: 10, unit: 'g' }
    ],
    steps: [
      'Paprykę pokrój w kostkę i podsmaż na oliwie 3 minuty.',
      'Dodaj pokrojonego indyka, smaż minutę.',
      'Zalej roztrzepanymi jajkami, smaż pod przykryciem na małym ogniu 5–6 minut.',
      'Posyp szczypiorkiem i złóż na pół.'
    ]
  },
  {
    id: 'skyr-owoce',
    name: 'Skyr z owocami i orzechami',
    meal: 'sniadanie',
    time: 5,
    servings: 1,
    kcal: 305, protein: 29, fat: 11, carbs: 24,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'bezglutenowe', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'skyr naturalny', qty: 200, unit: 'g' },
      { name: 'maliny lub truskawki', qty: 100, unit: 'g' },
      { name: 'orzechy włoskie', qty: 15, unit: 'g' },
      { name: 'miód', qty: 5, unit: 'g' }
    ],
    steps: [
      'Skyr przełóż do miski.',
      'Dodaj owoce i posiekane orzechy.',
      'Skrop miodem.'
    ],
    tip: 'Skyr ma ok. 11 g białka na 100 g przy ~60 kcal — trudno o lepszy stosunek na redukcji.'
  },
  {
    id: 'pasta-awokado',
    name: 'Kanapki z pastą z awokado i jajkiem',
    meal: 'sniadanie',
    time: 12,
    servings: 1,
    kcal: 400, protein: 20, fat: 21, carbs: 34,
    tags: ['wegetariańskie'],
    ingredients: [
      { name: 'chleb żytni razowy', qty: 60, unit: 'g' },
      { name: 'awokado', qty: 70, unit: 'g' },
      { name: 'jajka', qty: 2, unit: 'szt' },
      { name: 'sok z cytryny', qty: 5, unit: 'ml' },
      { name: 'rzodkiewki', qty: 40, unit: 'g' }
    ],
    steps: [
      'Jajka ugotuj na twardo (9 minut), ostudź i obierz.',
      'Awokado rozgnieć z sokiem z cytryny, solą i pieprzem.',
      'Posmaruj chleb pastą, ułóż plastry jajka i rzodkiewki.'
    ]
  },

  {
    id: 'kurczak-kasza',
    name: 'Pierś z kurczaka z warzywami i kaszą gryczaną',
    meal: 'obiad',
    time: 30,
    servings: 2,
    kcal: 520, protein: 47, fat: 14, carbs: 52,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'klasyk'],
    ingredients: [
      { name: 'pierś z kurczaka', qty: 300, unit: 'g' },
      { name: 'kasza gryczana (sucha)', qty: 100, unit: 'g' },
      { name: 'brokuł', qty: 300, unit: 'g' },
      { name: 'marchewka', qty: 150, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'czosnek', qty: 2, unit: 'ząbki' },
      { name: 'papryka słodka, sól, pieprz', qty: 1, unit: 'szczypta' }
    ],
    steps: [
      'Kaszę ugotuj w osolonej wodzie (ok. 15 minut), odcedź.',
      'Kurczaka pokrój w paski, dopraw papryką, solą i pieprzem.',
      'Smaż na oliwie z czosnkiem 6–8 minut, aż się zarumieni.',
      'Brokuł i marchewkę ugotuj na parze 6 minut — mają zostać jędrne.',
      'Połącz na talerzu.'
    ],
    tip: 'Gotowanie na parze zamiast smażenia warzyw oszczędza ok. 100 kcal na porcję.'
  },
  {
    id: 'losos-brokuly',
    name: 'Łosoś pieczony z brokułami i ziemniakami',
    meal: 'obiad',
    time: 35,
    servings: 2,
    kcal: 550, protein: 42, fat: 24, carbs: 42,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'omega-3'],
    ingredients: [
      { name: 'filet z łososia', qty: 300, unit: 'g' },
      { name: 'ziemniaki', qty: 400, unit: 'g' },
      { name: 'brokuł', qty: 300, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'cytryna', qty: 0.5, unit: 'szt' },
      { name: 'koperek', qty: 10, unit: 'g' }
    ],
    steps: [
      'Piekarnik nagrzej do 200°C.',
      'Ziemniaki pokrój w ćwiartki, wymieszaj z oliwą i solą, piecz 25 minut.',
      'Po 10 minutach dołóż łososia skropionego cytryną — piecz 15 minut.',
      'Brokuł ugotuj na parze 6 minut.',
      'Posyp koperkiem.'
    ],
    tip: 'Tłuste ryby 2× w tygodniu to jedna z niewielu rekomendacji, co do których wszystkie towarzystwa naukowe są zgodne.'
  },
  {
    id: 'chili-indyk',
    name: 'Chili con carne z indykiem',
    meal: 'obiad',
    time: 40,
    servings: 4,
    kcal: 480, protein: 42, fat: 12, carbs: 48,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'meal prep'],
    ingredients: [
      { name: 'mielone mięso z indyka', qty: 600, unit: 'g' },
      { name: 'fasola czerwona z puszki', qty: 400, unit: 'g' },
      { name: 'pomidory krojone z puszki', qty: 800, unit: 'g' },
      { name: 'kukurydza z puszki', qty: 200, unit: 'g' },
      { name: 'cebula', qty: 150, unit: 'g' },
      { name: 'czosnek', qty: 3, unit: 'ząbki' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'chili, kmin rzymski, papryka wędzona', qty: 2, unit: 'łyżeczki' }
    ],
    steps: [
      'Cebulę i czosnek podsmaż na oliwie 3 minuty.',
      'Dodaj mięso i smaż, rozdrabniając, aż straci różowy kolor.',
      'Wsyp przyprawy, wymieszaj, smaż minutę — aromat się otworzy.',
      'Wlej pomidory, dodaj odsączoną fasolę i kukurydzę.',
      'Duś pod przykryciem 25 minut, mieszając co jakiś czas.'
    ],
    tip: 'Idealne na meal prep — po 2 dniach w lodówce smakuje lepiej niż pierwszego dnia.'
  },
  {
    id: 'gulasz-indyk',
    name: 'Gulasz z indyka z warzywami',
    meal: 'obiad',
    time: 45,
    servings: 4,
    kcal: 450, protein: 44, fat: 11, carbs: 42,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'meal prep'],
    ingredients: [
      { name: 'udziec z indyka bez kości', qty: 700, unit: 'g' },
      { name: 'papryka czerwona', qty: 300, unit: 'g' },
      { name: 'cukinia', qty: 300, unit: 'g' },
      { name: 'cebula', qty: 150, unit: 'g' },
      { name: 'passata pomidorowa', qty: 400, unit: 'g' },
      { name: 'kasza pęczak (sucha)', qty: 160, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'majeranek, papryka słodka', qty: 2, unit: 'łyżeczki' }
    ],
    steps: [
      'Mięso pokrój w kostkę, obsmaż na oliwie na dużym ogniu.',
      'Dodaj cebulę, po 3 minutach paprykę i cukinię.',
      'Wlej passatę, dopraw, duś 30 minut na małym ogniu.',
      'Kaszę ugotuj osobno i podawaj z gulaszem.'
    ]
  },
  {
    id: 'kotlety-indyk-piekarnik',
    name: 'Kotlety mielone z indyka z piekarnika + surówka',
    meal: 'obiad',
    time: 40,
    servings: 3,
    kcal: 470, protein: 45, fat: 15, carbs: 36,
    tags: ['wysokobiałkowe', 'klasyk'],
    ingredients: [
      { name: 'mielone mięso z indyka', qty: 500, unit: 'g' },
      { name: 'jajko', qty: 1, unit: 'szt' },
      { name: 'bułka tarta', qty: 40, unit: 'g' },
      { name: 'cebula', qty: 100, unit: 'g' },
      { name: 'ziemniaki', qty: 450, unit: 'g' },
      { name: 'kapusta biała', qty: 300, unit: 'g' },
      { name: 'marchewka', qty: 100, unit: 'g' },
      { name: 'jogurt naturalny', qty: 60, unit: 'g' }
    ],
    steps: [
      'Mięso wymieszaj z jajkiem, bułką tartą i startą cebulą, dopraw.',
      'Formuj kotlety i układaj na blasze z papierem.',
      'Piecz 25 minut w 200°C, obracając w połowie.',
      'Ziemniaki ugotuj. Kapustę i marchewkę poszatkuj, wymieszaj z jogurtem.'
    ],
    tip: 'Pieczenie zamiast smażenia na tłuszczu to tu różnica ok. 150 kcal na porcję.'
  },
  {
    id: 'makaron-tunczyk',
    name: 'Makaron pełnoziarnisty z tuńczykiem i pomidorami',
    meal: 'obiad',
    time: 20,
    servings: 2,
    kcal: 520, protein: 38, fat: 12, carbs: 62,
    tags: ['wysokobiałkowe', 'szybkie'],
    ingredients: [
      { name: 'makaron pełnoziarnisty (suchy)', qty: 140, unit: 'g' },
      { name: 'tuńczyk w sosie własnym', qty: 300, unit: 'g' },
      { name: 'pomidory krojone z puszki', qty: 400, unit: 'g' },
      { name: 'czosnek', qty: 2, unit: 'ząbki' },
      { name: 'oliwa z oliwek', qty: 10, unit: 'ml' },
      { name: 'natka pietruszki', qty: 15, unit: 'g' }
    ],
    steps: [
      'Makaron ugotuj al dente.',
      'Czosnek podsmaż na oliwie 30 sekund, dodaj pomidory, gotuj 8 minut.',
      'Dodaj odsączonego tuńczyka, wymieszaj, podgrzej 2 minuty.',
      'Połącz z makaronem, posyp natką.'
    ]
  },
  {
    id: 'curry-ciecierzyca',
    name: 'Curry z ciecierzycą i szpinakiem',
    meal: 'obiad',
    time: 30,
    servings: 3,
    kcal: 460, protein: 19, fat: 16, carbs: 60,
    tags: ['wegetariańskie', 'wegańskie', 'bezglutenowe', 'meal prep'],
    ingredients: [
      { name: 'ciecierzyca z puszki', qty: 480, unit: 'g' },
      { name: 'mleko kokosowe light', qty: 200, unit: 'ml' },
      { name: 'pomidory krojone z puszki', qty: 400, unit: 'g' },
      { name: 'szpinak świeży', qty: 200, unit: 'g' },
      { name: 'ryż brązowy (suchy)', qty: 120, unit: 'g' },
      { name: 'cebula', qty: 150, unit: 'g' },
      { name: 'imbir świeży', qty: 15, unit: 'g' },
      { name: 'curry, kurkuma, kmin rzymski', qty: 2, unit: 'łyżeczki' }
    ],
    steps: [
      'Ryż ugotuj według opisu na opakowaniu.',
      'Cebulę z imbirem podsmaż, dodaj przyprawy i smaż minutę.',
      'Wlej pomidory i mleko kokosowe, dodaj odsączoną ciecierzycę.',
      'Duś 15 minut, na koniec wmieszaj szpinak.'
    ]
  },
  {
    id: 'krem-dynia-soczewica',
    name: 'Krem z dyni z czerwoną soczewicą',
    meal: 'obiad',
    time: 30,
    servings: 4,
    kcal: 320, protein: 16, fat: 8, carbs: 46,
    tags: ['wegetariańskie', 'wegańskie', 'bezglutenowe', 'niskokaloryczne'],
    ingredients: [
      { name: 'dynia hokkaido', qty: 800, unit: 'g' },
      { name: 'soczewica czerwona (sucha)', qty: 150, unit: 'g' },
      { name: 'marchewka', qty: 200, unit: 'g' },
      { name: 'cebula', qty: 150, unit: 'g' },
      { name: 'bulion warzywny', qty: 1000, unit: 'ml' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'imbir, kurkuma', qty: 1, unit: 'łyżeczka' }
    ],
    steps: [
      'Cebulę podsmaż na oliwie, dodaj przyprawy.',
      'Wrzuć pokrojoną dynię, marchewkę i przepłukaną soczewicę.',
      'Zalej bulionem i gotuj 20 minut, aż wszystko zmięknie.',
      'Zblenduj na gładki krem.'
    ],
    tip: 'Zupy kremy z roślin strączkowych dają dużo objętości przy małej kaloryczności — świetne na wieczorny głód.'
  },
  {
    id: 'salatka-grecka-kurczak',
    name: 'Sałatka grecka z kurczakiem',
    meal: 'obiad',
    time: 20,
    servings: 2,
    kcal: 430, protein: 40, fat: 22, carbs: 16,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'niskowęglowodanowe'],
    ingredients: [
      { name: 'pierś z kurczaka', qty: 250, unit: 'g' },
      { name: 'ser feta', qty: 80, unit: 'g' },
      { name: 'ogórek', qty: 200, unit: 'g' },
      { name: 'pomidory', qty: 250, unit: 'g' },
      { name: 'oliwki czarne', qty: 40, unit: 'g' },
      { name: 'cebula czerwona', qty: 50, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 10, unit: 'ml' },
      { name: 'oregano', qty: 1, unit: 'łyżeczka' }
    ],
    steps: [
      'Kurczaka dopraw i usmaż na patelni grillowej, pokrój w paski.',
      'Warzywa pokrój w grubą kostkę, cebulę w piórka.',
      'Wymieszaj, dodaj pokruszoną fetę i oliwki.',
      'Skrop oliwą, posyp oregano.'
    ]
  },
  {
    id: 'placki-cukinia',
    name: 'Placki z cukinii z sosem jogurtowym',
    meal: 'obiad',
    time: 30,
    servings: 2,
    kcal: 350, protein: 22, fat: 14, carbs: 34,
    tags: ['wegetariańskie'],
    ingredients: [
      { name: 'cukinia', qty: 500, unit: 'g' },
      { name: 'jajka', qty: 2, unit: 'szt' },
      { name: 'mąka pełnoziarnista', qty: 60, unit: 'g' },
      { name: 'ser feta', qty: 60, unit: 'g' },
      { name: 'jogurt naturalny', qty: 150, unit: 'g' },
      { name: 'czosnek', qty: 1, unit: 'ząbek' },
      { name: 'koperek', qty: 10, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 10, unit: 'ml' }
    ],
    steps: [
      'Cukinię zetrzyj na tarce, posól i odstaw na 10 minut, potem mocno odciśnij.',
      'Wymieszaj z jajkami, mąką i pokruszoną fetą.',
      'Smaż małe placki na oliwie po 3 minuty z każdej strony.',
      'Jogurt wymieszaj z czosnkiem i koperkiem — podawaj jako sos.'
    ],
    tip: 'Odciśnięcie cukinii to cała tajemnica — inaczej placki się rozpadają.'
  },
  {
    id: 'bigos-light',
    name: 'Bigos light z indykiem',
    meal: 'obiad',
    time: 60,
    servings: 4,
    kcal: 380, protein: 38, fat: 12, carbs: 28,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'klasyk', 'meal prep'],
    ingredients: [
      { name: 'kapusta kiszona', qty: 700, unit: 'g' },
      { name: 'kapusta biała', qty: 300, unit: 'g' },
      { name: 'pierś z indyka', qty: 600, unit: 'g' },
      { name: 'cebula', qty: 150, unit: 'g' },
      { name: 'grzyby suszone', qty: 20, unit: 'g' },
      { name: 'śliwki suszone', qty: 40, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'liść laurowy, ziele angielskie, majeranek', qty: 1, unit: 'porcja przypraw' }
    ],
    steps: [
      'Grzyby zalej wrzątkiem i odstaw na 20 minut.',
      'Indyka pokrój w kostkę i obsmaż z cebulą na oliwie.',
      'Dodaj obie kapusty (kiszoną odciśnij), grzyby z wodą, śliwki i przyprawy.',
      'Duś pod przykryciem 40 minut, mieszając co 10 minut.'
    ],
    tip: 'Klasyczny bigos z boczkiem i kiełbasą to ok. 700 kcal na porcję. Ta wersja daje ten sam smak za połowę.'
  },
  {
    id: 'kaszotto-pieczarki',
    name: 'Kaszotto z pieczarkami i kurczakiem',
    meal: 'obiad',
    time: 35,
    servings: 3,
    kcal: 500, protein: 40, fat: 14, carbs: 52,
    tags: ['wysokobiałkowe', 'meal prep'],
    ingredients: [
      { name: 'kasza pęczak (sucha)', qty: 180, unit: 'g' },
      { name: 'pierś z kurczaka', qty: 400, unit: 'g' },
      { name: 'pieczarki', qty: 400, unit: 'g' },
      { name: 'cebula', qty: 100, unit: 'g' },
      { name: 'bulion warzywny', qty: 600, unit: 'ml' },
      { name: 'parmezan', qty: 30, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 15, unit: 'ml' },
      { name: 'tymianek', qty: 1, unit: 'łyżeczka' }
    ],
    steps: [
      'Kurczaka pokrój w kostkę i obsmaż na oliwie, zdejmij z patelni.',
      'Na tej samej patelni podsmaż cebulę i pieczarki, aż odparują.',
      'Wsyp kaszę, wlej połowę bulionu, gotuj mieszając i dolewając resztę.',
      'Po ok. 20 minutach dodaj kurczaka i tymianek, na koniec parmezan.'
    ]
  },

  {
    id: 'salatka-tunczyk-fasola',
    name: 'Sałatka z tuńczykiem i białą fasolą',
    meal: 'kolacja',
    time: 12,
    servings: 1,
    kcal: 380, protein: 36, fat: 10, carbs: 36,
    tags: ['wysokobiałkowe', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'tuńczyk w sosie własnym', qty: 150, unit: 'g' },
      { name: 'fasola biała z puszki', qty: 120, unit: 'g' },
      { name: 'pomidory', qty: 150, unit: 'g' },
      { name: 'ogórek', qty: 100, unit: 'g' },
      { name: 'cebula czerwona', qty: 30, unit: 'g' },
      { name: 'oliwa z oliwek', qty: 5, unit: 'ml' },
      { name: 'sok z cytryny', qty: 10, unit: 'ml' }
    ],
    steps: [
      'Warzywa pokrój w kostkę.',
      'Fasolę odsącz i przepłucz.',
      'Wymieszaj wszystko z tuńczykiem, skrop oliwą i cytryną.'
    ]
  },
  {
    id: 'twarozek-warzywa',
    name: 'Twarożek z warzywami i pieczywem',
    meal: 'kolacja',
    time: 8,
    servings: 1,
    kcal: 300, protein: 30, fat: 7, carbs: 29,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'twaróg chudy', qty: 150, unit: 'g' },
      { name: 'jogurt naturalny', qty: 40, unit: 'g' },
      { name: 'ogórek', qty: 80, unit: 'g' },
      { name: 'pomidor', qty: 100, unit: 'g' },
      { name: 'szczypiorek', qty: 10, unit: 'g' },
      { name: 'chleb żytni razowy', qty: 50, unit: 'g' }
    ],
    steps: [
      'Twaróg rozgnieć z jogurtem.',
      'Dodaj pokrojone warzywa i szczypiorek, dopraw.',
      'Podawaj z kromką chleba.'
    ]
  },
  {
    id: 'krewetki-stirfry',
    name: 'Krewetki stir-fry z warzywami',
    meal: 'kolacja',
    time: 18,
    servings: 2,
    kcal: 340, protein: 32, fat: 11, carbs: 26,
    tags: ['wysokobiałkowe', 'szybkie', 'niskowęglowodanowe'],
    ingredients: [
      { name: 'krewetki obrane (mrożone)', qty: 300, unit: 'g' },
      { name: 'brokuł', qty: 250, unit: 'g' },
      { name: 'papryka czerwona', qty: 200, unit: 'g' },
      { name: 'marchewka', qty: 100, unit: 'g' },
      { name: 'sos sojowy', qty: 20, unit: 'ml' },
      { name: 'olej sezamowy', qty: 10, unit: 'ml' },
      { name: 'czosnek', qty: 2, unit: 'ząbki' },
      { name: 'imbir świeży', qty: 10, unit: 'g' }
    ],
    steps: [
      'Rozgrzej mocno patelnię (albo wok) z olejem.',
      'Wrzuć czosnek i imbir, po 20 sekundach warzywa — smaż 5 minut, mieszając.',
      'Dodaj rozmrożone krewetki, smaż 3 minuty.',
      'Wlej sos sojowy, wymieszaj i zdejmij z ognia.'
    ],
    tip: 'Krewetki gotują się w 3 minuty — dłużej robią się gumowe.'
  },
  {
    id: 'zupa-jarzynowa-kurczak',
    name: 'Zupa jarzynowa z kurczakiem',
    meal: 'kolacja',
    time: 40,
    servings: 4,
    kcal: 280, protein: 30, fat: 7, carbs: 24,
    tags: ['wysokobiałkowe', 'bezglutenowe', 'niskokaloryczne', 'meal prep'],
    ingredients: [
      { name: 'pierś z kurczaka', qty: 400, unit: 'g' },
      { name: 'marchewka', qty: 200, unit: 'g' },
      { name: 'pietruszka korzeń', qty: 100, unit: 'g' },
      { name: 'seler', qty: 100, unit: 'g' },
      { name: 'ziemniaki', qty: 300, unit: 'g' },
      { name: 'fasolka szparagowa (mrożona)', qty: 200, unit: 'g' },
      { name: 'natka pietruszki', qty: 15, unit: 'g' },
      { name: 'liść laurowy, ziele angielskie', qty: 1, unit: 'porcja przypraw' }
    ],
    steps: [
      'Kurczaka zalej 1,5 l wody, dodaj przyprawy i gotuj 20 minut.',
      'Wyjmij mięso, do wywaru wrzuć pokrojone warzywa korzeniowe i ziemniaki.',
      'Po 10 minutach dodaj fasolkę i pokrojonego kurczaka.',
      'Gotuj jeszcze 5 minut, posyp natką.'
    ]
  },
  {
    id: 'tortilla-kurczak',
    name: 'Tortilla pełnoziarnista z kurczakiem',
    meal: 'kolacja',
    time: 20,
    servings: 2,
    kcal: 420, protein: 38, fat: 12, carbs: 40,
    tags: ['wysokobiałkowe', 'szybkie'],
    ingredients: [
      { name: 'tortilla pełnoziarnista', qty: 2, unit: 'szt' },
      { name: 'pierś z kurczaka', qty: 250, unit: 'g' },
      { name: 'sałata lodowa', qty: 100, unit: 'g' },
      { name: 'pomidor', qty: 150, unit: 'g' },
      { name: 'ogórek kiszony', qty: 60, unit: 'g' },
      { name: 'jogurt naturalny', qty: 60, unit: 'g' },
      { name: 'czosnek', qty: 1, unit: 'ząbek' },
      { name: 'papryka słodka, sól, pieprz', qty: 1, unit: 'szczypta' }
    ],
    steps: [
      'Kurczaka pokrój w paski, dopraw i usmaż bez tłuszczu na patelni z powłoką.',
      'Jogurt wymieszaj z przeciśniętym czosnkiem — to sos.',
      'Tortillę podgrzej, posmaruj sosem, nałóż warzywa i kurczaka.',
      'Zawiń w rulon.'
    ]
  },

  {
    id: 'serniczek-jagodowy',
    name: 'Serniczek na zimno z twarogu i jagód',
    meal: 'deser',
    time: 15,
    servings: 4,
    kcal: 210, protein: 22, fat: 6, carbs: 17,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'bezglutenowe', 'bez pieczenia'],
    ingredients: [
      { name: 'twaróg półtłusty (mielony)', qty: 500, unit: 'g' },
      { name: 'jogurt grecki', qty: 150, unit: 'g' },
      { name: 'jagody (mogą być mrożone)', qty: 200, unit: 'g' },
      { name: 'żelatyna', qty: 15, unit: 'g' },
      { name: 'erytrytol lub ksylitol', qty: 40, unit: 'g' },
      { name: 'sok z cytryny', qty: 10, unit: 'ml' }
    ],
    steps: [
      'Żelatynę rozpuść w 100 ml gorącej wody i ostudź do letniej.',
      'Twaróg zmiksuj z jogurtem, słodzikiem i sokiem z cytryny na gładką masę.',
      'Wlej żelatynę cienkim strumieniem, cały czas miksując.',
      'Wmieszaj jagody, przełóż do formy i wstaw do lodówki na 4 godziny.'
    ],
    tip: 'Deser z 22 g białka na porcję — trzymanie słodkiego w diecie jest łatwiejsze, gdy słodkie też syci.'
  },
  {
    id: 'mus-czekoladowy-awokado',
    name: 'Mus czekoladowy z awokado',
    meal: 'deser',
    time: 10,
    servings: 2,
    kcal: 230, protein: 6, fat: 16, carbs: 18,
    tags: ['wegetariańskie', 'wegańskie', 'bezglutenowe', 'bez pieczenia', 'szybkie'],
    ingredients: [
      { name: 'awokado', qty: 200, unit: 'g' },
      { name: 'kakao gorzkie', qty: 20, unit: 'g' },
      { name: 'banan', qty: 100, unit: 'g' },
      { name: 'mleko roślinne', qty: 60, unit: 'ml' },
      { name: 'erytrytol lub ksylitol', qty: 15, unit: 'g' }
    ],
    steps: [
      'Awokado obierz, usuń pestkę.',
      'Zmiksuj wszystkie składniki blenderem na gładki mus.',
      'Schłodź 30 minut przed podaniem.'
    ],
    tip: 'Awokado całkowicie znika w smaku pod kakao — zostaje kremowa konsystencja.'
  },
  {
    id: 'jablka-pieczone-cynamon',
    name: 'Jabłka pieczone z cynamonem i orzechami',
    meal: 'deser',
    time: 35,
    servings: 2,
    kcal: 175, protein: 3, fat: 7, carbs: 26,
    tags: ['wegetariańskie', 'wegańskie', 'bezglutenowe', 'niskokaloryczne'],
    ingredients: [
      { name: 'jabłka', qty: 400, unit: 'g' },
      { name: 'orzechy włoskie', qty: 20, unit: 'g' },
      { name: 'cynamon', qty: 1, unit: 'łyżeczka' },
      { name: 'rodzynki', qty: 15, unit: 'g' }
    ],
    steps: [
      'Jabłka przekrój na pół i wydrąż gniazda nasienne.',
      'Wypełnij posiekanymi orzechami i rodzynkami, posyp cynamonem.',
      'Piecz 25 minut w 180°C.'
    ]
  },
  {
    id: 'budyn-chia',
    name: 'Budyń chia z malinami',
    meal: 'deser',
    time: 10,
    servings: 2,
    kcal: 195, protein: 9, fat: 9, carbs: 19,
    tags: ['wegetariańskie', 'bezglutenowe', 'bez pieczenia'],
    ingredients: [
      { name: 'nasiona chia', qty: 30, unit: 'g' },
      { name: 'mleko 1,5%', qty: 300, unit: 'ml' },
      { name: 'maliny (mogą być mrożone)', qty: 150, unit: 'g' },
      { name: 'miód', qty: 10, unit: 'g' },
      { name: 'wanilia', qty: 1, unit: 'szczypta' }
    ],
    steps: [
      'Chia zalej mlekiem, dodaj miód i wanilię, dokładnie wymieszaj.',
      'Odstaw na 10 minut i wymieszaj ponownie — to zapobiega zbryleniu.',
      'Wstaw do lodówki na minimum 3 godziny (najlepiej na noc).',
      'Podawaj z malinami.'
    ]
  },
  {
    id: 'lody-bananowe',
    name: 'Lody bananowe „nice cream”',
    meal: 'deser',
    time: 5,
    servings: 2,
    kcal: 150, protein: 4, fat: 2, carbs: 30,
    tags: ['wegetariańskie', 'bezglutenowe', 'szybkie', 'bez pieczenia'],
    ingredients: [
      { name: 'banan (mrożony, pokrojony)', qty: 300, unit: 'g' },
      { name: 'jogurt naturalny', qty: 80, unit: 'g' },
      { name: 'kakao gorzkie lub wanilia', qty: 5, unit: 'g' }
    ],
    steps: [
      'Mrożone banany zmiksuj blenderem kielichowym — na początku będzie się kruszyć, po chwili zrobi się kremowe.',
      'Dodaj jogurt i kakao, zmiksuj jeszcze 20 sekund.',
      'Jedz od razu, zanim się rozpuści.'
    ],
    tip: 'Zawsze trzymaj w zamrażarce pokrojone banany — to ratunek na wieczorną ochotę na słodkie.'
  },

  {
    id: 'jogurt-orzechy',
    name: 'Jogurt naturalny z orzechami',
    meal: 'przekaska',
    time: 3,
    servings: 1,
    kcal: 200, protein: 14, fat: 11, carbs: 12,
    tags: ['wegetariańskie', 'bezglutenowe', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'jogurt naturalny', qty: 200, unit: 'g' },
      { name: 'orzechy włoskie', qty: 15, unit: 'g' },
      { name: 'cynamon', qty: 1, unit: 'szczypta' }
    ],
    steps: ['Wymieszaj jogurt z posiekanymi orzechami i cynamonem.']
  },
  {
    id: 'hummus-warzywa',
    name: 'Hummus z marchewką i selerem naciowym',
    meal: 'przekaska',
    time: 5,
    servings: 1,
    kcal: 185, protein: 7, fat: 9, carbs: 19,
    tags: ['wegetariańskie', 'wegańskie', 'bezglutenowe', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'hummus', qty: 60, unit: 'g' },
      { name: 'marchewka', qty: 100, unit: 'g' },
      { name: 'seler naciowy', qty: 80, unit: 'g' }
    ],
    steps: ['Warzywa pokrój w słupki.', 'Maczaj w hummusie.']
  },
  {
    id: 'koktajl-bananowy',
    name: 'Koktajl proteinowy bananowo-szpinakowy',
    meal: 'przekaska',
    time: 5,
    servings: 1,
    kcal: 255, protein: 27, fat: 4, carbs: 28,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'odżywka białkowa', qty: 30, unit: 'g' },
      { name: 'banan', qty: 100, unit: 'g' },
      { name: 'szpinak świeży', qty: 50, unit: 'g' },
      { name: 'mleko 1,5%', qty: 200, unit: 'ml' }
    ],
    steps: ['Wrzuć wszystko do blendera.', 'Miksuj 30 sekund.']
  },
  {
    id: 'serek-wiejski',
    name: 'Serek wiejski z pomidorkami',
    meal: 'przekaska',
    time: 3,
    servings: 1,
    kcal: 160, protein: 17, fat: 6, carbs: 8,
    tags: ['wysokobiałkowe', 'wegetariańskie', 'bezglutenowe', 'szybkie', 'bez gotowania'],
    ingredients: [
      { name: 'serek wiejski', qty: 200, unit: 'g' },
      { name: 'pomidorki koktajlowe', qty: 100, unit: 'g' },
      { name: 'bazylia', qty: 5, unit: 'g' }
    ],
    steps: ['Pomidorki przekrój na pół.', 'Wymieszaj z serkiem, posyp bazylią i pieprzem.']
  }
];

/* Wskazówki trenera — rotowane na panelu głównym. */
const TIPS = [
  'Deficyt 300–500 kcal dziennie to tempo, przy którym tracisz tłuszcz, a nie mięśnie. Szybciej ≠ lepiej.',
  'Waż się zawsze w tych samych warunkach: rano, po toalecie, przed śniadaniem. Reszta to szum.',
  'Wahania ±1,5 kg w ciągu doby to woda i zawartość jelit, nie tłuszcz. Patrz na średnią z tygodnia.',
  'Białko: ok. 1,6–2,0 g na kg masy ciała. To ono chroni mięśnie w deficycie i najmocniej syci.',
  'Nie pij kalorii. Sok, latte i piwo potrafią zjeść cały dzienny deficyt bez uczucia najedzenia.',
  'Warzywa do każdego głównego posiłku — objętość bez kalorii to najprostszy trik na sytość.',
  'Zaplanuj tydzień w niedzielę. Największym wrogiem diety jest głodna improwizacja o 20:00.',
  '10 000 kroków dziennie spala u przeciętnej osoby ok. 300–400 kcal. To „darmowy” deficyt.',
  'Jeden gorszy posiłek nie psuje tygodnia. Psuje go dopiero decyzja „i tak już przegrałem”.',
  'Sen poniżej 6 godzin podnosi grelinę (głód) i obniża leptynę (sytość). Śpij jak część diety.',
  'Alkohol na czas redukcji: im mniej, tym lepiej. Blokuje spalanie tłuszczu i rozhamowuje apetyt.',
  'Trening siłowy 2–3× w tygodniu sprawia, że tracisz tłuszcz zamiast tracić „wagę”.'
];

const ACTIVITY = [
  { id: 1.2, label: 'Siedzący tryb życia (biuro, brak treningów)' },
  { id: 1.375, label: 'Lekka aktywność (1–3 treningi w tygodniu)' },
  { id: 1.55, label: 'Umiarkowana (3–5 treningów w tygodniu)' },
  { id: 1.725, label: 'Wysoka (6–7 treningów w tygodniu)' },
  { id: 1.9, label: 'Bardzo wysoka (praca fizyczna + treningi)' }
];

const PACE = [
  { id: 0.25, deficit: 250, label: 'Spokojne — ok. 0,25 kg/tydzień' },
  { id: 0.5, deficit: 500, label: 'Standardowe — ok. 0,5 kg/tydzień' },
  { id: 0.75, deficit: 750, label: 'Szybkie — ok. 0,75 kg/tydzień' }
];

const DAYS = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

/* Produkty, które prawie każdy ma w szafce — nie liczymy ich jako braków
   w module „Co mam w lodówce”. */
const STAPLES = [
  'sól', 'pieprz', 'przypraw', 'oliwa', 'olej', 'woda', 'cynamon', 'wanilia',
  'oregano', 'majeranek', 'tymianek', 'papryka słodka', 'papryka wędzona',
  'kmin rzymski', 'kurkuma', 'curry', 'chili', 'liść laurowy', 'ziele angielskie',
  'bazylia', 'czosnek', 'bulion'
];

/* Zamienniki: czym można zastąpić brakujący składnik bez psucia dania.
   Dzięki temu brak kaszy nie wyklucza przepisu, jeśli masz ryż. */
const SUBSTITUTES = {
  'kasza': ['ryż', 'makaron', 'ziemniaki', 'kasza'],
  'ryż': ['kasza', 'makaron', 'ziemniaki', 'ryż'],
  'makaron': ['ryż', 'kasza', 'ziemniaki', 'makaron'],
  'ziemniaki': ['ryż', 'kasza', 'makaron', 'ziemniaki'],
  'jogurt': ['kefir', 'śmietana', 'maślanka', 'jogurt'],
  'kefir': ['jogurt', 'maślanka', 'kefir'],
  'śmietana': ['jogurt', 'kefir', 'śmietana'],
  'mleko': ['kefir', 'jogurt', 'mleko roślinne', 'mleko'],
  'masło': ['olej', 'oliwa', 'margaryna', 'masło'],
  'olej': ['oliwa', 'masło', 'olej'],
  'oliwa': ['olej', 'masło', 'oliwa'],
  'twaróg': ['serek wiejski', 'twarożek', 'twaróg'],
  'serek wiejski': ['twaróg', 'serek wiejski'],
  'pierś z kurczaka': ['indyk', 'udko', 'kurczak'],
  'udko': ['pierś z kurczaka', 'kurczak', 'indyk', 'udko'],
  'mielone': ['mielone z indyka', 'mielone wieprzowo-wołowe', 'mielone'],
  'dorsz': ['mintaj', 'morszczuk', 'ryba', 'dorsz'],
  'mintaj': ['dorsz', 'morszczuk', 'ryba', 'mintaj'],
  'passata': ['pomidory krojone', 'koncentrat', 'passata'],
  'pomidory krojone': ['passata', 'koncentrat', 'pomidory krojone'],
  'fasola': ['ciecierzyca', 'soczewica', 'fasola'],
  'ciecierzyca': ['fasola', 'soczewica', 'ciecierzyca'],
  'marchewka': ['pietruszka', 'marchewka'],
  'cebula': ['por', 'szalotka', 'cebula'],
  'szczypiorek': ['natka', 'koperek', 'szczypiorek'],
  'koperek': ['natka', 'szczypiorek', 'koperek'],
  'miód': ['cukier', 'erytrytol', 'ksylitol', 'miód'],
  'ser żółty': ['mozzarella', 'ser', 'ser żółty']
};

/* Słowa kluczowe, po których dopasowujemy to, co wpiszesz, do składników
   przepisów. Lewa strona = to, co możesz wpisać; prawa = rdzeń nazwy. */
const ALIASES = {
  'masło': ['masło'],
  'margaryna': ['masło'],
  'ser żółty': ['ser żółty'],
  'żółty ser': ['ser żółty'],
  'mozzarella': ['ser żółty'],
  'kiełbasa': ['kiełbasa'],
  'parówki': ['kiełbasa'],
  'wędlina': ['szynka', 'kiełbasa'],
  'szynka': ['szynka'],
  'boczek': ['kiełbasa'],
  'schab': ['schab'],
  'karkówka': ['schab'],
  'wieprzowina': ['schab', 'mielone wieprzowo'],
  'wołowina': ['mielone wieprzowo'],
  'mięso mielone': ['mielone'],
  'kefir': ['kefir'],
  'maślanka': ['kefir'],
  'śmietana': ['śmietana'],
  'dorsz': ['dorsz'],
  'mintaj': ['mintaj'],
  'makrela': ['makrela'],
  'śledź': ['śledź'],
  'kalafior': ['kalafior'],
  'buraki': ['buraki'],
  'burak': ['buraki'],
  'groszek': ['groszek'],
  'bułka': ['bułka'],
  'bułki': ['bułka'],
  'mąka': ['mąka'],
  'kasza manna': ['kasza manna'],
  'ogórki kiszone': ['ogórki kiszone'],
  'ogórek kiszony': ['ogórki kiszone'],
  'koncentrat': ['koncentrat pomidorowy'],
  'passata': ['passata'],
  'rodzynki': ['rodzynki'],
  'cukier': ['miód'],
  'kurczak': ['kurczak', 'pierś z kurczaka'],
  'pierś': ['kurczak', 'indyk'],
  'indyk': ['indyk'],
  'jajka': ['jajko', 'jajka'],
  'jajko': ['jajko', 'jajka'],
  'jaja': ['jajko', 'jajka'],
  'ser biały': ['twaróg', 'twarożek'],
  'twaróg': ['twaróg'],
  'serek': ['serek wiejski'],
  'jogurt': ['jogurt'],
  'mleko': ['mleko'],
  'ryż': ['ryż'],
  'makaron': ['makaron'],
  'kasza': ['kasza'],
  'płatki': ['płatki owsiane'],
  'owsianka': ['płatki owsiane'],
  'chleb': ['chleb', 'pieczywo'],
  'pieczywo': ['chleb'],
  'ziemniaki': ['ziemniaki'],
  'pomidory': ['pomidor', 'passata', 'pomidorki'],
  'pomidor': ['pomidor', 'passata', 'pomidorki'],
  'ogórek': ['ogórek'],
  'papryka': ['papryka czerwona'],
  'cebula': ['cebula'],
  'marchew': ['marchewka'],
  'marchewka': ['marchewka'],
  'brokuł': ['brokuł'],
  'brokuły': ['brokuł'],
  'cukinia': ['cukinia'],
  'szpinak': ['szpinak'],
  'sałata': ['sałata'],
  'kapusta': ['kapusta'],
  'pieczarki': ['pieczarki', 'grzyby'],
  'grzyby': ['grzyby', 'pieczarki'],
  'fasola': ['fasola'],
  'ciecierzyca': ['ciecierzyca'],
  'soczewica': ['soczewica'],
  'tuńczyk': ['tuńczyk'],
  'łosoś': ['łosoś'],
  'ryba': ['łosoś', 'tuńczyk'],
  'krewetki': ['krewetki'],
  'banan': ['banan'],
  'banany': ['banan'],
  'jabłka': ['jabłka'],
  'jabłko': ['jabłka'],
  'jagody': ['jagody'],
  'maliny': ['maliny'],
  'truskawki': ['truskawki', 'maliny'],
  'awokado': ['awokado'],
  'orzechy': ['orzechy'],
  'feta': ['feta'],
  'hummus': ['hummus'],
  'tortilla': ['tortilla'],
  'dynia': ['dynia'],
  'kakao': ['kakao'],
  'chia': ['chia'],
  'białko': ['odżywka białkowa'],
  'odżywka': ['odżywka białkowa'],
  'skyr': ['skyr'],
  'miód': ['miód'],
  'cytryna': ['cytryna'],
  'rzodkiewka': ['rzodkiewki'],
  'rzodkiewki': ['rzodkiewki'],
  'szczypiorek': ['szczypiorek'],
  'koperek': ['koperek'],
  'seler': ['seler'],
  'kukurydza': ['kukurydza'],
  'oliwki': ['oliwki'],
  'fasolka szparagowa': ['fasolka szparagowa'],
  'mąka': ['mąka'],
  'parmezan': ['parmezan'],
  'imbir': ['imbir']
};
