import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../frontend/src/pilot');
const source = ['project.js', 'preview.js', 'course.js', 'validator.js'].map((file) => fs.readFileSync(path.join(root, file), 'utf8').replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');

test('Alle Musterlösungen und Alternativen bestehen; zwei typische Fehler je Aufgabe werden erkannt', async ({ browser }) => {
  const page = await browser.newPage();
  const results = await page.evaluate((code) => {
    const api = new Function(`${code}\nreturn { LESSONS, solutionFor, validateProject };`)();
    return api.LESSONS.map((lesson) => {
      const solution = api.solutionFor(lesson);
      const alternate = structuredClone(solution);
      for (const file of Object.values(alternate)) if (file.kind === 'text') file.content = file.content.replaceAll('<h1>', '<h1 class="eigene-klasse">').replaceAll('Meine Lernseite', 'Mein anderes Thema');
      const missingHeading = structuredClone(solution);
      for (const file of Object.values(missingHeading)) if (file.kind === 'text') file.content = file.content.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '');
      const brokenDocument = structuredClone(solution);
      const rule = lesson.rules.at(-1);
      for (const file of Object.values(brokenDocument)) if (file.kind === 'text') {
        if (rule === 'paragraph') file.content = file.content.replace(/<p\b[^>]*>[\s\S]*?<\/p>/gi, '');
        if (rule === 'list') file.content = file.content.replace(/<li\b[^>]*>[\s\S]*?<\/li>/gi, '');
        if (rule === 'links') file.content = file.content.replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, '');
        if (rule === 'image' || rule === 'project') file.content = file.content.replace(/<img\b[^>]*>/gi, '');
        if (rule === 'semantic') file.content = file.content.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '');
        if (rule === 'css') file.content = file.content.replace(/<link\b[^>]*>/gi, '');
        if (rule === 'class') file.content = file.content.replaceAll('.hinweis', 'p');
      }
      return { id: lesson.id, valid: api.validateProject(solution, lesson, '1').passed, alternate: api.validateProject(alternate, lesson, '2').passed, missing: api.validateProject(missingHeading, lesson, '3').passed, empty: api.validateProject(brokenDocument, lesson, '4').passed };
    });
  }, source);
  for (const item of results) { expect(item, item.id).toEqual({ id: item.id, valid: true, alternate: true, missing: false, empty: false }); }
  await page.close();
});

test.beforeEach(async ({ page }) => { await unterdrueckeOnboardingPopups(page); });

test('Bewertung berücksichtigt freie Startseite, HTML-Varianten, Vererbung und echte Klassenselektoren', async ({ browser }) => {
  const page = await browser.newPage();
  const result = await page.evaluate((code) => {
    const api = new Function(`${code}\nreturn { LESSONS, solutionFor, validateProject };`)();
    const lesson = api.LESSONS.find((item) => item.id === 'klassen');
    const files = api.solutionFor(lesson);
    files['index.html'].content = files['index.html'].content.replace('lang="de"', 'lang=de');
    files['css/style.css'].content = files['css/style.css'].content.replace('p { font-family:', 'body { font-family:');
    const valid = api.validateProject(files, lesson, '1').passed;
    const invalid = structuredClone(files);
    invalid['css/style.css'].content = 'h1{color:navy} p{font-family:sans-serif;background-color:yellow}';
    const noClass = api.validateProject(invalid, lesson, '2').passed;
    const home = files['index.html'].content.replaceAll('ueber-uns.html', 'about.html');
    const about = files['ueber-uns.html'].content.replaceAll('index.html', 'home.html');
    const renamed = { 'about.html': { kind: 'text', content: about }, 'home.html': { kind: 'text', content: home }, 'css/style.css': files['css/style.css'], 'bilder/beispiel.png': files['bilder/beispiel.png'] };
    const freeNames = api.validateProject(renamed, lesson, '3', 'home.html').passed;
    const missing = structuredClone(files); missing['ueber-uns.html'].content = missing['ueber-uns.html'].content.replace(/<title>.*?<\/title>/, '');
    const errorFile = api.validateProject(missing, lesson, '4').results.find((item) => item.rule === 'document').file;
    const wrongCase = structuredClone(files); wrongCase['index.html'].content = wrongCase['index.html'].content.replace('src="bilder/', 'src="Bilder/');
    const caseMessage = api.validateProject(wrongCase, lesson, '5').results.find((item) => item.rule === 'path')?.message || '';
    return { valid, noClass, freeNames, errorFile, caseMessage: caseMessage.includes('Groß-/Kleinschreibung') };
  }, source);
  expect(result).toEqual({ valid: true, noClass: false, freeNames: true, errorFile: 'ueber-uns.html', caseMessage: true });
  await page.close();
});
async function open(page, lesson = 'zweite-seite') {
  await page.goto('/frontendkurs');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption(lesson);
}
async function importJson(page, files) {
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'projekt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
}
const text = (content) => ({ kind: 'text', content });

test('Externer Mehrdateistand erhält CSS, Bilder und Navigation ohne Originaländerung', async ({ page }) => {
  await open(page, 'stylesheet');
  const files = {
    'index.html': text('<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Start</title><link rel="stylesheet" href="css/style.css"></head><body><h1>Startseite</h1><p>Text</p><a href="zweite.html">Weiter</a><img src="bilder/logo.png" alt="Blaues Zeichen"></body></html>'),
    'zweite.html': text('<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Zweite</title><link rel="stylesheet" href="css/style.css"></head><body><h1>Zweite Seite</h1><a href="index.html">Zurück</a></body></html>'),
    'css/style.css': text('h1 { color: rgb(0, 0, 128); } p {font-family: sans-serif}'),
    'bilder/logo.png': { kind: 'image', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGPQyNtCU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULADD+KEyfbA9oAAAAAElFTkSuQmCC' },
  };
  const original = JSON.stringify(files);
  await importJson(page, files);
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await expect(frame.getByRole('heading', { name: 'Startseite' })).toHaveCSS('color', 'rgb(0, 0, 128)');
  await expect.poll(() => frame.locator('img').evaluate((img) => img.naturalWidth)).toBe(32);
  await frame.getByRole('link', { name: 'Weiter' }).click();
  await expect(frame.getByRole('heading', { name: 'Zweite Seite' })).toBeVisible();
  await frame.getByRole('link', { name: 'Zurück' }).click();
  await expect(frame.getByRole('heading', { name: 'Startseite' })).toBeVisible();
  await page.getByRole('button', { name: 'Element untersuchen', exact: true }).click();
  await frame.getByRole('heading', { name: 'Startseite' }).click();
  await expect(page.getByRole('heading', { name: 'h1 in index.html' })).toBeVisible();
  expect(JSON.stringify(files)).toBe(original);
});

test('Skripte, Weiterleitungen und externe Ressourcen bleiben gesperrt', async ({ page }) => {
  await open(page);
  let outside = 0;
  page.on('request', (request) => { if (request.url().includes('example.invalid') || request.url().includes('11434')) outside++; });
  await importJson(page, {
    'index.html': text('<meta http-equiv="refresh" content="0;url=http://localhost:11434"><script>parent.localStorage.setItem("pilot-escaped","yes")</script><h1 onclick="parent.location.href=\'https://example.invalid\'">Sicher</h1><img src="https://example.invalid/pixel"><iframe src="http://localhost:11434"></iframe><style>@import "https://example.invalid/x.css"; h1{background-image:url(https://example.invalid/a)}</style><a href="javascript:alert(1)">Angriff</a><a href="https://example.invalid" target="_blank" download>Fremdseite</a>'),
  });
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  const frame = page.frameLocator('iframe');
  await expect(frame.getByRole('heading', { name: 'Sicher' })).toBeVisible();
  await frame.getByRole('heading', { name: 'Sicher' }).click();
  await frame.getByRole('link', { name: 'Angriff' }).click();
  await frame.getByRole('link', { name: 'Fremdseite' }).click();
  expect(page.context().pages().length).toBe(1);
  expect(await page.evaluate(() => localStorage.getItem('pilot-escaped'))).toBeNull();
  expect(outside).toBe(0);
  expect(await frame.locator('script,iframe,meta[http-equiv="refresh"]').count()).toBe(0);
  await expect(page).toHaveURL(/frontendkurs$/);
});

test('Gesicherter Entwurf wird nach Neustart wiederhergestellt; Schreibfehler sind sichtbar', async ({ page }) => {
  await open(page, 'erste-seite');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Mein wiederhergestellter Entwurf</h1><p>Hallo</p>');
  await expect(page.getByRole('status')).toHaveText('Gespeichert');
  await page.reload();
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Mein wiederhergestellter Entwurf');
  await page.evaluate(() => { navigator.storage.getDirectory = async () => { throw new Error('Simulierter Schreibfehler'); }; });
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Ungesicherte Änderung</h1>');
  await expect(page.getByRole('status')).toContainText('Speichern fehlgeschlagen');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sicherung exportieren (JSON)' }).click();
  expect((await download).suggestedFilename()).toBe('mein-lernprojekt.json');
});

test('Hinweise, Prüfung, offene Fortsetzung und kleinere Ansichten sind bedienbar', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await open(page, 'erste-seite');
  await page.getByRole('button', { name: 'Nächsten Hinweis zeigen' }).click();
  await expect(page.getByText('Nutze h1 für die Hauptüberschrift und p für den Absatz.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Code index.html', exact: true });
  await editor.fill('<h1>Mein Thema</h1><p>Meine Einleitung.</p>');
  await editor.press('Tab');
  await expect(editor).not.toBeFocused();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
  await expect(page.getByText(/Hilfen: 1/)).toBeVisible();
  await page.getByRole('button', { name: 'Offen lassen und weiterlernen', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toHaveValue('dokument');
  await page.setViewportSize({ width: 683, height: 384 });
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'Projektseite' })).toBeVisible();
});

test('Echter Ordnerimport erhält Unterordner; ZIP- und JSON-Export behalten Dateien', async ({ page }, testInfo) => {
  const dir = testInfo.outputPath('projekt');
  fs.mkdirSync(path.join(dir, 'seiten'), { recursive: true }); fs.mkdirSync(path.join(dir, 'css'), { recursive: true });
  const files = { 'index.html': '<h1>Ordnerprojekt</h1><a href="seiten/zweite.html">Zur zweiten Seite</a><link rel="stylesheet" href="css/style.css">', 'seiten/zweite.html': '<h1>Zweite Ordnerseite</h1><a href="../index.html">Zurück</a>', 'css/style.css': 'h1{color:navy}' };
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);
  fs.writeFileSync(path.join(dir, '.env'), 'GEHEIM=NICHT_LESEN');
  await open(page);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Ordner einlesen', { exact: true }).setInputFiles(dir);
  await expect(page.getByRole('button', { name: 'seiten/zweite.html', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await page.frameLocator('iframe').getByRole('link', { name: 'Zur zweiten Seite' }).click();
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Zweite Ordnerseite' })).toBeVisible();
  const jsonEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Sicherung exportieren (JSON)' }).click();
  const downloaded = JSON.parse(fs.readFileSync(await (await jsonEvent).path(), 'utf8'));
  expect(Object.keys(downloaded.files).sort()).toEqual(Object.keys(files).sort());
  for (const [name, content] of Object.entries(files)) expect(fs.readFileSync(path.join(dir, name), 'utf8')).toBe(content);
  const zipEvent = page.waitForEvent('download'); await page.getByRole('button', { name: 'Dateien für eigenen Editor (ZIP)' }).click();
  const zip = fs.readFileSync(await (await zipEvent).path());
  expect(zip.readUInt32LE()).toBe(0x04034b50);
  expect(zip.includes(Buffer.from('seiten/zweite.html'))).toBe(true);
  expect(zip.includes(Buffer.from('GEHEIM'))).toBe(false);
});

test('Bewertungsmeldung enthält geprüften Stand; Änderungen verlieren nicht still die Versionshistorie', async ({ page }) => {
  await open(page, 'erste-seite');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Geprüfter Stand</h1><p>Hallo</p>');
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Spätere Änderung</h1>');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByText(/Älterer Datei- oder Regelstand/)).toBeVisible();
  expect(await page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option:checked').textContent()).not.toContain('Prüfung bestanden');
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Bewertung fragwürdig? Meldung exportieren' }).click();
  const report = JSON.parse(fs.readFileSync(await (await event).path(), 'utf8'));
  expect(report.submission.files['index.html'].content).toContain('Geprüfter Stand');
  expect(report.stand).toBe(report.result.stand); expect(report.stand).toBe(report.submission.stand);
  await expect(page.getByRole('status')).toHaveText('Gespeichert');
  await page.evaluate(async () => {
    const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');
    const head = JSON.parse(await (await (await dir.getFileHandle('head.json')).getFile()).text());
    const handle = await dir.getFileHandle(head.slot + '.json'); const saved = JSON.parse(await (await handle.getFile()).text());
    saved.projects['erste-seite'].checks.at(-1).validatorVersion = 'älterer-prüfer';
    const stream = await handle.createWritable(); await stream.write(JSON.stringify(saved)); await stream.close();
  });
  await page.reload(); await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByText(/Älterer Datei- oder Regelstand/)).toBeVisible();
  await expect(page.getByText(/älterer-prüfer/)).toBeVisible();
});

test('Zurücksetzen betrifft nur die gewählte Aufgabe und ungültiger Import ersetzt nichts', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Mein externer Arbeitsstand</h1>');
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files: { '../private.html': text('x') } })) });
  await expect(page.getByRole('alert')).toContainText('Pfad');
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue('<h1>Mein externer Arbeitsstand</h1>');
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('erste-seite');
  page.once('dialog', (dialog) => dialog.accept()); await page.getByRole('button', { name: 'Diese Aufgabe zurücksetzen' }).click();
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue('<h1>Mein externer Arbeitsstand</h1>');
});

test('JSON-Sicherung erhält freie Startseite und vorhandene Bilder werden nicht überschrieben', async ({ page }) => {
  await open(page);
  const files = {
    'about.html': text('<h1>Über uns</h1><a href="home.html">Zurück</a>'),
    'home.html': text('<h1>Meine Startseite</h1><a href="about.html">Weiter</a>'),
    'bilder/beispiel.png': { kind: 'image', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGPQyNtCU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULADD+KEyfbA9oAAAAAElFTkSuQmCC' },
  };
  await importJson(page, files);
  await page.getByRole('combobox', { name: 'Projektstartseite', exact: true }).selectOption('home.html');
  await page.getByRole('button', { name: 'Beispielbild ergänzen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('bereits vorhanden und bleibt unverändert');
  const event = page.waitForEvent('download'); await page.getByRole('button', { name: 'Sicherung exportieren (JSON)' }).click();
  const saved = fs.readFileSync(await (await event).path());
  expect(JSON.parse(saved).entry).toBe('home.html');
  expect(JSON.parse(saved).files['bilder/beispiel.png']).toEqual(files['bilder/beispiel.png']);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'saved.json', mimeType: 'application/json', buffer: saved });
  await expect(page.getByRole('combobox', { name: 'Projektstartseite', exact: true })).toHaveValue('home.html');
});

test('OPFS erhält den letzten gesicherten Stand bei Kursgrenze und unbekanntem Schema', async ({ browser }) => {
  const context = await browser.newContext({ bypassCSP: true, serviceWorkers: 'block' });
  const page = await context.newPage(); await page.goto('http://127.0.0.1:3001/api/health');
  const code = fs.readFileSync(path.join(root, 'storage.js'), 'utf8').replace(/^export /gm, '');
  const result = await page.evaluate(async (code) => {
    const api = new Function(`${code}\nreturn { saveCourse, loadCourse };`)();
    await api.saveCourse({ schema: 1, note: 'Erhaltener Stand' });
    let quota = false;
    try { await api.saveCourse({ schema: 1, note: 'x'.repeat(33 * 1024 * 1024) }); } catch { quota = true; }
    const preserved = (await api.loadCourse()).note;
    const dir = await (await navigator.storage.getDirectory()).getDirectoryHandle('azubiprep-frontendpilot-v1');
    const stream = await (await dir.getFileHandle('head.json')).createWritable(); await stream.write(JSON.stringify({ schema: 99, slot: 'a' })); await stream.close();
    let blocked = false; try { await api.saveCourse({ schema: 1, note: 'Nicht überschreiben' }); } catch { blocked = true; }
    const head = JSON.parse(await (await (await dir.getFileHandle('head.json')).getFile()).text());
    return { quota, preserved, blocked, schema: head.schema };
  }, code);
  expect(result).toEqual({ quota: true, preserved: 'Erhaltener Stand', blocked: true, schema: 99 });
  await context.close();
});

test('Zweite Datei kann direkt im Editor angelegt und per Tastatur untersucht werden', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Code index.html', exact: true });
  const start = await editor.inputValue();
  await editor.fill(start.replace('</body>', '<a href="seiten/zweite%20seite.html">Zweite Seite öffnen</a></body>'));
  await page.getByLabel('Neuer relativer Dateipfad', { exact: true }).fill('seiten/zweite seite.html');
  await page.getByRole('button', { name: 'Datei anlegen', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code seiten/zweite seite.html', exact: true }).fill('<!doctype html><html lang=de><head><meta charset=utf-8><title>Zweite</title></head><body><h1>Meine zweite Seite</h1><a href="../index.html">Zur Startseite</a></body></html>');
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await page.frameLocator('iframe').getByRole('link', { name: 'Zweite Seite öffnen' }).click();
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Meine zweite Seite' })).toBeVisible();
  const inspector = page.getByRole('combobox', { name: 'Element per Tastatur untersuchen' });
  const option = await inspector.locator('option').filter({ hasText: 'h1 ·' }).first().getAttribute('value');
  await inspector.selectOption(option);
  await expect(page.getByRole('heading', { name: 'h1 in seiten/zweite seite.html' })).toBeVisible();
});

test('Entwürfe überleben das vollständige Schließen und erneute Öffnen eines Browserprofils', async ({ playwright }, testInfo) => {
  const profile = testInfo.outputPath('eigenes-testprofil');
  let context = await playwright.chromium.launchPersistentContext(profile, { headless: true, serviceWorkers: 'block' });
  try {
    let page = context.pages()[0]; await unterdrueckeOnboardingPopups(page);
    await page.goto('http://127.0.0.1:3001/frontendkurs');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Nach Browserneustart vorhanden</h1><p>Gesichert.</p>');
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
    await context.close();
    context = await playwright.chromium.launchPersistentContext(profile, { headless: true, serviceWorkers: 'block' });
    page = context.pages()[0]; await unterdrueckeOnboardingPopups(page);
    await page.goto('http://127.0.0.1:3001/frontendkurs');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue('<h1>Nach Browserneustart vorhanden</h1><p>Gesichert.</p>');
  } finally { await context.close(); }
});

test('Überkomplexe Vorschau lässt sich ohne Verlust des bearbeitbaren Entwurfs korrigieren', async ({ page }) => {
  await open(page);
  await importJson(page, { 'index.html': text('<h1>Großer Entwurf</h1>' + '<p>x</p>'.repeat(1600)) });
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Browser-Vorschau' }).getByRole('alert')).toContainText('Vorschau zu komplex');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Großer Entwurf');
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Vorschau wiederhergestellt</h1><p>Jetzt übersichtlich.</p>');
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Vorschau wiederhergestellt' })).toBeVisible();
});

test('Wiederholte große Bildreferenzen begrenzen die Vorschau statt den Speicher zu fluten', async ({ browser }) => {
  const page = await browser.newPage();
  try {
    const result = await page.evaluate((code) => {
      const api = new Function(`${code}\nreturn { buildPreview };`)();
      const image = 'data:image/png;base64,' + 'A'.repeat(1024 * 1024);
      const files = { 'index.html': { kind: 'text', content: '<h1>Bilder</h1>' + '<img src="bild.png" alt="Test">'.repeat(16) }, 'bild.png': { kind: 'image', content: image } };
      try { api.buildPreview(files, 'index.html'); return 'unbegrenzt'; } catch (error) { return error.message; }
    }, source);
    expect(result).toContain('Zu viele Bilddaten');
  } finally { await page.close(); }
});

test('Nacheinander ausgewählte HTML- und CSS-Dateien ergänzen das Projekt; Aktualisieren ist abbrechbar', async ({ page }) => {
  await open(page);
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'meine-seite.html', mimeType: 'text/html', buffer: Buffer.from('<h1>Meine eigene Seite</h1>') });
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await expect(page.getByRole('group', { name: 'Dateibaum' }).getByRole('button', { name: 'meine-seite.html', exact: true })).toBeVisible();
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'zweite.html', mimeType: 'text/html', buffer: Buffer.from('<h1>Meine zweite Seite</h1>') });
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  const tree = page.getByRole('group', { name: 'Dateibaum' });
  await expect(tree.getByRole('button', { name: 'meine-seite.html', exact: true })).toBeVisible();
  await expect(tree.getByRole('button', { name: 'zweite.html', exact: true })).toBeVisible();
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'style.css', mimeType: 'text/css', buffer: Buffer.from('h1{color:navy}') });
  await page.getByRole('textbox', { name: 'Relativer Pfad 1', exact: true }).fill('css/style.css');
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await expect(tree.getByRole('button', { name: 'css/style.css', exact: true })).toBeVisible();
  await expect(tree.getByRole('button', { name: 'meine-seite.html', exact: true })).toBeVisible();
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'zweite.html', mimeType: 'text/html', buffer: Buffer.from('<h1>Aktualisierung</h1>') });
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await tree.getByRole('button', { name: 'zweite.html', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code zweite.html', exact: true })).toHaveValue('<h1>Meine zweite Seite</h1>');
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code zweite.html', exact: true })).toHaveValue('<h1>Aktualisierung</h1>');
  await expect(tree.getByRole('button', { name: 'meine-seite.html', exact: true })).toBeVisible();
  await expect(tree.getByRole('button', { name: 'css/style.css', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Gespeichert');
  await page.reload();
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(tree.getByRole('button', { name: 'meine-seite.html', exact: true })).toBeVisible();
  await expect(tree.getByRole('button', { name: 'zweite.html', exact: true })).toBeVisible();
  await expect(tree.getByRole('button', { name: 'css/style.css', exact: true })).toBeVisible();
});

test('Dateiauswahlknöpfe sind sichtbar und die Einführung führt zur Werkstatt', async ({ page }) => {
  await open(page);
  const upload = page.locator('label.pilot-upload').filter({ has: page.getByLabel('Ordner einlesen', { exact: true }) });
  await expect(upload).toBeVisible();
  await expect(upload).toHaveClass(/btn-primary/);
  const bounds = await upload.boundingBox(); expect(bounds.height).toBeGreaterThanOrEqual(44);
  await page.getByLabel('Ordner einlesen', { exact: true }).focus();
  await expect(page.getByLabel('Ordner einlesen', { exact: true })).toBeFocused();
  await expect(page.locator('#pilot-folder-help')).toContainText('zeigt Ordner statt einzelner Dateien');
  await page.goto('/einstellungen');
  await expect(page.getByText('Kurze Führung durch Dashboard, Lernreise, Lernbereich, Frontend-Werkstatt und Prüfungssimulation.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Kurze Tour erneut anzeigen' }).click();
  const dialog = page.getByRole('dialog');
  for (let i = 0; i < 3; i++) await dialog.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await expect(dialog.getByRole('heading', { name: 'Frontend-Werkstatt 💻', exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/frontendkurs$/);
  await expect(dialog).toContainText('Kurze Führung (4/5)');
  await dialog.getByRole('button', { name: 'Weiter →', exact: true }).click();
  await dialog.getByRole('button', { name: 'Fertig', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('azubiprep.tour-gezeigt'))).toBe('true');
});

test('Überschreitet eine Ergänzung das Projektlimit, bleibt der gesamte bisherige Stand erhalten', async ({ page }) => {
  await open(page);
  const files = Object.fromEntries(Array.from({ length: 50 }, (_, index) => [`seite-${index}.html`, text(`<h1>Seite ${index}</h1>`)]));
  await importJson(page, files);
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'neu.css', mimeType: 'text/css', buffer: Buffer.from('h1{color:navy}') });
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('50 Dateien');
  const tree = page.getByRole('group', { name: 'Dateibaum' });
  await expect(tree.getByRole('button')).toHaveCount(50);
  await expect(tree.getByRole('button', { name: 'neu.css', exact: true })).toHaveCount(0);
  await tree.getByRole('button', { name: 'seite-49.html', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Code seite-49.html', exact: true })).toHaveValue('<h1>Seite 49</h1>');
});

test('Vorformatierter Vers bleibt erhalten; offenes Absatzlernziel wird verständlich erklärt', async ({ page }) => {
  await open(page, 'erste-seite');
  await expect(page.getByRole('region', { name: 'Lektionstext' })).toContainText('Textabsatz mit <p>');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Code index.html', exact: true });
  const verse = 'Erste Zeile\n  Zweite Zeile';
  await editor.fill(`<h1>Mein Gedicht</h1><pre>${verse}</pre>`);
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  const results = page.getByRole('region', { name: 'Prüfergebnisse' });
  await expect(results).toContainText('Eine Hauptüberschrift mit Inhalt ist vorhanden.');
  await expect(results).toContainText('Du verwendest <pre>.');
  await expect(results).toContainText('erhält Zeilenumbrüche und Leerzeichen');
  await expect(results).toContainText('Diese Aufgabe übt einen Textabsatz mit <p>');
  await expect(results).toContainText('bedeutet nicht automatisch einen HTML-Syntaxfehler');
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await expect(page.frameLocator('iframe').locator('pre')).toHaveText(verse, { useInnerText: false });
  expect(await page.frameLocator('iframe').locator('pre').textContent()).toBe(verse);
  await expect(page.frameLocator('iframe').locator('pre')).toHaveCSS('white-space', 'pre');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await editor.fill(`<h1>Mein Gedicht</h1><p>Eine Einleitung zu meinem Gedicht.</p><pre>${verse}</pre>`);
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(results).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await expect(results).toContainText('Ein Textabsatz mit <p> und eigenem Inhalt ist vorhanden.');
});

test('Frischer Gesamtdurchlauf ohne KI: erklären, zweite Datei, Import, Korrektur, Neustart und Export', async ({ playwright }, testInfo) => {
  const profile = testInfo.outputPath('frischer-gesamtdurchlauf');
  const doc = (body) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>Mein Projekt</title></head><body>${body}</body></html>`;
  const second = doc('<h1>Zweite Seite</h1><p>Ein weiterer Inhalt.</p><a href="index.html">Zurück</a>');
  const start = doc('<h1>Mein Projekt</h1><p>Meine Einleitung.</p><ul><li>HTML lernen</li><li>Seiten verbinden</li></ul><a href="zweite.html">Weiter</a>');
  let modelRequests = 0;
  const observe = (page) => page.on('request', (request) => { if (/11434|ollama|\/api\/ki\b/.test(request.url())) modelRequests++; });
  let context = await playwright.chromium.launchPersistentContext(profile, { headless: true, serviceWorkers: 'block' });
  try {
    let page = context.pages()[0]; observe(page); await unterdrueckeOnboardingPopups(page);
    await page.goto('http://127.0.0.1:3001/frontendkurs');
    await expect(page.getByRole('region', { name: 'Lektionstext' })).toContainText('HTML beschreibt Inhalte');
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
    await expect(page.getByRole('region', { name: 'Lektionstext' })).toContainText('Ab jetzt kannst du extern arbeiten');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await page.getByLabel('Neuer relativer Dateipfad', { exact: true }).fill('zweite.html');
    await page.getByRole('button', { name: 'Datei anlegen', exact: true }).click();
    await page.getByRole('textbox', { name: 'Code zweite.html', exact: true }).fill(second);
    await importJson(page, { 'index.html': text(start.replace('href="zweite.html"', 'href="falsch.html"')), 'zweite.html': text(second) });
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Prüfergebnisse' })).toContainText('Ziel fehlt oder ist gesperrt: falsch.html');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill(start);
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Prüfergebnisse' })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
    await context.close();
    context = await playwright.chromium.launchPersistentContext(profile, { headless: true, serviceWorkers: 'block' });
    page = context.pages()[0]; observe(page); await unterdrueckeOnboardingPopups(page);
    await page.goto('http://127.0.0.1:3001/frontendkurs');
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue(start);
    await expect(page.getByRole('group', { name: 'Dateibaum' }).getByRole('button', { name: 'zweite.html', exact: true })).toBeVisible();
    const download = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Sicherung exportieren (JSON)' }).click();
    const saved = JSON.parse(fs.readFileSync(await (await download).path(), 'utf8'));
    expect(saved.files['index.html'].content).toBe(start); expect(saved.files['zweite.html'].content).toBe(second);
    expect(modelRequests).toBe(0);
  } finally { await context.close(); }
});
