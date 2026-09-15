# Brief FE-007: Karteikarten – wählbare Stapelgröße

Status: done
Bereich: FE
Angelegt: 2026-09-15
Abgeschlossen: 2026-09-15

## Ziel (1–3 Sätze)

Statt immer alle fälligen Karten auf einmal zu bearbeiten, kann der Nutzer
eine Stapelgröße wählen (10/25/50 oder frei wählbar) – die restlichen
fälligen Karten bleiben für später fällig, nichts geht verloren.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/store/localStore.js` (neuer `kartenOptionenStore`)
- `frontend/src/pages/Karteikarten.jsx`

## Kontext (nur Verweise, keine Dokumentkopien)

- `frontend/src/utils/quizOptionen.js` / `frontend/src/store/localStore.js`
  (`quizOptionenStore`) – gleiches Muster für „Anzahl wählen" im Quizmodus,
  hier für Karteikarten übernommen

## Umsetzungsschritte (Checkliste)

- [x] `kartenOptionenStore` (localStorage, persistiert wie `quizOptionenStore`):
      `{ anzahl: 0 }`, 0 = alle fälligen Karten
- [x] Auswahl-UI oberhalb des Kartenstapels: 10 / 25 / 50 / Alle + eigenes
      Zahlenfeld für eine freie Anzahl
- [x] Nur die gewählte Anzahl wird als Session-Stapel genommen (aus den
      fälligen Karten, priorisiert nach Box wie bisher); der Rest bleibt
      im System fällig und erscheint beim nächsten Besuch/Neuladen
- [x] Anzeige „X von Y fälligen Karten in diesem Stapel"
- [x] Nachträglich (Sven-Feedback während des Tests): Klick auf eine
      Antwortoption dreht die Karte jetzt direkt zur Lösung (statt separatem
      Antippen); Rückseite zeigt bei SC/MC-Fragen nur noch „Richtige
      Antwort" und – nur falls falsch – zusätzlich „Deine Antwort" (keine
      komplette Options-Liste mehr)

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Stapelgröße (10/25/50/Alle/eigene Zahl) funktioniert, Rest bleibt für
      später fällig
- [x] Auswahl bleibt nach Neuladen der Seite erhalten (persistiert)
- [x] Nachträglich: Klick auf eine Antwortoption dreht die Karte direkt um
      (kein Klick auf den Kartenrand mehr nötig)

## Ergebnis (wird beim Abschluss ausgefüllt)

Von Sven im Browser bestätigt. Dabei zeigte sich ein weiteres Mal der
bekannte, nicht abschließend geklärte `device_commit_files`-Bug (Tool meldet
Erfolg, alte Datei bleibt liegen) – diesmal durch Rückholen der Datei vom
Gerät und Prüfsummenvergleich selbst aufgedeckt und behoben, bevor Sven es
erneut hätte melden müssen. Vorgehen für künftige Übertragungen: nach
Commit sicherheitshalber zurückstagen und per Prüfsumme/`grep` gegenchecken,
statt dem „written"-Ergebnis blind zu vertrauen.
