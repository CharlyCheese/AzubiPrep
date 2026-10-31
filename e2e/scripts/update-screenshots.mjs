// Aus e2e/ starten: node scripts/update-screenshots.mjs
// Echte gebaute Oberfläche, eigenes Profil, ausschließlich öffentliche Quellen.
import { chromium, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const target = path.join(repo, 'screenshots');
const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-screenshots-')));
const captures = path.join(root, 'captures'); await fs.mkdir(captures);
Object.assign(process.env, {
  DATABASE_URL: '', AI_ENABLED: 'false', OLLAMA_BASE_URL: 'http://127.0.0.1:1',
  CONTENT_DIR: path.join(repo, 'content'), FRONTEND_DIST: path.join(repo, 'frontend/dist'),
  AZUBIPREP_RAG_DIR: path.join(root, 'private'), HOST: '127.0.0.1',
});
const expected = ['dashboard', 'lernbereich', 'karteikarten', 'pruefungssimulation', 'statistik-abzeichen', 'lernreise', 'lernkalender', 'notizen', 'einstellungen', 'frontend-werkstatt', 'theorie-glossar', 'theorie-fundstellen', 'lernbereich-mobile', 'pruefungssimulation-mobile'];
const captured = [];
let runtime; let browser;
try {
  const { startForElectron } = await import('../../backend/src/server.js');
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
      if (url.pathname !== '/api/ai/help' || request.postDataJSON()?.intent !== 'read' || request.postDataJSON()?.useMaterial !== false) throw Error('Nur öffentliche modellfreie Fundstellen sind für diese Aufnahmen freigegeben.');
    }
    return route.continue();
  });
  const allQuestions = [...runtime.store.get().questionsById.values()];
  const demoQuestions = ['HARDWARE', 'NETZ-GRUND', 'WISO', 'FIAE-PRG'].flatMap(moduleId => allQuestions.filter(question => question.modul_id === moduleId).slice(0, 12));
  await context.addInitScript(({ questions }) => {
    if (!sessionStorage.getItem('screenshot-seeded')) {
      const today = new Date().toISOString().slice(0, 10); const progress = {};
      questions.forEach((question, index) => { progress[question.id] = { richtig: index % 5 ? 1 : 0, falsch: index % 5 ? 0 : 1, letztesErgebnis: index % 5 !== 0, modulId: question.modul_id, geübtAm: new Date().toISOString() }; });
      localStorage.setItem('azubiprep.profil', JSON.stringify({ fachrichtung: 'FIAE', name: 'Demoprofil', prüfungstermin: null }));
      localStorage.setItem('azubiprep.fortschritt', JSON.stringify(progress));
      localStorage.setItem('azubiprep.game', JSON.stringify({ xp: 480, ziele: { tag: 10, woche: 3 } }));
      localStorage.setItem('azubiprep.aktivitaet', JSON.stringify({ [today]: 12 }));
      localStorage.setItem('azubiprep.notizen', JSON.stringify([
        { id: 'demo-ram', titel: 'RAM und SSD unterscheiden', inhalt: 'RAM hält Daten laufender Programme bereit. Die SSD speichert Dateien auch nach dem Ausschalten. Als Nächstes die passenden Hardware-Fragen üben.', modulId: 'HARDWARE', erstelltAm: new Date().toISOString() },
        { id: 'demo-lernen', titel: 'Mein Lernablauf', inhalt: 'Zuerst Theorie lesen, dann Begriffe nachschlagen und anschließend das Verständnis im Quiz prüfen.', modulId: '', erstelltAm: new Date().toISOString() },
      ]));
      localStorage.setItem('azubiprep.theme', 'dark');
      localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify({ version: 1, enabled: false, model: 'qwen3:4b' }));
      sessionStorage.setItem('screenshot-seeded', 'true');
    }
    sessionStorage.setItem('azubiprep.begruessung-gezeigt', 'true');
    localStorage.setItem('azubiprep.tour-gezeigt', 'true');
    localStorage.setItem('azubiprep.landing-gesehen', 'true');
  }, { questions: demoQuestions.map(({ id, modul_id }) => ({ id, modul_id })) });
  async function visit(route) {
    await page.goto(runtime.url + route); await page.locator('main h1').waitFor();
    await page.waitForLoadState('networkidle'); await expect(page.locator('.loading')).toHaveCount(0);
  }
  async function capture(name) {
    if (!expected.includes(name) || captured.includes(name)) throw Error('Unbekannter oder doppelter Screenshot.');
    await page.evaluate(() => document.fonts.ready); await page.waitForLoadState('networkidle');
    const text = await page.locator('body').innerText();
    if (/C:[\\/]Users[\\/]|Projektspeicher wird geöffnet|Lade Modul|Fehler 50\d|PRIVATE_SENTINEL/.test(text) || (process.env.USERNAME && text.includes(process.env.USERNAME))) throw Error('Aufnahme enthält unzulässige oder unfertige Anzeige.');
    if (errors.length) throw Error(`Oberfläche hat einen Laufzeitfehler gemeldet: ${errors[0].message}`);
    await page.screenshot({ path: path.join(captures, `${name}.png`), animations: 'disabled' }); captured.push(name);
    console.log(`Aufgenommen: ${name}`);
  }
  for (const [name, route] of [['dashboard', '/'], ['lernbereich', '/lernen'], ['karteikarten', '/karteikarten?modulId=HARDWARE'], ['pruefungssimulation', '/pruefung'], ['statistik-abzeichen', '/statistik'], ['lernreise', '/lernreise'], ['lernkalender', '/kalender'], ['notizen', '/notizen'], ['einstellungen', '/einstellungen']]) {
    await visit(route);
    if (name === 'dashboard') await expect(page.getByText(`von ${runtime.store.get().gesamtFragen} im Bestand`, { exact: true })).toBeVisible();
    if (name === 'lernbereich') await page.getByRole('button', { name: /^LF2/ }).click();
    await capture(name);
  }
  await visit('/frontendkurs');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Meine erste Webseite</h1>\n<p>Schritt für Schritt lerne ich HTML und CSS.</p>');
  await page.getByRole('button', { name: 'Geteilte Ansicht', exact: true }).click();
  await page.getByRole('region', { name: 'Projekteditor', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Meine erste Webseite', exact: true })).toBeVisible();
  await capture('frontend-werkstatt');
  await visit('/theorie?lf=LF2'); await capture('theorie-glossar');
  await visit('/theorie?modul=HARDWARE'); await page.getByRole('button', { name: /Hardware-Grundlagen/ }).click();
  const lesson = page.getByRole('region', { name: 'Theorie lernen', exact: true });
  await lesson.getByRole('textbox').fill('Welche Aufgabe haben BIOS und UEFI beim Start?');
  await lesson.getByRole('button', { name: 'Fundstellen lesen', exact: true }).click();
  await expect(lesson.getByLabel('Fundstellen')).toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1200 });
  await lesson.locator('h2').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await capture('theorie-fundstellen');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => localStorage.setItem('azubiprep.theme', 'light'));
  await visit('/lernen'); await page.getByRole('button', { name: /^LF2/ }).click(); await capture('lernbereich-mobile');
  await visit('/pruefung'); await capture('pruefungssimulation-mobile');
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
