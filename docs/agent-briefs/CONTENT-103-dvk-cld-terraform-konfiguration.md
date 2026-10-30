# Brief CONTENT-103: DVK-CLD – Terraform-Konfiguration

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-CLD-124 bis -147 ergänzen, Modul123 → 147.
Terraform-CLI-Prüfungen und deklarative Sprachsemantik anhand aktueller
offizieller Dokumentation. Keine Terraform-Ausführung, Installation,
Provider-/Backendverbindung oder Änderung realer Infrastruktur.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-103-dvk-cld-terraform-konfiguration.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;123 Modulaltfragen gelesen, globale Lernzielsuche
über26 CSV. Bereits vorhandene Terraform-Fälle FISI-PROJ094–103 betreffen
Planfreigabe, sensitive/State, Locking, refresh-only, implizite Abhängigkeit,
for_each-Identität, destroy, prevent_destroy, create_before_destroy und import.
Diese Lernziele nicht wiederholen.
Offizielle Quellen vor Erstellung gelesen:
https://developer.hashicorp.com/terraform/cli/commands/ (validate,fmt,plan,state/rm),
https://developer.hashicorp.com/terraform/language/ (meta-arguments,
files/dependency-lock,modules/develop/refactoring,data-sources,values,
block/variable,expressions/references,validate).
Alter Byte-Präfix SHA256:
c9fd26d39a4078eb6a76a3a8501a2b1b1da7353cf70076fedad44902fc40da29.

## Abnahmekriterien

- [x] Genau24 neue SC-Fragen, eindeutige IDs,14-Feld-Schema und Altbytes erhalten.
- [x] Terraform-Semantik eindeutig und primärquellenbelegt; keine Ausführung behauptet.
- [x] Globale Lernzielduplikate und alle bindenden Antwort-Tells ausgeschlossen.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul147, Katalog3945 zum Batchabschluss.
App-Parser147 Datensätze mit14 Feldern und Altpräfix-SHA256 bestätigt.
Content-Validator grün. Keine Terraform-Ausführung, Installation oder Cloudzugriffe.

Frischer Reviewer `content103_review` prüfte alle24 neuen gespeicherten
Zeilen,123 Altfragen und globale Lernziele über26 CSV. Eigene aktuelle
HashiCorp-Primärrecherche zu allen im Kontext genannten Befehlen und
Sprachregeln. Finding138: sachfremde Distraktoren ersetzt durch fachnahe
Alternativen resource/locals/variable. Fehlende Leerzeichen128/129/142/147
korrigiert. Reviewer las die gespeicherte Endfassung nach und bestätigte
keine offenen Findings; sämtliche Längen-, Füllwort- und Strukturtells geprüft.
Eigenständigkeit131 gegenüber FISI-PROJ095 und133 gegenüber FISI-PROJ098
sowie Provider-Lockdatei gegenüber allgemeinen npm-Lockfile-Fragen bestätigt.
