import { expect, test } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block' });

const questions = ['SC', 'MC', 'FT', 'FT'].map((typ, index) => ({
  id: `SYN-${index}`, typ, frage: `Übungsfrage ${index + 1}`, fachrichtung: 'ALLE',
  thema: 'Test', modulId: 'SYN', schwierigkeit: 'leicht', erklaerung: 'Synthetische Erklärung.',
  optionen: typ === 'FT' ? [] : ['Erste Option', 'Zweite Option', 'Dritte Option'],
  antwort: typ === 'FT' ? 'Beispiel' : 'A',
}));

test.beforeEach(async ({ page }) => {
  await unterdrueckeOnboardingPopups(page);
  await page.route(url => url.pathname === '/api/fragen', route => route.fulfill({ json: questions }));
  await page.route('**/api/module/SYN', route => route.fulfill({ json: { modul_id: 'SYN', titel: 'Übungsmodul', fragenAnzahl: 4 } }));
  await page.route('**/api/ai/**', route => route.fulfill({ json: { state: 'empty', documents: [], models: [] } }));
});

test('Prüfung behält Freitexte bei der jeweiligen Frage und führt per Tastatur zum Verlauf', async ({ page }) => {
  let submitted;
  await page.route('**/api/pruefung/generieren', route => route.fulfill({ json: { fragen: questions, anzahl: 4 } }));
  await page.route('**/api/pruefung/auswerten', route => {
    submitted = route.request().postDataJSON().fragen;
    return route.fulfill({ json: { gesamt: 4, richtig: 1, scoreProzent: 25, bestanden: false, detail: [{ frageId: 'SYN-2', modulId: 'SYN', richtig: true }] } });
  });
  await page.goto('/pruefung');
  await page.getByRole('button', { name: /Prüfung starten/ }).press('Enter');
  const options = page.getByRole('group', { name: /Übungsfrage/ }).getByRole('button');
  await options.first().press('Space');
  await options.nth(1).press('Enter');
  await expect(options.first()).toHaveAttribute('aria-pressed', 'false');
  await expect(options.nth(1)).toHaveAttribute('aria-pressed', 'true');

  const next = page.getByRole('button', { name: 'Weiter →' });
  await next.press('Enter');
  await expect(page.getByRole('heading', { name: 'Übungsfrage 2' })).toBeFocused();
  await options.first().press('Enter');
  await options.nth(2).press('Space');
  await expect(page.getByRole('button', { pressed: true })).toHaveCount(2);
  await next.press('Enter');

  const answer = page.getByRole('textbox', { name: 'Deine Antwort' });
  await answer.fill('Nur die dritte Frage');
  await next.press('Enter');
  await expect(answer).toHaveValue('');
  await page.getByRole('button', { name: /Prüfung abgeben/ }).click();
  await page.getByRole('link', { name: 'Prüfungsverlauf öffnen' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Prüfungsverlauf' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Ansehen/ })).toHaveCount(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('azubiprep.fortschritt'))['SYN-2'].richtig)).toBe(1);
  expect(submitted.slice(2)).toEqual([
    { id: 'SYN-2', antwort: 'Nur die dritte Frage' }, { id: 'SYN-3', antwort: '' },
  ]);
});

test('Kartenfokus folgt bei Tastaturbedienung der sichtbaren Seite bis zum Stapelabschluss', async ({ page }) => {
  await page.goto('/karteikarten');
  await page.getByRole('spinbutton', { name: 'Eigene Anzahl' }).fill('2');
  const front = page.locator('.flashcard-face:not(.flashcard-back)');
  const solution = page.getByRole('heading', { name: 'Lösung' });
  await front.getByRole('button').first().press('Enter');
  await expect(solution).toBeFocused();
  await page.getByRole('button', { name: 'Frage wieder ansehen' }).press('Enter');
  await expect(front.getByRole('heading')).toBeFocused();
  await page.getByRole('button', { name: 'Lösung anzeigen' }).press('Space');
  await expect(solution).toBeFocused();
  await page.getByRole('button', { name: 'Ok', exact: true }).press('Enter');
  await expect(front.getByRole('heading')).toHaveText('Übungsfrage 2');
  await expect(front.getByRole('heading')).toBeFocused();
  await page.keyboard.press('1');
  await expect(solution).toBeFocused();
  await page.getByRole('button', { name: 'Leicht / Gewusst' }).press('Enter');
  await expect(page.getByText(/Stapel für diese Sitzung erledigt/)).toBeFocused();
});

test('Quizoptionen wechseln mit Enter und Leertaste und bleiben ab dem Prüfen gesperrt', async ({ page }) => {
  let release;
  const response = new Promise(resolve => { release = resolve; });
  await page.route('**/api/fragen/SYN-1/pruefen', async route => {
    await response;
    await route.fulfill({ json: { richtig: true, erwartet: 'A', erklaerung: 'Erläuterung zur Übung.' } });
  });
  await page.goto('/quiz/SYN?frage=SYN-1');
  const group = page.getByRole('group', { name: 'Antwortmöglichkeiten' });
  const options = group.getByRole('button');
  await options.first().press('Enter');
  await options.nth(1).press('Space');
  await expect(group.getByRole('button', { pressed: true })).toHaveCount(2);
  try {
    await page.getByRole('button', { name: /Antwort prüfen/ }).press('Enter');
    await expect(options.first()).toBeDisabled();
    await expect(options.nth(2)).toBeDisabled();
  } finally {
    release();
  }
  await expect(page.getByRole('heading', { name: '✓ Richtig!' })).toBeFocused();
  await expect(options.first()).toBeDisabled();
  await page.keyboard.press('3');
  await expect(group.getByRole('button', { pressed: true })).toHaveCount(2);
  await page.getByRole('button', { name: /Nächste Frage/ }).press('Enter');
  await expect(page.locator('.card-appear h2')).toBeFocused();
});
