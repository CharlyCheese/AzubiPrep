# AGENTS.md – Konventionen für alle Agenten im Projekt AzubiPrep

Projektziel: **PWA zur IHK-Prüfungsvorbereitung für Fachinformatiker** (FIAE,
FISI, DPA, DVK). Stack: React (Vite), Node/Express, Inhalte als CSV
(Excel-editierbar), kein Docker im MVP.

Datenbank/Login sind seit `DB-001` (siehe `docs/agent-briefs/`) **optional**
vorhanden: ohne `DATABASE_URL` läuft die App weiterhin ohne Konto, mit
Lernstand rein im `localStorage` des Browsers; ist eine PostgreSQL-Verbindung
konfiguriert, sind Registrierung/Login/Sync aktiv (siehe
`docs/19-Datenbank-Login.md`). Wichtig: "ohne Konto" ist NICHT dasselbe wie
"offline" – der Node/Express-Server muss in beiden Fällen laufen und über
das Netzwerk erreichbar sein. Echte Offline-Fähigkeit (Browser ohne
Netzwerkverbindung) kommt ausschließlich vom Service Worker/PWA-Caching und
ist strikt begrenzt (siehe `docs/11-PWA-Konzept.md`, Abschnitt
"Offline-Verhalten").

## Grundregeln

1. **Token-sparend arbeiten**: Nie ganze Projektdateien lesen, wenn ein
   Task-Brief reicht. Nur die im Brief genannten Dateien anfassen.
2. **Task-Brief-Pflicht**: Jede Änderung erfolgt über einen Brief in
   `docs/agent-briefs/`. Erst Brief lesen, dann ändern.
3. **Review-Pflicht (bindend, kein Ermessen – Sven, 2026-09-19)**: Ein
   frischer Subagent (eigener Kontext, kein geteilter Chat-Verlauf) prüft
   gegen die Abnahme-Kriterien des Briefs, bevor ein Task als fertig
   gemeldet wird – bei inhaltlichen/fachlichen Änderungen (insbesondere
   neue oder umsortierte Prüfungsfragen) unabhängig von der Größe der
   Änderung. Ursprünglich nur "empfohlen bei größeren Änderungen"; Sven hat
   sich bei `CONTENT-008` explizit dafür entschieden, das verbindlich zu
   machen ("die agenten struktur muss eingehalten werden, mir ist das
   lieber wenn alles ein wenig länger dauert aber dafür sauber ist"). Der
   ausführende Agent hat dabei selbst den Fragen-Batch erstellt und darf
   daher nicht der einzige Prüfer sein – der Subagent-Review ist ein
   zweiter, unabhängiger Blick, ersetzt aber nicht Svens eigenen
   Fachreview.
   **Wichtiger Hinweis für den Review-Prompt (Sven, 2026-09-19, aus
   `CONTENT-010`-Klärung):** Jeder Subagent, der Fragen prüft, muss im
   Prompt mitbekommen, dass `frontend/src/utils/optionen.js#mischeOptionen()`
   die Antwortoptionen bei jeder Anzeige per Fisher-Yates neu mischt (mit
   Rückabbildung auf die Original-Buchstaben) – in allen echten
   Abfrage-Ansichten (`Quiz.jsx`, `Pruefung.jsx`, `Karteikarten.jsx`,
   `PruefungLauf.jsx`). Eine unausgewogene oder sogar identische Verteilung
   der `antwort`-Spalte in der CSV (z. B. wenn viele/alle Fragen eines
   Batches "b" als korrekte Antwort haben) ist deshalb **kein Fehler** und
   darf vom Review-Subagenten nicht als Finding gemeldet werden – die CSV-
   Spalte ist nur Rohdatenspeicher, den Nutzern wird die Reihenfolge nie
   in dieser Form angezeigt.
   **Zweiter wichtiger Hinweis (Sven, 2026-09-19, aus `CONTENT-012`/
   `CONTENT-013`-Erfahrung):** Anders als die Antwort-Position ist die
   Antwort-**Länge/der Detailgrad** kein Nicht-Problem – das Mischen der
   Anzeigeoptionen ändert nur die Position, nicht den Text selbst. Wenn
   die korrekte Antwort durchgängig länger/ausführlicher formuliert ist
   als die Distraktoren, oder wenn Distraktoren ein wiederkehrendes
   Füllwort-Muster nutzen (z. B. "ausschließlich", "grundsätzlich",
   "automatisch", "gesetzlich vorgeschrieben" als Signalwort für "diese
   Option ist falsch"), bleibt das auch nach dem Mischen ein Rateindikator
   und MUSS vom Review-Subagenten als Finding gemeldet werden. Beim
   Erstellen neuer Fragen-Batches ist von Anfang an auf vergleichbare
   Länge/Detailgrad zwischen korrekter Antwort und Distraktoren zu achten
   und das genannte Füllwort-Muster zu vermeiden, statt es dem Review zu
   überlassen, es im Nachhinein zu finden.
   **Dritter wichtiger Hinweis (aus `CONTENT-027`–`CONTENT-032`-Erfahrung,
   insbesondere `CONTENT-032`/DPA-PRO mit 7 nötigen Review-Durchläufen):**
   Über die konkreten Füllwörter hinaus (bisher gefunden: "ausschließlich",
   "grundsätzlich", "automatisch", "gesetzlich vorgeschrieben",
   "vollständig", "jede(r)", "nie", "sämtliche", "überhaupt", "keinerlei",
   "dauerhaft", "stets", "nur", "komplett", "lediglich", "zwingend",
   "rein", "dabei", "insgesamt", "besonders", "endgültig") gibt es zwei
   strukturelle Meta-Tell-Muster, die genauso ein Rateindikator sind und
   beim Erstellen wie beim Review geprüft werden müssen:
   (a) eine über 3+ Fragen hinweg **wortgleiche oder nahezu wortgleiche
   Phrase** (nicht nur ein Einzelwort), die ausschließlich in Distraktoren
   auftaucht und in keiner der korrekten Antworten des Batches vorkommt
   (Beispiele aus der Praxis: "Wie viele ...?" als Interrogativ-Öffner,
   "Sortiert ..." als Satzanfang, "Beide [X] ... identisch/denselben" als
   Vergleichs-Schablone);
   (b) alle drei Distraktoren **einer einzelnen** Frage, die dasselbe
   Eröffnungswort oder dieselbe Satzschablone teilen, während die korrekte
   Antwort sprachlich klar abweicht.
   **Kein** Fehler sind dagegen generische Sachbegriffe, die zufällig in
   mehreren Distraktoren auftauchen (z. B. "Kosten", "Anzahl", "technische",
   "beteiligt", "Dokumentation", "Mitarbeiter") – das ist normales,
   thematisch plausibles Distraktor-Vokabular und darf nicht gemeldet
   werden, solange es kein starres Schema nach (a) oder (b) bildet. Diese
   Abgrenzung MUSS im Review-Prompt an den Subagenten explizit mitgegeben
   werden (inkl. Beispielen für "ja, das ist ein Finding" vs. "nein, das
   ist nur ein Sachbegriff"), sonst führt reflexhaftes Melden jedes
   wiederkehrenden Wortes zu unnötig vielen Korrekturrunden.
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
