import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups } from './helpers.js';

const desktop = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../desktop');
test.use({ serviceWorkers: 'block' });
test('Web-Werkstatt aktiviert keine Skripte durch den technischen Pilot', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await page.getByText('JavaScript-Technikpilot öffnen', { exact: true }).click();
  await expect(page.getByText(/In der Webversion ist dieser Browser-DOM-Technikpilot nicht verfügbar/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Test starten / zurücksetzen', exact: true })).toHaveCount(0);
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true }).locator('option')).toHaveCount(167);
});

test('Späte Startantworten nach Schließen überschreiben keinen neuen Lauf', async ({ page }) => {
  await page.addInitScript(() => {
    const listeners = new Set(); window.pilotPending = []; window.pilotStopped = [];
    window.azubiDesktop = { jsPilot: {
      catalog: async () => [{ id: 'dom', title: 'DOM-Test', code: 'Nur ein UI-Test.' }],
      start: () => new Promise(resolve => window.pilotPending.push(resolve)),
      stop: async id => { window.pilotStopped.push(id); return true; },
      onEvent: callback => { listeners.add(callback); return () => listeners.delete(callback); },
    } };
    window.pilotEmit = value => listeners.forEach(callback => callback(value));
  });
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  const panel = page.getByText('JavaScript-Technikpilot öffnen', { exact: true });
  const start = page.getByRole('button', { name: 'Test starten / zurücksetzen', exact: true });
  await panel.click(); await start.click();
  await panel.click(); await panel.click();
  await expect(start).toBeEnabled(); await start.click();
  await page.evaluate(() => window.pilotPending[0]({ runId: 'old' }));
  await expect(start).toBeDisabled();
  await page.evaluate(() => { window.pilotPending[1]({ runId: 'new' }); setTimeout(() => window.pilotEmit({ runId: 'new', type: 'ready' }), 20); });
  await expect(page.locator('.js-pilot-status')).toHaveText('Getrennter Übungsprozess bereit.');
  expect(await page.evaluate(() => window.pilotStopped)).toEqual(['old']);
  await panel.click();
  await expect.poll(() => page.evaluate(() => window.pilotStopped)).toEqual(['old', 'new']);
});

test.describe('Electron-JavaScript-Technikpilot', { tag: '@desktop' }, () => {
  test.skip(process.platform !== 'win32', 'Technische Windows-Matrix.');
  test.describe.configure({ mode: 'serial', timeout: 60000 });
  let app; let page;
  test.beforeEach(async ({}, info) => {
    const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
    app = await _electron.launch({ executablePath: path.join(desktop, 'node_modules/electron/dist/electron.exe'), args: [desktop, `--user-data-dir=${info.outputPath('profile')}`], env });
    page = await app.firstWindow(); await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
    await unterdrueckeOnboardingPopups(page); await page.goto(`${new URL(page.url()).origin}/frontendkurs`);
    await page.getByText('JavaScript-Technikpilot öffnen', { exact: true }).click();
    await expect(page.getByRole('combobox', { name: 'Testprogramm', exact: true }).locator('option')).toHaveCount(7);
  });
  test.afterEach(async () => { if (app) await app.close(); });
  async function start(id) {
    await page.getByRole('combobox', { name: 'Testprogramm', exact: true }).selectOption(id);
    await page.getByRole('button', { name: 'Test starten / zurücksetzen', exact: true }).click();
  }
  const status = () => page.locator('.js-pilot-status');

  test('Echte DOM-Änderung in getrenntem Prozess ohne native App-Rechte', async () => {
    await start('dom'); await expect(status()).toHaveText('Getrennter Übungsprozess bereit.');
    const child = (await app.windows()).find(item => item.url().startsWith('azubi-js-pilot:'));
    expect(child).toBeTruthy();
    await child.getByRole('button', { name: 'Text ändern', exact: true }).click();
    await expect(child.locator('#demo-output')).toHaveText('JavaScript verändert diese Übungsseite.');
    await expect(page.getByLabel('Pilotkonsole')).toContainText('DOM geändert');
    const security = await app.evaluate(({ BrowserWindow }) => {
      const main = BrowserWindow.getAllWindows().find(win => win.webContents.getURL().startsWith('http:'));
      const child = BrowserWindow.getAllWindows().find(win => win.webContents.getURL().startsWith('azubi-js-pilot:'));
      const prefs = child.webContents.getLastWebPreferences();
      return { separate: main.webContents.getOSProcessId() !== child.webContents.getOSProcessId(), sandbox: prefs.sandbox, node: prefs.nodeIntegration, isolation: prefs.contextIsolation, preload: Boolean(prefs.preload), tools: child.webContents.isDevToolsOpened() };
    });
    expect(security).toEqual({ separate: true, sandbox: true, node: false, isolation: true, preload: false, tools: false });
    expect(await child.evaluate(() => ({ require: typeof require, process: typeof process, bridge: typeof window.azubiDesktop }))).toEqual({ require: 'undefined', process: 'undefined', bridge: 'undefined' });
    await page.getByRole('button', { name: 'Übung stoppen', exact: true }).click();
    await expect(status()).toHaveText('Manuell gestoppt.');
    await expect(page.getByLabel('Quelltext des Testprogramms')).toContainText('addEventListener');
  });

  test('Endlosschleife wird von außen abgebrochen und die Hauptapp bleibt nutzbar', async () => {
    await start('loop');
    await expect(status()).toHaveText('Zeitgrenze erreicht; Übungsprozess beendet.');
    expect(await page.evaluate(() => 2 + 3)).toBe(5);
    await start('dom'); await expect(status()).toHaveText('Getrennter Übungsprozess bereit.');
    expect((await app.windows()).length).toBe(2);
  });

  test('Ausgabelimit und beobachteter Speicherzuwachs beenden nur den Testprozess', async () => {
    await start('output'); await expect(status()).toHaveText('Ausgabegrenze erreicht; Übungsprozess beendet.');
    const consoleText = await page.getByLabel('Pilotkonsole').textContent();
    expect(consoleText.split('\n').length).toBeLessThanOrEqual(80);
    await start('memory'); await expect(status()).toHaveText('Beobachteter Speicherzuwachs zu groß; Übungsprozess beendet.');
    expect(await page.evaluate(() => document.querySelector('h1').textContent)).toBe('Frontend-Werkstatt');
    expect((await app.windows()).length).toBe(1);
  });

  test('Frische Sitzungen lesen keine App-Daten und Netzwerkversuche erreichen das Backend nicht', async () => {
    await page.evaluate(() => localStorage.setItem('js-pilot-value', 'synthetischer-app-wert'));
    await start('access'); await expect(page.getByLabel('Pilotkonsole')).toContainText('Vorheriger Übungswert: leer');
    await expect(page.getByLabel('Pilotkonsole')).toContainText('App-Brücke: undefined');
    await start('access'); await expect(page.getByLabel('Pilotkonsole')).toContainText('Vorheriger Übungswert: leer');
    expect(await page.evaluate(() => localStorage.getItem('js-pilot-value'))).toBe('synthetischer-app-wert');
    await app.evaluate(() => {
      const http = process.getBuiltinModule('http'); const original = http.Server.prototype.emit;
      globalThis.pilotRequests = 0;
      http.Server.prototype.emit = function(event, ...args) { if (event === 'request' && args[0]?.url === '/api/health') globalThis.pilotRequests++; return original.call(this, event, ...args); };
    });
    await start('network'); await expect(page.getByLabel('Pilotkonsole')).toContainText('Anfrage gesperrt');
    await expect(page.getByLabel('Pilotkonsole')).toContainText('Popup: gesperrt');
    expect(await app.evaluate(() => globalThis.pilotRequests)).toBe(0);
    const child = (await app.windows()).find(item => item.url().startsWith('azubi-js-pilot:'));
    expect(child).toBeTruthy();
    expect(await child.evaluate(() => window.opener)).toBeNull();
    expect((await app.windows()).length).toBe(2);
    await expect(page).toHaveURL(/frontendkurs$/);
  });

  test('Nur bekannte Programmkennungen werden angenommen; Stoppen und Wiederöffnen sind konsistent', async () => {
    const invalid = await page.evaluate(async () => {
      const api = window.azubiDesktop.jsPilot; const failures = [];
      for (const value of ['__proto__', '../code.js', { id: 'dom', code: 'alert(1)' }, null]) { try { await api.start(value); failures.push(false); } catch { failures.push(true); } }
      try { await api.stop('ungueltig'); failures.push(false); } catch { failures.push(true); }
      return failures;
    });
    expect(invalid).toEqual(Array(5).fill(true));
    await start('loop'); await expect(page.getByLabel('Pilotkonsole')).toContainText('Endlosschleife gestartet');
    await page.getByRole('button', { name: 'Übung stoppen', exact: true }).click();
    await expect(status()).toHaveText('Manuell gestoppt.');
    await start('dom'); await expect(status()).toHaveText('Getrennter Übungsprozess bereit.');
    await page.getByText('JavaScript-Technikpilot öffnen', { exact: true }).click();
    await expect.poll(async () => (await app.windows()).length).toBe(1);
    await page.getByText('JavaScript-Technikpilot öffnen', { exact: true }).click();
    await expect(status()).toHaveText('Kein aktiver Übungsprozess.');
    await expect(page.getByRole('button', { name: 'Übung stoppen', exact: true })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Test starten / zurücksetzen', exact: true })).toBeEnabled();
  });

  test('Fehler werden begrenzt dargestellt; Beenden mit aktiver Übung schließt alle Fenster', async () => {
    await start('error'); await expect(status()).toHaveText('Testprogramm mit Fehler beendet.');
    await expect(page.getByLabel('Pilotkonsole')).toContainText('fehlenderName');
    await start('dom'); await expect(status()).toHaveText('Getrennter Übungsprozess bereit.');
    await app.close(); app = null;
  });
});
