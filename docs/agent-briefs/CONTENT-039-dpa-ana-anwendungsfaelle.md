# Brief CONTENT-039: DPA-ANA – Statistische Anwendungsfälle und Ergebnisinterpretation

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-ANA von 50 auf 74 Fragen erweitern. 24 neue, selbst
formulierte SC-Aufgaben mit konkreten Anwendungsfällen statt bloßer
Definitionswiederholung. Bestehende Modul-/Lernfeldzuordnung erhalten.
Ausgangsbestand dieser Arbeitsrunde: 2433 Fragen.

## Betroffene Dateien

- `content/questions/DPA-ANA.csv`
- `docs/agent-briefs/CONTENT-039-dpa-ana-anwendungsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md und abgeschlossene CONTENT-038-Runde.
Recherche am 2026-10-29. Eigene Lernaufgaben, keine kopierten Prüfungsfragen.

- [NIST Statistik-Handbuch](https://www.itl.nist.gov/div898/handbook/)
- [NIST Ausreißer](https://www.itl.nist.gov/div898/handbook/eda/section3/eda35h.htm)
- [NIST gepaarte Beobachtungen](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm)

Konkrete ID-Quellenzuordnung und Reviewbefunde werden im Ergebnis ergänzt.

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen DPA-ANA-051 bis -074 mit 14 Spalten.
- [x] Bisherige 50 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechenfälle selbst gegenprüfen, Annahmen und Fragestämme eindeutig.
- [x] Keine bloßen Definitionsduplikate, plausible fachnahe Distraktoren.
- [x] Kein systematischer Längen-/Detailgrad-Bias oder exklusives Distraktormuster.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings behoben und nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, DPA-ANA jetzt 74. Vollständiger unabhängiger Review am
2026-10-29 einschließlich aller 96 Optionen: Musterlösungen und Erklärungen
korrekt, keine Definitionsduplikate, alte 50 Zeilen unverändert.

Vier Qualitätsfindings korrigiert: 065c (Gewichtungsfehlannahme statt Runden),
067 (Ob/Warum-Schablone und fernliegende Distraktoren), 068 (Detailgrad und
Datenbehandlungsalternativen), 071 (durchgängig Monatsbezugsgrößen).
Aktuelle vier Fragen erneut vom Reviewer gelesen: **BESTANDEN**, keine
offenen Findings. Die Antwortpositionen wurden wegen der Anzeigemischung
nicht als Qualitätsfehler gewertet.

Rechenaufgaben mit lokalem Python und unabhängig im Review bestätigt:
051 14; 052 Median 4/Mittel 22,8; 053 Varianz 4; 054 Halbierung;
057 Erwartungswert 1; 058 5 Prozentpunkte/25 %; 059 2,6 %;
061 20; 062 +3; 069 obere Grenze 35/Antwort 40; 070 z=3;
072 20; 073 10 %/7,5 %; 074 82/18 Erfolge.
055 beweist ausdrücklich keine Gleichwertigkeit bei enthaltener 0.

Zusätzliche tatsächlich recherchierte Reviewquellen:

- 053–057: [NIST Skalen](https://www.itl.nist.gov/div898/handbook/eda/section3/eda356.htm), [Mittelwertintervall](https://www.itl.nist.gov/div898/handbook/eda/section3/eda352.htm), [p-Werte](https://itl.nist.gov/div898/handbook/prc/section1/prc131.htm).
- 060: [Stanford Korrelation](https://web.stanford.edu/class/stats60/slides/09-lecture-correlation.html).
- 061–062: [Penn State Regression](https://online.stat.psu.edu/stat200/Lesson12).
- 063/074: [CDC Confounding](https://www.cdc.gov/field-epi-manual/php/chapters/analyze-interpret-data.html).
- 065–066: [Statistics Canada freiwillige Stichproben](https://www150.statcan.gc.ca/n1/edu/power-pouvoir/ch13/nonprob/5214898-eng.htm).
- 067: [US Census Imputation](https://www.census.gov/programs-surveys/cps/technical-documentation/methodology/imputation-of-unreported-data-items.html).
- 069: [NIST Boxplot-Grenzen](https://itl.nist.gov/div898/handbook/eda/section3/boxplot.htm).
- 071–072: [NIST Saison](https://itl.nist.gov/div898/handbook/pmc/section4/pmc443.htm), [Moving Average](https://www.itl.nist.gov/div898/handbook/pmc/section4/pmc421.htm).

Gesamt nach diesem Batch: 2457 Fragen. Validator ohne Fehler, Archivierung
in DONE.md und check-agent-briefs erfolgreich. Kein DB-Import, Build, Commit
oder Push; persönliche Freigabe nicht vorweggenommen.
