# Brief CONTENT-063: DPA-DS – ML-Verfahren, Ergebnisinterpretation und Modellbetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-DS von 75 auf 99 Fragen erweitern.
24 neue SC-Fragen DPA-DS-076 bis -099.
Alte Datensätze und IDs unverändert erhalten.


## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-063-dpa-ds-verfahren-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Mathematische Modelle, Voraussetzungen und Protokoll-/Engineannahmen
ausdrücklich nennen. Primärquellen tatsächlich recherchieren und zuordnen.

- https://scikit-learn.org/stable/user_guide.html
- https://imbalanced-learn.org/stable/user_guide.html
- https://developers.google.com/machine-learning/guides/rules-of-ml

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Lösungen und Erklärungen eindeutig; Rechnungen/Annahmen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; nahe plausible Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen DPA-DS-076 bis -099 angehängt, Modul 75 → 99.
Unabhängiger Vollreview durch content063_review und vollständige Nachprüfung BESTANDEN. Verfügbare Betriebsdaten in 094 ausdrücklich genannt, wiederkehrendes falsches Signalwort in 093/097/098 entfernt, Distraktoren in 082/091/092/093/097/098 durch nahe Fehlannahmen ersetzt.

Tatsächlich recherchierte Quellenzuordnung: 076 scikit-learn Feature Scaling; 077 Nearest Neighbors; 078/079 Clustering; 080 DBSCAN; 081 Preprocessing; 082 TargetEncoder; 083 Permutation Importance; 084 SHAP Causal Insights; 085 PCA; 086 SVM/SVC; 087 RMSE; 088 r2_score; 089 MAPE; 090 f1_score; 091 Precision-Recall; 092 imbalanced-learn SMOTE; 093 Probability Calibration; 094 Google Production ML Monitoring; 095 El-Yaniv/Wiener Selective Classification; 096 Google Rules of ML; 097/098 Model Persistence; 099 pandas merge und eigene Schlüsselzuordnung.
Direkte Primärbelege: https://scikit-learn.org/stable/modules/generated/sklearn.preprocessing.TargetEncoder.html ; https://scikit-learn.org/stable/modules/permutation_importance.html ; https://shap.readthedocs.io/en/latest/example_notebooks/overviews/Be%20careful%20when%20interpreting%20predictive%20models%20in%20search%20of%20causal%20insights.html ; https://imbalanced-learn.org/stable/over_sampling.html ; https://scikit-learn.org/stable/modules/calibration.html ; https://developers.google.com/machine-learning/crash-course/production-ml-systems/monitoring ; https://www.jmlr.org/papers/volume11/el-yaniv10a/el-yaniv10a.pdf ; https://scikit-learn.org/stable/model_persistence.html ; https://pandas.pydata.org/docs/reference/api/pandas.merge.html
Unabhängige Rechnungen: Zentrum (1,0), RMSE A sqrt(12) ≈ 3,464 und B 2, Abdeckung 80 %, bedingte Genauigkeit 95 %. Nullnenner und negative R²-Interpretation korrekt.

Keine globalen Duplikate oder verbleibenden sprachlichen Muster gefunden. 24 eindeutige neue IDs, Schema 14 Felder, HEAD-Präfix unverändert. Content-Validierung, git diff --check und Archivierungscheck erfolgreich. Keine Datenbankimporte, Builds, Commits oder Pushes.
