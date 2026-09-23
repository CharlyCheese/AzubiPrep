# Brief CONTENT-030: DPA-ANA vertiefen (Start Vertiefungsrunde DPA-Fachrichtung)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Erstes Modul der neuen Vertiefungsrunde für die Fachrichtung DPA, im
Anschluss an den Abschluss der zweiten DVK-Runde (`CONTENT-029`):
`DPA-ANA` (Datenanalyse/Statistik) von 26 auf 50 Fragen erweitert.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DPA-ANA.csv` – von 26 auf 50 Fragen erweitert (neue
  IDs `DPA-ANA-027` bis `-050`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (24 Fragen)

p-Wert-Interpretation, Fehler 1. Art (Alpha-Fehler), lineare Regression,
Regressionskoeffizient, Multikollinearität, Power-Analyse/Stichproben-
umfang, Klumpenstichprobe vs. Zufallsstichprobe, geschichtete Stichprobe,
Data Cleaning, Imputation fehlender Werte, Z-Score/Standardisierung,
Interquartilsabstand (IQR), Histogramm vs. Balkendiagramm, Streudiagramm
(Scatterplot), Chi-Quadrat-Test, t-Test, ANOVA, explorative vs.
konfirmatorische Analyse, Data Storytelling, Simpson-Paradoxon,
Overfitting, Kreuzvalidierung, Zeitreihenkomponenten (Trend/Saison/Rest),
verzerrte Y-Achse in Diagrammen.

Alle Themen vorab gegen die bestehenden 26 Fragen abgeglichen (Median/
Mittelwert, Varianz/Standardabweichung, Quantil, Nullhypothese-
Grundbegriff, Ausreißer-Grundbegriff, Pearson-Korrelation, Stichprobe-
Grundbegriff, Zeitreihenanalyse-Grundbegriff, Skalenniveaus,
Konfidenzintervall, Grundgesamtheit, Modus, Normalverteilung, Korrelation-
vs-Kausalität, Boxplot, Missing Data bereits vorhanden) – keine
Dopplungen, die neuen Fragen vertiefen gezielt (Testverfahren, Regression,
Stichprobenverfahren im Detail, Data-Cleaning-Details usw.).

## QA-Ablauf – ein Subagent-Review-Durchlauf, zwei Findings nachgeschärft

Der Batch bestand im ersten Durchlauf mit zwei Findings:

- Fachliche Korrektheit bestätigt, inklusive der bewusst als Distraktoren
  gesetzten klassischen Fehlvorstellungen (z. B. p-Wert ≠ "Wahrscheinlich-
  keit, dass H0 wahr ist" – korrekt als Falschantwort markiert).
- Keine Ambiguität, keine Redundanz zu Bestandsfragen.
- **Neues Füllwort-Muster erkannt**: "dabei" und "insgesamt" kamen in
  keiner der 24 korrekten Antworten vor, aber in 8 von 24 Zeilen als
  Distraktor-Füllwort (`DPA-ANA-030`, `-031`, `-033`, `-034`, `-039`,
  `-042`, `-044`, `-046`) – ein lernbarer Rateindikator, obwohl nicht auf
  der AGENTS.md-Beispielliste. Alle 8 Stellen bereinigt (Füllwort
  entfernt, Restsatz unverändert).
- **Längen-Bias**: eine Zeile (`DVK-ANA-047`, Overfitting) hatte Option a
  ≥2 Wörter länger als jeder Distraktor – durch Entfernen des dort
  ebenfalls vorhandenen "dabei" gleichzeitig auf Wortzahl-Parität
  gebracht.

Alle Korrekturen sind reine Wortänderungen ohne Wechsel der korrekten
Antwort oder des Fachinhalts – kein erneuter vollständiger Review-
Durchlauf nötig (gleiches Vorgehen wie bei `CONTENT-025`/`-026`/`-028`/
`-029`).

`validate-content.mjs`: 2241 Fragen, 26 Dateien, 0 Fehler.

**Lehre für künftige Runden**: Nicht nur die vier AGENTS.md-Beispielwörter
und die bisher gefundenen Zusatzwörter ("vollständig", "jede(r)", "nie",
"sämtliche", "überhaupt", "keinerlei", "dauerhaft", "stets", "nur",
"komplett", "lediglich", "zwingend", "rein") können als Füllwort-Tell
wirken – jedes Wort, das ausschließlich in Distraktoren und nie in der
korrekten Antwort eines Batches vorkommt, ist potenziell lernbar. Eine
Gegenprobe "kommt dieses Stilwort auch in mindestens einer korrekten
Antwort vor?" ergänzt die Wortzahl-Gegenprobe sinnvoll.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

DPA-Gesamtstand: `DPA-ANA` jetzt 50, `DPA-DB` 118, `DPA-DS` 26, `DPA-PRO`
26, `DPA-PROJ` 26. Nächster Schritt: eines der übrigen DPA-Module
(`DPA-DS`, `DPA-PRO` oder `DPA-PROJ`, alle bei 26) im bekannten Turnus.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 24 neuen `DPA-ANA`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DPA-ANA` von 26 auf 50 Fragen erweitert. Ein Subagent-Review-Durchlauf,
zwei Findings nachgeschärft (neues Füllwort-Muster "dabei"/"insgesamt" in
8 Zeilen, Längen-Bias in 1 Zeile), beide ohne erneuten vollständigen
Review behoben. `validate-content.mjs`: 2241 Fragen, 0 Fehler. Sven hat
die neuen Fragen stichprobenartig fachlich gegengelesen und freigegeben
(2026-09-24).
