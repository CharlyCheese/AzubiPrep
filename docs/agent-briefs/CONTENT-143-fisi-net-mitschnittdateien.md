# Brief CONTENT-143: FISI-NET – Mitschnittdateien auswerten und bearbeiten

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-NET-359 bis -382 ergänzen, Modul172 →196.
Wireshark-Werkzeuge für vorhandene Mitschnitte: Mergecap, Editcap,
Capinfos, pcapng und zusätzliche TShark-Ausgabe-/Dekodieroptionen.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-143-fisi-net-mitschnittdateien.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle172 Altstämme lesen und globale26CSV semantisch prüfen. Bestehende
tcpdump-, Displayfilter-, TShark-Feldwahl- und Conversations-Fragen nicht
wiederholen. Globaler ID-Höchstwert FISI-NET-358, nicht Modulzeilenzahl.
Eigene frische Recherche offizielle Wireshark-Manpages und User's Guide.
Keine Live-Erfassung, Schnittstelle, echte Mitschnittdatei mit Nutzerdaten
oder Installation. Lehrfragen und gedachte Dateibeispiele ohne Ausführung.
Kein DB-Zugriff, Server, Build, Commit oder Push.
Altpräfix93526 Byte SHA256:
62c4c363fa01843b6282647369b632ec6d6ed863ebe4b2bfd70f6b16f8502d76.
15-Feld-Schema einschließlich LF11b erhalten.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Offizielle Werkzeugsemantik und Lösungen eindeutig belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul196, Gesamt4905. App-Parser196/15FelderinklLF11b,
globaleIDs eindeutig und Altpräfix-SHA256 exakt bestätigt. Content-Validator
und git diff --check grün. Frischer Reviewer content143_review las alle24
gespeicherten Endzeilen, alle172Altstämme und globale semantische Kandidaten
über26CSV einschließlich Optionen/Erklärungen. Eigene aktuelle offizielle
Recherche bestätigt alle24Lösungen. Keine Findings zu Lernzielduplikaten,
Fachlichkeit, Distraktoren oder sprachlichen Tells. Keine Werkzeugausführung
auf Mitschnitten und keine Live-Erfassung.

Primärquellen:
https://www.wireshark.org/docs/man-pages/mergecap.html
https://www.wireshark.org/docs/man-pages/editcap.html
https://www.wireshark.org/docs/man-pages/capinfos.html
https://www.wireshark.org/docs/man-pages/tshark.html
https://wiki.wireshark.org/Development/PcapNG
https://www.wireshark.org/docs/wsug_html_chunked/ChStatSummary.html
Kein DB-Zugriff, Installation, Server, Build, Commit oder Push.
