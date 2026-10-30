# Brief CONTENT-179: FISI-SEC – nftables-Regeln

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SEC-377 bis -400 ergänzen, Modul 200 → 224.
Konkrete nftables-Regelverwaltung und Auswertungssemantik.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-179-fisi-sec-nftables-regeln.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 200 Altstämme lesen, globale 26 CSV semantisch abgleichen.
Allgemeine Firewall-/Stateful-/First-Match-Definitionen nicht wiederholen.
Eigene frische Primärrecherche: Netfilter-Handbuch und nftables-Projektwiki.
Statische Regelszenarien, keine ausgeführten Firewallbefehle, Installationen,
Dienste, Builds, DB/.env, Commits oder Pushes. LF11b mit 15 Feldern erhalten.
Altpräfix 107685 Byte SHA256:
60074dc3b43ad8e2754f0d632f83956497e72402f3015457d604692d5999628c.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5769. Frischer Reviewer content179_review
prüfte alle 24 Fragen, 96 Optionen und Erklärungen, 200 Altstämme und
globale semantische Nachbarn mit eigener aktueller Netfilter-/Projektwiki-
Primärrecherche. Verb-Schablone in 381 durch verschiedene Satzformen
beseitigt. Gespeicherte 24 Endfassungen erneut vollständig gelesen und
freigegeben, keine offenen Findings oder Duplikate.
Zählerposition, jump/goto, Map/Vmap, Tupel und Intervalle unabhängig geprüft.
Quellen je Frage in der CSV. Altpräfix, App-Parser, Content-Validator,
Diffcheck und Archivcheck grün. Keine Firewallbefehle ausgeführt.
