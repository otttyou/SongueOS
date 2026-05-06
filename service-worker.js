const CACHE_VERSION = 'soengos-prototype-v1';
const CORE_ASSETS = [
  './SoengOS.html',
  './soengos-workflow.html',
  './assets/styles/soengos.css',
  './assets/styles/soengos-workflow.css',
  './assets/icons/soengos.svg',
  './assets/fonts/README.md',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => cachedResponse || fetch(event.request)
        .then((networkResponse) => {
          const sameOrigin = new URL(event.request.url).origin === self.location.origin;
          if (sameOrigin && networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_VERSION)
              .then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        })
        .catch(() => {
          if (event.request.mode === 'navigate') {
            return caches.match('./SoengOS.html');
          }
          return new Response('', { status: 504, statusText: 'Offline asset unavailable' });
        }))
  );
});
