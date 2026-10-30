import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

// Metadaten werden kontrolliert verzögert; der PWA-Cache darf sie nicht ersetzen.
test.use({ serviceWorkers: 'block' });

const testModul = { modul_id: 'FIAE-PRG', fachrichtung: 'FIAE', code: 'PRG', titel: 'Programmierung', lernfeld: 'LF12a', fragenAnzahl: 100 };
const testFrage = (i) => ({ id: `FIAE-PRG-${i}`, modul_id: 'FIAE-PRG', typ: 'SC', frage: `Testfrage ${i}`, schwierigkeit: 'leicht', optionen: ['Ja', 'Nein'], antwort: 'A' });
const statusVon = (page, id = 'FIAE-PRG') => page.evaluate((key) => JSON.parse(localStorage.getItem('azubiprep.game') || '{}').modulStatus?.[key], id);

test.beforeEach(async ({ page }) => {
  await unterdrueckeOnboardingPopups(page);
  await page.addInitScript(() => {
    localStorage.setItem('azubiprep.fortschritt', JSON.stringify(Object.fromEntries(
      Array.from({ length: 20 }, (_, i) => [`FIAE-PRG-${i}`, { modulId: 'FIAE-PRG', letztesErgebnis: true, richtig: 1, falsch: 0 }]),
    )));
    localStorage.setItem('azubiprep.profil', JSON.stringify({ fachrichtung: 'FIAE' }));
  });
  await page.route(/\/api\/module(?:\?.*)?$/, (route) => route.fulfill({ json: [{
    modul_id: 'FIAE-PRG', fachrichtung: 'FIAE', code: 'PRG', titel: 'Programmierung',
    beschreibung: 'Testmodul', lernfeld: 'LF12a', fragenAnzahl: 100,
  }] }));
  await page.route('**/api/fachrichtungen', (route) => route.fulfill({ json: [{ code: 'FIAE', name: 'Anwendungsentwicklung' }] }));
});

test('Lernbereich zeigt 20 von 100 und stuft nicht als beherrscht ein', async ({ page }) => {
  await page.goto('/lernen');
  await page.getByRole('button', { name: /LF12a/ }).click();
  const card = page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Programmierung', exact: true }) }).last();
  await expect(card.getByText('20 von 100 (20 %)', { exact: true })).toBeVisible();
  await expect(card.getByText('in Bearbeitung', { exact: true })).toBeVisible();
  await expect(card.getByText('20 von 100 richtig · 20% des Moduls', { exact: true })).toBeVisible();
});

test('Lernreise führt das teilweise bearbeitete Modul weiterhin als nächste Station', async ({ page }) => {
  await page.goto('/lernreise');
  await expect(page.getByText('0 / 1 Stationen beherrscht', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('20 von 100 (20 %)', { exact: true })).toBeVisible();
  await expect(page.getByText('in Bearbeitung', { exact: true })).toBeVisible();
  await expect(page.getByText(/Nächste Station:/)).toBeVisible();
});

test('Statistik trennt Modulabdeckung von Erfolgsquote der beantworteten Fragen', async ({ page }) => {
  await page.goto('/statistik');
  await expect(page.getByText('20 von 100 Fragen (20 %) · 20% des Moduls richtig', { exact: true })).toBeVisible();
  await expect(page.getByText('100% Erfolgsquote bei den beantworteten Fragen', { exact: true })).toBeVisible();
  await expect(page.getByText('in Arbeit', { exact: true })).toBeVisible();
});

test('Quiz verwendet vollständigen Fragenbestand und korrigiert verspätete Modulmetadaten', async ({ page }) => {
  await page.addInitScript(() => {
    const progress = JSON.parse(localStorage.getItem('azubiprep.fortschritt'));
    progress['FIAE-HW-0'] = { modulId: 'FIAE-HW', letztesErgebnis: true };
    localStorage.setItem('azubiprep.fortschritt', JSON.stringify(progress));
    localStorage.setItem('azubiprep.game', JSON.stringify({ modulStatus: {
      'FIAE-PRG': { gesamt: 20, bearbeitet: true, beherrscht: true },
      'FIAE-HW': { gesamt: 1, bearbeitet: true, beherrscht: true },
    } }));
  });
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route(/\/api\/module(?:\/FIAE-PRG)?$/, async (route) => {
    await gate;
    await route.fulfill({ json: route.request().url().endsWith('/FIAE-PRG') ? testModul : [testModul, { ...testModul, modul_id: 'FIAE-HW' }] });
  });
  await page.route('**/api/fragen?modulId=FIAE-PRG', (route) => route.fulfill({ json: Array.from({ length: 100 }, (_, i) => testFrage(i)) }));
  await page.route('**/api/fragen/*/pruefen', (route) => route.fulfill({ json: { richtig: true, erwartet: 'A', erklaerung: 'Richtig.' } }));
  try {
    await page.goto('/quiz/FIAE-PRG?frage=FIAE-PRG-0', { waitUntil: 'domcontentloaded' });
    await page.locator('.option-row').first().click();
    await page.getByRole('button', { name: /Antwort prüfen/ }).click();
    await expect.poll(async () => (await statusVon(page))?.gesamt).toBe(100);
    await expect.poll(async () => (await statusVon(page))?.beherrscht).toBe(false);
    release();
    await expect.poll(async () => (await statusVon(page, 'FIAE-HW'))?.gesamt).toBe(100);
    await expect.poll(async () => (await statusVon(page, 'FIAE-HW'))?.beherrscht).toBe(false);
  } finally { release(); }
});

test('Prüfungsergebnis berechnet Modulstatus nach verspäteten Metadaten nach', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('azubiprep.fortschritt', JSON.stringify(Object.fromEntries(
    Array.from({ length: 79 }, (_, i) => [`FIAE-PRG-${i}`, { modulId: 'FIAE-PRG', letztesErgebnis: true, richtig: 1 }]),
  ))));
  await page.route('**/api/pruefung/generieren', (route) => route.fulfill({ json: { fragen: [testFrage(79)], anzahl: 1 } }));
  await page.route('**/api/pruefung/auswerten', (route) => route.fulfill({ json: {
    gesamt: 1, richtig: 1, scoreProzent: 100, bestanden: true, proModul: {},
    detail: [{ frageId: 'FIAE-PRG-79', modulId: 'FIAE-PRG', richtig: true }],
  } }));
  await page.goto('/pruefung');
  await page.getByRole('button', { name: /Prüfung starten/ }).click();
  await expect(page).toHaveURL(/\/pruefung\/lauf$/);
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  await page.route(/\/api\/module(?:\?.*)?$/, async (route) => { await gate; await route.fulfill({ json: [testModul] }); });
  try {
    await page.getByRole('button', { name: 'Vorzeitig abgeben' }).click();
    await expect(page.getByRole('heading', { name: 'Prüfungsergebnis' })).toBeVisible();
    await expect.poll(() => page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('azubiprep.fortschritt'))).length)).toBe(80);
    release();
    await expect.poll(async () => (await statusVon(page))?.gesamt).toBe(100);
    await expect.poll(async () => (await statusVon(page))?.beherrscht).toBe(true);
    await expect.poll(async () => (await statusVon(page))?.richtig).toBe(80);
  } finally { release(); }
});
