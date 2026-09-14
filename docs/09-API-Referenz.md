# API-Referenz

Basis: `/api` · JSON · kein Login (nur lokale Datenhaltung) · **kein CORS** (App und API auf gleicher Origin) · Sicherheits-Header aktiv, Admin-Endpunkt geschuetzt (siehe `docs/17-Sicherheit.md`).
Statische Frontend-Auslieferung über dieselbe Origin im Produktions-Build.

## Übersicht

| Methode | Pfad | Beschreibung |
|---|---|---|
| GET | `/api/health` | Status + Inhalts-Metadaten (Fragen-/Modulanzahl) |
| GET | `/api/fachrichtungen` | Liste mit Fragenanzahl je Fachrichtung |
| GET | `/api/module` | Module, optional `?fachrichtung=FIAE` (inkl. ALLE-Module) |
| GET | `/api/module/:modulId` | Modul-Detail + Theorie + Verteilung |
| GET | `/api/fragen` | Fragen, Filter: `?modulId=&fachrichtung=&typ=&limit=` |
| GET | `/api/fragen/:id` | einzelne Frage (inkl. Lösung) |
| POST | `/api/fragen/:id/pruefen` | Einzelfrage prüfen `{ antwort }` |
| GET | `/api/suche?q=` | Volltextsuche über Fragen & Module |
| POST | `/api/pruefung/generieren` | Prüfung erzeugen (ohne Lösungen) |
| POST | `/api/pruefung/auswerten` | Prüfung auswerten |
| POST | `/api/admin/reload` | Inhalte aus CSV neu laden (nur lokal oder mit Header `x-admin-token`) |
| GET | `/api/konstanten` | Fachrichtungen, Fragetypen, Bestehensgrenze |
| GET | `/api/pruefung/ergebnisbeispiel` | Demo-Auswertung (nur mit `DEMO_ENDPOINTS=1`) |

## Beispiele

### Fachrichtungen
```http
GET /api/fachrichtungen
```
```json
[
  { "code": "FIAE", "name": "Fachinformatiker Anwendungsentwicklung",
    "beschreibung": "…", "fragenAnzahl": 41 }
]
```

### Prüfung generieren
```http
POST /api/pruefung/generieren
Content-Type: application/json

{ "fachrichtung": "FIAE", "anzahl": 30, "gewichtung": {} }
```
Antwort: `{ fragen: [ { id, fachrichtung, modul_id, thema, typ, frage, optionen, schwierigkeit } ], anzahl, erstelltAm }`
> Bewusst **ohne** `antwort`/`erklaerung`, damit nicht „gespickt" wird.

### Prüfung auswerten
```http
POST /api/pruefung/auswerten
Content-Type: application/json

{ "fragen": [ { "id": "FIAE-PRG-001", "antwort": "b" } ] }
```
Antwort: `{ scoreProzent, richtig, gesamt, bestanden, detail[], proModul{}, proTyp{}, staerken[], schwaechen[] }`

### Einzelfrage prüfen
```http
POST /api/fragen/FIAE-DB-006/pruefen
Content-Type: application/json

{ "antwort": "a,c" }
```
Antwort: `{ frageId, typ, richtig, erwartet, erklaerung, nutzerAntwort }`

## Fehler
- 400 – ungültige Anfrage (z. B. keine Fragen zur Auswahl, leere Antworten)
- 404 – Ressource nicht gefunden
- 500 – interner Fehler (Format: `{ error: "…" }`)

## Filterparameter (Ergänzung)

- `GET /api/fragen` unterstützt zusätzlich `&schwierigkeit=leicht|mittel|schwer`.
- `POST /api/pruefung/generieren` akzeptiert `schwierigkeit` im Body
  (`alle` = ohne Einschränkung).

```http
GET /api/fragen?modulId=FISI-NET&schwierigkeit=schwer
```
```http
POST /api/pruefung/generieren
{ "fachrichtung": "FIAE", "anzahl": 20, "schwierigkeit": "mittel" }
```

