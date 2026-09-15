# Brief FE-010: Redesign-Abschluss – Lernbereich, Kalender, Prüfungssimulation

Status: done
Bereich: FE
Angelegt: 2026-09-15
Abgeschlossen: 2026-09-15

## Ziel (1–3 Sätze)

Letzte Phase des Stitch-Redesigns (nach FE-008 Farben/Typografie, FE-009
Dashboard/Karteikarten): die noch offenen Punkte aus den Leitlinien in
`docs/04-UI-UX.md` auf die verbleibenden Seiten anwenden – Modul-Card-
Gruppierung im Lernbereich, Aktivitäts-Dots im Kalender, dezenter Timer in
der Prüfungssimulation. Damit ist die Stitch-Analyse vollständig auf die
App übertragen.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Lernen.jsx` (Modul-Karten: Status-Badge statt reiner
  Text, kompaktere Gruppierung)
- `frontend/src/pages/Kalender.jsx` (Tagesmarkierungen als farbcodierte
  Dots statt vollflächiger Hintergrundfarbe)
- `frontend/src/pages/PruefungLauf.jsx` (Timer-Anzeige dezenter statt
  auffälliger Countdown-Optik)
- `frontend/src/styles/global.css` (ggf. neue kleine Hilfsklassen für
  Dots/dezenten Timer)
- `frontend/src/pages/Lernreise.jsx`, `frontend/src/utils/lernreise.js`
  (Nachtrag auf Svens Wunsch, nicht ursprünglich Teil des Briefs:
  Reihenfolge „Gemeinsame Module" vor „Deine Fachrichtung" getauscht –
  pädagogisch sinnvollerer Einstieg)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/04-UI-UX.md`, Abschnitt „Design-System-Redesign" (Svens
  Stitch-Analyse – verbindliche Leitlinie, insbesondere „Gruppierung durch
  Card-Container mit subtilen Status-Badges … Kalendertage mit
  farbcodierten Aktivitäts-Dots statt vollflächigen Farbblöcken" und
  „dezenter Fortschrittsbalken statt aufdringlicher Elemente")
- `docs/agent-briefs/FE-009-dashboard-karteikarten-layout.md` (vorige
  Phase, inkl. der beiden Nachbesserungen zu Abstand/Umbruch – gleiche
  Sorgfalt bei engen/weiten Layouts hier ebenfalls beachten)

## Umsetzungsschritte (Checkliste)

- [x] Lernbereich: Modulkarten bekommen ein kompaktes Status-Badge
      (offen/in Bearbeitung/beherrscht) statt nur Fließtext-Badge unten,
      damit der Bearbeitungsstand auf einen Blick erkennbar ist
- [x] Kalender: Tage mit fälligen Wiederholungen/eigener Planung zeigen
      kleine farbcodierte Punkte statt vollflächiger Hintergrundfarbe
- [x] Prüfungssimulation: Timer dezenter gestaltet (kleiner, gedämpfte
      Farbe, kein großer auffälliger Countdown-Block)
- [x] `docs/04-UI-UX.md` „Bereits umgesetzt/Offen"-Liste aktualisieren

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Lernbereich: Bearbeitungsstand einer Modulkarte ist ohne Lesen des
      Fließtexts erkennbar
- [x] Kalender: bestehende Funktionen (Tagesklick, Planung, Monatsnavigation)
      funktionieren unverändert, Tage sind weiterhin eindeutig
      unterscheidbar (fällig/eigene Planung/beides/nichts)
- [x] Prüfungssimulation: Timer lenkt nicht mehr vom Inhalt ab, bleibt aber
      jederzeit ablesbar

## Ergebnis (wird beim Abschluss ausgefüllt)

Von Sven geprüft und bestätigt am 2026-09-15.

Umgesetzt wie geplant:

1. **Lernbereich** (`Lernen.jsx`): Modulkarte bekommt oben rechts ein
   Status-Badge (offen/bearbeitet/beherrscht) direkt neben dem
   Fachrichtungs-Badge, zusätzlich einen 3px farbigen linken Kartenrand
   passend zum Status (`STATUS_AKZENT`-Map: neutral/border → warning →
   success). Erfolgsquote-Badge bleibt als sekundäre Info weiter unten.
2. **Kalender** (`Kalender.jsx`, `global.css`): zweiter Punkt-Typ
   `.cal-dot-plan` (accent-Farbe) ergänzt, sodass Tage mit fälliger
   Wiederholung und/oder eigener Planung durch bis zu zwei
   unterscheidbare kleine Punkte statt nur vollflächiger Hintergrundfarbe
   markiert sind; Legende entsprechend erweitert. Bestehendes
   `.active`/`.hasplan`-Verhalten (weich getönter Hintergrund bzw.
   Rahmen) unverändert gelassen, da bereits im Sinne der Leitlinie
   „subtil" war.
3. **Prüfungssimulation** (`PruefungLauf.jsx`): Timer ist im Normalfall
   nur gedämpfter Fließtext (`text-muted`), wird erst unter 5 Minuten
   Restzeit zum roten Warn-Badge – vorher war es durchgehend ein
   auffälliges Badge kombiniert mit dem Beantwortet-Zähler.
4. **Nachtrag auf Svens Wunsch** (`Lernreise.jsx`, `utils/lernreise.js`):
   Reihenfolge „Gemeinsame Module" vor „Deine Fachrichtung" getauscht
   (Karten- und Listenansicht sowie die „nächste Station"-Empfehlung,
   die auf derselben Reihenfolge basiert) – sinnvollerer Einstieg für
   Lernende.

Damit ist die komplette Stitch-Redesign-Analyse (Farben/Typografie via
FE-008, Layout-Grundmuster via FE-009/FE-010) auf alle Seiten der App
übertragen; `docs/04-UI-UX.md` ist entsprechend aktualisiert.
