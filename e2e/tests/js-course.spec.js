import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { JS_LESSONS, jsCourseFiles } from '../../frontend/src/pilot/js-course.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url); await openWorkshopTools(page);
  page.on('dialog', dialog => dialog.accept());
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
}
async function select(page, id) { await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption(id); }
async function load(page, files, entry = 'index.html') {
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'kurs.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, entry, files })) });
  await expect(page.getByRole('alert')).toContainText('eingelesen');
}
async function grade(page, passed) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText(passed ? 'Dieser eingereichte Stand hat die Pflichtprüfung bestanden' : 'Noch offene Pflichtkriterien:');
}
async function code(page, value) {
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'js/uebung.js', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code js/uebung.js', exact: true }).fill(value);
}
for (const lesson of JS_LESSONS) test(`${lesson.id}: offener Starter, Lösung und gültige Alternative`, async ({ page }, info) => {
  await open(page); await select(page, lesson.id);
  if (lesson.id === 'js-budgetprojekt') {
    await page.getByRole('region', { name: 'Lektionstext', exact: true }).scrollIntoViewIfNeeded();
    await page.screenshot({ path: info.outputPath('kapitel14-budget.png') });
  }
  await grade(page, false);
  const files = jsCourseFiles(lesson);
  await load(page, files); await grade(page, true);
  const alternative = structuredClone(files);
  alternative['js/uebung.js'].content = `// Eigene Formatierung und Anführungszeichen\n${alternative['js/uebung.js'].content.replaceAll('"', "'")}`;
  if (lesson.id === 'js-klammern') alternative['js/uebung.js'].content = 'const gesamt = anzahl * basisPreis + anzahl * zuschlag; console.log(gesamt);';
  if (lesson.id === 'js-budgetprojekt') alternative['js/uebung.js'].content = 'const materialKosten = paketPreis * personen; const gesamtKosten = versand + materialKosten; const restBudget = budget - versand - materialKosten; console.log(materialKosten); console.log(gesamtKosten); console.log(restBudget);';
  await load(page, alternative); await grade(page, true);
});

test('Feste Prüfung erkennt falsche Typen, Bindungen, Pfade, Rechnung und hartcodierte Projektwerte', async ({ page }) => {
  await open(page); await select(page, 'js-werte');
  await load(page, jsCourseFiles(JS_LESSONS[1]));
  await code(page, 'console.log("42"); console.log("42"); console.log("true");'); await grade(page, false);
  await select(page, 'js-konstanten'); await load(page, jsCourseFiles(JS_LESSONS[2]));
  await code(page, 'let kursName="JavaScript"; const startJahr=2026; console.log(kursName); console.log(startJahr);'); await grade(page, false);
  await select(page, 'js-datei'); const broken = jsCourseFiles(JS_LESSONS[0]);
  broken['index.html'].content = broken['index.html'].content.replace('js/uebung.js', 'https://example.invalid/evil.js');
  await load(page, broken); await grade(page, false);
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('relative');
  await select(page, 'js-klammern'); await load(page, jsCourseFiles(JS_LESSONS[6]));
  await code(page, 'const gesamt = basisPreis + zuschlag * anzahl; console.log(gesamt);'); await grade(page, false);
  await select(page, 'js-budgetprojekt'); await load(page, jsCourseFiles(JS_LESSONS[7]));
  await code(page, 'const materialKosten=24; const gesamtKosten=27; const restBudget=13; console.log(materialKosten); console.log(gesamtKosten); console.log(restBudget);'); await grade(page, false);
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Test 2');
});

test('Kurskonsole startet bewusst, Fehler korrigieren und Stop/Wechsel; keine Browserrechte', async ({ page }) => {
  await open(page); await select(page, 'js-datei');
  const files = jsCourseFiles(JS_LESSONS[0]);
  files['js/uebung.js'].content = 'console.log(typeof document, typeof fetch, typeof azubiDesktop);';
  await load(page, files);
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.locator('.js-course-status')).toHaveText('Kursprogramm beendet.');
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('undefined undefined undefined');
  await code(page, 'console.log("kaputt);');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Fehlerdetails')).toContainText('uebung.js');
  await code(page, 'console.log("korrigiert");'); await grade(page, true);
  await code(page, 'while(true){}');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm stoppen', exact: true }).click();
  await expect(page.locator('.js-course-status')).toHaveText('Kursprogramm gestoppt.');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await select(page, 'js-werte'); await select(page, 'js-datei');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await page.getByRole('button', { name: 'Prüfung abbrechen', exact: true }).click();
  await select(page, 'js-werte'); await grade(page, false);
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).not.toContainText('Zeitgrenze');
});

test('Worker nimmt ausschließlich verpackte Aufgaben und gültige Fallnummern an', async ({ page }) => {
  await open(page); await select(page, 'js-werte');
  await load(page, jsCourseFiles(JS_LESSONS[1]));
  let workerUrl;
  page.on('worker', worker => { workerUrl = worker.url(); });
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.locator('.js-course-status')).toHaveText('Kursprogramm beendet.');
  const results = await page.evaluate(async url => {
    const send = exercise => new Promise((resolve, reject) => {
      const worker = new Worker(url, { type: 'module' });
      const timer = setTimeout(() => { worker.terminate(); reject(new Error('timeout')); }, 10000);
      worker.onmessage = ({ data }) => { if (data.type === 'done') { clearTimeout(timer); worker.terminate(); resolve(data); } };
      worker.onerror = () => { clearTimeout(timer); worker.terminate(); reject(new Error('worker')); };
      worker.postMessage({ schema: 1, name: 'probe.js', source: 'console.log(42);console.log("42");console.log(true);', exercise });
    });
    return [await send({ id: '__proto__', caseIndex: 0, check: true }), await send({ id: 'js-werte', caseIndex: 999, check: true }), await send({ id: 'js-werte', caseIndex: 0, check: true, probe: 'while(true){}', inputs: { fetch: 'host' } })];
  }, workerUrl);
  expect(results[0].reason).toBe('engine'); expect(results[1].reason).toBe('engine');
  expect(results[2].reason).toBe('success'); expect(results[2].checked).toBe(true);
});

test('Konsolenausgabe lässt sich ausdrücklich als Lernhilfe in der HTML-Vorschau spiegeln', async ({ page }, info) => {
  await open(page); await select(page, 'js-werte');
  await load(page, jsCourseFiles(JS_LESSONS[1]));
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  const toggle = page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' });
  await expect(toggle).not.toBeChecked();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('42\n42\ntrue');
  await expect(frame.locator('[data-azubi-course-output]')).toHaveCount(0);
  await toggle.check();
  await expect(frame.locator('[data-azubi-course-output] pre')).toHaveText('42\n42\ntrue');
  await expect(frame.locator('[data-azubi-course-output]')).toContainText('console.log verändert selbst kein HTML');
  await expect(page.locator('iframe[title="Dein Projekt"]')).toHaveAttribute('sandbox', 'allow-same-origin');
  await page.locator('iframe[title="Dein Projekt"]').screenshot({ path: info.outputPath('kursausgabe-vorschau.png') });
  await toggle.uncheck(); await expect(frame.locator('[data-azubi-course-output]')).toHaveCount(0);
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('42\n42\ntrue');
  await code(page, 'console.log(""); console.log("\\nHallo\\rWelt");');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect.poll(() => frame.locator('[data-azubi-course-output] pre').textContent()).toBe('\n\nHallo\rWelt');
  expect(await page.getByLabel('Kurs-Konsolenausgabe').textContent()).toBe('\n\nHallo\rWelt');
});

test('Vorschau spiegelt nur Text, hält Ausgaben aus Exporten und verwirft alte Läufe', async ({ page }) => {
  await open(page); await select(page, 'js-datei');
  const files = jsCourseFiles(JS_LESSONS[0]);
  const text = '</pre><img src="https://example.invalid/pixel" onerror="parent.localStorage.setItem(\'mirror-escape\',\'yes\')"><script>alert(1)</script>';
  files['js/uebung.js'].content = `console.log(${JSON.stringify(text)});`;
  const requests = []; page.on('request', request => { if (request.url().includes('example.invalid')) requests.push(request.url()); });
  await load(page, files); await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  const frame = page.frameLocator('iframe[title="Dein Projekt"]');
  await expect(frame.locator('[data-azubi-course-output] pre')).toHaveText(text);
  await expect(frame.locator('script, img')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('mirror-escape'))).toBe(null); expect(requests).toEqual([]);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sicherung exportieren (JSON)', exact: true }).click();
  const snapshot = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  expect(snapshot.files).toEqual(files); expect(JSON.stringify(snapshot)).not.toContain('data-azubi-course-output');
  await code(page, 'console.log("Neu");');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
  await expect(frame.locator('[data-azubi-course-output] pre')).toContainText('Noch keine Ausgabe');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(frame.locator('[data-azubi-course-output] pre')).toHaveText('Neu');
  await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
  await expect(frame.locator('[data-azubi-course-output] pre')).toHaveText('Neu');
  await select(page, 'js-werte'); await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
  await expect(frame.locator('[data-azubi-course-output] pre')).toContainText('Noch keine Ausgabe');
});

test('Codeänderung und direkter Lektionswechsel beenden laufende Prüfworker automatisch', async ({ page }) => {
  await open(page); await select(page, 'js-werte');
  const files = jsCourseFiles(JS_LESSONS[1]); files['js/uebung.js'].content = 'while(true){}';
  await load(page, files);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('button', { name: 'js/uebung.js', exact: true }).click();
  let created = page.waitForEvent('worker');
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  let worker = await created; let closed = worker.waitForEvent('close');
  await page.getByRole('textbox', { name: 'Code js/uebung.js', exact: true }).fill('console.log(42);console.log("42");console.log(true);');
  await closed;
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Noch keine Prüfung für diese Aufgabe.');
  await code(page, 'while(true){}');
  created = page.waitForEvent('worker');
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  worker = await created; closed = worker.waitForEvent('close');
  await select(page, 'js-datei'); await closed;
  await select(page, 'js-werte');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Noch keine Prüfung für diese Aufgabe.');
});

test('Verschachtelte externe Dateien bleiben in JSON/ZIP und nach Neustart erhalten', async ({ page }) => {
  await open(page); await select(page, 'js-budgetprojekt');
  const solved = jsCourseFiles(JS_LESSONS[7]);
  const files = { 'seiten/start.html': { kind: 'text', content: solved['index.html'].content.replace('js/uebung.js', '../code/budget.js') }, 'code/budget.js': solved['js/uebung.js'] };
  await load(page, files, 'seiten/start.html'); await grade(page, true);
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Sicherung exportieren (JSON)', exact: true }).click();
  const snapshot = JSON.parse(await readFile(await (await download).path(), 'utf8'));
  expect(snapshot.files).toEqual(files); expect(snapshot.entry).toBe('seiten/start.html');
  const zipDownload = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Dateien für eigenen Editor (ZIP)', exact: true }).click();
  const archive = await readFile(await (await zipDownload).path()); expect(archive.includes(Buffer.from('code/budget.js'))).toBe(true);
  await page.reload(); await openWorkshopTools(page); await select(page, 'js-budgetprojekt');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
  await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('Noch keine Ausgabe.');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(82);
});

test('Einzeldateien ergänzen JS lokal und private Verzeichnisse bleiben ausgeschlossen', async ({ page }) => {
  await open(page); await select(page, 'js-datei');
  await page.getByLabel('Dateien auswählen', { exact: true }).setInputFiles({ name: 'eigen.js', mimeType: 'text/javascript', buffer: Buffer.from('console.log("Lokal");') });
  await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(page.getByRole('button', { name: 'eigen.js', exact: true })).toBeVisible();
  const files = jsCourseFiles(JS_LESSONS[0]); files['local-ai/auth.js'] = { kind: 'text', content: 'SYNTHETISCH' };
  await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'privat.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
  await expect(page.getByRole('alert')).toContainText('Private Datei');
  await expect(page.getByRole('button', { name: 'eigen.js', exact: true })).toBeVisible();
});

test('Electron: Kapitel 14 ausführen, prüfen und nach vollständigem Neustart fortsetzen', async ({}, info) => {
  test.setTimeout(90000);
  const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../desktop');
  const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
  const options = { executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args: [desktop, `--user-data-dir=${info.outputPath('profile')}`], env };
  let app;
  try {
    app = await _electron.launch(options); let page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await select(page, 'js-budgetprojekt');
    await load(page, jsCourseFiles(JS_LESSONS[7])); await grade(page, true);
    await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
    await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('24\n27\n13');
    await page.getByRole('checkbox', { name: 'Konsolenausgabe als Lernhilfe in der Vorschau anzeigen' }).check();
    await expect(page.frameLocator('iframe[title="Dein Projekt"]').locator('[data-azubi-course-output] pre')).toHaveText('24\n27\n13');
    const folder = info.outputPath('external'); await mkdir(folder, { recursive: true });
    const nativeFile = path.join(folder, 'extra.js'); await writeFile(nativeFile, 'console.log("Nur importiert");');
    await app.evaluate(({ dialog }, filename) => { dialog.showOpenDialog = async (_window, options) => { globalThis.jsDialogOptions = options; return { canceled: false, filePaths: [filename] }; }; }, nativeFile);
    await page.getByRole('button', { name: '＋ Dateien auswählen', exact: true }).click();
    expect(await app.evaluate(() => globalThis.jsDialogOptions.filters[0].extensions)).toContain('js');
    await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await expect(page.getByRole('button', { name: 'extra.js', exact: true })).toBeVisible();
    await grade(page, true);
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
    await app.close(); app = null; app = await _electron.launch(options);
    page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`); await select(page, 'js-budgetprojekt');
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
  } finally { if (app) await app.close(); }
});
