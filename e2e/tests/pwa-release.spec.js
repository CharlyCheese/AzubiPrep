import { expect, test } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = process.env.AZUBIPREP_PWA_DIST || fileURLToPath(new URL('../../frontend/dist/', import.meta.url));
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const previousShell = '<h1>Frühere Version</h1><input aria-label="Entwurf"><script>navigator.serviceWorker.register("/sw.js")</script>';
const previousWorker = `
  self.oninstall = event => event.waitUntil(caches.open('azubiprep-v70').then(c => c.add('/index.html')).then(() => self.skipWaiting()));
  self.onactivate = event => event.waitUntil(self.clients.claim());
  self.onfetch = event => { if (event.request.mode === 'navigate') event.respondWith(caches.match('/index.html')); };
`;

// Eigene Origin für echte Worker-Updates. API-Antworten sind ausschließlich Testdaten.
const pwaTest = test.extend({
  site: async ({}, use) => {
    const state = { release: 'current', offline: false };
    const server = createServer(async (req, res) => {
      if (state.offline) return req.socket.destroy();
      const { pathname } = new URL(req.url, 'http://localhost');
      const send = (type, body, status = 200) => {
        res.writeHead(status, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
        res.end(body);
      };
      if (pathname.startsWith('/api/')) return send('application/json', pathname === '/api/status' ? '{"syncAktiviert":false}' : '[]');
      if (state.release === 'next' && pathname === '/') return send('text/html', '<h1>Neuer Stand</h1>');
      if (state.release === 'previous') {
        if (pathname === '/sw.js') return send('text/javascript', previousWorker);
        if (['/', '/index.html'].includes(pathname)) return send('text/html;charset=utf-8', previousShell);
      }
      // Der echte Server kann für eine verschwundene Asset-URL die SPA-Shell mit HTTP 200 liefern.
      if (state.release === 'incomplete' && pathname.endsWith('.css')) return send('text/html', '<html></html>');
      const file = ['/', '/willkommen'].includes(pathname) ? '/index.html' : pathname;
      if (!/^\/(?:assets\/)?[\w.-]+\.(?:html|js|css|svg|png|webmanifest)$/.test(file)) return send('text/plain', '', 404);
      try {
        send(types[extname(file)], await readFile(join(dist, file)));
      } catch {
        send('text/plain', '', 404);
      }
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      await use(Object.assign(state, { origin: 'http://127.0.0.1:' + server.address().port }));
    } finally {
      server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  },
});

async function update(page) {
  return page.evaluate(async () => {
    const registration = await navigator.serviceWorker.ready;
    const outcome = new Promise((resolve) => registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'activated' || worker.state === 'redundant') resolve(worker.state);
      });
    }, { once: true }));
    await registration.update();
    return outcome;
  });
}

pwaTest('installierte App startet sofort offline über Startadresse und Direktlink', async ({ page, context, site }) => {
  await page.route('https://**/*', (route) => route.abort());
  await page.goto(site.origin);
  await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  const cdp = await context.newCDPSession(page);
  expect((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);
  const publicPath = '/api/module?fachrichtung=FIAE';
  await page.evaluate(async (publicPath) => {
    await fetch(publicPath);
    await fetch('/api/theorie?q=');
    await fetch('/api/auth/me');
    await fetch('/api/ai/rag/status');
    await fetch('/api/journey/fiae');
    await fetch('/api/suche/inhalte?q=persoenlich');
    await fetch('/api/theorie?q=persoenlich');
    await fetch('/api/fragen', { headers: { Authorization: 'Bearer test' } });
  }, publicPath);
  const cacheUrls = await page.evaluate(async () => {
    const cache = await caches.open((await caches.keys()).find((name) => name.startsWith('azubiprep-v')));
    return (await cache.keys()).map((r) => { const url = new URL(r.url); return url.pathname + url.search; });
  });
  expect(cacheUrls).toContain(publicPath);
  expect(cacheUrls).toContain('/api/theorie?q=');
  expect(cacheUrls).not.toContain('/api/auth/me');
  expect(cacheUrls).not.toContain('/api/ai/rag/status');
  expect(cacheUrls).not.toContain('/api/journey/fiae');
  expect(cacheUrls).not.toContain('/api/suche/inhalte?q=persoenlich');
  expect(cacheUrls).not.toContain('/api/theorie?q=persoenlich');
  expect(cacheUrls).not.toContain('/api/fragen');
  await cdp.send('Network.clearBrowserCache');
  site.offline = true;
  for (const route of ['/', '/willkommen']) {
    await page.goto(site.origin + route);
    await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  }
  expect(await page.evaluate(async (path) => (await fetch(path)).json(), publicPath)).toEqual([]);
});

pwaTest('Update übersteht unvollständige Veröffentlichung und erhält laufende Eingaben', async ({ page, site }) => {
  await page.route('https://**/*', (route) => route.abort());
  site.release = 'previous';
  await page.goto(site.origin);
  await page.waitForFunction(() => navigator.serviceWorker.controller);
  await page.getByLabel('Entwurf').fill('Laufende Übung');
  await page.evaluate(() => caches.open('andere-app'));
  site.release = 'incomplete';
  expect(await update(page)).toBe('redundant');
  expect(await page.evaluate(async () => (await (await caches.open('azubiprep-v70')).match('/index.html')).text())).toContain('Entwurf');
  site.release = 'current';
  expect(await update(page)).toBe('activated');
  await expect(page.getByLabel('Entwurf')).toHaveValue('Laufende Übung');
  const names = await page.evaluate(() => caches.keys());
  expect(names).toContain('andere-app');
  expect(names).not.toContain('azubiprep-v70');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  site.release = 'next';
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Neuer Stand' })).toBeVisible();
});
