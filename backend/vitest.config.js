import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup.js'],
    // Bewusst NICHT rekursiv (kein "test/**"): test/db/ enthält die
    // DB-abhängigen Integrationstests, die ausschließlich über den
    // separaten Befehl "npm run test:db" (eigene Config, eigene Sperre in
    // test/db/setup.js) laufen dürfen, niemals über das normale "npm test".
    include: ['test/*.test.js'],
  },
});
