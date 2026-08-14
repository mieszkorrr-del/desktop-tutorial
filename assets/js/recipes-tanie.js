const RECIPES_TANIE = [
  {
    id: "jajecznica-3",
    name: "Jajecznica na maśle",
    meal: "sniadanie",
    time: 8,
    servings: 1,
    kcal: 385,
    protein: 22,
    fat: 22,
    carbs: 23,
    tags: [
      "tanie",
      "szybkie",
      "3 składniki",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "masło",
        qty: 8,
        unit: "g"
      },
      {
        name: "chleb żytni razowy",
        qty: 50,
        unit: "g"
      }
    ],
    steps: [
      "Rozpuść masło na patelni.",
      "Wbij jajka, mieszaj na małym ogniu do ścięcia.",
      "Dopraw solą i pieprzem, podawaj z chlebem."
    ],
    tip: "Najprostsze wysokobiałkowe śniadanie, jakie istnieje. Trzy składniki i osiem minut."
  },
  {
    id: "owsianka-mleko",
    name: "Owsianka na mleku z bananem",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 427,
    protein: 17,
    fat: 8,
    carbs: 69,
    tags: [
      "tanie",
      "szybkie",
      "3 składniki",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "płatki owsiane",
        qty: 60,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 250,
        unit: "ml"
      },
      {
        name: "banan",
        qty: 1,
        unit: "szt"
      }
    ],
    steps: [
      "Płatki zalej mlekiem, gotuj 5 minut mieszając.",
      "Zdejmij z ognia, dodaj pokrojonego banana."
    ],
    tip: "Koszt tego śniadania to około 2 złote."
  },
  {
    id: "twarog-jogurt",
    name: "Twaróg z jogurtem i szczypiorkiem",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 294,
    protein: 35,
    fat: 3,
    carbs: 30,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "twaróg chudy",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 50,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 10,
        unit: "g"
      },
      {
        name: "chleb żytni razowy",
        qty: 50,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg rozgnieć widelcem z jogurtem.",
      "Wmieszaj posiekany szczypiorek, dopraw.",
      "Podawaj z chlebem."
    ]
  },
  {
    id: "kanapki-szynka",
    name: "Kanapki z szynką i ogórkiem",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 271,
    protein: 15,
    fat: 8,
    carbs: 33,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "chleb żytni razowy",
        qty: 70,
        unit: "g"
      },
      {
        name: "szynka drobiowa",
        qty: 60,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 80,
        unit: "g"
      },
      {
        name: "masło",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Posmaruj chleb cienko masłem.",
      "Ułóż szynkę i plastry ogórka."
    ]
  },
  {
    id: "jajka-na-twardo",
    name: "Jajka na twardo z chlebem",
    meal: "sniadanie",
    time: 12,
    servings: 1,
    kcal: 348,
    protein: 23,
    fat: 15,
    carbs: 27,
    tags: [
      "tanie",
      "2 składniki",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "chleb żytni razowy",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Jajka gotuj 9 minut od zagotowania wody.",
      "Ostudź w zimnej wodzie, obierz.",
      "Podawaj z chlebem, solą i pieprzem."
    ]
  },
  {
    id: "kasza-manna",
    name: "Kasza manna na mleku",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 345,
    protein: 15,
    fat: 5,
    carbs: 60,
    tags: [
      "tanie",
      "szybkie",
      "3 składniki",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "kasza manna (sucha)",
        qty: 50,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 300,
        unit: "ml"
      },
      {
        name: "miód",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Mleko zagotuj.",
      "Wsyp kaszę cienkim strumieniem, cały czas mieszając.",
      "Gotuj 3 minuty, dosłodź miodem."
    ]
  },
  {
    id: "serek-ogorek",
    name: "Serek wiejski z ogórkiem",
    meal: "sniadanie",
    time: 4,
    servings: 1,
    kcal: 214,
    protein: 26,
    fat: 9,
    carbs: 7,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "3 składniki",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "serek wiejski",
        qty: 200,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 100,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Ogórek pokrój w kostkę.",
      "Wymieszaj z serkiem, posyp szczypiorkiem i pieprzem."
    ]
  },
  {
    id: "omlet-ser",
    name: "Omlet z serem żółtym",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 366,
    protein: 26,
    fat: 27,
    carbs: 1,
    tags: [
      "tanie",
      "szybkie",
      "3 składniki",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "ser żółty",
        qty: 30,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Roztrzep jajka z solą.",
      "Wylej na rozgrzaną patelnię z olejem.",
      "Gdy się zetnie, posyp startym serem i złóż na pół."
    ]
  },
  {
    id: "platki-kefir",
    name: "Płatki owsiane na kefirze",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 392,
    protein: 15,
    fat: 9,
    carbs: 60,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "płatki owsiane",
        qty: 50,
        unit: "g"
      },
      {
        name: "kefir",
        qty: 250,
        unit: "ml"
      },
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      }
    ],
    steps: [
      "Płatki zalej kefirem.",
      "Dodaj starte jabłko, wymieszaj.",
      "Odstaw na 10 minut, żeby płatki zmiękły."
    ],
    tip: "Można przygotować wieczorem — rano czeka gotowe w lodówce."
  },
  {
    id: "grzanki-jajko",
    name: "Grzanki z jajkiem sadzonym",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 343,
    protein: 17,
    fat: 16,
    carbs: 31,
    tags: [
      "tanie",
      "szybkie",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "chleb żytni razowy",
        qty: 70,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "olej rzepakowy",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Chleb podpiecz na suchej patelni z obu stron.",
      "Na oleju usmaż jajka sadzone.",
      "Nałóż jajka na grzanki, dopraw."
    ]
  },
  {
    id: "kotlety-mielone",
    name: "Kotlety mielone z ziemniakami",
    meal: "obiad",
    time: 40,
    servings: 4,
    kcal: 502,
    protein: 27,
    fat: 28,
    carbs: 36,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "mielone wieprzowo-wołowe",
        qty: 500,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 800,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Mięso wymieszaj z jajkiem i startą cebulą, dopraw solą i pieprzem.",
      "Formuj kotlety.",
      "Smaż na oleju po 4–5 minut z każdej strony.",
      "Ziemniaki ugotuj w osolonej wodzie."
    ],
    tip: "Klasyka obiadu domowego. Piecz zamiast smażyć, a zejdziesz o ok. 80 kcal na porcję."
  },
  {
    id: "schab-duszony",
    name: "Schab duszony w cebuli",
    meal: "obiad",
    time: 45,
    servings: 4,
    kcal: 402,
    protein: 36,
    fat: 13,
    carbs: 36,
    tags: [
      "tanie",
      "klasyk",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "schab",
        qty: 600,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 700,
        unit: "g"
      }
    ],
    steps: [
      "Schab pokrój na plastry, dopraw i obsmaż na oleju.",
      "Dodaj cebulę pokrojoną w piórka.",
      "Podlej wodą do połowy wysokości mięsa, duś pod przykryciem 30 minut.",
      "Podawaj z ziemniakami."
    ]
  },
  {
    id: "kurczak-ryz-marchew",
    name: "Kurczak z ryżem i marchewką",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 430,
    protein: 37,
    fat: 10,
    carbs: 46,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 450,
        unit: "g"
      },
      {
        name: "ryż biały (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Ryż ugotuj w osolonej wodzie.",
      "Kurczaka pokrój w kostkę, dopraw, usmaż na oleju.",
      "Marchewkę zetrzyj i podduś 5 minut z kurczakiem.",
      "Wymieszaj z ryżem."
    ]
  },
  {
    id: "makaron-sos-pomidorowy",
    name: "Makaron w sosie pomidorowym",
    meal: "obiad",
    time: 20,
    servings: 3,
    kcal: 403,
    protein: 12,
    fat: 7,
    carbs: 69,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie",
      "4 składniki"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 250,
        unit: "g"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Makaron ugotuj al dente.",
      "Cebulę podsmaż na oliwie.",
      "Dodaj pomidory, gotuj 10 minut, dopraw.",
      "Połącz z makaronem."
    ],
    tip: "Najtańszy pełny obiad w tej bazie. Cztery składniki, dwadzieścia minut."
  },
  {
    id: "mielone-z-kasza",
    name: "Mielone z indyka z kaszą",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 488,
    protein: 35,
    fat: 17,
    carbs: 44,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "mielone z indyka",
        qty: 450,
        unit: "g"
      },
      {
        name: "kasza jęczmienna (sucha)",
        qty: 150,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "passata pomidorowa",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Kaszę ugotuj.",
      "Cebulę podsmaż, dodaj mięso i rozdrabniaj łopatką.",
      "Wlej passatę, duś 15 minut.",
      "Podawaj z kaszą."
    ]
  },
  {
    id: "dorsz-piekarnik",
    name: "Dorsz pieczony z ziemniakami",
    meal: "obiad",
    time: 35,
    servings: 2,
    kcal: 425,
    protein: 41,
    fat: 9,
    carbs: 43,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "dorsz (filet)",
        qty: 400,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 500,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      },
      {
        name: "koperek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Piekarnik nagrzej do 200°C.",
      "Ziemniaki pokrój, wymieszaj z oliwą i solą, piecz 25 minut.",
      "Po 12 minutach dołóż dorsza doprawionego solą i pieprzem.",
      "Posyp koperkiem."
    ],
    tip: "Dorsz i mintaj to najtańsze białko rybne — dużo taniej niż łosoś przy podobnej wartości."
  },
  {
    id: "kapusta-z-miesem",
    name: "Kapusta duszona z mięsem",
    meal: "obiad",
    time: 45,
    servings: 4,
    kcal: 331,
    protein: 21,
    fat: 21,
    carbs: 14,
    tags: [
      "tanie",
      "klasyk",
      "bezglutenowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "kapusta biała",
        qty: 800,
        unit: "g"
      },
      {
        name: "mielone wieprzowo-wołowe",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "koncentrat pomidorowy",
        qty: 60,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Kapustę poszatkuj.",
      "Mięso z cebulą obsmaż na oleju.",
      "Dodaj kapustę i koncentrat, podlej wodą.",
      "Duś pod przykryciem 30 minut."
    ]
  },
  {
    id: "zupa-pomidorowa",
    name: "Zupa pomidorowa z ryżem",
    meal: "obiad",
    time: 30,
    servings: 4,
    kcal: 191,
    protein: 5,
    fat: 4,
    carbs: 32,
    tags: [
      "tanie",
      "klasyk",
      "niskokaloryczne"
    ],
    ingredients: [
      {
        name: "passata pomidorowa",
        qty: 500,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1200,
        unit: "ml"
      },
      {
        name: "ryż biały (suchy)",
        qty: 100,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Bulion zagotuj z pokrojoną marchewką.",
      "Wsyp ryż, gotuj 15 minut.",
      "Wlej passatę, zagotuj.",
      "Zdejmij z ognia i zabiel śmietaną."
    ]
  },
  {
    id: "kotlety-jajeczne",
    name: "Kotleciki jajeczne z kaszy",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 363,
    protein: 13,
    fat: 12,
    carbs: 48,
    tags: [
      "tanie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "kasza jęczmienna (sucha)",
        qty: 150,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "mąka pszenna",
        qty: 40,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Kaszę ugotuj i ostudź.",
      "Wymieszaj z jajkami, startą cebulą i mąką, dopraw.",
      "Formuj kotleciki i smaż na oleju po 3 minuty z każdej strony."
    ]
  },
  {
    id: "gulasz-warzywny-fasola",
    name: "Gulasz z fasolą i papryką",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 287,
    protein: 14,
    fat: 6,
    carbs: 41,
    tags: [
      "tanie",
      "wegetariańskie",
      "wegańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "fasola czerwona z puszki",
        qty: 480,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 300,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę i paprykę podsmaż na oleju.",
      "Dodaj pomidory i odsączoną fasolę.",
      "Duś 15 minut, dopraw papryką słodką i czosnkiem."
    ]
  },
  {
    id: "ryz-z-warzywami",
    name: "Ryż smażony z warzywami i jajkiem",
    meal: "obiad",
    time: 20,
    servings: 2,
    kcal: 508,
    protein: 17,
    fat: 13,
    carbs: 76,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "ryż biały (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "groszek zielony (mrożony)",
        qty: 200,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Ryż ugotuj (najlepiej dzień wcześniej).",
      "Warzywa podsmaż na oleju 5 minut.",
      "Dodaj ryż, smaż mieszając.",
      "Odsuń na bok, wbij jajka, zamieszaj i połącz całość."
    ],
    tip: "Świetny sposób na wykorzystanie ryżu z wczoraj."
  },
  {
    id: "placki-ziemniaczane",
    name: "Placki ziemniaczane",
    meal: "obiad",
    time: 35,
    servings: 3,
    kcal: 415,
    protein: 10,
    fat: 12,
    carbs: 66,
    tags: [
      "tanie",
      "klasyk",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "ziemniaki",
        qty: 900,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "mąka pszenna",
        qty: 50,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 30,
        unit: "g"
      }
    ],
    steps: [
      "Ziemniaki i cebulę zetrzyj na tarce, odciśnij nadmiar wody.",
      "Wymieszaj z jajkiem i mąką, dopraw.",
      "Smaż cienkie placki na oleju."
    ]
  },
  {
    id: "makrela-ziemniaki",
    name: "Makrela z ziemniakami i surówką",
    meal: "obiad",
    time: 25,
    servings: 2,
    kcal: 567,
    protein: 38,
    fat: 25,
    carbs: 49,
    tags: [
      "tanie",
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "makrela wędzona",
        qty: 300,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 500,
        unit: "g"
      },
      {
        name: "kapusta biała",
        qty: 200,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Ziemniaki ugotuj.",
      "Makrelę obierz ze skóry i ości, podziel na kawałki.",
      "Kapustę poszatkuj i wymieszaj z jogurtem."
    ]
  },
  {
    id: "soczewica-pomidory",
    name: "Soczewica z pomidorami",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 366,
    protein: 19,
    fat: 6,
    carbs: 55,
    tags: [
      "tanie",
      "wegetariańskie",
      "wegańskie",
      "bezglutenowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "soczewica czerwona (sucha)",
        qty: 200,
        unit: "g"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę i marchewkę podsmaż.",
      "Dodaj przepłukaną soczewicę i pomidory, zalej 400 ml wody.",
      "Gotuj 20 minut, dopraw kminem i papryką."
    ],
    tip: "Kilogram soczewicy kosztuje mniej niż pół kilo mięsa, a daje 24 g białka na 100 g."
  },
  {
    id: "udka-pieczone",
    name: "Udka z kurczaka pieczone z warzywami",
    meal: "obiad",
    time: 50,
    servings: 4,
    kcal: 460,
    protein: 42,
    fat: 18,
    carbs: 32,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "udko z kurczaka (bez skóry)",
        qty: 800,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 600,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Piekarnik nagrzej do 190°C.",
      "Warzywa pokrój, wymieszaj z olejem i przyprawami.",
      "Ułóż na blasze razem z udkami.",
      "Piecz 45 minut."
    ],
    tip: "Udka są zwykle dwa razy tańsze od piersi. Bez skóry mają niewiele więcej tłuszczu."
  },
  {
    id: "kalafior-zapiekany",
    name: "Kalafior zapiekany z serem",
    meal: "obiad",
    time: 35,
    servings: 3,
    kcal: 264,
    protein: 20,
    fat: 14,
    carbs: 11,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "kalafior",
        qty: 800,
        unit: "g"
      },
      {
        name: "ser żółty",
        qty: 100,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 150,
        unit: "g"
      }
    ],
    steps: [
      "Kalafior podziel na różyczki i ugotuj 8 minut.",
      "Ułóż w naczyniu żaroodpornym.",
      "Jajka roztrzep z jogurtem, dopraw, zalej kalafior.",
      "Posyp serem, piecz 20 minut w 190°C."
    ]
  },
  {
    id: "makaron-z-serem",
    name: "Makaron z serem i pieczarkami",
    meal: "obiad",
    time: 25,
    servings: 2,
    kcal: 554,
    protein: 25,
    fat: 16,
    carbs: 73,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 180,
        unit: "g"
      },
      {
        name: "pieczarki",
        qty: 300,
        unit: "g"
      },
      {
        name: "ser żółty",
        qty: 60,
        unit: "g"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Makaron ugotuj.",
      "Pieczarki i cebulę podsmaż, aż odparuje woda.",
      "Wlej śmietanę, dodaj ser, mieszaj do rozpuszczenia.",
      "Połącz z makaronem."
    ]
  },
  {
    id: "bigos-prosty",
    name: "Bigos prosty z kiełbasą",
    meal: "obiad",
    time: 50,
    servings: 4,
    kcal: 268,
    protein: 13,
    fat: 17,
    carbs: 15,
    tags: [
      "tanie",
      "klasyk",
      "bezglutenowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "kapusta kiszona",
        qty: 800,
        unit: "g"
      },
      {
        name: "kapusta biała",
        qty: 300,
        unit: "g"
      },
      {
        name: "kiełbasa zwyczajna",
        qty: 250,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "koncentrat pomidorowy",
        qty: 50,
        unit: "g"
      }
    ],
    steps: [
      "Kapustę kiszoną odciśnij, białą poszatkuj.",
      "Kiełbasę i cebulę podsmaż.",
      "Dodaj obie kapusty i koncentrat, podlej wodą.",
      "Duś 40 minut pod przykryciem."
    ]
  },
  {
    id: "kanapki-twarog",
    name: "Kanapki z twarogiem i pomidorem",
    meal: "kolacja",
    time: 6,
    servings: 1,
    kcal: 311,
    protein: 24,
    fat: 6,
    carbs: 38,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "chleb żytni razowy",
        qty: 70,
        unit: "g"
      },
      {
        name: "twaróg półtłusty",
        qty: 100,
        unit: "g"
      },
      {
        name: "pomidory",
        qty: 120,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg rozgnieć widelcem, dopraw solą i pieprzem.",
      "Rozsmaruj na chlebie, ułóż plastry pomidora."
    ]
  },
  {
    id: "salatka-jajeczna",
    name: "Sałatka jajeczna z ogórkiem",
    meal: "kolacja",
    time: 15,
    servings: 2,
    kcal: 191,
    protein: 16,
    fat: 11,
    carbs: 5,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 4,
        unit: "szt"
      },
      {
        name: "ogórki kiszone",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 120,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na twardo, ostudź i pokrój w kostkę.",
      "Ogórki pokrój drobno.",
      "Wymieszaj z jogurtem i szczypiorkiem, dopraw."
    ]
  },
  {
    id: "tunczyk-fasola-prosty",
    name: "Tuńczyk z białą fasolą",
    meal: "kolacja",
    time: 8,
    servings: 1,
    kcal: 353,
    protein: 49,
    fat: 3,
    carbs: 33,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "3 składniki",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "tuńczyk w sosie własnym",
        qty: 150,
        unit: "g"
      },
      {
        name: "fasola biała z puszki",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 40,
        unit: "g"
      }
    ],
    steps: [
      "Fasolę odsącz i przepłucz.",
      "Wymieszaj z odsączonym tuńczykiem i drobno pokrojoną cebulą.",
      "Dopraw pieprzem i odrobiną oliwy."
    ]
  },
  {
    id: "zupa-jarzynowa-prosta",
    name: "Zupa jarzynowa",
    meal: "kolacja",
    time: 35,
    servings: 4,
    kcal: 145,
    protein: 5,
    fat: 1,
    carbs: 28,
    tags: [
      "tanie",
      "niskokaloryczne",
      "wegetariańskie",
      "meal prep"
    ],
    ingredients: [
      {
        name: "marchewka",
        qty: 300,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 400,
        unit: "g"
      },
      {
        name: "fasolka szparagowa (mrożona)",
        qty: 250,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1500,
        unit: "ml"
      },
      {
        name: "natka pietruszki",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Bulion zagotuj.",
      "Wrzuć pokrojoną marchewkę i ziemniaki, gotuj 15 minut.",
      "Dodaj fasolkę, gotuj 8 minut.",
      "Posyp natką."
    ]
  },
  {
    id: "jajka-w-sosie",
    name: "Jajka w sosie pomidorowym (shakshuka)",
    meal: "kolacja",
    time: 20,
    servings: 2,
    kcal: 294,
    protein: 17,
    fat: 15,
    carbs: 19,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie",
      "bezglutenowe",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 4,
        unit: "szt"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 150,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę i paprykę podsmaż na oliwie.",
      "Dodaj pomidory, gotuj 8 minut, dopraw.",
      "Zrób wgłębienia i wbij w nie jajka.",
      "Przykryj i gotuj 6 minut, aż białka się zetną."
    ]
  },
  {
    id: "sledz-cebula",
    name: "Śledź z cebulą i ziemniakami",
    meal: "kolacja",
    time: 20,
    servings: 2,
    kcal: 462,
    protein: 23,
    fat: 24,
    carbs: 39,
    tags: [
      "tanie",
      "klasyk",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "śledź solony",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 120,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 400,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Śledzie wymocz w wodzie 2 godziny, odsącz i pokrój.",
      "Cebulę pokrój w piórka, wymieszaj ze śledziem i olejem.",
      "Podawaj z gorącymi ziemniakami."
    ]
  },
  {
    id: "kanapki-ser-zolty",
    name: "Zapiekanki z serem i pieczarkami",
    meal: "kolacja",
    time: 20,
    servings: 2,
    kcal: 392,
    protein: 20,
    fat: 13,
    carbs: 46,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "bułka pszenna",
        qty: 160,
        unit: "g"
      },
      {
        name: "pieczarki",
        qty: 200,
        unit: "g"
      },
      {
        name: "ser żółty",
        qty: 80,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Bułki przekrój wzdłuż.",
      "Pieczarki i cebulę podsmaż, ułóż na bułkach.",
      "Posyp startym serem, piecz 12 minut w 200°C."
    ]
  },
  {
    id: "surowka-serek",
    name: "Surówka z marchewki z serkiem",
    meal: "kolacja",
    time: 10,
    servings: 2,
    kcal: 228,
    protein: 14,
    fat: 5,
    carbs: 31,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "marchewka",
        qty: 300,
        unit: "g"
      },
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "serek wiejski",
        qty: 200,
        unit: "g"
      },
      {
        name: "rodzynki",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Marchewkę i jabłko zetrzyj na tarce.",
      "Wymieszaj z serkiem i rodzynkami."
    ]
  },
  {
    id: "pasta-jajeczna",
    name: "Pasta jajeczna na kanapki",
    meal: "przekaska",
    time: 15,
    servings: 3,
    kcal: 113,
    protein: 10,
    fat: 7,
    carbs: 2,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 4,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 80,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na twardo i rozgnieć widelcem.",
      "Wymieszaj z jogurtem i szczypiorkiem, dopraw."
    ]
  },
  {
    id: "burak-zolty-ser",
    name: "Buraczki z jabłkiem",
    meal: "przekaska",
    time: 15,
    servings: 3,
    kcal: 96,
    protein: 3,
    fat: 1,
    carbs: 18,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe",
      "niskokaloryczne"
    ],
    ingredients: [
      {
        name: "buraki",
        qty: 400,
        unit: "g"
      },
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Buraki ugotuj (lub użyj gotowanych), zetrzyj na tarce.",
      "Dodaj starte jabłko i jogurt, dopraw solą i pieprzem."
    ]
  },
  {
    id: "twarozek-rzodkiew",
    name: "Twarożek na kanapki",
    meal: "przekaska",
    time: 6,
    servings: 2,
    kcal: 154,
    protein: 20,
    fat: 6,
    carbs: 5,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "twaróg półtłusty",
        qty: 200,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg rozgnieć z jogurtem na gładko.",
      "Wmieszaj szczypiorek, dopraw."
    ]
  },
  {
    id: "warzywa-dip",
    name: "Warzywa z dipem jogurtowym",
    meal: "przekaska",
    time: 8,
    servings: 2,
    kcal: 123,
    protein: 6,
    fat: 3,
    carbs: 18,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "niskokaloryczne",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 150,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 150,
        unit: "g"
      },
      {
        name: "koperek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa pokrój w słupki.",
      "Jogurt wymieszaj z koperkiem, solą i czosnkiem."
    ]
  },
  {
    id: "jajka-faszerowane",
    name: "Jajka faszerowane szczypiorkiem",
    meal: "przekaska",
    time: 20,
    servings: 3,
    kcal: 157,
    protein: 14,
    fat: 10,
    carbs: 2,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 6,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na twardo, przekrój na pół, wyjmij żółtka.",
      "Żółtka rozgnieć z jogurtem i szczypiorkiem, dopraw.",
      "Nałóż farsz z powrotem do połówek."
    ]
  },
  {
    id: "jablka-cynamon-prosty",
    name: "Jabłka duszone z cynamonem",
    meal: "deser",
    time: 15,
    servings: 2,
    kcal: 147,
    protein: 1,
    fat: 1,
    carbs: 34,
    tags: [
      "tanie",
      "szybkie",
      "2 składniki",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jabłka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "rodzynki",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Jabłka obierz i pokrój w kostkę.",
      "Duś na patelni z odrobiną wody 10 minut.",
      "Dodaj rodzynki i cynamon."
    ]
  },
  {
    id: "twarog-kakao",
    name: "Krem twarogowy z kakao",
    meal: "deser",
    time: 6,
    servings: 2,
    kcal: 237,
    protein: 27,
    fat: 8,
    carbs: 14,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "twaróg półtłusty",
        qty: 250,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 100,
        unit: "g"
      },
      {
        name: "kakao gorzkie",
        qty: 15,
        unit: "g"
      },
      {
        name: "miód",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg zmiksuj z jogurtem na gładko.",
      "Dodaj kakao i miód, wymieszaj.",
      "Schłodź 20 minut."
    ],
    tip: "Deser z 20 g białka na porcję — sycący, w przeciwieństwie do batonika."
  },
  {
    id: "platki-truskawki",
    name: "Jogurt z truskawkami i płatkami",
    meal: "deser",
    time: 5,
    servings: 1,
    kcal: 244,
    protein: 12,
    fat: 8,
    carbs: 30,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "jogurt naturalny",
        qty: 200,
        unit: "g"
      },
      {
        name: "truskawki (mrożone)",
        qty: 150,
        unit: "g"
      },
      {
        name: "płatki owsiane",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Truskawki rozmroź.",
      "Wymieszaj z jogurtem, posyp płatkami."
    ]
  },
  {
    id: "kisiel-owocowy",
    name: "Banan z jogurtem i kakao",
    meal: "deser",
    time: 5,
    servings: 1,
    kcal: 199,
    protein: 9,
    fat: 6,
    carbs: 29,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "banan",
        qty: 1,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 150,
        unit: "g"
      },
      {
        name: "kakao gorzkie",
        qty: 8,
        unit: "g"
      }
    ],
    steps: [
      "Banana rozgnieć widelcem.",
      "Wymieszaj z jogurtem i kakao."
    ]
  },
  {
    id: "kanapki-paszt-jaj",
    name: "Kanapki z pastą jajeczno-szczypiorkową",
    meal: "sniadanie",
    time: 12,
    servings: 2,
    kcal: 312,
    protein: 20,
    fat: 13,
    carbs: 27,
    tags: [
      "tanie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 4,
        unit: "szt"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 15,
        unit: "g"
      },
      {
        name: "pieczywo pełnoziarniste",
        qty: 120,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na twardo, ostudź, rozgnieć widelcem.",
      "Wymieszaj z jogurtem i szczypiorkiem, dopraw.",
      "Rozsmaruj na pieczywie."
    ]
  },
  {
    id: "owsianka-kakao",
    name: "Owsianka kakaowa",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 391,
    protein: 18,
    fat: 9,
    carbs: 58,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "płatki owsiane",
        qty: 60,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 250,
        unit: "ml"
      },
      {
        name: "kakao gorzkie",
        qty: 10,
        unit: "g"
      },
      {
        name: "miód",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Płatki gotuj w mleku 5 minut.",
      "Wmieszaj kakao i miód."
    ]
  },
  {
    id: "jaglanka-jablko",
    name: "Jaglanka z jabłkiem",
    meal: "sniadanie",
    time: 20,
    servings: 1,
    kcal: 445,
    protein: 15,
    fat: 6,
    carbs: 81,
    tags: [
      "tanie",
      "bezglutenowe",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "kasza jaglana (sucha)",
        qty: 60,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 250,
        unit: "ml"
      },
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "rodzynki",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Kaszę przepłucz gorącą wodą.",
      "Gotuj w mleku 15 minut.",
      "Dodaj starte jabłko i rodzynki, dopraw cynamonem."
    ]
  },
  {
    id: "skyr-migdaly",
    name: "Skyr z migdałami i borówkami",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 270,
    protein: 26,
    fat: 8,
    carbs: 21,
    tags: [
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "skyr",
        qty: 200,
        unit: "g"
      },
      {
        name: "borówki (mrożone)",
        qty: 100,
        unit: "g"
      },
      {
        name: "migdały",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Borówki rozmroź.",
      "Wymieszaj ze skyrem, posyp posiekanymi migdałami."
    ]
  },
  {
    id: "tosty-ser-pomidor",
    name: "Tosty z serem i pomidorem",
    meal: "sniadanie",
    time: 12,
    servings: 1,
    kcal: 358,
    protein: 18,
    fat: 14,
    carbs: 37,
    tags: [
      "tanie",
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 80,
        unit: "g"
      },
      {
        name: "ser żółty",
        qty: 40,
        unit: "g"
      },
      {
        name: "pomidory",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Na pieczywie ułóż plastry pomidora i ser.",
      "Zapiekaj 8 minut w 200°C."
    ]
  },
  {
    id: "platki-jaglane-mleko",
    name: "Płatki jaglane z bananem",
    meal: "sniadanie",
    time: 8,
    servings: 1,
    kcal: 403,
    protein: 15,
    fat: 6,
    carbs: 72,
    tags: [
      "tanie",
      "szybkie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "płatki jaglane",
        qty: 55,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 250,
        unit: "ml"
      },
      {
        name: "banan",
        qty: 1,
        unit: "szt"
      }
    ],
    steps: [
      "Płatki zalej gorącym mlekiem, odstaw na 5 minut.",
      "Dodaj pokrojonego banana."
    ]
  },
  {
    id: "omlet-szpinak",
    name: "Omlet ze szpinakiem",
    meal: "sniadanie",
    time: 12,
    servings: 1,
    kcal: 361,
    protein: 26,
    fat: 26,
    carbs: 4,
    tags: [
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "szpinak (mrożony)",
        qty: 100,
        unit: "g"
      },
      {
        name: "ser feta",
        qty: 30,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Szpinak podduś na oliwie do odparowania wody.",
      "Zalej roztrzepanymi jajkami.",
      "Posyp pokruszoną fetą, smaż pod przykryciem 5 minut."
    ]
  },
  {
    id: "kanapki-masло-orzech",
    name: "Kanapki z masłem orzechowym i bananem",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 434,
    protein: 15,
    fat: 16,
    carbs: 58,
    tags: [
      "szybkie",
      "bez gotowania",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 80,
        unit: "g"
      },
      {
        name: "masło orzechowe",
        qty: 25,
        unit: "g"
      },
      {
        name: "banan",
        qty: 1,
        unit: "szt"
      }
    ],
    steps: [
      "Posmaruj pieczywo masłem orzechowym.",
      "Ułóż plastry banana."
    ]
  },
  {
    id: "serek-homo-owoce",
    name: "Serek z owocami i płatkami",
    meal: "sniadanie",
    time: 5,
    servings: 1,
    kcal: 340,
    protein: 17,
    fat: 10,
    carbs: 44,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "serek homogenizowany",
        qty: 150,
        unit: "g"
      },
      {
        name: "maliny (mrożone)",
        qty: 100,
        unit: "g"
      },
      {
        name: "płatki owsiane",
        qty: 25,
        unit: "g"
      }
    ],
    steps: [
      "Maliny rozmroź.",
      "Wymieszaj z serkiem, posyp płatkami."
    ]
  },
  {
    id: "jajka-przepiorcze-toast",
    name: "Grzanka z awokado zastępczo — jajka i rzodkiewka",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 387,
    protein: 20,
    fat: 16,
    carbs: 36,
    tags: [
      "szybkie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 80,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "rzodkiewki",
        qty: 60,
        unit: "g"
      },
      {
        name: "masło",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na miękko (6 minut).",
      "Pieczywo posmaruj masłem, ułóż plastry rzodkiewki.",
      "Na wierzch przekrojone jajka, dopraw."
    ]
  },
  {
    id: "kuskus-sniadaniowy",
    name: "Kuskus na mleku z owocami",
    meal: "sniadanie",
    time: 10,
    servings: 1,
    kcal: 407,
    protein: 15,
    fat: 4,
    carbs: 76,
    tags: [
      "tanie",
      "szybkie"
    ],
    ingredients: [
      {
        name: "kasza kuskus (sucha)",
        qty: 60,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 200,
        unit: "ml"
      },
      {
        name: "brzoskwinie",
        qty: 150,
        unit: "g"
      },
      {
        name: "miód",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Kuskus zalej gorącym mlekiem, przykryj na 5 minut.",
      "Wymieszaj, dodaj pokrojone brzoskwinie i miód."
    ]
  },
  {
    id: "twarog-otreby",
    name: "Twaróg z otrębami i pomidorem",
    meal: "sniadanie",
    time: 6,
    servings: 1,
    kcal: 238,
    protein: 36,
    fat: 3,
    carbs: 16,
    tags: [
      "tanie",
      "szybkie",
      "wysokobiałkowe",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "twaróg chudy",
        qty: 150,
        unit: "g"
      },
      {
        name: "otręby pszenne",
        qty: 20,
        unit: "g"
      },
      {
        name: "pomidory",
        qty: 120,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 40,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg wymieszaj z jogurtem i otrębami.",
      "Podawaj z pokrojonym pomidorem."
    ],
    tip: "Otręby dorzucają błonnik, który wydłuża sytość o dobre dwie godziny."
  },
  {
    id: "naleśniki-twarog",
    name: "Naleśniki z twarogiem",
    meal: "sniadanie",
    time: 30,
    servings: 3,
    kcal: 495,
    protein: 33,
    fat: 15,
    carbs: 54,
    tags: [
      "tanie",
      "klasyk",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "mąka pszenna",
        qty: 180,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 400,
        unit: "ml"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "twaróg półtłusty",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Zmiksuj mąkę, mleko i jajka na gładkie ciasto.",
      "Smaż cienkie naleśniki.",
      "Twaróg rozgnieć, nałóż na naleśniki i zawiń."
    ]
  },
  {
    id: "kanapki-makrela",
    name: "Kanapki z pastą z makreli",
    meal: "sniadanie",
    time: 10,
    servings: 2,
    kcal: 422,
    protein: 28,
    fat: 19,
    carbs: 33,
    tags: [
      "tanie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "makrela wędzona",
        qty: 200,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 50,
        unit: "g"
      },
      {
        name: "pieczywo pełnoziarniste",
        qty: 140,
        unit: "g"
      }
    ],
    steps: [
      "Makrelę obierz ze skóry i ości, rozgnieć widelcem.",
      "Wymieszaj z jogurtem i drobno posiekaną cebulą.",
      "Rozsmaruj na pieczywie."
    ]
  },
  {
    id: "szakszuka-sniadanie",
    name: "Jajka sadzone na pomidorach",
    meal: "sniadanie",
    time: 15,
    servings: 1,
    kcal: 302,
    protein: 16,
    fat: 18,
    carbs: 16,
    tags: [
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 60,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 8,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę podsmaż, dodaj pomidory, gotuj 6 minut.",
      "Wbij jajka, przykryj, gotuj 5 minut."
    ]
  },
  {
    id: "kurczak-kuskus",
    name: "Kurczak z kuskusem i warzywami",
    meal: "obiad",
    time: 25,
    servings: 3,
    kcal: 437,
    protein: 40,
    fat: 10,
    carbs: 44,
    tags: [
      "szybkie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 450,
        unit: "g"
      },
      {
        name: "kasza kuskus (sucha)",
        qty: 150,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 200,
        unit: "g"
      },
      {
        name: "cukinia",
        qty: 200,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Kuskus zalej wrzątkiem 1:1, przykryj na 5 minut.",
      "Kurczaka i warzywa pokrój, usmaż na oliwie.",
      "Połącz, dopraw."
    ]
  },
  {
    id: "indyk-bulgur",
    name: "Indyk z bulgurem",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 412,
    protein: 43,
    fat: 7,
    carbs: 40,
    tags: [
      "wysokobiałkowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "indyk (pierś)",
        qty: 450,
        unit: "g"
      },
      {
        name: "kasza bulgur (sucha)",
        qty: 150,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Bulgur ugotuj.",
      "Indyka pokrój, obsmaż z cebulą i marchewką.",
      "Połącz i dopraw."
    ]
  },
  {
    id: "pieczen-rzymska",
    name: "Pieczeń rzymska z indyka",
    meal: "obiad",
    time: 60,
    servings: 4,
    kcal: 344,
    protein: 38,
    fat: 18,
    carbs: 5,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "meal prep"
    ],
    ingredients: [
      {
        name: "mielone z indyka",
        qty: 700,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "otręby pszenne",
        qty: 40,
        unit: "g"
      }
    ],
    steps: [
      "Wymieszaj mięso z jajkami, startą cebulą i otrębami, dopraw.",
      "Uformuj bochenek w foremce.",
      "Piecz 50 minut w 180°C."
    ]
  },
  {
    id: "leczo-warzywne",
    name: "Leczo z kiełbasą",
    meal: "obiad",
    time: 35,
    servings: 4,
    kcal: 252,
    protein: 11,
    fat: 14,
    carbs: 18,
    tags: [
      "tanie",
      "klasyk",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "papryka czerwona",
        qty: 500,
        unit: "g"
      },
      {
        name: "cukinia",
        qty: 400,
        unit: "g"
      },
      {
        name: "kiełbasa zwyczajna",
        qty: 200,
        unit: "g"
      },
      {
        name: "pomidory krojone z puszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę i kiełbasę podsmaż.",
      "Dodaj pokrojoną paprykę i cukinię, smaż 5 minut.",
      "Wlej pomidory, duś 20 minut."
    ]
  },
  {
    id: "zupa-ogorkowa",
    name: "Zupa ogórkowa",
    meal: "obiad",
    time: 35,
    servings: 4,
    kcal: 174,
    protein: 5,
    fat: 4,
    carbs: 29,
    tags: [
      "tanie",
      "klasyk",
      "niskokaloryczne"
    ],
    ingredients: [
      {
        name: "ogórki kiszone",
        qty: 300,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 500,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1500,
        unit: "ml"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Bulion zagotuj z warzywami, gotuj 15 minut.",
      "Dodaj starte ogórki, gotuj 10 minut.",
      "Zabiel śmietaną."
    ]
  },
  {
    id: "zupa-grochowa",
    name: "Zupa grochowa",
    meal: "obiad",
    time: 60,
    servings: 4,
    kcal: 416,
    protein: 23,
    fat: 12,
    carbs: 56,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "groch łuskany (suchy)",
        qty: 250,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 300,
        unit: "g"
      },
      {
        name: "kiełbasa zwyczajna",
        qty: 150,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1500,
        unit: "ml"
      }
    ],
    steps: [
      "Groch namocz na noc.",
      "Gotuj w bulionie 40 minut.",
      "Dodaj warzywa i kiełbasę, gotuj 20 minut."
    ]
  },
  {
    id: "kotlety-schabowe-piek",
    name: "Schabowe z piekarnika",
    meal: "obiad",
    time: 45,
    servings: 4,
    kcal: 423,
    protein: 44,
    fat: 12,
    carbs: 34,
    tags: [
      "tanie",
      "klasyk",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "schab",
        qty: 700,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "otręby pszenne",
        qty: 60,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 700,
        unit: "g"
      }
    ],
    steps: [
      "Schab rozbij na cienkie plastry, dopraw.",
      "Obtocz w jajku i otrębach.",
      "Piecz 25 minut w 200°C, obracając w połowie.",
      "Podawaj z ziemniakami."
    ],
    tip: "Panierka z otrębów zamiast bułki tartej i piekarnik zamiast patelni — ok. 200 kcal mniej na porcję."
  },
  {
    id: "makaron-bolognese",
    name: "Makaron bolognese",
    meal: "obiad",
    time: 35,
    servings: 4,
    kcal: 567,
    protein: 29,
    fat: 18,
    carbs: 68,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 300,
        unit: "g"
      },
      {
        name: "mielone wieprzowo-wołowe",
        qty: 400,
        unit: "g"
      },
      {
        name: "passata pomidorowa",
        qty: 500,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę i startą marchewkę podsmaż.",
      "Dodaj mięso, rozdrabniaj.",
      "Wlej passatę, duś 20 minut.",
      "Podawaj z makaronem."
    ]
  },
  {
    id: "ryz-curry-kurczak",
    name: "Kurczak curry z ryżem",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 434,
    protein: 38,
    fat: 11,
    carbs: 44,
    tags: [
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 450,
        unit: "g"
      },
      {
        name: "ryż brązowy (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "mleko kokosowe light",
        qty: 200,
        unit: "ml"
      },
      {
        name: "papryka czerwona",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Ryż ugotuj.",
      "Kurczaka i warzywa podsmaż.",
      "Wlej mleko kokosowe, dopraw curry, duś 10 minut."
    ]
  },
  {
    id: "zapiekanka-makaronowa",
    name: "Zapiekanka makaronowa z mięsem",
    meal: "obiad",
    time: 50,
    servings: 4,
    kcal: 519,
    protein: 35,
    fat: 16,
    carbs: 53,
    tags: [
      "tanie",
      "meal prep"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 250,
        unit: "g"
      },
      {
        name: "mielone z indyka",
        qty: 400,
        unit: "g"
      },
      {
        name: "passata pomidorowa",
        qty: 400,
        unit: "g"
      },
      {
        name: "ser żółty",
        qty: 100,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Makaron ugotuj.",
      "Mięso z cebulą podsmaż, wlej passatę, duś 10 minut.",
      "Wymieszaj z makaronem, przełóż do naczynia, posyp serem.",
      "Piecz 20 minut w 190°C."
    ]
  },
  {
    id: "golabki-lenive",
    name: "Gołąbki leniwe",
    meal: "obiad",
    time: 45,
    servings: 4,
    kcal: 413,
    protein: 23,
    fat: 18,
    carbs: 39,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "kapusta biała",
        qty: 700,
        unit: "g"
      },
      {
        name: "mielone wieprzowo-wołowe",
        qty: 400,
        unit: "g"
      },
      {
        name: "ryż biały (suchy)",
        qty: 120,
        unit: "g"
      },
      {
        name: "passata pomidorowa",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Ryż ugotuj.",
      "Kapustę poszatkuj i sparz wrzątkiem.",
      "Mięso z cebulą podsmaż.",
      "Wymieszaj wszystko, zalej passatą, duś 25 minut."
    ]
  },
  {
    id: "dorsz-warzywa-para",
    name: "Mintaj z warzywami na parze",
    meal: "obiad",
    time: 25,
    servings: 2,
    kcal: 282,
    protein: 38,
    fat: 8,
    carbs: 14,
    tags: [
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe",
      "niskokaloryczne"
    ],
    ingredients: [
      {
        name: "mintaj (filet)",
        qty: 400,
        unit: "g"
      },
      {
        name: "brokuł",
        qty: 300,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Rybę dopraw solą, pieprzem i cytryną.",
      "Gotuj na parze 12 minut razem z warzywami.",
      "Skrop oliwą."
    ]
  },
  {
    id: "kasza-gryczana-grzyby",
    name: "Kasza gryczana z pieczarkami",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 295,
    protein: 12,
    fat: 7,
    carbs: 43,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "kasza gryczana (sucha)",
        qty: 180,
        unit: "g"
      },
      {
        name: "pieczarki",
        qty: 400,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Kaszę ugotuj.",
      "Pieczarki z cebulą smaż, aż odparuje woda.",
      "Wymieszaj z kaszą, dopraw."
    ]
  },
  {
    id: "bakłażan-zapiekany",
    name: "Bakłażan zapiekany z mozzarellą",
    meal: "obiad",
    time: 45,
    servings: 3,
    kcal: 290,
    protein: 15,
    fat: 17,
    carbs: 16,
    tags: [
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "bakłażan",
        qty: 700,
        unit: "g"
      },
      {
        name: "passata pomidorowa",
        qty: 400,
        unit: "g"
      },
      {
        name: "mozzarella",
        qty: 150,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Bakłażan pokrój w plastry, posól, odstaw 15 minut, osusz.",
      "Podpiecz na patelni z oliwą.",
      "Układaj warstwami z passatą i mozzarellą.",
      "Piecz 25 minut w 190°C."
    ]
  },
  {
    id: "watrobka-cebula",
    name: "Wątróbka drobiowa z cebulą",
    meal: "obiad",
    time: 25,
    servings: 3,
    kcal: 452,
    protein: 38,
    fat: 13,
    carbs: 44,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "wątróbka drobiowa",
        qty: 500,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 300,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 600,
        unit: "g"
      }
    ],
    steps: [
      "Cebulę zeszklij na oleju.",
      "Dodaj wątróbkę, smaż 8 minut — nie dłużej, bo stwardnieje.",
      "Dopraw na końcu (sól wcześniej wyciąga soki).",
      "Podawaj z ziemniakami."
    ],
    tip: "Wątróbka to jedno z najtańszych źródeł żelaza i witaminy A."
  },
  {
    id: "risotto-warzywne",
    name: "Risotto warzywne",
    meal: "obiad",
    time: 35,
    servings: 3,
    kcal: 333,
    protein: 11,
    fat: 6,
    carbs: 58,
    tags: [
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "ryż biały (suchy)",
        qty: 200,
        unit: "g"
      },
      {
        name: "cukinia",
        qty: 250,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 200,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 700,
        unit: "ml"
      },
      {
        name: "ser żółty",
        qty: 50,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa pokrój i podsmaż.",
      "Wsyp ryż, dolewaj bulion partiami mieszając.",
      "Po 20 minutach dodaj ser."
    ]
  },
  {
    id: "fasolka-po-bretonsku",
    name: "Fasolka po bretońsku",
    meal: "obiad",
    time: 35,
    servings: 4,
    kcal: 362,
    protein: 22,
    fat: 15,
    carbs: 36,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "fasola biała z puszki",
        qty: 800,
        unit: "g"
      },
      {
        name: "kiełbasa zwyczajna",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 150,
        unit: "g"
      },
      {
        name: "koncentrat pomidorowy",
        qty: 80,
        unit: "g"
      }
    ],
    steps: [
      "Kiełbasę i cebulę podsmaż.",
      "Dodaj fasolę z zalewą i koncentrat.",
      "Duś 20 minut, dopraw majerankiem."
    ]
  },
  {
    id: "kurczak-brokul-ryz",
    name: "Kurczak z brokułem i ryżem",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 434,
    protein: 39,
    fat: 10,
    carbs: 43,
    tags: [
      "wysokobiałkowe",
      "meal prep",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 450,
        unit: "g"
      },
      {
        name: "brokuł",
        qty: 400,
        unit: "g"
      },
      {
        name: "ryż biały (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Ryż ugotuj.",
      "Kurczaka pokrój i usmaż.",
      "Brokuł ugotuj na parze 6 minut.",
      "Połącz."
    ]
  },
  {
    id: "szpinak-makaron",
    name: "Makaron ze szpinakiem i fetą",
    meal: "obiad",
    time: 20,
    servings: 2,
    kcal: 560,
    protein: 24,
    fat: 19,
    carbs: 71,
    tags: [
      "szybkie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 180,
        unit: "g"
      },
      {
        name: "szpinak (mrożony)",
        qty: 300,
        unit: "g"
      },
      {
        name: "ser feta",
        qty: 100,
        unit: "g"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Makaron ugotuj.",
      "Szpinak podduś, wlej śmietanę.",
      "Dodaj pokruszoną fetę i makaron."
    ]
  },
  {
    id: "zupa-jarzynowa-bob",
    name: "Zupa z bobem i ziemniakami",
    meal: "obiad",
    time: 30,
    servings: 4,
    kcal: 202,
    protein: 11,
    fat: 2,
    carbs: 34,
    tags: [
      "tanie",
      "wegetariańskie",
      "niskokaloryczne"
    ],
    ingredients: [
      {
        name: "bób (mrożony)",
        qty: 400,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 400,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 200,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1500,
        unit: "ml"
      },
      {
        name: "koperek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Bulion zagotuj z ziemniakami i marchewką.",
      "Po 12 minutach dodaj bób, gotuj 10 minut.",
      "Posyp koperkiem."
    ]
  },
  {
    id: "kotlety-z-kaszy",
    name: "Kotlety z kaszy jaglanej",
    meal: "obiad",
    time: 35,
    servings: 3,
    kcal: 348,
    protein: 11,
    fat: 12,
    carbs: 47,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "kasza jaglana (sucha)",
        qty: 180,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Kaszę ugotuj i ostudź.",
      "Wymieszaj z jajkami, startą marchewką i cebulą.",
      "Formuj kotlety, smaż na oleju."
    ]
  },
  {
    id: "kurczak-szparagi",
    name: "Kurczak ze szparagami",
    meal: "obiad",
    time: 25,
    servings: 2,
    kcal: 423,
    protein: 45,
    fat: 13,
    carbs: 30,
    tags: [
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe",
      "niskowęglowodanowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 350,
        unit: "g"
      },
      {
        name: "szparagi",
        qty: 400,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 300,
        unit: "g"
      }
    ],
    steps: [
      "Kurczaka pokrój i usmaż na oliwie.",
      "Szparagi dorzuć na patelnię na 6 minut.",
      "Podawaj z ziemniakami."
    ]
  },
  {
    id: "gulasz-wieprzowy",
    name: "Gulasz wieprzowy z kaszą",
    meal: "obiad",
    time: 55,
    servings: 4,
    kcal: 500,
    protein: 43,
    fat: 16,
    carbs: 44,
    tags: [
      "tanie",
      "klasyk",
      "meal prep"
    ],
    ingredients: [
      {
        name: "schab",
        qty: 700,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 250,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 250,
        unit: "g"
      },
      {
        name: "kasza jęczmienna (sucha)",
        qty: 200,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Mięso pokrój w kostkę i obsmaż.",
      "Dodaj cebulę i paprykę.",
      "Podlej wodą, duś 40 minut.",
      "Podawaj z kaszą."
    ]
  },
  {
    id: "zapiekane-ziemniaki",
    name: "Ziemniaki zapiekane z jajkiem",
    meal: "obiad",
    time: 45,
    servings: 3,
    kcal: 441,
    protein: 21,
    fat: 13,
    carbs: 58,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "ziemniaki",
        qty: 900,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "mleko 1,5%",
        qty: 200,
        unit: "ml"
      },
      {
        name: "ser żółty",
        qty: 80,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Ziemniaki ugotuj i pokrój w plastry.",
      "Ułóż w naczyniu z podsmażoną cebulą.",
      "Jajka roztrzep z mlekiem, zalej, posyp serem.",
      "Piecz 25 minut w 190°C."
    ]
  },
  {
    id: "kurczak-slodko-kwasny",
    name: "Kurczak w sosie słodko-kwaśnym",
    meal: "obiad",
    time: 30,
    servings: 3,
    kcal: 392,
    protein: 38,
    fat: 5,
    carbs: 46,
    tags: [
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 450,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 250,
        unit: "g"
      },
      {
        name: "ryż biały (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "koncentrat pomidorowy",
        qty: 60,
        unit: "g"
      },
      {
        name: "sos sojowy",
        qty: 30,
        unit: "ml"
      }
    ],
    steps: [
      "Ryż ugotuj.",
      "Kurczaka pokrój i obsmaż, dodaj paprykę.",
      "Wymieszaj koncentrat z sosem sojowym i 100 ml wody, wlej na patelnię.",
      "Duś 8 minut."
    ]
  },
  {
    id: "salatka-tunczyk-kukurydza",
    name: "Sałatka z tuńczykiem i kukurydzą",
    meal: "kolacja",
    time: 10,
    servings: 2,
    kcal: 276,
    protein: 40,
    fat: 4,
    carbs: 18,
    tags: [
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "tuńczyk w sosie własnym",
        qty: 300,
        unit: "g"
      },
      {
        name: "kukurydza z puszki",
        qty: 200,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 80,
        unit: "g"
      }
    ],
    steps: [
      "Wszystko odsącz i pokrój.",
      "Wymieszaj z jogurtem, dopraw."
    ]
  },
  {
    id: "salatka-grecka-tania",
    name: "Sałatka grecka",
    meal: "kolacja",
    time: 12,
    servings: 2,
    kcal: 279,
    protein: 11,
    fat: 21,
    carbs: 11,
    tags: [
      "bez gotowania",
      "bezglutenowe",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "pomidory",
        qty: 300,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 200,
        unit: "g"
      },
      {
        name: "ser feta",
        qty: 120,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 60,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa pokrój w grubą kostkę.",
      "Dodaj pokruszoną fetę, skrop oliwą, posyp oregano."
    ]
  },
  {
    id: "tortilla-kurczak-tania",
    name: "Tortilla z kurczakiem",
    meal: "kolacja",
    time: 20,
    servings: 2,
    kcal: 361,
    protein: 35,
    fat: 9,
    carbs: 33,
    tags: [
      "szybkie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "tortilla pełnoziarnista",
        qty: 120,
        unit: "g"
      },
      {
        name: "pierś z kurczaka",
        qty: 250,
        unit: "g"
      },
      {
        name: "sałata lodowa",
        qty: 100,
        unit: "g"
      },
      {
        name: "pomidory",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Kurczaka pokrój, dopraw i usmaż.",
      "Tortillę posmaruj jogurtem.",
      "Nałóż warzywa i mięso, zawiń."
    ]
  },
  {
    id: "kanapki-hummus-warzywa",
    name: "Kanapki z twarożkiem i rzodkiewką",
    meal: "kolacja",
    time: 8,
    servings: 1,
    kcal: 343,
    protein: 27,
    fat: 8,
    carbs: 39,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 80,
        unit: "g"
      },
      {
        name: "twaróg półtłusty",
        qty: 100,
        unit: "g"
      },
      {
        name: "rzodkiewki",
        qty: 60,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg rozgnieć, dopraw.",
      "Rozsmaruj, ułóż plastry rzodkiewki i szczypiorek."
    ]
  },
  {
    id: "salatka-buraki-feta",
    name: "Sałatka z burakami i fetą",
    meal: "kolacja",
    time: 12,
    servings: 2,
    kcal: 291,
    protein: 11,
    fat: 19,
    carbs: 18,
    tags: [
      "bezglutenowe",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "buraki",
        qty: 400,
        unit: "g"
      },
      {
        name: "ser feta",
        qty: 100,
        unit: "g"
      },
      {
        name: "roszponka",
        qty: 60,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Buraki ugotowane pokrój w kostkę.",
      "Wymieszaj z roszponką i fetą, skrop oliwą."
    ]
  },
  {
    id: "omlet-kolacja",
    name: "Omlet z pieczarkami",
    meal: "kolacja",
    time: 15,
    servings: 1,
    kcal: 338,
    protein: 24,
    fat: 23,
    carbs: 7,
    tags: [
      "szybkie",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "pieczarki",
        qty: 150,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 50,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 8,
        unit: "g"
      }
    ],
    steps: [
      "Pieczarki z cebulą podsmaż.",
      "Zalej roztrzepanymi jajkami, smaż pod przykryciem."
    ]
  },
  {
    id: "zupa-krem-brokul",
    name: "Krem z brokułów",
    meal: "kolacja",
    time: 25,
    servings: 3,
    kcal: 202,
    protein: 10,
    fat: 6,
    carbs: 26,
    tags: [
      "niskokaloryczne",
      "wegetariańskie",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "brokuł",
        qty: 700,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 250,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1000,
        unit: "ml"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa gotuj w bulionie 15 minut.",
      "Zblenduj, wmieszaj śmietanę."
    ]
  },
  {
    id: "salatka-kurczak-saldata",
    name: "Sałatka z kurczakiem i jajkiem",
    meal: "kolacja",
    time: 20,
    servings: 2,
    kcal: 268,
    protein: 36,
    fat: 10,
    carbs: 7,
    tags: [
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "pierś z kurczaka",
        qty: 250,
        unit: "g"
      },
      {
        name: "sałata lodowa",
        qty: 150,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "pomidory",
        qty: 200,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 80,
        unit: "g"
      }
    ],
    steps: [
      "Kurczaka usmaż i pokrój.",
      "Jajka ugotuj na twardo.",
      "Wymieszaj z warzywami, polej jogurtem."
    ]
  },
  {
    id: "placki-cukinia-tanie",
    name: "Placki z cukinii",
    meal: "kolacja",
    time: 25,
    servings: 2,
    kcal: 307,
    protein: 12,
    fat: 16,
    carbs: 27,
    tags: [
      "tanie",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "cukinia",
        qty: 500,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "mąka pszenna",
        qty: 60,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Cukinię zetrzyj, posól, odciśnij.",
      "Wymieszaj z jajkami i mąką.",
      "Smaż placki na oleju."
    ]
  },
  {
    id: "kanapki-jajko-szczypior",
    name: "Kanapki z jajkiem i szczypiorkiem",
    meal: "kolacja",
    time: 12,
    servings: 1,
    kcal: 380,
    protein: 20,
    fat: 16,
    carbs: 35,
    tags: [
      "tanie",
      "szybkie",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 80,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "szczypiorek",
        qty: 10,
        unit: "g"
      },
      {
        name: "masło",
        qty: 5,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj na twardo i pokrój w plastry.",
      "Ułóż na posmarowanym pieczywie, posyp szczypiorkiem."
    ]
  },
  {
    id: "salatka-makaronowa",
    name: "Sałatka makaronowa z warzywami",
    meal: "kolacja",
    time: 20,
    servings: 3,
    kcal: 274,
    protein: 10,
    fat: 3,
    carbs: 50,
    tags: [
      "tanie",
      "meal prep"
    ],
    ingredients: [
      {
        name: "makaron (suchy)",
        qty: 150,
        unit: "g"
      },
      {
        name: "kukurydza z puszki",
        qty: 150,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 200,
        unit: "g"
      },
      {
        name: "ogórki kiszone",
        qty: 100,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 120,
        unit: "g"
      }
    ],
    steps: [
      "Makaron ugotuj i ostudź.",
      "Warzywa pokrój w kostkę.",
      "Wymieszaj z jogurtem, dopraw."
    ]
  },
  {
    id: "zupa-kalafiorowa",
    name: "Zupa kalafiorowa",
    meal: "kolacja",
    time: 30,
    servings: 4,
    kcal: 165,
    protein: 7,
    fat: 4,
    carbs: 23,
    tags: [
      "tanie",
      "niskokaloryczne",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "kalafior",
        qty: 700,
        unit: "g"
      },
      {
        name: "ziemniaki",
        qty: 300,
        unit: "g"
      },
      {
        name: "marchewka",
        qty: 150,
        unit: "g"
      },
      {
        name: "bulion (kostka + woda)",
        qty: 1500,
        unit: "ml"
      },
      {
        name: "śmietana 12%",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa gotuj w bulionie 18 minut.",
      "Zabiel śmietaną, posyp natką."
    ]
  },
  {
    id: "kolacja-serek-warzywa",
    name: "Serek wiejski z warzywami",
    meal: "kolacja",
    time: 6,
    servings: 1,
    kcal: 230,
    protein: 26,
    fat: 9,
    carbs: 10,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "serek wiejski",
        qty: 200,
        unit: "g"
      },
      {
        name: "pomidory",
        qty: 120,
        unit: "g"
      },
      {
        name: "rzodkiewki",
        qty: 60,
        unit: "g"
      },
      {
        name: "szczypiorek",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Warzywa pokrój.",
      "Wymieszaj z serkiem, dopraw pieprzem."
    ]
  },
  {
    id: "salatka-jajko-buraki",
    name: "Sałatka z jajkiem i burakami",
    meal: "kolacja",
    time: 15,
    servings: 2,
    kcal: 213,
    protein: 14,
    fat: 9,
    carbs: 17,
    tags: [
      "tanie",
      "bezglutenowe",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "buraki",
        qty: 350,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 3,
        unit: "szt"
      },
      {
        name: "ogórki kiszone",
        qty: 100,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 80,
        unit: "g"
      }
    ],
    steps: [
      "Buraki i jajka ugotuj, pokrój w kostkę.",
      "Dodaj ogórki i jogurt, wymieszaj."
    ]
  },
  {
    id: "grzanki-czosnkowe-zupa",
    name: "Chłodnik z kefiru",
    meal: "kolacja",
    time: 15,
    servings: 2,
    kcal: 282,
    protein: 18,
    fat: 10,
    carbs: 26,
    tags: [
      "szybkie",
      "bez gotowania",
      "niskokaloryczne",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "kefir",
        qty: 500,
        unit: "ml"
      },
      {
        name: "buraki",
        qty: 300,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 200,
        unit: "g"
      },
      {
        name: "koperek",
        qty: 15,
        unit: "g"
      },
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      }
    ],
    steps: [
      "Buraki ugotowane i ogórka zetrzyj.",
      "Zalej kefirem, dodaj koperek, dopraw.",
      "Podawaj z połówką jajka na twardo."
    ]
  },
  {
    id: "sur-marchewka-slonecznik",
    name: "Surówka z marchewki ze słonecznikiem",
    meal: "przekaska",
    time: 10,
    servings: 2,
    kcal: 177,
    protein: 5,
    fat: 6,
    carbs: 24,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "marchewka",
        qty: 300,
        unit: "g"
      },
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "słonecznik (pestki)",
        qty: 20,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Marchewkę i jabłko zetrzyj.",
      "Wymieszaj z jogurtem, posyp słonecznikiem."
    ]
  },
  {
    id: "jajka-na-twardo-przekaska",
    name: "Jajka na twardo z musztardą",
    meal: "przekaska",
    time: 12,
    servings: 1,
    kcal: 153,
    protein: 13,
    fat: 10,
    carbs: 1,
    tags: [
      "tanie",
      "wysokobiałkowe",
      "bezglutenowe",
      "2 składniki"
    ],
    ingredients: [
      {
        name: "jajka",
        qty: 2,
        unit: "szt"
      },
      {
        name: "musztarda",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Jajka ugotuj 9 minut, ostudź i obierz.",
      "Podawaj z musztardą."
    ]
  },
  {
    id: "twarog-migdaly-przekaska",
    name: "Twaróg z migdałami",
    meal: "przekaska",
    time: 5,
    servings: 1,
    kcal: 260,
    protein: 33,
    fat: 8,
    carbs: 13,
    tags: [
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "twaróg chudy",
        qty: 150,
        unit: "g"
      },
      {
        name: "migdały",
        qty: 15,
        unit: "g"
      },
      {
        name: "miód",
        qty: 8,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg wymieszaj z miodem.",
      "Posyp posiekanymi migdałami."
    ]
  },
  {
    id: "warzywa-sloneczne",
    name: "Pomidorki z mozzarellą",
    meal: "przekaska",
    time: 6,
    servings: 1,
    kcal: 259,
    protein: 15,
    fat: 20,
    carbs: 7,
    tags: [
      "szybkie",
      "bez gotowania",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "pomidory",
        qty: 200,
        unit: "g"
      },
      {
        name: "mozzarella",
        qty: 60,
        unit: "g"
      },
      {
        name: "oliwa z oliwek",
        qty: 8,
        unit: "g"
      }
    ],
    steps: [
      "Pomidory i mozzarellę pokrój.",
      "Skrop oliwą, posyp bazylią."
    ]
  },
  {
    id: "kanapka-serek-ogorek",
    name: "Mini kanapki z twarożkiem",
    meal: "przekaska",
    time: 6,
    servings: 1,
    kcal: 267,
    protein: 21,
    fat: 6,
    carbs: 30,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania"
    ],
    ingredients: [
      {
        name: "pieczywo pełnoziarniste",
        qty: 60,
        unit: "g"
      },
      {
        name: "twaróg półtłusty",
        qty: 80,
        unit: "g"
      },
      {
        name: "ogórek",
        qty: 80,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg rozgnieć, dopraw.",
      "Rozsmaruj i ułóż plastry ogórka."
    ]
  },
  {
    id: "owoce-orzechy",
    name: "Jabłko z masłem orzechowym",
    meal: "przekaska",
    time: 4,
    servings: 1,
    kcal: 196,
    protein: 5,
    fat: 10,
    carbs: 20,
    tags: [
      "szybkie",
      "bez gotowania",
      "2 składniki",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "jabłka",
        qty: 1,
        unit: "szt"
      },
      {
        name: "masło orzechowe",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Jabłko pokrój w plastry.",
      "Podawaj z masłem orzechowym do maczania."
    ]
  },
  {
    id: "koktajl-kefir-owoce",
    name: "Koktajl kefirowy z owocami",
    meal: "przekaska",
    time: 5,
    servings: 1,
    kcal: 250,
    protein: 12,
    fat: 7,
    carbs: 33,
    tags: [
      "szybkie",
      "bez gotowania",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "kefir",
        qty: 250,
        unit: "ml"
      },
      {
        name: "truskawki (mrożone)",
        qty: 150,
        unit: "g"
      },
      {
        name: "płatki owsiane",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Wszystko zmiksuj blenderem."
    ]
  },
  {
    id: "seler-serek",
    name: "Seler naciowy z twarożkiem",
    meal: "przekaska",
    time: 6,
    servings: 1,
    kcal: 157,
    protein: 20,
    fat: 5,
    carbs: 6,
    tags: [
      "szybkie",
      "bez gotowania",
      "niskokaloryczne",
      "bezglutenowe",
      "2 składniki"
    ],
    ingredients: [
      {
        name: "seler naciowy",
        qty: 150,
        unit: "g"
      },
      {
        name: "twaróg półtłusty",
        qty: 100,
        unit: "g"
      }
    ],
    steps: [
      "Seler pokrój na kawałki.",
      "Wypełnij rowki twarożkiem doprawionym pieprzem."
    ]
  },
  {
    id: "sledz-przekaska",
    name: "Śledź w oleju z cebulą",
    meal: "przekaska",
    time: 10,
    servings: 2,
    kcal: 304,
    protein: 19,
    fat: 23,
    carbs: 4,
    tags: [
      "tanie",
      "bezglutenowe",
      "wysokobiałkowe"
    ],
    ingredients: [
      {
        name: "śledź solony",
        qty: 200,
        unit: "g"
      },
      {
        name: "cebula",
        qty: 100,
        unit: "g"
      },
      {
        name: "olej rzepakowy",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Śledzie wymocz, pokrój.",
      "Wymieszaj z cebulą i olejem, odstaw na godzinę."
    ]
  },
  {
    id: "kukurydza-salatka",
    name: "Sałatka z kukurydzy i papryki",
    meal: "przekaska",
    time: 8,
    servings: 2,
    kcal: 132,
    protein: 5,
    fat: 2,
    carbs: 22,
    tags: [
      "tanie",
      "szybkie",
      "bez gotowania",
      "wegetariańskie"
    ],
    ingredients: [
      {
        name: "kukurydza z puszki",
        qty: 200,
        unit: "g"
      },
      {
        name: "papryka czerwona",
        qty: 150,
        unit: "g"
      },
      {
        name: "ogórki kiszone",
        qty: 80,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 60,
        unit: "g"
      }
    ],
    steps: [
      "Wszystko pokrój i wymieszaj z jogurtem."
    ]
  },
  {
    id: "sernik-na-zimno-tani",
    name: "Sernik na zimno z twarogu",
    meal: "deser",
    time: 20,
    servings: 4,
    kcal: 254,
    protein: 21,
    fat: 10,
    carbs: 19,
    tags: [
      "wysokobiałkowe",
      "bez pieczenia",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "twaróg sernikowy",
        qty: 500,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 150,
        unit: "g"
      },
      {
        name: "maliny (mrożone)",
        qty: 200,
        unit: "g"
      },
      {
        name: "miód",
        qty: 40,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg zmiksuj z jogurtem i miodem.",
      "Wmieszaj maliny.",
      "Schłodź 3 godziny."
    ]
  },
  {
    id: "ryz-na-mleku",
    name: "Ryż na mleku z owocami",
    meal: "deser",
    time: 25,
    servings: 2,
    kcal: 353,
    protein: 12,
    fat: 4,
    carbs: 65,
    tags: [
      "tanie",
      "klasyk",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "ryż biały (suchy)",
        qty: 100,
        unit: "g"
      },
      {
        name: "mleko 1,5%",
        qty: 500,
        unit: "ml"
      },
      {
        name: "borówki (mrożone)",
        qty: 150,
        unit: "g"
      },
      {
        name: "miód",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Ryż gotuj w mleku 20 minut, mieszając.",
      "Podawaj z owocami i miodem."
    ]
  },
  {
    id: "kisiel-jablkowy",
    name: "Mus jabłkowy z cynamonem",
    meal: "deser",
    time: 20,
    servings: 3,
    kcal: 134,
    protein: 1,
    fat: 0,
    carbs: 31,
    tags: [
      "tanie",
      "bezglutenowe",
      "wegańskie",
      "2 składniki"
    ],
    ingredients: [
      {
        name: "jabłka",
        qty: 4,
        unit: "szt"
      },
      {
        name: "rodzynki",
        qty: 30,
        unit: "g"
      }
    ],
    steps: [
      "Jabłka obierz, pokrój, duś z odrobiną wody 15 minut.",
      "Rozgnieć widelcem, dodaj rodzynki i cynamon."
    ]
  },
  {
    id: "deser-skyr-owoce",
    name: "Skyr z brzoskwinią",
    meal: "deser",
    time: 5,
    servings: 1,
    kcal: 242,
    protein: 25,
    fat: 6,
    carbs: 21,
    tags: [
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "skyr",
        qty: 200,
        unit: "g"
      },
      {
        name: "brzoskwinie",
        qty: 150,
        unit: "g"
      },
      {
        name: "migdały",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Brzoskwinię pokrój.",
      "Wymieszaj ze skyrem, posyp migdałami."
    ]
  },
  {
    id: "galaretka-owocowa",
    name: "Twarożek z owocami leśnymi",
    meal: "deser",
    time: 8,
    servings: 2,
    kcal: 256,
    protein: 26,
    fat: 7,
    carbs: 22,
    tags: [
      "szybkie",
      "bez gotowania",
      "wysokobiałkowe",
      "bezglutenowe"
    ],
    ingredients: [
      {
        name: "twaróg półtłusty",
        qty: 250,
        unit: "g"
      },
      {
        name: "borówki (mrożone)",
        qty: 150,
        unit: "g"
      },
      {
        name: "jogurt naturalny",
        qty: 80,
        unit: "g"
      },
      {
        name: "miód",
        qty: 15,
        unit: "g"
      }
    ],
    steps: [
      "Twaróg zmiksuj z jogurtem i miodem.",
      "Wmieszaj rozmrożone owoce."
    ]
  },
  {
    id: "banany-kakao-orzech",
    name: "Banan zapiekany z kakao",
    meal: "deser",
    time: 15,
    servings: 2,
    kcal: 166,
    protein: 4,
    fat: 8,
    carbs: 22,
    tags: [
      "tanie",
      "wegetariańskie",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "banan",
        qty: 2,
        unit: "szt"
      },
      {
        name: "kakao gorzkie",
        qty: 10,
        unit: "g"
      },
      {
        name: "orzechy włoskie",
        qty: 20,
        unit: "g"
      }
    ],
    steps: [
      "Banany przekrój wzdłuż, ułóż na blasze.",
      "Posyp kakao i posiekanymi orzechami.",
      "Piecz 12 minut w 180°C."
    ]
  },
  {
    id: "gruszki-cynamon",
    name: "Gruszki pieczone z migdałami",
    meal: "deser",
    time: 30,
    servings: 2,
    kcal: 186,
    protein: 3,
    fat: 6,
    carbs: 27,
    tags: [
      "bezglutenowe",
      "wegetariańskie",
      "2 składniki"
    ],
    ingredients: [
      {
        name: "gruszki",
        qty: 400,
        unit: "g"
      },
      {
        name: "migdały",
        qty: 25,
        unit: "g"
      }
    ],
    steps: [
      "Gruszki przekrój i wydrąż gniazda.",
      "Wypełnij posiekanymi migdałami, posyp cynamonem.",
      "Piecz 25 minut w 180°C."
    ]
  },
  {
    id: "koktajl-kakao-banan",
    name: "Koktajl bananowo-kakaowy",
    meal: "deser",
    time: 5,
    servings: 1,
    kcal: 227,
    protein: 11,
    fat: 5,
    carbs: 35,
    tags: [
      "szybkie",
      "bez gotowania",
      "bezglutenowe",
      "3 składniki"
    ],
    ingredients: [
      {
        name: "banan",
        qty: 1,
        unit: "szt"
      },
      {
        name: "mleko 1,5%",
        qty: 250,
        unit: "ml"
      },
      {
        name: "kakao gorzkie",
        qty: 10,
        unit: "g"
      }
    ],
    steps: [
      "Zmiksuj wszystko blenderem."
    ]
  }
];

