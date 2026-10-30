# Brief CONTENT-232: Lernfelder und vollständige Datenbankspiegelung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

Fragespezifische Lernfelder in PostgreSQL erhalten und alle 7000 geprüften
CSV-Fragen einschließlich 26 Modulen und vier Fachrichtungen spiegeln.
Anschließend sämtliche Inhaltsfelder und den tatsächlichen Ladepfad prüfen.

## Betroffene Dateien

- `backend/db/schema.sql`
- `backend/src/content.js`
- `backend/src/routes/content-admin.routes.js`
- `backend/scripts/migrate-content-to-db.mjs`
- `backend/scripts/export-content-to-csv.mjs`
- `backend/test/content.lernfeld.test.js`
- `docs/agent-briefs/CONTENT-232-db-lernfelder-spiegelung.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`
- `docs/PROJEKTSTATUS.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Ausgangslage und Umsetzung

Lesender Abgleich: DB 1627 Fragen/21 Module/4 Fachrichtungen; 5373 Fragen
und fünf Module fehlen. Vorhandene Basisinhalte exakt gleich. questions
hat keine lernfeld-Spalte; 210 bestehende effektive Zuordnungen weichen ab.
Expliziter Auftrag zur Ergänzung und Synchronisation liegt vor.

Leerer Frage-Lernfeldwert bedeutet weiterhin Rückfall auf das Modul.
Import erhält Reviewmetadaten vorhandener Fragen und läuft atomar über
einen Client/eine Transaktion einschließlich additiver Schemaergänzung.
Kein Löschen zusätzlicher Datensätze oder Ändern von Nutzer-/Lernständen.
Export bewahrt Modul-Lernfelder und optionale Frage-Lernfeldspalten.
Bestehender Autoren-Historiensnapshot erhält das Frage-Lernfeld ebenfalls.
Keine CSV-Inhaltsänderung, Installation, Builds, Commits oder Pushes.

## Abnahmekriterien

- [x] Additive, wiederholbare Schemaergänzung und konsistenter Import/Ladepfad.
- [x] Export-/Reimport-Rundlauf erhält alle Lernfelder und Inhaltswerte.
- [x] Tatsächliche DB: exakt 7000 Fragen/26 Module/4 Fachrichtungen.
- [x] Vollvergleich aller IDs und Inhaltsfelder ohne Abweichung.
- [x] Effektive Lernfelder aller 7000 Fragen entsprechen dem CSV-Ladepfad.
- [x] Reviewmetadaten vorhandener Fragen und CSV-Dateibytes erhalten.
- [x] Gezielter Regressionstest, Content-Validator, Diff- und Archivcheck grün.
- [x] Frischer unabhängiger Code- und Ergebnisreview bestanden.

## Ergebnis

Code implementiert und unabhängig von content232_review ohne blockierende
Findings freigegeben. 17 gezielte Tests, ESLint und Content-Validator grün.
Spaltenprüfung vor ALTER berücksichtigt die tatsächliche Tabellenauflösung
über to_regclass, damit reguläre App-Imports nach dem Schema-Upgrade ohne
Eigentümerrechte laufen können.

Die zwei additiven Spalten wurden als Tabellen-Eigentümer angelegt und
anschließend überprüft. Import erfolgreich: 7000 Fragen, 26 Module,
vier Fachrichtungen. Vollvergleich sämtlicher 16 Fragenfelder einschließlich
quelldatei/lernfeld, sechs Modulfelder und drei Fachrichtungsfelder ohne
fehlende, zusätzliche oder abweichende Datensätze. Tatsächlicher DB-Ladepfad:
7000 Fragen, keine Warnungen, alle effektiven Lernfelder korrekt; 1335
explizite Fragezuordnungen. Alle Fragen tragen den Status geprueft.

Export in ein isoliertes temporäres Inhaltsverzeichnis semantisch vollständig
identisch. Reimport dieses Exports erfolgreich; Nutzinhalte und sämtliche
Reviewmetadaten identisch, abgesehen von den vorgesehenen Importzeitstempeln.
SHA256 aller 28 Original-CSV-Dateien unverändert gegenüber der Baseline.
Reviewmetadaten aller 1627 Bestandsfragen unverändert. Neun Historienzeilen
unverändert, zusätzlich jeweils leere neue Lernfeldspalte.

Spätfehler-Rollback separat nachgewiesen: ungültige Schwierigkeit in der
letzten WISO-Zeile eines isolierten Testkatalogs führte nach vorherigen
Upserts zum Constraintfehler. Anschließende Hashes sämtlicher vorhandener
Fragen, Module, Fachrichtungen und Historienzeilen exakt wie vor dem Versuch.
Erst danach erfolgreichen Originalimport und Rundlauf ausgeführt.

Frischer content232_review gab Code und tatsächliche Ergebnisse ohne Findings
frei und bestätigte unabhängig lesend den vollständigen DB-/Exportvergleich
und den Ladepfad samt Lernfeldern. Byte-/Metadaten-/Historienerhaltung und
Rollback stammen aus den Nachweisen des ausführenden Agenten, nicht aus
einer Wiederholung durch den Reviewer. 17 Tests, ESLint und Content-Validator
grün. Diff- und Archivcheck nach Eintragung erneut ausführen.
Kein Build, Commit oder Push; keine Nutzer-/Lernstandänderungen.
