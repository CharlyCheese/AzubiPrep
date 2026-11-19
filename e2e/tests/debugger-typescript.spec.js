// Prepared for e2e/tests/debugger-typescript.spec.js after FE-064 acceptance.
// Relative imports below intentionally target that final location.
import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initialTypeScriptProject } from '../../frontend/src/pilot/debugger-project.js';
import { folderDebugFiles } from '../../frontend/src/pilot/debugger-project.js';
import { unterdrueckeOnboardingPopups, openDebugger } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const region = page => page.getByRole('region', { name: 'Debugger-Technikpilot', exact: true });
const status = page => region(page).getByLabel('Debugstatus', { exact: true });
const output = page => region(page).getByLabel('Debugkonsole', { exact: true });
const values = page => region(page).getByRole('region', { name: 'Debugvariablen', exact: true });
const failure = page => region(page).getByRole('alert', { name: 'Debugfehler', exact: true });
const editor = page => region(page).getByLabel('Eigener Debugcode', { exact: true });
const button = (page, name) => region(page).getByRole('button', { name, exact: true });
const project = files => ({ schema: 1, mode: 'module', entry: 'main.ts', files });

async function open(page, url = '/frontendkurs/debugger') {
  await unterdrueckeOnboardingPopups(page);
  await page.goto(url);
  await openDebugger(page);
}
async function example(page) {
  const accept = dialog => dialog.accept();
  page.on('dialog', accept);
  try {
    await button(page, 'TypeScript-Beispiel laden').click();
    await expect(region(page).getByLabel('Debugmodus', { exact: true })).toHaveValue('module');
    await expect(region(page).getByLabel('Modulstartdatei', { exact: true })).toHaveValue('main.ts');
  } finally { page.off('dialog', accept); }
}
async function load(page, value) {
  await region(page).getByLabel('Debugmodus', { exact: true }).selectOption('module');
  page.once('dialog', dialog => dialog.accept());
  await region(page).getByLabel('Modulsicherung lesen', { exact: true }).setInputFiles({
    name: 'typescript-probe.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value)),
  });
  await expect(region(page).getByLabel('Modulstartdatei', { exact: true })).toHaveValue(value.entry);
  await region(page).getByLabel('Debugdatei', { exact: true }).selectOption(value.entry);
  await expect(editor(page)).toHaveValue(value.files[value.entry].replace(/\r\n|\r/g, '\n'));
}
async function start(page) {
  await button(page, 'Debuggen starten').click();
  await expect(status(page)).toContainText('Programmstart');
}
async function go(page) { await button(page, 'Weiter / bis zum nächsten Haltepunkt').click(); }
async function savedProject(page) {
  const downloading = page.waitForEvent('download');
  await button(page, 'Modulprojekt exportieren (JSON)').click();
  return JSON.parse(fs.readFileSync(await (await downloading).path(), 'utf8'));
}
function trackRuntimeWorkers(page) {
  const urls = [];
  page.on('worker', worker => { if (/\/debugger\.worker-[^/]+\.js(?:\?|$)/.test(worker.url())) urls.push(worker.url()); });
  return urls;
}
async function prepareInBrowser(page, draft) {
  const asset = fs.readdirSync(path.join(repo, 'frontend/dist/assets')).find(name => /^debugger-compiler\.worker-.*\.js$/.test(name));
  expect(asset).toBeTruthy();
  return page.evaluate(({ asset, draft }) => new Promise(resolve => {
    const worker = new Worker('/assets/' + asset, { type: 'module' });
    const timeout = setTimeout(() => { worker.terminate(); resolve({ type: 'timeout' }); }, 20000);
    worker.onmessage = ({ data }) => { clearTimeout(timeout); worker.terminate(); resolve(data); };
    worker.onerror = event => { clearTimeout(timeout); worker.terminate(); resolve({ type: 'error', text: event.message }); };
    worker.postMessage({ draft, limits: {} });
  }), { asset, draft });
}

test('TypeScript-Beispiel: echter Knopf, geprüfte Parameter und Halt in der Originalquelle', async ({ page }) => {
  await open(page);
  await example(page);
  const sample = initialTypeScriptProject();
  await expect(editor(page)).toHaveValue(sample.files['main.ts']);
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  await start(page);
  await expect(status(page)).toContainText('main.ts:4:');
  await region(page).getByLabel('Debugdatei', { exact: true }).selectOption('preise.ts');
  await expect(editor(page)).toHaveValue(sample.files['preise.ts']);
  await expect(region(page).getByLabel('Debugquelltext')).toContainText('export function bruttopreis(netto: number): number');
  await button(page, 'Debug-Haltepunkt preise.ts Zeile 8 Spalte 3').click();
  await go(page);
  await expect(status(page)).toContainText('Haltepunkt');
  await expect(status(page)).toContainText('preise.ts:8:3');
  await expect(values(page).locator('tbody tr').filter({ hasText: /^nettonumber25$/ })).toHaveCount(1);
  await expect(values(page).locator('tbody tr').filter({ hasText: /^steuernumber4\.75$/ })).toHaveCount(1);
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  await go(page);
  await expect(status(page)).toContainText('Programm ist beendet');
  await expect(output(page)).toHaveText('Tastatur 29.75');
});

test('TypeScript-Typfehler: Originalposition, keine Ausgabe und keine gestartete Laufzeit', async ({ page }) => {
  await open(page);
  const runtimes = trackRuntimeWorkers(page);
  await load(page, project({ 'main.ts': '// 😀 ursprüngliche Zeilen\nconsole.log("NICHT AUSFÜHREN");\nconst preis: number = "falsch";\n' }));
  await button(page, 'Debuggen starten').click();
  await expect(failure(page)).toContainText('TypeScript-Typfehler');
  await expect(failure(page)).toContainText('main.ts:3:7');
  await expect(failure(page)).toContainText('TS2322');
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  await expect(values(page)).toContainText('Noch kein Halt');
  expect(runtimes).toEqual([]);
  await expect.poll(() => page.workers().length).toBe(0);
});

test('Typimporte, Generics und Unicode: Artefaktquellen und Haltespalten bleiben original', async ({ page }) => {
  await open(page);
  const returnLine = '  const zeichen: "😀" = "😀"; return wert + 1;';
  const expectedColumn = returnLine.indexOf('return') + 1;
  const value = project({
    'main.ts': '// 😀 Originalquelle\r\nimport type { Zahl } from "./typen.ts";\r\nimport { plusEins } from "./hilfe.ts";\r\nconst wert: Zahl = 4;\r\nconst ergebnis = plusEins<Zahl>(wert as Zahl);\r\nconsole.log("Grüße 😀", ergebnis);\r\n',
    'typen.ts': 'export type Zahl = number;\r\n',
    'hilfe.ts': 'export function plusEins<T extends number>(wert: T): number {\r\n' + returnLine + '\r\n}\r\n',
  });
  const prepared = await prepareInBrowser(page, value);
  expect(prepared.type, prepared.text).toBe('compiled');
  expect(prepared.artifact.sources).toEqual(value.files);
  expect(prepared.artifact.modules['main.ts']).not.toContain('import type');
  expect(prepared.artifact.points.some(point => point.file === 'hilfe.ts' && point.line === 2 && point.column === expectedColumn && point.kind === 'return')).toBe(true);
  expect(prepared.artifact.points.some(point => point.file === 'typen.ts' && !point.end)).toBe(false);
  await load(page, value);
  await start(page);
  await region(page).getByLabel('Debugdatei', { exact: true }).selectOption('hilfe.ts');
  await expect(region(page).getByLabel('Debugquelltext').locator('li').nth(1).locator('code')).toHaveText(returnLine);
  await button(page, `Debug-Haltepunkt hilfe.ts Zeile 2 Spalte ${expectedColumn}`).click();
  await go(page);
  await expect(status(page)).toContainText(`hilfe.ts:2:${expectedColumn}`);
  await expect(values(page)).toContainText('wert');
  await expect(values(page)).toContainText('4');
  await go(page);
  await expect(output(page)).toHaveText('Grüße 😀 5');
});

test('TypeScript-Grenzen: Laufzeittransformationen und unsichere mehrzeilige Erasure werden abgewiesen', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  const runtimes = trackRuntimeWorkers(page);
  const cases = [
    ['console.log("NICHT");\nenum Status { Bereit }\n', /Enums/],
    ['console.log("NICHT");\nclass Artikel {}\n', /Klassen/],
    ['console.log("NICHT");\nconst f = (): \nnumber => 1;\n', /JavaScript-Syntax/],
  ];
  for (const [source, message] of cases) {
    await load(page, project({ 'main.ts': source }));
    await button(page, 'Debuggen starten').click();
    await expect(failure(page)).toContainText(message);
    await expect(failure(page)).toContainText('main.ts:');
    await expect(output(page)).toHaveText('Noch keine Ausgabe.');
    await expect(values(page)).toContainText('Noch kein Halt');
  }
  expect(runtimes).toEqual([]);
});

test('TypeScript-Ordner: vollständige Metadatenprüfung vor Lesen, private Dateien bleiben ungelesen', async ({ page }) => {
  await open(page);
  await example(page);
  const metadata = folderDebugFiles([
    { name: 'main.ts', webkitRelativePath: 'Projekt/main.ts', size: 20 },
    { name: 'privat.ts', webkitRelativePath: 'Projekt/.git/privat.ts', size: 9999999 },
    { name: 'vendor.ts', webkitRelativePath: 'Projekt/node_modules/vendor.ts', size: 9999999 },
  ]);
  expect(metadata.entries.map(entry => entry.name)).toEqual(['main.ts']);
  expect(metadata.skipped).toBe(2);
  const input = region(page).getByLabel('Modulordner einlesen', { exact: true });
  const inject = records => input.evaluate((element, records) => {
    window.__tsFolderReads = [];
    const transfer = new DataTransfer();
    for (const record of records) {
      const file = new File([record.source || 'NICHT LESEN'], record.name, { type: 'text/plain' });
      Object.defineProperty(file, 'webkitRelativePath', { value: record.relative });
      if (record.size !== undefined) Object.defineProperty(file, 'size', { value: record.size });
      file.text = async () => { window.__tsFolderReads.push(record.relative); return record.source || 'NICHT LESEN'; };
      transfer.items.add(file);
    }
    Object.defineProperty(element, 'files', { value: transfer.files, configurable: true });
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, records);
  await inject([
    { name: 'main.ts', relative: 'Projekt/main.ts', source: 'const n: number = 7;' },
    { name: 'bad.ts', relative: 'Projekt/../bad.ts' },
  ]);
  await expect(region(page).getByRole('alert')).toContainText(/Pfad|pfad/);
  expect(await page.evaluate(() => window.__tsFolderReads)).toEqual([]);
  await expect(editor(page)).toHaveValue(initialTypeScriptProject().files['main.ts']);
  page.once('dialog', dialog => dialog.accept());
  await inject([
    { name: 'main.ts', relative: 'Projekt/main.ts', source: 'const n: number = 7;\nconsole.log(n);\n' },
    { name: 'privat.ts', relative: 'Projekt/.git/privat.ts', size: 9999999 },
    { name: 'vendor.ts', relative: 'Projekt/node_modules/vendor.ts', size: 9999999 },
  ]);
  await expect(region(page).getByLabel('Modulimportstatus')).toContainText('2 ungeeignete oder private Dateien ohne Lesen übersprungen');
  expect(await page.evaluate(() => window.__tsFolderReads)).toEqual(['Projekt/main.ts']);
  await input.evaluate(element => { delete element.files; });
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  await start(page);
  await go(page);
  await expect(output(page)).toHaveText('7');
});

test('TypeScript speichern: Export und Neuladen erhalten Quellen samt CRLF und Unicode unverändert', async ({ page }) => {
  await open(page);
  const value = initialTypeScriptProject();
  for (const name of Object.keys(value.files)) value.files[name] = ('// 😀 gespeicherte Typquelle\n' + value.files[name]).replaceAll('\n', '\r\n');
  await load(page, value);
  expect(await savedProject(page)).toEqual(value);
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  await page.reload();
  await openDebugger(page);
  await expect(region(page).getByLabel('Debugmodus', { exact: true })).toHaveValue('module');
  await expect(region(page).getByLabel('Modulstartdatei', { exact: true })).toHaveValue('main.ts');
  expect(await savedProject(page)).toEqual(value);
  await expect(values(page)).toContainText('Noch kein Halt');
  await start(page);
  await go(page);
  await expect(output(page)).toHaveText('Tastatur 29.75');
});

test('Einzelne .ts-Dateien ergänzen das Modulprojekt ohne automatische Ausführung', async ({ page }) => {
  await open(page);
  await example(page);
  const runtimes = trackRuntimeWorkers(page);
  const source = 'export const hinweis: string = "Grüße 😀";\n';
  await region(page).getByLabel('Moduldateien einlesen', { exact: true }).setInputFiles({ name: 'hinweis.ts', mimeType: 'text/plain', buffer: Buffer.from(source) });
  await expect(region(page).getByLabel('Debugdatei', { exact: true }).locator('option')).toHaveCount(3);
  await region(page).getByLabel('Debugdatei', { exact: true }).selectOption('hinweis.ts');
  await expect(editor(page)).toHaveValue(source);
  expect(runtimes).toEqual([]);
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  const saved = await savedProject(page);
  expect(saved.files['hinweis.ts']).toBe(source);
  await start(page);
  await go(page);
  await expect(output(page)).toHaveText('Tastatur 29.75');
});

test('Electron: TypeScript-Beispiel hält in Typquelle und läuft nach Neustart erneut @desktop', async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Windows-Electron');
  test.setTimeout(90000);
  const env = { ...process.env, DATABASE_URL: '', AZUBIPREP_KI_ENABLED: 'false', AZUBIPREP_CHATGPT_ENABLED: 'false' };
  delete env.ELECTRON_RUN_AS_NODE;
  const launch = () => _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), '--user-data-dir=' + info.outputPath('profil')], env });
  let app;
  try {
    for (let run = 0; run < 2; run++) {
      app = await launch();
      const page = await app.firstWindow();
      await page.waitForURL(/^http:/);
      await open(page, new URL(page.url()).origin + '/frontendkurs/debugger');
      if (!run) await example(page);
      await expect(region(page).getByLabel('Debugmodus', { exact: true })).toHaveValue('module');
      await expect(region(page).getByLabel('Modulstartdatei', { exact: true })).toHaveValue('main.ts');
      await expect(values(page)).toContainText('Noch kein Halt');
      await region(page).getByLabel('Debugdatei', { exact: true }).selectOption('preise.ts');
      await expect(editor(page)).toHaveValue(initialTypeScriptProject().files['preise.ts']);
      await start(page);
      await region(page).getByLabel('Debugdatei', { exact: true }).selectOption('preise.ts');
      await button(page, 'Debug-Haltepunkt preise.ts Zeile 8 Spalte 3').click();
      await go(page);
      await expect(status(page)).toContainText('preise.ts:8:3');
      await expect(values(page)).toContainText('netto');
      await go(page);
      await expect(output(page)).toHaveText('Tastatur 29.75');
      await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
      await app.close(); app = null;
    }
  } finally { await app?.close(); }
});
