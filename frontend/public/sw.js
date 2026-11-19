// Der Produktionsbuild setzt BUILD_REVISION und SHELL_INTEGRITY vor diesen Worker.
const VERSION = 'azubiprep-v72';
const CACHE_NAME = VERSION + '-' + BUILD_REVISION;
const publicCatalog = /^\/api\/(?:fachrichtungen|konstanten|module(?:\/[^/]+)?|fragen(?:\/[^/]+)?|theorie(?:\/themen\/[^/]+)?)$/;

self.addEventListener('install', (event) => {
  // addAll schreibt atomar. Auch eine als HTML ausgelieferte fehlende JS-Datei
  // lässt den Integritätscheck scheitern und der bisherige Worker bleibt aktiv.
  const files = Object.entries(SHELL_INTEGRITY).map(([url, integrity]) =>
    new Request(url, { cache: 'reload', integrity }),
  );
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(files)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys
        .filter((key) => /^azubiprep-v\d+(?:-[a-f0-9]+)?$/.test(key) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

async function navigate(request) {
  try {
    const response = await fetch(request, { cache: 'no-cache' });
    if (response.status < 500) return response;
    return await caches.match('/index.html', { cacheName: CACHE_NAME }) || response;
  } catch {
    return await caches.match('/index.html', { cacheName: CACHE_NAME }) || Response.error();
  }
}

async function fetchAndCache(request, cache) {
  const response = await fetch(request);
  if (response.ok && !response.headers.get('Content-Type')?.includes('text/html')
      && !/private|no-store/i.test(response.headers.get('Cache-Control') || '')) {
    // Bei ausgeschöpftem Gerätespeicher steht die Online-Antwort weiter zur Verfügung.
    await cache.put(request, response.clone()).catch(() => {});
  }
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || request.headers.has('Authorization')) return;

  if (url.pathname.startsWith('/api/')) {
    // Nur öffentliche Lerninhalte: Konto, Suchbegriffe, KI, Dokumente und
    // nutzerbezogene Routen werden weder gespeichert noch aus dem Cache gelesen.
    if (publicCatalog.test(url.pathname) && !url.searchParams.get('q')) {
      event.respondWith(caches.open(CACHE_NAME).then((cache) =>
        fetchAndCache(request, cache).catch(async () => await cache.match(request) || Response.error())));
    }
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(navigate(request));
  } else if (Object.hasOwn(SHELL_INTEGRITY, url.pathname) || url.pathname.startsWith('/assets/')) {
    event.respondWith(caches.open(CACHE_NAME).then(async (cache) =>
      await cache.match(request) || fetchAndCache(request, cache)));
  }
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
