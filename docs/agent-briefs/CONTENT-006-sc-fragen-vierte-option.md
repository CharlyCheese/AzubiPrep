# Brief CONTENT-006: 426 (tatsächlich 1123) SC-Fragen fehlt eine vierte Antwortoption

Status: offen
Bereich: CONTENT
Angelegt: 2026-09-17

## Ziel (1–3 Sätze)

Fund bei `OPS-009` (2026-09-17, `npm run validate` auf Svens Rechner): viele
Single-Choice-Fragen haben nur 3 statt der im Schema (`docs/08-Datenformate.md`)
vorgeschriebenen 4 Antwortoptionen (`option_d` leer). Kein funktionaler Bug
(Frontend filtert leere Optionen automatisch, siehe
`frontend/src/utils/fragen.js` `optionenListe()`), aber `npm run validate`
schlägt deswegen fehl und weicht vom IHK-typischen 4-Optionen-Format ab.
Sven hat sich bewusst gegen eine Lockerung des Validierungs-Schemas
entschieden – stattdessen wird bei allen betroffenen Fragen eine plausible,
eindeutig falsche 4. Option ergänzt.

**Scope-Korrektur (2026-09-17, nach erstem Fix-Durchlauf):** Ursprünglich
anhand von Svens (abgeschnittener) Terminal-Kopie auf 426 Fragen in
`HARDWARE.csv`/`WISO.csv`/`PM.csv` geschätzt. Der vollständige
`npm run validate`-Lauf zeigt: tatsächlich betrifft es **1123 Fragen** über
12 Dateien – vermutlich alle SC-Fragen, die ursprünglich nur mit 3 Optionen
angelegt wurden (auffällig identisch mit der Fragenanzahl aus `OPS-002`).

## Betroffene Dateien (exakte Pfade)

- `content/questions/HARDWARE.csv` (219 Fragen) – ✅ erledigt
- `content/questions/WISO.csv` (208 Fragen) – ✅ erledigt
- `content/questions/PM.csv` (1 Frage) – ✅ erledigt
- `content/questions/FISI-NET.csv` (210 Fragen) – offen
- `content/questions/FISI-SEC.csv` (204 Fragen) – offen
- `content/questions/DPA-DB.csv` (91 Fragen) – offen
- `content/questions/FIAE-DB.csv` (91 Fragen) – offen
- `content/questions/FIAE-PRG.csv` (47 Fragen) – offen
- `content/questions/FIAE-SWE.csv` (22 Fragen) – offen
- `content/questions/FIAE-TST.csv` (14 Fragen) – offen
- `content/questions/FISI-BET.csv` (10 Fragen) – offen
- `content/questions/DVK-CLD.csv` (6 Fragen) – offen

## Kontext (nur Verweise, keine Dokumentkopien)

- [OPS-009-Brief](OPS-009-ops005-nachverifizierung.md) – Fund-Kontext
- `backend/scripts/validate-content.mjs` – Validierungslogik (SC-Fragen
  brauchen 4 gefüllte Optionsspalten)
- `backend/scripts/migrate-content-to-db.mjs` /
  `backend/scripts/export-content-to-csv.mjs` – DB ist seit `DB-002` die
  Quelle der Wahrheit, CSV nur Fallback/Snapshot. Nach jeder CSV-Änderung
  muss `migrate-content-to-db.mjs` auf Svens Rechner laufen, damit die
  Live-DB (nicht nur der CSV-Snapshot) aktualisiert wird.

## Umsetzungsschritte (Checkliste)

- [x] Methodik festgelegt: pro Frage per KI eine plausible, eindeutig
      falsche 4. Option generieren lassen (gleicher Stil/Länge wie a/b/c,
      kein inhaltliches Duplikat, thematisch passend)
- [x] HARDWARE.csv, WISO.csv, PM.csv (428 Fragen) bearbeitet, automatisiert
      auf Duplikate/Kollisionen mit a/b/c geprüft, `npm run validate`
      lokal für diese Dateien grün
- [ ] Restliche 695 Fragen in den 9 oben gelisteten Dateien nach derselben
      Methodik ergänzen
- [ ] `npm run validate` komplett grün (0 Probleme)
- [ ] Geänderte CSVs an Sven ausgeliefert
- [ ] Sven führt `DATABASE_URL=... node scripts/migrate-content-to-db.mjs`
      aus, damit die Live-DB die neuen Optionen übernimmt (Migration ist
      idempotent/Upsert, überschreibt `review_status` bestehender Fragen
      NICHT)
- [ ] Sven bestätigt `npm run validate` auf seinem Rechner ebenfalls grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] `npm run validate` läuft ohne "leere Optionsspalten"-Fehler
- [ ] Stichprobenartige Prüfung: neue Option d ist erkennbar falsch, aber
      thematisch plausibel (keine Zufallstexte, keine Wiederholung von a/b/c)
- [ ] Keine Semikolons oder Zeilenumbrüche in den neuen Optionstexten (CSV-
      Format bliebe sonst kaputt)
- [ ] Live-DB (nicht nur CSV) enthält die neuen Optionen nach
      `migrate-content-to-db.mjs`

## Ergebnis (wird beim Abschluss ausgefüllt)

**Zwischenstand 2026-09-17:** 428 von 1123 Fragen erledigt
(HARDWARE/WISO/PM). Sechs parallele KI-Durchläufe haben je einen Block der
Fragen mit einer neuen Option d versehen; anschließend automatisiert
geprüft, dass keine neue Option mit a/b/c übereinstimmt und kein
Semikolon/Zeilenumbruch enthalten ist (0 Probleme gefunden). `npm run
validate` lief für diese drei Dateien danach sauber durch. Die restlichen
9 Dateien (695 Fragen) sind für den nächsten Durchlauf vorgemerkt – siehe
Checkliste oben. Noch nicht an Sven ausgeliefert / noch nicht in die
Live-DB migriert.
