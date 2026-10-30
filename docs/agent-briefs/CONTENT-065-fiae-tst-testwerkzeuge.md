# Brief CONTENT-065: FIAE-TST – Testwerkzeuge und präzise Prüfaussagen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 eigenständige SC-Fragen FIAE-TST-077 bis -100 anhängen, Modul 76 → 100.
Vorhandene Zeilen unverändert erhalten. Schwerpunkt konkrete Werkzeugfälle
und Prüfaussagen statt wiederholter Definitionen.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-065-fiae-tst-testwerkzeuge.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md und CONTENT-CHECKPOINT.md.
Bestand aller Fragen auf gleiche Lernziele abgleichen.
Primärquellen: offizielle Dokumentationen von pytest, Python unittest.mock,
Playwright, Hypothesis, JUnit und coverage.py. Konkrete Zuordnung beim Abschluss.

## Abnahmekriterien

- [x] Genau 24 neue Fragen, 14 Felder, gültige global eindeutige IDs.
- [x] Fachlich eindeutige Lösungen, passende Annahmen und Erklärungen.
- [x] Keine Inhaltsduplikate, plausible Distraktoren und keine Sprachmuster-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen angehängt, FIAE-TST 76 → 100. Unabhängiger Vollreview durch
content065_review mit tatsächlicher Primärquellenrecherche BESTANDEN.
Ein Sprachmuster in 094 (drei falsche Optionen begannen mit Die) korrigiert
und gespeicherte Endfassung nachgeprüft. Keine weiteren Befunde.

Quellenzuordnung (direkte URLs außerdem jeweils in den CSV-Zeilen):
077/078 pytest Fixtures (Caching und Ausnahme vor yield), 079 pytest xfail,
080 pytest Assertions/Unterklassen, 081 pytest Parametrisierung (2 × 3 = 6),
082 tmp_path, 083 Logging/caplog, 084–088 Python unittest.mock einschließlich
Where to patch, Autospeccing und AsyncMock. 089 Playwright locator.all,
090 Strictness, 091 BrowserContexts, 092 Soft Assertions.
093 Hypothesis Shrinking, 094 Strategiekonstruktion, 095 floats-Parameter.
096/097 JUnit 5.14.1 Assertions, 098 Test Instance Lifecycle.
099 coverage.py Source, 100 Branch Coverage/Gesamtformel (11/12 = 91,7 %).
Alle Quellen vom unabhängigen Reviewer tatsächlich recherchiert.

Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
