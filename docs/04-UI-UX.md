# UI/UX-Konzept

## Gestaltungsprinzipien
- **Mobile-first, responsiv**: Desktop-Sidebar, auf schmalen Bildschirmen
  untere Navigationsleiste.
- **Dark Mode & Light Mode** per CSS-Variablen; Systemeinstellung wird beim
  ersten Start übernommen, Auswahl wird gespeichert.
- **Klare Lernpfade**: weniger Klicks, eindeutige Call-to-Action-Buttons.
- **Barrierefrei**: ausreichende Kontraste, Fokus sichtbar, semantisches HTML,
  große Touch-Ziele.

## Seiten
| Route | Inhalt |
|---|---|
| `/` | Dashboard: Kennzahlen, fällige Karten, letzte Prüfung, Schnellstart |
| `/lernen` | Lernbereich mit Fachrichtungs- & Modulauswahl |
| `/lernen/:modulId` | Modul-Detail: Theorie, Fragenliste, Quiz-Einstieg |
| `/quiz/:modulId` | Quizmodus (Sofort-Feedback) |
| `/karteikarten` | Karteikarten-Training mit Spaced Repetition |
| `/pruefung` | Konfiguration der Prüfungssimulation |
| `/pruefung/lauf` | Laufende Prüfung mit Timer |
| `/pruefung/ergebnis` | Auswertung + Stärken/Schwächen |
| `/pruefung/verlauf` | Abgeschlossene Prüfungen auflisten & durchblättern |
| `/statistik` | Erfolgsquoten je Modul, Kartenverteilung, Verlauf |
| `/kalender` | Lernkalender, Serien, Wiederholungsplan |
| `/notizen` | Lokale Lernnotizen |
| `/einstellungen` | Profil, Fachrichtung, Prüfungstermin, Daten löschen |

## Design-Tokens (Auszug)
- Schrift: „Plus Jakarta Sans" (Headlines/UI) + „Inter"/System-Stack als
  Fallback (funktioniert auch offline ohne Internet)
- Akzentfarbe: Teal `--primary` (`#0D9488`/`#14B8A6`), Erfolg Grün, Fehler
  Rot, Warnung Amber, Info-Akzent Sky-Blau
- Abstände über `--radius` (14px, Buttons/Inputs `--radius-sm` 10px), Karten
  mit weichem Schatten
- Komponenten in `frontend/src/styles/global.css` über Variablen thematisierbar

## Design-System-Redesign (ab FE-008, Grundlage: Stitch-AI-Analyse)

Sven hat mit Stitch AI eine Redesign-Analyse erstellt (siehe `docs/agent-briefs/FE-008-design-tokens-stitch.md`
für die konkrete Token-Umsetzung). Die folgenden Prinzipien gelten als
**verbindliche Leitlinie für alle weiteren Seiten-Anpassungen**, auch ohne
dass für jede Seite ein eigener Screenshot vorliegt:

**Warum weg vom „1-Prompt-AI-Look":** übersättigtes Neon-Lila/Electric-Blue
und reines Schwarz/Weiß wirken generisch und ermüden bei langen
Lernsessions die Augen (Halation-Effekt bei Astigmatismus, zu hohe
Leuchtdichte bei reinem Weiß).

**Farb- & Ergonomie-Konzept:**
- **Dark Mode:** sattes, warmes Anthrazit/Graphit (`--bg`/`--bg-soft`/
  `--bg-card`) statt kühlem Schwarz oder Navy – kein reines `#000000`.
  Primärfarbe Teal/Salbeigrün (beruhigend, signalisiert im
  Bildungs-/IT-Kontext Konzentration & Fortschritt), warme Amber-Akzente für
  Streaks/XP/Gamification.
- **Light Mode:** dezentes, warmes Off-White (`#F8FAFC`) als Seitenhintergrund,
  reines Weiß nur für angehobene Karten/Flächen – kein grelles
  Vollflächen-Weiß.
- **Typografie:** moderner, sehr gut lesbarer Sans-Serif mit klarer
  Zifferndarstellung (Plus Jakarta Sans/Inter), wichtig für Code-,
  Prüfungs- und Tabellendaten.

**Layout-Grundmuster (bleibt über alle Seiten erhalten):**
- Sidebar links, strukturierter Inhaltsbereich rechts (Fitts's Law,
  F-förmiges Lesemuster) – nicht antasten.
- Wo sinnvoll: breite Hauptspalte (Kerninhalt) + schmalere Seitenleiste
  (Schnellzugriffe, KPIs, Kontext-Infos) statt einspaltig gestapelter Karten
  mit viel Leerraum – siehe Dashboard (`Dashboard.jsx`, `.dashboard-layout`)
  als Referenzumsetzung.
- Fokussierte, „distraction-free" Detailansichten für Lerninhalte
  (Karteikarten, Quiz): klar abgegrenzte Antwortoptionen, Tastatur-Shortcuts
  wo möglich, dezenter Fortschrittsbalken statt aufdringlicher Elemente.
- Gruppierung durch Card-Container mit subtilen Status-Badges statt langer
  Listen (z. B. Module nach Fachrichtung, Kalendertage mit
  farbcodierten Aktivitäts-Dots statt vollflächigen Farbblöcken).

**Bereits umgesetzt:** FE-008 (Farb-/Typografie-Grundlage, global),
Dashboard-Layout (Haupt-/Seitenspalte). Offen: Karteikarten (fokussierte
Study-Card + Session-Metriken-Seitenleiste), Lernbereich (Modul-Card-Gruppierung),
Kalender (Aktivitäts-Dots), Prüfungssimulation (dezenter Timer).

## Komponenten-Struktur
```
frontend/src/
├── components/  Layout, FrageKarte
├── pages/       je Route eine Seite
├── store/       localStorage (Profil, Fortschritt, Karten, Notizen, Prüfungen)
├── api/         client + Repositories (API-Seam)
├── utils/       Markdown-Renderer, Fragen-Helfer, useApi-Hook
└── styles/      global.css
```

## Bedienhilfen (Sprint 1.1)

- **Suche → Frage:** Fragentreffer verlinken per Deep-Link direkt auf die
  konkrete Frage (`/quiz/<modul>?frage=<id>`); die gesuchte Frage wird zuerst
  angezeigt. Zusätzlich Button „Modul" zum Modul-Detail.
- **Schwierigkeit filtern:** In Quiz (`/quiz/...`) und Prüfungssimulation
  lässt sich die Schwierigkeit optional auf leicht/mittel/schwer einschränken
  (Standard: alle).
- **Kalender:** Monatsnavigation (« Zurück · Heute · Weiter »); Zukunfts-Tage
  werden relativ zum angezeigten Monat gedimmt.
- **Notizen:** Export als `.txt` und Wieder-Import – die Datei ist in
  Notepad/Editor bearbeitbar (Format siehe `08-Datenformate.md`).
- **Barrierefreiheit/Kontrast:** Eigene Textfarben („Ink"-Variablen) sorgen im
  Dark Mode für lesbare Badges/Alerts (kein Grün auf Grün).


## Bedienhilfen (Sprint 1.2)

- **Notizen:** können im UI angelegt, **bearbeitet** und gelöscht werden.
  Technischer Hinweis: Der Store liefert einen stabilen Snapshot für
  `useSyncExternalStore` (vorher instabiler Snapshot → Renderloop, Seite
  unbrauchbar).
- **Kalender-Tagesplanung:** Klick auf einen Tag öffnet ein Panel mit
  - **eigenen Lerninhalten** (anlegen, abhaken, löschen), und
  - **Anpassung der Wiederholungen** (Karteikarten): „Erledigt" (nächste Box)
    oder Verschieben auf ein neues Datum.
  Tage mit eigener Planung sind markiert, Tage mit fälligen Wiederholungen
  tragen einen Punkt.
- **Prüfungsverlauf (`/pruefung/verlauf`):** abgeschlossene Prüfungen
  auflisten (neueste zuerst) und Frage für Frage **durchblättern** –
  mit eigener Antwort, richtiger Antwort und Erklärung. Deep-Link
  `?index=<n>`; erreichbar über Navigation, Statistik und Prüfungsseite.


## Ergebnisse & Review (Sprint 1.3)

- **Lernergebnis am Ende des Lerninhalts**
  - Quiz: Ergebnisübersicht (Prozent, richtig/falsch) + Liste aller Fragen mit
    eigener/richtiger Antwort und Erklärung; Umschalter **„Nur Fehler"**.
  - Modulseite: Karte „Dein Lernergebnis in diesem Modul" (beantwortet, richtig,
    falsch, Erfolgsquote, Fortschrittsbalken).
- **Fehler in der späteren Ansicht (Prüfungsverlauf):** Jede Frage zeigt
  **„Deine Antwort"** und **„Richtige Antwort"**, falsche Optionen sind rot,
  richtige grün markiert; Filter **„Nur Fehler"** schränkt Navigation und
  Sprungliste ein; die Liste nennt die Fehleranzahl je Prüfung.
- **Kalender-Layout:** Kalender, **Wiederholungsplan** und (bei gewähltem Tag)
  die **Planung** stehen im gleichen Raster nebeneinander und stapeln auf
  schmalen Bildschirmen.
- **Wiederholungsplan kompakt:** je Tag gruppiert nach Modul
  (z. B. „FISI-NET ×4 · FIAE-DB ×2") statt Einzelzeilen.


## Feinschliff Ergebnis/Review (Sprint 1.4)

- **Quiz-Ende:** Nach der letzten Frage erscheint jetzt die **Ergebnisansicht**
  (Summe richtig/falsch, Prozent, Fragen-Review mit „Nur Fehler").
  Zuvor verdeckte ein früher „Fertig!"-Zustand diese Ansicht.
- **Prüfungsverlauf:** Die **gewählte Antwort** wird eindeutig hervorgehoben –
  falsche Wahl rot mit Label **„deine Wahl"**, richtige Option grün mit Label
  **„richtig"**; zusätzlich die Zeile „Deine Antwort (falsch): … · Richtige
  Antwort: …".

