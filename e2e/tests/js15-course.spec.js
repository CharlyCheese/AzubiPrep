import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JS15_LESSONS, js15CourseFiles } from '../../frontend/src/pilot/js15-course.js';
import { jsCourseFiles, JS_LESSONS } from '../../frontend/src/pilot/js-course.js';
import { VALIDATOR_VERSION } from '../../frontend/src/pilot/course.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openWorkshopTools(page);
  page.on('dialog', dialog => dialog.accept());
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
}
async function select(page, id) { await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption(id); }
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
for (const lesson of JS15_LESSONS) test(`${lesson.id}: Starter offen, Lösung und gleichwertige Alternative`, async ({ page }, info) => {
  await open(page); await select(page, lesson.id); await grade(page, false);
  await load(page, js15CourseFiles(lesson)); await grade(page, true);
  const alternative = js15CourseFiles(lesson);
  alternative['js/uebung.js'].content = `/* Eigene Formatierung */\n${lesson.solution.replaceAll('"', "'")}`;
  if (lesson.id === 'js15-vorlagen') alternative['js/uebung.js'].content = 'const gesamtMinuten = tage * minutenProTag; const planText = "Lernzeit: " + gesamtMinuten + " Minuten in " + tage + " Tagen."; console.log(planText);';
  if (lesson.id === 'js15-tarifstufen') alternative['js/uebung.js'].content = 'let preis; if (alter >= 18) { preis=10; } else if (alter >= 12) { preis=6; } else { preis=4; } console.log(preis);';
  if (lesson.id === 'js15-tarifprojekt') alternative['js/uebung.js'].content = alternative['js/uebung.js'].content.replace('if (alter < 12)', 'if (alter <= 11)').replace('else if (alter < 18)', 'else if (alter <= 17)').replace('preisProTicket * anzahl', 'anzahl * preisProTicket');
  await load(page, alternative); await grade(page, true);
  if (lesson.id === 'js15-tarifprojekt') {
    await page.getByRole('button', { name: 'Lernen', exact: true }).click();
    await page.getByRole('region', { name: 'Lektionstext', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('kapitel15-tarif.png') });
  }
});

test('Typische Fehler bei Texten, Gleichheit, Altersgrenzen, Logik und Umwandlung bleiben offen', async ({ page }) => {
  await open(page);
  const mutations = [
    ['js15-texte', source => source.replace('"Hallo "', '"Hallo"')],
    ['js15-vergleiche', source => source.replace('alter === textAlter', 'alter == textAlter')],
    ['js15-entscheidung', source => source.replace('alter >= 18', 'alter > 18')],
    ['js15-tarifstufen', source => source.replace('else if (alter < 18)', 'else if (alter <= 18)')],
    ['js15-logik', source => source.replace('&& !gesperrt', '|| !gesperrt')],
    ['js15-umwandeln', source => source.replace('Boolean(flagText)', 'flagText === "true"')],
    ['js15-eingaben', source => source.replace('eingabe !== "" && ', '')],
    ['js15-eingaben', source => source.replace('Number(eingabe)', 'parseInt(eingabe)')],
    ['js15-tarifprojekt', source => source.replace('preisProTicket = 6;', 'preisProTicket = azubi ? 4 : 6;')],
    ['js15-tarifprojekt', source => source.replace('anzahl <= 10', 'anzahl <= 11')],
    ['js15-tarifprojekt', source => source.replace('alter >= 0 && ', '')],
    ['js15-tarifprojekt', source => source.replace('alterEingabe !== "" && ', '')],
  ];
  for (const [id, mutate] of mutations) {
    const lesson = JS15_LESSONS.find(item => item.id === id);
    await select(page, id); await load(page, js15CourseFiles(lesson));
    await code(page, mutate(lesson.solution)); await grade(page, false);
  }
});

test('Lernbegleitung erhält auch späte Fehler ohne Codefreigabe und verwirft veraltete Prüfstände', async () => {
  // Execute only the repository's trusted pure context builder, never learner code.
  const moduleText = await readFile(new URL('../../frontend/src/api/ai.js', import.meta.url), 'utf8');
  const contextCode = moduleText.slice(moduleText.indexOf('export function courseContext(')).replace('export ', '');
  const makeContext = new Function('VALIDATOR_VERSION', `${contextCode}\nreturn courseContext;`)(VALIDATOR_VERSION);
  const lesson = JS15_LESSONS.at(-1);
  const results = Array.from({ length: 30 }, (_, index) => ({ passed: true, file: 'js/uebung.js', message: `Test ${index + 1} bestanden` }));
  results.push({ passed: false, file: 'js/uebung.js', message: 'Test 16: Negatives Alter muss ungültig sein.' });
  const project = { files: js15CourseFiles(lesson), stand: 'synthetic-current', checks: [{ stand: 'synthetic-current', lessonVersion: lesson.version, validatorVersion: VALIDATOR_VERSION, results }] };
  const context = makeContext(lesson, project, 'js/uebung.js', false);
  expect(context.files).toEqual([]); expect(context.checks).toHaveLength(8);
  expect(context.checks[0].passed).toBe(false); expect(context.checks[0].message).toContain('Test 16');
  expect(project.checks[0].results[0].passed).toBe(true);
  project.stand = 'synthetic-new';
  expect(makeContext(lesson, project, 'js/uebung.js', false).checks).toEqual([]);
});

test('Text- und Boolean-Testdaten sind echte Literale; normale Konsole und optionale Vorschau', async ({ page }) => {
  await open(page); await select(page, 'js15-texte'); await load(page, js15CourseFiles(JS15_LESSONS[0]));
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await expect(page.getByLabel('Kurs-Testdaten')).toContainText('const vorname = "Mira";');
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Hallo Mira!\n4');
  await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
  await expect(page.frameLocator('iframe[title="Dein Projekt"]').locator('[data-azubi-course-output] pre')).toHaveText('Hallo Mira!\n4');
  await select(page, 'js15-logik'); await load(page, js15CourseFiles(JS15_LESSONS[6]));
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await expect(page.getByLabel('Kurs-Testdaten')).toContainText('const ticketVorhanden = true;');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('true\ntrue');
  await code(page, 'console.log(typeof document);console.log(typeof fetch);console.log(typeof azubiDesktop);');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('undefined\nundefined\nundefined');
});

test('Alle Projekte, ältere JS-Prüfung, Sicherung und Projekt-Reload bleiben erhalten', async ({ page }) => {
  await open(page); await select(page, 'js-budgetprojekt'); await load(page, jsCourseFiles(JS_LESSONS[7])); await grade(page, true);
  await select(page, 'js15-tarifprojekt'); const files = js15CourseFiles(JS15_LESSONS[9]); await load(page, files); await grade(page, true);
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sicherung exportieren (JSON)', exact: true }).click();
  const snapshot = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  expect(snapshot.files).toEqual(files);
  await page.reload(); await openWorkshopTools(page); await select(page, 'js15-tarifprojekt');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await select(page, 'js-budgetprojekt'); await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(82);
});

test('Electron: Tarifprojekt mit Textdaten ausführen, prüfen, nach Neustart fortsetzen', async ({}, info) => {
  test.setTimeout(90000);
  const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../desktop');
  const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args: [desktop, `--user-data-dir=${info.outputPath('profile')}`], env };
  let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await select(page, 'js15-tarifprojekt');
    await load(page, js15CourseFiles(JS15_LESSONS[9])); await grade(page, true);
    await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
    await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Gesamt: 24 Euro');
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
    await app.close(); app = null; app = await _electron.launch(options);
    page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await select(page, 'js15-tarifprojekt');
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  } finally { if (app) await app.close(); }
});
