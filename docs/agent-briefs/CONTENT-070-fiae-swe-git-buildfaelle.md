# Brief CONTENT-070: FIAE-SWE – Git- und Build-Arbeitsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-SWE-098 bis -121 anhängen, Modul 97 → 121.
Konkrete neue Versionsverwaltungs- und Buildfälle gegenüber dem Bestand.
CSV mit 15 Feldern und LF11a erhalten. Keine echten Git-Mutationen nötig.

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-070-fiae-swe-git-buildfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Offizielle git-scm.com- und npm-Dokumentation.
Eigene konkrete Situationen statt wiederholter Bestandsdefinitionen.
Alter Byte-Präfix vor Änderung: SHA256
82ccf794f104f5eee53a71b4a2945ddff98118ad737ca93d3472c52b72dc442d.

## Abnahmekriterien

- [x] 24 SC-Fragen, global eindeutige IDs, alte Bytes und LF11a erhalten.
- [x] Eindeutige Lösungen/Erklärungen mit expliziten relevanten Git-Annahmen.
- [x] Keine globalen Inhaltsduplikate, plausible Distraktoren ohne Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-SWE-098 bis -121 angehängt, Modul 97 → 121.
Unabhängiger Vollreview durch content070_review mit tatsächlicher
Recherche offizieller Git-/npm-Primärquellen BESTANDEN.
103 nach Review um ausdrückliches --commit ergänzt, damit eine mögliche
branch.main.mergeOptions-Konfiguration mit --no-commit die Eindeutigkeit
nicht aufhebt. Aktuelle Fassung vollständig nachgeprüft, keine Restbefunde.
101 Soft-Reset-Aussage vor Review sprachlich präzisiert.

Quellenzuordnung: 098/099 git-add, 100 git-restore, 101 git-reset,
102/103 git-merge, 104 git-rebase, 105 git-stash, 106 git-worktree,
107 git-clean, 108 git-tag, 109 git-push, 110 git-remote,
111 git-blame, 112 git-log, 113/114 gitattributes, 115 git-apply,
116 git-archive, 117/118/120 npm CLI11 ci, 119 npm Scripts und run,
121 package.json/private. Direkte Quellen in den CSV-Zeilen.
Zusatzbeleg: https://docs.npmjs.com/cli/v11/commands/npm-run/

App-Parser bestätigt 121 Datensätze mit je 15 Feldern und LF11a,
globale IDs eindeutig und dokumentierter alter Byte-Präfix unverändert.
Keine globalen Inhaltsduplikate oder systematischen Sprach-/Längentells.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Git-Mutationen oder Installationen.
