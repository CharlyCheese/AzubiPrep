import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.use({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } });

const module = {
  modul_id: 'FIAE-DB', titel: 'Datenbanken und SQL', beschreibung: 'SQL-Abfragen üben.',
  fachrichtung: 'FIAE', lernfeld: 'LF5', fragenAnzahl: 12,
};
const questions = Array.from({ length: 12 }, (_, index) => ({
  id: `FIAE-DB-T${index}`, modul_id: module.modul_id, fachrichtung: 'FIAE',
  frage: `Welche SQL-Abfrage passt zu Testfall ${index + 1}?`,
  schwierigkeit: 'leicht', typ: 'SC', thema: 'SQL',
  optionen: ['SELECT', 'INSERT'], antwort: 'A',
}));

test.beforeEach(async ({ page }) => {
  await unterdrueckeOnboardingPopups(page);
  await page.route('**/api/module', (route) => route.fulfill({ json: [module] }));
  await page.route('**/api/module/FIAE-DB', (route) => route.fulfill({ json: module }));
  await page.route('**/api/fragen?modulId=FIAE-DB', (route) => route.fulfill({ json: questions }));
});

test('Gefilterter Katalog bleibt nach Modul, Quiz und Rückkehr erhalten', async ({ page }) => {
  await page.goto('/lernen');
  const main = page.getByRole('main');
  await main.getByRole('searchbox', { name: 'Modul suchen' }).fill('SQL');
  await main.getByLabel('Fachrichtung', { exact: true }).selectOption('FIAE');
  await main.getByRole('link', { name: /Datenbanken und SQL/ }).click();
  await main.getByLabel('Anzahl der Fragen im Quiz').selectOption('5');
  await main.getByRole('link', { name: /Quiz starten/ }).click();
  await expect(page).toHaveURL(/quiz\/FIAE-DB\?anzahl=5$/);
  await main.getByRole('link', { name: '← Modul', exact: true }).click();
  await expect(main.getByLabel('Anzahl der Fragen im Quiz')).toHaveValue('5');
  await main.getByRole('link', { name: '← Lernbereich' }).click();
  await expect(main.getByRole('searchbox', { name: 'Modul suchen' })).toHaveValue('SQL');
  await expect(main.getByLabel('Fachrichtung', { exact: true })).toHaveValue('FIAE');
  await expect(main.getByRole('link', { name: /Datenbanken und SQL/ })).toBeVisible();
});

test('Gewählte Suchfrage erscheint trotz abweichendem Quizfilter, Rückweg erhält Trefferseite', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('azubiprep.quizoptionen', JSON.stringify({ schwierigkeit: 'schwer', anzahl: 5 })));
  await page.route('**/api/suche/inhalte?**', (route) => {
    const params = new URL(route.request().url()).searchParams;
    const page = Number(params.get('seite'));
    const pageSize = Number(params.get('limit'));
    const start = (page - 1) * pageSize;
    const results = questions.slice(start, start + pageSize).map(question => ({
      id: question.id, type: 'fragen', title: question.frage, modulId: question.modul_id,
      url: `/quiz/${question.modul_id}?frage=${question.id}`,
    }));
    return route.fulfill({ json: { total: questions.length, page, pageSize, results } });
  });
  await page.goto('/suche');
  const main = page.getByRole('main');
  await main.getByRole('searchbox', { name: 'Suchbegriff' }).fill('SQL');
  await main.getByRole('button', { name: 'Suchen', exact: true }).click();
  await main.getByRole('button', { name: 'Weiter', exact: true }).click();
  await expect(main.getByText('Seite 2 von 2', { exact: true })).toBeVisible();
  const hit = main.getByRole('listitem').first();
  const title = await hit.getByRole('heading').innerText();
  await hit.getByRole('link', { name: 'Diese Frage üben' }).click();
  await expect(main.getByRole('heading', { name: title, exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('azubiprep.quizoptionen')).schwierigkeit)).toBe('schwer');
  await main.getByRole('link', { name: '← Suchergebnisse' }).click();
  await expect(main.getByRole('searchbox')).toHaveValue('SQL');
  await expect(main.getByText('Seite 2 von 2')).toBeVisible();
  await expect(main.getByRole('listitem').first().getByRole('heading')).toHaveText(title);
});
