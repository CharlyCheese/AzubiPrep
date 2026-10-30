# Brief CONTENT-115: FISI-NET – Wireshark-Filter

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-NET-335 bis -358 ergänzen, Modul 148 → 172.
Wireshark-Anzeigefilter und Paketinterpretation, einzelne TShark-Optionen.
Historische IDs sind global verteilt; Höchstwert 334 über alle CSV geprüft.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-115-fisi-net-wireshark-filter.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 148 Modulaltstämme gelesen,
globale Lernzielsuche über 26 CSV. 323–334 behandeln bereits tcpdump,
libpcap, Anzeige-vs-Datei-Wirkung, Offloading und ss. Diese nicht
wiederholen; Wireshark-Filtersprache von libpcap klar unterscheiden.
Semantik mindestens Wireshark4; != seit3.6 als all-not-equal.
Primärquellen: https://www.wireshark.org/docs/ , User's Guide
ChWorkBuildDisplayFilterSection.html, ChAdvTCPAnalysis.html,
TShark-Manpage und Display Filter Reference. Keine Live-Mitschnitte,
Installationen oder echte Netzverbindungen durchführen.
Alter Byte-Präfix 79557 Byte, SHA256:
6b5fe85ab5d215891609023e007c5494436d445dd06b82c85e742e5f53f73eda.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, eindeutige globale IDs,15-Feld-Schema/LF11b erhalten.
- [x] Filtersemantik, Protokollfelder und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 172, Katalog 4233 zum Batchabschluss.
App-Parser: 172 Records, durchgehend 15 Felder, eindeutige globale IDs.
79557 Altbytes mit obigem SHA256 unverändert. Validator und Diff grün.

Frischer Reviewer content115_review: alle 24 gespeicherten Vollfragen,
148 Altstämme und globale semantische Suche über 26 CSV. Eigene Recherche
im Wireshark User's Guide, wireshark-filter- und TShark-Manpages,
Display Filter References und Projektwiki zu relativen Sequenznummern.
356 präzisiert: tabulatorgetrennte reine Feldwerte als Spalten pro Paket,
weil auch JSON mit -e ausgewählte Felder ausgeben kann.
Tatsächliche gespeicherte Endfassung unabhängig nachgelesen und freigegeben.
Keine verbleibenden fachlichen, Duplikat- oder Antwort-Tell-Findings.
Keine Live-Mitschnitte, Installationen oder TShark-Ausführung.
