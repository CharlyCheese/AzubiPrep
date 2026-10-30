# Brief CONTENT-069: FIAE-PRG – Python-Sprachfälle und Standardbibliothek

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-PRG-123 bis -146 anhängen, Modul 122 → 146.
Konkrete Python-3.12-Auswertungen mit neuen Lernzielen gegenüber 001–122.
Bestehende Zeilen unverändert erhalten.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-069-fiae-prg-python-sprachfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Offizielle Python-3.12-Dokumentation.
Eigene kurze Programme und ausdrücklich festgelegte Typen/Zustände.
Alter Byte-Präfix vor Änderung: SHA256
e069237a13812739c11e40987942cddf01ad2d6c5bd1187d2e9c23b4a9d071f6.

## Abnahmekriterien

- [x] 24 neue SC-Fragen, global eindeutige IDs, alter Byte-Präfix erhalten.
- [x] Eindeutige Auswertungen, Musterlösungen und Erklärungen.
- [x] Keine globalen Inhaltsduplikate und keine Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-PRG-123 bis -146 angehängt, Modul 122 → 146.
Unabhängiger Vollreview durch content069_review einschließlich Recherche
der offiziellen Python-3.12-Dokumentation und Endfassungsnachprüfung
BESTANDEN. 138: Dreier-Distraktor-Schablone durch anders formulierte
Option a aufgelöst. Keine weiteren Befunde, globale Lernzielsuche bestanden.

Alle 24 Fälle unabhängig ausgeführt. Lokal CPython 3.13.1 vorhanden,
Python 3.12 nicht installiert; versionsbezogene Aussagen durch offizielle
3.12-Dokumentation und 127 zusätzlich CPython-3.12-Quelltext abgesichert.
Autor hat die kompakten ausführbaren Wertfälle ebenfalls geprüft.

Quellenzuordnung: 123/127/129/130/132 Standardtypen, 124 PEP584,
125 Datenmodell/Hashbarkeit, 126 Sorting HOWTO, 128/137/138 Control Flow,
131/135 Simple Statements, 133/134 Expressions, 136 Programming FAQ,
139 Dataclasses, 140 Context Manager/Datenmodell, 141 Compound Statements,
142 Built-in Functions/int, 143/144 math, 145 datetime, 146 json.
Direkte Quellen je CSV-Zeile. Zusätzlicher unabhängiger Beleg für 127:
https://raw.githubusercontent.com/python/cpython/3.12/Objects/dictobject.c

App-Parser bestätigt 146 Datensätze mit je 14 Feldern, global eindeutige
IDs und unveränderten oben dokumentierten Byte-Präfix. 126 prüft neben
In-place-Veränderung den Rückgabewert, 139 die konkrete Dataclass-Fabrik;
Reviewer bestätigt eigenständige Lernziele gegenüber älteren Fragen.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
