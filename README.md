# AzubiPrep

**Progressive Web App zur IHK-Prüfungsvorbereitung für Fachinformatiker**
(FIAE, FISI, DPA, DVK) – Lernmodule, Karteikarten mit Spaced Repetition,
Prüfungssimulation und Fortschritts-Tracking, wahlweise als Web-App oder
installierbare Windows-Desktop-App.

![Node](https://img.shields.io/badge/Node-%E2%89%A520-339933?logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Electron](https://img.shields.io/badge/Electron-32-47848F?logo=electron&logoColor=white)
![License](https://img.shields.io/badge/Lizenz-MIT-yellow)

---

## Inhaltsverzeichnis

- [Über das Projekt](#über-das-projekt)
- [Screenshots](#screenshots)
- [Funktionsumfang](#funktionsumfang)
- [Tech-Stack](#tech-stack)
- [Schnellstart (Web-App)](#schnellstart-web-app)
- [Desktop-App (Electron)](#desktop-app-electron)
- [Inhalte pflegen (ohne Code)](#inhalte-pflegen-ohne-code)
- [Projektstruktur](#projektstruktur)
- [Dokumentation](#dokumentation)
- [Projektstand & Roadmap](#projektstand--roadmap)

## Über das Projekt

AzubiPrep unterstützt Auszubildende der vier Fachinformatiker-Fachrichtungen
bei der Vorbereitung auf die IHK-Abschlussprüfung: **500 Prüfungsfragen** in
**18 Modulen**, aufbereitet als interaktives Quiz, Karteikarten-Training und
zeitlimitierte Prüfungssimulation mit automatischer Auswertung.

Bewusste Architektur-Entscheidung für den MVP: **kein Datenbank-Server, kein
Login, kein Docker.** Das Backend ist ein reiner, zustandsloser
Content-Server, der Fragen und Theorie aus Excel/CSV- bzw. Markdown-Dateien
lädt – Lernfortschritt liegt clientseitig in `localStorage`. Eine spätere
Migration (z. B. PostgreSQL, Login, Geräte-Sync) ist über eine
Repository-Schicht im Frontend (`frontend/src/api`) vorbereitet, ohne dass
dafür bestehender Code umgebaut werden muss.

## Screenshots

| | |
|---|---|
| ![Dashboard](screenshots/dashboard.png) | ![Lernbereich](screenshots/lernbereich.png) |
| **Dashboard** – XP, Tages-/Wochenziel, Missionen | **Lernbereich** – Module je Fachrichtung |
| ![Lernreise](screenshots/lernreise.png) | ![Prüfungssimulation](screenshots/pruefungssimulation.png) |
| **Lernreise** – Stationenweg durch die Module | **Prüfungssimulation** – Zeitlimit & Themengewichtung |
| ![Statistik & Abzeichen](screenshots/statistik-abzeichen.png) | ![Lernkalender](screenshots/lernkalender.png) |
| **Statistik & Abzeichen** – Fortschritt & Gamification | **Lernkalender** – Wiederholungsplan & eigene Lerninhalte |
| ![Notizen](screenshots/notizen.png) | |
| **Lernnotizen** – lokal, export-/importierbar als `.txt` | |

## Funktionsumfang

**Lernen & Üben**
- Modulbasiertes Lernen mit Theorieblock je Modul
- Quizmodus mit Sofort-Feedback und Erklärung (Single-Choice, Multiple-Choice, Freitext)
- Karteikartenmodus mit Spaced Repetition (Leitner-System, 5 Boxen)
- Prüfungssimulation mit Zeitlimit, Zufallsfragen, Themengewichtung und Bestehensgrenze
- Volltextsuche über Fragen, Erklärungen, Themen und Module

**Fortschritt & Motivation**
- Lernfortschritt und Erfolgsquote je Modul und Fragetyp
- Prüfungsverlauf mit Frage-für-Frage-Review (eigene Antwort vs. richtige Antwort)
- Lernkalender mit Lernserie, Wiederholungsplan und eigenen Lerninhalten
- XP-System, Levels, Missionen und Abzeichen
- Lernnotizen, lokal gespeichert und als `.txt` export-/importierbar

**Technik**
- Dark/Light Mode, responsives Layout (Desktop-Sidebar + Mobile-Navigation)
- Installierbare PWA mit Offline-Unterstützung (Service Worker)
- Zusätzlich als native Windows-Desktop-App (Electron) verfügbar
- Sicherheitsgehärtetes Backend: Security-Header (Helmet/CSP/HSTS), Rate-Limiting, geschützter Admin-Reload
- Inhalte pflegbar über Excel/CSV, ohne Codeänderung

## Tech-Stack

| Bereich | Technologie |
|---|---|
| Frontend | React 18 + Vite, React Router |
| Backend | Node.js + Express (zustandslose Content-API) |
| Desktop | Electron (Hülle um dasselbe Backend/Frontend) |
| Inhalte | Excel/CSV (`content/`), Theorie als Markdown |
| Persistenz | keine Datenbank – Lernstand in `localStorage` |
| PWA | Web App Manifest + Service Worker |
| Sicherheit | Helmet (CSP/HSTS/Frame-Options), eigenes Rate-Limiting |

## Schnellstart (Web-App)

Voraussetzung: **Node.js ≥ 20**

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

Produktions-Build (Frontend bauen, Backend liefert `dist/` mit aus):

```bash
cd frontend && npm run build
cd ../backend && npm start   # http://localhost:3001
```

## Desktop-App (Electron)

AzubiPrep läuft wahlweise auch als installierbare Windows-Desktop-App – eine
Electron-Hülle um dasselbe Backend und Frontend, ohne separaten Code-Pfad:

```bash
cd desktop
npm install
npm start        # startet die App im eigenen Fenster

npm run dist      # baut die Windows-Installer-Datei (Setup.exe) nach desktop/dist/
```

## Inhalte pflegen (ohne Code)

Alle Fragen liegen als **CSV-Dateien** in `content/questions/` (eine Datei je
Modul) – direkt in Excel bearbeitbar (UTF-8, Trennzeichen `;`). Nach dem
Bearbeiten Backend neu starten oder `POST /api/admin/reload` aufrufen.

- `content/fachrichtungen.csv` – Fachrichtungen
- `content/modules.csv` – Modul-Stammdaten
- `content/questions/<modul_id>.csv` – Fragen je Modul
- `content/theorie/<modul_id>.md` – Theorieblöcke je Modul

## Projektstruktur

```
AzubiPrep/
├── content/            Inhalte (Excel/CSV, Markdown – kein Code)
│   ├── fachrichtungen.csv
│   ├── modules.csv
│   ├── questions/*.csv     18 Dateien (eine je Modul)
│   └── theorie/*.md        18 Theorie-Dateien
├── backend/            Node.js + Express (zustandslose Content-API)
│   ├── src/                 server, app, config, content, csv,
│   │                        answer, exam, sicherheit, routes/
│   └── scripts/             validate-content · repair-ft-rows ·
│                            content-statistik · sicherheits-check
├── frontend/           React + Vite (PWA)
│   └── src/                 pages, components, store, api, context, utils
├── desktop/            Electron-Hülle für die Windows-Desktop-App
├── screenshots/        App-Screenshots für dieses README
├── docs/               Produktvision, Architektur, API-Referenz,
│                       Sicherheitskonzept, Projektstatus u. v. m.
├── ORCHESTRATOR.md     Agenten-Workflow (Task-Briefs + Review)
└── AGENTS.md           Konventionen für alle Agenten
```

## Dokumentation

Unter [`docs/`](docs/): Produktvision, Lernkonzept, Fachrichtungen,
Datenformate, API-Referenz, Architektur, PWA-Konzept, Sicherheitskonzept,
Scrum-Planung, Gamification u. v. m. – Einstieg über
[`docs/00-Start.md`](docs/00-Start.md).

## Projektstand & Roadmap

Kompakte, laufend aktualisierte Statusübersicht (Kennzahlen, verifizierter
Stand, offene Punkte): [`docs/PROJEKTSTATUS.md`](docs/PROJEKTSTATUS.md)

Offene Punkte mit höchster Priorität:
- Frontend-Produktions-Build gegen das aktuelle Backend neu verifizieren
- Fachlicher Inhalts-Review der 500 Fragen durch Fachkundige je Fachrichtung

## Lizenz

Veröffentlicht unter der [MIT-Lizenz](LICENSE).
