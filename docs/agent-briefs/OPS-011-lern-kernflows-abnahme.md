# Brief OPS-011: Lern-Kernflows (Quiz, Karteikarten, Prüfungssimulation) – kombinierte Doku- und Feature-Abnahme

Status: offen
Bereich: OPS
Angelegt: 2026-09-18

## Ziel (1–3 Sätze)

Nach dem unabhängigen Review (ChatGPT, 2026-09-18, siehe `OPS-010`-Anschluss
im Chat-Verlauf mit Sven): Feature-Fokus statt Release-Fokus. Statt Doku-
Audit und Feature-Test als zwei getrennte Durchgänge zu machen (spart eine
komplette Iteration), werden die drei Lern-Kernflows Quiz, Karteikarten und
Prüfungssimulation je einmal end-to-end durchgetestet UND die zugehörige
Doku im selben Durchgang auf den tatsächlich beobachteten Stand gebracht –
nicht auf einen angenommenen. Ergebnis: konkrete, prüfbare Abnahme-Kriterien
pro Flow (nach dem Muster, das ChatGPT vorgeschlagen hat) plus Doku, die zum
echten Verhalten passt.

## Betroffene Dateien (exakte Pfade)

Code (nur lesen/verifizieren, Änderungen nur bei tatsächlich gefundenen
Bugs – dafür ggf. eigenes Brief anlegen, nicht hier mit erledigen):
- `frontend/src/pages/Quiz.jsx`
- `frontend/src/pages/Karteikarten.jsx`
- `frontend/src/pages/Pruefung.jsx`, `PruefungLauf.jsx`,
  `PruefungErgebnis.jsx`, `PruefungVerlauf.jsx`
- `frontend/src/store/localStore.js` (Leitner-System, Fortschritt)
- `backend/src/exam.js`, `backend/src/routes/` (Prüfungsgenerierung/
  -auswertung, Fragen-Prüfen-Endpunkt)
- `e2e/tests/pruefung.spec.js`, `e2e/tests/quiz.spec.js` (bereits
  vorhandene Abdeckung aus `OPS-010`, Ausgangspunkt statt Neuanfang)

Doku (auf beobachtetes Verhalten korrigieren, wo nötig):
- `docs/01-Lernkonzept.md`
- `docs/03-Pruefungssimulation.md`
- `docs/05-Lernfortschritt-Statistik.md`
- `docs/09-API-Referenz.md` (Abschnitte zu Fragen/Prüfung-Endpunkten)
- `docs/PROJEKTSTATUS.md` (falls sich am Funktionsumfang-Stand etwas ändert)

## Kontext (nur Verweise, keine Dokumentkopien)

- Chat mit Sven, 2026-09-18: ChatGPT-Review (korrigiert auf "weit
  fortgeschrittener MVP", 8–8,5/10) und Folge-Roadmap "Feature-Fokus vor
  Release-Fokus". Sven hat sich für kombiniertes Doku+Abnahme-Vorgehen
  entschieden, Start bei den Lern-Kernflows.
- `OPS-010-ci-tests.md`, Stufe 4: Playwright deckt bereits je einen
  Kernpfad ab (Prüfung starten→vorzeitig abgeben→Ergebnis; eine Quizfrage
  beantworten→Feedback). Dieses Brief geht bewusst darüber hinaus
  (Karteikarten fehlt komplett, Randfälle wie Schwierigkeitsfilter,
  Fehler-Nachbereitung im Prüfungsverlauf, Leitner-Wiederholung).
- `docs/16-Gamification-Plan.md`: XP-Vergabe hängt an Quiz/Prüfung dran,
  beim Testen mit im Blick behalten (nicht Hauptfokus dieses Briefs).

## Umsetzungsschritte (Checkliste)

- [x] Quiz gezielt geprüft: Schwierigkeitsfilter, Fragenumfang, alle drei
      Fragetypen, Abschluss-Auswertung. **Per Code-Durchgang** (kein
      npm-Registry-Zugriff in dieser Sitzung, siehe Ergebnis-Abschnitt),
      nicht per echtem Klick-Test. Doku (`01-Lernkonzept.md`) war bereits
      korrekt.
- [x] Karteikarten geprüft: Leitner-Stapel-Logik, wählbare Stapelgröße,
      Auto-Flip. Per Code-Durchgang bestätigt, Doku war bereits korrekt
      (ein ursprünglich zu grob formuliertes Abnahme-Kriterium wurde
      korrigiert, siehe unten).
- [x] Prüfungssimulation geprüft: Zeitlimit, Zufallsfragen, vollständiger
      Durchlauf bis Ergebnis, Fehler-Nachbereitung im Prüfungsverlauf.
      **Echter Fund:** die in der Doku behauptete "Themengewichtung" ist
      im Frontend nie aktiviert (siehe Ergebnis-Abschnitt) –
      `03-Pruefungssimulation.md` korrigiert.
- [x] `09-API-Referenz.md` gegen `backend/src/exam.js`/Routen abgeglichen
      – bereits korrekt, keine Änderung nötig.
- [x] Gefundene Abweichung (Themengewichtung) korrigiert – kein
      Verhaltens-Bug (Backend funktioniert wie dokumentiert, das Feature
      ist nur nie aktiviert), deshalb bewusst kein neuer STATUS.md-Punkt,
      siehe Begründung im Ergebnis-Abschnitt.
- [x] Abnahme-Kriterien pro Flow formuliert (s. u.), eines davon
      (Karteikarten-Wiederholung) korrigiert, weil die ursprüngliche
      Annahme "kommt im selben Durchlauf öfter dran" laut Code falsch war.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Quiz: Schwierigkeitsfilter (leicht/mittel/schwer/alle) liefert
      tatsächlich nur Fragen der gewählten Schwierigkeit. Bestätigt per
      Code (`frontend/src/utils/quizOptionen.js#filtereNachSchwierigkeit`
      – reiner, simpler Array-Filter, `'alle'` filtert bewusst nicht).
- [x] Quiz: alle drei Fragetypen (SC, MC, FT) lassen sich beantworten und
      liefern korrektes Richtig/Falsch-Feedback inkl. Musterlösung bei
      Fehlern. Bestätigt per Code (`Quiz.jsx#pruefen`,
      `backend/test/answer.test.js` deckt die Auswertungslogik bereits
      mit 15 Tests ab) – noch nicht per echtem Klick-Test bestätigt.
- [x] Karteikarten: eine mit "schwer" bewertete Karte wandert eine
      Leitner-Box zurück und wird auf morgen fällig (Box 1 = 1 Tag
      Intervall), eine mit "leicht" bewertete Karte eine Box weiter und
      erst in entsprechend mehr Tagen wieder fällig (Boxen 1–5 =
      1/3/7/14/30 Tage, siehe `localStore.js#flashcardStore.review` und
      `BOX_INTERVALLE`). **Wichtige Korrektur ggü. dem ursprünglichen
      Kriterium:** Eine schwer bewertete Karte kommt NICHT im selben
      Durchlauf nochmal dran – `bewerten()` entfernt jede Karte nach der
      Bewertung sofort aus dem laufenden Session-Stapel
      (`faellige`/`setFaellige`), unabhängig von der Bewertung. Die
      häufigere Wiederholung passiert ausschließlich über künftige
      Besuche (kürzeres `faelligAm`-Intervall), nicht innerhalb einer
      Sitzung. Code und `01-Lernkonzept.md` stimmen exakt überein –
      keine Doku-Korrektur nötig, nur dieses Kriterium war ungenau
      formuliert.
- [x] Prüfungssimulation: vollständiger Durchlauf (nicht vorzeitig
      abgegeben) zeigt korrekte Auswertung (Score, bestanden/nicht
      bestanden, Stärken/Schwächen pro Modul) und der Prüfungsverlauf
      zeigt denselben Durchlauf mit korrektem Frage-für-Frage-Review.
      Per Code-Durchgang bestätigt (`PruefungLauf.jsx` → `auswertePruefung`
      → `PruefungErgebnis.jsx`/`PruefungVerlauf.jsx`), noch nicht per
      echtem Klick-Test von Sven bestätigt (siehe Ergebnis-Abschnitt).
- [x] Jede der drei Doku-Dateien (`01-Lernkonzept.md`,
      `03-Pruefungssimulation.md`, `09-API-Referenz.md`) beschreibt nach
      diesem Brief ausschließlich tatsächlich beobachtetes Verhalten,
      keine veralteten oder unbeobachteten Annahmen mehr.
      `01-Lernkonzept.md` und `09-API-Referenz.md` waren bereits korrekt
      (keine Änderung nötig); `03-Pruefungssimulation.md` korrigiert (siehe
      Ergebnis-Abschnitt – echter Fund, nicht nur Formsache).
- [x] Alle bei der Abnahme gefundenen echten Bugs sind als eigene
      Backlog-Punkte in `STATUS.md` erfasst (nicht stillschweigend
      übergangen). Ein Fund (Themengewichtung inaktiv) wurde bewusst NICHT
      als Bug/Backlog-Punkt erfasst, sondern nur dokumentiert – Begründung
      im Ergebnis-Abschnitt.

## Ergebnis (wird beim Abschluss ausgefüllt)

**Wichtige Einschränkung zur Testmethode:** Diese Sitzung hat keinen
npm-Registry-Zugriff (bestätigt, `403 host_not_allowed` bei
`registry.npmjs.org`), konnte die App also nicht selbst live starten und
anklicken. Stattdessen wurde die Logik anhand des Quellcodes exakt
nachvollzogen (Frontend-Komponenten, Store-Logik, Backend-Endpunkte) und
gegen die Doku abgeglichen. Das deckt Logik-/Doku-Abweichungen zuverlässig
ab, aber KEINE rein visuellen/Timing-/Laufzeitprobleme (z. B. Layout-Bugs,
tatsächliches Server-Antwortverhalten). Ein echter Klick-Test durch Sven
bleibt für diese drei Flows sinnvoll und offen, sobald er dazu kommt.

**Echter Fund – Themengewichtung bei der Prüfungssimulation ist inaktiv:**
`backend/src/exam.js#generierePruefung` unterstützt einen `gewichtung`-
Parameter (Themen mit höherem Gewicht werden beim Mischen bevorzugt vorne
gezogen), und `backend/src/routes/exam.routes.js` reicht ihn aus dem
Request-Body durch. Aber `frontend/src/pages/Pruefung.jsx#starten()` ruft
`api.post('/pruefung/generieren', { fachrichtung, anzahl, schwierigkeit })`
auf – **ohne** `gewichtung` im Payload. Der Parameter ist im Backend damit
immer `{}`, `generierePruefung` zieht in der Praxis also gleichverteilt
zufällig, nicht gewichtet nach Thema/Schwäche. `docs/03-Pruefungssimulation.md`
behauptete bisher unkorrigiert "zieht zufällige Fragen mit Themengewichtung"
– das stimmte nie mit dem tatsächlichen Nutzerverhalten überein. Korrigiert:
die Doku beschreibt jetzt explizit, dass die Gewichtung im Backend
vorbereitet, aber nicht aktiviert ist, und was fehlen würde, um sie
tatsächlich zu nutzen (Frontend müsste eine `gewichtung`-Map mitschicken,
z. B. aus der Schwächenanalyse abgeleitet).

**Bewusst kein neuer Backlog-Punkt dafür:** Das ist kein Bug (Backend tut
exakt, was es soll, wenn man es aufruft), sondern eine nie fertiggestellte
Funktionsanbindung. Ob "Themengewichtung nach Schwäche" überhaupt ein
gewolltes Feature ist oder nicht, ist eine Produktentscheidung, keine
technische – deshalb hier nur ehrlich dokumentiert statt vorschnell als
Task angelegt. Falls gewünscht, wäre das ein sauberer eigener Task (z. B.
"Prüfungssimulation gewichtet Fragen nach Schwächenanalyse").

**Weitere Doku-Korrektur in `03-Pruefungssimulation.md`:** Der
Implementierungs-Abschnitt nannte falsche Funktionssignaturen
(`generierePruefung(pool, anzahl, gewichtung)`,
`wertePruefungAus(fragen, antworten)`, ein nicht existierendes
`filterFragen(pool, filter)`) – korrigiert auf die tatsächlichen
Signaturen (`generierePruefung(content, {...})`,
`auswertePruefung(content, { fragen })`, kein separates `filterFragen`,
Filterung läuft inline). Außerdem fehlte der Parameter „Schwierigkeit" in
der Parameter-Tabelle, obwohl `Pruefung.jsx` ihn anbietet und das Backend
ihn nutzt – ergänzt.

**Alles andere bereits korrekt, keine Doku-Änderung nötig:**
- `01-Lernkonzept.md` (Fragetypen, Lernmodi, Leitner-Boxen 1–5 mit
  1/3/7/14/30-Tage-Intervallen) stimmt exakt mit `localStore.js` überein.
- `09-API-Referenz.md` (Endpunkte, Request-/Response-Beispiele inkl. dem
  bewusst leeren `gewichtung: {}` im Beispiel) stimmt mit
  `backend/src/routes/exam.routes.js` und `exam.js` überein.

**Korrigiertes Abnahme-Kriterium:** Die ursprüngliche Annahme, eine
"schwer" bewertete Karteikarte käme im selben Durchlauf öfter dran, war
falsch – `Karteikarten.jsx#bewerten()` entfernt jede Karte sofort aus dem
laufenden Session-Stapel, unabhängig von der Bewertung. Die häufigere
Wiederholung wirkt ausschließlich über kürzere `faelligAm`-Intervalle bei
künftigen Besuchen (Box 1 = morgen fällig). Korrigiert im
Abnahme-Kriterium oben.

**Noch offen:** echter Klick-Test aller drei Flows durch Sven (bewusst
zurückgestellt, da er sich heute nicht gut fühlt – kein Zeitdruck).
