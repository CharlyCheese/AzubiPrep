# Brief CONTENT-091: FISI-NET – DNS und Paketdiagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-NET-311 bis -334 ergänzen, Modul124 → 148.
DNS-Protokolldetails und konkrete Readonly-Diagnosefunktionen.
Keine Pakete mitschneiden, Netzkonfiguration ändern oder DNS-Abfragen starten.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-091-fisi-net-dns-diagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md; IETF-RFCs, ISC-BIND-Dokumentation und
Originalmanpages von tcpdump/libpcap/iproute2.
124 Modulfragen gelesen; globale DNS-Vorprüfung berücksichtigt insbesondere
NETZ-GRUND009/011 (Sichten/Negativcache), FISI-NET279/280/285
(TTL/Alias/DNSSEC), damit diese Lernziele nicht wiederholt werden.
IDs FISI-NET sind global mit NETZ-GRUND geteilt, bisheriges Maximum310.
Alter Byte-Präfix SHA256:
357b99c941ebe17bccb0394db06157bee01fe209ffda32a63b691f4ba2d92799.
15-Feld-Schema einschließlich LF11b erhalten.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, globale IDs eindeutig.
- [x] Protokoll-/Werkzeugsemantik und Voraussetzungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, FISI-NET124 → 148. Gesamtkatalog3657.
Frischer Readonly-Reviewer content091_review prüfte jede Frage mit eigener
Primärquellenrecherche und globaler semantischer Suche über26CSV.
316 wegen Überschneidung mit NETZ-GRUND007 komplett durch DNS-Labelgrenze
ersetzt,318 Satzschablone entkoppelt,327 Leerzeichen ergänzt. Gespeicherte24
Endfragen vollständig erneut gelesen: BESTANDEN, keine offenen Findings.

Echter App-Parser:148 Records,15 Felder einschließlich LF11b,24 neue SC;
alter Byte-Präfix unverändert. Content-Validator, Diff- und Archivierungscheck
bestanden. Keine DNS-/Paketdiagnosebefehle oder Netzwerkänderungen ausgeführt.

Primärquellen in CSV: RFC1035,2181,7766,1995,2782; tcpdump-Originalmanpage
aus dem offiziellen Quellrepository, libpcap-/ss-Originalmanpages auf man7.org
und offizielles Wireshark-Handbuch. tcpdump.org war durch robots blockiert,
die Originalmanpage im Quellrepository wurde stattdessen direkt gelesen.
