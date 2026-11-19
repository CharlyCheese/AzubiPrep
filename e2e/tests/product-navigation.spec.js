import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });

for (const theme of ['light', 'dark']) {
  test(`Mobiles Menü, Fokus, Rückweg und Design in ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await unterdrueckeOnboardingPopups(page);
    await page.goto('/pruefung');
    await expect(page.getByRole('button', { name: /Prüfung starten/ })).toBeInViewport();
    const menu = page.getByRole('button', { name: 'Menü', exact: true });
    await menu.focus(); await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Menü' });
    await expect(dialog.getByRole('link')).toHaveCount(15);
    await expect(dialog.getByRole('link', { name: 'Prüfungssimulation' })).toHaveAttribute('aria-current', 'page');
    const themeSwitch = dialog.getByRole('switch');
    await themeSwitch.click();
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await menu.click();
    await dialog.getByRole('link', { name: 'Notizen' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('heading', { name: 'Lernnotizen' })).toBeVisible();
    await expect(page.locator('main')).toBeFocused();
    await page.goBack();
    await expect(page.getByLabel('Anzahl Fragen')).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', nextTheme);
    await menu.click(); await page.setViewportSize({ width: 1280, height: 800 });
    await expect(dialog).not.toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Hauptnavigation' })).toBeVisible();
  });
}

test('Normaler Start und freiwillige Führung auf einem neuen Gerät', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ohne Konto weiter/ })).toBeInViewport();
  await page.getByRole('button', { name: 'Kurze Führung' }).click();
  const tour = page.getByRole('dialog');
  await expect(tour).toContainText('Kurze Führung (1/5)');
  await tour.getByRole('button', { name: 'Weiter →' }).click();
  await expect(page).toHaveURL(/\/lernreise$/);
  await page.keyboard.press('Escape');
  await expect(tour).not.toBeVisible();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('heading', { name: 'Willkommen bei AzubiPrep' })).toBeVisible();
  await page.goto('/willkommen');
  await page.getByRole('button', { name: /Ohne Konto weiter/ }).click();
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
  await expect(tour).not.toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

for (const signedIn of [false, true]) {
  test(`Wiederstart, Lernstand und direkter Rückweg ${signedIn ? 'mit' : 'ohne'} Konto`, async ({ page }) => {
    await page.route('**/api/benachrichtigungen', route => route.fulfill({ json: { ungelesen: 0 } }));
    await page.goto('/theorie?q=DNS');
    await expect(page.getByRole('heading', { name: 'Theorie & Glossar' })).toBeVisible();
    await page.evaluate(signedIn => {
      localStorage.setItem('azubiprep.landing-gesehen', 'true');
      sessionStorage.setItem('azubiprep.begruessung-gezeigt', 'true');
      localStorage.setItem('azubiprep.profil', JSON.stringify({ fachrichtung: 'FISI', name: 'Testprofil' }));
      localStorage.setItem('azubiprep.fortschritt', JSON.stringify({ MUSTER: { richtig: 1, falsch: 0, letztesErgebnis: true } }));
      if (signedIn) localStorage.setItem('azubiprep.auth', JSON.stringify({ token: 'test-token', user: { rolle: 'azubi', fachrichtung: 'FISI' } }));
    }, signedIn);
    await page.goto('/');
    const welcome = page.getByRole('heading', { name: /Willkommen.*bei AzubiPrep/ });
    await expect(welcome).toBeVisible();
    await page.getByRole('button', { name: signedIn ? 'Zum Dashboard' : /Ohne Konto weiter/ }).click();
    const dashboard = page.getByRole('heading', { name: 'Dashboard', exact: true });
    await expect(dashboard).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByText('Beantwortet', { exact: true }).locator('..').getByRole('definition')).toHaveText('1');
    await expect(page.locator('.lh-header')).toContainText('FISI');
    await page.reload();
    await expect(dashboard).toBeVisible();
    await page.goBack();
    await expect(welcome).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(/\/theorie\?q=DNS$/);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Theorie & Glossar' })).toBeVisible();
    await page.getByRole('navigation', { name: 'Hauptnavigation' }).getByRole('link', { name: 'Dashboard' }).click();
    await expect(dashboard).toBeVisible();
    await page.goto('/');
    await expect(welcome).toBeVisible();
  });
}

test('Tagesplanung öffnet am gewählten Datum und kehrt mit Escape zur Auswahl zurück', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await unterdrueckeOnboardingPopups(page);
  await page.goto('/kalender');
  const date = page.locator('.calendar-grid button[aria-current="date"]');
  await date.focus();
  await page.keyboard.press('Space');
  const plan = page.getByRole('dialog', { name: /Planung/ });
  await expect(plan).toBeVisible();
  const title = plan.getByRole('textbox', { name: 'Geplanter Lerninhalt' });
  await title.fill('DNS wiederholen');
  await title.press('Enter');
  await expect(plan.getByRole('checkbox', { name: 'DNS wiederholen' })).toBeVisible();
  await title.fill('Verworfener Entwurf');
  await page.keyboard.press('Escape');
  await expect(plan).not.toBeVisible();
  await expect(date).toBeFocused();
  await page.locator('.calendar-grid button:not([aria-current])').first().click();
  await expect(title).toHaveValue('');
  await page.reload();
  await date.click();
  await expect(plan.getByRole('checkbox', { name: 'DNS wiederholen' })).toBeVisible();
});
