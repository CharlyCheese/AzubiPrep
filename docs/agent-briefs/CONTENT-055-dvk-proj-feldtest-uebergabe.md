# Brief CONTENT-055: DVK-PROJ – Feldtests, Ressourcenplanung und CPS-Übergabe

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-PROJ von 75 auf 99 Fragen erweitern. 24 neue eigene
SC-Anwendungsfragen DVK-PROJ-076 bis -099 ergänzen.
Bisherige Datensätze, IDs und Modulzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-PROJ.csv`
- `docs/agent-briefs/CONTENT-055-dvk-proj-feldtest-uebergabe.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine kopierten IHK-Fragen.
Nur Lernfälle und ausdrücklich begrenzte Modelle; keine realen Anlagen
oder Schutzfunktionen ändern. Primärquellen recherchieren und zuordnen.

- https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf
- https://www.nasa.gov/reference/systems-engineering-handbook/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, klare Annahmen und geprüfte Rechnungen.
- [x] Keine Inhaltsduplikate; plausible, fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen DVK-PROJ-076 bis -099, Modul jetzt 99 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. Schnittstellen-
Distraktoren in 083/090 und Antwortschablone in 098 korrigiert.
Alte 75 Datensätze unverändert. Keine Inhaltsduplikate oder verbleibenden
Längen-, Detailgrad- und Schablonen-Tells.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 076/077/085/086: [NASA Product Verification](https://www.nasa.gov/reference/5-3-product-verification/).
- 083/090: [NASA Interface Management](https://www.nasa.gov/reference/6-3-interface-management/).
- 084/088/095: [NASA Product Validation](https://www.nasa.gov/reference/5-4-product-validation/).
- 089: Cisco Wireless Site Survey FAQ.
- 091/093: [NASA Configuration Management](https://www.nasa.gov/reference/6-5-configuration-management/).
- 092: NIST Calibration Report/Data Presentation, exemplarbezogene Seriennummer.
- 094/099: Yokogawa Alarm List und Alarm Management, aktive/quittierte Zustände und Priorisierung.
- 096: NIST SP 800-82r3, Kontenverwaltung.
- 098: [ILAC-G8 Entscheidungsregeln](https://ilac.org/?ddownload=122722), keine pauschale rechtliche Abnahmewirkung behauptet.
- 078–082/087/097: eigene vollständig bestimmte Rechenmodelle.

Unabhängig bestätigt: 40 Geräte, 3 Kabelrollen, 900 Euro, 2 Lizenzpakete,
Bestellung an Tag 12, 30 Stunden, Prioritätszahl 60 und Messbereich 193–203 ms.
Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Anlagenänderungen, Datenbankimporte, Builds, Commits oder Pushes.
