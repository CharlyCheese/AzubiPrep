# Brief CONTENT-071: FIAE-UX – native Webformulare und Ereignisse

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-UX-101 bis -124 anhängen, Modul 100 → 124.
Konkrete native HTML-Formularsemantik, Validierung und DOM-Ereignisse.
Vorhandene WCAG-/ARIA-Lernziele nicht wiederholen.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-071-fiae-ux-native-formulare.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. WHATWG HTML/DOM Living Standards.
Eigene Szenarien ohne Framework-Sonderregeln. Relevante Voraussetzungen
ausdrücklich angeben. Alter Byte-Präfix vor Änderung: SHA256
f4303f3c1fd0482341d07c9f7f3777ad895352cfb7634335f1dd98eb9913db43.

## Abnahmekriterien

- [x] 24 neue SC-Fragen, 14 Felder, alte Bytes und eindeutige IDs erhalten.
- [x] Lösungen und Erklärungen durch tatsächlich recherchierte Standards belegt.
- [x] Keine Inhaltsduplikate und keine systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-UX-101 bis -124 angehängt, Modul 100 → 124.
Unabhängiger vollständiger Review durch content071_review mit tatsächlich
recherchierten WHATWG-Primärquellen und Endfassungsnachprüfung BESTANDEN.
Sprachmuster in 102/104/105/108/123/124 behoben, unter anderem gleiche
Passivform in 104 und vergleichbare Elementbegründung in 124. Keine
fachlichen Restbefunde, keine globalen Inhaltsduplikate.

Quellenzuordnung (direkte Quellen je CSV-Zeile):
101/114/115/123/124 HTML Form Elements; 102/104/105/108/109/111/112
Form Control Infrastructure; 103/107/110/116/117 Input;
106 XHR FormData/getAll; 113 Forms/requestSubmit;
118–121 DOM Event; 122 Interactive Elements/details/summary.
Button-Autozustand, erste-legend-Ausnahme, readonly-Übermittlung,
required bei Leerzeichen und passive Ereignisbehandlung explizit geprüft.

App-Parser bestätigt 124 Datensätze mit je 14 Feldern, neue IDs global
eindeutig. Dokumentierter alter Byte-Präfix unverändert bestätigt.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
