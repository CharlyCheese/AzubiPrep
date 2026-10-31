import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups, openWorkshopTools } from './helpers.js';

test.use({ serviceWorkers: 'block' });
async function open(page) {
  await unterdrueckeOnboardingPopups(page); await page.goto('/frontendkurs');
  await expect(page.getByRole('combobox', { name: 'Lektion', exact: true })).toBeVisible();
}

test('Mobil: Zusatzwerkzeuge starten kompakt geschlossen, bleiben unter den Übungen und passen ins Fenster', async ({ page }, info) => {
  await page.setViewportSize({ width: 390, height: 844 }); await open(page);
  const panels = page.locator('details[data-pilot-tool]');
  await expect(panels).toHaveCount(3);
  for (const panel of await panels.all()) {
    expect(await panel.evaluate(element => element.open)).toBe(false);
    expect((await panel.locator(':scope > summary').boundingBox()).height).toBeGreaterThanOrEqual(44);
  }
  await expect(page.getByRole('button', { name: 'Nächsten Hinweis zeigen', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Sicherung exportieren (JSON)', exact: true })).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true })).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveCount(0);
  const toolArea = page.getByRole('region', { name: 'Hilfestellung und Projektstand', exact: true });
  const closedHeight = (await toolArea.boundingBox()).height;
  await toolArea.scrollIntoViewIfNeeded();
  expect(closedHeight).toBeLessThan(420);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.screenshot({ path: info.outputPath('werkstatt-mobil-geschlossen.png') });
  await openWorkshopTools(page);
  expect((await toolArea.boundingBox()).height).toBeGreaterThan(closedHeight + 150);
});

test('Hinweise sind mit Enter/Leertaste bedienbar und bleiben nach erneutem Öffnen erhalten', async ({ page }) => {
  await open(page);
  const panel = page.locator('[data-pilot-tool="hints"]');
  await panel.locator(':scope > summary').focus(); await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Nächsten Hinweis zeigen', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Nächsten Hinweis zeigen', exact: true }).click();
  const text = await panel.innerText();
  await panel.locator(':scope > summary').focus(); await page.keyboard.press('Space');
  expect(await panel.evaluate(element => element.open)).toBe(false);
  await panel.locator(':scope > summary').press('Enter');
  expect(await panel.innerText()).toBe(text);
});

test('Rückfrage bleibt beim Einklappen erhalten; Einklappen löst keine KI-Anfrage aus', async ({ page }) => {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(() => localStorage.setItem('azubiprep.ai.settings.v1', JSON.stringify({ version: 2, provider: 'qwen', qwenModel: 'qwen-synthetic:tiny', chatgptModel: '' })));
  let helpRequests = 0;
  await page.route('**/api/ai/**', async route => {
    if (route.request().url().endsWith('/help')) { helpRequests++; await route.fulfill({ json: { text: 'Synthetischer Hinweis.', source: 'model' } }); }
    else if (route.request().url().endsWith('/material/status')) await route.fulfill({ json: { state: 'empty', documents: [], revision: 'empty' } });
    else await route.fulfill({ json: { state: 'ready', models: [{ name: 'qwen-synthetic:tiny' }], defaultModel: 'qwen-synthetic:tiny', localOnly: true } });
  });
  await page.goto('/frontendkurs');
  const panel = page.locator('[data-pilot-tool="ai"]');
  await panel.locator(':scope > summary').click();
  const question = panel.locator('textarea');
  await question.fill('Was bedeutet ein HTML-Element?');
  await panel.locator(':scope > summary').click(); await expect(question).not.toBeVisible();
  await panel.locator(':scope > summary').click(); await expect(question).toHaveValue('Was bedeutet ein HTML-Element?');
  expect(helpRequests).toBe(0);
});

test('Freie JavaScript-Fläche öffnet über kompakte Titelzeile und stoppt beim Schließen', async ({ page }) => {
  await open(page);
  const button = page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true });
  expect((await button.boundingBox()).height).toBeGreaterThanOrEqual(44);
  await button.focus(); await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: 'JavaScript-Code', exact: true }).fill('while(true){}');
  await page.getByRole('button', { name: 'JavaScript ausführen', exact: true }).click();
  await page.getByRole('button', { name: 'JavaScript ausprobieren', exact: true }).click();
  await button.click(); await expect(page.getByRole('button', { name: 'JavaScript stoppen', exact: true })).toBeDisabled();
  await expect(page.getByRole('textbox', { name: 'JavaScript-Code', exact: true })).toHaveValue('while(true){}');
});
