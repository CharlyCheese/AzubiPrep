# Brief CONTENT-058: FIAE-PRG – Datenverarbeitung, Algorithmen und Codeverständnis

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FIAE-PRG von 98 auf 122 Fragen erweitern.
24 neue SC-Fragen FIAE-PRG-099 bis -122.
Bisherige Datensätze, IDs und Modul-/Lernfeldzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-058-fiae-prg-daten-algorithmen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Versionen und Laufzeitannahmen ausdrücklich nennen. Primärquellen
tatsächlich recherchieren und im Ergebnis zuordnen.

- https://docs.python.org/3/tutorial/
- https://docs.oracle.com/en/java/javase/21/docs/api/
- https://docs.python.org/3/library/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Code/Rechnungen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; plausible fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-PRG-099 bis -122 ergänzt, Modul jetzt 122 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. Eröffnungsmuster 117
beseitigt. Alte 98 Datensätze unverändert, keine neuen Inhaltsduplikate
oder systematischen Längen-/Detailgrad-Tells.

Python-Beispiele zusätzlich isoliert lokal ausgeführt: Slices, range,
Comprehensions, Generatorverbrauch, zip/enumerate, stabile Sortierung,
any-Kurzschluss, setdefault, Dictionary-Schlüsselkollision, strip,
Unicode/UTF-8, fullmatch, heapq, bisect und Coroutine-Erzeugung bestätigt.
Java/Javac ist lokal nicht installiert; Java-Fälle wurden unabhängig
gegen offizielle Java-SE-21-Spezifikationen geprüft, keine Installation.

Tatsächlich recherchierte Primärquellen (2026-10-29):
- 099–117: [Python-Dokumentation](https://docs.python.org/3/), Built-in Types/Functions, Tutorial, Expressions, Unicode HOWTO, re, Exception Chaining, heapq, bisect und asyncio Coroutines.
- 118: JLS SE21 §4.2.1–4.2.2, int-Ergebnis −2.147.483.648.
- 119/120: Java SE21 List Unmodifiable Lists und Optional.
- 121: JLS SE21 §15.12.4.5, Argumentwerte in neuen Parametervariablen.
- 122: Java SE21 Stream Operations and Pipelines.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
