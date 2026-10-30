# Brief CONTENT-092: DVK-AUT – Structured-Text-Auswertungsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DVK-AUT-112 bis -135 ergänzen, Modul111 → 135.
Konkrete CODESYS-Structured-Text-Fälle zu Kontrollfluss, Arrays und
typisierten Bit-/Auswahloperatoren, ausschließlich simulierte Programmlogik.
Keine SPS ansteuern, Runtime installieren oder Steuerungsprogramme starten.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-092-dvk-aut-structured-text.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md; offizielle CODESYS-Entwicklungsdokumentation.
111 Bestandsfragen gelesen. Globale Vorprüfung berücksichtigt bereits
vorhandene Flanken-/Timer-/Instanzfragen, die nicht wiederholt werden.
Neue API-/Syntaxregeln werden gegen allgemeine Programmierfragen abgegrenzt.
Alter Byte-Präfix SHA256:
e00f93b84bc88a670f6b6cd7cca10330fdd914219e611a1a31c6dbd94c53171e.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] CODESYS-Semantik, Datentypen und Ergebnisse primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, DVK-AUT111 → 135. Gesamtkatalog nach diesem Batch3681.
Frischer Readonly-Reviewer content092_review prüfte alle24 gespeicherten
Fragen mit eigener offizieller CODESYS-Primärquellenrecherche und globaler
semantischer Suche über26CSV. BESTANDEN ohne Findings. Insbesondere
Arrayinitialisierung mit schneller erster Dimension und typisierte
BYTE-Breiten bei Schieben/Rotation einzeln bestätigt.

Echter App-Parser:135 Records,14 Felder,24 neue SC; alter Byte-Präfix
unverändert; eingebettete Semikolons korrekt als Feldinhalt gelesen.
Acht Bitrechnungen und zwei Schleifenergebnisse unabhängig als reine
Python-Arithmetik bestätigt. Keine CODESYS-Runtime installiert oder benutzt,
keine SPS angesteuert. Content-Validator, Diff- und Archivierungscheck grün.

Primärquellen pro Frage in CSV: offizielle CODESYS-Entwicklungsdokumentation
zu Assignment/EQ, IF/CASE/FOR/WHILE/REPEAT/EXIT/CONTINUE, AND_THEN, ARRAY,
AND/OR/XOR/NOT, SHL/SHR/ROL/ROR und SEL/LIMIT/MIN/MUX
(https://content.helpme-codesys.com/en/CODESYS%20Development%20System/).
