import { test, expect, _electron } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const KEY = 'azubiprep.ai.settings.v1';
const reply = { text: 'Vergleiche das Start-Tag mit dem End-Tag.', model: 'qwen3:4b', durationMs: 120, ragUsed: false, source: 'model' };
const ready = { state: 'ready', models: [{ name: 'qwen3:4b', size: 2497293931 }], defaultModel: 'qwen3:4b', localOnly: true, ragReady: false };
async function enabled(page) {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ version: 1, enabled: true, model: 'qwen3:4b' })), KEY);
}
const help = page => page.getByRole('region', { name: 'Lokale Lernbegleitung', exact: true }).last();
async function mock(page, handler) {
  await page.route('**/api/ai/**', async route => {
    expect(route.request().headers()['x-azubiprep-ai']).toBe('1');
    if (route.request().url().endsWith('/material/status')) await route.fulfill({ json: { state: 'empty', documents: [], revision: 'empty', localOnly: true } });
    else if (route.request().url().endsWith('/status')) await route.fulfill({ json: ready });
    else await handler(route);
  });
}

test('KI ist freiwillig, Verbindungstest zeigt lokale Modelle und Einstellungen bleiben erhalten', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); let calls = 0;
  await mock(page, async route => { calls++; await route.fulfill({ json: reply }); });
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await expect(help(page).getByText('Einstellungen', { exact: true })).toBeVisible(); expect(calls).toBe(0);
  await page.goto('/einstellungen'); await openWorkshopTools(page);
  const settings = page.getByRole('region', { name: 'KI und Lernmaterial' });
  await expect(settings.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('none');
  await settings.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('qwen');
  await settings.getByRole('button', { name: 'Lokale Verbindung prüfen', exact: true }).click();
  await expect(settings.getByText('Lokales Qwen ist bereit', { exact: true })).toBeVisible();
  await expect(settings.getByRole('combobox', { name: 'Lokales Modell' })).toHaveValue('qwen3:4b');
  await page.reload(); await openWorkshopTools(page); await expect(settings.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('qwen');
  await expect(settings.getByText(/PDFs werden ausschließlich auf diesem Rechner verarbeitet/)).toBeVisible();
  expect(calls).toBe(0);
});

test('Kurs sendet nur bestätigte Ausschnitte und zeigt Modelltext ohne HTML-Ausführung', async ({ page }) => {
  await enabled(page); const sent = [];
  await mock(page, async route => { const body = route.request().postDataJSON(); sent.push(body); await route.fulfill({ json: { ...reply, stand: body.context.stand, text: '<img src=x onerror="window.aiExecuted=true"> Ein kleiner Hinweis.' } }); });
  await page.goto('/frontendkurs'); await openWorkshopTools(page); await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Eigener Entwurf</h1><p>Mein Absatz</p>');
  const before = await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))));
  await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect(help(page).getByLabel('KI-Antwort')).toContainText('<img src=x');
  expect(sent[0].context.files).toEqual([]);
  expect(await page.locator('.ki-answer img').count()).toBe(0); expect(await page.evaluate(() => window.aiExecuted)).toBeUndefined();
  await help(page).getByRole('checkbox', { name: /Aktuelle Codeausschnitte/ }).check();
  await help(page).getByText('Lernkontext vor dem Senden ansehen', { exact: true }).click();
  await expect(help(page).getByText(/index.html · \d+ Zeichen als Ausschnitt/)).toBeVisible();
  await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect.poll(() => sent.length).toBe(2);
  expect(sent[1].context.files).toEqual([{ path: 'index.html', content: '<h1>Eigener Entwurf</h1><p>Mein Absatz</p>', complete: true }]);
  expect(Object.keys(sent[1]).sort()).toEqual(['context', 'intent', 'model', 'provider', 'question', 'useMaterial']);
  expect(await page.evaluate(() => JSON.stringify(Object.fromEntries(Object.entries(localStorage))))).toBe(before);
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByText(/Lernbegleitung: 2/)).toBeVisible();
});

test('Ausgewähltes Element und berechnete Werte gehen ausschließlich nach Zustimmung an die Lernhilfe', async ({ page }) => {
  await enabled(page); let sent;
  await mock(page, async route => { sent = route.request().postDataJSON(); await route.fulfill({ json: { ...reply, stand: sent.context.stand } }); });
  await page.goto('/frontendkurs'); await openWorkshopTools(page); await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Untersuchen</h1><p>Ein Absatz</p>');
  await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
  await page.getByRole('button', { name: 'Element untersuchen', exact: true }).click();
  await page.frameLocator('iframe').getByRole('heading', { name: 'Untersuchen' }).click();
  const elementHelp = page.getByRole('region', { name: 'Browser-Vorschau' }).getByRole('region', { name: 'Lokale Lernbegleitung' });
  await elementHelp.getByRole('checkbox', { name: /Aktuelle Codeausschnitte/ }).check();
  await elementHelp.getByRole('button', { name: 'Prüfermeldung oder Element erklären', exact: true }).click();
  await expect(elementHelp.getByLabel('KI-Antwort')).toBeVisible();
  expect(sent.context.element.html).toContain('Untersuchen'); expect(sent.context.element.values).toContain('color:');
});

test('Kontextwechsel und Abbruch verwerfen verspätete Modellantworten', async ({ page }) => {
  await enabled(page); let release; let finished; let started;
  const entered = new Promise(resolve => { started = resolve; });
  const gate = new Promise(resolve => { release = resolve; }); const done = new Promise(resolve => { finished = resolve; });
  await mock(page, async route => { started(); await gate; await route.fulfill({ json: { ...reply, text: 'VERALTETE ANTWORT' } }).catch(() => {}); finished(); });
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect(help(page).getByRole('status')).toContainText('Qwen arbeitet lokal');
  await entered;
  await page.getByRole('combobox', { name: 'Lektion', exact: true }).selectOption('dokument');
  await expect(help(page).getByRole('status')).toHaveCount(0); release(); await done;
  await expect(page.getByText('VERALTETE ANTWORT', { exact: true })).toHaveCount(0);
  await page.unroute('**/api/ai/**');
  await mock(page, async route => { await new Promise(resolve => setTimeout(resolve, 200)); await route.fulfill({ json: reply }).catch(() => {}); });
  await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await help(page).getByRole('button', { name: 'KI-Anfrage abbrechen', exact: true }).click();
  await expect(help(page).getByRole('alert')).toContainText('Anfrage abgebrochen');
  await expect(help(page).getByLabel('KI-Antwort')).toHaveCount(0);
});

test('Dienstausfall blockiert weder Editor noch feste Aufgabenprüfung', async ({ page }) => {
  await enabled(page);
  await mock(page, async route => route.fulfill({ status: 503, json: { error: 'Ollama ist nicht erreichbar.' } }));
  await page.goto('/frontendkurs'); await openWorkshopTools(page); await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect(help(page).getByRole('alert')).toHaveText('Ollama ist nicht erreichbar.');
  await page.unroute('**/api/ai/**');
  await mock(page, async route => route.abort('connectionrefused'));
  await help(page).getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect(help(page).getByRole('alert')).toContainText('Der lokale Anwendungsdienst ist nicht erreichbar.');
  await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
  await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill('<h1>Ohne Modell</h1><p>Ich lerne weiter.</p>');
  await page.getByRole('button', { name: 'Aufgabe prüfen', exact: true }).click();
  await expect(page.getByText('Dieser eingereichte Stand hat die Pflichtprüfung bestanden. Ergänze die Selbstprüfung.')).toBeVisible();
});

test('Eine feste Rückmeldung über fehlenden Kontext zählt nicht als gelieferte KI-Hilfe', async ({ page }) => {
  await enabled(page);
  await mock(page, async route => route.fulfill({ json: { ...reply, source: 'context_guard', model: null, text: 'Es fehlen aktuelle Codeausschnitte.' } }));
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  await help(page).getByRole('button', { name: 'Prüfermeldung oder Element erklären', exact: true }).click();
  await expect(help(page).getByLabel('KI-Antwort')).toContainText('Feste Rückmeldung');
  await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
  await expect(page.getByText(/Lernbegleitung: 0/)).toBeVisible();
});

test('Quiz-Lernhilfe erklärt erst nach der festen Prüfung und übergibt nur die Fragen-ID', async ({ page }) => {
  await enabled(page); let sent;
  await mock(page, async route => { sent = route.request().postDataJSON(); await route.fulfill({ json: reply }); });
  await page.goto('/quiz/WISO'); await openWorkshopTools(page);
  const free = page.locator('textarea.input'); const options = page.locator('.option-row');
  await expect(free.or(options.first())).toBeVisible();
  await expect(page.getByRole('button', { name: 'Frage verständlich erklären', exact: true })).toHaveCount(0);
  if (await free.isVisible()) await free.fill('Testantwort'); else await options.first().click();
  await page.getByRole('button', { name: /Antwort prüfen/ }).click();
  await help(page).getByRole('button', { name: 'Frage verständlich erklären', exact: true }).click();
  await expect(help(page).getByLabel('KI-Antwort')).toBeVisible();
  expect(sent.context.kind).toBe('quiz'); expect(Object.keys(sent.context).sort()).toEqual(['kind', 'questionId']);
  const id = sent.context.questionId;
  await help(page).getByRole('textbox', { name: 'Deine Rückfrage (optional)' }).fill('Bitte noch ein Beispiel.');
  await page.keyboard.press('Enter'); expect(sent.context.questionId).toBe(id);
  await expect(page.getByRole('button', { name: /Nächste Frage|Quiz beenden/ })).toBeVisible();
});

test('Desktop speichert KI-Zustimmung im App-Profil über wechselnde Ports hinweg', async () => {
  test.skip(process.platform !== 'win32'); test.setTimeout(60000);
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const profile = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-ai-profile-')));
  async function launch() {
    const env = { ...process.env, DATABASE_URL: '' }; delete env.ELECTRON_RUN_AS_NODE;
    const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${profile}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.goto(`${origin}/einstellungen`); await openWorkshopTools(page); return { app, page, origin };
  }
  let running = await launch();
  try {
    const control = running.page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }); await expect(control).toHaveValue('none'); await control.selectOption('qwen');
    await expect.poll(() => running.page.evaluate(() => window.azubiDesktop.loadAiPreferences())).toMatchObject({ version: 2, provider: 'qwen', qwenModel: 'qwen3:4b' });
    const origin = running.origin; await running.app.close(); running = await launch(); expect(running.origin).not.toBe(origin);
    await expect(running.page.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('qwen');
    await running.page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('chatgpt');
    await expect(running.page.getByText('Noch kein ChatGPT-Konto verbunden.', { exact: true })).toBeVisible();
    await expect.poll(() => running.page.evaluate(() => window.azubiDesktop.loadAiPreferences())).toMatchObject({ provider: 'chatgpt', qwenModel: 'qwen3:4b' });
    await running.app.close(); running = await launch();
    await expect(running.page.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('chatgpt');
    await expect(running.page.getByRole('button', { name: 'Continue with ChatGPT', exact: true })).toBeVisible();
  } finally { await running.app.close(); expect(path.dirname(await fs.realpath(profile))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(profile)).toMatch(/^azubiprep-ai-profile-/); await fs.rm(profile, { recursive: true, force: true }); }
});

test('Echter Desktop-Codehinweis benennt offene h1-Tags und erklärt die fehlerverzeihende Browserdarstellung', async ({}, info) => {
  test.skip(process.platform !== 'win32'); test.setTimeout(60000);
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'true', OLLAMA_BASE_URL: 'http://127.0.0.1:1' }; delete env.ELECTRON_RUN_AS_NODE;
  const app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${info.outputPath('profil')}`], env });
  try {
    const page = await app.firstWindow(); await page.waitForURL(/^http:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.goto(`${origin}/einstellungen`); await openWorkshopTools(page);
    await page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('qwen');
    await expect.poll(() => page.evaluate(() => window.azubiDesktop.loadAiPreferences())).toMatchObject({ provider: 'qwen' });
    await page.goto(`${origin}/frontendkurs`); await openWorkshopTools(page); await page.getByRole('button', { name: 'Schreiben', exact: true }).click();
    const code = '<!doctype html><html lang="de"><head><title>Eigene Seite</title></head><body><h1>Mein eigener Titel<h1><p>Mein Absatz</p></body></html>';
    await page.getByRole('textbox', { name: 'Code index.html', exact: true }).fill(code);
    await help(page).getByRole('checkbox', { name: /Aktuelle Codeausschnitte/ }).check();
    await help(page).getByRole('button', { name: 'Prüfermeldung oder Element erklären', exact: true }).click();
    const answer = help(page).getByLabel('KI-Antwort');
    await expect(answer).toContainText('Fester Codehinweis');
    await expect(answer).toContainText('zwei öffnende h1-Tags');
    await expect(answer).toContainText('<h1>Mein eigener Titel</h1>');
    await expect(answer).toContainText('obwohl der Quelltext Fehler enthält');
    await expect(page.getByRole('textbox', { name: 'Code index.html', exact: true })).toHaveValue(code);
    await page.getByRole('button', { name: 'Vorschau', exact: true }).click();
    await expect(page.frameLocator('iframe').getByRole('heading', { name: 'Mein eigener Titel', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Prüfen', exact: true }).click();
    await expect(page.getByText(/Lernbegleitung: 1/)).toBeVisible();
    await expect(page.getByText(/Selbstständiger Transfer noch nicht bestätigt/)).toBeVisible();
  } finally { await app.close(); }
});
