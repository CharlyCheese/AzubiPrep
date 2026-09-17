# Brief FE-016: Landing-Page nutzt Seitenbreite (Zwei-Spalten-Layout)

Status: done
Bereich: FE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Die Landing-Page (FE-012/FE-013) war bisher eine einzelne, auf 460px
begrenzte, zentrierte Karte – auf breiten Bildschirmen blieb viel Platz
links und rechts ungenutzt. Jetzt: Zwei-Spalten-Layout auf breiten
Bildschirmen (Nutzenerklärung + Feature-Überblick links, Login-/Info-Karte
rechts), fällt unterhalb von 860px zurück auf die bisherige einspaltige,
schmale Ansicht.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Landing.jsx` – Aufteilung in `landing-intro`
  (Headline, Nutzenerklärung, Lernreise-Tipp, drei Feature-Kacheln) und
  `landing-karte` (Login/Registrierung bzw. Ohne-Konto-Hinweis + DB-
  Anleitung-Link)
- `frontend/src/styles/global.css` – `.landing-wrap` (Grid, zwei Spalten ab
  860px), `.landing-features`/`.landing-feature` (neue Feature-Kacheln),
  `.landing-karte` ohne feste `max-width` mehr (Breite kommt jetzt vom
  Grid), Breakpoint fällt auf die bisherige Ein-Spalten-Ansicht zurück

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-012-landing-page.md`: ursprüngliche Landing-Page
- `docs/agent-briefs/FE-013-landing-tour-ausbau.md`: Nutzenerklärung/Tipp-
  Texte, die hier unverändert übernommen wurden (nur umsortiert)

## Entscheidung (im Chat geklärt, 2026-09-17)

- Seitenbreite auf breiten Bildschirmen ausnutzen; sollte sich das mit
  mobiler Ansicht/Barrierefreiheit beißen, ist ein Rückfall auf die
  bisherige einspaltige Version jederzeit möglich – deshalb bewusst per
  Media Query gelöst statt strukturell verwoben: unter 860px ist die Seite
  inhaltlich/optisch identisch zur vorherigen Version.

## Umsetzungsschritte (Checkliste)

- [x] `Landing.jsx`: Inhalt in zwei Bereiche aufgeteilt (Intro+Features
      links, Karte rechts), keine Textänderungen an bestehenden Inhalten
- [x] Drei Feature-Kacheln (Fragen, Karteikarten, Prüfungssimulation) als
      zusätzliche Nutzung der gewonnenen Breite
- [x] `global.css`: `.landing-wrap` als 2-Spalten-Grid (`1.15fr` /
      `320–420px`), Breakpoint bei 860px (konsistent mit dem bestehenden
      Sidebar-Breakpoint) fällt zurück auf 1 Spalte, `max-width: 460px`
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Auf breiten Fenstern (> 860px) erscheinen Intro/Features und die
      Login-Karte nebeneinander, zusammen breiter als die alte 460px-Karte
- [x] Unter 860px ist die Seite wieder einspaltig und inhaltlich/optisch
      identisch zur vorherigen Version (keine Regressionen für mobile
      Bildschirme)
- [x] Keine Textänderungen an bestehenden Inhalten (Headline, Nutzenerklärung,
      Lernreise-Tipp, DB-Anleitung-Hinweis, Login-Formular unverändert)

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. Reine Frontend-/CSS-Änderung, nicht in der Sandbox
lauffähig testbar (npm-Registry gesperrt) – Klammer-/Strukturprüfung der
geänderten Dateien lief sauber durch. `node scripts/check-agent-briefs.mjs`
läuft grün. Sven bestätigt: Funktioniert live auf seiner Maschine
("passt erstmal") – möchte zu einem späteren Zeitpunkt nochmal auf das
Design zurückkommen (siehe `STATUS.md`), das ist aber kein Blocker für
diesen Task.
