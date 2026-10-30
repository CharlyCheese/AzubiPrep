# Brief CONTENT-045: FISI-NET – Adressplanung, Routing und Netzwerkdiagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FISI-NET von 76 auf 100 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen vorhandene Definitionen. Bestehende IDs und
Lernfeld-/Modulzuordnung erhalten. Neue IDs beginnen bei 263, nicht
notwendigerweise bei der bisherigen Datensatzanzahl plus eins.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-045-fisi-net-netzwerkdiagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Eigene Lernaufgaben, keine kopierten IHK-Fragen.
Recherche am 2026-10-29, konkrete ID-/Quellenzuordnung im Ergebnis ergänzen.

- [RFC 4632 CIDR](https://www.rfc-editor.org/rfc/rfc4632)
- [RFC 2131 DHCP](https://www.rfc-editor.org/rfc/rfc2131)
- [Cisco VLAN Routing](https://www.cisco.com/c/en/us/support/docs/lan-switching/inter-vlan-routing/14976-50.html)

## Umsetzung und Abnahme

- [x] Genau 24 neue SC-Fragen FISI-NET-263 bis -286, bestehendes CSV-Schema erhalten.
- [x] Alte 76 Datensätze unverändert, IDs/Texte eindeutig, vier unterschiedliche Optionen.
- [x] Rechnungen und Fallannahmen prüfen, Systeme/Sonderfälle klar eingrenzen.
- [x] Eindeutig richtige Lösung/Erklärung, echte Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-NET-263 bis -286 ergänzt, Modul jetzt 100 Fragen.
Der unabhängige Vollreview und die Nachprüfung aller korrigierten Aufgaben
haben bestanden. Kapazitätsfall 263 statt Definitionsduplikat, nahe Distraktoren
und Antwortmuster in 271/281/282/283/284 nachgeschärft. Alte 76 Zeilen unverändert.

Primärquellen: RFC 4632 (263–268), Cisco VLAN/Inter-VLAN/STP (269–274),
RFC 2131 und Microsoft DHCP Scopes (275–277), RFC 1035 (278–280), RFC 4291
und 4861 (281–282), RFC 1191 (283), RFC 3022 (284), RFC 4033 (285),
RFC 3414 und Cisco SNMP Security (286). Recherche am 2026-10-29.
Die konkreten RFCs sind unter https://www.rfc-editor.org/rfc/rfcNNNN abrufbar.
Subnetze zusätzlich mit Python ipaddress und Kapazitätsrechnung geprüft.
Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
