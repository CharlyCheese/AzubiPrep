# AGENTS.md – Konventionen für alle Agenten im Projekt AzubiPrep

Projektziel: **PWA zur IHK-Prüfungsvorbereitung für Fachinformatiker** (FIAE,
FISI, DPA, DVK). Stack: React (Vite), Node/Express, Inhalte als CSV
(Excel-editierbar), kein Docker im MVP.

Datenbank/Login sind seit `DB-001` (siehe `docs/agent-briefs/`) **optional**
vorhanden: ohne `DATABASE_URL` läuft die App weiterhin komplett offline mit
`localStorage`; ist eine PostgreSQL-Verbindung konfiguriert, sind
Registrierung/Login/Sync aktiv (siehe `docs/19-Datenbank-Login.md`).

## Grundregeln

1. **Token-sparend arbeiten**: Nie ganze Projektdateien lesen, wenn ein
   Task-Brief reicht. Nur die im Brief genannten Dateien anfassen.
2. **Task-Brief-Pflicht**: Jede Änderung erfolgt über einen Brief in
   `docs/agent-briefs/`. Erst Brief lesen, dann ändern.
3. **Review-Pflicht (empfohlen bei größeren Änderungen)**: Ein frischer
   Subagent (eigener Kontext, kein geteilter Chat-Verlauf) prüft gegen die
   Abnahme-Kriterien des Briefs.
4. **Archivierungs-Pflicht (bindend, kein Ermessen)**: Kein Task gilt als
   erledigt, bevor `node scripts/check-agent-briefs.mjs` grün ist – siehe
   `ORCHESTRATOR.md` Abschnitt 3+4. Das ist keine Empfehlung, sondern eine
   Voraussetzung dafür, die Arbeit dem Nutzer als "fertig" zu melden.
5. **Keine Löschungen fremder Bereiche**: Der Ordner `Docs/` (Spielprojekt)
   im übergeordneten Verzeichnis gehört nicht zu AzubiPrep und wird nie
   verändert.
6. **Feste Pfade sind tabu**: API-Basis-URL, Ports, Datenpfade und
   Datenbank-Zugangsdaten kommen aus Umgebungsvariablen (`.env`, siehe
   `.env.example`) mit sinnvollen Defaults – nie hart kodiert.
7. **Nur bestätigte Libraries**: React, React Router, Vite, Express, cors,
   pg, bcryptjs, jsonwebtoken, dotenv. Keine zusätzlichen Abhängigkeiten ohne
   Rücksprache.

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

Persistenz im Backend ist optional (siehe oben, `DB-001`): ohne
`DATABASE_URL` unverändert stateless. Prüfungslogik (Generierung/Auswertung)
liegt bewusst im Backend (`POST /api/exam/generate`, `POST /api/exam/evaluate`).
