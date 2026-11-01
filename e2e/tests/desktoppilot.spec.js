import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';
import { LESSONS, solutionFor } from '../../frontend/src/pilot/course.js';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const desktop = path.join(repo, 'desktop');
const executablePath = process.env.PILOT_DESKTOP_EXE || path.join(desktop, 'node_modules/electron/dist/electron.exe');
test.describe.configure({ mode: 'serial', timeout: 90_000 });
test.skip(process.platform !== 'win32', 'Diese Matrix prüft Windows-Desktop und echte NTFS-Junctions.');

async function launch(profile) {
  const env = { ...process.env, DATABASE_URL: '', AZUBIPREP_AI_DIR: path.join(profile, 'local-ai'), AZUBIPREP_RAG_DIR: path.join(profile, 'local-rag') }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await _electron.launch({ executablePath, args: [...(process.env.PILOT_DESKTOP_EXE ? [] : [desktop]), `--user-data-dir=${profile}`], env });
  const page = await app.firstWindow();
  await page.waitForURL(/^http:\/\/127\.0\.0\.1:/);
  const origin = new URL(page.url()).origin;
  await unterdrueckeOnboardingPopups(page);
  await page.goto(`${origin}/frontendkurs`); await openWorkshopTools(page);
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
  return { app, page, origin };
}

test('Kapitel 7 prüft und zeigt Vererbung in der Desktop-Werkstatt', { tag: '@desktop' }, async ({}, testInfo) => {
  const profile = testInfo.outputPath('css-profile');
  const { app, page } = await launch(profile);
  try {
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('css-diagnose');
    const files = solutionFor(LESSONS.find(item => item.id === 'css-diagnose'));
    page.once('dialog', dialog => dialog.accept());
    await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'css-projekt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
    const frame = page.frameLocator('iframe[title="Dein Projekt"]');
    await expect(frame.locator('main > p')).toHaveCSS('font-family', 'serif');
    await expect(frame.locator('main > p em')).toHaveCSS('color', 'rgb(128, 0, 0)');
    await page.getByRole('combobox', { name: 'Projektseite', exact: true }).selectOption('ueber-uns.html');
    await expect(frame.locator('main > p')).toHaveCSS('color', 'rgb(0, 0, 128)');
    await expect(frame.locator('main > p em')).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(page.locator('iframe[title="Interne CSS-Pflichtprüfung"]')).toHaveCount(0);
  } finally { await app.close(); }
});

test('CSS-Abschlussprojekt läuft im Desktop mit Medienregeln und reduzierter Bewegung', { tag: '@desktop' }, async ({}, testInfo) => {
  const { app, page } = await launch(testInfo.outputPath('responsive-profile'));
  try {
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('responsive-website');
    const files = solutionFor(LESSONS.find(item => item.id === 'responsive-website'));
    page.once('dialog', dialog => dialog.accept());
    await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'responsive.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
    await page.getByLabel('Vorschaugröße').selectOption('375px');
    const frame = page.frameLocator('iframe[title="Dein Projekt"]');
    await expect.poll(() => frame.locator('.karte').evaluateAll(nodes => nodes.every((node, i) => !i || node.getBoundingClientRect().top >= nodes[i-1].getBoundingClientRect().bottom - 1))).toBe(true);
    await page.getByRole('combobox', { name: 'Projektseite', exact: true }).selectOption('ueber-uns.html');
    await expect(frame.locator('aside')).toBeVisible();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await frame.locator('.karte').first().hover();
    await expect(frame.locator('.marke')).toHaveCSS('transform', 'none');
    await expect(frame.locator('.marke')).toHaveCSS('transition-duration', '0s');
    await expect(page.locator('iframe[title="Interne Layout-Pflichtprüfung"]')).toHaveCount(0);
    await expect(page.getByRole('status')).toHaveText('Gespeichert');
  } finally { await app.close(); }
});

test('HTML-Formular lässt sich im Desktop lokal bedienen und prüfen, ohne Versand', { tag: '@desktop' }, async ({}, testInfo) => {
  const { app, page } = await launch(testInfo.outputPath('forms-profile'));
  try {
    await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('formular-projekt');
    const files = solutionFor(LESSONS.find(item => item.id === 'formular-projekt'));
    page.once('dialog', dialog => dialog.accept());
    await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'formular.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, files })) });
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
    await page.getByLabel('Vorschaugröße').selectOption('375px');
    const frame = page.frameLocator('iframe[title="Dein Projekt"]');
    await frame.locator('label[for="kontaktname"]').click();
    await expect(frame.locator('#kontaktname')).toBeFocused();
    await frame.locator('#kontaktname').fill('Beispiel');
    await frame.locator('#email').fill('probe@example.invalid');
    await frame.locator('#plaetze').fill('2');
    await frame.locator('#nachricht').fill('Eine lokale Desktop-Übung.');
    await frame.locator('#thema').selectOption('projekt');
    await frame.getByLabel('Nachmittag', { exact: true }).check();
    await frame.getByLabel('Materialliste gewünscht (freiwillig)', { exact: true }).check();
    await frame.getByRole('button', { name: 'Eingaben prüfen', exact: true }).click();
    await expect(page.getByText('Die lokale Browserprüfung ist bestanden. Es wurde nichts gesendet; deine Eingaben werden nicht gespeichert.', { exact: true })).toBeVisible();
    await expect(page.locator('iframe[title="Dein Projekt"]')).toHaveAttribute('sandbox', 'allow-same-origin');
    expect((await app.windows()).length).toBe(1);
    await expect(page.locator('.pilot-status')).toHaveText('Gespeichert');
  } finally { await app.close(); }
});
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

test('Native Auswahl verarbeitet Mehrdateien, Abbruch, Ergänzen, Konflikte und Neustart mit neuer Herkunft', { tag: '@desktop' }, async ({}, info) => {
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

test('Echte Windows-Junction und ungültige Auswahlen ersetzen keinen Entwurf', { tag: '@desktop' }, async ({}, info) => {
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

test('F12 untersucht getrennte Vorschau ohne Node, Speicherbrücke, Netzwerk oder Appnavigation', { tag: '@desktop' }, async ({}, info) => {
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

test('Unterstützter Chromium-Ordnerimport überspringt echte ausbrechende Windows-Junction', { tag: '@desktop' }, async ({ page, browser }, info) => {
  const root = info.outputPath('browser-links'); const project = path.join(root, 'project'); const outside = path.join(root, 'outside');
  await fs.mkdir(project, { recursive: true }); await fs.mkdir(outside);
  await fs.writeFile(path.join(project, 'index.html'), html('Browser innen'));
  await fs.writeFile(path.join(outside, 'secret.html'), 'AUSSERHALB');
  await fs.symlink(outside, path.join(project, 'link'), 'junction');
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('zweite-seite');
  page.once('dialog', d => d.accept()); await page.getByLabel('Ordner einlesen', { exact: true }).setInputFiles(project);
  await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toContainText('Browser innen');
  await expect(page.getByRole('button', { name: 'link/secret.html', exact: true })).toHaveCount(0);
  expect(await fs.readFile(path.join(outside, 'secret.html'), 'utf8')).toBe('AUSSERHALB');
  console.log(`Browsermatrix Chromium ${browser.version()}, ${process.platform}`);
});

test('Aktueller Desktop enthält 7000 Fragen, 90 Übungen, 77 Inhaltslektionen und keine vorangemeldeten KI-Konten', { tag: '@desktop' }, async ({}, info) => {
  const temporary = await fs.realpath(os.tmpdir());
  const profile = await fs.mkdtemp(path.join(temporary, 'azubiprep-release-'));
  let app;
  try {
    const launched = await launch(profile); app = launched.app;
    const { page, origin } = launched;
    const health = await page.request.get(`${origin}/api/health`);
    expect((await health.json()).fragenAnzahl).toBe(7000);
    await expect(page.getByLabel('Lektion', { exact: true }).locator('option')).toHaveCount(167);
    const lesson = LESSONS.find(item => item.id === 'js17-aufgabenprojekt');
    await page.getByLabel('Lektion', { exact: true }).selectOption(lesson.id);
    page.once('dialog', dialog => dialog.accept());
    await page.getByLabel('Sicherung einlesen', { exact: true }).setInputFiles({ name: 'release-projekt.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'azubiprep-pilot', version: 1, entry: 'index.html', files: solutionFor(lesson) })) });
    await expect(page.getByRole('alert')).toContainText('eingelesen');
    await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Prüfergebnisse', exact: true })).toContainText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden');
    await page.getByRole('button', { name: 'Vorschau / Konsole', exact: true }).click();
    await page.getByRole('button', { name: 'Kursprogramm ausführen', exact: true }).click();
    await expect(page.getByLabel('Kurs-Konsolenausgabe')).toHaveText('2\n35\nHTML üben\nJavaScript testen');
    await page.getByRole('button', { name: 'Kapitel 19–31 lesen', exact: true }).click();
    await expect(page.getByLabel('Kapitel der Inhaltsfassung', { exact: true }).locator('option')).toHaveCount(13);
    await expect(page.getByText('Inhaltsfassung · Kapitel 19–31 · 77 Referenzlektionen', { exact: true })).toBeVisible();
    await page.getByLabel('Kapitel der Inhaltsfassung', { exact: true }).selectOption('31');
    await expect(page.getByRole('heading', { name: 'Auftrag und eigenen Umfang festlegen', exact: true })).toBeVisible();
    await page.goto(`${origin}/einstellungen`);
    await expect(page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).locator('option')).toHaveCount(3);
    const response = await page.request.get(`${origin}/api/ai/chatgpt/status`, { headers: { 'X-AzubiPrep-AI': '1' } });
    expect(response.status()).toBe(200);
    const account = await response.json();
    expect(account.connected).toBe(false); expect(account.accounts).toEqual([]);
    expect(await app.evaluate(({ app: application }) => application.getVersion())).toBe('0.1.4');
  } finally {
    if (app) await app.close();
    expect(path.dirname(path.resolve(profile))).toBe(temporary);
    expect(path.basename(profile).startsWith('azubiprep-release-')).toBe(true);
    expect((await fs.lstat(profile)).isSymbolicLink()).toBe(false);
    await fs.rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
  }
});
