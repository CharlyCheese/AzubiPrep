# Brief CONTENT-077: DVK-AUT – P-/I-/D-Reglermodelle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

12 SC-Fragen DVK-AUT-100 bis -111 anhängen, Modul 99 → 111.
Eigene ausdrücklich definierte Simulations- und Rechenmodelle zu Regleranteilen,
Sättigung und Signalverhalten. Keine Einstellanweisung für reale Anlagen.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-077-dvk-aut-reglermodelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Offizielle MathWorks-/Beckhoff-Reglerdokumentation,
universitäre Regelungstechnikquellen. Formeln, Vorzeichen, Initialwerte und
Grenzen ausdrücklich in den Fällen angeben. Global auf verwandte Lernziele prüfen.
Alter Byte-Präfix vor Änderung: SHA256
8a19c4dd720d7bd27f2df1142e2abbed62b00e0a084e30c6bbcf32cfc2584531.

## Abnahmekriterien

- [x] Genau12 SC-Fragen, altes Schema/alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige Modellannahmen, Lösungen und unabhängige Rechnungen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

12 Fragen DVK-AUT-100 bis -111 angehängt, Modul 99 → 111.
Unabhängiger Vollreview durch content077_review mit tatsächlicher
Primärquellenrecherche BESTANDEN, keine Findings. Alle Formeln und
Zustandsannahmen unabhängig nachgerechnet, ausdrücklich Simulationsmodelle.

Ergebnisse: e3, u16, I nach drei Schritten3, D8, bei e0 im gegebenen
P-Modell u0, Split-Range0/20, Totzone0, erhaltener Integralzustand12.
104 P-Zustandsfreiheit, 105 Anti-Windup, 106 D-Rauschen,
107 D ohne direkten Sollwertsprung, 108 Filterdynamik fachlich bestätigt.

Quellen: direkte MathWorks PID-, Anti-Windup- und 2DOF-Seiten in den
zugehörigen CSV-Zeilen. Eigene vollständig vorgegebene Zahlenmodelle.
Zusätzlich unabhängig recherchierte Belege:
https://infosys.beckhoff.com/content/1033/tf4100_tc3_controller_toolbox/245435787.html
https://courses.physics.illinois.edu/ece486/sp2026/documentation/handbook/lec09.html
Michigan-CTMS-Abruf403, nicht als vollständig gelesener Beleg verwendet.

Globale Lernzielprüfung grenzt 110 ohne Gedächtnis von 082 mit Hysterese,
111 Zustandserhalt von 102 Zustandsaufbau und konkrete Formeln von alten
Begriffsfragen ab. Keine globalen Inhaltsduplikate oder systematischen Tells.
App-Parser:111 Datensätze,14 Felder, IDs global eindeutig, alter Byte-Präfix
unverändert. Content-Validator, git diff --check und Archivierungscheck grün.
Keine Datenbankimporte, Builds, Commits, Pushes oder Anlagenänderungen.
