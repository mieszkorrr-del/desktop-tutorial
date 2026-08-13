/* Logika aplikacji: widoki, dopasowanie z lodówki, plan, zakupy, postępy. */

const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

const norm = s => (s || '').toString().toLowerCase().trim();
const today = () => new Date().toISOString().slice(0, 10);
const fmt = n => Number.isInteger(n) ? String(n) : n.toFixed(1).replace('.', ',');

/* Pola wagi przyjmują i przecinek, i kropkę — po polsku naturalnie pisze
   się "92,4", a pole type="number" odrzuciłoby przecinek razem z resztą
   wpisu, zamieniając 92,4 na 924. */
function parseNum(value) {
  const n = parseFloat(String(value).replace(',', '.').replace(/\s/g, ''));
  return Number.isFinite(n) ? n : null;
}

/* Aktualna waga to zawsze najnowszy pomiar według DATY, nie ostatnio
   wpisany. Bez tego uzupełnienie historii wstecz przestawiałoby profil
   na starą wagę. */
function latestWeight(weights) {
  if (!weights.length) return null;
  return [...weights].sort((a, b) => a.date.localeCompare(b.date)).at(-1).kg;
}

/* ============================================================
   NAWIGACJA
   ============================================================ */
function showView(name) {
  $$('.view').forEach(v => v.classList.toggle('is-active', v.id === 'view-' + name));
  $$('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.view === name));
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (name === 'panel') renderPanel();
  if (name === 'treningi') renderTraining();
  if (name === 'plan') renderPlan();
  if (name === 'zakupy') renderShopping();
  if (name === 'postepy') renderProgress();
  if (name === 'profil') renderProfile();
}

$('#tabs').addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (tab) showView(tab.dataset.view);
});

document.addEventListener('click', e => {
  const go = e.target.closest('[data-goto]');
  if (go) showView(go.dataset.goto);
});

/* ============================================================
   MODAL
   ============================================================ */
function openModal(html) {
  $('#modal-content').innerHTML = html;
  $('#modal').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}
function closeModal() {
  $('#modal').classList.add('hidden');
  $('#modal-content').innerHTML = '';
  document.body.style.overflow = '';
}
$('#modal').addEventListener('click', e => { if (e.target.closest('[data-close]')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

/* ============================================================
   PANEL
   ============================================================ */
function renderPanel() {
  const s = Store.get();
  const p = s.profile;
  const ready = p.weight && p.height && p.age;
  $('#panel-setup').classList.toggle('hidden', !!ready);

  const goal = Calc.goal(p);
  const macros = Calc.macros(p);
  const bmi = Calc.bmi(p);
  const weeks = Calc.weeksToGoal(p);
  const trend = Calc.trend(s.weights);
  const lost = s.weights.length && p.target
    ? +( [...s.weights].sort((a,b)=>a.date.localeCompare(b.date))[0].kg - p.weight ).toFixed(1)
    : null;

  const stats = [];
  stats.push(card('Cel kaloryczny', goal ? goal : '—', goal ? 'kcal / dzień' : '',
    goal ? `Zapotrzebowanie: ${Calc.tdee(p)} kcal` : 'Uzupełnij profil'));
  stats.push(card('Białko na dziś', macros ? macros.protein : '—', 'g',
    macros ? `Tłuszcze ${macros.fat} g · Węgle ${macros.carbs} g` : ''));
  stats.push(card('BMI', bmi ?? '—', '', bmi ? Calc.bmiLabel(bmi) : ''));

  if (p.weight && p.target) {
    stats.push(card('Do celu', +(p.weight - p.target).toFixed(1), 'kg',
      weeks ? `ok. ${weeks} tyg. w tym tempie` : 'Cel osiągnięty 🎉', weeks ? '' : 'good'));
  }
  if (trend !== null) {
    stats.push(card('Trend (7 dni)', (trend > 0 ? '+' : '') + fmt(trend), 'kg',
      trend < 0 ? 'Idzie w dobrą stronę' : trend === 0 ? 'Stoi w miejscu' : 'Wzrost — sprawdź porcje',
      trend < 0 ? 'good' : trend > 0 ? 'warn' : ''));
  }
  if (lost !== null && lost > 0) {
    stats.push(card('Zrzucone', fmt(lost), 'kg', 'od pierwszego pomiaru', 'good'));
  }
  const burnedToday = s.workouts.filter(x => x.date === today()).reduce((t, x) => t + x.kcal, 0);
  if (burnedToday) {
    /* Świadomie NIE dodajemy tego do puli kalorii na jedzenie — szacunki
       spalania zawyżają, a "odjadanie" treningu to najczęstszy powód
       stojącej wagi mimo regularnych ćwiczeń. */
    stats.push(card('Trening dziś', burnedToday, 'kcal', 'nie doliczaj tego do jedzenia', 'good'));
  }
  $('#panel-stats').innerHTML = stats.join('');

  /* dzisiejszy plan */
  const dayIdx = (new Date().getDay() + 6) % 7;   // pon = 0
  const slots = ['sniadanie', 'obiad', 'kolacja', 'przekaska', 'deser'];
  let sum = 0;
  const rows = slots.map(m => {
    const e = planEntry(`${dayIdx}-${m}`);
    if (e) sum += Math.round(e.r.kcal * e.n);
    return `<div class="today-row">
      <span class="meal">${MEALS[m]}</span>
      <span>${e
        ? esc(e.r.name) + portionLabel(e.n) + ` <span class="muted">${Math.round(e.r.kcal * e.n)} kcal</span>`
        : '<span class="muted">—</span>'}</span>
    </div>`;
  }).join('');
  const diff = goal ? goal - sum : null;
  $('#panel-today').innerHTML = rows + `
    <div class="today-row"><strong>${DAYS[dayIdx]} razem</strong><strong>${sum} kcal</strong></div>
    ${goal ? `<p class="small ${diff < 0 ? 'stat-note warn' : 'stat-note good'}" style="margin-top:.5rem">
      ${diff >= 0 ? `Zostało ${diff} kcal do celu.` : `Przekroczone o ${Math.abs(diff)} kcal.`}
    </p>` : ''}
    <button class="btn btn-ghost btn-sm" data-goto="plan">Edytuj plan</button>`;

  /* nawyki */
  const h = s.habits[today()] || {};
  const habits = [
    ['water', '2 litry wody'],
    ['steps', '8–10 tys. kroków'],
    ['protein', 'Białko w każdym posiłku']
  ];
  $('#panel-habits').innerHTML = habits.map(([k, label]) => `
    <label class="habit ${h[k] ? 'done' : ''}">
      <input type="checkbox" data-habit="${k}" ${h[k] ? 'checked' : ''}> ${label}
    </label>`).join('');

  $('#panel-tip').textContent = TIPS[tipIndex % TIPS.length];
}

function card(label, value, unit, note, cls = '') {
  return `<div class="stat">
    <div class="stat-label">${label}</div>
    <div class="stat-value">${value}${unit ? ` <span class="stat-unit">${unit}</span>` : ''}</div>
    ${note ? `<div class="stat-note ${cls}">${note}</div>` : ''}
  </div>`;
}

let tipIndex = Math.floor(Math.random() * TIPS.length);
$('#tip-next').addEventListener('click', () => {
  tipIndex++;
  $('#panel-tip').textContent = TIPS[tipIndex % TIPS.length];
});

$('#panel-habits').addEventListener('change', e => {
  const key = e.target.dataset.habit;
  if (!key) return;
  Store.update(s => {
    s.habits[today()] = { ...(s.habits[today()] || {}), [key]: e.target.checked };
  });
  renderPanel();
});

/* ============================================================
   CO MAM W LODÓWCE
   ============================================================ */
function isStaple(name) {
  const n = norm(name);
  return STAPLES.some(st => n.includes(st));
}

/* Czy składnik przepisu jest pokryty przez to, co wpisał użytkownik. */
function covered(ingName, tokens) {
  const ing = norm(ingName);
  return tokens.some(t => {
    if (t.length < 3) return false;
    if (ing.includes(t)) return true;
    const aliases = ALIASES[t];
    if (aliases && aliases.some(a => ing.includes(norm(a)))) return true;
    // krótki rdzeń: "pomidory" ↔ "pomidorki", "brokuły" ↔ "brokuł"
    const stem = t.slice(0, Math.max(4, t.length - 2));
    return stem.length >= 4 && ing.includes(stem);
  });
}

function matchRecipes(text, meal) {
  const tokens = text.split(/[,;\n]+/).map(norm).filter(Boolean);
  if (!tokens.length) return [];

  return Store.allRecipes()
    .filter(r => meal === 'all' || r.meal === meal)
    .map(r => {
      const real = r.ingredients.filter(i => !isStaple(i.name));
      const have = real.filter(i => covered(i.name, tokens));
      const missing = real.filter(i => !covered(i.name, tokens));
      return { recipe: r, have, missing, score: real.length ? have.length / real.length : 0 };
    })
    .filter(m => m.have.length > 0)
    .sort((a, b) => b.score - a.score || a.missing.length - b.missing.length);
}

let fridgeMeal = 'all';
$('#fridge-meal').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  fridgeMeal = chip.dataset.meal;
  $$('#fridge-meal .chip').forEach(c => c.classList.toggle('is-active', c === chip));
  if ($('#fridge-input').value.trim()) runFridge();
});

$('#fridge-go').addEventListener('click', runFridge);
$('#fridge-input').addEventListener('keydown', e => {
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runFridge();
});

function runFridge() {
  const text = $('#fridge-input').value;
  Store.update(s => { s.fridge = text; });

  const matches = matchRecipes(text, fridgeMeal);
  const box = $('#fridge-results');

  if (!text.trim()) {
    box.innerHTML = `<div class="card empty">Wpisz, co masz w lodówce, a poszukam propozycji.</div>`;
    return;
  }
  if (!matches.length) {
    box.innerHTML = `<div class="card empty">
      Nic nie pasuje do tych produktów${fridgeMeal !== 'all' ? ` w kategorii „${MEALS[fridgeMeal]}”` : ''}.
      Spróbuj wpisać prostsze nazwy (np. „kurczak” zamiast „filet z piersi kurczaka”)
      albo wybierz „Wszystko”.
    </div>`;
    return;
  }

  const ready = matches.filter(m => m.missing.length === 0);
  const almost = matches.filter(m => m.missing.length > 0 && m.missing.length <= 2);
  const rest = matches.filter(m => m.missing.length > 2).slice(0, 6);

  let html = '';
  if (ready.length) html += group('Zrobisz od ręki — masz wszystko', ready);
  if (almost.length) html += group('Blisko — brakuje 1–2 rzeczy', almost);
  if (rest.length) html += group('Warto dokupić kilka składników', rest);
  box.innerHTML = html;
}

function group(title, list) {
  return `<h3 class="group-title">${title} <span class="muted small">(${list.length})</span></h3>
    <div class="recipe-grid">${list.map(fridgeCard).join('')}</div>`;
}

function fridgeCard(m) {
  const r = m.recipe;
  const pct = Math.round(m.score * 100);
  return `<article class="recipe" data-recipe="${r.id}">
    <div class="recipe-head">
      <span class="recipe-name">${esc(r.name)}</span>
      <button class="fav-btn ${Store.isFavorite(r.id) ? 'on' : ''}" data-fav="${r.id}" title="Ulubione">★</button>
    </div>
    <div class="recipe-meta">
      <span class="pill kcal">${r.kcal} kcal</span>
      <span class="pill">${MEALS[r.meal]}</span>
      <span class="pill">${r.time} min</span>
    </div>
    <div class="match-bar"><i style="width:${pct}%"></i></div>
    <div class="have">Masz ${m.have.length} z ${m.have.length + m.missing.length} składników</div>
    ${m.missing.length
      ? `<div class="missing">Brakuje: ${m.missing.map(i => esc(i.name)).join(', ')}</div>`
      : `<div class="have">✔ Komplet — możesz gotować</div>`}
  </article>`;
}

/* ============================================================
   TRENINGI
   ============================================================ */
const INTENSITY = {
  biezn: [
    { id: 'marsz', label: 'Marsz 4,5–5 km/h, płasko' },
    { id: 'marsz_szybki', label: 'Marsz szybki 5,5–6 km/h' },
    { id: 'marsz_nachylenie', label: 'Marsz z nachyleniem 4–6%' },
    { id: 'marsz_stromy', label: 'Marsz stromy 8–12%' },
    { id: 'trucht', label: 'Trucht 8 km/h' }
  ],
  sila: [{ id: 'sila', label: 'Trening oporowy' }],
  spacer: [
    { id: 'marsz_wolny', label: 'Spacer spokojny' },
    { id: 'marsz', label: 'Spacer żwawy' }
  ]
};

/* Kalorie = MET × masa ciała × czas. Liczymy z Twojej wagi, dlatego wynik
   różni się od licznika bieżni, który masy nie zna. */
function burned(metKey, minutes, weight) {
  if (!weight || !minutes) return 0;
  return Math.round((MET[metKey] || 4) * weight * (minutes / 60));
}

function trainingWeek() {
  const s = Store.get();
  if (!s.trainingStart) return 1;
  const days = Math.floor((Date.parse(today()) - Date.parse(s.trainingStart)) / 864e5);
  return Math.min(12, Math.max(1, Math.floor(days / 7) + 1));
}

function fillIntensity() {
  const kind = $('#t-kind').value;
  $('#t-int').innerHTML = INTENSITY[kind].map(i => `<option value="${i.id}">${i.label}</option>`).join('');
  previewBurn();
}

function previewBurn() {
  const w = Store.get().profile.weight;
  const min = parseNum($('#t-min').value);
  if (!w) { $('#t-preview').textContent = 'Uzupełnij wagę w Profilu, żeby liczyć spalone kalorie.'; return; }
  if (!min) { $('#t-preview').textContent = ''; return; }
  $('#t-preview').textContent =
    `Szacunek: ok. ${burned($('#t-int').value, min, w)} kcal przy masie ${fmt(w)} kg.`;
}

$('#t-kind').addEventListener('change', fillIntensity);
$('#t-int').addEventListener('change', previewBurn);
$('#t-min').addEventListener('input', previewBurn);

$('#t-add').addEventListener('click', () => {
  const min = parseNum($('#t-min').value);
  if (!min || min < 1 || min > 300) { alert('Podaj czas treningu w minutach (1–300).'); return; }
  const kind = $('#t-kind').value;
  const metKey = $('#t-int').value;
  const w = Store.get().profile.weight;

  Store.update(s => {
    if (!s.trainingStart) s.trainingStart = today();
    s.workouts.push({
      date: today(), kind, minutes: min,
      kcal: burned(metKey, min, w),
      detail: (INTENSITY[kind].find(i => i.id === metKey) || {}).label || ''
    });
  });
  $('#t-min').value = '';
  renderTraining();
  renderPanel();
});

let ttipIndex = Math.floor(Math.random() * TRAINING_TIPS.length);
$('#ttip-next').addEventListener('click', () => {
  ttipIndex++;
  $('#training-tip').textContent = TRAINING_TIPS[ttipIndex % TRAINING_TIPS.length];
});

$('#training-history').addEventListener('click', e => {
  const btn = e.target.closest('[data-del-workout]');
  if (!btn) return;
  Store.update(s => { s.workouts.splice(+btn.dataset.delWorkout, 1); });
  renderTraining();
  renderPanel();
});

function renderTraining() {
  const s = Store.get();
  const w = s.profile.weight;
  const bmi = Calc.bmi(s.profile);

  /* Wprowadzenie dobrane do masy ciała — przy BMI powyżej 30 plan
     świadomie omija bieganie i skoki. */
  $('#training-intro').innerHTML = `
    <h2>Twój plan: bieżnia + siła w domu</h2>
    ${bmi && bmi >= 30 ? `
      <p class="tip-box"><strong>Dlaczego marsz, a nie bieg.</strong>
      Przy BMI ${bmi} każdy krok biegu obciąża kolano siłą rzędu 3–4× masy ciała,
      marsz — około 1,2×. Marsz z nachyleniem daje porównywalne spalanie
      przy ułamku obciążenia stawów. Bieg wchodzi do planu dopiero w 10. tygodniu
      i tylko wtedy, gdy nie masz bólu kolan ani stóp.</p>
      <p class="muted small">Przy BMI powyżej 30 warto zrobić podstawowe badania
      i skonsultować start z lekarzem — zwłaszcza jeśli masz nadciśnienie,
      cukrzycę, problemy z sercem albo od dawna nie ćwiczyłeś.</p>` : ''}
    <p class="muted">Trzy do czterech sesji bieżni tygodniowo plus dwa treningi siłowe.
    Cardio robi deficyt, siła decyduje o tym, czy tracisz tłuszcz, czy mięśnie.</p>`;

  /* statystyki */
  const week = trainingWeek();
  const wk = new Date(); wk.setDate(wk.getDate() - 6);
  const weekStart = wk.toISOString().slice(0, 10);
  const last7 = s.workouts.filter(x => x.date >= weekStart);
  const kcal7 = last7.reduce((t, x) => t + x.kcal, 0);
  const min7 = last7.reduce((t, x) => t + x.minutes, 0);
  const todayKcal = s.workouts.filter(x => x.date === today()).reduce((t, x) => t + x.kcal, 0);

  $('#training-stats').innerHTML = [
    card('Tydzień programu', week, `z 12`, TREADMILL[week - 1].desc.slice(0, 60) + '…'),
    card('Sesje (7 dni)', last7.length, '', `${min7} minut łącznie`),
    card('Spalone (7 dni)', kcal7, 'kcal', kcal7 ? `ok. ${(kcal7 / 7700).toFixed(2)} kg tłuszczu` : ''),
    card('Spalone dziś', todayKcal, 'kcal', todayKcal ? 'dobra robota' : 'jeszcze nic', todayKcal ? 'good' : '')
  ].join('');

  /* aktualny tydzień bieżni */
  const t = TREADMILL[week - 1];
  const est = w ? burned(t.met, t.minutes, w) : null;
  $('#treadmill-now').innerHTML = `
    <div class="tip-box">
      <strong>Tydzień ${t.week}:</strong> ${t.sessions} sesje × ${t.minutes} min ·
      prędkość ${t.speed} km/h · nachylenie ${t.incline}
      ${est ? `<br><span class="muted">Szacunkowo ok. ${est} kcal na sesję, ${est * t.sessions} kcal w tygodniu.</span>` : ''}
      <p style="margin:.6rem 0 0">${t.desc}</p>
    </div>
    ${!s.trainingStart ? '<p class="muted small">Program wystartuje przy pierwszym zapisanym treningu.</p>' : ''}`;

  $('#treadmill-all').innerHTML = TREADMILL.map(x => `
    <div class="today-row ${x.week === week ? '' : 'muted'}">
      <span class="meal">Tydzień ${x.week}</span>
      <span>${x.sessions} × ${x.minutes} min · ${x.speed} km/h · ${x.incline}</span>
    </div>`).join('');

  /* siła */
  const block = (key, el) => {
    const b = STRENGTH[key];
    $(el).innerHTML = `<h2>${esc(b.name)}</h2>
      ${b.exercises.map(x => `
        <details class="slot" style="margin-bottom:.4rem">
          <summary><strong>${esc(x.name)}</strong> <span class="muted">· ${x.sets}</span></summary>
          <p style="margin:.5rem 0 .2rem">${esc(x.how)}</p>
          <p class="muted small" style="margin:0">${esc(x.why)}</p>
        </details>`).join('')}
      <p class="muted small">Przerwa między seriami 60–90 s. Ostatnie 2 powtórzenia mają być trudne.</p>`;
  };
  block('A', '#strength-a');
  block('B', '#strength-b');

  $('#week-template').innerHTML = WEEK_TEMPLATE.map(d => `
    <div class="today-row"><span class="meal">${d.day}</span><span>${d.plan}</span></div>`).join('');

  $('#training-tip').textContent = TRAINING_TIPS[ttipIndex % TRAINING_TIPS.length];

  $('#training-history').innerHTML = s.workouts.length
    ? [...s.workouts].map((x, i) => ({ x, i })).reverse().slice(0, 30).map(({ x, i }) => `
        <div class="hist-row">
          <span>${x.date}</span>
          <span>${esc(x.detail)} · ${x.minutes} min</span>
          <span><strong>${x.kcal} kcal</strong></span>
          <button class="hist-del" data-del-workout="${i}">usuń</button>
        </div>`).join('')
    : '<div class="empty">Brak zapisanych treningów. Pierwszy wpis uruchamia program.</div>';
}

/* ============================================================
   PRZEPISY
   ============================================================ */
let filters = { meal: 'all', q: '', kcal: null, time: null, tag: '' };

function initTagFilter() {
  const tags = [...new Set(Store.allRecipes().flatMap(r => r.tags || []))].sort();
  $('#filter-tag').innerHTML = '<option value="">— dowolny —</option>' +
    tags.map(t => `<option value="${esc(t)}">${esc(t)}</option>`).join('');
}

function renderRecipes() {
  let list = Store.allRecipes();

  if (filters.meal === 'fav') list = list.filter(r => Store.isFavorite(r.id));
  else if (filters.meal !== 'all') list = list.filter(r => r.meal === filters.meal);

  if (filters.q) {
    const q = norm(filters.q);
    list = list.filter(r =>
      norm(r.name).includes(q) ||
      r.ingredients.some(i => norm(i.name).includes(q)) ||
      (r.tags || []).some(t => norm(t).includes(q)));
  }
  if (filters.kcal) list = list.filter(r => r.kcal <= filters.kcal);
  if (filters.time) list = list.filter(r => r.time <= filters.time);
  if (filters.tag) list = list.filter(r => (r.tags || []).includes(filters.tag));

  $('#recipe-count').textContent = list.length
    ? `Znaleziono ${list.length} ${list.length === 1 ? 'przepis' : list.length < 5 ? 'przepisy' : 'przepisów'}.`
    : '';

  $('#recipe-list').innerHTML = list.length
    ? list.map(recipeCard).join('')
    : `<div class="card empty">Brak przepisów spełniających te kryteria.</div>`;
}

function recipeCard(r) {
  const tot = r.protein * 4 + r.fat * 9 + r.carbs * 4 || 1;
  return `<article class="recipe" data-recipe="${r.id}">
    <div class="recipe-head">
      <span class="recipe-name">${esc(r.name)}</span>
      <button class="fav-btn ${Store.isFavorite(r.id) ? 'on' : ''}" data-fav="${r.id}" title="Ulubione">★</button>
    </div>
    <div class="recipe-meta">
      <span class="pill kcal">${r.kcal} kcal</span>
      <span class="pill">${MEALS[r.meal]}</span>
      <span class="pill">${r.time} min</span>
      ${r.custom ? '<span class="pill">własny</span>' : ''}
    </div>
    <div class="macro-bar">
      <span style="width:${r.protein * 4 / tot * 100}%"></span>
      <span style="width:${r.fat * 9 / tot * 100}%"></span>
      <span style="width:${r.carbs * 4 / tot * 100}%"></span>
    </div>
    <div class="macro-legend">
      <span>B ${r.protein} g</span><span>T ${r.fat} g</span><span>W ${r.carbs} g</span>
    </div>
  </article>`;
}

$('#search').addEventListener('input', e => { filters.q = e.target.value; renderRecipes(); });
$('#filter-kcal').addEventListener('input', e => { filters.kcal = +e.target.value || null; renderRecipes(); });
$('#filter-time').addEventListener('input', e => { filters.time = +e.target.value || null; renderRecipes(); });
$('#filter-tag').addEventListener('change', e => { filters.tag = e.target.value; renderRecipes(); });
$('#filter-meal').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  filters.meal = chip.dataset.meal;
  $$('#filter-meal .chip').forEach(c => c.classList.toggle('is-active', c === chip));
  renderRecipes();
});

/* klik w kartę przepisu (działa też w widoku lodówki) */
document.addEventListener('click', e => {
  const fav = e.target.closest('[data-fav]');
  if (fav) {
    e.stopPropagation();
    Store.toggleFavorite(fav.dataset.fav);
    fav.classList.toggle('on');
    if (filters.meal === 'fav') renderRecipes();
    return;
  }
  const card = e.target.closest('[data-recipe]');
  if (card && !e.target.closest('.modal')) openRecipe(card.dataset.recipe);
});

function openRecipe(id, servings) {
  const r = Store.recipe(id);
  if (!r) return;
  const n = servings || r.servings;
  const k = n / r.servings;

  openModal(`
    <h2>${esc(r.name)}</h2>
    <div class="recipe-meta" style="margin-bottom:.9rem">
      <span class="pill kcal">${r.kcal} kcal / porcja</span>
      <span class="pill">B ${r.protein} g</span>
      <span class="pill">T ${r.fat} g</span>
      <span class="pill">W ${r.carbs} g</span>
      <span class="pill">${r.time} min</span>
      <span class="pill">${MEALS[r.meal]}</span>
    </div>
    ${(r.tags || []).length ? `<div class="recipe-meta" style="margin-bottom:.9rem">
      ${r.tags.map(t => `<span class="pill">${esc(t)}</span>`).join('')}</div>` : ''}

    <div class="serving-ctl">
      <button data-serv="${Math.max(1, n - 1)}" data-id="${r.id}" ${n <= 1 ? 'disabled' : ''}>−</button>
      <strong>${n} ${n === 1 ? 'porcja' : n < 5 ? 'porcje' : 'porcji'}</strong>
      <button data-serv="${n + 1}" data-id="${r.id}">+</button>
      <span class="muted small">razem ${Math.round(r.kcal * n)} kcal</span>
    </div>

    <h3>Składniki</h3>
    <ul class="ing-list">
      ${r.ingredients.map(i => `<li>
        <span>${esc(i.name)}</span>
        <span class="ing-qty">${fmt(+(i.qty * k).toFixed(2))} ${esc(i.unit)}</span>
      </li>`).join('')}
    </ul>

    <h3>Przygotowanie</h3>
    <ol>${r.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol>

    ${r.tip ? `<p class="tip-box"><strong>Trener:</strong> ${esc(r.tip)}</p>` : ''}

    <div class="row" style="margin-top:1rem">
      <button class="btn btn-primary" data-plan-add="${r.id}">Dodaj do planu</button>
      <button class="btn btn-ghost" data-fav="${r.id}">
        ${Store.isFavorite(r.id) ? '★ W ulubionych' : '☆ Do ulubionych'}
      </button>
      ${r.custom ? `<button class="btn btn-danger" data-del-recipe="${r.id}">Usuń przepis</button>` : ''}
    </div>
  `);
}

$('#modal').addEventListener('click', e => {
  const serv = e.target.closest('[data-serv]');
  if (serv) openRecipe(serv.dataset.id, +serv.dataset.serv);

  const del = e.target.closest('[data-del-recipe]');
  if (del && confirm('Usunąć ten przepis na stałe?')) {
    Store.update(s => { s.custom = s.custom.filter(r => r.id !== del.dataset.delRecipe); });
    closeModal();
    initTagFilter();
    renderRecipes();
  }

  const add = e.target.closest('[data-plan-add]');
  if (add) { closeModal(); pickSlotFor(add.dataset.planAdd); }
});

/* --- dodawanie własnego przepisu --- */
$('#add-recipe-open').addEventListener('click', () => {
  openModal(`
    <h2>Nowy przepis</h2>
    <p class="muted small">Wartości podaj na jedną porcję. Nie znasz ich dokładnie?
      Wpisz szacunek — lepszy przybliżony wpis niż żaden.</p>
    <form id="recipe-form">
      <div class="form-grid">
        <label class="field">Nazwa <input name="name" required></label>
        <label class="field">Posiłek
          <select name="meal">
            ${Object.entries(MEALS).map(([k, v]) => `<option value="${k}">${v}</option>`).join('')}
          </select>
        </label>
        <label class="field">Liczba porcji <input type="number" name="servings" value="1" min="1" required></label>
        <label class="field">Czas (min) <input type="number" name="time" value="20" min="1" required></label>
        <label class="field">kcal / porcja <input type="number" name="kcal" min="0" required></label>
        <label class="field">Białko (g) <input type="number" name="protein" min="0" value="0"></label>
        <label class="field">Tłuszcze (g) <input type="number" name="fat" min="0" value="0"></label>
        <label class="field">Węglowodany (g) <input type="number" name="carbs" min="0" value="0"></label>
      </div>
      <label class="field">Składniki — jeden na linię, w formacie <em>nazwa; ilość; jednostka</em>
        <textarea name="ingredients" rows="5" required
          placeholder="pierś z kurczaka; 300; g&#10;ryż brązowy; 120; g&#10;papryka czerwona; 200; g"></textarea>
      </label>
      <label class="field">Kroki — jeden na linię
        <textarea name="steps" rows="4" required placeholder="Ugotuj ryż.&#10;Usmaż kurczaka."></textarea>
      </label>
      <label class="field">Tagi (po przecinku)
        <input name="tags" placeholder="wysokobiałkowe, szybkie">
      </label>
      <button class="btn btn-primary" type="submit" style="margin-top:.8rem">Zapisz przepis</button>
    </form>
  `);

  $('#recipe-form').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const servings = +f.get('servings');

    const ingredients = f.get('ingredients').split('\n').map(l => l.trim()).filter(Boolean).map(line => {
      const [name, qty, unit] = line.split(';').map(x => (x || '').trim());
      return { name, qty: parseFloat(String(qty).replace(',', '.')) || 1, unit: unit || 'szt' };
    });

    const recipe = {
      id: 'custom-' + Date.now(),
      custom: true,
      name: f.get('name').trim(),
      meal: f.get('meal'),
      servings,
      time: +f.get('time'),
      kcal: +f.get('kcal'),
      protein: +f.get('protein'),
      fat: +f.get('fat'),
      carbs: +f.get('carbs'),
      tags: f.get('tags').split(',').map(t => t.trim()).filter(Boolean),
      ingredients,
      steps: f.get('steps').split('\n').map(s => s.trim()).filter(Boolean)
    };

    Store.update(s => { s.custom.push(recipe); });
    closeModal();
    initTagFilter();
    renderRecipes();
  });
});

/* ============================================================
   PLAN TYGODNIA
   ============================================================ */
const SLOTS = ['sniadanie', 'obiad', 'kolacja', 'przekaska', 'deser'];

/* Wpis w planie to { id, n } — n to liczba porcji danego przepisu w tym
   posiłku (0,5 / 1 / 1,5 / 2). Starsze wpisy były zwykłym id, więc
   obsługujemy oba kształty. */
function planEntry(key) {
  const raw = Store.get().plan[key];
  if (!raw) return null;
  const id = typeof raw === 'string' ? raw : raw.id;
  const n = typeof raw === 'string' ? 1 : (raw.n || 1);
  const r = Store.recipe(id);
  return r ? { r, n } : null;
}

const portionLabel = n => n === 1 ? '' : ` ×${fmt(n)}`;

function renderPlan() {
  const s = Store.get();
  const goal = Calc.goal(s.profile);

  $('#plan-grid').innerHTML = DAYS.map((day, d) => {
    let sum = 0;
    const slots = SLOTS.map(m => {
      const e = planEntry(`${d}-${m}`);
      if (e) sum += Math.round(e.r.kcal * e.n);
      return `<div class="slot ${e ? 'filled' : ''}" data-slot="${d}-${m}">
        <div class="slot-label">${MEALS[m]}</div>
        ${e ? `${esc(e.r.name)}${portionLabel(e.n)} <span class="muted">· ${Math.round(e.r.kcal * e.n)} kcal</span>`
            : '<span class="muted">+ dodaj</span>'}
      </div>`;
    }).join('');

    let cls = '', note = '';
    if (goal && sum > 0) {
      if (sum > goal) { cls = 'over'; note = `${sum - goal} kcal ponad cel`; }
      else if (sum < goal - 250) { cls = 'under'; note = `${goal - sum} kcal poniżej celu — dołóż posiłek`; }
      else { cls = 'ok'; note = 'w celu'; }
    }
    return `<div class="day">
      <h3>${day}</h3>
      ${slots}
      <div class="day-total ${cls}">
        Razem: ${sum} kcal${goal ? ` / ${goal}` : ''}
        ${note ? `<div class="small" style="font-weight:400">${note}</div>` : ''}
      </div>
    </div>`;
  }).join('');
}

$('#plan-grid').addEventListener('click', e => {
  const slot = e.target.closest('[data-slot]');
  if (slot) pickRecipeForSlot(slot.dataset.slot);
});

function pickRecipeForSlot(key) {
  const [d, meal] = key.split('-');
  const current = planEntry(key);
  const list = Store.allRecipes().filter(r => r.meal === meal);

  openModal(`
    <h2>${DAYS[d]} — ${MEALS[meal]}</h2>
    ${current ? `
      <div class="tip-box" style="margin-bottom:.9rem">
        <strong>${esc(current.r.name)}</strong> — ${Math.round(current.r.kcal * current.n)} kcal
        <div class="serving-ctl" style="margin:.6rem 0 0">
          <button data-portion="${key}|${Math.max(0.5, current.n - 0.5)}" ${current.n <= 0.5 ? 'disabled' : ''}>−</button>
          <strong>${fmt(current.n)} ${current.n === 1 ? 'porcja' : 'porcji'}</strong>
          <button data-portion="${key}|${current.n + 0.5}">+</button>
          <button class="btn btn-danger btn-sm" data-slot-clear="${key}" style="width:auto;margin-left:auto">Usuń</button>
        </div>
      </div>` : ''}
    <input type="search" id="slot-search" placeholder="Szukaj…" style="margin-bottom:.8rem">
    <div id="slot-list">${list.map(r => slotOption(key, r)).join('')}</div>
  `);

  $('#slot-search').addEventListener('input', e => {
    const q = norm(e.target.value);
    $('#slot-list').innerHTML = list
      .filter(r => norm(r.name).includes(q))
      .map(r => slotOption(key, r)).join('');
  });
}

function slotOption(key, r) {
  return `<div class="slot" data-pick="${key}|${r.id}" style="margin-bottom:.35rem">
    <strong>${esc(r.name)}</strong> <span class="muted">· ${r.kcal} kcal · ${r.time} min</span>
  </div>`;
}

/* wybór przepisu do slotu (z listy) */
$('#modal').addEventListener('click', e => {
  const pick = e.target.closest('[data-pick]');
  if (pick) {
    const [key, id] = pick.dataset.pick.split('|');
    Store.update(s => { s.plan[key] = { id, n: 1 }; });
    closeModal();
    renderPlan();
  }
  const portion = e.target.closest('[data-portion]');
  if (portion) {
    const [key, n] = portion.dataset.portion.split('|');
    Store.update(s => {
      const cur = s.plan[key];
      const id = typeof cur === 'string' ? cur : cur.id;
      s.plan[key] = { id, n: +n };
    });
    renderPlan();
    pickRecipeForSlot(key);
  }
  const clear = e.target.closest('[data-slot-clear]');
  if (clear) {
    Store.update(s => { delete s.plan[clear.dataset.slotClear]; });
    closeModal();
    renderPlan();
  }
});

/* „Dodaj do planu” z widoku przepisu — wybór dnia */
function pickSlotFor(id) {
  const r = Store.recipe(id);
  if (!r) return;
  openModal(`
    <h2>Do którego dnia?</h2>
    <p class="muted">${esc(r.name)} — ${MEALS[r.meal]}</p>
    ${DAYS.map((d, i) => `<div class="slot" data-pick="${i}-${r.meal}|${r.id}" style="margin-bottom:.35rem">
      <strong>${d}</strong>
    </div>`).join('')}
  `);
}

$('#plan-clear').addEventListener('click', () => {
  if (!confirm('Wyczyścić cały plan tygodnia?')) return;
  Store.update(s => { s.plan = {}; });
  renderPlan();
});

/* Automatyczny plan: losuje przepisy tak, żeby dzień mieścił się w celu. */
$('#plan-auto').addEventListener('click', () => {
  const goal = Calc.goal(Store.get().profile);
  if (!goal) {
    alert('Najpierw uzupełnij profil — bez celu kalorycznego nie ma czego dopasowywać.');
    showView('profil');
    return;
  }
  const byMeal = m => Store.allRecipes().filter(r => r.meal === m);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const PORTIONS = [1, 1.5, 2];

  /* Główne posiłki mają zająć ok. 80% celu — resztę zostawiamy na
     przekąskę i deser, żeby dzień nie kończył się głodem o 21:00. */
  Store.update(s => {
    s.plan = {};
    for (let d = 0; d < 7; d++) {
      const mainTarget = goal * 0.8;
      let best = null;

      for (let attempt = 0; attempt < 60; attempt++) {
        const combo = ['sniadanie', 'obiad', 'kolacja'].map(m => {
          const r = pick(byMeal(m));
          return r ? { meal: m, r, n: 1 } : null;
        }).filter(Boolean);
        if (!combo.length) continue;

        // dosypujemy porcje głównych dań, aż zbliżymy się do celu
        let sum = combo.reduce((t, c) => t + c.r.kcal, 0);
        let guard = 0;
        while (sum < mainTarget - 150 && guard++ < 10) {
          const c = combo[guard % combo.length];
          const next = PORTIONS[PORTIONS.indexOf(c.n) + 1];
          if (!next) continue;
          c.n = next;
          sum = combo.reduce((t, x) => t + x.r.kcal * x.n, 0);
        }
        if (!best || Math.abs(mainTarget - sum) < Math.abs(mainTarget - best.sum)) best = { combo, sum };
      }
      if (!best) continue;

      best.combo.forEach(c => { s.plan[`${d}-${c.meal}`] = { id: c.r.id, n: c.n }; });

      // przekąska i deser wypełniają to, co zostało do celu
      let left = goal - best.sum;
      ['przekaska', 'deser'].forEach(m => {
        const fits = byMeal(m).filter(r => r.kcal <= left);
        if (!fits.length) return;
        const r = pick(fits);
        s.plan[`${d}-${m}`] = { id: r.id, n: 1 };
        left -= r.kcal;
      });
    }
  });
  renderPlan();
});

/* ============================================================
   LISTA ZAKUPÓW
   ============================================================ */
$('#shop-build').addEventListener('click', () => { buildShopping(); renderShopping(); });
$('#shop-uncheck').addEventListener('click', () => {
  Store.update(s => { s.bought = []; });
  renderShopping();
});

let shoppingCache = [];

function buildShopping() {
  const s = Store.get();
  const acc = new Map();

  Object.keys(s.plan).forEach(key => {
    const e = planEntry(key);
    if (!e) return;
    const { r, n } = e;
    const perServing = n / r.servings;   // ile całych przepisów potrzeba
    r.ingredients.forEach(i => {
      if (isStaple(i.name) && i.unit === 'szczypta') return;
      const key = `${norm(i.name)}|${norm(i.unit)}`;
      const prev = acc.get(key);
      if (prev) prev.qty += i.qty * perServing;
      else acc.set(key, { name: i.name, unit: i.unit, qty: i.qty * perServing });
    });
  });

  shoppingCache = [...acc.values()]
    .map(i => ({ ...i, qty: Math.ceil(i.qty * 10) / 10 }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));
}

function renderShopping() {
  /* Przebudowa przy każdym wejściu — wcześniej lista zostawała
     nieaktualna po zmianie planu i można było wyjść z nią do sklepu. */
  buildShopping();
  const s = Store.get();

  if (!shoppingCache.length) {
    $('#shop-list').innerHTML = `<div class="empty">
      Lista jest pusta. Ułóż najpierw plan tygodnia — potem wróć tutaj.
      <div style="margin-top:.8rem"><button class="btn btn-primary" data-goto="plan">Przejdź do planu</button></div>
    </div>`;
    return;
  }

  const total = shoppingCache.length;
  const done = shoppingCache.filter(i => s.bought.includes(norm(i.name) + '|' + norm(i.unit))).length;

  $('#shop-list').innerHTML = `
    <p class="muted small">Kupione: ${done} z ${total}</p>
    ${shoppingCache.map(i => {
      const key = norm(i.name) + '|' + norm(i.unit);
      const checked = s.bought.includes(key);
      return `<label class="shop-item ${checked ? 'done' : ''}">
        <input type="checkbox" data-buy="${esc(key)}" ${checked ? 'checked' : ''}>
        <span style="flex:1">${esc(i.name)}</span>
        <span class="muted">${fmt(i.qty)} ${esc(i.unit)}</span>
      </label>`;
    }).join('')}`;
}

$('#shop-list').addEventListener('change', e => {
  const key = e.target.dataset.buy;
  if (!key) return;
  Store.update(s => {
    const i = s.bought.indexOf(key);
    if (e.target.checked && i === -1) s.bought.push(key);
    if (!e.target.checked && i > -1) s.bought.splice(i, 1);
  });
  renderShopping();
});

/* ============================================================
   POSTĘPY
   ============================================================ */
$('#w-add').addEventListener('click', () => {
  const date = $('#w-date').value || today();
  const kg = parseNum($('#w-kg').value);
  if (kg === null || kg < 20 || kg > 400) {
    alert('Podaj wagę w kilogramach, np. 92,4 (przecinek i kropka działają tak samo).');
    return;
  }
  Store.update(s => {
    const existing = s.weights.find(w => w.date === date);
    if (existing) existing.kg = kg;
    else s.weights.push({ date, kg });
    s.profile.weight = latestWeight(s.weights);
  });
  $('#w-kg').value = '';
  $('#w-date').value = today();
  renderProgress();
});

function renderProgress() {
  const s = Store.get();
  $('#w-date').value = $('#w-date').value || today();

  const sorted = [...s.weights].sort((a, b) => a.date.localeCompare(b.date));
  $('#chart').innerHTML = chartSVG(sorted, s.profile.target);

  if (!sorted.length) {
    $('#w-history').innerHTML = `<div class="empty">Brak pomiarów. Pierwszy wpis to początek wykresu.</div>`;
    return;
  }

  $('#w-history').innerHTML = [...sorted].reverse().map((w, i, arr) => {
    const prev = arr[i + 1];
    const d = prev ? +(w.kg - prev.kg).toFixed(1) : null;
    return `<div class="hist-row">
      <span>${w.date}</span>
      <span>${fmt(w.kg)} kg
        ${d !== null && d !== 0 ? `<span class="${d < 0 ? 'delta-down' : 'delta-up'}">${d > 0 ? '+' : ''}${fmt(d)}</span>` : ''}
      </span>
      <button class="hist-del" data-del-weight="${w.date}">usuń</button>
    </div>`;
  }).join('');
}

$('#w-history').addEventListener('click', e => {
  const btn = e.target.closest('[data-del-weight]');
  if (!btn) return;
  Store.update(s => {
    s.weights = s.weights.filter(w => w.date !== btn.dataset.delWeight);
    // po skasowaniu błędnego wpisu profil wraca do najnowszego pomiaru
    const latest = latestWeight(s.weights);
    if (latest !== null) s.profile.weight = latest;
  });
  renderProgress();
});

function chartSVG(data, target) {
  if (data.length < 2) {
    return `<div class="empty">Dodaj co najmniej dwa pomiary, żeby zobaczyć wykres.</div>`;
  }
  const W = 700, H = 260, pad = 40;
  const kgs = data.map(d => d.kg).concat(target ? [target] : []);
  const min = Math.floor(Math.min(...kgs) - 1);
  const max = Math.ceil(Math.max(...kgs) + 1);
  const span = max - min || 1;

  const x = i => pad + (i * (W - pad * 2)) / (data.length - 1);
  const y = kg => H - pad - ((kg - min) / span) * (H - pad * 2);

  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(d.kg).toFixed(1)}`).join(' ');
  const area = `${line} L${x(data.length - 1).toFixed(1)},${H - pad} L${pad},${H - pad} Z`;
  const dots = data.map((d, i) =>
    `<circle cx="${x(i).toFixed(1)}" cy="${y(d.kg).toFixed(1)}" r="3.5" fill="var(--accent)"/>`).join('');

  const gridY = [0, .25, .5, .75, 1].map(f => {
    const kg = min + span * f;
    return `<line x1="${pad}" y1="${y(kg)}" x2="${W - pad}" y2="${y(kg)}" stroke="var(--line)" stroke-width="1"/>
            <text x="4" y="${y(kg) + 4}" font-size="11" fill="var(--ink-soft)">${kg.toFixed(0)}</text>`;
  }).join('');

  const targetLine = target && target >= min && target <= max
    ? `<line x1="${pad}" y1="${y(target)}" x2="${W - pad}" y2="${y(target)}"
             stroke="var(--warn)" stroke-width="1.5" stroke-dasharray="5 4"/>
       <text x="${W - pad}" y="${y(target) - 6}" font-size="11" fill="var(--warn)" text-anchor="end">cel ${fmt(target)} kg</text>`
    : '';

  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Wykres wagi w czasie">
    ${gridY}
    <path d="${area}" fill="var(--accent-soft)" opacity=".7"/>
    <path d="${line}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>
    ${targetLine}${dots}
    <text x="${pad}" y="${H - 12}" font-size="11" fill="var(--ink-soft)">${data[0].date}</text>
    <text x="${W - pad}" y="${H - 12}" font-size="11" fill="var(--ink-soft)" text-anchor="end">${data.at(-1).date}</text>
  </svg>`;
}

/* ============================================================
   PROFIL
   ============================================================ */
function renderProfile() {
  const p = Store.get().profile;

  $('#p-activity').innerHTML = ACTIVITY.map(a =>
    `<option value="${a.id}" ${+p.activity === a.id ? 'selected' : ''}>${a.label}</option>`).join('');
  $('#p-pace').innerHTML = PACE.map(a =>
    `<option value="${a.id}" ${+p.pace === a.id ? 'selected' : ''}>${a.label}</option>`).join('');

  $('#p-sex').value = p.sex;
  $('#p-age').value = p.age ?? '';
  $('#p-height').value = p.height ?? '';
  $('#p-weight').value = p.weight ?? '';
  $('#p-target').value = p.target ?? '';
  $('#p-goal').value = p.customGoal ?? '';

  renderSummary();
}

function renderSummary() {
  const p = Store.get().profile;
  const bmr = Calc.bmr(p), tdee = Calc.tdee(p), goal = Calc.goal(p);
  const macros = Calc.macros(p), bmi = Calc.bmi(p), weeks = Calc.weeksToGoal(p);

  if (!goal) {
    $('#p-summary').innerHTML = '<span class="muted">Uzupełnij wiek, wzrost i wagę, żeby zobaczyć wyliczenia.</span>';
    return;
  }

  const eta = weeks ? new Date(Date.now() + weeks * 7 * 864e5).toISOString().slice(0, 10) : null;

  const suggested = Calc.suggestedGoal(p);

  $('#p-summary').innerHTML = `
    ${p.customGoal ? `<p class="tip-box"><strong>Cel ustawiony ręcznie: ${p.customGoal} kcal.</strong>
      Wzór podpowiadał ${suggested} kcal
      (${p.customGoal < suggested ? `o ${suggested - p.customGoal} kcal mniej` : `o ${p.customGoal - suggested} kcal więcej`}).
      Wyczyść pole „własny cel", żeby wrócić do wyliczenia.</p>` : ''}
    <p><strong>Spoczynkowa przemiana materii (BMR):</strong> ${bmr} kcal —
      tyle spalasz leżąc cały dzień w łóżku.</p>
    <p><strong>Całkowite zapotrzebowanie (TDEE):</strong> ${tdee} kcal —
      tyle potrzebujesz, żeby utrzymać obecną wagę.</p>
    <p><strong>Cel na redukcji:</strong> ${goal} kcal dziennie
      (${tdee - goal} kcal deficytu).</p>
    <p><strong>Makroskładniki:</strong> białko ${macros.protein} g ·
      tłuszcze ${macros.fat} g · węglowodany ${macros.carbs} g.</p>
    ${bmi ? `<p><strong>BMI:</strong> ${bmi} (${Calc.bmiLabel(bmi)}).</p>` : ''}
    ${weeks ? `<p><strong>Prognoza:</strong> przy tym tempie cel ${fmt(p.target)} kg
      osiągniesz w ok. ${weeks} tygodni, czyli około ${eta}.
      To szacunek — tempo zwykle zwalnia po drodze i to normalne.</p>` : ''}
  `;
}

$('#p-save').addEventListener('click', () => {
  const age = parseNum($('#p-age').value);
  const height = parseNum($('#p-height').value);
  const weight = parseNum($('#p-weight').value);
  const target = parseNum($('#p-target').value);
  const customGoal = parseNum($('#p-goal').value);

  /* Walidacja zakresów. Bez niej literówka (np. 924 zamiast 92,4)
     przechodziła do wyliczeń i dawała absurdalne zapotrzebowanie. */
  const problems = [];
  if (age !== null && (age < 16 || age > 100)) problems.push('Wiek podaj w latach, w zakresie 16–100.');
  if (height !== null && (height < 120 || height > 230)) problems.push('Wzrost podaj w centymetrach, w zakresie 120–230.');
  if (weight !== null && (weight < 30 || weight > 400)) problems.push('Wagę podaj w kilogramach, w zakresie 30–400 (np. 92,4).');
  if (target !== null && (target < 30 || target > 400)) problems.push('Wagę docelową podaj w kilogramach, w zakresie 30–400.');
  if (customGoal !== null && (customGoal < 800 || customGoal > 6000)) {
    problems.push('Własny cel kaloryczny podaj w kcal, w zakresie 800–6000.');
  }
  if (problems.length) {
    alert(problems.join('\n'));
    return;
  }

  /* Ostrzeżenie, gdy ręczny cel schodzi poniżej spoczynkowej przemiany
     materii — to poziom, przy którym organizm zaczyna oddawać mięśnie. */
  if (customGoal !== null && weight && height && age) {
    const bmr = Calc.bmr({ sex: $('#p-sex').value, weight, height, age });
    if (bmr && customGoal < bmr) {
      const ok = confirm(
        `Uwaga: ${customGoal} kcal to mniej niż Twoja spoczynkowa przemiana materii (${bmr} kcal) — ` +
        `czyli mniej, niż potrzebujesz leżąc cały dzień w łóżku.\n\n` +
        `Przy takim poziomie organizm zaczyna oddawać mięśnie, spada energia i wypadają włosy, ` +
        `a waga i tak zwykle staje po kilku tygodniach. Szybciej nie znaczy skuteczniej.\n\n` +
        `Ustawić mimo to?`);
      if (!ok) return;
    }
  }

  /* Ostrzeżenie, gdy cel schodzi poniżej granicy zdrowej masy ciała.
     Narzędzie do odchudzania musi to powiedzieć, zanim policzy plan. */
  if (target !== null && height) {
    const targetBmi = target / Math.pow(height / 100, 2);
    if (targetBmi < 18.5) {
      const minHealthy = (18.5 * Math.pow(height / 100, 2)).toFixed(1).replace('.', ',');
      const ok = confirm(
        `Uwaga: waga docelowa ${fmt(target)} kg przy wzroście ${height} cm daje BMI ${targetBmi.toFixed(1)}, ` +
        `czyli niedowagę.\n\nDolna granica zdrowej masy ciała to przy Twoim wzroście ok. ${minHealthy} kg. ` +
        `Schodzenie niżej nie jest celem zdrowotnym i warto omówić je z lekarzem lub dietetykiem.\n\n` +
        `Zapisać mimo to?`);
      if (!ok) return;
    }
  }

  Store.update(s => {
    s.profile = {
      sex: $('#p-sex').value,
      age, height, weight, target,
      activity: +$('#p-activity').value,
      pace: +$('#p-pace').value,
      customGoal
    };
    // pierwszy pomiar wagi zakładamy na dziś, jeśli dziennik jest pusty
    if (s.profile.weight && !s.weights.length) {
      s.weights.push({ date: today(), kg: s.profile.weight });
    }
  });
  renderSummary();
  alert('Profil zapisany. Cel kaloryczny znajdziesz na Panelu.');
});

/* --- kopia zapasowa --- */
$('#d-export').addEventListener('click', () => {
  const blob = new Blob([Store.export()], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `kuchnia-kopia-${today()}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
});

$('#d-import').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      Store.import(reader.result);
      alert('Kopia wczytana.');
      location.reload();
    } catch (err) {
      alert('Ten plik nie wygląda na kopię z tej aplikacji.');
    }
  };
  reader.readAsText(file);
});

$('#d-reset').addEventListener('click', () => {
  if (!confirm('Skasować profil, historię wagi, plan i własne przepisy? Tego nie da się cofnąć.')) return;
  Store.reset();
  location.reload();
});

/* ============================================================
   START
   ============================================================ */
function esc(s) {
  return String(s).replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

initTagFilter();
renderRecipes();
fillIntensity();
renderPanel();
$('#fridge-input').value = Store.get().fridge || '';
$('#w-date').value = today();
