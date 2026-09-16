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
DB die primäre Quelle sein – der CSV-Workflow unten bleibt trotzdem
bestehen, nur die Pflege wandert perspektivisch (`CONTENT-001`) von
"CSV per Hand editieren" zu "DB editieren, CSV wird automatisch
exportiert". Solange `CONTENT-001` nicht existiert, ist Handpflege der
CSV weiterhin der normale Weg; nach einer Migration (`migrate-content-
to-db.mjs`) müsste sie dann per `export-content-to-csv.mjs` zurück in
die DB gespiegelt werden, um nicht verloren zu gehen.

## Inhaltsmanagement
| Aufgabe | Werkzeug (Stand DB-002) |
|---|---|
| Fragen/Module pflegen (bis CONTENT-001 existiert) | Excel → `content/*.csv` |
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
