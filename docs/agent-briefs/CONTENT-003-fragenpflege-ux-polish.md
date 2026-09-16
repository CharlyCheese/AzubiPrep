# Brief CONTENT-003: Fragenpflege-UX-Politur (Auto-Scroll, Paginierung, Suche)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Kleine UX-Nachbesserung an der `/autoren`-Seite aus `CONTENT-001`, direkt
aus Svens erstem echten Praxistest entstanden: das Bearbeiten-Formular war
schwer zu finden (erschien nur unten, ohne Hinweis), die Fragenliste hatte
keine Seitenbegrenzung, und es gab keine Möglichkeit, gezielt nach einer
Frage zu suchen.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Autoren.jsx`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/CONTENT-001-autoren-weboberflaeche.md`: Grundlage,
  auf der dieser Brief aufbaut (gleiche Seite, kein neues Feature)

## Umsetzungsschritte (Checkliste)

- [x] Auto-Scroll: Formular-Karte bekommt eine `ref`, nach dem Öffnen
      (`useEffect` auf `ausgewaehlt`) automatisch per `scrollIntoView`
      in den sichtbaren Bereich scrollen
- [x] Paginierung: 20 Fragen pro Seite, "Zurück"/"Weiter"-Buttons,
      Seite automatisch auf 1 zurückgesetzt bei Filter-/Suchänderung
- [x] Suche: Textfeld filtert clientseitig über ID/Frage/Thema der
      bereits nach Modul/Status gefilterten Liste (kein neuer
      Server-Endpunkt nötig, Datenmenge pro Fachrichtung überschaubar)

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Klick auf "Bearbeiten" scrollt automatisch zum Formular
- [x] Liste zeigt max. 20 Zeilen gleichzeitig, mit funktionierender
      Seitennavigation
- [x] Sucheingabe schränkt die Liste sofort ein, ohne Serveranfrage
- [x] Bestehende Filter (Modul, Review-Status) und die Bearbeiten-/
      Deaktivieren-Logik aus `CONTENT-001` funktionieren unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant, ausschließlich in `Autoren.jsx` (kein Backend-
Eingriff nötig). Direkter Anlass: Sven fand beim ersten Test auf seiner
echten Maschine den "Bearbeiten"-Button anfangs scheinbar wirkungslos –
das Formular öffnete sich korrekt, aber unauffällig am Seitenende einer
teils langen Tabelle. Nicht in der Sandbox getestet (gleiche
npm-Registry-Einschränkung wie immer) – Sven bestätigt es direkt live auf
seiner Maschine nach Dateiübernahme.
