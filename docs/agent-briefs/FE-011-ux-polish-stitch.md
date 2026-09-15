# Brief FE-011: UX-Feinschliff & Micro-Interactions (Stitch-Vorschlag)

Status: done
Bereich: FE
Angelegt: 2026-09-15
Abgeschlossen: 2026-09-15

## Ziel (1–3 Sätze)

Nachdem Stitch AI für FE-002 bestätigt hat, dass die Layout-Vorgaben bereits
umgesetzt sind, hat Sven Stitch stattdessen um bewährte, anerkannte
UX-Feinschliff-Elemente (Micro-Interactions) gebeten – als Code-Paket
geliefert, damit es leichter verarbeitet werden kann. Diese Elemente werden
hier in die bestehende Codebasis integriert: Tastatur-Shortcuts für
Quiz/Karteikarten, Skeleton-Loading statt Spinner, ein schwebender
XP-Indikator bei richtiger Antwort, sowie CSS-Feinschliff (taktiles
Klick-Feedback, Fokus-Ringe, sanfte Card-Einblendung, elastische
Fortschrittsbalken-Animation).

## Betroffene Dateien (exakte Pfade)

- `frontend/src/styles/ux-polish.css` (neu) – Micro-Interactions-CSS
- `frontend/src/utils/useQuizKeyboard.js` (neu) – Tastatur-Hook für
  Quiz/Karteikarten (A–E / 1–5 für Optionen, Enter für Prüfen/Weiter/Flip)
- `frontend/src/components/SkeletonCard.jsx` (neu) – Shimmer-Ladeplatzhalter
- `frontend/src/components/XpGainIndicator.jsx` (neu) – schwebende
  „+XP"-Anzeige bei richtiger Antwort
- `frontend/src/main.jsx` (Import der neuen Stylesheet-Datei)
- `frontend/src/pages/Quiz.jsx` (Tastatur-Shortcuts, Skeleton statt Spinner,
  XP-Indikator bei erster richtiger Antwort, `card-appear`-Einblendung)
- `frontend/src/pages/Karteikarten.jsx` (Tastatur-Shortcuts, Skeleton statt
  Spinner)
- `frontend/src/utils/fragen.js` (Nachtrag: `buchstabeZuZiffer`-Helfer für
  Ziffern-Anzeige statt Buchstaben, siehe unten)
- `frontend/src/components/FrageKarte.jsx`, `frontend/src/pages/PruefungLauf.jsx`,
  `frontend/src/pages/PruefungVerlauf.jsx` (Nachtrag: Ziffern-Anzeige)
- `frontend/src/pages/Modul.jsx` (Nachtrag: Bugfix, siehe unten – nicht
  ursprünglich Teil dieses Briefs)

## Kontext (nur Verweise, keine Dokumentkopien)

- Von Sven bei Stitch AI angefordertes UX-Polish-Paket (als Code geliefert,
  nicht Teil der ursprünglichen FE-002-Layout-Analyse)
- `docs/agent-briefs/FE-002-ux-feinschliff-stitch-abgleich.md` (weiterhin
  offen – laut Stitch inhaltlich größtenteils bereits erfüllt, aber nicht
  Gegenstand dieses Briefs)

## Umsetzungsschritte (Checkliste)

- [x] `useQuizKeyboard`-Hook erstellt (Rules-of-Hooks-konform, mit `aktiv`-Flag
      zum bedingten No-op ohne Verstoß gegen die Hook-Aufrufreihenfolge)
- [x] `SkeletonCard` als Ersatz für den reinen Text-/Spinner-Ladezustand
- [x] `XpGainIndicator` an die bestehende XP-Vergabe-Logik in `Quiz.jsx`
      angebunden (nur beim ersten korrekten Versuch, analog zur bestehenden
      Toast-Benachrichtigung)
- [x] `ux-polish.css` erstellt und in `main.jsx` eingebunden (inkl.
      `prefers-reduced-motion`-Fallback)
- [x] Integration in `Quiz.jsx`: Tastatur-Shortcuts, Skeleton, XP-Indikator,
      `card-appear`-Klasse + `key={frage.id}` für sauberes Neu-Einblenden
      pro Frage
- [x] Integration in `Karteikarten.jsx`: Tastatur-Shortcuts (Enter dreht die
      Karte um, Buchstaben wählen Optionen), Skeleton statt Spinner

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Im Quiz: Tasten 1–6/A–F wählen Antwortoptionen, Enter prüft bzw. geht
      zur nächsten Frage – funktioniert nur außerhalb von Eingabefeldern (bei
      Freitext-Fragen deaktiviert)
- [x] In Karteikarten: Enter dreht die aktuelle Karte um, Ziffern/Buchstaben
      wählen Antwortoptionen
- [x] Ladezustände zeigen einen Shimmer-Platzhalter statt des alten Spinners,
      ohne Layout-Sprung beim Nachladen der echten Karte
- [x] Bei der ersten richtigen Antwort im Quiz erscheint kurz eine
      „+XP"-Anzeige an der Fragenkarte und verschwindet nach ca. 1,2s wieder
- [x] Klickbare Elemente (Buttons, Antwort-Optionen) geben spürbares
      visuelles Feedback beim Klicken; Fokus-Ringe bei Tastaturnavigation
      sichtbar
- [x] Bestehende Funktionalität (Maus-Klicks, normale Navigation,
      3D-Flip-Animation der Karteikarte) bleibt unverändert
- [x] Mit `prefers-reduced-motion: reduce` sind die neuen Animationen
      deaktiviert/reduziert

## Ergebnis (wird beim Abschluss ausgefüllt)

Von Sven geprüft und bestätigt am 2026-09-15.

Umgesetzt wie geplant, plus zwei Nachträge auf Svens Feedback nach dem
ersten Test:

1. **Grundpaket**: `useQuizKeyboard`-Hook, `SkeletonCard`, `XpGainIndicator`
   und `ux-polish.css` erstellt und in `Quiz.jsx`/`Karteikarten.jsx`/
   `main.jsx` integriert wie ursprünglich geplant.

   Technische Anmerkung: `useQuizKeyboard` musste in `Quiz.jsx` und
   `Karteikarten.jsx` vor den früheren `if (laden) return ...`-Statements
   aufgerufen werden (React Rules of Hooks – Hooks dürfen nicht bedingt
   aufgerufen werden). Dafür wurde jeweils eine früh berechnete
   Hilfsvariable (`frageAktuell`/`zeigeFrageAnsicht`) eingeführt, und der
   Hook bekommt ein `aktiv`-Flag, um den internen Effekt bei Bedarf sauber
   zu no-oppen, statt die komplette Komponentenstruktur umzubauen.

2. **Nachtrag „Ziffern statt Buchstaben"** (Svens Feedback: mit der
   Tastatur angenehmer): Antwortoptionen werden jetzt app-weit als 1–6
   statt A–F angezeigt (`buchstabeZuZiffer`-Helfer in `utils/fragen.js`,
   rein für die Anzeige – intern bleibt A–F die Referenz, da Backend-
   Antwortformat und Misch-Mapping (`mischeOptionen`) darauf aufbauen).
   Betroffen: Karteikarten, Quiz (inkl. Ergebnis-Verlauf), FrageKarte,
   Prüfungssimulation (`PruefungLauf.jsx`) und Prüfungsverlauf
   (`PruefungVerlauf.jsx`). `useQuizKeyboard` mappt jetzt auch `6` → `F`
   (fehlte vorher).

3. **Nachtrag „Bugfix Modul.jsx"** (beim Testen entdeckt, nicht ursprünglich
   Teil dieses Briefs): `Modul.jsx` hatte einen bereits vorher bestehenden
   Rules-of-Hooks-Verstoß – `useState(quizAnzahl...)` stand hinter zwei
   frühen `if (...) return`-Statements (Lade-/Fehlerzustand). Dadurch wurde
   der Hook beim ersten Render (Daten noch nicht geladen) übersprungen und
   beim zweiten Render (Daten da) plötzlich zusätzlich aufgerufen → React
   wirft „Rendered more hooks than during the previous render" und stürzt
   unabgefangen ab, was mangels Error-Boundary die komplette App blockierte
   (dadurch wirkten auch Lernbereich/Lernreise „kaputt", obwohl der Fehler
   ausschließlich in `Modul.jsx` lag). Fix: den Hook vor die Early-Returns
   gezogen, analog zum bereits in diesem Brief verwendeten Muster.

Alle Dateien erfolgreich auf Svens PC übertragen (jeder Transfer per
Re-Stage + Checksum-Vergleich verifiziert, keine Abweichungen).
