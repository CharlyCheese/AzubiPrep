import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups } from './helpers.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const desktop = path.join(repo, 'desktop');
const executablePath = process.env.PILOT_DESKTOP_EXE || path.join(desktop, 'node_modules/electron/dist/electron.exe');
test.describe.configure({ mode: 'serial', timeout: 90_000 });
test.skip(process.platform !== 'win32', 'Diese Matrix prüft Windows-Desktop und echte NTFS-Junctions.');

async function launch(profile) {
  const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await _electron.launch({ executablePath, args: [...(process.env.PILOT_DESKTOP_EXE ? [] : [desktop]), `--user-data-dir=${profile}`], env });
  const page = await app.firstWindow();
  await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
  const origin = new URL(page.url()).origin;
  await unterdrueckeOnboardingPopups(page);
  await page.goto(`${origin}/frontendkurs`);
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
  return { app, page, origin };
}
async function select(app, mode, paths, canceled = false) {
  // Nur die OS-Antwort ersetzen: echter IPC, Dateisystem, Validierung, UI und
  // Profil bleiben unverändert. Das ist kein manueller Windows-Dialogtest.
  await app.evaluate(({ dialog }, value) => {
    dialog.showOpenDialog = async (_parent, options) => {
      globalThis.lastPilotDialog = options;
      return { canceled: value.canceled, filePaths: value.paths };
    };
  }, { paths, canceled });
  const page = await app.firstWindow();
  await page.getByRole('button', { name: mode === 'folder' ? '📂 Ordner einlesen' : '＋ Dateien auswählen', exact: true }).click();
}
function nextPreview(app, page) {
  return app.waitForEvent('window', { predicate: async (candidate) => {
    if (candidate === page) return false;
    try { await candidate.waitForURL('azubi-preview://project/', { timeout: 5000 }); return true; }
    catch { return false; }
  } });
}
const html = (heading) => `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${heading}</title><link rel="stylesheet" href="css/style.css"></head><body><h1>${heading}</h1><p>Meine Seite</p><a href="zweite.html">Weiter</a><img src="bilder/logo.png" alt="Zeichen"></body></html>`;
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGPQyNtCU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULADD+KEyfbA9oAAAAAElFTkSuQmCC', 'base64');

test('Native Auswahl verarbeitet Mehrdateien, Abbruch, Ergänzen, Konflikte und Neustart mit neuer Herkunft', async ({}, info) => {
  const root = info.outputPath('native'); const project = path.join(root, 'Projekt mit Leerzeichen');
  await fs.mkdir(path.join(project, 'css'), { recursive: true }); await fs.mkdir(path.join(project, 'bilder'));
  await fs.writeFile(path.join(project, 'index.html'), html('Desktopprojekt'));
  await fs.writeFile(path.join(project, 'zweite.html'), html('Zweite Seite'));
  await fs.writeFile(path.join(project, 'css/style.css'), 'h1 { color: navy; }');
  await fs.writeFile(path.join(project, 'bilder/logo.png'), png);
  await fs.writeFile(path.join(project, '.env'), 'PRIVATE-FIXTURE');
  const profile = path.join(root, 'profil'); let running = await launch(profile);
  try {
    let { app, page } = running;
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('stylesheet');
    page.once('dialog', d => d.accept()); await select(app, 'folder', [project]);
    await expect(page.getByText('4 Datei(en) lokal', { exact: false })).toBeVisible();
    await expect(page.getByText('1 private oder nicht unterstützte', { exact: false })).toBeVisible();
    expect(await app.evaluate(() => globalThis.lastPilotDialog.properties)).toContain('openDirectory');
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
    await select(app, 'folder', [], true);
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Desktopprojekt');

    const add = path.join(root, 'zusatz.css'); await fs.writeFile(add, 'p { color: green; }');
    await select(app, 'files', [add]);
    expect(await app.evaluate(() => globalThis.lastPilotDialog.properties)).toContain('multiSelections');
    await page.getByRole('textbox', { name: 'Relativer Pfad 1', exact: true }).fill('css/zusatz.css');
    await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
    await expect(page.getByRole('button', { name: 'zweite.html', exact: true })).toBeVisible();
    await select(app, 'files', [path.join(project, 'index.html')]);
    page.once('dialog', d => d.dismiss());
    await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Relative Pfade zuordnen' })).toBeVisible();
    page.once('dialog', d => d.accept());
    await page.getByRole('button', { name: 'Ausgewählte Dateien übernehmen', exact: true }).click();
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
    const originalOrigin = running.origin;
    await app.close(); running = await launch(profile); ({ app, page } = running);
    expect(running.origin).not.toBe(originalOrigin);
    expect(await app.evaluate(({ app }) => app.getPath('userData'))).toBe(profile);
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('stylesheet');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Desktopprojekt');
    await expect(page.getByRole('button', { name: 'css/zusatz.css', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'bilder/logo.png', exact: true })).toBeVisible();
    expect(await fs.readFile(path.join(project, 'index.html'), 'utf8')).toBe(html('Desktopprojekt'));
    const health = await page.evaluate(async () => (await fetch('/api/health')).json());
    expect(health).toMatchObject({ status: 'ok', fragenAnzahl: 7000, modulAnzahl: 26, fachrichtungAnzahl: 4, warnungen: 0 });
  } finally { await running.app.close().catch(() => {}); }
});

test('Echte Windows-Junction und ungültige Auswahlen ersetzen keinen Entwurf', async ({}, info) => {
  const root = info.outputPath('links'); const project = path.join(root, 'project'); const outside = path.join(root, 'outside');
  await fs.mkdir(project, { recursive: true }); await fs.mkdir(outside);
  await fs.writeFile(path.join(project, 'index.html'), html('Innen'));
  await fs.writeFile(path.join(outside, 'secret.html'), 'UNVERAENDERTER-TESTWERT');
  await fs.symlink(outside, path.join(project, 'link'), 'junction');
  const { app, page } = await launch(path.join(root, 'profil'));
  try {
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
    await select(app, 'folder', [project]);
    await expect(page.getByText(/verknüpfung/i).filter({ hasText: /übernommen|Auswahl enthält/ })).toBeVisible();
    await select(app, 'folder', [path.join(project, 'link')]);
    await expect(page.getByText(/Die Auswahl enthält eine Datei- oder Ordnerverknüpfung/)).toBeVisible();
    const huge = path.join(root, 'gross.html'); await fs.writeFile(huge, 'x'.repeat(128 * 1024 + 1));
    await select(app, 'files', [huge]); await expect(page.getByText(/Datei zu groß/)).toBeVisible();
    expect(await fs.readFile(path.join(outside, 'secret.html'), 'utf8')).toBe('UNVERAENDERTER-TESTWERT');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).not.toContainText('UNVERAENDERTER');
  } finally { await app.close(); }
});

test('F12 untersucht getrennte Vorschau ohne Node, Speicherbrücke, Netzwerk oder Appnavigation', async ({}, info) => {
  const { app, page, origin } = await launch(info.outputPath('inspect/profil'));
  try {
    expect(await page.evaluate(() => ({ bridge: window.azubiDesktop.version, require: typeof require }))).toEqual({ bridge: 1, require: 'undefined' });
    const mainPrefs = await app.evaluate(({ BrowserWindow }) => {
      const prefs = BrowserWindow.getAllWindows()[0].webContents.getLastWebPreferences();
      const contents = BrowserWindow.getAllWindows()[0].webContents;
      contents.openDevTools();
      return { sandbox: prefs.sandbox, contextIsolation: prefs.contextIsolation, nodeIntegration: prefs.nodeIntegration, devToolsOpened: contents.isDevToolsOpened() };
    });
    expect(mainPrefs).toEqual({ sandbox: true, contextIsolation: true, nodeIntegration: false, devToolsOpened: false });
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1 style="color:navy">Meine isolierte Vorschau</h1><p>Mein Entwurf</p><script>window.escaped=true</script>');
    await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
    await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Meine isolierte Vorschau' })).toHaveCSS('color', 'rgb(0, 0, 128)');
    await expect(page.getByRole('button', { name: 'Entwicklerwerkzeuge (F12)' })).toBeEnabled();
    const childPromise = nextPreview(app, page);
    await app.evaluate(({ BrowserWindow }) => {
      const contents = BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('http:')).webContents;
      contents.sendInputEvent({ type: 'keyDown', keyCode: 'F12' });
      contents.sendInputEvent({ type: 'keyUp', keyCode: 'F12' });
    });
    let child = await childPromise;
    await child.waitForURL('azubi-preview://project/');
    await expect(child.getByRole('heading', { name: 'Meine isolierte Vorschau' })).toHaveCSS('color', 'rgb(0, 0, 128)');
    expect(await child.locator('script').count()).toBe(0);
    expect(await child.evaluate(() => ({ bridge: typeof window.azubiDesktop, require: typeof require, process: typeof process, opener: window.opener }))).toEqual({ bridge: 'undefined', require: 'undefined', process: 'undefined', opener: null });
    expect(await child.evaluate(async () => { try { await fetch('http://127.0.0.1:11434/api/tags'); return 'access'; } catch { return 'blocked'; } })).toBe('blocked');
    await expect.poll(() => app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().some(w => w.webContents.getURL().startsWith('azubi-preview:') && w.webContents.isDevToolsOpened()))).toBe(true);
    for (let repeat = 0; repeat < 2; repeat++) {
      const heading = repeat === 0 ? 'Meine isolierte Vorschau' : 'Aktueller dritter Stand';
      if (repeat === 1) {
        await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
        await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill(`<h1>${heading}</h1><p>Überarbeitet</p>`);
        await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
        await expect(page.frameLocator('iframe').getByRole('heading', { name: heading })).toBeVisible();
      }
      const previous = child;
      const next = nextPreview(app, page);
      await page.getByRole('button', { name: 'Entwicklerwerkzeuge (F12)' }).click();
      child = await next; await child.waitForURL('azubi-preview://project/');
      await expect.poll(() => previous.isClosed()).toBe(true);
      await expect(child.getByRole('heading', { name: heading })).toBeVisible();
    }
    const windows = await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length);
    await child.evaluate(() => { window.open('https://example.invalid'); const script = document.createElement('script'); script.textContent = 'window.escaped=true'; document.body.append(script); });
    expect(await child.evaluate(() => window.escaped || false)).toBe(false);
    await child.evaluate(() => { location.href = 'file:///C:/Windows/win.ini'; });
    await expect(child).toHaveURL('azubi-preview://project/');
    await page.evaluate(() => { window.open('https://example.invalid'); location.href = 'https://example.invalid'; });
    // Chromium meldet bei verhinderter Navigation zeitweise eine leere CDP-URL.
    // Maßgeblich sind committed URL im nativen WebContents und bedienbarer Inhalt.
    expect(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('http:'))?.webContents.getURL())).toBe(`${origin}/frontendkurs`);
    expect(await app.evaluate(async ({ BrowserWindow }) => BrowserWindow.getAllWindows().find(w => w.webContents.getURL().startsWith('http:')).webContents.executeJavaScript('Boolean(document.querySelector("select[aria-label=\\"Lektion\\"]"))'))).toBe(true);
    expect(await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows().length)).toBe(windows);
    const sessions = await app.evaluate(({ BrowserWindow }) => {
      const all = BrowserWindow.getAllWindows(); const main = all.find(w => w.webContents.getURL().startsWith('http:')); const child = all.find(w => w.webContents.getURL().startsWith('azubi-preview:'));
      const prefs = child.webContents.getLastWebPreferences();
      return { separate: main.webContents.session !== child.webContents.session, preload: prefs.preload || '', sandbox: prefs.sandbox, node: prefs.nodeIntegration };
    });
    expect(sessions).toEqual({ separate: true, preload: '', sandbox: true, node: false });
  } finally { await app.close(); }
});

test('Unterstützter Chromium-Ordnerimport überspringt echte ausbrechende Windows-Junction', async ({ page, browser }, info) => {
  const root = info.outputPath('browser-links'); const project = path.join(root, 'project'); const outside = path.join(root, 'outside');
  await fs.mkdir(project, { recursive: true }); await fs.mkdir(outside);
  await fs.writeFile(path.join(project, 'index.html'), html('Browser innen'));
  await fs.writeFile(path.join(outside, 'secret.html'), 'AUSSERHALB');
  await fs.symlink(outside, path.join(project, 'link'), 'junction');
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
  page.once('dialog', d => d.accept()); await page.getByLabel('Ordner einlesen', { exact: true }).setInputFiles(project);
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Browser innen');
  await expect(page.getByRole('button', { name: 'link/secret.html', exact: true })).toHaveCount(0);
  expect(await fs.readFile(path.join(outside, 'secret.html'), 'utf8')).toBe('AUSSERHALB');
  console.log(`Browsermatrix Chromium ${browser.version()}, ${process.platform}`);
});
