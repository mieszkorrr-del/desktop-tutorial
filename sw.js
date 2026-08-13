/* Service worker: pozwala korzystać z aplikacji bez internetu — w sklepie
   albo w kuchni z kiepskim zasięgiem. Strategia: najpierw sieć (żeby
   aktualizacje wchodziły od razu), z cache jako zapasem. */

const CACHE = 'kuchnia-v5';
const ASSETS = [
  './',
  './manifest.json',
  './assets/css/style.css',
  './assets/js/data.js',
  './assets/js/figures.js',
  './assets/js/training.js',
  './assets/js/daily.js',
  './assets/js/store.js',
  './assets/js/app.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/icon-maskable-512.png',
  './assets/icons/apple-touch-icon.png'
];

/* Instalacja pobiera zasoby pojedynczo. Gdyby użyć cache.addAll(),
   jeden brakujący plik przerwałby całą instalację i aplikacja po cichu
   straciłaby tryb offline. */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(url => c.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Do cache trafiają wyłącznie poprawne odpowiedzi z tego samego serwera.
   Bez tego warunku przejściowy błąd 404/500 (np. w trakcie wdrożenia)
   zostałby utrwalony pod nazwą skryptu i zablokował aplikację offline. */
function cacheable(res) {
  return res && res.ok && res.type === 'basic';
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (cacheable(res)) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(hit => {
        if (hit) return hit;
        // nawigacja bez sieci — pokaż aplikację zamiast błędu przeglądarki
        if (e.request.mode === 'navigate') return caches.match('./');
        return Response.error();
      }))
  );
});
