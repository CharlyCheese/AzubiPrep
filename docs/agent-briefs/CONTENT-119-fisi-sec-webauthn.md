# Brief CONTENT-119: FISI-SEC – WebAuthn-Prüfungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 neue SC-Fragen FISI-SEC-305 bis -328, Modul 128 → 152.
Konkrete WebAuthn-L2-Registrierung, Anmeldungsprüfung und Auswahlparameter.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-119-fisi-sec-webauthn.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md und ORCHESTRATOR.md. Alle128 Altstämme gelesen; globale Suche
über26CSV nach WebAuthn, FIDO2, Passkey, rpId, userVerification,
authenticatorData und allowCredentials findet bisher nur FISI-SEC-255
(Grundprinzip Schlüsselpaar). Dieses Lernziel nicht wiederholen.
Primärquelle: W3C Recommendation Web Authentication Level2,
https://www.w3.org/TR/webauthn-2/ , besonders §§5.4–5.8,6.1,7.1–7.2.
Keine echte Anmeldung, keine Authenticator- oder Datenbankzugriffe.
Alter Byte-Präfix 67438 Byte, SHA256:
816c64d93eb4da20454813a44fab8c5924f4c939aa810a010c82ee23549b7b30.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, globale IDs eindeutig,15 Felder/LF11b, Altbytes erhalten.
- [x] Browser- und Serverprüfungen fachlich präzise und primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul152, Katalog4329 nach Ergänzung dieses Batches.
App-Parser bestätigt152 Records,15 Felder/LF11b, globale IDs eindeutig.
67438 Altbytes mit obigem SHA256 unverändert. Validator und Diff grün,
auch nach der Korrektur317d (Gesamtkatalog inzwischen4353 mit CONTENT-120).

Frischer Reviewer content119_review las alle24 Vollfragen,128 Altstämme
und suchte globale semantische Duplikate über26CSV. Eigene aktuelle
W3C-WebAuthn-Level2-Primärrecherche §§5.1,5.4,5.5,5.8.6,6.1,7.1–7.2,9,14.6.1.
317d war widersprüchlich/unplausibel und wurde durch die klare falsche
Behauptung ersetzt, ein kleinerer Signaturzähler müsse unabhängig von der
RP-Richtlinie scheitern. Tatsächliche Endfassung nachgelesen und freigegeben.
Keine offenen Fach-, Duplikat- oder Antwort-Tell-Findings.
Dokumentarischer Review; keine Authenticator- oder Datenbankzugriffe.
