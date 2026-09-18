// Läuft vor allen Testdateien (siehe vitest.config.js, setupFiles).
// Setzt einen Test-JWT_SECRET, BEVOR irgendein Testfile config.js/auth.js
// importiert – config.js liest process.env nur einmal beim ersten Import
// (Modul-Cache), deshalb muss das hier und nicht in einer einzelnen
// Testdatei passieren.
//
// Nur setzen, wenn nicht schon vorhanden (z. B. aus einer echten .env),
// damit lokale Entwickler-Secrets nie überschrieben werden.
process.env.JWT_SECRET ??= 'test-only-secret-nicht-fuer-produktion';
process.env.DATABASE_URL ??= '';
