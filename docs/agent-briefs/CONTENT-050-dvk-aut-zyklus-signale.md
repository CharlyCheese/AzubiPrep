# Brief CONTENT-050: DVK-AUT – SPS-Zyklen, Signale und Produktionskennzahlen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DVK-AUT von 75 auf 99 Fragen erweitern. 24 neue SC-Anwendungsfragen
DVK-AUT-076 bis -099 ergänzen bestehende Grundlagen. Alle bisherigen
Datensätze und ihre IDs unverändert erhalten.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-050-dvk-aut-zyklus-signale.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Lernaufgaben, keine übernommenen
IHK-Fragen. Technische Annahmen ausdrücklich angeben; keine Anleitungen
zur Veränderung realer Maschinen oder Schutzfunktionen.
Primärquellen tatsächlich recherchieren und im Ergebnis zuordnen.

- https://content.helpme-codesys.com/en/libs/Standard/Current/Trigger/R_TRIG.html
- https://content.helpme-codesys.com/en/libs/Standard/Current/Timer/TON.html

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alte 75 Datensätze unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate, plausible nahe Distraktoren und klare Annahmen.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Anwendungsfragen DVK-AUT-076 bis -099 ergänzt, Modul jetzt 99 Fragen.
Unabhängiger Vollreview und Nachprüfungen bestanden. Neue IDs dreistellig
normalisiert, Persistenz- und Zeitstempel-Distraktoren verbessert und ein
Eröffnungsmuster in 094 korrigiert. Alle alten 75 Datensätze unverändert.

Primärquellen, tatsächlich recherchiert am 2026-10-29:
- 076/077/086: Siemens Prozessabbild und Cycle and response times.
- 078–081: [CODESYS R_TRIG und Timer](https://content.helpme-codesys.com/en/libs/Standard/Current/Trigger/R_TRIG.html), TON/TOF/TP derselben Standardbibliothek.
- 082: [CODESYS Hysterese](https://content.helpme-codesys.com/de/libs/Util/3.5.17.0/Analog-Monitors/HYSTERESIS.html).
- 083–089: ausdrücklich eingegrenzte eigene Rechenaufgaben; 50 bar, 900 U/min, 25 %, 5 ms, 110 ms, 6 U/min und 90° unabhängig bestätigt.
- 090–092: [OEE.com Berechnung](https://www.oee.com/calculating-oee/), Ergebnisse 83,79 %, 90 % und 80 %.
- 093/094: CODESYS Function Block Instances und Preserving Data with Retain Variables.
- 095/099: KMK-Rahmenlehrplan DVK und explizite Ablauf-/Soll-Ist-Annahmen.
- 096–098: [OPC UA Write](https://reference.opcfoundation.org/specs/OPC-10000-4/5.11.4), [Subscription Model](https://reference.opcfoundation.org/specs/OPC-10000-4/5.14.1) und [DataValue](https://reference.opcfoundation.org/specs/OPC-10000-4/7.11).

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine realen Anlagenänderungen, Datenbankimporte, Builds, Commits oder Pushes.
