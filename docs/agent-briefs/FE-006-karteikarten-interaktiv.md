# Brief FE-006: Karteikarten – gemischte, klickbare Antwortoptionen

Status: in Testung
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Auf der Vorderseite der Karteikarten waren die Antwortoptionen bisher nur
statischer, unveränderter Text (weder gemischt noch anklickbar). Jetzt sind
sie – wie im Quizmodus – gemischt und interaktiv anklickbar; beim Umdrehen
der Karte (Klick, wie bisher) zeigt die Rückseite zusätzlich, welche Option
richtig war und was der Nutzer gewählt hatte.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Karteikarten.jsx`

## Kontext (nur Verweise, keine Dokumentkopien)

- `frontend/src/utils/optionen.js` (`mischeOptionen`, bereits in
  Quiz.jsx/PruefungLauf.jsx verwendet – hier wiederverwendet statt neu
  erfunden)
- `frontend/src/utils/antworten.js` (`korrekteAntwortText`)

## Umsetzungsschritte (Checkliste)

- [x] Antwortoptionen pro Karte einmalig gemischt (`mischeOptionen`),
      Mischung wird bei Kartenwechsel neu berechnet
- [x] Optionen auf der Vorderseite klickbar (Single-Choice: eine Auswahl,
      Multiple-Choice: mehrere) – Klick auf eine Option löst NICHT das
      Umdrehen der Karte aus (eigenes `stopPropagation`)
- [x] Umdrehen der Karte bleibt wie bisher: Klick auf die Karte (außerhalb
      der Optionszeilen)
- [x] Rückseite zeigt zusätzlich zur Musterlösung, welche Option(en) korrekt
      waren und was der Nutzer ausgewählt hatte (grün/rot, gleiches Muster
      wie im Quizmodus)
- [x] Freitext-Karten (Typ FT) unverändert (nichts zum Mischen/Anklicken)
- [x] Auswahl wird bei Kartenwechsel zurückgesetzt

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Optionsreihenfolge wechselt erkennbar zwischen Karten (nicht immer
      A/B/C/D in Originalreihenfolge)
- [ ] Klick auf eine Option wählt sie aus, ohne die Karte umzudrehen
- [ ] Karte lässt sich weiterhin durch Antippen umdrehen
- [ ] Rückseite zeigt korrekt grün/rot markierte Optionen passend zur
      eigenen Auswahl
- [ ] Freitext-Karten funktionieren unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

<wird nach Umsetzung/Test ausgefüllt>
