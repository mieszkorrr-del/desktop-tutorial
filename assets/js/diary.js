/* Dziennik posiłków — rdzeń liczenia kalorii.

   Trzy drogi dodania jedzenia:
   1. z przepisu z aplikacji (zna kcal i makro),
   2. z bazy produktów Open Food Facts (darmowa, otwarta, ma polskie
      produkty sieciowe; wymaga internetu),
   3. ręcznie, gdy nie ma nigdzie — wpisujesz wartości z opakowania.

   Produkty raz pobrane lądują w pamięci lokalnej, więc drugi raz
   działają bez sieci. */

const OFF_URL = 'https://world.openfoodfacts.org';

/* Popularne dania sieciówek — wartości z oficjalnych tabel producentów,
   na jedną porcję. To odpowiednik "restauracji" w Fitatu. */
const FASTFOOD = [
  { name: 'McDonald’s — Big Mac', kcal: 503, protein: 26, fat: 25, carbs: 42, portion: '1 szt' },
  { name: 'McDonald’s — Cheeseburger', kcal: 302, protein: 16, fat: 12, carbs: 32, portion: '1 szt' },
  { name: 'McDonald’s — McChicken', kcal: 402, protein: 17, fat: 19, carbs: 40, portion: '1 szt' },
  { name: 'McDonald’s — Frytki średnie', kcal: 337, protein: 4, fat: 16, carbs: 42, portion: '1 porcja' },
  { name: 'McDonald’s — McWrap Grillowany', kcal: 415, protein: 27, fat: 13, carbs: 46, portion: '1 szt' },
  { name: 'KFC — Kubełek Hot Wings (5 szt)', kcal: 385, protein: 24, fat: 24, carbs: 18, portion: '5 szt' },
  { name: 'KFC — Twister', kcal: 480, protein: 24, fat: 21, carbs: 47, portion: '1 szt' },
  { name: 'KFC — Zinger Burger', kcal: 450, protein: 25, fat: 18, carbs: 45, portion: '1 szt' },
  { name: 'Subway — Sub 15 cm Indyk', kcal: 280, protein: 18, fat: 4, carbs: 44, portion: '15 cm' },
  { name: 'Subway — Sub 15 cm Kurczak Teriyaki', kcal: 350, protein: 24, fat: 5, carbs: 55, portion: '15 cm' },
  { name: 'Pizza Hut — Pizza Margherita (1 kawałek średniej)', kcal: 230, protein: 10, fat: 8, carbs: 29, portion: '1 kawałek' },
  { name: 'Pizza Hut — Pizza Pepperoni (1 kawałek średniej)', kcal: 280, protein: 12, fat: 12, carbs: 30, portion: '1 kawałek' },
  { name: 'Kebab — duży w bułce z sosem czosnkowym', kcal: 850, protein: 40, fat: 45, carbs: 70, portion: '1 szt' },
  { name: 'Kebab — mały w picie', kcal: 550, protein: 30, fat: 26, carbs: 48, portion: '1 szt' },
  { name: 'Zapiekanka z pieczarkami', kcal: 420, protein: 14, fat: 18, carbs: 52, portion: '1 szt' },
  { name: 'Hot dog z bułką i sosami', kcal: 380, protein: 12, fat: 20, carbs: 36, portion: '1 szt' },
  { name: 'Pączek z lukrem', kcal: 320, protein: 5, fat: 15, carbs: 42, portion: '1 szt' },
  { name: 'Drożdżówka z serem', kcal: 350, protein: 8, fat: 13, carbs: 50, portion: '1 szt' },
  { name: 'Piwo jasne 500 ml', kcal: 215, protein: 1.5, fat: 0, carbs: 17, portion: '500 ml' },
  { name: 'Wódka 40% — 50 ml', kcal: 110, protein: 0, fat: 0, carbs: 0, portion: '50 ml' },
  { name: 'Wino czerwone wytrawne 150 ml', kcal: 125, protein: 0, fat: 0, carbs: 4, portion: '150 ml' },
  { name: 'Cola 500 ml', kcal: 210, protein: 0, fat: 0, carbs: 53, portion: '500 ml' },
  { name: 'Latte z mlekiem 2% — średnie', kcal: 190, protein: 10, fat: 7, carbs: 19, portion: '350 ml' },
  { name: 'Baton czekoladowy 50 g', kcal: 245, protein: 3, fat: 12, carbs: 30, portion: '50 g' },
  { name: 'Chipsy paprykowe 100 g', kcal: 535, protein: 6, fat: 33, carbs: 52, portion: '100 g' }
];

/* Wyszukiwanie w otwartej bazie produktów. Zwraca pozycje z wartościami
   na 100 g — przeliczenie na gramaturę robimy przy dodawaniu. */
async function offSearch(query) {
  const url = `${OFF_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=25&fields=code,product_name,brands,nutriments,quantity`;
  const res = await fetch(url, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('Baza produktów nie odpowiada (HTTP ' + res.status + ')');
  const data = await res.json();
  return (data.products || []).map(offMap).filter(Boolean);
}

async function offBarcode(code) {
  const res = await fetch(`${OFF_URL}/api/v2/product/${encodeURIComponent(code)}.json` +
    `?fields=code,product_name,brands,nutriments,quantity`);
  if (!res.ok) throw new Error('Baza produktów nie odpowiada (HTTP ' + res.status + ')');
  const data = await res.json();
  if (data.status !== 1 || !data.product) return null;
  return offMap(data.product);
}

function offMap(p) {
  const n = p.nutriments || {};
  const kcal = n['energy-kcal_100g'];
  if (!p.product_name || kcal === undefined) return null;
  return {
    code: p.code,
    name: [p.product_name, p.brands ? `(${String(p.brands).split(',')[0].trim()})` : '']
      .filter(Boolean).join(' '),
    per100: {
      kcal: Math.round(kcal),
      protein: +(n.proteins_100g || 0).toFixed(1),
      fat: +(n.fat_100g || 0).toFixed(1),
      carbs: +(n.carbohydrates_100g || 0).toFixed(1)
    },
    quantity: p.quantity || ''
  };
}

/* ---------- Post przerywany ---------- */
const FASTING_SCHEMES = [
  { id: '16:8', fast: 16, label: '16:8 — 16 godzin postu, 8 godzin jedzenia',
    note: 'Najpopularniejszy i najłatwiejszy do utrzymania. Zwykle: ostatni posiłek 20:00, pierwszy 12:00.' },
  { id: '14:10', fast: 14, label: '14:10 — łagodny start',
    note: 'Dobry pierwszy krok, jeśli 16 godzin brzmi strasznie.' },
  { id: '18:6', fast: 18, label: '18:6 — dla zaawansowanych',
    note: 'Węższe okno jedzenia. Trudniej zmieścić białko, więc pilnuj porcji.' },
  { id: '20:4', fast: 20, label: '20:4 — bardzo restrykcyjny',
    note: 'Trudno tu zjeść wystarczająco białka. Nie polecam na dłużej niż kilka tygodni.' }
];

/* ---------- Tryby diety (odpowiednik gotowych menu) ---------- */
const DIET_MODES = [
  { id: 'balans', name: 'Balans', filter: () => true,
    note: 'Bez ograniczeń — wszystkie 150 przepisów.' },
  { id: 'wysokobialkowe', name: 'Wysokobiałkowe',
    filter: r => r.protein >= 25 || (r.tags || []).includes('wysokobiałkowe'),
    note: 'Minimum 25 g białka na porcję. Najlepszy wybór na redukcji z treningiem.' },
  { id: 'wege', name: 'Wegetariańskie',
    filter: r => (r.tags || []).includes('wegetariańskie') || (r.tags || []).includes('wegańskie'),
    note: 'Bez mięsa i ryb.' },
  { id: 'bezglutenowe', name: 'Bezglutenowe',
    filter: r => (r.tags || []).includes('bezglutenowe'),
    note: 'Bez pszenicy, żyta i jęczmienia.' },
  { id: 'niskoweglo', name: 'Mniej węglowodanów',
    filter: r => r.carbs <= 30,
    note: 'Maksymalnie 30 g węglowodanów na porcję.' },
  { id: 'tanie', name: 'Tanie i proste',
    filter: r => (r.tags || []).includes('tanie'),
    note: 'Zwykłe produkty ze sklepu osiedlowego, krótkie listy składników.' },
  { id: 'szybkie', name: 'Do 20 minut',
    filter: r => r.time <= 20,
    note: 'Gdy nie masz czasu gotować.' }
];
