# Software-Architektur

## Architektur-Ziele
1. **Inhalte = Daten, Code = Verhalten.** Neue Fragen/Module erfordern keine Codeänderung.
2. **Stateless Backend.** Einfach hostbar, kein Datenbankbetrieb, kein Login.
3. **Repository-Seam im Frontend.** Austausch der Datenquelle (CSV-API →
   zukünftig PostgreSQL/Login) ohne UI-Umbau.
4. **Modularität & Testbarkeit.** Kleine, fokussierte Module mit klaren Grenzen.

## Systemüberblick
```
┌──────────────────┐  Fragen/Module   ┌──────────────────────────┐
│ PostgreSQL         │ ───optional───> │  Backend (Node/Express)   │
│ (questions/modules/ │  (DATABASE_URL │  - Content laden/indizieren │
│  fachrichtungen)    │   gesetzt +    │  - REST-API (/api/*)       │
└────────┬──────────┘   befüllt)      │  - Prüfungslogik (stateless)│
         │ export-content-to-csv.mjs  └────────────┬─────────────┘
         ▼                                          │ JSON
┌────────────────┐   liest (Fallback  ┌──────────────▼──────────────┐
│ content/*.csv    │  ohne/leere DB) │ Frontend (React PWA)         │
│ content/theorie   │ ───────────────> │  pages → store/localStorage │
└────────────────┘                    │  ◄── repositories/api       │
                                       │  Fortschritt/Karten lokal   │
                                       └──────────────────────────────┘
```

Fragen/Module/Fachrichtungen kommen seit `DB-002` primär aus PostgreSQL,
sobald `DATABASE_URL` gesetzt und die Tabellen befüllt sind (siehe
Abschnitt "Content-Datenbank" unten). Ohne DB (oder mit leeren Tabellen)
lädt das Backend unverändert aus `content/*.csv` – **die App funktioniert
weiterhin komplett ohne Datenbank** (Architekturziel 2 bleibt bestehen).

## Backend-Struktur
```
backend/src/
├── server.js        Einstieg: Content-Store + Server-Start
├── app.js           Express-App, Routen, statische Auslieferung
├── config.js        Ports/Pfade über Umgebungsvariablen
├── content.js       Laden/Indizieren aller Inhalte (CSV + Markdown)
├── csv.js           robuster CSV-Parser
├── answer.js        Antwortprüfung SC/MC/FT
├── exam.js          Prüfungs-Generierung & Auswertung
└── routes/          content, exam, search
```

## Frontend-Struktur
```
frontend/src/
├── main.jsx / App.jsx     Bootstrap, Routing
├── components/            Layout, FrageKarte (wiederverwendbar)
├── pages/                 je Route eine Seite
├── api/client.js          HTTP-Client (fetch), Basis-URL konfigurierbar
├── store/localStore.js    localStorage-Zugriff (synchron, defensiv)
├── store/examStore.js     In-Memory-Zustand für laufende Prüfung
├── store/miniStore.js     winziges useSyncExternalStore-Utility
├── utils/                 useApi, Markdown-Renderer, Fragen-Helfer
└── styles/global.css      Design-Tokens (Dark/Light), Komponenten
```

## Datenfluss
1. **Content** wird beim Start (und bei `POST /api/admin/reload`) geladen
   und in Maps indiziert (`questionById`, `questionsByModul`) –
   `backend/src/content.js` versucht bei gesetzter `DATABASE_URL` zuerst
   PostgreSQL, fällt bei fehlender/leerer/nicht erreichbarer DB automatisch
   auf `content/*.csv` zurück. Beide Pfade liefern dieselbe Struktur.
2. **API** liest danach ausschließlich aus dem In-Memory-Store (kein
   DB-Zugriff pro Request).
3. **Frontend** ruft über `api/client.js` die Endpunkte; Seiten nutzen den
   `useApi`-Hook (Laden/Fehler/Ladeindikator).
4. **Lernfortschritt** wird in `localStorage` geschrieben und direkt nach dem
   Beantworten aktualisiert (Dashboard/Statistik lesen dieselben Stores).

## Erweiterbarkeit
| Erweiterung | Aufwand | Wo? |
|---|---|---|
| Neue Fragen/Module | keine Codeänderung | `content/*.csv` |
| Neue Fachrichtung | keine Codeänderung | `fachrichtungen.csv` + Module |
| Backend-DB (PostgreSQL) | Repository-Layer ersetzen | `frontend/src/api` |
| Login & Multi-Device | Auth-Modul + Sync | Backend neu + Repository-Layer |
| Neue Fragetypen | Antwortprüfung erweitern | `backend/src/answer.js` + UI |
| Push-Benachrichtigungen | Web-Push im Service Worker | `frontend/public/sw.js` |

## Content-Datenbank (DB-002, umgesetzt 2026-09-16)
Login/Sync (`users`/`user_state`, siehe `docs/19-Datenbank-Login.md`) nutzen
PostgreSQL bereits seit `DB-001`. Seit `DB-002` gilt das auch für die
Lerninhalte selbst (`fachrichtungen`, `modules`, `questions` in
`backend/db/schema.sql`):

1. **Migration (einmalig/wiederholbar):**
   `DATABASE_URL=... node backend/scripts/migrate-content-to-db.mjs` liest
   `content/*.csv` und schreibt sie idempotent (Upsert nach ID) in die DB.
2. **Laden:** `backend/src/content.js` versucht bei gesetzter
   `DATABASE_URL` zuerst die DB; sind die Tabellen leer oder die DB nicht
   erreichbar, wird transparent auf CSV zurückgefallen. Kein Unterschied
   für Frontend/API (Repository-Seam, Architekturziel 3).
3. **Export (vor jedem Release empfohlen):**
   `DATABASE_URL=... node backend/scripts/export-content-to-csv.mjs`
   schreibt den aktuellen DB-Stand zurück nach `content/*.csv`. Das ist
   gleichzeitig die Fallback-Garantie (App läuft ohne DB) und der
   git-versionierte, diff-bare Snapshot, gegen den der verpflichtende
   unabhängige CONTENT-Review läuft (siehe `ORCHESTRATOR.md` Abschnitt 1).
4. **`review_status`** (`ungeprueft`/`geprueft`/`gemeldet`/`korrigiert`) je
   Frage macht den OPS-002-Review-Fortschritt abfragbar statt nur als
   Prosa-Notiz in `STATUS.md` – Grundlage für `CONTENT-001`
   (Autoren-Weboberfläche) und `BE-003` (In-App-Feedback "Frage melden").

Details/Entscheidungsbegründung: `docs/agent-briefs/
DB-002-content-datenbank-migration.md`.

## Nutzerfortschritt (Ausblick, noch nicht umgesetzt)
`user_progress`/`flashcards` als DB-Tabellen für das, was heute in
`localStorage` liegt, wären ein separater, eigener Schritt – unabhängig
von der Content-Datenbank oben und aktuell nicht geplant.
