/* Stan aplikacji — wszystko trzymane lokalnie w przeglądarce (localStorage).
   Żadne dane nie wychodzą na zewnątrz, nie ma serwera ani konta. */

const KEY = 'kuchnia-przepisy-v1';

const DEFAULT_STATE = {
  profile: {
    sex: 'm',
    age: null,
    height: null,
    weight: null,
    target: null,
    activity: 1.375,
    pace: 0.5,
    customGoal: null      // ręcznie ustawiony cel kcal — ma pierwszeństwo
  },
  weights: [],          // [{ date: 'YYYY-MM-DD', kg: 92.4 }]
  favorites: [],        // [recipeId]
  custom: [],           // własne przepisy (ten sam kształt co w RECIPES)
  plan: {},             // { '0-obiad': recipeId }  (dzień 0–6)
  bought: [],           // odhaczone pozycje listy zakupów (dla planSig)
  planSig: null,        // odcisk planu, dla którego zrobiono odhaczenia
  fridge: '',           // ostatnia zawartość lodówki
  habits: {},           // { 'YYYY-MM-DD': { water: true, steps: true, protein: true } }
  workouts: [],         // [{ date, kind: 'biezn'|'sila', minutes, kcal, detail }]
  trainingStart: null   // data startu 12-tygodniowego programu bieżni
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT_STATE);
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT_STATE), ...parsed,
             profile: { ...DEFAULT_STATE.profile, ...(parsed.profile || {}) } };
  } catch (e) {
    console.warn('Nie udało się wczytać zapisanych danych, startuję od zera.', e);
    return structuredClone(DEFAULT_STATE);
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {
    alert('Nie udało się zapisać danych. Sprawdź, czy przeglądarka nie blokuje pamięci lokalnej.');
  }
}

const Store = {
  get: () => state,

  update(fn) {
    fn(state);
    save();
  },

  reset() {
    state = structuredClone(DEFAULT_STATE);
    save();
  },

  export() {
    return JSON.stringify(state, null, 2);
  },

  import(json) {
    const parsed = JSON.parse(json);
    state = { ...structuredClone(DEFAULT_STATE), ...parsed };
    save();
  },

  /* --- przepisy --- */
  allRecipes() {
    return [...RECIPES, ...state.custom];
  },

  recipe(id) {
    return this.allRecipes().find(r => r.id === id) || null;
  },

  toggleFavorite(id) {
    const i = state.favorites.indexOf(id);
    if (i === -1) state.favorites.push(id);
    else state.favorites.splice(i, 1);
    save();
  },

  isFavorite: id => state.favorites.includes(id)
};

/* ---------- Kalkulacje trenerskie ---------- */

const Calc = {
  /* Mifflin-St Jeor — obecnie najlepiej zwalidowany wzór na spoczynkową
     przemianę materii dla osób bez pomiaru składu ciała. */
  bmr({ sex, weight, height, age }) {
    if (!weight || !height || !age) return null;
    const base = 10 * weight + 6.25 * height - 5 * age;
    return Math.round(sex === 'm' ? base + 5 : base - 161);
  },

  tdee(profile) {
    const b = this.bmr(profile);
    return b ? Math.round(b * (profile.activity || 1.375)) : null;
  },

  /* Cel kaloryczny = TDEE minus deficyt, ale nigdy poniżej BMR — schodzenie
     pod spoczynkową przemianę materii to prosta droga do utraty mięśni. */
  goal(profile) {
    /* Ręcznie ustawiony cel wygrywa ze wzorem — to Twoja decyzja,
       aplikacja ma ją respektować, a nie nadpisywać. */
    if (profile.customGoal) return profile.customGoal;
    const t = this.tdee(profile);
    if (!t) return null;
    const pace = PACE.find(p => p.id === Number(profile.pace)) || PACE[1];
    const floor = this.bmr(profile);
    return Math.max(t - pace.deficit, floor);
  },

  /* Cel wyliczony ze wzoru — potrzebny, by pokazać różnicę wobec
     celu ustawionego ręcznie. */
  suggestedGoal(profile) {
    return this.goal({ ...profile, customGoal: null });
  },

  /* Białko liczymy od masy docelowej, nie aktualnej. Przy otyłości
     nadmiar masy to głównie tkanka tłuszczowa, która nie potrzebuje
     białka — liczenie od 108 kg dałoby 194 g dziennie, czyli porcję
     nie do zjedzenia i bez uzasadnienia. */
  macros(profile) {
    const kcal = this.goal(profile);
    if (!kcal || !profile.weight) return null;
    const ref = profile.target && profile.target < profile.weight ? profile.target : profile.weight;
    const protein = Math.round(ref * 1.8);
    const fat = Math.round((kcal * 0.27) / 9);                 // ~27% energii
    const carbs = Math.round((kcal - protein * 4 - fat * 9) / 4);
    return { protein, fat, carbs: Math.max(carbs, 0) };
  },

  bmi({ weight, height }) {
    if (!weight || !height) return null;
    return +(weight / Math.pow(height / 100, 2)).toFixed(1);
  },

  bmiLabel(bmi) {
    if (bmi === null) return '';
    if (bmi < 18.5) return 'niedowaga';
    if (bmi < 25) return 'waga prawidłowa';
    if (bmi < 30) return 'nadwaga';
    if (bmi < 35) return 'otyłość I stopnia';
    if (bmi < 40) return 'otyłość II stopnia';
    return 'otyłość III stopnia';
  },

  /* Realne tempo chudnięcia wynika z FAKTYCZNEGO deficytu, a nie z tego,
     co wybrano w formularzu. Gdy cel zostaje podniesiony do podłogi BMR,
     deficyt jest mniejszy — i prognoza musi to uwzględnić, inaczej
     obiecuje termin nawet dwukrotnie za krótki. */
  realDeficit(profile) {
    const t = this.tdee(profile), g = this.goal(profile);
    return t && g ? Math.max(t - g, 0) : null;
  },

  /* 7700 kcal ≈ 1 kg tkanki tłuszczowej — przybliżenie, ale powszechnie
     przyjęte i wystarczające do prognozy. */
  realPace(profile) {
    const d = this.realDeficit(profile);
    return d === null ? null : +((d * 7) / 7700).toFixed(2);
  },

  /* Czy wybrane tempo jest w ogóle osiągalne bez schodzenia poniżej BMR. */
  paceClipped(profile) {
    const chosen = PACE.find(p => p.id === Number(profile.pace)) || PACE[1];
    const real = this.realPace(profile);
    return real !== null && real < chosen.id - 0.05 ? { chosen: chosen.id, real } : null;
  },

  weeksToGoal(profile) {
    const { weight, target } = profile;
    if (!weight || !target || weight <= target) return null;
    const pace = this.realPace(profile);
    if (!pace || pace <= 0) return null;
    return Math.ceil((weight - target) / pace);
  },

  /* Średnia krocząca z 7 dni — jedyna sensowna miara postępu. */
  trend(weights) {
    if (weights.length < 2) return null;
    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const last = sorted.slice(-7);
    const prev = sorted.slice(-14, -7);
    if (!prev.length) return null;
    const avg = arr => arr.reduce((s, w) => s + w.kg, 0) / arr.length;
    return +(avg(last) - avg(prev)).toFixed(2);
  }
};
