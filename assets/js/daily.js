/* Codzienne zadania i maskotka.

   Zasada: jedno małe zadanie dziennie, wykonalne w kilka minut, zawsze
   możliwe do odhaczenia niezależnie od pogody, humoru i planów. Chodzi
   o zbudowanie serii, nie o wysiłek — systematyczność wygrywa z zrywami.

   Zadanie na dany dzień wybierane jest deterministycznie z daty, więc
   jest takie samo przy każdym otwarciu aplikacji tego dnia i nie da się
   go "przelosować" na łatwiejsze. */

const DAILY_TASKS = [
  { t: 'Wypij szklankę wody zaraz po przebudzeniu', why: 'Po nocy jesteś odwodniony, a pragnienie łatwo pomylić z głodem.' },
  { t: 'Zjedz białko w śniadaniu', why: 'Białko rano najmocniej tłumi apetyt przez resztę dnia.' },
  { t: 'Zważ się rano, przed jedzeniem', why: 'Ten sam moment doby to jedyny sposób, żeby pomiary dało się porównywać.' },
  { t: 'Wyjdź na 10-minutowy spacer', why: 'Krótki ruch po posiłku obniża poziom cukru we krwi.' },
  { t: 'Zaplanuj jutrzejszy obiad', why: 'Głodna improwizacja o 20:00 to główny powód wypadnięcia z diety.' },
  { t: 'Zrób 20 przysiadów do krzesła', why: 'Największa grupa mięśniowa ciała — dwie minuty, a robi robotę.' },
  { t: 'Zjedz warzywa do dwóch posiłków', why: 'Objętość bez kalorii to najprostszy trik na sytość.' },
  { t: 'Nie pij dziś nic słodkiego', why: 'Płynne kalorie nie sycą, a potrafią zjeść cały dzienny deficyt.' },
  { t: 'Idź spać 30 minut wcześniej', why: 'Sen poniżej 6 godzin podnosi głód i obniża sytość następnego dnia.' },
  { t: 'Zrób 3 serie deski (plank)', why: 'Mocny tułów to mniej bólu krzyża przy większej masie ciała.' },
  { t: 'Przygotuj jedzenie na jutro', why: 'Gotowy pojemnik w lodówce wygrywa z każdą pokusą.' },
  { t: 'Zjedz posiłek bez telefonu i telewizora', why: 'Jedzenie na autopilocie to średnio 15–20% więcej kalorii.' },
  { t: 'Wejdź dziś schodami zamiast windą', why: 'Drobne decyzje sumują się w tygodniu bardziej niż jeden trening.' },
  { t: 'Wypij 2 litry wody', why: 'Odwodnienie potrafi udawać głód i obniża wydolność na treningu.' },
  { t: 'Zrób sesję na bieżni', why: 'Sesja zrobiona to sesja, której nie musisz odrabiać.' },
  { t: 'Zważ porcję zamiast szacować na oko', why: 'Oko myli się średnio o 30% — zawsze w stronę większej porcji.' },
  { t: 'Zjedz owoc zamiast słodyczy', why: 'Ta sama słodycz, kilka razy mniej kalorii i trochę błonnika.' },
  { t: 'Rozciągnij nogi przez 5 minut', why: 'Po marszu z nachyleniem łydki i uda odwdzięczą się jutro.' },
  { t: 'Zapisz dzisiejszy trening w aplikacji', why: 'To, co zmierzone, łatwiej powtórzyć.' },
  { t: 'Zrób 3 serie pompek o blat', why: 'Góra ciała też potrzebuje bodźca, żeby przetrwać redukcję.' },
  { t: 'Ugotuj obiad na dwa dni', why: 'Jedno gotowanie, dwa posiłki pod kontrolą.' },
  { t: 'Nie podjadaj po kolacji', why: 'Wieczorne podjadanie to najczęstszy cichy nadmiar kalorii.' },
  { t: 'Zrób 8 tysięcy kroków', why: 'To około 300 kcal deficytu bez żadnego treningu.' },
  { t: 'Sprawdź skład kupowanego produktu', why: 'Cukier w rzeczach "fit" to reguła, nie wyjątek.' },
  { t: 'Zjedz zupę na obiad', why: 'Duża objętość, mało kalorii, długa sytość.' },
  { t: 'Odłóż widelec między kęsami', why: 'Sygnał sytości dociera do mózgu po 15–20 minutach.' },
  { t: 'Wypij wodę przed posiłkiem', why: 'Pół litra przed jedzeniem realnie zmniejsza zjadaną porcję.' },
  { t: 'Zrób trening siłowy A lub B', why: 'Siła decyduje, czy tracisz tłuszcz, czy mięśnie.' },
  { t: 'Zmierz obwód talii', why: 'Gdy waga stoi, talia często i tak schodzi — warto to widzieć.' },
  { t: 'Pochwal się przed sobą jednym postępem', why: 'Redukcja to miesiące — trzeba umieć zauważyć, że idzie.' }
];

/* Maskotka: awokado o imieniu Grzesiek. Reaguje na to, ile zrobiłeś
   dzisiaj i jak długa jest Twoja seria. Rysowana w SVG, animowana CSS —
   bez żadnych zewnętrznych plików, działa offline. */
const MASCOT_STATES = {
  sleep: {
    face: 'sleep',
    lines: [
      'Jeszcze śpię. Odhacz coś, to wstanę.',
      'Zzz… obudź mnie pierwszym zadaniem.',
      'Dzień się nie zacznie sam. Ani ja.'
    ]
  },
  awake: {
    face: 'neutral',
    lines: [
      'Dobry początek. Lecimy dalej.',
      'Jedno z głowy. Zostało kilka drobiazgów.',
      'Widzę ruch. Podoba mi się.'
    ]
  },
  happy: {
    face: 'happy',
    lines: [
      'Prawie komplet! Zostało niewiele.',
      'Idzie Ci dziś nieźle.',
      'Jeszcze chwila i mamy pełen dzień.'
    ]
  },
  proud: {
    face: 'proud',
    lines: [
      'Komplet! Tak wygląda dobry dzień.',
      'Wszystko odhaczone. Dokładnie o to chodzi.',
      'Pełen dzień. Powtórz to jutro, a masz nawyk.'
    ]
  }
};

/* Poziomy serii — coś, co widać i czego szkoda przerwać. */
const STREAK_LEVELS = [
  { days: 0,   name: 'Start',        note: 'Pierwszy dzień jest najtrudniejszy.' },
  { days: 3,   name: 'Rozbieg',      note: 'Trzy dni z rzędu. Mózg zaczyna to zauważać.' },
  { days: 7,   name: 'Tydzień',      note: 'Siedem dni. To już nie przypadek.' },
  { days: 14,  name: 'Dwa tygodnie', note: 'Nawyk zaczyna się robić automatyczny.' },
  { days: 30,  name: 'Miesiąc',      note: 'Miesiąc systematyczności. To robi różnicę na wadze.' },
  { days: 60,  name: 'Dwa miesiące', note: 'Na tym etapie widać już zmianę w lustrze.' },
  { days: 100, name: 'Setka',        note: 'Sto dni. Niewielu tu dochodzi.' }
];

function dailyTask(dateStr) {
  /* Deterministyczny wybór z daty — to samo zadanie przez cały dzień. */
  const seed = dateStr.split('-').join('');
  return DAILY_TASKS[Number(seed) % DAILY_TASKS.length];
}

function streakLevel(days) {
  return [...STREAK_LEVELS].reverse().find(l => days >= l.days) || STREAK_LEVELS[0];
}

/* Maskotka w SVG. Mimika sterowana atrybutem data-face, animacje w CSS. */
function mascotSVG(face, sex) {
  const eyes = {
    sleep:   '<path d="M40 52 q8 6 16 0" fill="none" stroke="#2c5b3f" stroke-width="3" stroke-linecap="round"/>' +
             '<path d="M74 52 q8 6 16 0" fill="none" stroke="#2c5b3f" stroke-width="3" stroke-linecap="round"/>',
    neutral: '<circle cx="48" cy="54" r="4.5" fill="#2c5b3f"/><circle cx="82" cy="54" r="4.5" fill="#2c5b3f"/>',
    happy:   '<path d="M40 56 q8 -9 16 0" fill="none" stroke="#2c5b3f" stroke-width="3.5" stroke-linecap="round"/>' +
             '<path d="M74 56 q8 -9 16 0" fill="none" stroke="#2c5b3f" stroke-width="3.5" stroke-linecap="round"/>',
    proud:   '<path d="M40 56 q8 -9 16 0" fill="none" stroke="#2c5b3f" stroke-width="3.5" stroke-linecap="round"/>' +
             '<path d="M74 56 q8 -9 16 0" fill="none" stroke="#2c5b3f" stroke-width="3.5" stroke-linecap="round"/>'
  };
  const mouth = {
    sleep:   '<ellipse cx="65" cy="76" rx="6" ry="8" fill="#2c5b3f" opacity=".7"/>',
    neutral: '<path d="M55 76 q10 6 20 0" fill="none" stroke="#2c5b3f" stroke-width="3" stroke-linecap="round"/>',
    happy:   '<path d="M52 74 q13 14 26 0" fill="#2c5b3f"/>',
    proud:   '<path d="M50 72 q15 20 30 0" fill="#2c5b3f"/>'
  };

  return `<svg class="mascot-svg" viewBox="0 0 130 150" data-face="${face}" role="img"
    aria-label="Maskotka Grzesiek — stan: ${face}">
    <g class="mascot-body">
      <!-- ciało awokado -->
      <path d="M65 14 c26 0 44 22 44 50 c0 32 -20 62 -44 62 c-24 0 -44 -30 -44 -62 c0 -28 18 -50 44 -50 z"
            fill="#6bbf8e"/>
      <path d="M65 26 c20 0 34 18 34 40 c0 26 -15 50 -34 50 c-19 0 -34 -24 -34 -50 c0 -22 14 -40 34 -40 z"
            fill="#e8f1ea"/>
      <circle cx="65" cy="96" r="20" fill="#c98b3a"/>
      <circle cx="59" cy="90" r="6" fill="#dda85c" opacity=".6"/>
      ${eyes[face] || eyes.neutral}
      ${mouth[face] || mouth.neutral}
      <!-- rumieńce -->
      ${face === 'proud' || face === 'happy'
        ? '<ellipse cx="38" cy="68" rx="7" ry="4.5" fill="#e8918b" opacity=".55"/>' +
          '<ellipse cx="92" cy="68" rx="7" ry="4.5" fill="#e8918b" opacity=".55"/>' : ''}
      <!-- ręce -->
      <path class="mascot-arm-l" d="M22 78 q-12 8 -10 20" fill="none" stroke="#6bbf8e" stroke-width="7" stroke-linecap="round"/>
      <path class="mascot-arm-r" d="M108 78 q12 8 10 20" fill="none" stroke="#6bbf8e" stroke-width="7" stroke-linecap="round"/>
      ${sex === 'k'
        ? `<g class="mascot-bow">
             <path d="M88 26 q10 -9 15 -1 q-7 5 -15 1z" fill="#e8918b"/>
             <path d="M88 26 q-2 -12 8 -12 q2 8 -8 12z" fill="#e8918b"/>
             <circle cx="90" cy="26" r="3.5" fill="#d97f79"/>
           </g>` : ''}
    </g>
    ${face === 'sleep'
      ? '<text class="mascot-z" x="100" y="34" font-size="17" fill="#6b665d">z</text>' +
        '<text class="mascot-z mascot-z2" x="112" y="22" font-size="12" fill="#6b665d">z</text>' : ''}
  </svg>`;
}
