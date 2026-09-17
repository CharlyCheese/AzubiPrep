// AzubiPrep Service Worker – einfache Offline-Strategie:
// - App-Shell: Cache-first (Precache beim Installieren)
// - API-GET-Antworten: Network-first mit Cache-Fallback (Inhalte offline verfügbar)
// - Nicht-GET-/POST-Requests: nur Netzwerk (kein Caching)

const VERSION = 'azubiprep-v3'; // v3 (BE-001): Push-Benachrichtigungen (Web-Push)
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

// BE-001: eingehende Push-Nachricht als System-Benachrichtigung anzeigen.
// Payload ist ein JSON-Objekt { titel, text, url } (siehe backend/src/push.js).
// Fällt der JSON-Parse aus irgendeinem Grund aus, wird trotzdem eine
// generische Benachrichtigung gezeigt statt gar keine (Push kam ja an).
self.addEventListener('push', (event) => {
  let daten = { titel: 'AzubiPrep', text: 'Du hast eine neue Benachrichtigung.', url: '/' };
  try {
    if (event.data) daten = { ...daten, ...event.data.json() };
  } catch {
    /* ignore – generische Nachricht bleibt bestehen */
  }
  event.waitUntil(
    self.registration.showNotification(daten.titel, {
      body: daten.text,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: { url: daten.url || '/' },
    }),
  );
});

// Klick auf die Benachrichtigung: vorhandenes App-Fenster fokussieren statt
// ein neues zu öffnen, falls schon eines läuft.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const ziel = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(ziel);
          return client.focus();
        }
      }
      return self.clients.openWindow(ziel);
    }),
  );
});
