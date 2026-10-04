const CACHE_NAME = 'celik-kodu-cache-v12';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './assets/diagrams/seq_db_clean_squat.svg',
  './assets/diagrams/seq_db_lunge.svg',
  './assets/diagrams/seq_db_press.svg',
  './assets/diagrams/seq_db_rdl.svg',
  './assets/diagrams/seq_db_row.svg',
  './assets/diagrams/seq_db_snatch.svg',
  './assets/diagrams/seq_db_squat.svg',
  './assets/diagrams/seq_db_swing.svg',
  './assets/diagrams/seq_diamond_pushup.svg',
  './assets/diagrams/seq_escalera.svg',
  './assets/diagrams/seq_farmers_walk.svg',
  './assets/diagrams/seq_floor_press.svg',
  './assets/diagrams/seq_incline_row.svg',
  './assets/diagrams/seq_lateral_raise.svg',
  './assets/diagrams/seq_leg_raise.svg',
  './assets/diagrams/seq_overhead_carry.svg',
  './assets/diagrams/seq_plank_pull_through.svg',
  './assets/diagrams/seq_pushup.svg',
  './assets/diagrams/seq_renegade_row.svg',
  './assets/diagrams/seq_russian_twist.svg',
  './assets/diagrams/seq_skull_crusher.svg',
  './assets/diagrams/seq_thruster.svg',
  './assets/diagrams/seq_windmill.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        console.warn('Cache pre-fill warning:', err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        return caches.match(event.request);
      });
    })
  );
});
