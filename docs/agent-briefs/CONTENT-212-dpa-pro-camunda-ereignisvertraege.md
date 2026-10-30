# Brief CONTENT-212: DPA-PRO – Camunda-Ereignisverträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PRO-244 bis -267 ergänzen; Modul 243 → 267.
Konkrete Ausführungsverträge der Camunda-8.10-Prozessautomatisierung anwenden.

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-212-dpa-pro-camunda-ereignisvertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 243 Altstämme vollständig gelesen; globale Suchen nach passenden Ereignisverträgen.
Bestehende Korrelation, TTL/Deduplikation, Multi-Instance, Mappings und einfache
Randereignisse nicht wiederholen. Acht frisch gelesene Camunda-Herausgeberseiten
zu Message-, Timer-, Error-, Escalation-, Signal-, Conditional-Events,
Script-Tasks und User-Tasks. Der Versionsstand der Seiten ist 8.10.
Receive-Task-/Event-Gateway-Seiten zusätzlich gelesen, aber nicht für neue
Lernziele ausgewählt. 14 Felder. Altpräfix 128097 Byte SHA256:
922990725a59e32291f5a1eacd0d3fea8e9f4202f6bbd0b4446cac867c7be36d.
Keine Engine-Ausführung, Builds, Installationen, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Zeilen, globale ID-Eindeutigkeit und Altbytes erhalten.
- [x] Version und Geltungsbereich präzise; eindeutige Lösungen und plausible Distraktoren.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener aktueller Quellenrecherche bestanden.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

DPA-PRO 243 → 267; global nach diesem Batch 6561 Fragen. Reviewer
content212_review hat alle 24 Stämme, 96 Optionen und 24 Erklärungen vollständig
geprüft und abschließend erneut gelesen, alle 243 Altstämme sowie globale
Nachbarn abgeglichen und die acht Primärseiten frisch für Version 8.10 recherchiert.
Freigabe ohne Findings. Message-/Timer-Deployment und Message-Throw-/Script-Worker
wurden ausdrücklich als eigenständige Elementverträge abgegrenzt; 245 wiederholt
keine der Korrelationsfragen 178–183. Keine Antwort-Tells oder Lernzielduplikate.
App-Parser bestätigt 267 Modulfragen, 14 Felder, eindeutige globale IDs und
unveränderten Altpräfix. Content-Validator, Diff- und Archivcheck grün.
Keine Engine-Ausführung oder Projektlaufzeitänderung.
