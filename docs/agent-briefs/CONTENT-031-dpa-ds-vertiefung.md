# Brief CONTENT-031: DPA-DS vertiefen (Fortsetzung Vertiefungsrunde DPA)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Fortsetzung der DPA-Vertiefungsrunde nach `CONTENT-030` (DPA-ANA):
`DPA-DS` (Data Science/Machine Learning) von 27 auf 51 Fragen erweitert.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DPA-DS.csv` – von 27 auf 51 Fragen erweitert (neue
  IDs `DPA-DS-028` bis `-051`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (24 Fragen)

Precision, F1-Score, Bagging vs. Boosting, Random Forest,
Entscheidungsbaum-Funktionsweise, neuronale Netze (Grundidee), Deep
Learning vs. klassisches ML, Gradient Descent, Lernrate, Regularisierung
(L1/L2), Hyperparameter vs. Modellparameter, Grid Search, Feature Scaling,
One-Hot-Encoding, Underfitting, Bias-Varianz-Tradeoff, Support Vector
Machine (SVM), Naive Bayes, Reinforcement Learning, Transfer Learning,
Validierungsdatensatz (3-Wege-Split), Datenlabeling/Annotation,
Klassenungleichgewicht (Class Imbalance), Inferenz/Modell-Deployment.

Alle Themen vorab gegen die bestehenden 27 Fragen abgeglichen (ML-Pipeline-
Grundlagen, Supervised/Unsupervised Learning, Klassifikation vs.
Regression, Accuracy, Overfitting x2, Recall/Sensitivität, Konfusions-
matrix, Train-Test-Split, Cross-Validation, Feature Engineering, Data
Cleaning, Bias/Ethik, k-Means, pandas, Histogramm bereits vorhanden) –
keine Dopplungen.

## QA-Ablauf – ein Subagent-Review-Durchlauf, zwei Findings nachgeschärft

Der Batch bestand im ersten Durchlauf mit zwei Findings, beide aus der
gleichen Defektklasse wie zuletzt bei `CONTENT-030` (DPA-ANA):

- Fachliche Korrektheit bestätigt (Precision/Recall/F1-Abgrenzung,
  Bagging-vs-Boosting-Mechanik, Random Forest, Gradient Descent, Lernrate-
  Effekte, L1/L2-Regularisierung, Hyperparameter-vs-Parameter, Grid
  Search, Feature Scaling, One-Hot-Encoding, Underfitting, Bias-Varianz-
  Tradeoff, SVM-Margin-Konzept, Naive-Bayes-Unabhängigkeitsannahme,
  Reinforcement-Learning-Belohnungsmechanik, Transfer Learning,
  Validierungsdatensatz-Zweck, Class Imbalance, Inferenz vs. Training).
- Keine Ambiguität, keine Redundanz zu Bestandsfragen, kein Längen-Bias
  (in keiner der 24 Zeilen war Option a ≥2 Wörter länger als jeder
  Distraktor).
- **Neues Füllwort-Muster erkannt**: "besonders" kam in keiner der 24
  korrekten Antworten vor, aber in 6 Distraktor-Zeilen (`DPA-DS-031`
  zweimal, `-033`, `-042`, `-045`, `-049`, `-050`) – gleiche Defektklasse
  wie "dabei"/"insgesamt" bei `CONTENT-030`. Alle 7 Stellen durch
  neutralere Formulierungen ersetzt.
- **Zeilen-internes Schablonen-Muster**: `DPA-DS-036` (Lernrate) hatte
  alle drei Distraktoren nach identischem Muster ("... dadurch spürbar/
  merklich ...") aufgebaut, während die korrekte Antwort komplett anders
  formuliert war – ein starkes Verrater-Muster innerhalb der einzelnen
  Frage. Alle drei Distraktoren umformuliert, um das gemeinsame Schema
  aufzubrechen.

Alle Korrekturen betreffen ausschließlich Distraktor-Formulierungen ohne
Wechsel der korrekten Antwort oder des Fachinhalts – kein erneuter
vollständiger Review-Durchlauf nötig (gleiches Vorgehen wie bei
`CONTENT-025`/`-026`/`-028`/`-029`/`-030`).

`validate-content.mjs`: 2265 Fragen, 26 Dateien, 0 Fehler.

**Lehre für künftige Runden**: Neben Wortzahl-Parität und der wachsenden
Füllwort-Liste lohnt sich zusätzlich ein Blick auf zeilen-internes
Schablonen-Muster – wenn alle drei Distraktoren einer einzelnen Frage nach
demselben syntaktischen Muster gebaut sind und die korrekte Antwort davon
sprachlich abweicht, ist das ebenfalls ein Rateindikator, auch ohne
wiederkehrendes Einzelwort über den gesamten Batch.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

DPA-Gesamtstand: `DPA-ANA` 50, `DPA-DS` jetzt 51, `DPA-DB` 118, `DPA-PRO`
26, `DPA-PROJ` 26. Nächster Schritt: `DPA-PRO` oder `DPA-PROJ` (beide bei
26) im bekannten Turnus.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 24 neuen `DPA-DS`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DPA-DS` von 27 auf 51 Fragen erweitert. Ein Subagent-Review-Durchlauf,
zwei Findings nachgeschärft (Füllwort-Muster "besonders" in 6 Zeilen,
Schablonen-Muster in 1 Zeile), beide ohne erneuten vollständigen Review
behoben. `validate-content.mjs`: 2265 Fragen, 0 Fehler. Sven hat die
neuen Fragen stichprobenartig fachlich gegengelesen und freigegeben
(2026-09-24).
