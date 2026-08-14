/* Interfejs dziennika posiłków, kreatora potraw i postu przerywanego. */

let diaryDate = null;
let diarySource = 'przepisy';
let composer = [];          // składniki budowanej potrawy

const dayEntries = d => (Store.get().diary || {})[d] || [];

function diaryTotals(d) {
  return dayEntries(d).reduce((t, e) => ({
    kcal: t.kcal + e.kcal, protein: t.protein + e.protein,
    fat: t.fat + e.fat, carbs: t.carbs + e.carbs
  }), { kcal: 0, protein: 0, fat: 0, carbs: 0 });
}

function addEntry(entry) {
  const d = diaryDate || today();
  Store.update(s => {
    if (!s.diary) s.diary = {};
    if (!s.diary[d]) s.diary[d] = [];
    s.diary[d].push({ ...entry, id: Date.now() + Math.random() });
  });
  renderDiary();
  renderPanel();
}

/* Przelicza wartości na 100 g na podaną gramaturę. */
function scale(per100, grams) {
  const f = grams / 100;
  return {
    kcal: Math.round(per100.kcal * f),
    protein: Math.round(per100.protein * f),
    fat: Math.round(per100.fat * f),
    carbs: Math.round(per100.carbs * f)
  };
}

/* ---------- Podsumowanie dnia ---------- */
function renderDiary() {
  const d = diaryDate || today();
  $('#d-date').value = d;

  const t = diaryTotals(d);
  const p = Store.get().profile;
  const goal = Calc.goal(p);
  const macros = Calc.macros(p);
  const left = goal ? goal - t.kcal : null;

  const bar = (label, val, target, cls) => {
    const pct = target ? Math.min(100, Math.round(val / target * 100)) : 0;
    return `<div class="macro-row">
      <span class="macro-label">${label}</span>
      <div class="macro-track"><i class="${cls} ${val > target ? 'over' : ''}" style="width:${pct}%"></i></div>
      <span class="macro-val">${val}${target ? ` / ${target}` : ''} g</span>
    </div>`;
  };

  $('#diary-summary').innerHTML = `
    <div class="diary-head">
      <div>
        <div class="diary-kcal">${t.kcal}<span class="stat-unit"> kcal</span></div>
        ${goal ? `<div class="stat-note ${left < 0 ? 'warn' : 'good'}">
          ${left >= 0 ? `zostało ${left} kcal do celu ${goal}` : `przekroczone o ${Math.abs(left)} kcal`}
        </div>` : '<div class="stat-note">Uzupełnij profil, żeby zobaczyć cel</div>'}
      </div>
      ${goal ? `<div class="diary-ring" style="--pct:${Math.min(100, Math.round(t.kcal / goal * 100))}">
        <span>${Math.round(t.kcal / goal * 100)}%</span></div>` : ''}
    </div>
    ${macros ? `<div class="macros">
      ${bar('Białko', t.protein, macros.protein, 'm-p')}
      ${bar('Tłuszcze', t.fat, macros.fat, 'm-f')}
      ${bar('Węgle', t.carbs, macros.carbs, 'm-c')}
    </div>` : ''}`;

  /* lista posiłków */
  const items = dayEntries(d);
  $('#diary-list').innerHTML = items.length
    ? items.map((e, i) => `
        <div class="hist-row">
          <span style="flex:1">${esc(e.name)}${e.grams ? ` <span class="muted small">${fmt(e.grams)} g</span>` : ''}</span>
          <span><strong>${e.kcal} kcal</strong> <span class="muted small">B${e.protein} T${e.fat} W${e.carbs}</span></span>
          <button class="hist-del" data-del-entry="${i}">usuń</button>
        </div>`).join('')
    : '<div class="empty">Nic jeszcze nie zapisane. Dodaj pierwszy posiłek powyżej.</div>';

  renderDiaryAdd();
  renderFasting();
}

$('#d-date').addEventListener('change', e => { diaryDate = e.target.value || today(); renderDiary(); });

$('#diary-list').addEventListener('click', e => {
  const btn = e.target.closest('[data-del-entry]');
  if (!btn) return;
  const d = diaryDate || today();
  Store.update(s => { s.diary[d].splice(+btn.dataset.delEntry, 1); });
  renderDiary();
  renderPanel();
});

$('#diary-source').addEventListener('click', e => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  diarySource = chip.dataset.src;
  $$('#diary-source .chip').forEach(c => c.classList.toggle('is-active', c === chip));
  renderDiaryAdd();
});

/* ---------- Panele dodawania ---------- */
function renderDiaryAdd() {
  const box = $('#diary-add');

  if (diarySource === 'przepisy') {
    box.innerHTML = `
      <input type="search" id="da-recipe-q" placeholder="Szukaj wśród 150 przepisów…">
      <div id="da-recipe-list" class="pick-list"></div>`;
    const draw = q => {
      const list = Store.allRecipes()
        .filter(r => !q || norm(r.name).includes(norm(q)))
        .slice(0, 40);
      $('#da-recipe-list').innerHTML = list.map(r => `
        <div class="pick" data-add-recipe="${r.id}">
          <span>${esc(r.name)}</span>
          <span class="muted small">${r.kcal} kcal · porcja</span>
        </div>`).join('');
    };
    draw('');
    $('#da-recipe-q').addEventListener('input', e => draw(e.target.value));
    return;
  }

  if (diarySource === 'produkty') {
    box.innerHTML = `
      <p class="muted small">Baza ${Object.keys(PRODUCTS).length} podstawowych produktów — działa bez internetu.</p>
      <div class="row row-wrap">
        <label class="field" style="flex:2;min-width:180px">Produkt
          <input type="text" id="da-prod" list="da-prod-list" placeholder="np. twaróg chudy">
          <datalist id="da-prod-list">${Object.keys(PRODUCTS).map(k => `<option value="${esc(k)}">`).join('')}</datalist>
        </label>
        <label class="field">Ilość (g)
          <input type="text" inputmode="decimal" id="da-prod-g" placeholder="np. 150">
        </label>
        <button class="btn btn-primary" id="da-prod-add">Dodaj</button>
      </div>
      <p class="muted small" id="da-prod-prev"></p>`;

    const prev = () => {
      const p = PRODUCTS[$('#da-prod').value];
      const g = parseNum($('#da-prod-g').value);
      $('#da-prod-prev').textContent = (p && g)
        ? `${Math.round(p[0] * g / 100)} kcal · B ${Math.round(p[1] * g / 100)} T ${Math.round(p[2] * g / 100)} W ${Math.round(p[3] * g / 100)}`
        : '';
    };
    $('#da-prod').addEventListener('input', prev);
    $('#da-prod-g').addEventListener('input', prev);
    $('#da-prod-add').addEventListener('click', () => {
      const name = $('#da-prod').value, p = PRODUCTS[name], g = parseNum($('#da-prod-g').value);
      if (!p) { alert('Wybierz produkt z listy podpowiedzi.'); return; }
      if (!g || g <= 0) { alert('Podaj ilość w gramach.'); return; }
      addEntry({ name, grams: g, ...scale({ kcal: p[0], protein: p[1], fat: p[2], carbs: p[3] }, g) });
      $('#da-prod-g').value = '';
    });
    return;
  }

  if (diarySource === 'baza') {
    box.innerHTML = `
      <p class="muted small">
        Otwarta baza produktów (Open Food Facts) z produktami z polskich sklepów.
        Wymaga internetu. Możesz też wpisać kod kreskowy z opakowania.
      </p>
      <div class="row row-wrap">
        <input type="search" id="da-off-q" placeholder="Nazwa produktu, np. skyr pitny" style="flex:2;min-width:180px">
        <button class="btn btn-primary" id="da-off-go">Szukaj</button>
      </div>
      <div class="row row-wrap">
        <input type="text" inputmode="numeric" id="da-off-code" placeholder="albo kod kreskowy, np. 5900512300108" style="flex:2;min-width:180px">
        <button class="btn btn-ghost" id="da-off-code-go">Znajdź po kodzie</button>
      </div>
      <div id="da-off-res"></div>`;

    const show = items => {
      if (!items.length) { $('#da-off-res').innerHTML = '<div class="empty">Nic nie znaleziono.</div>'; return; }
      $('#da-off-res').innerHTML = `<div class="pick-list">${items.map((it, i) => `
        <div class="pick" data-off="${i}">
          <span>${esc(it.name)}</span>
          <span class="muted small">${it.per100.kcal} kcal / 100 g</span>
        </div>`).join('')}</div>`;
      $('#da-off-res').offItems = items;
    };
    const run = async fn => {
      $('#da-off-res').innerHTML = '<p class="muted small">Szukam…</p>';
      try { show(await fn()); }
      catch (err) {
        $('#da-off-res').innerHTML = `<div class="empty">Nie udało się połączyć z bazą produktów.
          Sprawdź internet albo dodaj produkt ręcznie.</div>`;
      }
    };
    $('#da-off-go').addEventListener('click', () => {
      const q = $('#da-off-q').value.trim();
      if (q) run(() => offSearch(q));
    });
    $('#da-off-code-go').addEventListener('click', () => {
      const c = $('#da-off-code').value.trim();
      if (c) run(async () => { const r = await offBarcode(c); return r ? [r] : []; });
    });
    $('#da-off-res').addEventListener('click', e => {
      const pick = e.target.closest('[data-off]');
      if (!pick) return;
      const it = ($('#da-off-res').offItems || [])[+pick.dataset.off];
      if (!it) return;
      const g = parseNum(prompt(`Ile gramów?\n\n${it.name}\n${it.per100.kcal} kcal / 100 g`, '100'));
      if (!g || g <= 0) return;
      addEntry({ name: it.name, grams: g, ...scale(it.per100, g) });
    });
    return;
  }

  if (diarySource === 'fastfood') {
    box.innerHTML = `
      <p class="muted small">Dania z sieciówek i klasyki „na mieście". Wartości na jedną porcję.</p>
      <div class="pick-list">${FASTFOOD.map((f, i) => `
        <div class="pick" data-ff="${i}">
          <span>${esc(f.name)}</span>
          <span class="muted small">${f.kcal} kcal · ${esc(f.portion)}</span>
        </div>`).join('')}</div>`;
    return;
  }

  if (diarySource === 'wlasne') {
    const own = Store.get().dishes || [];
    box.innerHTML = own.length
      ? `<div class="pick-list">${own.map((d, i) => `
          <div class="pick" data-dish="${i}">
            <span>${esc(d.name)}</span>
            <span class="muted small">${d.kcal} kcal · porcja</span>
          </div>`).join('')}</div>`
      : '<div class="empty">Nie masz jeszcze własnych potraw. Złóż pierwszą w kreatorze poniżej.</div>';
    return;
  }

  /* ręcznie */
  box.innerHTML = `
    <p class="muted small">Przepisz wartości z opakowania albo z etykiety dania.</p>
    <div class="row row-wrap">
      <label class="field" style="flex:2;min-width:160px">Nazwa
        <input type="text" id="dm-name" placeholder="np. obiad u mamy">
      </label>
      <label class="field">kcal <input type="text" inputmode="numeric" id="dm-kcal"></label>
      <label class="field">B (g) <input type="text" inputmode="decimal" id="dm-p" placeholder="0"></label>
      <label class="field">T (g) <input type="text" inputmode="decimal" id="dm-f" placeholder="0"></label>
      <label class="field">W (g) <input type="text" inputmode="decimal" id="dm-c" placeholder="0"></label>
      <button class="btn btn-primary" id="dm-add">Dodaj</button>
    </div>`;
  $('#dm-add').addEventListener('click', () => {
    const name = $('#dm-name').value.trim();
    const kcal = parseNum($('#dm-kcal').value);
    const p = parseNum($('#dm-p').value) || 0;
    const f = parseNum($('#dm-f').value) || 0;
    const c = parseNum($('#dm-c').value) || 0;

    /* Walidacja zakresów. Bez niej literówka (15000 zamiast 1500 albo
       zgubiony minus) po cichu fałszowała bilans całego dnia. */
    if (!name) { alert('Podaj nazwę posiłku.'); return; }
    if (kcal === null || kcal <= 0 || kcal > 5000) {
      alert('Kalorie podaj w zakresie 1–5000. Jeden posiłek rzadko przekracza 2000 kcal.');
      return;
    }
    if ([p, f, c].some(x => x < 0 || x > 1000)) {
      alert('Makroskładniki podaj w gramach, w zakresie 0–1000.');
      return;
    }
    addEntry({ name, kcal: Math.round(kcal),
      protein: Math.round(p), fat: Math.round(f), carbs: Math.round(c) });
    $('#dm-name').value = $('#dm-kcal').value = '';
  });
}

/* kliknięcia w listach wyboru */
$('#diary-add').addEventListener('click', e => {
  const r = e.target.closest('[data-add-recipe]');
  if (r) {
    const rec = Store.recipe(r.dataset.addRecipe);
    if (rec) addEntry({ name: rec.name, kcal: rec.kcal, protein: rec.protein, fat: rec.fat, carbs: rec.carbs });
    return;
  }
  const f = e.target.closest('[data-ff]');
  if (f) {
    const it = FASTFOOD[+f.dataset.ff];
    addEntry({ name: it.name, kcal: it.kcal, protein: it.protein, fat: it.fat, carbs: it.carbs });
    return;
  }
  const d = e.target.closest('[data-dish]');
  if (d) {
    const dish = (Store.get().dishes || [])[+d.dataset.dish];
    if (dish) addEntry({ name: dish.name, kcal: dish.kcal, protein: dish.protein, fat: dish.fat, carbs: dish.carbs });
  }
});

/* ---------- Kreator własnej potrawy ---------- */
$('#comp-list').innerHTML = Object.keys(PRODUCTS).map(k => `<option value="${esc(k)}">`).join('');

$('#comp-add').addEventListener('click', () => {
  const name = $('#comp-name').value.trim();
  const qty = parseNum($('#comp-qty').value);
  if (!name) { alert('Wpisz nazwę składnika.'); return; }
  if (!qty || qty <= 0) { alert('Podaj ilość w gramach.'); return; }

  const p = PRODUCTS[name];
  if (!p) {
    /* Produktu nie ma w tabeli — pytamy o kaloryczność zamiast zgadywać. */
    const kcal100 = parseNum(prompt(
      `Nie mam „${name}" w tabeli.\n\nPodaj ile kcal ma 100 g tego produktu (z opakowania):`, ''));
    if (!kcal100) return;
    composer.push({ name, qty, per100: { kcal: kcal100, protein: 0, fat: 0, carbs: 0 }, manual: true });
  } else {
    composer.push({ name, qty, per100: { kcal: p[0], protein: p[1], fat: p[2], carbs: p[3] } });
  }
  $('#comp-name').value = ''; $('#comp-qty').value = '';
  renderComposer();
});

function composerTotals() {
  return composer.reduce((t, c) => {
    const s = scale(c.per100, c.qty);
    return { kcal: t.kcal + s.kcal, protein: t.protein + s.protein, fat: t.fat + s.fat, carbs: t.carbs + s.carbs };
  }, { kcal: 0, protein: 0, fat: 0, carbs: 0 });
}

function renderComposer() {
  if (!composer.length) { $('#comp-items').innerHTML = ''; return; }
  const t = composerTotals();
  const serv = Math.max(1, parseNum($('#comp-serv').value) || 1);

  $('#comp-items').innerHTML = `
    ${composer.map((c, i) => {
      const s = scale(c.per100, c.qty);
      return `<div class="hist-row">
        <span style="flex:1">${esc(c.name)} <span class="muted small">${fmt(c.qty)} g${c.manual ? ' · wpisane ręcznie' : ''}</span></span>
        <span><strong>${s.kcal} kcal</strong></span>
        <button class="hist-del" data-del-comp="${i}">usuń</button>
      </div>`;
    }).join('')}
    <div class="tip-box" style="margin-top:.6rem">
      <strong>Razem: ${t.kcal} kcal</strong> · B ${t.protein} g · T ${t.fat} g · W ${t.carbs} g<br>
      <span class="muted">Na porcję (${serv}): <strong>${Math.round(t.kcal / serv)} kcal</strong> ·
      B ${Math.round(t.protein / serv)} T ${Math.round(t.fat / serv)} W ${Math.round(t.carbs / serv)}</span>
    </div>`;
}

$('#comp-items').addEventListener('click', e => {
  const btn = e.target.closest('[data-del-comp]');
  if (!btn) return;
  composer.splice(+btn.dataset.delComp, 1);
  renderComposer();
});
$('#comp-serv').addEventListener('input', renderComposer);

$('#comp-save').addEventListener('click', () => {
  if (!composer.length) { alert('Dodaj najpierw składniki.'); return; }
  const name = $('#comp-title').value.trim();
  if (!name) { alert('Nazwij potrawę.'); return; }
  const serv = Math.max(1, parseNum($('#comp-serv').value) || 1);
  const t = composerTotals();

  const dish = {
    name,
    kcal: Math.round(t.kcal / serv),
    protein: Math.round(t.protein / serv),
    fat: Math.round(t.fat / serv),
    carbs: Math.round(t.carbs / serv),
    parts: composer.map(c => ({ name: c.name, qty: c.qty }))
  };
  Store.update(s => { if (!s.dishes) s.dishes = []; s.dishes.push(dish); });

  if (confirm(`Zapisano „${name}" — ${dish.kcal} kcal na porcję.\n\nDodać od razu do dziennika?`)) {
    addEntry({ name: dish.name, kcal: dish.kcal, protein: dish.protein, fat: dish.fat, carbs: dish.carbs });
  }
  composer = [];
  $('#comp-title').value = ''; $('#comp-serv').value = '1';
  renderComposer();
  renderDiary();
});

/* ---------- Post przerywany ---------- */
function renderFasting() {
  const s = Store.get();
  const f = s.fasting || {};
  const scheme = FASTING_SCHEMES.find(x => x.id === f.scheme) || FASTING_SCHEMES[0];

  let running = '';
  if (f.start) {
    const elapsed = (Date.now() - f.start) / 3600000;
    const pct = Math.min(100, Math.round(elapsed / scheme.fast * 100));
    const h = Math.floor(elapsed), m = Math.floor((elapsed - h) * 60);
    running = `
      <div class="tip-box" style="margin:.6rem 0">
        <strong>Post trwa: ${h} h ${m} min</strong> z ${scheme.fast} h
        <div class="mascot-progress" style="margin:.5rem 0 .2rem"><i style="width:${pct}%"></i></div>
        ${pct >= 100 ? 'Cel osiągnięty — możesz jeść.' : `Zostało ${Math.max(0, Math.round(scheme.fast - elapsed))} h.`}
      </div>
      <button class="btn btn-ghost" id="fast-stop">Zakończ post</button>`;
  } else {
    running = `<button class="btn btn-primary" id="fast-start">Zacznij post teraz</button>`;
  }

  $('#fasting-box').innerHTML = `
    <label class="field">Schemat
      <select id="fast-scheme">
        ${FASTING_SCHEMES.map(x => `<option value="${x.id}" ${x.id === scheme.id ? 'selected' : ''}>${esc(x.label)}</option>`).join('')}
      </select>
    </label>
    <p class="muted small">${esc(scheme.note)}</p>
    ${running}
    <p class="muted small" style="margin-top:.6rem">
      Post przerywany nie spala tłuszczu sam z siebie — działa o tyle, o ile
      pomaga zjeść mniej w ciągu doby. Jeśli w oknie jedzenia zjesz tyle samo,
      efektu nie będzie.
    </p>`;

  $('#fast-scheme').addEventListener('change', e => {
    Store.update(st => { st.fasting = { ...(st.fasting || {}), scheme: e.target.value }; });
    renderFasting();
  });
  const st = $('#fast-start'), sp = $('#fast-stop');
  if (st) st.addEventListener('click', () => {
    Store.update(x => { x.fasting = { ...(x.fasting || {}), scheme: scheme.id, start: Date.now() }; });
    renderFasting();
  });
  if (sp) sp.addEventListener('click', () => {
    Store.update(x => { x.fasting = { ...(x.fasting || {}), start: null }; });
    renderFasting();
  });
}
