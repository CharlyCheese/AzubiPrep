# Brief CONTENT-132: FISI-PROJ – Terraform-Detailfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-PROJ-152 bis -175 ergänzen, Modul151 →175.
Terraform-Module, HCL-Auswertung, Planprüfung und Testkonfiguration.

## Betroffene Dateien

- `content/questions/FISI-PROJ.csv`
- `docs/agent-briefs/CONTENT-132-fisi-proj-terraform-detailfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle151 Modulstämme gelesen. Globale Suche über26CSV nach Terraform/IaC.
Vorhandene Terraform-Fälle FISI-PROJ094–103 und DVK-CLD124–147
nicht wiederholen; besonders Locking, State-Sensitive, for_each-Schlüssel,
Lifecycle-Grundlagen, moved/state-rm und Grundvalidierungen beachten.
Primärquellen aktuelle offizielle HashiCorp-Terraform-Dokumentation.
Versionsabhängige Funktionen mit erforderlicher Mindestversion markieren.
Reine Text-/In-Memory-Auswertung; keine Terraform-Installation, keine
Provider-/Backend-/Cloud-Verbindung oder Infrastrukturänderung.
Altpräfix99418 Byte SHA256:
689156834344d0d2b96d54d1acb4d97ea159aaa47be55c21c351d22ba31ddbd8.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Semantik und nötige Versionsprämissen primärquellenbelegt und eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul151 →175, Katalog4617 →4641. Alle151 Altstämme
und globale Kandidaten abgeglichen. Präfix99418 Byte unverändert.
Reviewer content132_review las alle24 gespeicherten Endfassungen und
recherchierte eigenständig alle zeilenbezogenen HashiCorp-Primärquellen.
Findings behoben: Antwortlängen154/161/169/170/174/175 angeglichen,
Dreier-Satzschablone170 entfernt, Mindestversion0.15.2 bei158 ergänzt.
Endfassung nochmals vollständig geprüft, Gesamtfreigabe ohne offene Findings.
Abgrenzung zu Altfragen: coalesce172 überspringt auch leere Strings,
flatten174 erhält Listen innerhalb von Objekten. App-Parser175/14Felder,
Content-Validator4641/26CSV und Diffcheck grün. Keine Infrastruktur ausgeführt.
