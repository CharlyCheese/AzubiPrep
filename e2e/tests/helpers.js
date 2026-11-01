// Gemeinsamer Helfer für alle E2E-Tests: unterdrückt die beiden
// Onboarding-Popups, die in einem frischen Browser-Kontext sonst jedes Mal
// erscheinen und als Modal-Overlay alle Klicks auf der Seite dahinter
// blockieren würden:
//
//  - Begrüßungs-Popup "Willkommen zurück" (WillkommenModal.jsx) – Flag pro
//    Browser-*Sitzung* in sessionStorage (immer leer bei einem neuen
//    Playwright-Kontext).
//  - App-Tour "Kurze Führung" (AppTour.jsx) – startet automatisch, sobald
//    das Begrüßungs-Popup weg ist (per Polling, siehe dort); Flag
//    *dauerhaft* in localStorage.
//
// In echten Sitzungen sind beide gewollt (Onboarding für neue Nutzer:innen);
// für automatisierte Tests sind sie nur Rauschen, das mit einer Polling-
// Verzögerung an beliebiger Stelle im Testablauf aufpoppen kann. Deshalb
// werden hier direkt die Flags gesetzt, bevor die Seite überhaupt lädt
// (page.addInitScript läuft vor jedem Skript der Seite) – robuster als ein
// nachträgliches Wegklicken, weil kein Timing-Wettlauf mit dem Popup nötig
// ist.
export async function unterdrueckeOnboardingPopups(page) {
  await page.addInitScript(() => {
    try {
      sessionStorage.setItem('azubiprep.begruessung-gezeigt', 'true');
      localStorage.setItem('azubiprep.tour-gezeigt', 'true');
    } catch {
      /* ignore – Storage evtl. blockiert, dann bleiben die Popups sichtbar */
    }
  });
}

// Legacy feature scenarios explicitly open the tool drawers they exercise.
// Default/collapsed and keyboard behavior has its own UI scenarios.
export async function openWorkshopTools(page) {
  if (new URL(page.url()).pathname !== '/frontendkurs') return;
  const panels = page.locator('details[data-pilot-tool]');
  await panels.first().waitFor({ state: 'attached' });
  for (const panel of await panels.all()) {
    if (!await panel.evaluate(element => element.open)) await panel.locator('summary').first().click();
  }
}

// Debugger now has its own page. Follow the real entry point and only open its
// optional drawer when needed (direct visits start with the work area open).
export async function openDebugger(page) {
  if (new URL(page.url()).pathname === '/frontendkurs') {
    await page.getByRole('link', { name: 'Debugger öffnen', exact: true }).click();
  }
  const panel = page.locator('.js-debug-pilot');
  await panel.waitFor({ state: 'attached' });
  if (!await panel.evaluate(node => node.open)) await panel.locator(':scope > summary').click();
}
