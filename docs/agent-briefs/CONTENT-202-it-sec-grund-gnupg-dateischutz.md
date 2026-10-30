# Brief CONTENT-202: IT-SEC-GRUND – GnuPG-Dateischutz

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-IT-SEC-GRUND-049 bis -072 ergänzen, Modul 224 → 248.
Konkrete GnuPG-Verträge für Signaturen, Schlüsselpflege und sichere Verarbeitung.

## Betroffene Dateien

- `content/questions/IT-SEC-GRUND.csv`
- `docs/agent-briefs/CONTENT-202-it-sec-grund-gnupg-dateischutz.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 224 Altstämme gelesen, globale GnuPG-Suche ohne Werkzeugfragen;
PGP-Grunddefinition FISI-SEC-102 von konkreten Bedienverträgen abgrenzen.
Frische offizielle GnuPG-Primärrecherche: Operational-GPG-Commands,
OpenPGP-Key-Management, GPG-Input-and-Output, GPG-Configuration-Options,
GPG-Key-related-Options, GPG-Esoteric-Options, gpgv, GPG-Configuration.
15 Felder, LF4. Altpräfix 84263 Byte SHA256:
2ff9634c75b5208d62b4272f66a6d9f0bb153459197c5b679dbdca8fa3a41ca9.
Keine tatsächlichen Kryptografieaufrufe, Schlüsselerzeugung oder Dateioperationen
mit GnuPG; keine Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes und LF4 erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

248 Modulfragen, global 6321. Frischer Reviewer `content202_review` hat alle
24 Stämme, 96 Optionen und Erklärungen, alle 224 Altstämme und globale Nachbarn
vollständig geprüft. Eigene frische Primärrecherche aller acht CSV-Quellen;
keine Findings. OpenSSL-Bedienverträge und PGP-Begriffsdefinition sind als
Nachbarn abgegrenzt. Keine systematischen Längen-, Füllwort- oder Schablonen-
Tells. App-Parser, 15 Felder, LF4, eindeutige globale IDs und unveränderter
Altpräfix bestätigt. Vollständiger CSV-SHA256:
202b623474dd401770c3f7a66f6326a2e68a429fd91772da9fecc0b4573f4bfe.
Content-Validator, Diff- und Archivcheck erfolgreich.

Quellenbasis: https://www.gnupg.org/documentation/manuals/gnupg/ mit
Operational-GPG-Commands.html, OpenPGP-Key-Management.html,
GPG-Input-and-Output.html, GPG-Configuration-Options.html,
GPG-Key-related-Options.html, GPG-Esoteric-Options.html, gpgv.html
und GPG-Configuration.html (auch einzeln in CSV belegt).
