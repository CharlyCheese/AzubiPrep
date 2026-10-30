# Brief CONTENT-162: IT-SEC-GRUND – OpenSSL-Prüfwerkzeuge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-IT-SEC-GRUND-025 bis -048 ergänzen, Modul 200 → 224.
OpenSSL 3.5: Zertifikate, Prüfpfade, TLS-Diagnose, Anträge, Schlüssel,
PKCS#12 und Signaturen beziehungsweise sichere Schlüsselerzeugung.

## Betroffene Dateien

- `content/questions/IT-SEC-GRUND.csv`
- `docs/agent-briefs/CONTENT-162-it-sec-openssl-pruefwerkzeuge.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

200 Altstämme lesen, globale 26 CSV semantisch abgleichen. Eigene aktuelle
Primärrecherche https://docs.openssl.org/3.5/man1/. Neue konkrete CLI-Semantik
von vorhandenen allgemeinen TLS-/PKI-Fragen abgrenzen. Globale ALLE-IT-SEC-GRUND-
IDs vor Schreiben nochmals überprüfen. Keine echten TLS-Verbindungen,
Zertifikats-/Schlüsseländerungen, Installationen, DB/.env, Builds, Commits
oder Pushes. Keine privaten Dateien oder Zugangsdaten lesen.
Altpräfix 71124 Byte SHA256:
b133e1e07b4e96732f940319a11a843fcea400b88e7d0674accc2c5684ccc3ec.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder einschließlich LF4, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5361. Frischer Reviewer content162_review
prüfte alle 24 Fragen, 96 Optionen, Erklärungen, 200 Altstämme und globale
Nachbarn ohne Findings. Autor und Reviewer recherchierten unabhängig die
offiziellen OpenSSL-3.5-Handbücher, Quellen direkt je Frage in der CSV.
Konkrete CLI-Lernziele von CSR-, TLS- und allgemeinen Signaturgrundlagen
abgegrenzt. Keine bindenden Antwort-Tells. Altpräfix, App-Parser,
Content-Validator, Diff- und Archivierungscheck bestanden. Keine echten
OpenSSL-Verbindungen, Schlüssel- oder Zertifikatsänderungen ausgeführt.
