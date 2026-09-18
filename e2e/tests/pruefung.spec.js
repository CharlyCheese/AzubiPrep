// Kernweg 1: Prüfungssimulation konfigurieren, starten und (vorzeitig)
// abgeben – bis zum Ergebnis. Bewusst über "Vorzeitig abgeben" statt durch
// alle Fragen zu klicken: das macht den Test kurz und unabhängig von der
// (zufällig gemischten) Anzahl/Reihenfolge der Fragen, während trotzdem
// der komplette Weg Konfiguration -> Lauf -> Auswertung durchlaufen wird.
import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.describe('Prüfungssimulation', () => {
  test.beforeEach(async ({ page }) => {
    await unterdrueckeOnboardingPopups(page);
  });

  test('Konfigurationsseite lädt', async ({ page }) => {
    await page.goto('/pruefung');
    await expect(page.getByRole('heading', { name: 'Prüfungssimulation' })).toBeVisible();
  });

  test('Prüfung starten und vorzeitig abgeben führt zum Ergebnis', async ({ page }) => {
    await page.goto('/pruefung');

    await page.getByRole('button', { name: /Prüfung starten/ }).click();
    await expect(page).toHaveURL(/\/pruefung\/lauf$/);

    // "Vorzeitig abgeben" ist immer sichtbar (auch ohne beantwortete
    // Fragen, siehe PruefungLauf.jsx) – die Auswertung akzeptiert leere
    // Antworten, sie zählen einfach als falsch.
    await page.getByRole('button', { name: 'Vorzeitig abgeben' }).click();

    await expect(page).toHaveURL(/\/pruefung\/ergebnis$/);
    await expect(page.getByRole('heading', { name: 'Prüfungsergebnis' })).toBeVisible();
  });
});
