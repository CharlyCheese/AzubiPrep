# Brief CONTENT-189: FISI-BET – OpenSSH-Dateibetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-BET-230 bis -253 ergänzen, Modul 229 → 253.
SFTP/SCP, Agent-/Schlüsselverwaltung und konkrete Betriebsoptionen.

## Betroffene Dateien

- `content/questions/FISI-BET.csv`
- `docs/agent-briefs/CONTENT-189-fisi-bet-openssh-dateibetrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

229 Altstämme vollständig gelesen; globale OpenSSH-Nachbarn recherchiert.
FISI-SEC290–293 und 329–352 nicht wiederholen: Tunnel, Agent-Forwarding,
Hostschlüsselprüfung, Authentifizierung und Server-Testmodi bereits vorhanden.
Frische Primärrecherche in offiziellen OpenBSD/OpenSSH-Handbuchseiten.
Die zunächst geprüfte GNU-tar-Dokumentation war nicht abrufbar; keine
Tar-Fragen geschrieben. Schwerpunkt deshalb Dateibetrieb und Verwaltung.
Keine realen Verbindungen, Dateiübertragungen oder Schlüsseloperationen,
keine Installation, Builds, Dienste, DB/.env, Commits oder Pushes.
Altpräfix 126970 Byte SHA256:
46f05b3ff40949c66879ea8b15225d2b6ce21efab11910a2c2982a1012cc9e7b.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen, fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 229 → 253, Gesamtkatalog 5985 → 6009.
Frischer unabhängiger content189_review prüfte alle 24 gespeicherten Fragen,
96 Optionen, Erklärungen, 229 Altstämme und globale 26 CSV-Nachbarn.
Eigene frische Primärrecherche auf acht offiziellen OpenBSD-Handbuchseiten.
Findings: Artikel-Ausreißer bei 245 sowie sachfremde Distraktoren in
231/235/253. Optionen technisch plausibel ersetzt; danach alle 24
tatsächlichen Endzeilen vollständig erneut gelesen und freigegeben.
Keine offenen fachlichen oder sprachlichen Findings; keine neuen
Lernzielduplikate. 244 prüft Hosteinträge entfernen statt SEC352 suchen;
250 relative Pfadauflösung statt SEC293 Standarddatei.
Altpräfix unverändert, globale IDs eindeutig, 253 Modulrecords/24 neue SC,
14 Felder. App-Parser, Content-Validator (6009 Fragen/26 CSV), Diff- und
Archivierungscheck erfolgreich. Keine echten SSH-/Schlüsseloperationen.

Primärquellen (jeweils relevante Abschnitte frisch gelesen):
- https://man.openbsd.org/sftp
- https://man.openbsd.org/scp
- https://man.openbsd.org/ssh-add
- https://man.openbsd.org/ssh-agent
- https://man.openbsd.org/ssh-keygen
- https://man.openbsd.org/ssh_config
- https://man.openbsd.org/sshd_config
- https://man.openbsd.org/sftp-server
