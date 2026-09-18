// Kernweg 2: eine Quizfrage beantworten und Feedback bekommen. Nutzt das
// gemeinsame Modul WISO (existiert für jede Fachrichtung, viele Fragen).
// Der Test kennt die konkrete Frage/Antwort absichtlich nicht (Fragen
// werden clientseitig zufällig gemischt, siehe Quiz.jsx#starteQuiz) und
// prüft deshalb nur das Verhalten, nicht den Inhalt: Feedback erscheint,
// ganz gleich ob richtig oder falsch beantwortet.
import { test, expect } from '@playwright/test';
import { unterdrueckeOnboardingPopups } from './helpers.js';

test.describe('Quizmodus', () => {
  test.beforeEach(async ({ page }) => {
    await unterdrueckeOnboardingPopups(page);
  });

  test('eine Frage beantworten zeigt Feedback und eine Weiter-Möglichkeit', async ({ page }) => {
    await page.goto('/quiz/WISO');

    // Freitext-Fragen (FT) zeigen ein Textfeld statt Antwortoptionen
    // (siehe FrageKarte.jsx) – da die erste Frage zufällig jeder der drei
    // Typen sein kann, deckt der Test beide Fälle ab.
    const freitext = page.locator('textarea.input');
    const optionen = page.locator('.option-row');
    await expect(freitext.or(optionen.first())).toBeVisible({ timeout: 15_000 });

    if (await freitext.isVisible()) {
      await freitext.fill('Testantwort');
    } else {
      await optionen.first().click();
    }

    await page.getByRole('button', { name: /Antwort prüfen/ }).click();

    // "✓ Richtig!" oder "✗ Leider falsch." – welches davon zutrifft, hängt
    // von der zufällig gezogenen Frage/Antwort ab und ist hier nicht der
    // Punkt; wichtig ist nur, dass überhaupt eine Rückmeldung kommt.
    await expect(page.getByText(/Richtig!|Leider falsch\./)).toBeVisible();
    await expect(page.getByRole('button', { name: /Nächste Frage|Quiz beenden/ })).toBeVisible();
  });
});
