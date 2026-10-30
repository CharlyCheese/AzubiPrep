# Brief CONTENT-040: DPA-DS – Modellbewertung, Validierungsdesign und Datenleckage

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-DS von 51 auf 75 Fragen erweitern. 24 neue, selbst
formulierte SC-Aufgaben mit konkreten Anwendungsfällen statt bloßer
Definitionswiederholung. Bestehende Modul-/Lernfeldzuordnung erhalten.
Ausgangsbestand dieser Arbeitsrunde: 2433 Fragen.

## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-040-dpa-ds-modellbewertung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md und abgeschlossene CONTENT-038-Runde.
Recherche am 2026-10-29. Eigene Lernaufgaben, keine kopierten Prüfungsfragen.

- [scikit-learn Bewertung](https://scikit-learn.org/stable/modules/model_evaluation.html)
- [scikit-learn Datenleckage](https://scikit-learn.org/stable/common_pitfalls.html)
- [scikit-learn Kreuzvalidierung](https://scikit-learn.org/stable/modules/cross_validation.html)

Konkrete ID-Quellenzuordnung und Reviewbefunde werden im Ergebnis ergänzt.

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen DPA-DS-052 bis -075 mit 14 Spalten.
- [x] Bisherige 51 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechenfälle selbst gegenprüfen, Annahmen und Fragestämme eindeutig.
- [x] Keine bloßen Definitionsduplikate, plausible fachnahe Distraktoren.
- [x] Kein systematischer Längen-/Detailgrad-Bias oder exklusives Distraktormuster.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings behoben und nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, DPA-DS jetzt 75. Vollständiger unabhängiger Fachreview
am 2026-10-29 inklusive aller 96 Optionen: fachlich korrekte Schlüssel und
Erklärungen, eindeutige Lösungen, alte 51 Zeilen unverändert. Keine bloßen
Definitionsduplikate, kein systematischer Längenbias.

Vor Freigabe korrigiert: 060 (Schablonenvariation), 069b/070c/071c/074c
(typische fachliche Fehlannahmen statt fernliegender Alternativen).
Zusätzlich 075c/d auf Trainings- versus Generalisierungsaussage präzisiert.
Alle sechs aktuellen Zeilen erneut gelesen: **BESTANDEN**, keine offenen Findings.

Rechenwerte durch Python und unabhängig im Review bestätigt: Precision 75 %,
Recall 60 %, naive Accuracy 99 % / Recall 0 %, F1=2/3, Balanced Accuracy 0,7,
MAE 4, RMSE=sqrt(8). Quellenzuordnung: 052–058 Bewertungs-/Schwellendoku,
059–064 Common Pitfalls/Cross-validation, 065–067 Baseline/Fehlermaße,
068 Kalibrierung, 069 Validierungskurven, 070 Google ML Monitoring,
071 OneHotEncoder, 072 ROC/Threshold, 073–075 Evaluation/Klassengewichte.

Weitere Primärquellen des Reviewers:
- [Kalibrierung](https://scikit-learn.org/stable/modules/calibration.html)
- [Validierungskurven](https://scikit-learn.org/stable/modules/learning_curve.html)
- [OneHotEncoder](https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.OneHotEncoder.html)
- [Klassengewichte](https://scikit-learn.org/stable/modules/generated/sklearn.utils.class_weight.compute_class_weight.html)
- [Google ML Monitoring](https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring)

Gesamt nach CONTENT-040: 2481 Fragen. Content-Validator ohne Fehler,
Archivierung und check-agent-briefs grün. Kein DB-Import, Build, Commit
oder Push. Persönliche Freigabe nicht vorweggenommen.
