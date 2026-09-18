# Brief OPS-010: CI-Pipeline + automatisierte Tests einführen

Status: offen
Bereich: OPS
Angelegt: 2026-09-18

## Ziel (1–3 Sätze)

Bisher laufen alle Qualitätschecks (Lint, Content-Validierung,
Sicherheitscheck) nur manuell auf Svens Rechner. Ziel: die bestehenden
Checks bei jedem Push/PR automatisch über GitHub Actions laufen lassen,
danach gezielt Tests für die kritischste Backend-Logik ergänzen (dafür
muss zuerst ein Test-Runner eingeführt werden, aktuell ist keiner
installiert), zuletzt optional wenige Browser-Tests für die Kernwege.
Bewusst in Stufen, damit jede Stufe für sich nutzbar ist und nicht auf
die nächste warten muss.

## Kontext (nur Verweise, keine Dokumentkopien)

- Auslöser: Sven hat das Projekt von ChatGPT bewerten lassen (2026-09-18,
  außerhalb des Repos), Hauptkritikpunkt "fehlende automatisierte Tests/CI"
  wurde gegengeprüft und bestätigt (kein `.github/workflows/`, keine
  Test-Dateien, kein Test-Runner in `backend/package.json` oder
  `frontend/package.json`).
- Bestehende, bereits funktionierende Skripte, die Stufe 1 nur bündelt:
  `backend/scripts/validate-content.mjs`, `backend/scripts/sicherheits-check.mjs`,
  `npm run lint` (Backend, ESLint).

## Umsetzungsschritte (Checkliste)

### Stufe 1: CI für bestehende Checks (dieser Durchlauf)
- [ ] `.github/workflows/ci.yml`: bei Push und Pull Request auf jeden Branch
      – Node 20 aufsetzen, `backend/` und `frontend/` Dependencies installieren,
      Backend-Lint, `validate-content.mjs`, `sicherheits-check.mjs` und
      `frontend` Produktions-Build (`npm run build`) ausführen.
- [ ] Kein `DATABASE_URL` in CI gesetzt – Checks müssen im CSV-/Ohne-DB-Modus
      laufen (deckt sich mit der MVP-Architekturentscheidung, siehe
      `docs/PROJEKTSTATUS.md` Abschnitt 8).
- [ ] Kurzer Hinweis in README (Abschnitt Tech-Stack oder eigener CI-Badge),
      dass CI aktiv ist.

### Stufe 2: Test-Runner + Backend-Logiktests
- [x] Test-Runner eingeführt: Vitest (`backend/vitest.config.js`,
      `backend/test/setup.js` setzt einen Test-`JWT_SECRET`, ohne echte
      lokale `.env`-Werte zu überschreiben).
- [x] `backend/test/answer.test.js`: Antwortauswertung SC/MC/FT
      (richtig/falsch, Case-Insensitivität, MC-Reihenfolge/unvollständige
      Auswahl, FT-Synonyme/Diakritika-Normalisierung).
- [x] `backend/test/exam.test.js`: Prüfungsgenerierung (Fachrichtungs-
      Fehler, Fachrichtung+ALLE-Filterung, Anzahl-Begrenzung 1–200,
      Schwierigkeitsfilter, keine Musterlösung im Rückgabeobjekt) und
      -auswertung (Score-Berechnung, unbekannte IDs werden übersprungen,
      Bestehensgrenze, Gruppierung nach Modul/Typ, Stärken/Schwächen).
- [x] `backend/test/auth.test.js`: `emailGueltig`, `passwortGueltig`,
      Reset-Token-Erzeugung/-Hashing (deterministisch, Ablaufzeit ~24h),
      JWT erstellen/prüfen (inkl. Ablehnung bei Manipulation) und die
      `authPflicht`-Middleware (401 ohne/mit ungültigem Token, `req.userId`
      bei gültigem Token).
- [ ] **Bewusst zurückgestellt:** `autorPflicht`/`adminPflicht` (fragen die
      Rolle live per SQL ab) und die Content-Admin-Routen selbst brauchen
      eine echte oder gemockte Datenbank – das ist inhaltlich näher an
      Stufe 3 (API-Integrationstests) als an isolierten Logik-Tests und
      wird dort mit erledigt, damit nicht zweimal ähnliche Test-Infrastruktur
      aufgebaut wird.
- [x] CI-Workflow (`.github/workflows/ci.yml`) um `npm test` (Backend)
      erweitert, läuft vor dem Sicherheitscheck.
- [ ] Frontend-Logiktests (Stores, Sync-Merge, Gamification) – noch offen,
      eigener Umfang, ggf. eigener Folge-Task.

### Stufe 3: API-Integrationstests
- [x] `backend/test/api.content-exam.test.js` (kein DB nötig, Teil des
      normalen `npm test`): Content-Routen (health, status, module,
      fragen, suche) und Prüfung generieren/auswerten End-to-End über
      HTTP, gegen einen kleinen selbst gebauten Content-Store statt der
      echten CSV-Daten.
- [x] `backend/test/db/api.auth-admin.test.js` (DB nötig, **eigener**
      Testlauf `npm run test:db`, eigene Config `backend/vitest.db.config.js`):
      Registrierung (inkl. Passwort-Validierung, Duplikat-Ablehnung),
      Login (inkl. generischer Fehlermeldung, kein Enumeration-Leck),
      `GET /api/auth/me`, und die eigentliche Rechteprüfung: `GET
      /api/admin/questions` ohne Token → 401, eingeloggt ohne
      autor/admin-Rolle → 403, nach SQL-Rollenvergabe (simuliert eine
      Admin-Aktion, genau wie in der echten App) → 200.
- [x] **Bewusste Sicherheits-Entscheidung:** die DB-Tests laufen NICHT im
      normalen `npm test` mit, sondern nur über den separaten Befehl
      `npm run test:db`, mit eigener Vitest-Config und einer Sperre
      (`test/db/setup.js`, verlangt `ALLOW_DB_TESTS=1`). Grund: `npm test`
      lädt beim Import von `config.js` ganz normal Svens echte lokale
      `.env` (falls vorhanden) – ohne diese Trennung hätte ein
      versehentlicher DB-Testlauf echte Test-Nutzer in seine echte
      Datenbank geschrieben. `npm run test:db` ist nur für eine
      Wegwerf-Datenbank gedacht (der Postgres-Service-Container in CI).
- [x] CI-Workflow: neuer Job `backend-db-tests` mit einem
      `postgres:16`-Service-Container (nur für die Dauer des Jobs, eigene
      Zugangsdaten), spielt `backend/db/schema.sql` ein, setzt
      `DATABASE_URL`/`JWT_SECRET`/`ALLOW_DB_TESTS=1` nur für diesen Job
      und führt `npm run test:db` aus.

### Stufe 4: Browser-Tests (separater Task, erst nach Stufe 2+3)
- [ ] Playwright für 3–5 Kernwege: Quiz abschließen, Prüfung starten,
      Login/Sync (nur falls Test-DB verfügbar), Autorenrechte.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Stufe 1: `.github/workflows/ci.yml` existiert, Syntax valide (YAML),
      referenziert nur tatsächlich vorhandene npm-Skripte.
- [ ] Stufe 1: Workflow setzt kein `DATABASE_URL`, läuft also im
      Fallback-Modus (entspricht dem MVP-Betrieb ohne DB).
- [ ] Stufe 1: Nach Push sichtbar grün auf GitHub (von Sven bestätigt,
      da diese Sitzung nicht direkt auf GitHub pushen kann).
- [ ] Stufe 4 bleibt "offen" in diesem Brief bzw. wandert in einen eigenen
      Folge-Brief, sobald sie angegangen wird.
- [x] Stufe 2: `npm test` läuft bei Sven lokal grün (2026-09-18):
      `cd backend && npm install && npm test` → Vitest 5.0.1, 3 Testdateien,
      **45/45 Tests bestanden** (answer.test.js 15, exam.test.js 13,
      auth.test.js 17), Laufzeit 1.34s.
- [x] Stufe 3: `npm test` (DB-freier Teil, `api.content-exam.test.js`)
      läuft bei Sven lokal grün (2026-09-18, nach Fix s. u.).
      **Zwischenzeitlich gefundener Bug (behoben, nicht datenkritisch):**
      `vitest.config.js` hatte ein rekursives Include-Muster
      (`test/**/*.test.js`), wodurch `npm test` versehentlich auch
      `test/db/api.auth-admin.test.js` mitlief – die dortige
      `ALLOW_DB_TESTS`-Sperre griff nicht, weil dieser Lauf die
      DB-Config/das DB-Setup-File gar nicht verwendet. Folgenlos, weil bei
      Sven lokal kein `DATABASE_URL` gesetzt ist (die DB-Routen existieren
      dann laut `app.js` gar nicht, die Tests scheiterten entsprechend mit
      404/"Datenbank fehlt" statt echte Daten zu schreiben) – hätte aber
      bei gesetztem `DATABASE_URL` seine echte lokale Datenbank getroffen.
      Fix: Include auf `test/*.test.js` (nicht rekursiv) geändert, damit
      der `test/db/`-Unterordner nur noch über `npm run test:db` erreicht
      wird.
- [ ] Stufe 3: CI-Job `backend-db-tests` läuft auf GitHub grün (Postgres-
      Service + `npm run test:db`) – noch zu bestätigen, da diese Sitzung
      nicht direkt auf GitHub pushen/Actions einsehen kann.

## Ergebnis (wird beim Abschluss ausgefüllt)

Stufe 1 (CI für bestehende Checks), Stufe 2 (Vitest + Backend-Logiktests)
und Stufe 3 (API-Integrationstests, DB-frei über den normalen `npm test`
plus DB-abhängig über den separaten, per `ALLOW_DB_TESTS=1` gesperrten
`npm run test:db` gegen einen Postgres-Service-Container in CI)
umgesetzt. Stufe 2 von Sven lokal bestätigt (45/45 Tests grün). Noch
offen: Svens lokale Bestätigung von Stufe 3 (DB-freier Teil), der grüne
CI-Lauf auf GitHub für alle drei Jobs (inkl. dem neuen `backend-db-tests`
mit Postgres-Service), sowie Stufe 4 (Browser-Tests). Brief bleibt bis
dahin `Status: offen`.
