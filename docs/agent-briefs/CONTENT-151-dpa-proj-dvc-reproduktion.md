# Brief CONTENT-151: DPA-PROJ – Datenstände und DVC-Pipelines

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PROJ-160 bis -183 ergänzen, Modul159 →183.
DVC: Datenversionen, Cache/Workspace/Remote, deklarierte Pipelines,
Parameter und konkrete Reproduktionsentscheidungen.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-151-dpa-proj-dvc-reproduktion.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle159 Altstämme gelesen; globale26CSV semantisch abgleichen. Bereits
vorhandene allgemeine Reproduzierbarkeits-, Airflow- und dbt-Lernziele
nicht wiederholen. Eigene aktuelle Primärrecherche offizielle DVC-Docs.
Nur Lehrfragen und gedachte Fälle. Keine DVC-Ausführung, Installation,
Datenänderung durch Tools, Pipelineausführung, Remotes, DB/.env, Server,
Build, Commit oder Push. Ausführungsbeispiele bleiben Text in den CSV.
Altpräfix110483 Byte SHA256:
dc399d2a05a678221e5c3f01d9a5d76a24fa55e1cd867dfc8768e10029431068.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Werkzeugsemantik und Lösungen frisch primär belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, DPA-PROJ159 →183, global5097 eindeutige Fragen.
Validator und Diffcheck bestanden. Reviewer content151_review las alle24
Endfragen/96 Optionen/Erklärungen und159 Altstämme, prüfte globale26 CSV
und relevante Reproduzierbarkeits-, Git-, Cache-, Actions- und Lockdatei-
Nachbarn sowie16 individuelle offizielle DVC-Quellseiten frisch selbst.
Ein bindender Verbtemplate-Tell183 (alle falschen Sie wird) durch drei
unterschiedliche Formulierungen behoben. Gespeicherte Endfrage erneut
fachlich und sprachlich geprüft: Freigabe ohne offene Findings. Parser
bestätigt183 Modulfragen,24SC/14Felder,5097 globale eindeutige IDs und
unveränderten Altpräfixhash. Keine DVC-Kommandos tatsächlich ausgeführt.

Primärquellen unter https://doc.dvc.org/:
- command-reference/add, push, fetch, checkout, pull
- user-guide/pipelines/defining-pipelines und run-cache
- user-guide/project-structure/dvcyaml-files
- command-reference/repro, status, params/diff, metrics/diff
- command-reference/import, update, remote/modify, remove

Jede CSV-Zeile enthält den vollständigen individuellen Quellenlink.
