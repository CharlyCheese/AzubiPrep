# Brief FE-018: Themengewichtung in der Prüfungssimulation aktivieren

Status: offen
Bereich: FE
Angelegt: 2026-09-18

## Ziel (1–3 Sätze)

`backend/src/exam.js#generierePruefung` unterstützt seit jeher einen
`gewichtung`-Parameter (Themen mit höherem Gewicht werden beim Mischen
bevorzugt gezogen), den das Frontend nie befüllt hat – ein bei der
kombinierten Doku-/Feature-Abnahme (`OPS-011`) gefundener Fund. Sven hat
sich für die Aktivierung entschieden: automatisch im Hintergrund, ohne
neues UI-Element, gekoppelt an die bereits vorhandene Schwächenanalyse
(gleiche 60%-Schwelle wie bei "Stärken/Schwächen" in der Auswertung).

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Pruefung.jsx` (Gewichtung berechnen, im
  `starten()`-Request mitschicken)
- `docs/03-Pruefungssimulation.md` (Beschreibung von "vorbereitet, nicht
  aktiv" auf tatsächlich aktiv korrigieren)
- `docs/09-API-Referenz.md` (Beispiel-Payload `gewichtung: {}` anpassen,
  falls das Beispiel sonst missverständlich wirkt)

## Kontext (nur Verweise, keine Dokumentkopien)

- `OPS-011-lern-kernflows-abnahme.md`, Ergebnis-Abschnitt: vollständige
  Fund-Beschreibung (warum die Gewichtung bisher inaktiv war, welcher
  Parameter fehlte).
- `backend/src/exam.js#mischen`: `schluessel = Math.random() /
  (gewichtung?.[f.thema] > 0 ? gewichtung[f.thema] : 1)` – höheres Gewicht
  senkt den Schlüssel im Schnitt, die Liste wird aufsteigend sortiert und
  die ersten `anzahl` Fragen gewählt. Ein Thema mit Gewicht 3 landet also im
  Schnitt 3x häufiger unter den ersten N Fragen als eines mit Gewicht 1.
- `backend/src/exam.js#auswertePruefung`: Stärken/Schwächen-Schwelle ist
  60 % (`quote >= 60 ? staerken : schwaechen`) – dieselbe Schwelle wird
  hier für die Gewichtung wiederverwendet, damit "Schwäche" im Produkt
  überall dasselbe bedeutet.
- `frontend/src/store/localStore.js#progressStore`: liefert
  richtig/falsch je Frage-ID (nicht je Thema) – muss mit der Fragenliste
  (Feld `thema`) verknüpft werden, um eine Quote je Thema zu berechnen.

## Umsetzungsschritte (Checkliste)

- [ ] `Pruefung.jsx`: alle Fragen laden (`GET /fragen`, kein Filter – wie
      bereits in `PruefungVerlauf.jsx` gemacht), auf die gewählte
      Fachrichtung + `ALLE` filtern (spiegelt die serverseitige Logik aus
      `fragenFuerFachrichtung` exakt).
- [ ] Je Thema aus `progressStore` aggregieren: Summe richtig/falsch aller
      Fragen dieses Themas. **Mindestanzahl Versuche einbauen** (z. B. ≥ 3
      je Thema), bevor eine Quote als aussagekräftig gilt – verhindert,
      dass ein einziger Zufallstreffer/-fehler ein Thema fälschlich als
      "Schwäche" markiert.
- [ ] Themen mit Quote < 60 % bekommen Gewicht 3, alle anderen (inkl.
      Themen ohne ausreichend Daten) bleiben implizit bei Gewicht 1 (kein
      Eintrag nötig – Backend behandelt einen fehlenden Schlüssel bereits
      als Gewicht 1, siehe `mischen()`).
- [ ] Berechnete `gewichtung`-Map im `POST /pruefung/generieren`-Request
      mitschicken.
- [ ] `docs/03-Pruefungssimulation.md`: den in `OPS-011` ergänzten Hinweis
      "vorbereitet, aber nicht aktiv" durch eine Beschreibung des
      tatsächlichen Verhaltens ersetzen (Schwelle, Mindestanzahl,
      Gewichtsfaktor nennen).
- [ ] Kurzer manueller/Code-Check: Profil ohne jeden Fortschritt ergibt
      leere `gewichtung` (`{}`) – keine Fehler, Verhalten wie bisher
      (gleichverteilt).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Nutzer:in ohne jeglichen Quiz-/Prüfungsfortschritt: `gewichtung` im
      Request ist `{}`, Prüfung wird wie bisher gleichverteilt gezogen
      (kein Fehler, keine Regression).
- [ ] Nutzer:in mit mindestens 3 beantworteten Fragen in einem Thema und
      einer Quote < 60 % in diesem Thema: das Thema bekommt Gewicht 3 in
      der gesendeten `gewichtung`-Map.
- [ ] Ein Thema mit weniger als 3 Versuchen bekommt (unabhängig von der
      Quote) KEIN erhöhtes Gewicht.
- [ ] `docs/03-Pruefungssimulation.md` beschreibt exakt das tatsächlich
      implementierte Verhalten (Schwelle, Mindestanzahl, Faktor 3) – keine
      pauschale "mit Themengewichtung"-Aussage ohne Erklärung mehr.

## Ergebnis (wird beim Abschluss ausgefüllt)

<Was wurde tatsächlich umgesetzt, was weicht vom Plan ab, wie wurde getestet?>
