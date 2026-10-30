# Brief CONTENT-133: DVK-PROJ – JSON-Schema-Vertragsdetails

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-PROJ-148 bis -171 ergänzen, Modul147 →171.
JSON Schema2020-12: Objekt-, Array- und Bedingungsschemata sowie
Referenzen und Annotationsgrenzen an CPS-Schnittstellen.

## Betroffene Dateien

- `content/questions/DVK-PROJ.csv`
- `docs/agent-briefs/CONTENT-133-dvk-proj-json-schema-detailfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle147 Altstämme gelesen; globale semantische Suche über26CSV.
DVK-PROJ138–147 und DPA-PROJ058 nicht wiederholen.
Primärquellen JSON Schema2020-12 Core und Validation sowie
offizielles Understanding-JSON-Schema. Keine Validatorinstallation,
keine externen Schnittstellen-/DB-/Buildaktionen.
Altpräfix98823 Byte SHA256:
5c820bf74af8637155323ada618ed6daf6b4bc608fd4df5a6b873c5c5e902659.
Das bereits installierte Python-jsonschema kann rein lokal ohne
Netzwerkzugriffe für konkrete Instanzprüfungen verwendet werden.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Draftspezifische Semantik, eindeutige Lösungen, plausible Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul147 →171, Katalog4641 →4665. Alle147 Altstämme
und globale Lernzielkandidaten geprüft. Altpräfix98823 Byte unverändert.
Autor prüfte22 konkrete Instanzsätze lokal mit dem vorhandenen
Python-Draft202012Validator, ohne Installation oder externe Auflösung.
Reviewer content133_review recherchierte eigenständig die offiziellen
Core-/Validation-/Understanding-Primärquellen, las alle24 Endfassungen
erneut und erteilte Gesamtfreigabe ohne offene Findings.
Behoben: Dreifachphrase Das Schema ist bei155, isolierende Eröffnungen
163/170. Ursprünglicher Unicode-Fall166 duplizierte FIAE-PRG111 und
FIAE-TST158; vollständig durch typgebundene Assertion ohne type ersetzt.
Neuer166 unabhängig gegen Core§7.6.1 und Validation§6.3.1 sowie global
geprüft; Python bestätigt Zahl123 gültig, Stringabc ungültig bei maxLength2.
App-Parser171/14Felder, globale IDs4665/26CSV, Content-/Diffcheck grün.
