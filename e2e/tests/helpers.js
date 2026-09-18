// Gemeinsamer Helfer für alle E2E-Tests: schließt das Begrüßungs-Popup
// ("Willkommen zurück", siehe frontend/src/components/WillkommenModal.jsx),
// das bei jedem frischen Browser-Kontext einmal erscheint (sessionStorage
// ist in einem neuen Playwright-Kontext immer leer) und als Modal-Overlay
// alle Klicks auf der Seite dahinter blockiert. In echten Browsersitzungen
// fällt das kaum auf (ein Klick "Los geht's"), aber ein automatisierter
// Test muss es explizit wegklicken, bevor er mit der eigentlichen Seite
// interagiert.
export async function schliesseWillkommenPopup(page) {
  const dialog = page.getByRole('dialog', { name: /Willkommen zurück/ });
  // Kein toBeVisible()-Assert: das Popup ist nur beim ersten Aufruf pro
  // Kontext da, deshalb hier bewusst tolerant über einen kurzen Timeout
  // prüfen statt den Test scheitern zu lassen, wenn es (zu Recht) fehlt.
  if (await dialog.isVisible({ timeout: 3_000 }).catch(() => false)) {
    await dialog.getByRole('button', { name: "Los geht's" }).click();
    await dialog.waitFor({ state: 'hidden' });
  }
}
