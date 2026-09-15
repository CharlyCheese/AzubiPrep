# Brief FE-009: Dashboard- & Karteikarten-Layout nach Stitch-Vorlage (Phase 2)

Status: done
Abgeschlossen: 2026-09-15
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Phase 2 des Redesigns (nach FE-008, Farb-/Typografie-Grundlage): die
seitenspezifischen Layout-Verbesserungen aus Svens Stitch-Referenzen für
Dashboard und Karteikarten umsetzen – breite Hauptspalte + schmale
Seitenleiste statt einspaltig gestapelter Karten mit viel Leerraum, passend
zu den in `docs/04-UI-UX.md` festgehaltenen Leitlinien.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Dashboard.jsx` (Hauptspalte: Ziele/Missionen/letzte
  Prüfung; Seitenleiste: Schnellstart, KPI-Kacheln, Fachrichtung)
- `frontend/src/pages/Karteikarten.jsx` (Hauptspalte: fokussierte Lernkarte;
  Seitenleiste: Session-Metriken, Box-Verteilung)
- `frontend/src/styles/global.css` (`.dashboard-layout`, `.grid-kpi` –
  wiederverwendbare Zweispalten-/Kachel-Klassen)
- `docs/04-UI-UX.md` (Design-System-Leitlinien aus Svens Stitch-Analyse
  dokumentiert, als Referenz für weitere Seiten ohne eigenen Screenshot)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-008-design-tokens-stitch.md` (Phase 1: Farb-/
  Typografie-Grundlage)
- `docs/04-UI-UX.md`, Abschnitt „Design-System-Redesign" (Svens
  Stitch-Analyse: Farbergonomie, Layout-Grundmuster, verbindlich für
  weitere Seiten)

## Umsetzungsschritte (Checkliste)

- [x] `.dashboard-layout` (breite Hauptspalte + schmale Seitenleiste,
      Umbruch auf eine Spalte < 960px) und `.grid-kpi` (kompaktes
      2-Spalten-Kachelraster) in `global.css` ergänzt
- [x] Dashboard: Schnellstart, 4 KPI-Kacheln (Fragen gesamt, Erfolgsquote,
      Fällige Karten, Lerntage) und Fachrichtung-Kachel in die Seitenleiste
      verschoben; Ziele/Missionen/letzte Prüfung in der Hauptspalte
- [x] Karteikarten: neue Seitenleiste „Session-Metriken" (Lernzeit diese
      Sitzung, Erfolgsquote diese Sitzung – beides reine Sitzungswerte,
      nicht persistiert) und „Kartenverteilung" (fällige Karten nach
      Leitner-Box, aus echten Store-Daten)
- [x] Design-Leitlinien aus Svens Stitch-Analyse in `docs/04-UI-UX.md`
      dokumentiert, damit weitere Seiten (Lernbereich, Kalender,
      Prüfungssimulation) ohne erneute Screenshot-Übergabe adaptiert werden
      können

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Dashboard zeigt Zweispalten-Layout auf breiten Fenstern, fällt auf
      schmalen Fenstern auf eine Spalte zurück
- [x] Karteikarten zeigt Session-Metriken (Lernzeit läuft sichtbar hoch,
      Erfolgsquote aktualisiert sich nach Bewertung einer Karte) und
      Box-Verteilung passend zu den tatsächlich fälligen Karten
- [x] Bestehende Funktionen (Stapelgröße wählen, Karte umdrehen, bewerten)
      funktionieren unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Von Sven getestet und bestätigt ("top jetzt passts") am 2026-09-15, nach
zwei Nachbesserungsrunden:

1. **Stapelgröße-Karte überlappte ihren eigenen Text** (Karteikarten-Seite):
   Ursache war, dass der Textblock (Überschrift + Beschreibung) in der
   `.flex-between`-Kopfzeile von der danebenliegenden Button-Gruppe
   zusammengequetscht wurde und dadurch zweizeilig umbrach, obwohl die
   Karte nur für eine Zeile Höhe reserviert hatte. Fix in
   `Karteikarten.jsx`: Textblock bekommt `flex: 1 1 240px; min-width: 240px`,
   Button-Gruppe `flex-shrink: 0` – dadurch bricht bei Platzmangel die
   ganze Zeile sauber um, statt den Text zu quetschen.
2. **Seitenleiste (Session-Metriken/Kartenverteilung) wurde bei mittleren
   Fensterbreiten rechts abgeschnitten**: Der Umbruch von
   `.dashboard-layout` auf eine Spalte griff erst ab 960px, was bei Svens
   Fensterbreite nicht ausreichte, um Hauptspalte + die mind. 260px breite
   Seitenleiste unterzubringen. Fix in `global.css`: Breakpoint auf 1180px
   angehoben; zusätzlich allgemein etwas mehr Abstand (Card-Padding
   20→22px, Card-Abstand 16→18px, KPI-Kachel-Gap 10→14px, Layout-Gap
   16→24px) auf Svens ausdrücklichen Wunsch ("haben genug platz").
3. **Fortschritts-Text im Lernbereich wirkte "verloren" am rechten Rand**
   (ursprüngliche Meldung, unabhängig von den beiden Punkten oben): Die
   Abschnitts-Kopfzeile (`ModulBlock` in `Lernen.jsx`) nutzte
   `justify-content: space-between`, wodurch der Fortschritts-Text bei
   Svens breitem Fenster (~1880px) ganz an den rechten Rand gerissen wurde,
   weit weg von der Überschrift links. Fix: Kopfzeile auf normales
   `flex` mit `gap: 12px` umgestellt – Überschrift und Fortschritts-Text
   stehen jetzt eng nebeneinander statt an den Rändern verteilt.

Nebenbefund (nicht Teil dieses Briefs, aber während der Fehlersuche
entdeckt): Ein im Hintergrund laufender, nicht mehr angemeldeter
OneDrive-Prozess hat Sven zwischenzeitlich Dateien nach dem Schreiben
wieder auf einen alten Stand zurückgesetzt – nach `taskkill` des
Prozesses lief die Übertragung wieder wie erwartet. Erklärt vermutlich
auch frühere "ich sehe keine Änderung"-Meldungen.
