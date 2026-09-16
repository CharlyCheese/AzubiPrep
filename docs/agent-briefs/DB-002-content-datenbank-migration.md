# Brief DB-002: Content-Datenbank (Fragen/Module) in PostgreSQL, CSV als Fallback & Review-Snapshot

Status: done
Bereich: DB
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Fragen/Module/Fachrichtungen künftig primär in PostgreSQL vorhalten (wie
schon in `docs/10-Architektur.md`, Abschnitt "Migration Backend →
PostgreSQL" als Ausblick vorgesehen), statt sie ausschließlich per Hand in
CSV zu pflegen. Die CSV-Dateien werden dabei **nicht abgeschafft**, sondern
zum automatisch erzeugten Fallback (App läuft weiter ohne DB) und zum
git-versionierten Review-Snapshot. Ziel ist eine Grundlage, auf der
`CONTENT-001` (Autoren-UI) und `OPS-003` (KI-Integration, Freitext-Bewertung,
Interview-Feature) aufbauen können, ohne zweimal an derselben Stelle zu
bauen – und ohne die bestehenden Architektur- und Review-Prinzipien zu
brechen.

**Explizit kein Ziel dieses Briefs:** CONTENT-001 (Autoren-Weboberfläche)
oder OPS-003 (KI-Features) selbst umsetzen. Dieser Brief liefert nur die
Datenbank-Grundlage, auf der beide später aufsetzen.

## Betroffene Dateien (exakte Pfade, bei Umsetzung)

- `backend/db/schema.sql` – neue Tabellen `questions`, `modules`,
  `fachrichtungen`
- `backend/src/content.js` – `loadContent()` um DB-Pfad erweitern
  (Dual-Mode: DB wenn konfiguriert & befüllt, sonst CSV wie bisher)
- `backend/scripts/migrate-content-to-db.mjs` – neu, einmalig/wiederholbar:
  CSV → DB (Upsert nach `id`)
- `backend/scripts/export-content-to-csv.mjs` – neu: DB → CSV (erzeugt
  exakt das heutige Dateiformat, für Fallback + Review-Snapshot)
- `docs/10-Architektur.md` – Ausblick-Abschnitt durch tatsächlichen Stand
  ersetzen
- `docs/12-Rollen-Inhaltsmanagement.md` – Workflow-Beschreibung anpassen
  (Review läuft künftig gegen den CSV-Export, nicht mehr gegen
  handbearbeitete CSV)
- `ORCHESTRATOR.md` – CONTENT-Brief-Regel (Abschnitt 1) um einen Satz
  ergänzen: Reviewer bekommt den CSV-Export als Diff-Grundlage; inhaltlich
  ändert sich an der Regel selbst nichts
- `backend/src/server.js` – `createStore`/`startServer`/`startForElectron`
  async gemacht (Folgeänderung, da `loadContent()` jetzt async ist)
- `backend/src/routes/content.routes.js` – `/admin/reload`-Handler async
  gemacht
- `backend/package.json` – npm-Skripte `migrate-content`/`export-content`
  ergänzt

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/10-Architektur.md`: Architekturziel 2 ("Stateless Backend... kein
  Datenbankbetrieb zwingend") und der bestehende Ausblick-Abschnitt
  "Migration Backend → PostgreSQL" – dieser Brief setzt genau das um, was
  dort skizziert ist ("Content kann weiterhin als CSV importiert oder in
  Tabellen gepflegt werden")
- `docs/19-Datenbank-Login.md`: bestehendes DB-Setup (nur `users`/
  `user_state`), gleiches Prinzip "ohne `DATABASE_URL` bleibt alles wie
  bisher" gilt hier ebenfalls
- `docs/12-Rollen-Inhaltsmanagement.md`: bestehender Git-Review-Workflow für
  CSV (Branch → validate-content.mjs → PR-Review → Merge → Reload) – bleibt
  in der Substanz erhalten, ändert nur die Erzeugungsrichtung
- `ORCHESTRATOR.md` Abschnitt 1: verbindliche unabhängige KI-Review-Pflicht
  für CONTENT-Briefs – bleibt unverändert bestehen, s. u.
- Backlog-Zusammenhang: `CONTENT-001`, `OPS-002`, `OPS-003`, `BE-003`
  (siehe `STATUS.md`)

## Warum diese Reihenfolge/Konstruktion (Entscheidungsbegründung)

- **Architekturprinzip "App läuft ohne DB" bleibt erhalten:** `content.js`
  fällt auf CSV zurück, wenn keine `DATABASE_URL` gesetzt ist oder die
  Content-Tabellen leer sind – identisches Verhalten zu heute, nur dass bei
  konfigurierter DB die DB Vorrang hat.
- **Git-diffbarer Review-Snapshot bleibt erhalten (Sven's Bedenken aus der
  OPS-003-Diskussion):** Die CSV verschwindet nicht, sie wird nur nicht mehr
  von Hand bearbeitet, sondern per Skript aus der DB exportiert und vor
  jedem Release ins Repo committet. Der unabhängige Review-Subagent
  (verbindlich seit `ORCHESTRATOR.md`-Ausnahme vom 2026-09-16) bekommt
  weiterhin genau diese CSV-Zeilen zu sehen – die Review-Regel selbst ändert
  sich inhaltlich nicht, nur die Herkunft der Datei.
- **Repository-Seam bereits vorbereitet:** `docs/10-Architektur.md` nennt
  explizit "Repository-Seam im Frontend... ohne UI-Umbau" als
  Architekturziel 3 – Frontend und restliches Backend merken vom DB-Wechsel
  nichts, weil `loadContent()` weiterhin dasselbe Map-Format zurückgibt.
- **`review_status`-Spalte statt Freitext-Notiz:** Aktuell steht in
  `STATUS.md` nur ein Prosa-Hinweis ("1123 Fragen noch offen"). Mit einer
  Spalte pro Frage (`ungeprueft` / `geprueft` / `gemeldet` / `korrigiert`)
  wird OPS-002 bei weiter wachsendem Bestand tatsächlich handhabbar – das
  war exakt der in `CONTENT-001` schon notierte Wunsch ("idealerweise mit
  Review-Status pro Frage").
- **`BE-003` (In-App-Feedback "Frage melden") bekommt ein echtes Ziel:**
  Eine Meldung setzt `review_status = 'gemeldet'` auf der betroffenen Zeile
  statt nirgendwo strukturiert zu landen.
- **OPS-003 baut auf derselben Tabelle auf, kein zweiter Content-Store:**
  Freitext-Bewertung per KI und das geplante Interview-Feature brauchen
  Embeddings/Retrieval über den Fragenbestand – sitzt später als zusätzliche
  Spalte (`embedding vector(...)`, pgvector) auf genau dieser Tabelle. Diese
  Spalte wird **in diesem Brief bewusst noch nicht angelegt** (OPS-003 ist
  niedrig priorisiert, Details laut `STATUS.md` "bei Bearbeitung erneut
  besprechen") – nur das Schema wird so entworfen, dass sie sich später ohne
  Datenmigration ergänzen lässt.

## Umsetzungsschritte (Checkliste)

- [x] Schema entworfen: `questions` (14 heutige CSV-Spalten +
      `review_status`, `geprueft_am`, `geprueft_von`), `modules`,
      `fachrichtungen` – als Erweiterung von `backend/db/schema.sql`
- [x] `backend/scripts/migrate-content-to-db.mjs`: liest über die
      bestehende `csv.js`-Logik, schreibt idempotent (Upsert nach `id`) in
      die DB; mehrfach gefahrlos ausführbar
- [x] `content.js`: `loadContent()` um DB-Zweig erweitert (gleiche
      Rückgabestruktur wie zuvor, zusätzliches Feld `quelle`: `'db'`/`'csv'`
      für Diagnose); Fallback auf CSV bleibt Default-Pfad, wenn keine DB
      konfiguriert ist, die Tabellen leer sind, oder die DB-Abfrage
      fehlschlägt (try/catch, kein Absturz)
- [x] `backend/scripts/export-content-to-csv.mjs`: DB → CSV im exakt
      heutigen Dateiformat (Spaltenreihenfolge, Encoding, Trennzeichen)
- [x] Test: App mit `DATABASE_URL` UND ohne `DATABASE_URL` durchgespielt –
      identisches Verhalten (gleiche Fragenanzahl, gleiche Modul-/
      Fachrichtungs-Auswertung über `fragenAnzahlFachrichtung`/
      `moduleFuerFachrichtung`)
- [x] Test: Migrationsskript zweimal hintereinander laufen lassen → exakt
      1623 Zeilen nach beiden Läufen, keine Duplikate (Idempotenz bestätigt)
- [x] Test: Export-Skript laufen lassen → Diff gegen die aktuellen
      `content/*.csv`-Dateien ist nach Sortierung/CRLF-Normalisierung
      inhaltlich leer (siehe Ergebnis unten zu den Zeilenumbrüchen)
- [x] `docs/10-Architektur.md` und `docs/12-Rollen-Inhaltsmanagement.md`
      aktualisiert (Ausblick → tatsächlicher Stand)
- [x] `ORCHESTRATOR.md` Abschnitt 1 um den Satz zur CSV-Export-Quelle
      ergänzt
- [x] `review_status` beim initialen Import: abweichend vom ursprünglichen
      Plan (500 geprüft / 1123 ungeprüft) auf **alle 1623 Fragen als
      `geprueft`** gesetzt – zwischen Brief-Erstellung und Umsetzung wurde
      der vollständige OPS-002-Review der 1123 CONTENT-002-Fragen
      abgeschlossen (siehe `OPS-002-ki-fachreview-methodik.md`), der
      gesamte Bestand ist also tatsächlich geprüft

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] App startet und funktioniert vollständig identisch, ob `DATABASE_URL`
      gesetzt ist oder nicht (manueller Vergleichstest, inkl. Fall "DB
      konfiguriert, aber Tabellen/Schema fehlen" → sauberer Fallback statt
      Absturz)
- [x] Migrationsskript ist idempotent (zweimal laufen lassen = gleiches
      Ergebnis, keine Fehler)
- [x] Export-Skript erzeugt CSV, die inhaltlich (nicht byte-identisch,
      siehe Ergebnis) dem heutigen Format entspricht und von der
      bestehenden `loadContent()`-CSV-Validierung ohne neue Warnungen
      akzeptiert wird
- [x] Keine bestehende Funktionalität (Quiz, Karteikarten, Prüfungssimulation,
      Suche, `/api/admin/reload`) verändert sich aus Nutzersicht
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abhängigkeiten / Reihenfolge-Empfehlung

1. **Zuerst abschließen, unabhängig von diesem Brief:** der laufende
   OPS-002-Review der 1123 aus `CONTENT-002` neu importierten Fragen –
   mit dem heutigen CSV-Workflow, blockiert nicht durch DB-002.
2. **Dann DB-002 umsetzen** – der Review-Stand aus Schritt 1 fließt direkt
   als initialer `review_status` in die Migration ein, statt später
   nachgepflegt werden zu müssen.
3. **Danach CONTENT-001** (Autoren-UI) – baut direkt auf der
   `questions`-Tabelle und der `review_status`-Spalte auf, keine
   Doppelarbeit.
4. **OPS-003** (KI-Integration) bleibt eigenständig priorisierbar, profitiert
   aber von derselben Tabelle, sobald es dran ist (Embedding-Spalte als
   spätere, nicht-brechende Erweiterung).

Diese Reihenfolge ist eine Empfehlung, kein Zwang – die Priorität in
`STATUS.md` bleibt bei Sven.

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant, mit zwei Anpassungen gegenüber dem ursprünglichen
Plan (beide oben in der Checkliste vermerkt): `review_status` startet für
den gesamten Bestand auf `geprueft` (nicht nur die alten 500), weil der
volle OPS-002-Review zwischenzeitlich abgeschlossen wurde; und `content.js`
fängt DB-Fehler beim Laden jetzt explizit ab (try/catch) und fällt auf CSV
zurück, statt bei einer kurzzeitig nicht erreichbaren DB abzustürzen –
das war im ursprünglichen Plan nicht explizit benannt, ist aber eine
direkte Konsequenz aus Architekturziel 2 ("App läuft immer ohne DB").

**Getestet in dieser Sitzung (lokale PostgreSQL-Testdatenbank in der
Cloud-Sandbox, danach wieder gelöscht):**
- Migration: 1623 Fragen, 19 Module, 4 Fachrichtungen migriert; zweiter
  Lauf → weiterhin exakt 1623 Zeilen, keine Duplikate (Idempotenz bestätigt)
- Laden aus DB: `quelle: 'db'`, 1623 Fragen, 0 Warnungen, `fragenAnzahl
  Fachrichtung('FISI')` und `moduleFuerFachrichtung('FISI')` liefern
  identische Werte wie beim CSV-Laden
- Laden ohne `DATABASE_URL`: `quelle: 'csv'`, 1623 Fragen, 0 Warnungen
  (unverändertes Verhalten)
- Laden mit `DATABASE_URL`, aber Schema/Tabellen fehlen komplett: Fehler
  wird abgefangen, sauberer Fallback auf CSV, 0 Warnungen, keine
  Fehlermeldung an den Aufrufer
- Export: DB → CSV, danach Diff gegen die echten `content/*.csv`-Dateien.
  Nach Sortierung und Entfernen von Zeilenumbrüchen (siehe unten) ist der
  Inhalt **byte-identisch** – keine Datenabweichung

**Bekannte, bewusst in Kauf genommene Abweichung – Zeilenumbrüche:** Die
heutigen `content/*.csv`-Dateien sind uneinheitlich (manche CRLF, manche
LF – vermutlich je nachdem, ob sie zuletzt mit Excel unter Windows oder
per Skript geschrieben wurden). `export-content-to-csv.mjs` schreibt
einheitlich LF (wie `writeCsv()` in `csv.js` es schon immer tut). Das ist
inhaltlich folgenlos (`readCsvFile` verarbeitet beides), reduziert aber
sogar die bisherige Uneinheitlichkeit. Beim ersten `export-content`-Lauf
zeigt Git dadurch einen "Zeilenumbruch geändert"-Diff über mehrere
Dateien – das ist erwartet und kein Datenfehler.

**Nachtrag 2026-09-16 (echter Praxistest durch Sven):** Beim ersten Lauf
auf dem realen Rechner (mit dem echten `pg`-Treiber statt des
Sandbox-Shims) schlug `migrate-content` mit einem Check-Constraint-Fehler
auf `review_status` fehl. Ursache: die Constraint-Werte enthielten den
Umlaut "ü" (`'ungeprüft'`/`'geprüft'`), und beim Übertragen von
`schema.sql` über Notepad/pgAdmin-Copy&Paste wurde "ü" offenbar in einer
anderen Unicode-Normalform gespeichert als in der von Node erzeugten
Zeichenkette – optisch identisch, byte-technisch verschieden, wodurch der
exakte String-Vergleich in der CHECK-Constraint fehlschlug. **Fix:** alle
`review_status`-Werte auf ASCII umgestellt (`ungeprueft`/`geprueft`/
`gemeldet`/`korrigiert`), in `schema.sql`, `migrate-content-to-db.mjs`
und den Doku-Referenzen. Das ist genau der Grund, warum der reale Test
auf Svens Rechner (statt nur der Sandbox-Simulation) wichtig war – dieser
Fehler wäre mit dem Test-Shim nie aufgetreten, da dort keine echte
Unicode-Normalisierung über die Zwischenablage stattfand.

**Wichtiger Hinweis zur Testmethode (Transparenz):** Das npm-Paket `pg`
konnte in dieser Cloud-Sandbox nicht installiert werden (die
Netzwerk-Egress-Einstellungen dieser Umgebung blockieren den
npm-Registry-Zugriff, unabhängig vom Projekt). Alle Tests oben liefen
deshalb über einen lokalen Test-Shim (`node_modules/pg` durch eine
`psql`-Kommandozeilen-Bridge ersetzt, nur für diese Sitzung, danach
wieder gelöscht – nicht Teil der Auslieferung). Der Code selbst
(`content.js`, die beiden Skripte, `db.js`) nutzt exakt dieselbe
`pg.Pool`/`query()`-API wie der bereits produktiv laufende
Login/Sync-Code aus `DB-001`. **Empfehlung an Sven:** Vor dem ersten
produktiven Einsatz einmal `npm run migrate-content` (mit gesetzter
`DATABASE_URL`) auf dem echten Rechner laufen lassen und die
Log-Ausgabe/`npm start`-Konsole ("Quelle: db") als echten Smoke-Test
gegen den echten `pg`-Treiber prüfen – dort ist `pg` bereits installiert
und im Einsatz (DB-001/Login funktioniert ja bereits).

**Datenbank-Setup vorausgesetzt:** Wie bei `DB-001` ist die Nutzung
komplett optional – ohne `DATABASE_URL` läuft alles unverändert über CSV.
Wer die Content-DB nutzen will, führt einmalig `backend/db/schema.sql`
(idempotent, `CREATE TABLE IF NOT EXISTS`) und danach `npm run
migrate-content` aus.

**Nicht umgesetzt (bewusst, siehe Brief-Kontext):** `embedding
vector(...)`-Spalte für OPS-003 – folgt erst, wenn OPS-003 tatsächlich
angegangen wird.
