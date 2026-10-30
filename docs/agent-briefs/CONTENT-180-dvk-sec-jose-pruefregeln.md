# Brief CONTENT-180: DVK-SEC – JOSE-Prüfregeln

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-SEC-195 bis -218 ergänzen, Modul 194 → 218.
JOSE-Datenstrukturen und konkrete Prüfregeln für vernetzte Dienste.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-180-dvk-sec-jose-pruefregeln.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 194 Altstämme gelesen, globale 26 CSV semantisch abgleichen.
Vorhandene JWT-Audience-/Ablauf-/Algorithmus-/Vertraulichkeitsgrundlagen,
OAuth-, OIDC- und jti-Fragen nicht wiederholen.
Eigene frische Primärrecherche in JOSE-RFCs beim RFC Editor.
Statische Formatszenarien, keine Token oder Schlüssel echter Systeme,
keine Installationen, Dienste, Builds, DB/.env, Commits oder Pushes.
Altpräfix 140295 Byte SHA256:
281d25569b932127d0a20bcafa1c777819451c983365c02b79d3bdfff8447d2f.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5793. Frischer Reviewer content180_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 194 Altstämme und
globale semantische Nachbarn mit eigener aktueller RFC-Editor-
Primärrecherche in 7515, 7516, 7517, 7518, 7519, 7797, 7638 und 8725.
Passivschablone in 196 und Erlaubnisschablone in 212 umformuliert.
Gespeicherte 24 Endfassungen erneut vollständig gelesen und freigegeben,
keine offenen Findings oder Duplikate. ES256-Länge, kanonische Ordnung und
nbf-Beispiel unabhängig geprüft. Quellen je Frage in der CSV.
Altpräfix, App-Parser, Content-Validator, Diffcheck und Archivcheck grün.
