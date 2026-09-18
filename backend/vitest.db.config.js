// Eigene, separate Vitest-Konfiguration NUR für die DB-abhängigen
// Integrationstests (backend/test/db/). Bewusst getrennt von
// vitest.config.js/npm test: die Standard-Testsuite darf niemals eine
// echte Datenbank berühren (Gefahr, versehentlich gegen Svens echte
// lokale .env-Datenbank zu laufen). Dieser Lauf wird nur explizit über
// "npm run test:db" gestartet und verlangt zusätzlich ALLOW_DB_TESTS=1
// (siehe test/db/setup.js) – gedacht für eine Wegwerf-/Test-Datenbank,
// z. B. den Postgres-Service-Container in .github/workflows/ci.yml.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/db/setup.js'],
    include: ['test/db/**/*.test.js'],
  },
});
