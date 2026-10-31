import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';
test.use({ serviceWorkers: 'block' });
const preference = { version: 2, provider: 'chatgpt', qwenModel: 'qwen3:4b', chatgptModel: 'synthetic-model' };
const account = { connected: true, planEnabled: true, activeId: 'synthetic-account', accounts: [{ id: 'synthetic-account', label: 'Synthetisches Konto', connected: true }], loginState: 'idle', revision: '1' };
async function setup(page) {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(value => localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify(value)), preference);
  await page.route('**/api/ai/chatgpt/status', route => route.fulfill({ json: account }));
  await page.route('**/api/ai/material/status', route => route.fulfill({ json: { state: 'ready', revision: 'synthetic-revision', documents: [] } }));
}
test('ChatGPT zeigt Cloudhinweis, eigenes Konto und Modellauswahl ohne Ollama', async ({ page }) => {
  await setup(page); let ollamaChecks = 0;
  await page.route('**/api/ai/status*', async route => { if (!route.request().url().includes('provider=chatgpt')) ollamaChecks++; await route.fulfill({ json: { state: 'ready', models: [{ name: 'synthetic-model', label: 'Synthetisches Modell' }], defaultModel: 'synthetic-model' } }); });
  await page.goto('/einstellungen'); await openWorkshopTools(page);
  await expect(page.getByRole('combobox', { name: 'KI-Anbieter', exact: true })).toHaveValue('chatgpt');
  await expect(page.getByText(/Eigene PDFs, Auszüge, Suchindizes/)).toBeVisible();
  await page.getByRole('button', { name: 'ChatGPT-Verbindung prüfen', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'ChatGPT-Modell', exact: true })).toHaveValue('synthetic-model'); expect(ollamaChecks).toBe(0);
});
test('Private lokale Suchfrage bleibt beim Wechsel zu öffentlicher Cloudquelle nicht im Prompt', async ({ page }) => {
  await setup(page); const sent = [];
  await page.route('**/api/ai/help', async route => { const body = route.request().postDataJSON(); sent.push(body); await route.fulfill({ json: { text: 'Synthetische Antwort', source: body.intent === 'read' ? 'sources' : 'model', model: 'synthetic-model', sources: [] } }); });
  await page.goto('/theorie'); await openWorkshopTools(page); const region = page.getByRole('region', { name: 'Theorie lernen', exact: true });
  await region.getByRole('radio', { name: 'Eigene lokale Unterlagen', exact: true }).check();
  const question = region.getByRole('textbox', { name: /Deine Frage oder Rückfrage/ }); await question.fill('SYNTHETIC-PRIVATE-DERIVED');
  await expect(region.getByRole('button', { name: 'Frage erklären', exact: true })).toBeDisabled();
  await region.getByRole('button', { name: 'Fundstellen lesen', exact: true }).click();
  await expect.poll(() => sent.length).toBe(1); expect(sent[0].provider).toBe('none'); expect(sent[0].useMaterial).toBe(true);
  await region.getByRole('radio', { name: 'App-Lerninhalte', exact: true }).check(); await expect(question).toHaveValue('');
  await expect(region.getByLabel('Theorieantwort')).toHaveCount(0);
  await question.fill('Was ist DNS?'); await region.getByRole('button', { name: 'Frage erklären', exact: true }).click();
  await expect.poll(() => sent.length).toBe(2); expect(sent[1].provider).toBe('chatgpt'); expect(sent[1].useMaterial).toBe(false); expect(JSON.stringify(sent[1])).not.toContain('SYNTHETIC-PRIVATE-DERIVED');
});
test('ChatGPT-Werkstatt sperrt private Materialien und sendet Code erst nach neuer Freigabe', async ({ page }) => {
  await setup(page); const sent = [];
  await page.route('**/api/ai/help', async route => { sent.push(route.request().postDataJSON()); await route.fulfill({ json: { text: 'Synthetischer Hinweis', source: 'model', model: 'synthetic-model', durationMs: 1 } }); });
  await page.goto('/frontendkurs'); await openWorkshopTools(page); const region = page.getByRole('region', { name: 'ChatGPT-Lernbegleitung', exact: true });
  await expect(region.getByRole('checkbox', { name: /Eigene lokale Unterlagen/ })).toBeDisabled();
  await region.getByRole('button', { name: 'Kleinen Hinweis anfordern', exact: true }).click();
  await expect.poll(() => sent.length).toBe(1); expect(sent[0].context.files).toEqual([]); expect(sent[0].provider).toBe('chatgpt'); expect(sent[0].useMaterial).toBe(false);
});
test('Anmeldung ist ausdrücklich, abbrechbar und Auswahl ohne KI wird gespeichert', async ({ page }) => {
  await setup(page); let loginState = 'idle', starts = 0, cancels = 0;
  await page.context().route('https://auth.openai.com/**', route => route.fulfill({ contentType: 'text/plain', body: 'Nur synthetischer Anmeldebildschirm.' }));
  await page.route('**/api/ai/chatgpt/status', route => route.fulfill({ json: { connected: false, planEnabled: false, accounts: [], activeId: null, loginState, revision: 'synthetic' } }));
  await page.route('**/api/ai/chatgpt/signin', route => { starts++; loginState = 'pending'; return route.fulfill({ json: { authorizeUrl: 'https://auth.openai.com/api/accounts/authorize?state=synthetic' } }); });
  await page.route('**/api/ai/chatgpt/cancel', route => { cancels++; loginState = 'idle'; return route.fulfill({ json: { cancelled: true } }); });
  await page.goto('/einstellungen'); await openWorkshopTools(page); expect(starts).toBe(0);
  await page.getByRole('button', { name: 'Continue with ChatGPT', exact: true }).click();
  await expect(page.getByText('Anmeldung im Browser abschließen …', { exact: true })).toBeVisible(); expect(starts).toBe(1);
  await page.getByRole('button', { name: 'Anmeldung abbrechen', exact: true }).click(); await expect.poll(() => cancels).toBe(1);
  await page.getByRole('combobox', { name: 'KI-Anbieter', exact: true }).selectOption('none');
  await expect(page.getByText(/KI ist ausgeschaltet/)).toBeVisible();
  const value = await page.evaluate(() => JSON.parse(localStorage.getItem('azubiprep.ai.settings.v1'))); expect(value.provider).toBe('none'); expect(JSON.stringify(value)).not.toMatch(/access_token|refresh_token|id_token/);
  await page.setViewportSize({ width: 390, height: 844 }); expect(await page.evaluate(() => [...document.querySelectorAll('section.ki *')].filter(node => node.getBoundingClientRect().right > window.innerWidth + 1).map(node => ({ tag: node.tagName, className: node.className, right: node.getBoundingClientRect().right })))).toEqual([]);
});
test('Dropdowns haben in hellem und dunklem Design lesbare Optionsfarben ohne Hover', async ({ page }) => {
  await setup(page);
  await page.route('**/api/ai/status*', route => route.fulfill({ json: { state: 'ready', models: [{ name: 'synthetic-model', label: 'Synthetisches Modell' }], defaultModel: 'synthetic-model' } }));
  await page.goto('/einstellungen'); await openWorkshopTools(page); await page.getByRole('button', { name: 'ChatGPT-Verbindung prüfen', exact: true }).click();
  await expect(page.getByRole('combobox', { name: 'ChatGPT-Modell', exact: true })).toBeVisible();
  for (const target of ['/einstellungen', '/theorie']) {
    if (!page.url().endsWith(target)) await page.goto(target); await openWorkshopTools(page);
    for (const theme of ['light', 'dark']) {
      await page.evaluate(value => document.documentElement.setAttribute('data-theme', value), theme); await page.mouse.move(0, 0);
      const styles = await page.evaluate(() => [...document.querySelectorAll('select, select option, select optgroup')].map(node => { const css = getComputedStyle(node); return { color: css.color, background: css.backgroundColor }; }));
      expect(styles.length).toBeGreaterThan(2);
      const luminance = value => { const channels = value.match(/[\d.]+/g).slice(0, 3).map(Number).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4); return channels[0] * .2126 + channels[1] * .7152 + channels[2] * .0722; };
      for (const value of styles) { expect(value.background).not.toBe('rgba(0, 0, 0, 0)'); const a = luminance(value.color), b = luminance(value.background); expect((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toBeGreaterThanOrEqual(4.5); }
    }
  }
});
