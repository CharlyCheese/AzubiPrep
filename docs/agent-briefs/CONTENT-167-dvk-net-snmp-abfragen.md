# Brief CONTENT-167: DVK-NET – SNMP-Abfragen und Zähler

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-NET-196 bis -219 ergänzen, Modul 195 → 219.
Konkrete SNMP-/Net-SNMP-Abfragen, MIB-Auswertung und Zählersemantik.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-167-dvk-net-snmp-abfragen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

195 Altstämme gelesen; globale 26 CSV semantisch abgleichen. Bisherige
SNMP-Zweck- und authPriv-Grundlagen nicht wiederholen. Eigene frische
Primärrecherche offizielle Net-SNMP-Handbücher und RFC 3416/2578/2863.
Statische Szenarien, keine tatsächlichen Geräteabfragen oder Schreibzugriffe,
keine Zugangsdaten, Installationen, DB/.env, Builds, Commits oder Pushes.
Altpräfix 111152 Byte SHA256:
515eb174f1b43ac6b2e35c33aa00cf42b98cc31e6cf5cab9a27e339ce89144ef.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5481. Frischer Reviewer content167_review
prüfte alle Fragen, 96 Optionen, Erklärungen, 195 Altstämme und globale
Nachbarn. Deutsches Dezimalkomma in 216 geglättet, gespeicherte Endfassung
aller 24 Fragen erneut bestätigt. Keine offenen Findings, Lernzielduplikate
oder bindenden Antwort-Tells. Autor und Reviewer recherchierten unabhängig
offizielle Net-SNMP-Handbücher und RFC 3416/2578/2863; Quellen je Frage in
der CSV. Drei Zahlenfälle unabhängig nachgerechnet. Altpräfix, App-Parser,
Content-Validator, Diffcheck und Archivcheck bestanden. Keine echten
SNMP-Geräteabfragen oder Schreibzugriffe ausgeführt.
