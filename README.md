# AzubiPrep – Prüfungsvorbereitung für Fachinformatiker (PWA)

Lauffähiger MVP: **React-PWA + Node/Express-Backend, Inhalte aus Excel/CSV,
keine Datenbank, kein Login, kein Docker** (gemäß abgestimmter Architektur).

- Projektordner: `AzubiPrep/` (siehe README.md für Schnellstart)
- Der Produktionsserver läuft gerade unter **http://localhost:3001** und
  serviert die fertig gebaute App inkl. aller 500 Fragen.


## Stack (MVP)

| Bereich | Technologie |
|---|---|
| Frontend | React 18 + Vite, React Router, JavaScript |
| Backend | Node.js + Express (stateless Content-API) |
| Inhalte | Excel/CSV-Dateien (`content/`), Theorie als Markdown |
| Persistenz | **keine Datenbank, kein Login** – Fortschritt in `localStorage` |
| PWA | Manifest + Service Worker (offline-fähig, Dark Mode) |

> **Architektur-Entscheidung MVP:** Das Backend ist ein reiner Content-Server
> ohne Datenbank und ohne Auth. Alle Lernstände liegen clientseitig in
> `localStorage`. Eine spätere Migration (z. B. PostgreSQL, Login, Sync) ist
> über die Repository-Schicht im Frontend (`frontend/src/api`) vorbereitet.

## Screenshots

| | |
|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Lernbereich](screenshots/lernbereich.png) |
| Dashboard – XP, Tages-/Wochenziel, Missionen | Lernbereich – Module je Fachrichtung |
| ![Lernreise](screenshots/lernreise.png) | ![Prüfungssimulation](screenshots/pruefungssimulation.png) |
| Lernreise – Stationenweg durch die Module | Prüfungssimulation mit Zeitlimit & Themengewichtung |
| ![Statistik & Abzeichen](screenshots/statistik-abzeichen.png) | ![Lernkalender](screenshots/lernkalender.png) |
| Statistik & Abzeichen – Fortschritt und Gamification | Lernkalender – Wiederholungsplan & eigene Lerninhalte |
| ![Notizen](screenshots/notizen.png) | |
| Lernnotizen – lokal, export-/importierbar als .txt | |

## Desktop-App (Electron)

AzubiPrep läuft auch als installierbare Windows-Desktop-App – eine
Electron-Hülle um dasselbe Backend und Frontend, kein separater Code-Pfad:

```bash
cd desktop
npm install
npm start        # startet die App im eigenen Fenster

npm run dist      # baut die Windows-Installer-Datei (Setup.exe) nach desktop/dist/
```

## Schnellstart

Voraussetzungen: Node.js ≥ 20.

```bash
# 1) Backend starten (Port 3001)
cd backend
npm install
npm start

# 2) Frontend im Dev-Modus (Port 5173, Proxy auf /api)
cd frontend
npm install
npm run dev
```

Produktions-Build (Frontend bauen, Backend serviert `dist/` mit):

```bash
cd frontend && npm run build
cd ../backend && npm start   # öffnet http://localhost:3001
```

## Inhalte pflegen (ohne Code)

Alle Fragen liegen als **CSV-Dateien** in `content/questions/` (eine Datei je
Modul) – direkt in Excel bearbeitbar (UTF-8, Trennzeichen `;`). Nach dem
Bearbeiten Backend neu starten oder `POST /api/admin/reload` aufrufen.

- `content/fachrichtungen.csv` – Fachrichtungen
- `content/modules.csv` – Modul-Stammdaten
- `content/questions/<modul_id>.csv` – Fragen je Modul
- `content/theorie/<modul_id>.md` – Theorieblöcke je Modul

## Team-/KI-Workflow

Siehe [`ORCHESTRATOR.md`](ORCHESTRATOR.md) (Rollenspiel, Task-Briefs, Reviews)
und [`AGENTS.md`](AGENTS.md) (Konventionen).

## Aktueller Projektstand

Kompakte Statusübersicht: [`docs/PROJEKTSTATUS.md`](docs/PROJEKTSTATUS.md)
(Kennzahlen, Funktionsumfang, Struktur, verifizierter Stand, offene Punkte).

## Dokumentation

Unter `docs/`: Produktvision, Lernkonzept, Fachrichtungen, Datenformate,
API-Referenz, Architektur, PWA-Konzept, Scrum-Planung, MVP-Doku, Roadmap,
Recherche-Handbuch u. v. m. – beginne mit `docs/00-Start.md`.
