# Rollen & Inhaltsmanagement

## Benutzerrollen (Zielbild & MVP)
Der MVP kommt **ohne Login** aus (lokal, ein Profil). Für die spätere
Server-Anbindung ist folgende Rollenstruktur vorgesehen:

| Rolle | Rechte (Zielbild) |
|---|---|
| **Lernende** | Module/Fragen nutzen, Fortschritt sehen |
| **Autor:in** | Inhalte (Fragen, Theorie) bearbeiten, Versionen anlegen |
| **Administrator:in** | Nutzer verwalten, Inhalte freigeben, System konfigurieren |
| Erweiterbar | Rollen als Datenmodell (role → Permissions), keine harten if-Abfragen |

Im MVP übernimmt der **Content-Workflow über Excel/CSV** die Autorenrolle,
der `POST /api/admin/reload` die Freigabe/Veröffentlichung. Seit `DB-002`
(siehe `docs/10-Architektur.md`, Abschnitt "Content-Datenbank") kann die
DB die primäre Quelle sein. Seit `CONTENT-001` gibt es zusätzlich eine
geschützte Weboberfläche ("Fragenpflege") zum direkten Bearbeiten
bestehender Fragen in der DB – Details dazu im Abschnitt "Content-Pflege
über die Autoren-Weboberfläche (CONTENT-001)" weiter unten. Neuanlage
neuer Fragen bleibt weiterhin der CSV-Weg unten.

## Inhaltsmanagement
| Aufgabe | Werkzeug (Stand CONTENT-001) |
|---|---|
| Bestehende Fragen bearbeiten (Text/Optionen/Antwort/Erklärung) | Weboberfläche "Fragenpflege" (`/autoren`, Login mit Autor:in-/Admin-Rolle nötig) |
| Neue Fragen/Module anlegen | Excel → `content/*.csv` (unverändert) |
| Theorie pflegen | Editor → `content/theorie/*.md` (bleibt Markdown, kein DB-Umzug geplant) |
| Validieren | `backend/scripts/validate-content.mjs` |
| CSV → DB übernehmen | `backend/scripts/migrate-content-to-db.mjs` (idempotent) |
| DB → CSV zurückspiegeln | `backend/scripts/export-content-to-csv.mjs` |
| Veröffentlichen | `POST /api/admin/reload` bzw. Backend-Neustart (lädt dann aus DB, falls konfiguriert und befüllt, sonst aus CSV) |

## Versionierung von Inhalten
- CSV-/Markdown-Dateien sind **textbasiert** → mit Git versionierbar
  (Diff/History/Review je Zeile). Das gilt weiterhin, auch wenn die DB die
  primäre Laufzeit-Quelle ist: `export-content-to-csv.mjs` erzeugt vor
  jedem Release den aktuellen, committeten Snapshot.
- Empfohlener Workflow (Stand DB-002, ohne CONTENT-001-UI):
  1. Branch `content/*` anlegen
  2. Änderungen in Excel vornehmen und als CSV speichern
  3. `validate-content.mjs` ausführen
  4. `migrate-content-to-db.mjs` laufen lassen (falls eine DB im Einsatz ist)
  5. Pull Request + verpflichtender unabhängiger CONTENT-Review
     (`ORCHESTRATOR.md` Abschnitt 1) gegen die geänderten CSV-Zeilen
  6. Merge → Deployment → Reload
- Jede Frage trägt eine **Quellenangabe** (`quelle`) für Nachvollziehbarkeit
  und Qualitätssicherung, sowie seit `DB-002` einen **`review_status`**
  (`ungeprueft`/`geprueft`/`gemeldet`/`korrigiert`) für den OPS-002-Prozess.

## Qualitätssicherung (Inhalte)
- Pflichtfelder: id, modul_id, typ, frage, antwort, erklaerung,
  schwierigkeit, quelle.
- Antwortformat je Fragetyp wird automatisch geprüft.
- Stichproben-Review durch zweite Person (4-Augen-Prinzip).
- Keine Original-IHK-Aufgaben verwenden; eigene Formulierungen mit
  Quellenbezug (Rahmenlehrplan, Fachliteratur, Gesetze).

## Content-Pflege über die Autoren-Weboberfläche (CONTENT-001)

Dieser Abschnitt ist bewusst eigenständig verständlich gehalten – auch
ohne Kenntnis vorheriger Absprachen –, damit künftig auch eine andere KI
oder eine andere Person hier weiterarbeiten kann.

**Rollen** (Spalte `rolle` auf `users`, Vergabe nur manuell per SQL/
pgAdmin, kein Self-Service-Upgrade):
- `lernende` (Default) – normaler Nutzer, kein Zugriff auf die
  Fragenpflege. Sieht im Lernbereich trotzdem **alle** Fachrichtungen
  (unverändert seit `FE-004`) – die Rolle schränkt nur das *Bearbeiten*
  ein, nie das Lernen/Lesen.
- `autor` – darf über `/autoren` Fragen bearbeiten, aber nur solche mit
  `fachrichtung = eigene registrierte Fachrichtung` oder
  `fachrichtung = 'ALLE'` (fachrichtungsübergreifende Module wie WISO).
- `admin` – wie `autor`, aber ohne Fachrichtungs-Einschränkung.

**`review_status`** (Spalte auf `questions`, fünf Werte):
- `ungeprueft` – Startwert bzw. Zustand nach jeder inhaltlichen Änderung.
  Wird **automatisch** von der Fragenpflege-UI gesetzt, sobald sich
  Frage/Optionen/Antwort/Erklärung/Thema/Schwierigkeit/Quelle ändern –
  es gibt keinen Weg, eine Änderung ohne diesen Reset zu speichern.
- `geprueft` – die Frage hat den verpflichtenden unabhängigen
  Fachreview durchlaufen (siehe `ORCHESTRATOR.md` Abschnitt 1: ein
  frisch gestarteter KI-Subagent mit Websuche gegen autoritative
  Quellen, oder ein menschlicher Fachreview). **Dieser Wert wird nicht
  über die Fragenpflege-UI gesetzt** – die UI kann ihn nur anzeigen/
  filtern. Er wird nach einem abgeschlossenen Review manuell (SQL) oder
  über `migrate-content-to-db.mjs` gesetzt.
- `gemeldet` – für `BE-003` (In-App-Feedback "Frage melden") vorgesehen,
  noch nicht produktiv befüllt.
- `korrigiert` – Frage wurde nach einer Meldung korrigiert.
- `deaktiviert` – Frage ist ausgeblendet aus dem aktiven Lernbestand
  (Ersatz für ein hartes Löschen; die Zeile bleibt erhalten und ist
  jederzeit über die UI reaktivierbar, was den Status wieder auf
  `ungeprueft` setzt).

**Ablauf einer Änderung über `/autoren`:**
1. Autor:in meldet sich an (bestehendes Login aus `DB-001`) und öffnet
   `/autoren`.
2. Bearbeitet eine Frage (nur die inhaltlichen Felder – `id`, `modul_id`,
   `typ`, `fachrichtung` sind nicht editierbar, ein Modul-/Typ-Wechsel
   bleibt Sonderfall über CSV + `migrate-content-to-db.mjs`).
3. Vor dem Speichern wird die bisherige Zeile automatisch in
   `questions_verlauf` gesichert (Fallback: falls eine vorher richtige
   Antwort versehentlich falsch geändert wird, lässt sich der alte Stand
   dort nachschlagen und die Frage wieder darauf zurücksetzen).
4. Nach dem Speichern steht die Frage auf `ungeprueft` und ist – wie
   jede andere Frage auch – sofort im Lernbereich sichtbar (keine
   Sichtbarkeitssperre; Status ist reines Tracking).
5. **Der eigentliche Fachreview ist kein Teil der laufenden App.** Er
   läuft separat, außerhalb der Weboberfläche, durch wen auch immer
   gerade mit KI-/Internetzugang an den Inhalten arbeitet (siehe
   `ORCHESTRATOR.md` Abschnitt 1, Methodik in
   `docs/agent-briefs/OPS-002-ki-fachreview-methodik.md`). Die
   ausgelieferte Desktop-App selbst braucht dafür nie eine KI oder
   Internetzugang – Review ist reine Vorab-Qualitätssicherung vor einem
   Release, kein Laufzeit-Feature.
6. Vor einem Release wird der aktuelle DB-Stand per
   `export-content-to-csv.mjs` zurück nach `content/*.csv` gespiegelt
   (git-versionierter Snapshot + Fallback-Garantie).

Details/Entscheidungsbegründung:
`docs/agent-briefs/CONTENT-001-autoren-weboberflaeche.md`.
