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

### Stufe 4: Browser-Tests
- [x] Eigenes Verzeichnis `e2e/` (Playwright, `@playwright/test`), bewusst
      nicht in `frontend/` – testet Frontend UND Backend gemeinsam als
      eine laufende App, gehört organisatorisch zu keinem der beiden.
- [x] `e2e/playwright.config.js`: `webServer` baut das Frontend einmal
      (`npm run build`) und startet das Backend im Produktionsmodus
      (liefert `dist/` mit aus derselben Origin, kein Dev-Proxy nötig),
      wartet auf `/api/health`. Bewusst DB-frei (kein `DATABASE_URL`) –
      deckt sich mit der MVP-Architekturentscheidung.
- [x] `e2e/tests/pruefung.spec.js`: Konfigurationsseite lädt, Prüfung
      starten → Lauf-Seite → "Vorzeitig abgeben" → Ergebnisseite mit
      Score. Bewusst über den Vorzeitig-abgeben-Button statt durch alle
      Fragen zu klicken, damit der Test unabhängig von der (zufällig
      gemischten) Fragenzahl bleibt.
- [x] `e2e/tests/quiz.spec.js`: eine Quizfrage (Modul WISO) beantworten,
      Feedback erscheint, "Nächste Frage"/"Quiz beenden" ist sichtbar.
      Behandelt sowohl Auswahlfragen (SC/MC) als auch Freitext (FT), da
      welcher Fragetyp zuerst gezogen wird nicht vorhersehbar ist –
      geprüft wird bewusst nur "kommt Feedback", nicht "war die Antwort
      richtig" (das ist bereits durch `backend/test/answer.test.js`
      abgedeckt).
- [x] **Bewusst zurückgestellt:** Login/Sync- und Autorenrechte-Flows über
      die UI. Begründung: die sicherheitskritischen Teile davon
      (401/403/Rollenprüfung, Registrierung/Login-Logik) sind bereits über
      `backend/test/db/api.auth-admin.test.js` (Stufe 3) auf API-Ebene
      abgedeckt – ein zusätzlicher kompletter Browser-Login-Flow
      (Landing-Page/`KontoFormular`-Komponente, wieder mit Postgres-Service
      in CI) hätte den Aufwand deutlich erhöht, ohne dass die eigentliche
      Sicherheitslogik nochmal neu geprüft würde. Bei Bedarf als eigener
      Folge-Task nachholbar.
- [x] CI-Workflow: neuer Job `e2e-tests` (installiert Backend-, Frontend-
      und E2E-Abhängigkeiten, installiert Chromium via
      `playwright install --with-deps chromium`, führt `npm test` in
      `e2e/` aus, lädt den Playwright-Report als Artefakt hoch, falls ein
      Test fehlschlägt).
- [x] `.gitignore` um `e2e/playwright-report/` und `e2e/test-results/`
      ergänzt (erzeugte Testausgaben, nicht versionieren).
- [x] **Bug gefunden und behoben (Svens erste beiden lokalen Läufe):** beide
      Tests schlugen mit "Test timeout exceeded" fehl, zunächst wegen des
      Begrüßungs-Popups ("Willkommen zurück",
      `frontend/src/components/WillkommenModal.jsx`, Flag pro Browser-
      *Sitzung* in `sessionStorage` – bei jedem frischen Playwright-Kontext
      leer, das Popup kam also bei jedem Test), nach einem ersten Fix
      (Wegklicken nach `goto`) dann wegen der App-Tour "Kurze Führung"
      (`frontend/src/components/AppTour.jsx`), die automatisch startet,
      sobald das Begrüßungs-Popup weg ist (Flag *dauerhaft* in
      `localStorage`) – per Zeitverzögerung (Polling alle 400ms) mitten im
      Testablauf. Beide Male kein Bug im Produktcode, sondern eine Lücke in
      den Tests. Endgültiger Fix: `e2e/tests/helpers.js`
      (`unterdrueckeOnboardingPopups`) setzt beide Flags direkt per
      `page.addInitScript(...)`, bevor die Seite überhaupt lädt – robuster
      als nachträgliches Wegklicken, weil kein Timing-Wettlauf mit dem
      Tour-Polling mehr besteht. Aufgerufen in `test.beforeEach` in beiden
      Spec-Dateien. Kein Produktcode geändert.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Stufe 1: `.github/workflows/ci.yml` existiert, Syntax valide (YAML),
      referenziert nur tatsächlich vorhandene npm-Skripte.
- [ ] Stufe 1: Workflow setzt kein `DATABASE_URL`, läuft also im
      Fallback-Modus (entspricht dem MVP-Betrieb ohne DB).
- [ ] Stufe 1: Nach Push sichtbar grün auf GitHub (von Sven bestätigt,
      da diese Sitzung nicht direkt auf GitHub pushen kann).
- [x] Stufe 4: `e2e/playwright.config.js` Syntax valide, `npm test` in
      `e2e/` läuft bei Sven lokal grün. **Von Sven bestätigt (2026-09-18,
      nach zwei Fixes s. u.):** `cd e2e && npm test` → **3/3 Tests
      bestanden** (Konfigurationsseite lädt, Prüfung starten + vorzeitig
      abgeben, Quizfrage beantworten), Laufzeit 3.6s.
      **Zwischenzeitlich gefundene Bugs (in den Tests, nicht im
      Produktcode – behoben):** die ersten beiden Läufe schlugen mit
      "Test timeout exceeded" fehl, weil zwei Onboarding-Popups
      (Begrüßungs-Popup `WillkommenModal.jsx`, danach die App-Tour
      `AppTour.jsx`) in einem frischen Playwright-Browser-Kontext immer
      erscheinen und als Modal-Overlay alle Klicks blockierten – in
      echten Sitzungen kaum spürbar, in den Tests aber nicht mitgedacht.
      Fix: `e2e/tests/helpers.js#unterdrueckeOnboardingPopups` setzt die
      Anzeige-Flags beider Popups direkt per `page.addInitScript(...)`,
      bevor die Seite lädt (aufgerufen in `test.beforeEach`).
- [ ] Stufe 4: CI-Job `e2e-tests` läuft auf GitHub grün – erster Lauf
      (2026-09-18, Commit 29c261b) war **rot**: `quiz.spec.js` lief in
      5s Standard-`expect`-Timeout gegen das Feedback-Element, das auf dem
      geteilten GitHub-Actions-Runner unter Last knapp über 5s brauchte
      (die drei anderen Jobs `backend-checks`, `backend-db-tests`,
      `frontend-build` liefen bereits grün). Fix: `expect: { timeout:
      15_000 }` in `e2e/playwright.config.js` ergänzt. Noch zu bestätigen,
      ob der nächste Push jetzt auch `e2e-tests` grün zeigt (diese Sitzung
      kann nicht direkt auf GitHub pushen/Actions einsehen).
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
      wird. **Nach dem Fix von Sven bestätigt (2026-09-18):** `npm test` →
      4 Testdateien, **61/61 Tests bestanden**, `test/db/` läuft nicht mehr
      mit.
- [ ] Stufe 3: CI-Job `backend-db-tests` läuft auf GitHub grün (Postgres-
      Service + `npm run test:db`) – noch zu bestätigen, da diese Sitzung
      nicht direkt auf GitHub pushen/Actions einsehen kann.

## Ergebnis (wird beim Abschluss ausgefüllt)

Alle vier Stufen umgesetzt: CI für bestehende Checks, Vitest +
Backend-Logiktests, API-Integrationstests (DB-frei über `npm test` plus
DB-abhängig über den separaten, per `ALLOW_DB_TESTS=1` gesperrten `npm
run test:db` gegen einen Postgres-Service-Container in CI) und Playwright-
Browser-Tests für die zwei Kernwege Prüfungssimulation und Quiz (DB-frei,
eigenes `e2e/`-Verzeichnis). Login/Sync- und Autorenrechte-Flows über die
UI bewusst nicht zusätzlich als Browser-Test nachgebaut, da die
sicherheitskritische Logik bereits auf API-Ebene (Stufe 3) abgedeckt ist.

Von Sven lokal bestätigt: Stufe 2 (45/45 Tests grün), Stufe 3 DB-freier
Teil (61/61 Tests grün, inkl. Fund und Fix eines Include-Musters-Bugs in
`vitest.config.js`). Noch offen: Svens lokale Bestätigung von Stufe 4
sowie der grüne CI-Lauf auf GitHub für alle vier Jobs (`backend-checks`,
`backend-db-tests`, `frontend-build`, `e2e-tests`). Brief bleibt bis
dahin `Status: offen`.
