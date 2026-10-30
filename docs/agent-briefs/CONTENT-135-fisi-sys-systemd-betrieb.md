# Brief CONTENT-135: FISI-SYS – systemd-Betriebsdetails

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SYS-173 bis -196 ergänzen, Modul172 →196.
systemd-Befehlsabgrenzung, Journalfilter, Diagnose sowie neue
Service-, Timer-, Pfad- und Abhängigkeitsdetails.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-135-fisi-sys-systemd-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle172 Altstämme gelesen; insbesondere systemd149–172 nicht wiederholen.
Globale semantische Lernzielsuche über26CSV. Primärquellen offizielle
systemd-Manpages, konkrete Optionen und Versionsvoraussetzungen prüfen.
Nur Text-/In-Memory-Fälle; keine echten systemctl-/Journal-/Serviceaktionen,
keine Installationen, kein Build oder DB-Zugriff.
Altpräfix109662 Byte SHA256:
b839cab661db2ade6dc9c401c2b1284b343969624799a407cbf00a066f6a0303.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Dokumentierte Befehlssemantik und Lösungen mit nötigen Prämissen eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul172 →196, Katalog4689 →4713. Alle172 Altstämme
und globale Kandidaten einschließlich FISI-BET071–074/103–109/133 geprüft.
Altpräfix109662 Byte unverändert. Keine echten Service-/Journalaktionen.
Reviewer content135_review recherchierte selbst alle acht zeilenbezogenen
freedesktop-Manpages: systemctl, journalctl, systemd-analyze, systemd.service,
systemd.kill, systemd.unit, systemd.path und systemd.timer.
Ein Finding bei186 (abweichende Antworteröffnung) durch Eine-Folge-Form
behoben. Alle24 tatsächlichen Endfassungen erneut vollständig gelesen,
Gesamtabnahme ohne offene Findings. App-Parser196/14Felder, globale IDs,
Content-Validator4713/26CSV und Diffcheck grün.
