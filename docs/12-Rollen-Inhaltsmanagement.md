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
der `POST /api/admin/reload` die Freigabe/Veröffentlichung.

## Inhaltsmanagement
| Aufgabe | Werkzeug (MVP) |
|---|---|
| Fragen/Module pflegen | Excel → `content/*.csv` |
| Theorie pflegen | Editor → `content/theorie/*.md` |
| Validieren | `backend/scripts/validate-content.mjs` |
| Veröffentlichen | `POST /api/admin/reload` bzw. Backend-Neustart |

## Versionierung von Inhalten
- CSV-/Markdown-Dateien sind **textbasiert** → mit Git versionierbar
  (Diff/History/Review je Zeile).
- Empfohlener Workflow:
  1. Branch `content/*` anlegen
  2. Änderungen in Excel vornehmen und als CSV speichern
  3. `validate-content.mjs` ausführen
  4. Pull Request + Review (frischer Agent/Person)
  5. Merge → Deployment → Reload
- Jede Frage trägt eine **Quellenangabe** (`quelle`) für Nachvollziehbarkeit
  und Qualitätssicherung.

## Qualitätssicherung (Inhalte)
- Pflichtfelder: id, modul_id, typ, frage, antwort, erklaerung,
  schwierigkeit, quelle.
- Antwortformat je Fragetyp wird automatisch geprüft.
- Stichproben-Review durch zweite Person (4-Augen-Prinzip).
- Keine Original-IHK-Aufgaben verwenden; eigene Formulierungen mit
  Quellenbezug (Rahmenlehrplan, Fachliteratur, Gesetze).
