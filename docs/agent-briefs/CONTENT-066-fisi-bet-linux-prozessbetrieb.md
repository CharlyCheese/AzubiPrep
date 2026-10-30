# Brief CONTENT-066: FISI-BET – Linux-Prozessbetrieb und Shell

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 eigenständige SC-Fragen FISI-BET-086 bis -109 anhängen, Modul 85 → 109.
Konkrete Linux-Betriebsfälle, Rechte, Prozesse und Shell-Verhalten.
Bestehende Datensätze unverändert bewahren.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-066-fisi-bet-linux-prozessbetrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Linux man-pages, GNU Bash/Coreutils und
offizielle systemd-Dokumentation. Eigene Fälle, konkrete Quellenzuordnung
beim Abschluss. Alle Bestandsfragen auf doppelte Lernziele abgleichen.

## Abnahmekriterien

- [x] 24 neue SC-Fragen, bisheriges Schema und Bestand erhalten, IDs eindeutig.
- [x] Eindeutige Lösungen und explizite relevante Systemannahmen.
- [x] Plausible nahe Distraktoren, keine Inhaltsduplikate oder Sprachmuster-Tells.
- [x] Unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-BET-086 bis -109 angehängt, Modul 85 → 109.
Unabhängiger Vollreview durch content066_review einschließlich tatsächlicher
Primärquellenrecherche und erneuter Endfassungsprüfung BESTANDEN.
090 sprachliches Muster durch gleichen Artikel aller Optionen behoben.
093 Standardwert von IFS ausdrücklich ergänzt, da abweichendes IFS die
Eindeutigkeit des Quoting-Falls beeinflussen könnte. Zusätzlich CSV-Quoting
von option_d in 093 für den tatsächlichen App-Parser korrigiert:
readCsvFile und parseRowsRaw erhalten nun die doppelten Anführungszeichen
in programm "$pfad". Unabhängige gezielte Nachprüfung bestanden,
14 Felder und vier verschiedene Optionen bestätigt. Keine Restbefunde.

Quellenzuordnung (direkte URLs in jeder neuen CSV-Zeile):
086/087 signal(7), 088 wait(2), 089 credentials(7), 090 getrlimit(2),
091–094 GNU Bash-Manpage, 095/096/101 inode(7), 097 mount(2),
098/099 rename(2), 100 proc_pid_fd(5). 102/104 systemd.unit,
103/108 systemd.service, 105/106 systemd.timer, 107 systemctl,
109 systemd.exec. GNU-HTML-Seiten nicht abrufbar; tatsächlicher
GNU-Manpage-Text über man7.org recherchiert.

Alle 24 Zeilen mit 14 Feldern und gültigen, global eindeutigen IDs.
HEAD-Präfix erhalten. Bereits vorliegende uncommittete Zeilen 062–085
besitzen keinen unabhängigen Vorher-Snapshot für einen rückwirkenden
Vollvergleich; ausschließlich neue Zeilen per Append-Patch ergänzt.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
