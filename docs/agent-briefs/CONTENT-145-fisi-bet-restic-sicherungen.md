# Brief CONTENT-145: FISI-BET – restic-Sicherungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-BET-182 bis -205 ergänzen, Modul181 →205.
restic: Snapshot-/Repository-Semantik, Integritätsprüfung, Restore,
Aufbewahrung und Schlüsselverwaltung anhand gedachter Fälle.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-145-fisi-bet-restic-sicherungen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle181 Altstämme lesen und globale26CSV Lernziele prüfen. Restic-Suche
ohne einschlägige Altfragen. Allgemeine Backupdefinitionen, RTO/RPO,
Restore-Test und 3-2-1 nicht wiederholen.
Eigene aktuelle Primärrecherche offizielle stabile restic-Dokumentation.
Nur Lehrfragen; keine restic-Ausführung, Installation, echten Backups,
Repositories, Schlüsseldateien, Löschungen oder Wiederherstellungen.
Kein DB-Zugriff, .env, Server, Build, Commit oder Push.
Altpräfix102898 Byte SHA256:
c17112915959bcfbb0ecd13a5d3a8b38341d30f9de20815a57657470bc8146d7.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] restic-Semantik und Musterlösungen eindeutig und frisch belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul205, Gesamt4953 bei Ergänzung. App-Parser205/14,
globaleIDs eindeutig und Altpräfix-SHA256 exakt bestätigt. Content-Validator
und git diff --check grün. Frischer Reviewer content145_review las alle24
Endzeilen, alle181Altstämme und globale semantische Kandidaten über26CSV.
Eigene aktuelle restic0.19.1-stable-Recherche bestätigt alle24Lösungen.
Ein-Öffnerschablone in196c angeglichen und gekürzt; tatsächliche gespeicherte
Endfassung danach vollständig freigegeben. Keine offenen Findings zu
Fachlichkeit, Lernzielduplikaten oder Antwort-Tells. Keine restic-Ausführung.

Primärquellen unter https://restic.readthedocs.io/en/stable/:
060_forget.html, 045_working_with_repos.html, 050_restore.html,
040_backup.html, 070_encryption.html, 030_preparing_a_new_repo.html,
075_scripting.html. Kein DB-Zugriff, Installation, Server, Build, Commit, Push.
