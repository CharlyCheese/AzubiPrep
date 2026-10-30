# Brief CONTENT-129: DPA-ANA – SciPy-Statistikfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-ANA-171 bis -194 ergänzen, Modul170 →194.
Statistische Testwahl und konkrete Parameter-/Auswertungsfälle mit SciPy.

## Betroffene Dateien

- `content/questions/DPA-ANA.csv`
- `docs/agent-briefs/CONTENT-129-dpa-ana-scipy-statistik.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle170 Altstämme gelesen. Globale Suche über26CSV nach SciPy/testspezifischen
Namen ohne bestehende entsprechende Lernziele (vorhandene CSR-Erwähnung
betrifft StandardScaler). Vorhandene Testgrundlagen, Bonferroni, normale
Bootstrap-Erzeugung und Standardfehler-Skalierung nicht wiederholen.
Primärquelle aktuelle offizielle SciPy-Referenzseiten je Funktion.
SciPy ist lokal nicht vorhanden: keine Installation; Rechnungen soweit
möglich mit Python-Standardbibliothek und Referenzformeln gegenprüfen.
Altpräfix88545 Byte SHA256:
295e27893e0d586981401c35f0560477065a0d21261280c477dccff065580668.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, global eindeutige IDs, Altbytes erhalten.
- [x] Testprämissen, Parameter und Lösungen primärquellenbelegt und eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DPA-ANA170 →194, Katalog4569. content129_review hat alle24 tatsächlich
gespeicherten Endfassungen,170 Altstämme und globale Lernzielkandidaten
über26CSV unabhängig geprüft; ohne Findings freigegeben. Alle Lösungen
und Zahlen unabhängig anhand offizieller aktueller SciPy-Referenz und
Python-Standardbibliothek bestätigt. Keine SciPy-Installation vorgenommen.
Keine bindenden Sprach-/Längen-Tells. 192 konkreter SciPy-ddof-Standard,
193 gemeinsame Bootstrap-Indizes und194 Permutationstyp wiederholen
nicht die allgemeinen Altfragen054/064/097.

Primärquellen: https://docs.scipy.org/doc/scipy/reference/generated/
jeweils scipy.stats.<Funktion>.html für ttest_ind,ttest_rel,ttest_1samp,
mannwhitneyu,wilcoxon,spearmanr,kendalltau,chisquare,chi2_contingency,
fisher_exact,ks_2samp,shapiro,levene,normaltest,binomtest,poisson,norm,
sem,bootstrap,permutation_test sowie
https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats._result_classes.BinomTestResult.proportion_ci.html.
Jede konkrete URL ist außerdem in der jeweiligen CSV-Zeile hinterlegt.

Nachrechnungen:df11,Spearman1,Tau1/3,erwartete Häufigkeiten30,
Zellenhäufigkeit10,Odds-Ratio36,Binomial-statistic0,2,Normaldichte3,9894,
rechte Schwanzfläche0,0249979,97,5%-Quantil1,9599639845. App-Parser194/14,
Altpräfixhash unverändert, globale IDs eindeutig. Content-Validator4569/
26 Module, Diff-Check grün; Brief/DONE/STATUS archiviert und geprüft.
