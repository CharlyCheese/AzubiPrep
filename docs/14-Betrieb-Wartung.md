# Betrieb & Wartung

## Voraussetzungen
- Node.js ≥ 20 (empfohlen 20/22 LTS)
- npm (in der Regel enthalten)

## Installation & Start (Entwicklung)
```bash
# Backend
cd backend
npm install
npm start                # → http://localhost:3001

# Frontend (zweites Terminal)
cd frontend
npm install
npm run dev              # → http://localhost:5173 (Proxy auf :3001)
```

## Produktions-Build
```bash
cd frontend
npm run build            # erzeugt frontend/dist
cd ../backend
npm start                # Backend liefert App + API unter :3001
```
Der Service Worker und das Manifest werden ab `/` ausgeliefert.

## Umgebungsvariablen
| Variable | Default | Bedeutung |
|---|---|---|
| `PORT` | `3001` | HTTP-Port des Backends |
| `HOST` | `127.0.0.1` | Bindeadresse. Fuer LAN-Betrieb `0.0.0.0` setzen - dann ist `ADMIN_TOKEN` Pflicht |
| `ADMIN_TOKEN` | leer | Token fuer `POST /api/admin/reload` (Header `x-admin-token`) |
| `DEMO_ENDPOINTS` | `0` | Demo-/Entwicklungsendpunkte aktivieren (`1`) |
| `RATEN_LIMIT_MAX` | `240` | Erlaubte API-Anfragen je IP und Minute |
| `RATEN_LIMIT_ADMIN_MAX` | `5` | Erlaubte Reload-Aufrufe je IP und Minute |
| `CONTENT_DIR` | `<Projekt>/content` | Pfad zu den Inhaltsdateien |
| `FRONTEND_DIST` | `<Projekt>/frontend/dist` | Pfad zum Frontend-Build |
| `ADMIN_RELOAD` | `1` | Reload-Endpunkt aktiv (`0` deaktiviert) |
| `VITE_API_BASE_URL` | `/api` | API-Basis (Frontend-Build) |

## Inhalte aktualisieren (ohne Code)
1. CSV/Markdown in `content/` bearbeiten (siehe `docs/08-Datenformate.md`).
2. Validierung: `cd backend && node scripts/validate-content.mjs`
3. Aktivierung: `curl -X POST http://localhost:3001/api/admin/reload`
   (nur von der lokalen Maschine) - bei gesetztem `ADMIN_TOKEN`:
   `curl -X POST -H "x-admin-token: <TOKEN>" http://localhost:3001/api/admin/reload`
   oder Backend neu starten.

## Wartungskonzept
- **Code ↔ Inhalte getrennt**: Inhaltsänderungen sind risikoarm und getrennt
  versionierbar.
- **Validierung als Pflicht**: `validate-content.mjs` läuft vor jedem
  Content-Merge (CI-Schritt empfohlen).
- **Logs**: Fehler erscheinen in der Server-Konsole; Health-Endpunkt
  (`GET /api/health`) für Monitoring.
- **Backup**: Inhalte sind Textdateien (Git). Ein Backup der lokalen
  Lerndaten kann über den Browser (localStorage des Profils) nicht zentral
  erfolgen – Hinweis an Nutzer.

## Troubleshooting
| Problem | Lösung |
|---|---|
| Backend startet nicht, Port belegt | `PORT=3002 npm start`; Vite-Proxy anpassen |
| Fragen nach CSV-Pflege unverändert | `POST /api/admin/reload` oder Neustart |
| Umlaute in Excel kaputt | Als **CSV UTF-8** speichern |
| App nicht offline | Einmal online laden; Service Worker nur im Prod-Build |
| `npm run build` schlägt fehl | `node_modules` löschen, `npm install` erneut |

## Übergabepunkte (an Betrieb)
- Repo-Ordner `AzubiPrep/` mit `backend/`, `frontend/`, `content/`, `docs/`.
- Startbefehl Produktion: `cd backend && npm start`.
- Pflege-Doku: `docs/08-Datenformate.md` (Content), `docs/09-API-Referenz.md`
  (Schnittstellen), `docs/14-Betrieb-Wartung.md` (diese Datei).
