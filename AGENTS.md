# AGENTS.md – Konventionen für alle Agenten im Projekt AzubiPrep

Projektziel: **PWA zur IHK-Prüfungsvorbereitung für Fachinformatiker** (FIAE,
FISI, DPA, DVK). Stack: React (Vite), Node/Express, Inhalte als CSV
(Excel-editierbar), keine Datenbank, kein Login, kein Docker im MVP.

## Grundregeln

1. **Token-sparend arbeiten**: Nie ganze Projektdateien lesen, wenn ein
   Task-Brief reicht. Nur die im Brief genannten Dateien anfassen.
2. **Task-Brief-Pflicht**: Jede Änderung erfolgt über einen Brief in
   `docs/agent-briefs/`. Erst Brief lesen, dann ändern.
3. **Review-Pflicht**: Nach jedem abgeschlossenen Schritt reviewt ein anderer
   (frischer) Agent das Ergebnis gegen die Abnahme-Kriterien.
4. **Keine Löschungen fremder Bereiche**: Der Ordner `Docs/` (Spielprojekt)
   im übergeordneten Verzeichnis gehört nicht zu AzubiPrep und wird nie
   verändert.
5. **Feste Pfade sind tabu**: API-Basis-URL, Ports und Datenpfade kommen aus
   Umgebungsvariablen (`VITE_API_BASE_URL`, `PORT`) mit sinnvollen Defaults.
6. **Nur bestätigte Libraries**: React, React Router, Vite, Express, cors.
   Keine zusätzlichen Abhängigkeiten ohne Orchestrator-Freigabe.

## Sprach- & Code-Konventionen

- Code-Identifiers: Englisch. Texte/UI-Kopien, Fragen & Doku: Deutsch (Zielgruppe).
- UI-Komponenten: PascalCase-Dateien in `frontend/src/components`.
- Seiten: PascalCase-Dateien in `frontend/src/pages`.
- Backend: `backend/src/…`, Routen in `backend/src/routes`.
- Semikolon, 2 Spaces Einrückung, ES-Module (`import/export`).
- Deutsche UI-Texte ohne Anglizismen wo möglich; Du-Form.

## Verzeichnis-Überblick

```
AzubiPrep/
├── ORCHESTRATOR.md, AGENTS.md, README.md
├── content/            # Excel/CSV-Quelldateien (Inhalte)
│   ├── fachrichtungen.csv, modules.csv
│   ├── questions/*.csv   # eine Datei je Modul
│   └── theorie/*.md      # Theorietexte je Modul
├── backend/            # Node/Express (stateless Content-API)
│   └── src/{routes,csv.js,content.js,exam.js,app.js,server.js}
├── frontend/           # React PWA
│   └── src/{components,pages,store,api,styles,utils}
└── docs/               # Produktdoku + agent-briefs/
```

## Datenfluss (MVP)

```
Excel/CSV ──> backend liest beim Start ──> REST /api/*
Frontend (React) ──> api/repositories ──> Fortschritt in localStorage
```

Keine SQL-Datenbank, kein Auth/Login, keine Persistenz im Backend.
Prüfungslogik (Generierung/Auswertung) liegt bewusst im Backend
(`POST /api/exam/generate`, `POST /api/exam/evaluate`).
