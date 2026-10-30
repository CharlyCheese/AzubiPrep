# Brief CONTENT-177: FISI-NET – Netzverwaltung mit iproute2

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-NET-383 bis -406 ergänzen, Modul 196 → 220.
Konkrete Linux-Netzwerkobjekte, Routingregeln und Namensräume.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-177-fisi-net-iproute2-netzverwaltung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 196 Altstämme gelesen, globale 26 CSV semantisch abgleichen.
Globale ID-Maxima berücksichtigen; LF11b-Schema mit 15 Feldern erhalten.
Vorhandene IPv6-Lifetimes und allgemeine Routing-/VLAN-Grundlagen nicht
umbenennen. Eigene frische Primärrecherche in iproute2-Handbuchseiten.
Statische Szenarien, keine Netzwerkkonfiguration oder Dienstaufrufe,
Installationen, Builds, DB/.env, privaten Daten, Commits oder Pushes.
Altpräfix 103818 Byte SHA256:
8a8a8dc7f1b90ea6cc3937442b2ecc2a6c88a3d48eefc6a5621e3f34e1219abf.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5721. Frischer Reviewer content177_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 196 Altstämme sowie
globale semantische Nachbarn mit eigener aktueller Primärrecherche in
ip-address, ip-link, veth, ip-route, ip-rule, ip-neighbour, ip-netns,
bridge und ip auf man7.org. Falsch-exklusive Absolutwortmuster in
Distraktoren neutral umformuliert. Gespeicherte 24 Endfassungen erneut
vollständig gelesen und freigegeben, keine offenen Findings oder Duplikate.
Quellen je Frage in der CSV. Altpräfix, App-Parser, Content-Validator,
Diffcheck und Archivcheck grün. Keine Netzwerkänderungen ausgeführt.
