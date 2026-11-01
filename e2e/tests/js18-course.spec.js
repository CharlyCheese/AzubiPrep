import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JS18_LESSONS, js18CourseFiles } from '../../frontend/src/pilot/js18-course.js';
import { JS17_LESSONS, js17CourseFiles } from '../../frontend/src/pilot/js17-course.js';
import { guidedSumTrace } from '../../frontend/src/pilot/js18-trace.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openWorkshopTools(page);
  page.on('dialog', dialog => dialog.accept());
  await expect(page.getByLabel('Lektion', { exact: true })).toBeVisible();
}
const select = (page, id) => page.getByLabel('Lektion', { exact: true }).selectOption(id);
async function load(page, files) {
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'projekt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, entry: 'index.html', files })) });
  await expect(page.getByRole('alert')).toContainText('eingelesen');
}
async function grade(page, passed) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText(passed ? 'Dieser eingereichte Stand hat die Pflichtprüfung bestanden' : 'Noch offene Pflichtkriterien:');
}
async function code(page, source) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'js/uebung.js', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code js/uebung.js', exact: true }).fill(source);
}
for (const lesson of JS18_LESSONS) test(`${lesson.id}: Starter offen, Lösung und gleichwertige Alternative`, async ({ page }) => {
  await open(page); await select(page, lesson.id); await grade(page, false);
  await load(page, js18CourseFiles(lesson)); await grade(page, true);
  const files = js18CourseFiles(lesson);
  files['js/uebung.js'].content = '/* Eigene Formatierung */\n' + lesson.solution.replaceAll('"', "'");
  if (lesson.id === 'js18-filter') files['js/uebung.js'].content = lesson.solution.replace('return !task.done;', 'return task.done === false;');
  if (lesson.id === 'js18-pfeile') files['js/uebung.js'].content = lesson.solution.replace('n => n > 0', '(n) => { return n > 0; }').replace('n => n * n', '(n) => { return n * n; }');
  if (lesson.id === 'js18-reduce-sort') files['js/uebung.js'].content = lesson.solution.replace('a.minutes - b.minutes', '-(b.minutes - a.minutes)');
  if (lesson.id === 'js18-debugspur') files['js/uebung.js'].content = 'function summe(liste) { let total=0; for(const n of liste) total+=n; return total; } console.log(summe(zahlen));';
  await load(page, files); await grade(page, true);
});

test('Callbacks, Rückgaben, leere Listen, Sortiergrenzen und Fehlerwege erkennen falsche Lösungen', async ({ page }) => {
  test.setTimeout(90000); await open(page);
  for (const [id, mutate] of [
    ['js18-callback', source => source.replace('return rechner(wert);', 'return wert + 3;')],
    ['js18-filter', source => source.replace('return !task.done;', '!task.done;')],
    ['js18-map', source => source.replace('return task.title;', 'return task.done;')],
    ['js18-pfeile', source => source.replace('n > 0', 'n >= 0')],
    ['js18-suchen', source => source.replace('liste.length > 0 && ', '')],
    ['js18-reduce-sort', source => source.replace('a.minutes - b.minutes', 'String(a.minutes).localeCompare(String(b.minutes))')],
    ['js18-reduce-sort', source => source.replace(', 0)', ')')],
    ['js18-fehler', source => source.replace('throw new Error("Ungültige Dauer")', 'return null')],
    ['js18-fehler', source => source.replace('!Number.isInteger(wert)', 'false')],
    ['js18-debugspur', source => source.replace('i < liste.length', 'i <= liste.length')],
  ]) {
    const lesson = JS18_LESSONS.find(item => item.id === id);
    await select(page, id); await load(page, js18CourseFiles(lesson)); await code(page, mutate(lesson.solution)); await grade(page, false);
  }
});

test('Arraymethoden dürfen Eingabe und Erwartungen nicht gemeinsam verändern', async ({ page }) => {
  test.setTimeout(60000); await open(page);
  for (const [id, mutate] of [
    ['js18-filter', source => source.replace('return liste.filter', 'liste[0] && (liste[0].done = false); return liste.filter')],
    ['js18-reduce-sort', source => source.replace('[...liste].sort', 'liste.sort')],
    ['js18-map', source => source.replace('return task.title;', 'const title = task.title; task.title = "VERAENDERT"; return title;')],
  ]) {
    const lesson = JS18_LESSONS.find(item => item.id === id);
    await select(page, id); await load(page, js18CourseFiles(lesson)); await code(page, mutate(lesson.solution)); await grade(page, false);
  }
});

test('Fehlerarten und feindliche Fehler-/Callbackobjekte bleiben in der begrenzten VM', async ({ page }) => {
  test.setTimeout(60000); await open(page); await select(page, 'js18-fehler');
  for (const [source, name] of [['const = ;', 'SyntaxError'], ['unbekannterName();', 'ReferenceError'], ['null.methode();', 'TypeError']]) {
    await code(page, source); await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
    await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
    await expect(page.getByLabel('Kurs-Fehlerdetails')).toContainText(name);
    await expect(page.getByLabel('Kurs-Fehlerdetails')).toContainText('uebung.js');
  }
  await code(page, 'throw {message:"Sicherer Text", get name(){console.log("GETTER"); throw 1;}};');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click(); await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Fehlerdetails')).toContainText('Sicherer Text');
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).not.toContainText('GETTER');
  await code(page, 'throw new Proxy({}, {getPrototypeOf(){while(true){}}});');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click(); await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.locator('.js-course-status')).toContainText('Zeitgrenze');
  await select(page, 'js18-callback'); await load(page, js18CourseFiles(JS18_LESSONS[0])); await grade(page, true);
  expect(await page.evaluate(() => window.azubiDesktop?.jsPilot === undefined)).toBe(true);
});

test('Geführte Spur hält vor der Addition, zeigt Scope und unterscheidet leere Listen', () => {
  const bad = guidedSumTrace(false, 'two');
  const additions = bad.frames.filter(frame => frame.line === 4);
  expect(additions.map(frame => frame.variables.find(variable => variable.name === 'i').value)).toEqual(['0','1','2']);
  expect(additions.map(frame => frame.variables.find(variable => variable.name === 'total').value)).toEqual(['0','2','5']);
  expect(additions.at(-1).variables.find(variable => variable.name === 'liste[i]').type).toBe('undefined');
  expect(bad.frames.at(-1).output).toBe('NaN');
  expect(guidedSumTrace(true, 'two').frames.at(-1).output).toBe('5');
  expect(guidedSumTrace(false, 'empty').frames.at(-1).output).toBe('NaN');
  expect(guidedSumTrace(true, 'empty').frames.at(-1).output).toBe('0');
  expect(guidedSumTrace(true, 'zero').frames.at(-1).output).toBe('0');
  expect(bad.frames.find(frame => frame.line === 6).variables.some(variable => variable.name === 'i')).toBe(false);
  expect(() => guidedSumTrace(false, 'fremd')).toThrow();
});

test('Haltepunkt per Tastatur, Einzelschritte, Reset und bewusstes Ansehen der Korrektur', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page); await select(page, 'js18-debugspur');
  const trace = page.getByRole('region', { name: 'Geführte Debugger-Spur', exact: true });
  await expect(trace).toContainText('führt deinen Editorcode nicht aus');
  const cell = name => trace.getByRole('rowheader', { name, exact: true }).locator('..').getByRole('cell').first();
  await trace.getByRole('button', { name: 'Bis zum Haltepunkt', exact: true }).click();
  await expect(cell('i')).toHaveText('0'); await expect(cell('total')).toHaveText('0');
  await trace.getByRole('button', { name: 'Bis zum Haltepunkt', exact: true }).click(); await expect(cell('i')).toHaveText('1');
  await trace.getByRole('button', { name: 'Bis zum Haltepunkt', exact: true }).click(); await expect(cell('i')).toHaveText('2'); await expect(cell('liste[i]')).toHaveText('undefined');
  await trace.getByRole('button', { name: 'Einzelner Schritt', exact: true }).click(); await expect(cell('total')).toHaveText('NaN');
  await trace.getByRole('button', { name: 'Bis zum Haltepunkt', exact: true }).click(); await expect(trace.getByLabel('Spur-Konsolenausgabe')).toHaveText('NaN');
  await trace.getByRole('button', { name: 'Spur zurücksetzen', exact: true }).click();
  const breakpoint = trace.getByRole('button', { name: 'Haltepunkt Zeile 4', exact: true });
  await breakpoint.focus(); await page.keyboard.press('Enter'); await expect(breakpoint).toHaveAttribute('aria-pressed', 'false');
  await trace.getByLabel('Programmvariante').selectOption('fixed'); await trace.getByLabel('Beispieldaten').selectOption('empty');
  await trace.getByRole('button', { name: 'Bis zum Haltepunkt', exact: true }).click(); await expect(trace.getByLabel('Spur-Konsolenausgabe')).toHaveText('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await trace.scrollIntoViewIfNeeded(); await page.screenshot({ path: info.outputPath('kapitel18-spur-mobil.png') });
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click(); await expect(page.getByRole('region', { name: 'Prüfergebnisse' })).toContainText('Musterlösung angesehen');
});

test('Neue Programme laufen nie automatisch und besitzen auch mit Callbacks keine Hostbrücken', async ({ page }) => {
  await page.addInitScript(() => { const Original = window.Worker; window.workerStarts = 0; window.Worker = class extends Original { constructor(...args) { super(...args); window.workerStarts++; } }; });
  await open(page); await select(page, 'js18-callback'); await code(page, 'console.log(typeof window, typeof document, typeof fetch, typeof require, typeof __emit);');
  expect(await page.evaluate(() => window.workerStarts)).toBe(0);
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('undefined undefined undefined undefined undefined');
});

test('Electron: alten 82er-Kursstand erhalten, Kapitel 18 prüfen und neu starten', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Diese Prüfung benötigt Windows-Electron.'); test.setTimeout(90000);
  const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../desktop');
  const profile = info.outputPath('profile');
  const env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args: [desktop, `--user-data-dir=${profile}`], env };
  let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await select(page, 'js17-aufgabenprojekt'); await load(page, js17CourseFiles(JS17_LESSONS.at(-1))); await grade(page, true);
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
    expect(await page.evaluate(async () => { const state = await window.azubiDesktop.loadCourse(); for (const id of Object.keys(state.projects)) if ((id.startsWith('js18-') || id.startsWith('course-'))) delete state.projects[id]; await window.azubiDesktop.saveCourse(state); return Object.keys(state.projects).length; })).toBe(82);
    await app.close(); app = null;
    app = await _electron.launch(options); page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await expect(page.getByLabel('Lektion', { exact: true }).locator('option')).toHaveCount(167);
    await select(page, 'js17-aufgabenprojekt'); await page.getByRole('button', { name: 'Prüfen', exact: true }).click(); await expect(page.getByRole('region', { name: 'Prüfergebnisse' })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
    await select(page, 'js18-fehler'); await load(page, js18CourseFiles(JS18_LESSONS[6])); await grade(page, true);
    await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click(); await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click(); await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('15\nUngültige Dauer');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  } finally { if (app) await app.close(); }
});
