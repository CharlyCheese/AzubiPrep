# Brief CONTENT-074: FISI-NET – IPv6 und Switching-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-NET-287 bis -310 anhängen, Modul 100 → 124.
IPv6- und Layer-2-Anwendungsfälle nach globalem Lernzielabgleich.
Bestehende Zeilen und IDs bewahren. Globaler bisheriger FISI-NET-Maximalwert 286.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-074-fisi-net-ipv6-switching.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. IETF-RFCs für IPv6/ND/SLAAC/DHCPv6/PMTUD;
offizielle Switch-/Protokolldokumentation für konkrete Switching-Semantik.
Annahmen ausdrücklich nennen, keine herstellerspezifischen Regeln verallgemeinern.
Alter Byte-Präfix vor Änderung: SHA256
1100d6bd350fcbc52b7c28665c134d14822d9385d6f994a72e02010389f239da.

## Abnahmekriterien

- [x] 24 SC-Fragen, altes Schema und alte Bytes erhalten, IDs global eindeutig.
- [x] Belegte eindeutige Lösungen und explizite relevante Netzannahmen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-NET-287 bis -310 angehängt, Modul 100 → 124.
Unabhängiger Vollreview und vollständige Endfassungsnachprüfung durch
content074_review mit tatsächlich recherchierten RFC-/Cisco-Primärquellen
BESTANDEN. 292 starre Distraktor-Schablone variiert. 308 wegen Duplikatnähe
zu DVK-NET-099 komplett durch PSE-/PD-Leistungsbezug ersetzt.
297/298 Quelle auf den seit Januar2026 geltenden RFC9915 aktualisiert,
Semantik im neuen RFC bestätigt. Keine verbleibenden Befunde.

Quellenzuordnung: 287 RFC5952, 288 RFC4291, 289 RFC4007,
290–292/295 RFC4861, 293/294 RFC4862, 296 RFC8201 mit zusätzlichem
Reviewbeleg RFC8200, 297/298 RFC9915, 299/300 Cisco MAC-Konfiguration,
301 präzisere unabhängig recherchierte Cisco-MAC-Flap-Diagnose ergänzt,
302/303 Cisco STP, 304 BPDU Guard, 305/306 EtherChannel,
307 Cisco CoS/PCP, 308 HP-PSE-/PD-Tabelle, 309 Cisco CRC,
310 Cisco EtherChannel/min-links. Direkte Quellen je CSV-Zeile.
HP-Direktabruf beim Reviewer 403, Autor konnte den offiziellen Suchindex
lesen. Unabhängige Alternativbelege für 308:
https://www.cisco.com/c/en/us/solutions/collateral/enterprise-networks/nb-06-upoe-plus-it-ot-wp-cte-en.html
https://www.cisco.com/c/en/us/td/docs/solutions/Verticals/Lighting/Molex/DesignGuide/DigBldg-Molex-DG/DigBldg-Molex-DG.html
Kanonische IPv6-Schreibweise und 256 Präfixe zusätzlich rechnerisch geprüft.

App-Parser: 124 Datensätze, sämtliche Zeilen 15 Felder mit LF11b,
IDs global eindeutig. Dokumentierter alter Byte-Präfix unverändert.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits, Pushes oder Netzwerkänderungen.
