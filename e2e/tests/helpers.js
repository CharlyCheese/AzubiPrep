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
