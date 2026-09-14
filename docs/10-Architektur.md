# Software-Architektur

## Architektur-Ziele
1. **Inhalte = Daten, Code = Verhalten.** Neue Fragen/Module erfordern keine Codeänderung.
2. **Stateless Backend.** Einfach hostbar, kein Datenbankbetrieb, kein Login.
3. **Repository-Seam im Frontend.** Austausch der Datenquelle (CSV-API →
   zukünftig PostgreSQL/Login) ohne UI-Umbau.
4. **Modularität & Testbarkeit.** Kleine, fokussierte Module mit klaren Grenzen.

## Systemüberblick
```
┌────────────┐   liest    ┌──────────────────────────┐
│ content/*.csv │ ───────> │  Backend (Node/Express)   │
│ content/theorie │         │  - Content laden/indizieren │
└────────────┘   (Start/   │  - REST-API (/api/*)       │
                 Reload)   │  - Prüfungslogik (stateless)│
                           └────────────┬─────────────┘
                                        │ JSON
┌───────────────────────────────────────▼──────────────┐
│ Frontend (React PWA)                                 │
│  pages → store/localStorage ◄── repositories/api     │
│  Fortschritt, Karten, Notizen liegen lokal            │
└──────────────────────────────────────────────────────┘
```

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
1. **Content** wird beim Start aus CSV geladen und in Maps indiziert
   (`questionById`, `questionsByModul`).
2. **API** liest ausschließlich aus dem In-Memory-Store (kein DB-Zugriff).
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

## Migration Backend → PostgreSQL (Ausblick)
Der MVP nutzt bewusst keine Datenbank. Sobald Multi-User gewünscht ist:
1. Node/Express bleibt, zusätzlich z. B. **Knex/PostgreSQL**.
2. Content kann weiterhin als CSV importiert oder in Tabellen gepflegt werden.
3. `user_progress`/`flashcards`-Tabellen übernehmen, was heute in
   `localStorage` liegt; Synchronisation über die API.
4. Frontend-Repositories sprechen dann die neuen Endpunkte an – Seiten bleiben
   unverändert.
