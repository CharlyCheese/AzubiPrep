import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';
import { unterdrueckeOnboardingPopups } from './helpers.js';

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../desktop');
test.use({ serviceWorkers: 'block' });

async function open(page, url = '/frontendkurs') {
  await unterdrueckeOnboardingPopups(page); await page.goto(url);
  await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toBeEnabled();
}
const status = page => page.locator('.js-playground-status');
const output = page => page.getByLabel('JavaScript-Konsole', { exact: true });
async function run(page, source) {
  await page.getByRole('textbox', { name: 'JavaScript-Code', exact: true }).fill(source);
  await page.getByRole('button', { name: 'JavaScript ausführen', exact: true }).click();
}
async function completed(page) { await expect(status(page)).toHaveText('Programm beendet.'); }

test('Web: eigener Code, CSP, eingebettetes WASM und keine externen Ressourcen', async ({ page, request }, info) => {
  const foreign = []; const workers = [];
  page.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:3001/')) foreign.push(request.url()); });
  page.on('worker', worker => workers.push(worker.url()));
  await open(page);
  foreign.length = 0; // Existing app fonts are unrelated to runtime loading.
  await run(page, 'const quadrat = n => n * n; console.log("Ergebnis:", quadrat(7));');
  await completed(page); await expect(output(page)).toHaveText('Ergebnis: 49');
  expect(foreign).toEqual([]); expect(workers).toHaveLength(1);
  const header = (await request.get(workers[0])).headers()['content-security-policy'];
  expect(header).toContain("'wasm-unsafe-eval'"); expect(header).toContain("connect-src 'none'");
  const appHeader = (await request.get('/frontendkurs')).headers()['content-security-policy'];
  expect(appHeader).not.toContain('wasm-unsafe-eval'); expect(appHeader).not.toContain("'unsafe-eval'");
  const license = await (await request.get('/quickjs-LICENSE.txt')).text();
  expect(license).toContain('Jake Teton-Landis'); expect(license).toContain('Fabrice Bellard');
  await page.screenshot({ path: info.outputPath('js-grundlagen.png'), fullPage: false });
});

test.describe('JavaScript ohne Verbindung nach erstem Start', () => {
  test.use({ serviceWorkers: 'allow' });
  test('Neuer Worker startet aus dem lokalen Service-Worker-Cache', async ({ page, context }) => {
    await open(page);
    await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
    let workerUrl;
    page.on('worker', worker => { workerUrl = worker.url(); });
    await run(page, 'console.log("online vorbereitet");'); await completed(page);
    await expect.poll(() => page.evaluate(async url => Boolean(await caches.match(url)), workerUrl)).toBe(true);
    await context.setOffline(true);
    await run(page, 'console.log("lokal:", 6 * 7);'); await completed(page);
    await expect(output(page)).toHaveText('lokal: 42');
  });
});

test('Web: Interpreter enthält keine Browser-, Datei-, Modell- oder Node-Brücken', async ({ page }) => {
  await open(page);
  await page.evaluate(() => localStorage.setItem('synthetic-js-secret', 'LOCAL-ONLY'));
  await run(page, `for (const name of ['window', 'document', 'fetch', 'XMLHttpRequest', 'WebSocket', 'RTCPeerConnection', 'navigator', 'localStorage', 'indexedDB', 'Worker', 'importScripts', 'postMessage', 'setTimeout', 'azubiDesktop', 'require', 'process']) console.log(name + ':' + typeof globalThis[name]);
console.log(console.log.constructor('return typeof fetch')());
console.log(typeof Function('return this')().localStorage);
console.log(typeof __emit);`);
  await completed(page);
  for (const line of (await output(page).innerText()).split('\n')) expect(line).toMatch(/undefined$/);
  expect(await page.evaluate(() => localStorage.getItem('synthetic-js-secret'))).toBe('LOCAL-ONLY');
});

test('Web: Fehlerdetails mit eigenem Dateinamen, Escapeausgabe und neuer Variablenraum', async ({ page }) => {
  await open(page);
  await run(page, 'const meinWert = 42; console.log("<img src=x onerror=alert(1)>");');
  await completed(page); await expect(output(page)).toHaveText('<img src=x onerror=alert(1)>');
  await expect(output(page).locator('img')).toHaveCount(0);
  await run(page, 'console.log(typeof meinWert);'); await completed(page); await expect(output(page)).toHaveText('undefined');
  await run(page, 'const kaputt = ;'); await expect(status(page)).toContainText('JavaScript-Fehler');
  await expect(page.getByLabel('JavaScript-Fehlerdetails')).toContainText('uebung.js');
});

test('Web: feste Zeit-, Stack-, Heap-, Ausgabe- und Jobgrenzen, danach frischer Start', async ({ page }) => {
  await open(page);
  await run(page, 'while (true) {}'); await expect(status(page)).toContainText('Zeitgrenze');
  await run(page, 'function f() { f(); } f();'); await expect(status(page)).toContainText('JavaScript-Fehler');
  await run(page, 'const viel = new Uint8Array(64 * 1024 * 1024);'); await expect(status(page)).toContainText(/JavaScript-Fehler|Speichergrenze/);
  await run(page, 'for (let i = 0; i < 10000; i++) console.log(i);'); await expect(status(page)).toContainText('Ausgabegrenze');
  expect((await output(page).innerText()).split('\n').length).toBeLessThanOrEqual(80);
  await run(page, 'for (let i = 0; i < 100; i++) console.log("x".repeat(1000));'); await expect(status(page)).toContainText('Ausgabegrenze');
  expect((await output(page).innerText()).replaceAll('\n', '').length).toBeLessThanOrEqual(32000);
  await run(page, 'function weiter() { Promise.resolve().then(weiter); } weiter();'); await expect(status(page)).toContainText('Zu viele Folgeaufgaben');
  await run(page, 'console.log(6 * 7);'); await completed(page); await expect(output(page)).toHaveText('42');
});

test('Web: keine Objekt-Getter im Host, begrenzte Strings und feindliche Fehlerobjekte', async ({ page }) => {
  await open(page);
  await run(page, 'console.log({get toString(){while(true){}}}, new Proxy({}, {get(){while(true){}}}), [1,2], "x".repeat(500000));');
  await completed(page); expect((await output(page).innerText()).length).toBeLessThanOrEqual(1000);
  await run(page, 'throw { get message() { while(true){} }, get stack() { while(true){} } };');
  await expect(status(page)).toContainText('JavaScript-Fehler');
  await run(page, 'throw new Proxy({}, {getOwnPropertyDescriptor(){while(true){}}});');
  await expect(status(page)).toContainText('Zeitgrenze');
  await run(page, 'console.log("weiter");'); await completed(page);
});

test('Web: Stop, Neustart, Schließen und Routenwechsel räumen den Worker auf', async ({ page }) => {
  await open(page);
  await run(page, 'while(true){}');
  await page.getByRole('button', { name: 'JavaScript stoppen', exact: true }).click();
  await expect(status(page)).toHaveText('Programm gestoppt.');
  await run(page, 'console.log("neu");'); await completed(page); await expect(output(page)).toHaveText('neu');
  await run(page, 'while(true){}');
  await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await expect(page.getByRole('button', { name: 'JavaScript stoppen', exact: true })).toBeDisabled();
  await run(page, 'console.log("letzter");'); await completed(page); await expect(output(page)).toHaveText('letzter');
  await run(page, 'while(true){}');
  await page.getByRole('link', { name: /Dashboard/, exact: false }).first().click();
  await page.goBack();
  await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
});

test('Web: lokaler Entwurf, Ein-/Auslesen und alle Kursprojekte bleiben erhalten', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  const originalHtml = await page.getByRole('textbox', { name: 'Code index.html', exact: true }).inputValue();
  const source = 'console.log("Gesichert, nicht automatisch gestartet");';
  await page.getByRole('textbox', { name: 'JavaScript-Code', exact: true }).fill(source);
  await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  await page.reload(); await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveValue(source);
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue(originalHtml);
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(82);
  page.on('dialog', dialog => dialog.accept());
  await page.evaluate(() => {
    const original = File.prototype.text;
    window.jsReadFiles = [];
    File.prototype.text = function () { window.jsReadFiles.push(this.name); return original.call(this); };
  });
  await page.getByLabel('JavaScript-Datei einlesen', { exact: true }).setInputFiles({ name: 'rechnung.js', mimeType: 'text/javascript', buffer: Buffer.from('console.log(21 * 2);') });
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveValue('console.log(21 * 2);');
  await expect(output(page)).toHaveText('Noch keine Ausgabe.');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'JavaScript-Datei exportieren', exact: true }).click();
  const exported = await download;
  expect(exported.suggestedFilename()).toBe('rechnung.js');
  expect(await readFile(await exported.path(), 'utf8')).toBe('console.log(21 * 2);');
  await page.getByLabel('JavaScript-Datei einlesen', { exact: true }).setInputFiles({ name: '.env', mimeType: 'text/plain', buffer: Buffer.from('SYNTHETIC=1') });
  await expect(page.getByRole('alert')).toContainText('JavaScript-Datei');
  expect(await page.evaluate(() => window.jsReadFiles)).toEqual(['rechnung.js']);
  await page.getByLabel('JavaScript-Datei einlesen', { exact: true }).setInputFiles({ name: 'gross.js', mimeType: 'text/javascript', buffer: Buffer.alloc(65537, 32) });
  await expect(page.getByRole('alert')).toContainText('64 KiB');
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveValue('console.log(21 * 2);');
});

test('Electron: eigene Programme, Grenzen, kein Hostzugriff und portunabhängige Sicherung', { tag: '@desktop' }, async ({}, info) => {
  test.skip(process.platform !== 'win32', 'Diese Prüfung benötigt Windows-Electron.');
  test.setTimeout(90000);
  const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
  const args = [desktop, `--user-data-dir=${info.outputPath('profile')}`];
  let app;
  try {
    app = await _electron.launch({ executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args, env });
    let page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`);
    await run(page, 'console.log(40+2, typeof azubiDesktop, typeof require, typeof fetch);');
    await completed(page); await expect(output(page)).toHaveText('42 undefined undefined undefined');
    await run(page, 'while(true){}'); await expect(status(page)).toContainText('Zeitgrenze');
    await run(page, 'new ArrayBuffer(64*1024*1024)'); await expect(status(page)).toContainText(/JavaScript-Fehler|Speichergrenze/);
    await run(page, 'for(let i=0;i<1000;i++)console.log(i)'); await expect(status(page)).toContainText('Ausgabegrenze');
    const source = 'console.log("Desktop gespeichert");';
    await run(page, source); await completed(page);
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
    await app.close(); app = null;
    app = await _electron.launch({ executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args, env });
    page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await open(page, `${new URL(page.url()).origin}/frontendkurs`);
    await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveValue(source);
    await expect(output(page)).toHaveText('Noch keine Ausgabe.');
    await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(82);
  } finally { if (app) await app.close(); }
});
