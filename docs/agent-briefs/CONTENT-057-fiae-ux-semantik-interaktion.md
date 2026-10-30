# Brief CONTENT-057: FIAE-UX – Semantik, Interaktion und zugängliche Datendarstellung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FIAE-UX von 76 auf 100 Fragen erweitern.
24 neue SC-Fragen FIAE-UX-077 bis -100.
Bisherige Datensätze, IDs und Modul-/Lernfeldzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-057-fiae-ux-semantik-interaktion.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Versionen und Laufzeitannahmen ausdrücklich nennen. Primärquellen
tatsächlich recherchieren und im Ergebnis zuordnen.

- https://www.w3.org/WAI/ARIA/apg/patterns/
- https://www.w3.org/WAI/WCAG22/Understanding/
- https://www.w3.org/WAI/tutorials/tables/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Code/Rechnungen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; plausible fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-UX-077 bis -100 ergänzt, Modul jetzt 100 Fragen.
Unabhängiger Vollreview und Nachprüfungen bestanden. 078 auf Popup-Art
aria-haspopup statt wiederholtem Öffnungszustand umgestellt. Fachferne
Distraktoren, Längencluster und Eröffnungsmuster korrigiert; Erklärungen
zu Kürzeln, Zeitgrenzen und Namenszuordnung präzisiert. Alte 76 Zeilen unverändert.

Tatsächlich recherchierte Primärquellen (2026-10-29):
- 077–081/091/092: [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/), Tabs, Menu Button, Combobox, Listbox, Sortable Table, Button und Link.
- 082–084: [WAI Tables](https://www.w3.org/WAI/tutorials/tables/), Two Headers, Multi-level und Caption.
- 085/086: WAI Complex Images und WHATWG HTML Canvas.
- 087–090: WCAG 1.4.13 und WAI-ARIA 1.2 aria-hidden/aria-disabled. AccName-1.2-Sonderfall nur ergänzend als Working Draft, keine stabile Recommendation behauptet.
- 093: WCAG 2.1.1 Keyboard, ausdrücklich eigenständig gegenüber Zeigeralternative nach 2.5.7 in Altfrage073.
- 094–099: [WCAG 2.2 Understanding](https://www.w3.org/WAI/WCAG22/Understanding/), 2.2.1, 2.2.2, 2.1.4, 2.5.3, 3.2.2 und 3.2.6.
- 100: WAI Selecting Evaluation Tools, Grenzen automatischer Prüfung.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine App-Änderungen, Datenbankimporte, Builds, Commits oder Pushes.
