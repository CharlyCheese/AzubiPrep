# Brief CONTENT-062: DPA-ANA – Wahrscheinlichkeit, Unsicherheit und statistische Schlussfolgerungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-ANA von 74 auf 98 Fragen erweitern.
24 neue SC-Fragen DPA-ANA-075 bis -098.
Alte Datensätze und IDs unverändert erhalten.


## Betroffene Dateien

- `content/questions/DPA-ANA.csv`
- `docs/agent-briefs/CONTENT-062-dpa-ana-wahrscheinlichkeit-inferenz.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Mathematische Modelle, Voraussetzungen und Protokoll-/Engineannahmen
ausdrücklich nennen. Primärquellen tatsächlich recherchieren und zuordnen.

- https://www.itl.nist.gov/div898/handbook/
- https://online.stat.psu.edu/stat414/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Lösungen und Erklärungen eindeutig; Rechnungen/Annahmen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; nahe plausible Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen DPA-ANA-075 bis -098 angehängt, Modul 74 → 98.
Unabhängiger Vollreview durch content062_review mit Primärquellenrecherche, allen Einzelrechnungen und vollständiger Nachprüfung BESTANDEN. Wiederkehrende falsche Phrase in 083/089/090 beseitigt. 084 behandelt Hebelwirkung statt eines bereits vorhandenen Extrapolationsfalls.

Quellenzuordnung: 075 Penn State STAT414 Lesson05; 076 STAT200 Lesson02; 077/078 STAT414 Lesson04; 079/080 Lesson10; 081 Lesson12; 082/083 Lesson18; 084 NIST Regression Diagnostics; 085 NIST Prediction Intervals; 086/089 ASA-Originalstatement; 087 NIST Hypothesis Testing; 088 NIST Bonferroni; 090 Penn State STAT800 Lesson03; 091/095 NIST Non-Randomness und Penn State Autocorrelation; 092 Statistics Canada Survey Methodology 2009 S.38; 093 NIST DLMF Means; 094 NIST Histogram; 096 R quantile Type 7 plus ausdrücklich vorgegebene Regel; 097 NIST Bootstrap; 098 NIST Exact Binomial Limits.
Direkte Belege: https://online.stat.psu.edu/stat414/Lesson05 ; https://itl.nist.gov/div898/software/dataplot/refman1/auxillar/regrdiag.htm ; https://www.itl.nist.gov/div898/handbook/pmd/section5/pmd512.htm ; https://doi.org/10.1080/00031305.2016.1154108 ; https://www150.statcan.gc.ca/n1/pub/12-001-x/12-001-x2009001-eng.pdf ; https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html ; https://itl.nist.gov/div898/software/dataplot/refman1/auxillar/bootfit.htm ; https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm
Rechenwerte: 0,06; 0,6; 10 %; 0,40; 27,1 %; 9,6 %; 13,53 %; Power 80 %; Bonferroni 0,5 %; geometrisches Mittel 31,62; Quantil 7,5; einseitige Binomialgrenze 2,95 %.

Bestand ausschließlich durch Anhänge erweitert. Beleggrenze: 001–050 gegenüber Git-HEAD unabhängig identisch bestätigt. Für die früher uncommitteten 051–074 aus CONTENT-039 liegt kein gesonderter Vorher-Snapshot vor CONTENT-062 vor; der Reviewer hat deren Unverändertheit deshalb nicht als unabhängigen Vollvergleich behauptet.
Content-Validierung, git diff --check und Archivierungscheck erfolgreich. Keine Datenbankimporte, Builds, Commits oder Pushes.
