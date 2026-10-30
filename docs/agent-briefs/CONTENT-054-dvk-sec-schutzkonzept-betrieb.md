# Brief CONTENT-054: DVK-SEC – OT-Schutzkonzepte, Nachweise und Sicherheitsbetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-SEC von 74 auf 98 Fragen erweitern. 24 neue eigene
SC-Anwendungsfragen DVK-SEC-075 bis -098 ergänzen.
Bisherige Datensätze, IDs und Modulzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-054-dvk-sec-schutzkonzept-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine kopierten IHK-Fragen.
Nur Lernfälle und ausdrücklich begrenzte Modelle; keine realen Anlagen
oder Schutzfunktionen ändern. Primärquellen recherchieren und zuordnen.

- https://csrc.nist.gov/pubs/sp/800/82/r3/final
- https://csrc.nist.gov/pubs/sp/800/193/final

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, klare Annahmen und geprüfte Rechnungen.
- [x] Keine Inhaltsduplikate; plausible, fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Fragen DVK-SEC-075 bis -098 ergänzt, Modul jetzt 98 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. Fachferne Alternativen
in 089/093 ersetzt, alte 74 Datensätze unverändert. Alle Lösungen und
Erklärungen eindeutig; keine Inhaltsduplikate oder sprachlichen Tells.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 075–078/080–083/086–093/096/098: [NIST SP 800-82r3](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-82r3.pdf), passive/aktive Erfassung, OT-Vorfallreaktion, Zugänge, Segmentierung, Patchtests, Backups, Monitoring und Lebenszyklus. Revision 4 war zum Recherchezeitpunkt ein Entwurf.
- 079: [NIST SP 800-41r1](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-41r1.pdf), Stateful Inspection.
- 084: [CISA SBOM Minimum Elements](https://www.cisa.gov/sites/default/files/2025-08/2025_CISA_SBOM_Minimum_Elements.pdf).
- 085: [CISA VEX Minimum Requirements](https://www.cisa.gov/sites/default/files/2023-04/minimum-requirements-for-vex-508c.pdf).
- 094/095: [NIST SP 800-92](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-92.pdf), Zeitbezug und geschützte Integritätsreferenzen.
- 097: [NIST SP 800-193](https://nvlpubs.nist.gov/nistpubs/SpecialPublications/NIST.SP.800-193.pdf), Firmware-Signatur und Vertrauensanker.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Anlagenänderungen, Datenbankimporte, Builds, Commits oder Pushes.
