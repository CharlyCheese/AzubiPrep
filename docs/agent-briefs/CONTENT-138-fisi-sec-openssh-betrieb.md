# Brief CONTENT-138: FISI-SEC – OpenSSH-Betriebsdetails

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SEC-329 bis -352 ergänzen, Modul152 →176.
OpenSSH-Clientverhalten, Tunnelrichtungen, Serverauthentisierung und
konkrete Zugriffsbeschränkungen. LehrplanfeldLF11b.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-138-fisi-sec-openssh-betrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle152 Altstämme gelesen; insbesondere SSH290–293 und generische
Schlüsselanmeldung anderer Module nicht wiederholen. Globale semantische
Lernzielsuche über26CSV. Primärquellen offizielle OpenBSD/OpenSSH-Manpages
ssh, ssh_config, sshd, sshd_config und ssh-keygen.
Keine SSH-Verbindungen, Schlüsselgenerierung oder Hostdateiänderung,
keine DB-/Build-/Serveraktionen oder Installationen.
Altpräfix82520 Byte SHA256:
386293efda6cb2b251540e0988d9ddf7be087b1289925ce336adb76a83a4b705.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder inklusiveLF11b, globale IDs eindeutig, Altbytes erhalten.
- [x] Dokumentierte Semantik und Lösungen mit nötigen Prämissen eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul152 →176, Katalog4761 →4785. Alle152 Altstämme
und globale semantische Kandidaten abgeglichen. Altpräfix82520 Byte erhalten.
Reviewer content138_review recherchierte unabhängig alle fünf offiziellen
OpenBSD-Manpages und bestätigte alle24 tatsächlichen Endfassungen.
Behoben: ausschließlich falsche jede/jedem-Phrasen336/342/345 sowie
weitere Füllwörter und Schreibfehler342d. Bei deren Überarbeitung war336c
zwischenzeitlich ebenfalls wahr geworden; durch explizit falsche Behauptung
zur Ausnahme lokaler -L-Tunnel ersetzt und nochmals unabhängig freigegeben.
Keine offenen Findings. App-Parser176/15Felder/LF11b, globale IDs,
Content-Validator4785/26CSV, Diffcheck grün. Keine SSH-Betriebsaktion.
