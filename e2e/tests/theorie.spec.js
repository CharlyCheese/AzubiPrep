import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const topic = { id: 'field:LF2', title: 'Arbeitsplätze nach Kundenwunsch ausstatten', field: 'LF2', kind: 'overview', moduleIds: ['HARDWARE'], questionCount: 1, practice: { id: 'SYNTHETIC-F1', moduleId: 'HARDWARE' } };
const catalog = { fields: [{ id: 'LF2', title: topic.title }], modules: [{ id: 'HARDWARE', title: 'Hardware', fachrichtung: 'ALLE' }], topics: [topic], total: 1, page: 1, pageSize: 24, glossaryTotal: 1 };
const ready = { state: 'ready', revision: 'r1', documents: [{ id: '1', state: 'ready' }, { id: '2', state: 'ready' }] };
const reply = { text: 'Begriff: RAM ist Arbeitsspeicher. Beispiel: laufende Programme. Merksatz: RAM arbeitet kurzfristig. [S1]', source: 'model', model: 'qwen3:4b', grounded: true, sources: [{ id: 'S1', kind: 'public', label: 'App-Lerninhalt · HARDWARE', excerpt: 'Synthetischer Originaltext über RAM.' }] };
async function setup(page, enabled = true) {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(enabled => localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify({ version: 1, enabled, model: 'qwen3:4b' })), enabled);
  await page.route('**/api/theorie?**', route => route.fulfill({ json: catalog }));
  await page.route('**/api/ai/material/status', route => route.fulfill({ json: ready }));
}
const lesson = page => page.getByRole('region', { name: 'Theorie lernen', exact: true });
async function openTopic(page) { await page.goto('/theorie'); await page.getByRole('button', { name: /LF2.*Arbeitsplätze/ }).click(); }

test('Modul ersetzt den alten Theorieblock durch Lernzugang, Glossar und Filter', async ({ page }) => {
  await setup(page, false); await page.goto('/lernen/WISO');
  await expect(page.getByRole('button', { name: /^Theorie Lies/ })).toHaveCount(0);
  await page.getByRole('link', { name: 'Theorie lernen →', exact: true }).click(); await expect(page).toHaveURL(/theorie\?modul=WISO/);
  await expect(page.getByRole('heading', { name: 'Theorie & Glossar' })).toBeVisible();
  await page.getByLabel('Fachrichtung', { exact: true }).selectOption('FISI'); await expect(page).toHaveURL(/fachrichtung=FISI/); await expect(page).not.toHaveURL(/modul=WISO/);
  await page.getByLabel('Ansicht', { exact: true }).selectOption('glossary'); await expect(page).toHaveURL(/modus=glossary/);
  await page.getByRole('button', { name: 'Filter zurücksetzen' }).click(); await expect(page).toHaveURL(/\/theorie$/);
});

test('Theorie erklärt ohne Quiz und trennt unveränderte Fundstelle von inertem Modelltext', async ({ page }, info) => {
  await setup(page); const sent = [];
  await page.route('**/api/ai/help', async route => { sent.push(route.request().postDataJSON()); await route.fulfill({ json: { ...reply, text: '<img src=x onerror="window.theoryExecuted=true"> ' + reply.text } }); });
  await openTopic(page); await lesson(page).getByRole('button', { name: 'Thema erklären', exact: true }).click();
  await expect(lesson(page).getByLabel('Theorieantwort')).toContainText('Merksatz:'); await expect(lesson(page).getByLabel('Fundstellen')).toContainText('Synthetischer Originaltext');
  expect(sent[0]).toMatchObject({ useMaterial: false, intent: 'explain', context: { kind: 'theory', topicId: 'field:LF2' } }); expect(await page.evaluate(() => window.theoryExecuted)).toBeUndefined();
  expect(await page.evaluate(() => Object.values(localStorage).join(' '))).not.toContain('Synthetischer Originaltext');
  await expect(lesson(page).getByRole('link', { name: 'Passende Frage üben →' })).toHaveAttribute('href', '/quiz/HARDWARE?frage=SYNTHETIC-F1');
  await lesson(page).getByLabel('Deine Frage oder Rückfrage (optional)', { exact: true }).fill('Erkläre RAM einfacher.'); await expect(lesson(page).getByLabel('Theorieantwort')).toHaveCount(0);
  await lesson(page).getByRole('button', { name: 'Thema erklären', exact: true }).click(); expect(sent[1].question).toBe('Erkläre RAM einfacher.'); expect(sent[1]).not.toHaveProperty('history');
  await expect(lesson(page).getByLabel('Theorieantwort')).toBeVisible();
  await lesson(page).screenshot({ path: info.outputPath('synthetic-theory-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await lesson(page).screenshot({ path: info.outputPath('synthetic-theory-mobile.png') });
});

test('Private Quellen verlangen Auswahl und eine einzelne geänderte Unterlage verwirft alte Antwort', async ({ page }) => {
  await setup(page); let status = ready; let sent;
  await page.route('**/api/ai/material/status', route => route.fulfill({ json: status }));
  await page.route('**/api/ai/help', async route => { sent = route.request().postDataJSON(); await route.fulfill({ json: { ...reply, ragUsed: true, sources: [{ id: 'S1', label: 'Unterlage 1', page: 7, excerpt: 'Ausschließlich synthetische private Fundstelle.' }] } }); });
  await openTopic(page); await expect(lesson(page).getByRole('radio', { name: 'App-Lerninhalte', exact: true })).toBeChecked();
  await lesson(page).getByRole('radio', { name: 'Eigene lokale Unterlagen', exact: true }).check(); await lesson(page).getByRole('button', { name: 'Fundstellen lesen' }).click(); expect(sent.useMaterial).toBe(true); expect(sent.intent).toBe('read');
  await expect(lesson(page).getByLabel('Fundstellen')).toContainText('Unterlage 1 · PDF-Seite 7');
  status = { ...ready, documents: [{ id: '1', state: 'stale' }, { id: '2', state: 'ready' }] }; await page.evaluate(() => window.dispatchEvent(new Event('azubiprep-material-changed')));
  await expect(lesson(page).getByLabel('Theorieantwort')).toHaveCount(0);
});

test('Wissenssuche erlaubt Quellenlesen ohne aktivierte KI und Abbruch verwirft späte Antworten', async ({ page }) => {
  await setup(page, false); await page.route('**/api/ai/help', async route => { const body = route.request().postDataJSON(); expect(body.intent).toBe('read'); await new Promise(resolve => setTimeout(resolve, 250)); await route.fulfill({ json: { ...reply, source: 'sources' } }).catch(() => {}); });
  await page.goto('/suche'); await page.getByText('Wissen mit Qwen suchen oder Originalfundstellen lesen', { exact: true }).click();
  await lesson(page).getByLabel('Deine Frage oder Rückfrage', { exact: true }).fill('Was ist RAM?'); await expect(lesson(page).getByRole('button', { name: 'Frage erklären', exact: true })).toBeDisabled();
  await lesson(page).getByRole('button', { name: 'Fundstellen lesen' }).click(); await lesson(page).getByRole('button', { name: 'Anfrage abbrechen' }).click(); await expect(lesson(page).getByRole('alert')).toContainText('abgebrochen');
  await expect(lesson(page).getByLabel('Theorieantwort')).toHaveCount(0); await lesson(page).getByRole('button', { name: 'Fundstellen lesen' }).click(); await expect(lesson(page).getByLabel('Fundstellen')).toContainText('Synthetischer Originaltext');
});

test('Echter Desktop liest öffentliche Fundstellen bei serverseitig ausgeschalteter KI', async ({}, info) => {
  test.skip(process.platform !== 'win32'); test.setTimeout(60000);
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-theory-e2e-'))); const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'false', OLLAMA_BASE_URL: 'http://127.0.0.1:1', AZUBIPREP_RAG_DIR: path.join(root, 'private') }; delete env.ELECTRON_RUN_AS_NODE;
  let app;
  try {
    app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${info.outputPath('profil')}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:/); const origin = new URL(page.url()).origin; await unterdrueckeOnboardingPopups(page); await page.goto(`${origin}/theorie?modul=HARDWARE`);
    await page.getByRole('button', { name: /Hardware-Grundlagen/ }).click(); await lesson(page).getByRole('button', { name: 'Fundstellen lesen' }).click();
    await expect(lesson(page).getByLabel('Theorieantwort')).toContainText('ohne KI-Erklärung'); await expect(lesson(page).getByLabel('Fundstellen')).toContainText('App-'); expect(await lesson(page).locator('blockquote').count()).toBeLessThanOrEqual(3);
    await expect(lesson(page).getByRole('button', { name: 'Thema erklären', exact: true })).toBeDisabled();
  } finally { await app?.close(); expect(path.dirname(await fs.realpath(root))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(root)).toMatch(/^azubiprep-theory-e2e-/); await fs.rm(root, { recursive: true, force: true }); }
});
