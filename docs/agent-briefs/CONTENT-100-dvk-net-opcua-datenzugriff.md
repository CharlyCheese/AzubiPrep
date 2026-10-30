# Brief CONTENT-100: DVK-NET – OPC-UA-Datenzugriff

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-NET-124 bis -147 ergänzen, Modul123 → 147.
Adressraum, attributbezogener Zugriff, überwachte Werte und Subscriptions
anhand der aktuellen offiziellen OPC-UA-1.05-Referenz. Keine Verbindung
zu realen OPC-UA-Servern herstellen.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-100-dvk-net-opcua-datenzugriff.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;123 Modulfragen gelesen. Vorhandene
DVK-NET095–097 (Namespace-Abbildung, Bad-Status, Sign/SignAndEncrypt)
werden nicht wiederholt. Globale Lernzielsuche erforderlich.
Offizielle OPC Foundation Reference, Teile3/4/8 unter
https://reference.opcfoundation.org/specs/ . Alte Core/v105-Adressen
werden aktuell auf diese kanonischen Referenzadressen umgeleitet.
Alter Byte-Präfix SHA256:
495ca4ea2357cabb9b8ad2cfe92d47835e987952b32298aa98a507004c5e7f59.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] OPC-UA-Semantik, Voraussetzungen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul147, Katalog3873. App-Parser bestätigt147 Datensätze
mit14 Feldern und unveränderten123 Altfragen (SHA256 oben). Content-Validator
grün. Kein realer OPC-UA-Verbindungsaufbau.

Frischer Reviewer `content100_review` hat alle24 gespeicherten Zeilen geprüft,
die123 Bestandsfragen gelesen und über alle26 CSV nach Lernzielduplikaten
gesucht. Vollreview ohne Findings: fachliche Richtigkeit, eindeutige Lösungen,
plausible Distraktoren, Antwortlängen, exklusive Füllwörter sowie beide
strukturellen Tell-Muster. SourceTimestamp128 prüft ausdrücklich die
unveränderte Weitergabe derselben Wertinstanz und wiederholt nicht AUT098.

Eigenständig gelesene Primärquellen des Reviewers (OPC Foundation):
Part3 5.2.5 und5.6.2; Part4 7.11,5.11.2,5.11.4,5.12.2,5.13.1,
5.14.1,5.14.4,5.14.6,7.22.2,7.23,5.5.4.1 und7.14; Part8 7.2.
Basis: https://reference.opcfoundation.org/specs/OPC-10000-4/ .
