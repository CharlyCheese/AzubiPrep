// Aus e2e/ starten: node scripts/update-screenshots.mjs
// Echte gebaute Oberfläche, eigenes Profil, ausschließlich öffentliche Quellen.
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const target = path.join(repo, 'screenshots');
const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-screenshots-')));
const captures = path.join(root, 'captures'); await fs.mkdir(captures);
Object.assign(process.env, {
  DATABASE_URL: '', AI_ENABLED: 'false', OLLAMA_BASE_URL: 'http://127.0.0.1:1',
  CONTENT_DIR: path.join(repo, 'content'), FRONTEND_DIST: path.join(repo, 'frontend/dist'),
  AZUBIPREP_RAG_DIR: path.join(root, 'material'), AZUBIPREP_AI_DIR: path.join(root, 'konten'), HOST: '127.0.0.1',
});
const expected = ['willkommen', 'dashboard', 'suche', 'lernbereich', 'karteikarten', 'pruefungssimulation', 'statistik-abzeichen', 'lernreise', 'lernkalender', 'notizen', 'einstellungen', 'frontend-werkstatt', 'theorie-glossar', 'theorie-fundstellen', 'lernbereich-mobile', 'pruefungssimulation-mobile'];
const captured = [];
let runtime; let browser;
try {
  // Die echte Serverkonfiguration lädt eine benachbarte .env. Deshalb nur
  // Quellcode und Paketmanifest in einen eigenen, leeren App-Ordner übernehmen.
  const demoBackend = path.join(root, 'app', 'backend');
  await fs.cp(path.join(repo, 'backend/src'), path.join(demoBackend, 'src'), { recursive: true });
  await fs.copyFile(path.join(repo, 'backend/package.json'), path.join(demoBackend, 'package.json'));
  await fs.symlink(path.join(repo, 'backend/node_modules'), path.join(demoBackend, 'node_modules'), 'junction');
  const { startForElectron } = await import(pathToFileURL(path.join(demoBackend, 'src/server.js')).href);
  runtime = await startForElectron();
  browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'de-DE', timezoneId: 'Europe/Berlin', colorScheme: 'dark', serviceWorkers: 'block', deviceScaleFactor: 1 });
  const page = await context.newPage(); const errors = [];
  page.on('pageerror', error => errors.push(error));
  await context.route('**/*', async route => {
    const request = route.request(); const url = new URL(request.url());
    if (!['data:', 'blob:'].includes(url.protocol) && url.origin !== runtime.url) return route.abort();
    if (url.pathname.startsWith('/api/ai/')) {
      if (url.pathname === '/api/ai/material/status') {
        const response = await route.fetch(); const status = await response.json();
        if (status.documents.length || status.pending) throw Error('Demomaterial muss leer sein.');
        delete status.location; // Kein persönlicher OS-Pfad im veröffentlichten Bild.
        return route.fulfill({ response, json: status });
      }
      const body = request.method() === 'POST' ? request.postDataJSON() : null;
      if (url.pathname !== '/api/ai/help' || body?.provider !== 'none' || body.intent !== 'read' || body.useMaterial !== false) throw Error('Nur öffentliche modellfreie Fundstellen sind für diese Aufnahmen freigegeben.');
    }
    return route.continue();
  });
  const allQuestions = [...runtime.store.get().questionsById.values()];
  const demoQuestions = ['HARDWARE', 'NETZ-GRUND', 'WISO', 'FIAE-PRG'].flatMap(moduleId => allQuestions.filter(question => question.modul_id === moduleId).slice(0, 12));
  await context.addInitScript(({ questions, origin }) => {
    if (window.self !== window.top || location.origin !== origin) return;
    if (!sessionStorage.getItem('screenshot-seeded')) {
      const progress = {}, activity = {}, eventLog = {};
      questions.forEach((question, index) => {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(index / 12));
        const day = date.toLocaleDateString('sv-SE');
        const correct = index % 5 !== 0;
        activity[day] = (activity[day] || 0) + 1;
        if (correct) eventLog['frage:' + question.id] = true;
        progress[question.id] = { richtig: Number(correct), falsch: Number(!correct), letztesErgebnis: correct, modulId: question.modul_id, geübtAm: date.toISOString() };
      });
      const today = new Date().toLocaleDateString('sv-SE');
      const plan = { [today]: [{ id: 'demo-plan', titel: 'Speicherarten mit Karteikarten wiederholen', modulId: 'HARDWARE', erledigt: false }] };
      localStorage.setItem('azubiprep.plan', JSON.stringify(plan));
      const cards = {};
      questions.slice(0, 6).forEach((question, index) => {
        const due = new Date();
        due.setDate(due.getDate() + Math.floor(index / 2));
        cards[question.id] = { box: 2, wiederholungen: 1, letzteBewertung: 'leicht', faelligAm: due.toISOString() };
      });
      localStorage.setItem('azubiprep.karten', JSON.stringify(cards));
      localStorage.setItem('azubiprep.profil', JSON.stringify({ fachrichtung: 'FIAE', name: 'Demoprofil', prüfungstermin: null }));
      localStorage.setItem('azubiprep.fortschritt', JSON.stringify(progress));
      localStorage.setItem('azubiprep.game', JSON.stringify({ xp: 5 * Object.keys(eventLog).length, eventLog, ziele: { tag: 10, woche: 3 } }));
      localStorage.setItem('azubiprep.aktivitaet', JSON.stringify(activity));
      localStorage.setItem('azubiprep.notizen', JSON.stringify([
        { id: 'demo-ram', titel: 'RAM und SSD unterscheiden', inhalt: 'RAM hält Daten laufender Programme bereit. Die SSD speichert Dateien auch nach dem Ausschalten. Als Nächstes die passenden Hardware-Fragen üben.', modulId: 'HARDWARE', erstelltAm: new Date().toISOString() },
        { id: 'demo-lernen', titel: 'Mein Lernablauf', inhalt: 'Zuerst Theorie lesen, dann Begriffe nachschlagen und anschließend das Verständnis im Quiz prüfen.', modulId: '', erstelltAm: new Date().toISOString() },
      ]));
      localStorage.setItem('azubiprep.theme', 'dark');
      sessionStorage.setItem('screenshot-seeded', 'true');
    }
    localStorage.setItem('azubiprep.tour-gezeigt', 'true');
  }, { origin: runtime.url, questions: demoQuestions.map(({ id, modul_id }) => ({ id, modul_id })) });
  async function visit(route) {
    await page.goto(runtime.url + route);
    await page.locator('main h1').waitFor();
    await page.waitForLoadState('networkidle');
  }
  async function capture(name) {
    if (!expected.includes(name) || captured.includes(name)) throw Error('Unbekannter oder doppelter Screenshot.');
    await page.evaluate(() => document.fonts.ready); await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    if (/\b[A-Z]:[\\/]|[\w.+-]+@[\w.-]+\.[a-z]{2,}|Projektspeicher wird geöffnet|Entwürfe werden geladen|Lade Modul|Fehler 50\d|PRIVATE_SENTINEL/i.test(text) || (process.env.USERNAME && text.includes(process.env.USERNAME))) throw Error('Aufnahme enthält unzulässige oder unfertige Anzeige.');
    if (errors.length) throw Error(`Oberfläche hat einen Laufzeitfehler gemeldet: ${errors[0].message}`);
    await page.screenshot({ path: path.join(captures, `${name}.png`), animations: 'disabled' }); captured.push(name);
    console.log(`Aufgenommen: ${name}`);
  }
  async function showCatalog() {
    await visit('/lernen?offen=LF2');
    await expect(page.locator('#field-LF2').getByRole('link').first()).toBeVisible();
  }
  async function showExam() {
    await visit('/pruefung');
    await expect(page.getByLabel('Fachrichtung', { exact: true })).toHaveValue('FIAE');
  }
  await visit('/');
  await expect(page.getByRole('button', { name: 'Ohne Konto weiter nutzen' })).toBeVisible();
  await capture('willkommen');
  await visit('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dein Lernstand' })).toBeVisible();
  await capture('dashboard');
  await showCatalog();
  await capture('lernbereich');
  await visit('/suche?q=DNS');
  await expect(page.getByRole('region', { name: 'Gefundene Lerninhalte' }).getByRole('link').first()).toBeVisible();
  await capture('suche');
  await visit('/karteikarten');
  await expect(page.getByRole('button', { name: 'Lösung anzeigen' })).toBeVisible();
  await page.getByRole('button', { name: '10', exact: true }).click();
  await expect(page.getByText(/^Stapel \(10 von \d+ fälligen Karten\)/)).toBeVisible();
  await capture('karteikarten');
  await showExam();
  await capture('pruefungssimulation');
  await visit('/statistik');
  await page.locator('summary').filter({ hasText: 'Abzeichen' }).click();
  await expect(page.locator('.abzeichen-grid')).toBeVisible();
  await page.getByRole('heading', { level: 1 }).evaluate(element => element.scrollIntoView({ block: 'start' }));
  await capture('statistik-abzeichen');
  await visit('/lernreise?fr=FIAE');
  await expect(page.getByRole('link', { name: 'Lernreise beginnen', exact: true })).toBeVisible();
  await page.getByText(/Etappen und Themen ansehen/).click();
  await expect(page.getByRole('list', { name: 'Verfügbare Themen in LF1' })).toBeVisible();
  await page.getByRole('heading', { level: 1 }).evaluate(element => element.scrollIntoView({ block: 'start' }));
  await capture('lernreise');
  await visit('/kalender');
  await expect(page.getByRole('button', { name: 'Heute', exact: true })).toBeVisible();
  await capture('lernkalender');
  await visit('/notizen');
  await expect(page.getByRole('heading', { name: 'RAM und SSD unterscheiden' })).toBeVisible();
  await capture('notizen');
  await visit('/einstellungen');
  await expect(page.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('none');
  await expect(page.getByText('Noch keine eigenen Unterlagen', { exact: true })).toBeVisible();
  await capture('einstellungen');
  await visit('/frontendkurs');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Meine erste Webseite</h1>\n<p>Schritt für Schritt lerne ich HTML und CSS.</p>');
  await page.getByRole('button', { name: 'Geteilte Ansicht', exact: true }).click();
  await page.getByRole('region', { name: 'Projekteditor', exact: true }).evaluate(element => element.scrollIntoView({ block: 'start' }));
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Meine erste Webseite', exact: true })).toBeVisible();
  await expect(page.locator('iframe')).toBeInViewport({ ratio: 0.8 });
  await capture('frontend-werkstatt');
  await visit('/theorie?modus=glossary&lf=LF2');
  await expect(page.getByRole('heading', { name: /[1-9]\d* Themen? im Glossar/ })).toBeVisible();
  await capture('theorie-glossar');
  await visit('/theorie?modul=HARDWARE');
  await page.getByRole('link', { name: /Hardware-Grundlagen/ }).click();
  const lesson = page.getByRole('region', { name: 'Theorie lernen', exact: true });
  await lesson.getByRole('textbox').fill('Welche Aufgabe haben BIOS und UEFI beim Start?');
  await lesson.getByRole('button', { name: 'Fundstellen lesen', exact: true }).click();
  await expect(lesson.getByLabel('Fundstellen').locator('figcaption').first()).toContainText('App-');
  await page.setViewportSize({ width: 1440, height: 1300 });
  await lesson.getByRole('textbox').locator('..').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await expect(lesson.getByRole('textbox')).toBeInViewport();
  await expect(lesson.getByLabel('Fundstellen').locator('blockquote').last()).toBeInViewport();
  await capture('theorie-fundstellen');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.setItem('azubiprep.theme', 'light'));
  await showCatalog();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await capture('lernbereich-mobile');
  await showExam();
  await capture('pruefungssimulation-mobile');
  if (captured.length !== expected.length) throw Error('Aufnahmen unvollständig.');
  await fs.mkdir(target, { recursive: true });
  if (await fs.realpath(target) !== path.join(await fs.realpath(repo), 'screenshots')) throw Error('Zielordner liegt außerhalb des Projekts.');
  for (const name of expected) {
    const bytes = await fs.readFile(path.join(captures, `${name}.png`));
    if (bytes.length < 12000 || bytes.subarray(1, 4).toString() !== 'PNG') throw Error('Ungültige Bildausgabe.');
  }
  for (const name of expected) await fs.copyFile(path.join(captures, `${name}.png`), path.join(target, `${name}.png`));
  console.log(`${captured.length} geprüfte Screenshots im Projekt ersetzt/ergänzt.`);
} finally {
  await browser?.close();
  if (runtime) { runtime.server.closeAllConnections(); await new Promise(resolve => runtime.server.close(resolve)); }
  const resolved = await fs.realpath(root);
  if (path.dirname(resolved) !== await fs.realpath(os.tmpdir()) || !path.basename(resolved).startsWith('azubiprep-screenshots-')) throw Error('Temporäre Aufräumgrenze verletzt.');
  await fs.rm(resolved, { recursive: true, force: true });
}
