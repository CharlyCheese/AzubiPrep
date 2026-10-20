# Brief CONTENT-034: FIAE-TST um Anwendungsfälle vertiefen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

FIAE-TST von 40 auf 64 Fragen erweitern: 24 zusätzliche Aufgaben zu
Testentwurf, Überdeckung, Fehleranalyse und belastbarer Automatisierung.
Anwendungsfälle ergänzen die bereits vielfach vorhandenen Grunddefinitionen.
Ausgangsgesamtbestand nach CONTENT-033: 2313 Fragen.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-034-fiae-tst-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md und CONTENT-008 (FIAE-Ausbau). Quellenrecherche
am 2026-10-20, eigene Aufgaben, keine übernommenen Prüfungsfragen.

- [KMK, LF11a](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf)
- [ISTQB CTFL 4.0.1](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf): Testentwurf, Testarten, Überdeckung und Berichte.
- [Playwright Best Practices](https://playwright.dev/docs/best-practices) und [Auto-waiting](https://playwright.dev/docs/actionability): stabile Browsertests.
- [pytest: Fixtures](https://docs.pytest.org/en/stable/how-to/fixtures.html), [Flaky tests](https://docs.pytest.org/en/stable/explanation/flaky.html), [Parametrize](https://docs.pytest.org/en/stable/how-to/parametrize.html): Isolation, Laufzeitabhängigkeiten, Testdaten.
- [Stryker: Mutation testing](https://stryker-mutator.io/docs/) und [Equivalent mutants](https://stryker-mutator.io/docs/mutation-testing-elements/equivalent-mutants/): künstliche Codeänderungen als Testprobe.
- [Hypothesis](https://hypothesis.readthedocs.io/en/latest/): eigenschaftsbasierte Tests.

## Umsetzung

- [x] Bestand und Themenlücken gegen neue Inhalte abgleichen.
- [x] 24 SC-Fragen FIAE-TST-041 bis -064 im 14-Spalten-Schema ergänzen.
- [x] Struktur-/Duplikat-/Längenprüfung und Rechengegenproben.
- [x] Vollständiger unabhängiger Fachreview mit echten Primärquellen.
- [x] Findings beheben, Nachreview, validieren und archivieren.

## Abnahme-Kriterien

- [x] 24 eindeutige neue SC-Fragen mit vier unterschiedlichen Optionen und korrekter Erklärung.
- [x] Alle bisherigen 40 Datensätze unverändert, keine ID-/Textduplikate.
- [x] Passend zu LF11a, zusätzliche Anwendung statt bloßer Definitionswiederholung.
- [x] Plausible Distraktoren, kein systematischer Längen- oder Schablonen-Tell.
- [x] Vollreview bestanden, Rechenaufgaben geprüft, keine offenen Findings.
- [x] Content-Validierung und check-agent-briefs erfolgreich.

## Ergebnis

24 SC-Fragen ergänzt, FIAE-TST jetzt 64. Der erste Batch allein erhöht den
Bestand von 2313 auf 2337 Fragen. Parallel folgende Batches sind getrennt
in CONTENT-035/036 dokumentiert.

Unabhängiger vollständiger Fachreview am 2026-10-20 mit frischem Kontext:
alle 24 Fragen mit 96 Optionen, Lösung, Erklärung und Schwierigkeit geprüft.
Kein fachlicher Fehler, keine Definitionsduplikate. Rechengegenproben 041
(Klassen), 042 (17/18/65/66), 043 (2² = 4), 046 (10/11), 047 (75 %) und
062 (absolute Toleranz) bestätigt. Bestandszeilen 001–040 laut Git-Diff
unverändert. Kein systematischer Längen-/Detailgradbias.

Ein P2-Finding zu 050 korrigiert: die drei Distraktoren begannen identisch
mit „Eine …“, während die richtige Antwort eine Liste war. Option c
umformuliert. Aktuelle Zeile vom Reviewer erneut gelesen: **BESTANDEN**,
keine offenen Findings. Der Reviewer nutzte zusätzlich die offiziellen
[Playwright Assertions](https://playwright.dev/docs/test-assertions),
[Clock](https://playwright.dev/docs/clock) und
[pytest approx](https://docs.pytest.org/en/stable/reference/reference.html#pytest-approx).

ID-Quellenzuordnung: 041–052 und 063–064 ISTQB/selbst formulierte Anwendung,
053–056 pytest, 057–058 Playwright, 059 pytest Monkeypatch,
060 Stryker, 061 Hypothesis, 062 pytest approx.

Content-Validierung erfolgreich (26 Dateien, keine Fehler), Archivierung
in DONE.md mit anschließendem check-agent-briefs. Kein DB-Import,
Installer-Build oder Commit. Svens persönliche Freigabe nicht vorweggenommen.
Änderungen aus CONTENT-033 erhalten.
