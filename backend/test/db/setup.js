// Sicherheits-Sperre für die DB-Integrationstests: läuft VOR jedem Test in
// test/db/ (siehe vitest.db.config.js, setupFiles).
//
// Diese Tests legen echte Nutzer/Fragen in der per DATABASE_URL
// konfigurierten Datenbank an. Ein versehentlicher Lauf gegen eine echte
// Datenbank (z. B. weil lokal eine .env mit der echten DATABASE_URL
// existiert) wäre schädlich. Deshalb: ohne das explizite Flag
// ALLOW_DB_TESTS=1 bricht der gesamte Lauf sofort ab, bevor irgendein
// Test etwas in die DB schreibt.
//
// Gedacht für eine Wegwerf-Datenbank (z. B. der Postgres-Service-
// Container in CI) – niemals gegen eine Datenbank mit echten Nutzerdaten
// setzen.
if (process.env.ALLOW_DB_TESTS !== '1') {
  throw new Error(
    'DB-Integrationstests abgebrochen: ALLOW_DB_TESTS=1 ist nicht gesetzt. ' +
      'Diese Tests schreiben echte Zeilen in die per DATABASE_URL konfigurierte ' +
      'Datenbank – nur gegen eine Wegwerf-/Test-Datenbank laufen lassen, niemals ' +
      'gegen eine Datenbank mit echten Nutzerdaten.',
  );
}
if (!process.env.DATABASE_URL) {
  throw new Error('DB-Integrationstests abgebrochen: DATABASE_URL ist nicht gesetzt.');
}
process.env.JWT_SECRET ??= 'test-only-secret-nicht-fuer-produktion';
