# Projektstatus – AzubiPrep

> **Stand:** 2026-09-14 · **Phase:** MVP + Feedback/Bedienung/Review (Sprint 1.1–1.15 done) + Content-/Backend-Reparatur
> **Projektpfad:** `Project_1/AzubiPrep/`

## 1. Kurzfassung

AzubiPrep ist eine **lauffähige Progressive Web App (PWA)** zur
IHK-Prüfungsvorbereitung für die vier Fachinformatiker-Fachrichtungen **FIAE,
FISI, DPA, DVK**. Der MVP ist vollständig umgesetzt, getestet und
dokumentiert; die erste Feedback-Runde (Sprint 1.1) ist eingearbeitet.

| Kennzahl | Wert |
|---|---|
| Fragen im Bestand | **500** |
| Module | **18** (16 fachspezifisch + 2 gemeinsam) |
| Fachrichtungen | FIAE, FISI, DPA, DVK (+ gemeinsame ALLE-Fragen) |
| Frontend-Seiten | 13 |
| API-Endpunkte | 12 |
| Dokumente | 18 (`docs/`) + Orchestrator-/Agenten-Doku |
| Build-Status | ✅ Vite-Build fehlerfrei (73 Module) |
| Content-Validierung | ✅ ohne Fehler |

## 2. Umgesetzter Funktionsumfang (MVP)

### Lernen & Üben
- **Modulbasiertes Lernen** mit Theorieblock je Modul (Markdown)
- **Quizmodus** mit Sofort-Feedback und Erklärung (SC, MC, FT)
- **Karteikartenmodus** mit Spaced Repetition (Leitner-Boxen 1–5,
  Intervalle 1/3/7/14/30 Tage)
- **Prüfungssimulation** mit Zeitlimit, Zufallsfragen, Themengewichtung,
  Bestehensgrenze 50 %, Stärken-/Schwächenanalyse

### Fortschritt & Motivation
- **Lernfortschritt** (beantwortete Fragen, Erfolgsquote) in `localStorage`
- **Statistik** je Modul, Fragetyp und Prüfungsverlauf
- **Lernkalender** mit Lernserie (Streak), Monatsansicht, Wiederholungsplan
- **Lernnotizen** lokal, modulbezogen
- **Volltextsuche** über Fragen, Erklärungen, Themen und Module

### Technik & Betrieb
- **Dark/Light Mode**, responsiv (Desktop-Sidebar + Mobile-Navigation)
- **PWA**: Manifest, Service Worker (Offline-fähig), generierte Icons
- **Excel/CSV-Inhaltsworkflow**: Inhalte ohne Codeänderung pflegbar
- **Stateless Backend** (kein SQL, kein Login, kein Docker – gemäß Vorgabe)
- **Repository-Seam** im Frontend für spätere DB-/Login-Anbindung

### Feedback-Umsetzung (Sprint 1.1)
- **Suche → Frage:** Deep-Link öffnet die konkrete gesuchte Frage im Quiz
- **Schwierigkeit wählbar** (leicht/mittel/schwer/alle) – Quiz & Prüfung
- **Kalender:** Monatsnavigation (« Zurück · Heute · Weiter »)
- **Notizen:** Export/Import als `.txt` (bearbeitbar in Notepad/Editor)
- **Dark Mode:** verbesserter Textkontrast auf farbigen Flächen
- **Fragenkatalog:** 182 → 272 Fragen (+90), mit Inhalts-Review
- **Fragenkatalog:** 272 → 500 Fragen (+228), validiert (validate-content.mjs) und im Server geladen

### Bedienbarkeit & Planung (Sprint 1.2)
- **Notizen:** anlegen, **bearbeiten**, löschen direkt im UI (Bugfix: stabiler
  Store-Snapshot – vorher war die Seite durch einen Renderloop unbrauchbar)
- **Kalender-Tagesplanung:** einzelne Tage öffnen, **eigene Lerninhalte**
  eintragen sowie **vorgegebene Wiederholungen** erledigen/verschieben
- **Prüfungsverlauf:** abgeschlossene Prüfungen aufrufen und Frage für Frage
  durchblättern (eigene Antwort, richtige Antwort, Erklärung)

### Ergebnisse, Review & Kalender (Sprint 1.3)
- **Lernergebnis am Ende** des Quiz (Prozent, richtig/falsch, Fragenliste mit
  Lösungen) und **auf der Modulseite** (Erfolgsquote je Modul)
- **Fehler im Review** sichtbar: „Deine Antwort" vs. „Richtige Antwort",
  Filter „Nur Fehler", Fehleranzahl je Prüfung
- **Kalender:** Planung steht **neben** dem Wiederholungsplan
- **Wiederholungsplan** kompakt je Tag/Modul gruppiert

### Feinschliff Ergebnis/Review (Sprint 1.4)
- **Quiz-Ende:** Ergebnis (richtig/falsch) erscheint jetzt zuverlässig
  (früherer „Fertig!"-Return behoben)
- **Prüfungsverlauf:** gewählte (falsche) Antwort klar markiert
  („deine Wahl" / „richtig")

### Lernbereich & Antwortoptionen (Sprint 1.5)
- **Lernbereich:** Theorie und Fragenliste stehen in eigenen Zeilen
  (full width); Fragen sind nummeriert
- **Antwortoptionen** werden je Frage **gemischt** (Quiz & Prüfung), die
  Auswertung bleibt korrekt (Rückabbildung auf Original-Buchstaben)

### Ausklappbarer Lernbereich (Sprint 1.6)
- **Theorie** und **Fragen des Moduls** sind als **ausklappbare Bereiche**
  (Akkordeon) gestaltet (Theorie offen, Fragen eingeklappt als Startzustand)
- **Jede Frage** lässt sich aufklappen und zeigt dann **Lösung + Erklärung**

### Thema und Bedienung (Sprint 1.12)
- **Theme:** Inline-Skript setzt data-theme vor dem ersten Paint, color-scheme und theme-color folgen dem Theme
- **Barrierefrei:** sichtbarer Fokusring (:focus-visible), Umschalter mit role=switch, Toast-Begrenzung auf drei Hinweise
- **Farben:** neue Variablen --neutral-ink, --accent-soft und --border-strong fuer kräftigere Badges in beiden Modi

### Quiz-Umfang und Fortschritt (Sprint 1.14)
- **Quiz:** Anzahl der Fragen waehlbar (Alle sowie 5/10/15/20/30/50); die Auswahl
  wird gespeichert (azubiprep.quizoptionen) und als Deep-Link uebergeben (?anzahl=N)
- **Fortschritt:** alle Balken beziehen sich auf alle Fragen des Moduls (Abdeckung),
  die Erfolgsquote steht als Prozentwert daneben (Lernbereich, Modul, Statistik, Lernreise)

### Sicherheit (Sprint 1.15)
- **Pruefung:** 17 Befunde (statische Analyse + Live-Tests), Paket A/B umgesetzt, Restrisiken dokumentiert
- **Haertung:** Admin-Reload nur lokal/Token, Security-Header mit CSP, kein CORS, Ratenbegrenzung, generische Fehler
- **Abhaengigkeiten:** helmet ergaenzt, cors entfernt, `npm audit` Backend 0 Vulnerabilities (prod)
- **Doku:** docs/17-Sicherheit.md (inkl. akzeptierter Risiken F6-F8, F10, Betriebsempfehlungen)
- **Test:** backend/scripts/sicherheits-check.mjs

### Gamification (Sprint 1.7)
- **XP-System** mit idempotenter Vergabe (kein Doppel-XP) und Belohnungs-Toast
- **Level** mit spielerischen Titeln (Start 75 XP, exponentiell): Lehrling, Novize, Adept, Magier, Archmagier, Grossmeister, Pruefungsweiser, Legende
- **XP-Regeln:** erstmalig richtig 5 XP, +3 schwer, +5 Fehler spaeter richtig, +25 Quiz, +50 Pruefung
- Dashboard-Karte zeigt Level, Titel, XP und Fortschritt zum naechsten Level
- **Phase 2:** Level/XP in der Statistik, Tagesziel (10 Fragen, +30 XP) und Wochenziel (3 aktive Tage) als Fortschrittskarten
- **Barrierefreiheit:** Animationen respektieren prefers-reduced-motion
- **Phase 3:** 10 Abzeichen mit einmaliger Vergabe (zentral in addXp) und Fortschritt fuer gesperrte Ziele
- **Modul-Status:** bearbeitet / beherrscht (ab 80 % Erfolgsquote) in Lernbereich, Modulseite und Statistik
- **Belohnungen:** zentrale Meldungen (utils/belohnung.js) fuer XP, Level-Up, Abzeichen und Modul-Status
- **Phase 4:** 8 Missionen (3 taeglich, 5 woechentlich) mit Fortschritt, Perioden-Reset und XP-Belohnung
- **Missionen:** Zaehler in azubiprep.game.missionen, gespeist aus Quiz, Pruefung und Tagesziel (kein Timer noetig)
- **Phase 5:** Lernreise unter /lernreise – Stationen-Karte je Fachrichtung inkl. gemeinsamer Module (ALLE)
- **Barrierefrei:** Listenansicht (Tabelle) mit identischen Angaben, aria-pressed-Umschalter, Status als Text statt nur Farbe
- Plan: docs/16-Gamification-Plan.md

### Content-/Backend-Reparatur (2026-09-14)
- **Backend fehlte vollständig** (vermutlich durch einen Node-Übertragungsfehler beim
  Kopieren via USB-Stick auf den jetzigen Rechner): `backend/` mit allen in der Doku
  beschriebenen Modulen (Express-App, Content-Loader, Antwortprüfung, Prüfungslogik,
  Security-Härtung, Wartungsskripte) wurde gemäß `docs/09-API-Referenz.md`,
  `docs/10-Architektur.md`, `docs/14-Betrieb-Wartung.md` und `docs/17-Sicherheit.md`
  neu aufgesetzt und gegen die tatsächlichen Frontend-Aufrufe (Fetch-Verträge in
  `frontend/src/pages/*`) verifiziert.
- **CSV-Formatfehler behoben:** 16 Fragenzeilen in 10 Modulen hatten wegen eines
  unquotierten `;` im Feld `erklaerung` eine falsche Spaltenzahl (Schwierigkeit/Quelle
  waren dadurch verrutscht). Repariert mit `backend/scripts/repair-ft-rows.mjs`.
- **11 Zeilen** mit führendem Leerzeichen nach dem Trennzeichen (z. B. `; leicht`
  statt `;leicht`) bereinigt.
- **Kern-Logik verifiziert:** Content-Laden, Antwortprüfung (SC/MC/FT) und
  Prüfungsgenerierung/-auswertung wurden mit 33 automatisierten Prüfungen
  gegenprobiert (0 Fehler). Ein vollständiger HTTP-Smoke-Test (`npm install`,
  laufender Server) konnte in der Cloud-Arbeitsumgebung nicht durchgeführt werden,
  da der Zugriff auf die npm-Registry dort durch die Netzwerk-Policy blockiert ist –
  das sollte einmal lokal nachgeholt werden (`cd backend && npm install && npm start`,
  danach `node scripts/validate-content.mjs` und `node scripts/sicherheits-check.mjs`).

## 3. Inhaltsbestand (Detail)

> Stand dieser Tabellen: 2026-09-14, erzeugt mit `backend/scripts/content-statistik.mjs`
> (vorherige Fassung war seit dem Fragenausbau auf 500 nicht mehr aktualisiert worden).

### Fragen je Fachrichtung
| Fachrichtung | eigene Fragen | + gemeinsame ALLE | nutzbar |
|---|---|---|---|
| FIAE | 107 | 72 | 179 |
| FISI | 107 | 72 | 179 |
| DPA | 107 | 72 | 179 |
| DVK | 107 | 72 | 179 |

### Fragen je Modul
| Modul | Titel | Fragen (SC/MC/FT) | Theorie |
|---|---|---|---|
| WISO | Wirtschafts- und Sozialkunde | 40 (32/6/2) | ✅ |
| PM | Projektmanagement | 32 (26/4/2) | ✅ |
| FIAE-PRG | Programmierung und OOP | 27 (25/2/0) | ✅ |
| FIAE-DB | Datenbanken und SQL | 27 (22/4/1) | ✅ |
| FIAE-SWE | Softwareentwicklung / Vorgehensmodelle | 27 (25/2/0) | ✅ |
| FIAE-TST | Softwarequalität und Testen | 26 (22/2/2) | ✅ |
| FISI-NET | Netzwerktechnik | 27 (25/1/1) | ✅ |
| FISI-SEC | IT-Sicherheit | 27 (22/3/2) | ✅ |
| FISI-BET | Betriebssysteme und Server | 26 (25/0/1) | ✅ |
| FISI-SYS | Hardware, Virtualisierung, Cloud | 27 (23/2/2) | ✅ |
| DPA-DB | Datenbanken und SQL | 27 (23/2/2) | ✅ |
| DPA-DS | Data Science und KI-Grundlagen | 27 (22/3/2) | ✅ |
| DPA-ANA | Datenanalyse und Statistik | 26 (22/2/2) | ✅ |
| DPA-PRO | Prozessmodellierung und -optimierung | 27 (23/2/2) | ✅ |
| DVK-IOT | IoT und eingebettete Systeme | 27 (23/1/3) | ✅ |
| DVK-NET | Vernetzung und Kommunikation | 27 (24/1/2) | ✅ |
| DVK-AUT | Automatisierung und Industrie 4.0 | 26 (22/2/2) | ✅ |
| DVK-CLD | Cloud- und Edge-Computing | 27 (24/1/2) | ✅ |

**Schwierigkeitsverteilung:** leicht 126 · mittel 309 · schwer 65 (Summe 500).

## 4. Projektstruktur

```
AzubiPrep/
├── ORCHESTRATOR.md          Agenten-Workflow (Task-Briefs + Review)
├── AGENTS.md                Konventionen für alle Agenten
├── README.md                Schnellstart
├── .gitignore
├── content/                 Inhalte (Excel/CSV, Daten – kein Code)
│   ├── fachrichtungen.csv
│   ├── modules.csv
│   ├── questions/*.csv      18 Dateien (eine je Modul)
│   └── theorie/*.md         18 Theorie-Dateien
├── backend/                 Node.js + Express (stateless Content-API)
│   ├── package.json
│   ├── src/
│   │   ├── server.js        Einstieg
│   │   ├── app.js           Express-App & Routen
│   │   ├── config.js        Ports/Pfade
│   │   ├── content.js       CSV/Markdown laden & indizieren
│   │   ├── csv.js           robuster CSV-Parser
│   │   ├── answer.js        Antwortprüfung SC/MC/FT
│   │   ├── exam.js          Prüfungs-Generierung & Auswertung
│   │   ├── sicherheit.js    Security-Header, Rate-Limit, Admin-Schutz
│   │   └── routes/          content.routes (inkl. Suche) · exam.routes
│   └── scripts/             validate-content · repair-ft-rows · content-statistik ·
│                             sicherheits-check
├── frontend/                React + Vite (PWA)
│   ├── package.json, vite.config.js, index.html
│   ├── public/              manifest.webmanifest · sw.js · Icons
│   ├── scripts/gen-icons.mjs
│   └── src/
│       ├── App.jsx, main.jsx
│       ├── pages/           12 Seiten
│       ├── components/      Layout · FrageKarte
│       ├── store/           localStore · examStore · miniStore
│       ├── api/client.js
│       ├── context/ThemeContext.jsx
│       ├── utils/           useApi · markdown · fragen · antworten
│       └── styles/global.css
└── docs/                    17 Dokumente + agent-briefs/
```

## 5. Technische Basis

| Bereich | Technologie | Version |
|---|---|---|
| Laufzeit | Node.js | v24.19.0 |
| Backend | Express | ^4.19.2 (+ cors) |
| Frontend | React | ^18.3.1 |
| Build/Routing | Vite ^5.4, React Router ^6.26 | – |
| Persistenz | `localStorage` (kein SQL, kein Login) | – |
| Inhalte | CSV (`;`-getrennt, UTF-8) + Markdown | – |

## 6. Start & Bedienung

```bash
# Entwicklung
cd backend  && npm install && npm start     # API auf :3001
cd frontend && npm install && npm run dev   # Dev-UI auf :5173

# Produktion (ein Port)
cd frontend && npm run build
cd ../backend && npm start                  # App + API auf :3001
```

Der Backend-Server serviert im Produktionsmodus das gebaute Frontend unter
derselben Origin (`http://localhost:3001`).

## 7. Qualitätssicherung / verifizierter Stand

> Hinweis (2026-09-14): Die vorherige Fassung dieser Tabelle verwies auf ein
> `backend/` und `docs/agent-briefs/`, die im Projektordner tatsächlich nicht
> vorhanden waren (vermutlich ein Übertragungsfehler beim Rechnerwechsel).
> Die Tabelle unten zeigt, was in dieser Sitzung tatsächlich neu gebaut und
> geprüft wurde – inkl. dem, was noch offen ist.

| Prüfung | Werkzeug | Ergebnis |
|---|---|---|
| Content-Validierung | `backend/scripts/content-statistik.mjs` | 500 Fragen, 18 Module (Zahlen s. o.) |
| Fragen-/Antwortformat | `backend/scripts/validate-content.mjs` | ✅ VALIDIERUNG OK |
| CSV-Spaltenreparatur | `backend/scripts/repair-ft-rows.mjs` | 16 Zeilen korrigiert (10 Dateien), Lauf ist idempotent |
| Whitespace-Bereinigung | manuell (Trim aller Felder) | 11 Zeilen korrigiert (führendes Leerzeichen) |
| Backend-Kernlogik (Content-Laden, Antwortprüfung SC/MC/FT, Prüfungs­generierung/-auswertung) | eigenes Testskript (33 Prüfungen) | ✅ 33/33 bestanden |
| Backend-Syntax | `node --check` auf alle `src/`- und `scripts/`-Dateien | ✅ fehlerfrei |
| `npm install` (lokal, Windows) | – | ✅ 69 Pakete, 0 Vulnerabilities |
| Backend-Start (lokal) | `npm start` | ✅ läuft auf `http://127.0.0.1:3001`, lädt 500 Fragen/18 Module |
| HTTP-API-Smoke-Test (Endpunkte, Header, Rate-Limit) | `backend/scripts/sicherheits-check.mjs` | ✅ 10/10 bestanden (lokal verifiziert, 2026-09-14) |
| Frontend-Build | `npm run build` | ⏳ nicht in dieser Sitzung erneut geprüft |
| Notizen-Format / Notizen im UI | – | ⏳ nicht in dieser Sitzung geprüft |

Der in `ORCHESTRATOR.md` beschriebene Review-Workflow über
`docs/agent-briefs/` konnte nicht nachvollzogen werden, da dieser Ordner
im Projektverzeichnis fehlt.

## 8. Architektur-Entscheidungen (bewusst)

- **Keine Datenbank, kein Login, kein Docker** (MVP-Vorgabe) → einfachstes
  Hosting, Fortschritt lokal auf dem Gerät.
- **Inhalte = Daten**: Pflege über Excel/CSV, keine Codeänderung nötig.
- **Stateless Backend**: liest CSV beim Start; `POST /api/admin/reload`
  lädt Inhalte ohne Neustart neu.
- **Repository-Seam**: spätere Anbindung von PostgreSQL/Login/Sync ohne
  Umbau der UI.

## 9. Offene Punkte / Nächste Schritte (Backlog)

| Priorität | Vorhaben |
|---|---|
| hoch | Installierten Desktop-Installer (`AzubiPrep Setup 0.1.0.exe`) einmal durchtesten (Installation + App-Start + Klicktest), bisher nur der Dev-Modus (`npm start`) verifiziert |
| hoch | Inhalts-Review durch Fachkundige (Menschen mit Berufspraxis) je Fachrichtung – KI-gestützter Review bereits erfolgt, siehe [`18-Fachreview-Fragenkatalog.md`](18-Fachreview-Fragenkatalog.md) |
| erledigt | Fragenbestand auf 500 ausgebaut (INC-044) |
| erledigt | Backend lokal installiert & gestartet, `sicherheits-check.mjs` 10/10 bestanden (2026-09-14) |
| erledigt | Backend neu aufgesetzt, CSV-Formatfehler (16 Zeilen) und Whitespace (11 Zeilen) repariert (2026-09-14) |
| erledigt | Frontend-Produktions-Build gegengeprüft (73 Module, `dist/` inkl. PWA-Assets vollständig) (2026-09-14) |
| erledigt | Desktop-App (Electron) gebaut: `desktop/` startet Backend+Frontend im eigenen Fenster, lokal getestet (2026-09-14) |
| erledigt | Windows-Installer (NSIS) über `electron-builder` gebaut (2026-09-14) |
| erledigt | Versionskontrolle eingerichtet: GitHub-Repository angelegt, `.gitignore` ergänzt, öffentlich veröffentlicht (2026-09-14) |
| mittel | UX-Feinschliff nach weiterem Nutzerfeedback |
| mittel | Push-Benachrichtigungen (Web-Push, benötigt Backend-Persistenz) |
| niedrig | Login/Rollen + Geräte-Sync (PostgreSQL) |
| niedrig | Autoren-Weboberfläche statt Excel-Pflege |
| niedrig | Windows-Installer digital signieren (aktuell unsigniert, SmartScreen-Warnung beim ersten Start) |

> In Sprint 1.1 umgesetzt: Suche-Deep-Link, Schwierigkeitsfilter, Kalender-
> navigation, Notizen-Export/Import, Dark-Mode-Kontrast, +90 Fragen.

## 10. Bekannte Einschränkungen

- Freitext-Antworten (FT) werden per **Schlüsselwortvergleich** bewertet,
  nicht durch KI – synonyme Formulierungen müssen als Synonyme gepflegt sein.
- Ohne Login ist **kein geräteübergreifender Fortschritt** möglich.
- Offline-Prüfungsabgabe benötigt beim Absenden eine Verbindung (Auswertung
  erfolgt serverseitig); die Antworten bleiben lokal erhalten.

