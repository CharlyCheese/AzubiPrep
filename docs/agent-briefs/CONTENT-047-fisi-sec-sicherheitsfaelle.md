# Brief CONTENT-047: FISI-SEC – Zugriffsschutz, Vertrauensprüfung und Sicherheitsbetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FISI-SEC von 80 auf 104 Fragen erweitern. 24 eigene SC-
Anwendungsaufgaben ergänzen vorhandene Definitionen. Bestehende IDs und
Lernfeld-/Modulzuordnung erhalten. Neue IDs beginnen bei 257, nicht
notwendigerweise bei der bisherigen Datensatzanzahl plus eins.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-047-fisi-sec-sicherheitsfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Eigene Lernaufgaben, keine kopierten IHK-Fragen.
Recherche am 2026-10-29, konkrete ID-/Quellenzuordnung im Ergebnis ergänzen.

- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [NIST Zero Trust](https://csrc.nist.gov/pubs/sp/800/207/final)
- [NIST Incident Response](https://csrc.nist.gov/pubs/sp/800/61/r3/final)

## Umsetzung und Abnahme

- [x] Genau 24 neue SC-Fragen FISI-SEC-257 bis -280, bestehendes CSV-Schema erhalten.
- [x] Alte 80 Datensätze unverändert, IDs/Texte eindeutig, vier unterschiedliche Optionen.
- [x] Rechnungen und Fallannahmen prüfen, Systeme/Sonderfälle klar eingrenzen.
- [x] Eindeutig richtige Lösung/Erklärung, echte Anwendung statt Definitionsduplikat.
- [x] Plausible nahe Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen, Findings nachgeprüft.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 neue Sicherheitsfälle FISI-SEC-257 bis -280, Modul jetzt 104 Fragen.
Unabhängiger Vollreview und zwei Nachprüfungen bestanden. Fachferne
Distraktoren ersetzt, vier Eröffnungsschablonen und ein sprachlicher
Risikohinweis korrigiert. Alte 80 Datensätze unverändert.

Primärquellen, recherchiert am 2026-10-29:
- 257/258: [RFC 9525](https://www.rfc-editor.org/rfc/rfc9525.html) und [RFC 5280](https://www.rfc-editor.org/rfc/rfc5280.html).
- 259–264: OWASP TLS, Secrets Management, MFA und Session Management.
- 265–268/278/279: OWASP Authorization und NIST SP 800-207.
- 269/270: OWASP Secrets Management.
- 271/272: [OWASP Logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).
- 273–277/280: [CISA StopRansomware Guide](https://www.cdfifund.gov/system/files/2023-11/StopRansomware_Guide_508C_v3.pdf), Originalleitfaden auf offizieller US-Treasury-Seite.
- 274 zusätzlich: OWASP Key Management und sichere Schlüsselwiederherstellung.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Systembefehle aus den Aufgaben ausgeführt, keine Datenbankimporte,
Builds, Commits oder Pushes.
