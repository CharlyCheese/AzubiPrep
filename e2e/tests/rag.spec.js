import { test, expect, _electron } from '@playwright/test';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { syntheticPdf } from '../../backend/test/fixtures/synthetic-pdf.js';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
const ready = { state: 'ready', documents: [{ id: '00000000-0000-4000-8000-000000000001', label: 'Unterlage 1', state: 'ready', pages: 2 }], revision: 'synthetic-r1', localOnly: true };
test('Lernhilfe nutzt Material nur nach Zustimmung und zeigt ausschließlich bestätigte Quellen', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(() => localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify({ version: 1, enabled: true, model: 'qwen3:4b' })));
  const calls = [];
  await page.route('**/api/ai/material/status', route => route.fulfill({ json: ready }));
  await page.route('**/api/ai/help', async route => {
    const body = route.request().postDataJSON(); calls.push(body);
    await route.fulfill({ json: { text: body.useMaterial ? 'HTML strukturiert Inhalte. [S1]' : 'Ein allgemeiner Hinweis.', source: 'model', model: 'qwen3:4b', durationMs: 100, ragUsed: body.useMaterial, sources: body.useMaterial ? [{ id: 'S1', label: 'Unterlage 1', page: 2 }] : [] } });
  });
  await page.goto('/frontendkurs'); await openWorkshopTools(page);
  const help = page.getByRole('region', { name: 'Lokale Lernbegleitung', exact: true }).last();
  const material = help.getByRole('checkbox', { name: 'Eigene lokale Unterlagen für diese Lernanfrage verwenden' }); await expect(material).toBeEnabled(); await expect(material).not.toBeChecked();
  await help.getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click(); await expect(help.getByLabel('KI-Antwort')).toContainText('allgemeiner Hinweis'); expect(calls[0].useMaterial).toBe(false);
  await material.check(); await help.getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect(help.getByLabel('Verwendete Quellen')).toContainText('[S1] Unterlage 1 · PDF-Seite 2'); expect(calls[1].useMaterial).toBe(true);
  await expect(help.getByLabel('KI-Antwort')).not.toContainText('.pdf');
});

test('Entferntes oder geändertes Material verwirft sichtbare alte Quellenantworten', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page); await page.addInitScript(() => localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify({ version: 1, enabled: true, model: 'qwen3:4b' })));
  let status = ready;
  await page.route('**/api/ai/material/status', route => route.fulfill({ json: status }));
  await page.route('**/api/ai/help', route => route.fulfill({ json: { text: 'Alter belegter Stand. [S1]', source: 'model', model: 'qwen3:4b', durationMs: 100, ragUsed: true, sources: [{ id: 'S1', label: 'Unterlage 1', page: 2 }] } }));
  await page.goto('/frontendkurs'); await openWorkshopTools(page); const help = page.getByRole('region', { name: 'Lokale Lernbegleitung', exact: true }).last();
  const check = help.getByRole('checkbox', { name: 'Eigene lokale Unterlagen für diese Lernanfrage verwenden' }); await expect(check).toBeEnabled(); await check.check();
  await help.getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click(); await expect(help.getByLabel('KI-Antwort')).toBeVisible();
  status = { ...ready, state: 'empty', documents: [], revision: 'synthetic-r2' };
  await page.evaluate(() => window.dispatchEvent(new Event('azubiprep-material-changed')));
  await expect(help.getByLabel('KI-Antwort')).toHaveCount(0);
  await check.uncheck(); await expect(check).toBeDisabled();
});

test('Desktop importiert synthetische PDF, erstellt Seitenindex, verwendet lokalen Modellmock und entfernt Arbeitsdaten', async ({}, info) => {
  test.skip(process.platform !== 'win32'); test.setTimeout(90000);
  const root = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'azubiprep-rag-e2e-')));
  const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'); const requests = [];
  const model = { name: 'qwen3:4b', digest: 'a'.repeat(64), size: 2000000000 };
  const server = http.createServer(async (req, res) => {
    let raw = ''; for await (const bytes of req) raw += bytes;
    const body = raw ? JSON.parse(raw) : null; requests.push({ url: req.url, body });
    const value = req.url === '/api/tags' ? { models: [model] } : req.url === '/api/show' ? { details: { family: 'qwen3' } } : req.url === '/api/generate' ? { done: true } : { done: true, message: { role: 'assistant', content: JSON.stringify({ answer: 'HTML strukturiert Inhalte. [S1]', citations: ['S1'], grounded: true }) } };
    res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(value));
  }); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const env = { ...process.env, DATABASE_URL: '', AI_ENABLED: 'true', AZUBIPREP_RAG_DIR: path.join(root, 'private'), OLLAMA_BASE_URL: `http://127.0.0.1:${server.address().port}` }; delete env.ELECTRON_RUN_AS_NODE;
  let app;
  try {
    app = await _electron.launch({ executablePath: path.join(repo, 'desktop/node_modules/electron/dist/electron.exe'), args: [path.join(repo, 'desktop'), `--user-data-dir=${path.join(root, 'profile')}`], env });
    const page = await app.firstWindow(); await page.waitForURL(/^http:/); const origin = new URL(page.url()).origin;
    await unterdrueckeOnboardingPopups(page); await page.goto(`${origin}/einstellungen`); await openWorkshopTools(page);
    await page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('qwen');
    await expect.poll(() => page.evaluate(() => window.azubiDesktop.loadAiPreferences())).toMatchObject({ provider: 'qwen' });
    const material = page.getByRole('region', { name: 'Eigene lokale Lernunterlagen', exact: true });
    await app.evaluate(({ shell }) => { shell.openPath = async target => { globalThis.syntheticMaterialFolder = target; return ''; }; });
    await material.getByRole('button', { name: 'Materialordner öffnen', exact: true }).click();
    await expect.poll(() => app.evaluate(() => globalThis.syntheticMaterialFolder)).toBe(path.join(root, 'private/material'));
    await page.evaluate(() => window.azubiDesktop.openMaterialFolder('C:/unfreigegeben'));
    expect(await app.evaluate(() => globalThis.syntheticMaterialFolder)).toBe(path.join(root, 'private/material'));
    await material.getByLabel('PDF hinzufügen', { exact: true }).setInputFiles({ name: 'synthetic.pdf', mimeType: 'application/pdf', buffer: syntheticPdf(['HTML beschreibt die Struktur einer Webseite. h1 ist die Hauptueberschrift und ein Textabsatz enthaelt eigene Inhalte. Eine Hauptueberschrift und Textabsaetze machen den Inhalt fuer Menschen verstaendlich.']) });
    await expect(material.getByText('Unterlage 1', { exact: true })).toBeVisible();
    await material.getByRole('button', { name: 'Material aufbereiten / neu einlesen', exact: true }).click();
    await expect(material.getByText('Lokaler Suchindex bereit', { exact: true })).toBeVisible({ timeout: 30000 });
    await page.goto(`${origin}/frontendkurs`); await openWorkshopTools(page); const help = page.getByRole('region', { name: 'Lokale Lernbegleitung', exact: true }).last();
    const check = help.getByRole('checkbox', { name: 'Eigene lokale Unterlagen für diese Lernanfrage verwenden' }); await expect(check).toBeEnabled(); await check.check();
    await help.getByRole('textbox', { name: 'Deine Rückfrage (optional)' }).fill('Wozu dienen HTML und h1?');
    await help.getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
    await expect(help.getByLabel('Verwendete Quellen')).toContainText('Unterlage 1 · PDF-Seite 1');
    const chat = requests.find(item => item.url === '/api/chat').body; expect(chat.keep_alive).toBe(0); expect(JSON.parse(chat.messages[1].content).privateSources.length).toBeLessThanOrEqual(3);
    await page.goto(`${origin}/einstellungen`); await openWorkshopTools(page); page.once('dialog', dialog => dialog.accept());
    await page.getByRole('button', { name: 'Unterlage entfernen', exact: true }).click();
    await expect(material.getByText('Unterlage 1', { exact: true })).toHaveCount(0);
    await expect(material.getByText(/Modellkontext wurde entladen/)).toBeVisible();
    expect(await fs.readdir(path.join(root, 'private/material'))).toEqual([]); expect(await fs.readdir(path.join(root, 'private/index'))).toEqual([]); expect(await fs.readdir(path.join(root, 'private/staging'))).toEqual([]);
    expect(requests.some(item => item.url === '/api/generate')).toBe(true);
  } finally {
    await app?.close().catch(() => {}); server.closeAllConnections(); await new Promise(resolve => server.close(resolve));
    expect(path.dirname(await fs.realpath(root))).toBe(await fs.realpath(os.tmpdir())); expect(path.basename(root)).toMatch(/^azubiprep-rag-e2e-/); await fs.rm(root, { recursive: true, force: true });
  }
});
