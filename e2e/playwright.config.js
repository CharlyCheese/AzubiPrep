// Browser-Tests (OPS-010, Stufe 4) gegen die echte, gebaute App – Backend
// serviert im Produktionsmodus Frontend + API auf derselben Origin (siehe
// README, Abschnitt "Produktions-Build"), damit kein Vite-Dev-Proxy nötig
// ist. Bewusst DB-frei (kein DATABASE_URL): deckt sich mit der
// MVP-Architekturentscheidung, dass die App immer ohne Datenbank
// funktionieren muss (docs/PROJEKTSTATUS.md, Abschnitt 8) – Login/Sync-
// Flows sind bereits über die Backend-Integrationstests abgedeckt
// (backend/test/db/), siehe OPS-010-Brief für die Begründung.
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  // Playwright-Default für "expect(...).toBeVisible()" & Co. ist 5s – lokal
  // (schnelle Maschine, warmer Server) reicht das locker, auf dem geteilten
  // GitHub-Actions-Runner ist die Server-Antwort auf "Antwort prüfen" unter
  // Last aber knapp über 5s gelaufen (CI-Lauf 2026-09-18: quiz.spec.js
  // flackerte genau an dieser Stelle). Kein Bug, nur zu knapp bemessen für
  // eine langsamere Maschine – deshalb hier auf 15s angehoben.
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'retain-on-failure',
  },
  webServer: {
    // Baut das Frontend einmal (dist/) und startet das Backend, das dist/
    // im Produktionsmodus mit ausliefert (siehe backend/src/app.js,
    // "Statische Auslieferung des Produktions-Builds"). Setzt voraus, dass
    // in frontend/ und backend/ vorher schon "npm install" gelaufen ist
    // (in CI ein eigener Schritt, siehe .github/workflows/ci.yml).
    command: 'npm --prefix ../frontend run build && npm --prefix ../backend start',
    url: 'http://127.0.0.1:3001/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
