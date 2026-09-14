// AzubiPrep Service Worker – einfache Offline-Strategie:
// - App-Shell: Cache-first (Precache beim Installieren)
// - API-GET-Antworten: Network-first mit Cache-Fallback (Inhalte offline verfügbar)
// - Nicht-GET-/POST-Requests: nur Netzwerk (kein Caching)

const VERSION = 'azubiprep-v2'; // v2: Security-Haertung (theme-init.js im Precache)
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/theme-init.js',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nur eigene Origin (kein Cross-Origin-Caching von Fremdressourcen)
  if (url.origin !== self.location.origin) return;

  // API-Antworten: Network-first, Fallback auf Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(VERSION).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // App-Shell & Vite-Assets: Cache-first mit Netzwerk-Update
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
