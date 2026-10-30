# Brief CONTENT-043: FISI-BET – Linux-/Windows-Betriebsdiagnose und Rechteverwaltung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FISI-BET von 61 auf 85 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen die Definitionen durch konkrete Entscheidungen.
Bestehende Modul-/Lernfeldzuordnung erhalten.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-043-fisi-bet-betriebsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md; Recherche am 2026-10-29, eigene Lernaufgaben,
keine kopierten Prüfungsfragen. Konkrete ID-Zuordnung im Ergebnis ergänzen.

- [systemd systemctl](https://www.freedesktop.org/software/systemd/man/latest/systemctl.html)
- [systemd journalctl](https://www.freedesktop.org/software/systemd/man/latest/journalctl.html)
- [GNU Coreutils](https://www.gnu.org/software/coreutils/manual/coreutils.html)
- [Microsoft Windows Server](https://learn.microsoft.com/en-us/windows-server/)

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen FISI-BET-062 bis -085, 14 Spalten.
- [x] Alle alten 61 Zeilen unverändert, eindeutige IDs/Texte und vier verschiedene Optionen.
- [x] Rechen-/Ergebnisbeispiele prüfen, Systemannahmen ausdrücklich nennen.
- [x] Fachlich richtig und eindeutig, zusätzliche Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen bestanden, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue SC-Fragen, FISI-BET jetzt85. Unabhängiger Vollreview am2026-10-29
mit allen96Optionen, Lösungen, Erklärungen und Schwierigkeiten: **BESTANDEN**
nach Korrektur und Nachprüfung von 066/068/072/076/080/085.

Relevanter Fachfehler im Erstentwurf 072: systemctl disable führt implizit
einen Managerreload aus und passte ebenfalls zum Fragestamm. Durch
systemctl reload dienst.service ersetzt (Dienstkonfiguration statt Unit-
Manager), damit eindeutige Lösung daemon-reload. Weitere Änderungen:
fachnahe Speicher-/Referenz-/Cache-/Gruppenalternativen und Parallelisierung
aller 080-Optionen. Kein systematischer Längen- oder verbleibender Meta-Tell.

Alte 61 Zeilen unverändert, 14 Spalten, IDs/Texte/Optionen eindeutig, echte
Anwendung statt Definitionsduplikat. Rechteannahmen/root/ACL/stickybit und
MemAvailable/Load/RSoP/SMB+NTFS einzeln geprüft. 0666 & ~0027 = 0640.
Keine in Fragen genannten Systembefehle ausgeführt, keine Systeme geändert.

Zusätzliche tatsächlich recherchierte Primärquellen und Zuordnung:
- 062–065/075: [Pfadauflösung](https://man7.org/linux/man-pages/man7/path_resolution.7.html), [unlink](https://man7.org/linux/man-pages/man2/unlink.2.html), [umask](https://man7.org/linux/man-pages/man2/umask.2.html).
- 066–070: GNU Coreutils, [FAQ](https://www.gnu.org/software/coreutils/faq/coreutils-faq.html), [link](https://man7.org/linux/man-pages/man2/link.2.html), [symlink](https://man7.org/linux/man-pages/man7/symlink.7.html).
- 071–074: systemctl/journalctl; 076–080: [Kernelproc](https://www.kernel.org/doc/html/latest/filesystems/proc.html), [loadavg](https://man7.org/linux/man-pages/man5/proc_loadavg.5.html), [ss](https://man7.org/linux/man-pages/man8/ss.8.html), [ip](https://man7.org/linux/man-pages/man7/ip.7.html), [environ](https://man7.org/linux/man-pages/man7/environ.7.html).
- 081–085: [Get-Service](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/get-service), [Get-WinEvent](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-winevent), [gpresult](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/gpresult), [Share/NTFS](https://learn.microsoft.com/en-us/iis/web-hosting/configuring-servers-in-the-windows-web-platform/configuring-share-and-ntfs-permissions), [ADGroups](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/manage/understand-security-groups).

Gesamt nach diesem Batch: 2553. Validator und Archivierungscheck grün.
Kein DB-Import, Build, Commit/Push oder persönliche Freigabe vorweggenommen.
