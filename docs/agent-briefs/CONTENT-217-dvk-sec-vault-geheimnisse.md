# Brief CONTENT-217: DVK-SEC – Vault-Geheimnisverwaltung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-SEC-243 bis -266 ergänzen; Modul 242 → 266.
Konkrete Vault-Verträge zu Zugriff, Laufzeiten und sicherer Geheimnisübergabe anwenden.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-217-dvk-sec-vault-geheimnisse.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 242 Altstämme gelesen; globale Suche ohne HashiCorp-Vault-Fragen.
Ansible-Vault in FISI-PROJ-185 ist ein anderes Werkzeug.
Acht frisch gelesene HashiCorp-Herausgeberseiten: Tokens, Policies, Lease,
KV-v2-API, Transit, AppRole, Response Wrapping, Audit. KV-v2-Übersichtsseite
zusätzlich gelesen. Aktuelle Seiten zeigen v2.x; Grundverträge verwenden,
keine Enterprise-exklusiven Funktionen voraussetzen.
14 Felder. Altpräfix 163956 Byte SHA256:
6c2f25a30c1d0da28d9afefe8c277ad4cb85248e0905b82415a7cf90e6fc40d3.
Keine Vault-Instanz oder Geheimnisverwaltung am Projekt ausführen;
keine Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Zeilen, globale IDs eindeutig und Altbytes erhalten.
- [x] Präzise Voraussetzungen, eindeutige Lösungen, plausible Distraktoren.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener frischer Primärrecherche bestanden.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

DVK-SEC 242 → 266; global 6681 Fragen. Reviewer content217_review hat alle
24 Stämme, 96 Optionen und 24 Erklärungen, 242 Altstämme und globale Nachbarn
geprüft und acht aktuelle HashiCorp-Primärseiten frisch recherchiert.
Die Dreier-Ja-/Nein-Schablone in 246 durch sachliche Aussagen ersetzt.
Erneuter vollständiger Endread der gespeicherten Endfassung: fachliche
und didaktische Freigabe ohne offene Findings oder Lernzielduplikate.
App-Parser bestätigt 266 Modulfragen, durchgehend 14 Felder, 6681 eindeutige
globale IDs und unveränderten Altpräfix. Content-Validator, Diff- und
Archivcheck grün. Keine Vault- oder Geheimnisoperationen ausgeführt.
