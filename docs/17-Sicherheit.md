# Sicherheit (AzubiPrep)

**Stand:** 2026-09-14 · **Bezug:** `docs/14-Betrieb-Wartung.md`, `docs/09-API-Referenz.md`, Brief `agent-briefs/INC-046-sicherheit-haertung.md`

Diese Datei dokumentiert die Sicherheitsprüfung, die daraufhin umgesetzten
Maßnahmen und die bewusst akzeptierten Restrisiken.

## 1. Kontext und Bedrohungsmodell
- AzubiPrep ist eine **stateless Content-API** ohne Login, ohne Session, ohne Cookies
  und ohne Datenbank; Lernstände liegen ausschließlich im Browser (localStorage).
- Damit entfallen typische Klassen wie SQL-Injection, Session-Hijacking, IDOR und
  Kontoübernahme. Relevant bleiben: **Verfügbarkeit**, **Betriebs-Härtung**,
  **Informationsabfluss** und **Vertrauen in Client-Daten**.
- Bewertungshöhe hängt am Betrieb: lokal (Schulnetz/Einzelplatz) = gering, öffentlich
  erreichbarer Server = hoch.

## 2. Umgesetzte Maßnahmen

| ID | Befund | Umsetzung | Datei |
|---|---|---|---|
| F1 | Admin-Reload ohne Auth, Bindung an alle Interfaces | Reload nur von Loopback oder mit `x-admin-token`; `ADMIN_RELOAD=0` blendet die Route aus (404); Server bindet standardmäßig auf `127.0.0.1` | `src/sicherheit.js`, `src/config.js`, `src/server.js`, `src/routes/content.routes.js` |
| F2 | Keine Security-Header | `helmet` mit CSP (`script-src 'self'`, `frame-ancestors 'none'`), `nosniff`, `X-Frame-Options`, `Referrer-Policy`, HSTS; Inline-**Skripte** entfallen, Inline-**Styles** bleiben erlaubt | `src/sicherheit.js`, `frontend/public/theme-init.js`, `frontend/index.html` |
| F3 | CORS `*` | CORS entfernt (App und API auf gleicher Origin); Abhängigkeit `cors` aus `package.json` entfernt | `src/app.js`, `backend/package.json` |
| F4 | Keine Rate-Begrenzung | In-Memory-Limiter je IP: 240 Anfragen/Minute auf `/api`, 5/Minute auf `/api/admin/reload` (konfigurierbar) | `src/sicherheit.js`, `src/config.js` |
| F5 | `qs`/Express-Advisory (DoS) | `npm audit fix` → **0 Vulnerabilities** (prod) im Backend | `backend/package.json`, Lockfile |
| F9 | Demo-Endpunkt mit Lösungen aktiv | nur noch mit `DEMO_ENDPOINTS=1`, Standard aus (404) | `src/routes/exam.routes.js` |
| F11 | Fehlermeldungen mit Interna | generische Antworten (400/413/500), Details nur im Server-Log | `src/app.js`, `src/routes/content.routes.js` |
| F12 | `X-Powered-By: Express` | Header entfernt (`app.disable('x-powered-by')` + helmet) | `src/app.js` |
| F14 | Ungeprüfte Eingaben (`anzahl`, `gewichtung`, `modulIds`) | Validierung: `anzahl` 1–200 (Standard 40), Gewichte nur positive Zahlen, Modul-IDs nur Strings (max. 50) | `src/routes/exam.routes.js` |
| F13 | localStoragedaten unverschlüsselt (Datenschutz) | Hinweisblock „Datenschutz & Hinweise“ in den Einstellungen (lokal, Export/Reset, Selbstkontrolle) | `frontend/src/pages/Einstellungen.jsx` |
| F16 | Manifest referenzierte fehlendes `icon-maskable.svg` | Maskable-Icon ergänzt (Safe Zone), Service-Worker-Version auf v2 und `theme-init.js` im Precache | `frontend/public/icon-maskable.svg`, `frontend/public/sw.js` |

Zusätzlich gehärtet: die Startprüfung in `src/server.js` erkennt zuverlässig, ob die
Datei direkt ausgeführt wird (kein versehentlicher Serverstart bei Import durch Tests).

## 3. Bewusst akzeptierte Risiken (Entscheidung Auftraggeber)

| ID | Risiko | Begründung / Hinweis |
|---|---|---|
| F8 | `/api/pruefung/auswerten` vertraut Client-Antworten, Ergebnisse sind manipulierbar | AzubiPrep ist ein **Lernwerkzeug zur Selbstkontrolle**, kein zertifiziertes Prüfungssystem. Hinweis jetzt im UI (Prüfungsseite) und hier dokumentiert. |
| F10 | `GET /api/fragen` liefert `antwort` und `erklaerung` | Die Lösungen werden für Lernbereich/Modulseite benötigt; ein Abruf ist technisch immer möglich. Bitte als Lernhilfe nutzen. Hinweis im UI (Einstellungen). |
| F6 | `react-router` 6.x: Advisory „Open Redirect“ / SSR-Injection | Nicht ausnutzbar: kein SSR, alle `navigate()`-Ziele sind fest kodiert, kein `target="_blank"`, keine Nutzereingabe in Navigationszielen. Upgrade auf v7 als eigener Task einplanen. |
| F7 | `esbuild`/`vite`-Advisory (Dev-Server) | Betrifft nur `npm run dev`, nicht den Produktions-Build. Dev-Server nicht in fremden Netzen betreiben; Vite-Major-Upgrade separat einplanen. |

## 4. Offene Betriebs-/Hygiene-Themen
- **F15 Versionskontrolle:** Auf dem Prüfsystem ist `git` nicht installiert. Empfehlung:
  `git init`, `.gitignore` ist vorhanden (node_modules, dist, .env, *.log).
  ```bash
  cd AzubiPrep && git init && git add . && git commit -m "Stand: MVP + Gamification + Sicherheits-Haertung"
  ```
- **F17 TLS/HTTPS:** Für PWA/Offline-Betrieb ist HTTPS nötig (Service Worker), außer auf
  `localhost`. Empfehlung: Reverse-Proxy mit TLS vor den Node-Server, z. B.
  ```caddy
  azubiprep.example.org {
    reverse_proxy 127.0.0.1:3001
  }
  ```
  HSTS wird bereits gesendet (`max-age=15552000`), wirkt aber nur bei HTTPS.
  Bei Proxy-Betrieb **`ADMIN_TOKEN` setzen**, da sonst alle Anfragen von der lokalen
  Maschine zu kommen scheinen.

## 5. Verifikation (jederzeit wiederholbar)
```bash
# Backend
cd backend
node scripts/sicherheits-check.mjs      # Header, Zugriffsschutz, Rate-Limit, Validierung
npm audit --omit=dev                    # 0 Vulnerabilities erwartet

# Live-Header prüfen
curl -sI http://127.0.0.1:3001/api/health | findstr /I "content-security x-content-type x-frame referrer strict-transport"
```
Erwartet: CSP mit `script-src 'self'`, `X-Content-Type-Options: nosniff`,
`X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: no-referrer`, HSTS gesetzt,
**kein** `X-Powered-By`, **kein** `Access-Control-Allow-Origin`.

## 6. Betriebsempfehlungen (Kurzliste)
1. Standardbetrieb lokal: keine weiteren Schritte nötig (Bindung `127.0.0.1`, Reload nur lokal).
2. Server im LAN/Internet: `HOST=0.0.0.0` **und** `ADMIN_TOKEN=<lang und zufällig>` setzen,
   `DEMO_ENDPOINTS` aus lassen, TLS über Reverse-Proxy terminieren.
3. Content-Pflege: nach CSV-Änderungen `validate-content.mjs` ausführen, dann Reload mit Token.
4. Kein Passwortschutz für Lernende einbauen: die Daten liegen lokal im Browser; ein
   Hinweis (Einstellungen) und „Alle lokalen Lerndaten löschen“ genügen.