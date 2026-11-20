// Nach dem Portfolio-Build ausführen: node e2e/scripts/check-netlify.mjs
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium, expect as playwrightExpect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from '../tests/helpers.js';
import { listFiles, startPreview } from './netlify-preview.mjs';

const expect = playwrightExpect.configure({ timeout: 15_000 });
const repo = fileURLToPath(new URL('../../', import.meta.url));
const output = path.join(repo, 'netlify-build');
const site = path.join(output, 'site');
const siteFiles = await listFiles(site);
const dataFiles = await listFiles(path.join(output, 'data'));
const tracked = new Set(execFileSync('git', ['ls-files', '-z', 'content'], { cwd: repo, encoding: 'utf8' }).split('\0'));
const publicAssets = new Set(['index.html', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable.svg', 'manifest.webmanifest',
  'quickjs-LICENSE.txt', 'theme-init.js', 'sw.js', 'journey-practice-search.json', 'workshop-search.json', '_headers', '_redirects']);
for (const file of siteFiles) {
  assert(publicAssets.has(file) || /^assets\/[\w.-]+-[\w-]+\.(js|css)$/.test(file), `Unerwartete Webdatei: ${file}`);
}
for (const file of dataFiles) {
  if (file === 'journey-practice-search.json' || file === 'workshop-search.json') continue;
  assert(tracked.has(file), `Funktionsdaten müssen aus versionierten öffentlichen Inhalten stammen: ${file}`);
  assert(/^content\/(?:fachrichtungen\.csv|modules\.csv|questions\/[\w-]+\.csv|theorie\/[\w-]+\.md|learning-journey\/(?:fiae\.v1\.json|(?:topics\/[\w.-]+\.json|questions\/[\w.-]+\.csv)))$/.test(file), `Unerwartete Funktionsdaten: ${file}`);
}

// Das Arbeitsverzeichnis entspricht der vorbereiteten Function mit ihren eingebundenen Daten.
process.chdir(repo);
const { default: learning, config } = await import('../../netlify/functions/learning.mjs');
assert.equal(config.path, '/api/*');
const preview = await startPreview(site, siteFiles, learning);
let browser;
try {
  const get = (route, options) => fetch(preview.origin + route, options);
  async function api(route, body) {
    const response = await get('/api/' + route, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) } : undefined);
    assert.equal(response.status, 200, route);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
    return response.json();
  }

  const status = await api('status');
  assert.equal(status.syncAktiviert, false);
  assert.equal(status.pushAktiviert, false);
  const questions = await api('fragen');
  assert.equal(questions.length, 7000);
  const question = questions.find(item => item.typ === 'SC');
  assert.equal((await api(`fragen/${question.id}/pruefen`, { antwort: question.antwort })).richtig, true);
  assert.equal((await api(`fragen/${question.id}/pruefen`, { antwort: question.antwort === 'a' ? 'b' : 'a' })).richtig, false);
  const exam = await api('pruefung/generieren', { fachrichtung: 'FIAE', anzahl: 6 });
  assert.equal(exam.fragen.length, 6);
  const result = await api('pruefung/auswerten', { fragen: exam.fragen.map(item => ({ id: item.id, antwort: '' })) });
  assert.equal(result.gesamt, 6);
  assert.equal(result.richtig, 0);
  const journey = await api('journey/fiae');
  assert.equal(journey.readyTopics.length, 94);
  const topic = await api('journey/fiae/topics/' + journey.readyTopics[0].id);
  const quizItem = topic.quiz.questionIds[0];
  const feedback = await api(`journey/fiae/topics/${topic.id}/check`, { version: topic.version, questionId: quizItem, answer: 'a' });
  assert.equal(typeof feedback.correct, 'boolean');
  assert((await api('suche/inhalte?q=DNS')).total > 0);
  assert((await api('theorie/fundstellen?thema=search&q=DNS')).sources.length > 0);
  for (const [route, method] of [['/api/ai/material/status', 'GET'], ['/api/ai/chatgpt/status', 'GET'],
    ['/api/ai/help', 'POST'], ['/api/auth/login', 'POST'], ['/api/sync', 'POST'], ['/api/admin/reload', 'POST']]) {
    const response = await get(route, { method });
    assert.equal(response.status, 404, `Private Route ${route}`);
    assert.match(response.headers.get('content-type') || '', /application\/json/);
  }

  const direct = await get('/frontendkurs/debugger');
  assert.match(direct.headers.get('content-type') || '', /text\/html/);
  assert.match(direct.headers.get('content-security-policy') || '', /script-src 'self'/);
  assert.doesNotMatch(direct.headers.get('content-security-policy'), /'wasm-unsafe-eval'/);
  const workerFiles = siteFiles.filter(file => /^assets\/(js-runner|advanced|debugger)\.worker-[\w-]+\.js$/.test(file));
  assert.equal(workerFiles.length, 3);
  for (const worker of workerFiles) {
    const response = await get('/' + worker);
    assert.match(response.headers.get('content-type') || '', /javascript/);
    const csp = response.headers.get('content-security-policy');
    assert.match(csp, /'wasm-unsafe-eval'/);
    assert.match(csp, /connect-src 'none'/);
    assert.match(csp, /worker-src 'none'/);
  }
  for (const route of ['/assets/debugger.worker-missing.js', '/local-rag/example.pdf', '/backend/.env']) {
    assert.equal((await get(route)).status, 404, route);
  }
  console.log('Öffentliche Dateien, Lern-API, Direktlinks und Worker-Regeln geprüft.');

  browser = await chromium.launch();
  const context = await browser.newContext({ baseURL: preview.origin });
  await context.route(url => ['http:', 'https:'].includes(url.protocol) && url.origin !== preview.origin, route => route.abort());
  const unexpected = [];
  context.on('request', request => {
    const url = new URL(request.url());
    if (['http:', 'https:'].includes(url.protocol) &&
        (url.origin !== preview.origin || /^\/api\/(?:ai|auth|sync|admin)(?:\/|$)/.test(url.pathname))) unexpected.push(url.pathname);
  });
  const page = await context.newPage();
  page.on('pageerror', error => unexpected.push(error.message));
  page.on('console', message => {
    if (message.text().startsWith('PORTFOLIO_TEST_PRIVATE_ACCESS:')) unexpected.push(message.text());
  });
  // Vor dem ersten App-Import: künstliche frühere KI-Einstellungen und
  // Desktop-Anbindung machen selbst nur lesende Zugriffe erkennbar.
  await page.addInitScript(() => {
    if (window.top !== window || location.protocol !== 'http:') return;
    const key = 'azubiprep.ai.settings.v1';
    localStorage.setItem(key, JSON.stringify({ version: 2, provider: 'chatgpt', qwenModel: 'qwen3:4b', chatgptModel: 'test' }));
    localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'test', user: { id: 'test', rolle: 'admin' } }));
    const getItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (name) {
      if (name === key || name === 'azubiprep.auth') console.info('PORTFOLIO_TEST_PRIVATE_ACCESS: ' + name);
      return getItem.call(this, name);
    };
    window.azubiDesktop = {
      async loadAiPreferences() { console.info('PORTFOLIO_TEST_PRIVATE_ACCESS: loadAiPreferences'); return null; },
      async saveAiPreferences() { console.info('PORTFOLIO_TEST_PRIVATE_ACCESS: saveAiPreferences'); },
    };
  });
  await unterdrueckeOnboardingPopups(page);
  await page.goto('/');
  const externalResources = await page.locator('link[href],script[src]').evaluateAll(elements => elements
    .map(element => new URL(element.href || element.src, document.baseURI).origin)
    .filter(origin => origin !== location.origin));
  assert.deepEqual(externalResources, [], 'Die Startseite lädt Ressourcen einschließlich Vorabverbindungen nur von der eigenen Domain');
  await page.getByRole('button', { name: /Ohne Konto weiter nutzen/ }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard', exact: true })).toBeVisible();
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), undefined, { timeout: 30_000 });
  const cacheState = await page.evaluate(async () => {
    const moduleList = '/api/module?fachrichtung=FIAE';
    const search = '/api/suche/inhalte?q=DNS';
    await Promise.all([fetch(moduleList), fetch(search)]);
    const cache = await caches.open((await caches.keys()).find(name => name.startsWith('azubiprep-v')));
    return { moduleList: Boolean(await cache.match(moduleList)), search: Boolean(await cache.match(search)) };
  });
  assert.deepEqual(cacheState, { moduleList: true, search: false }, 'Öffentliche Module bleiben zum Offline-Lesen erhalten, Suchbegriffe bleiben außerhalb des PWA-Caches');
  await page.goto('/lernreise?fr=FIAE');
  await page.getByRole('link', { name: 'Lernreise beginnen', exact: true }).click();
  await page.getByRole('button', { name: 'Abschnitt beginnen', exact: true }).click();
  await page.getByRole('button', { name: 'Gelesen – weiter', exact: true }).click();
  await expect(page.getByRole('heading', { name: topic.blocks[1].title, exact: true })).toBeVisible();
  await expect(page.locator('.journey-status')).toHaveText('Gespeichert');
  await page.reload();
  await expect(page.getByRole('heading', { name: topic.blocks[1].title, exact: true })).toBeVisible();
  await page.goto('/suche?q=DNS');
  await expect(page.getByRole('region', { name: 'Gefundene Lerninhalte' }).getByRole('link').first()).toBeVisible();
  await page.goto('/theorie?modul=HARDWARE');
  const moduleCatalogLink = page.getByRole('link', { name: /Hardware-Grundlagen/ });
  await expect(moduleCatalogLink).toBeVisible();
  const theoryCache = await page.evaluate(async () => {
    const cache = await caches.open((await caches.keys()).find(name => name.startsWith('azubiprep-v')));
    const withSearch = '/api/theorie?q=BIOS';
    await fetch(withSearch);
    return {
      cachedOverview: (await cache.keys()).some(request => {
        const url = new URL(request.url);
        return url.pathname === '/api/theorie' && url.searchParams.get('module') === 'HARDWARE' && url.searchParams.get('q') === '';
      }),
      cachedSearch: Boolean(await cache.match(withSearch)),
    };
  });
  assert.deepEqual(theoryCache, { cachedOverview: true, cachedSearch: false });
  await moduleCatalogLink.click();
  await page.getByRole('button', { name: 'Fundstellen lesen' }).click();
  await expect(page.locator('blockquote').first()).toBeVisible();
  await page.goto('/karteikarten');
  await page.getByRole('button', { name: 'Lösung anzeigen', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Frage wieder ansehen' })).toBeVisible();
  await page.goto('/pruefung');
  await page.getByRole('button', { name: /Prüfung starten/ }).click();
  await page.getByRole('button', { name: 'Vorzeitig abgeben' }).click();
  await expect(page.getByRole('heading', { name: 'Prüfungsergebnis' })).toBeVisible();
  await page.goto('/einstellungen');
  await expect(page.getByRole('heading', { name: 'Einstellungen', exact: true })).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'KI-Anbieter' })).toHaveCount(0);
  await expect(page.getByLabel('PDF hinzufügen')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/frontendkurs/debugger');
  const debuggerUi = page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
  await debuggerUi.getByRole('textbox', { name: 'Eigener Debugcode', exact: true }).fill('console.log(2 + 3);');
  await debuggerUi.getByRole('button', { name: 'Debuggen starten', exact: true }).click();
  await expect(debuggerUi.getByLabel('Debugstatus')).toContainText('Angehalten');
  await debuggerUi.getByRole('button', { name: 'Weiter / bis zum nächsten Haltepunkt', exact: true }).click();
  await expect(debuggerUi.getByLabel('Debugkonsole')).toHaveText('5');
  preview.goOffline();
  await page.goto('/willkommen');
  await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  const offlineModules = await page.evaluate(async () => (await fetch('/api/module?fachrichtung=FIAE')).json());
  assert(offlineModules.some(module => module.modul_id === 'FIAE-PRG'));
  await page.goto('/theorie?modul=HARDWARE');
  await expect(moduleCatalogLink).toBeVisible();
  assert.deepEqual(unexpected, [], 'Unerwartete Anfragen oder Browserfehler');
  console.log('Gastzugang, gespeicherte Lernreise, Suche, Theorie, Karteikarten, Prüfung, mobiler Debugger und Offline-Wiederaufruf geprüft.');
} finally {
  try { await browser?.close(); } finally { await preview.close(); }
}
