# Brief CONTENT-056: FIAE-SWE – Entwurfsmuster, verteilte Systeme und Git

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

FIAE-SWE von 73 auf 97 Fragen erweitern.
24 neue SC-Fragen FIAE-SWE-074 bis -097.
Bisherige Datensätze, IDs und Modul-/Lernfeldzuordnung unverändert erhalten.

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-056-fiae-swe-architektur-git.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Versionen und Laufzeitannahmen ausdrücklich nennen. Primärquellen
tatsächlich recherchieren und im Ergebnis zuordnen.

- https://learn.microsoft.com/en-us/azure/architecture/patterns/
- https://git-scm.com/docs
- https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/io/FilterInputStream.html

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, CSV-Schema und alter Bestand unverändert.
- [x] Eindeutige Lösungen und Erklärungen, Code/Rechnungen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; plausible fachnahe Distraktoren.
- [x] Keine systematischen Längen-, Detailgrad- oder Schablonen-Tells.
- [x] Unabhängiger Vollreview aller neuen Fragen mit Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FIAE-SWE-074 bis -097 ergänzt, Modul jetzt 97 Fragen.
Unabhängiger Vollreview und Nachprüfung bestanden. Acht Distraktorgruppen
fachlich nachgeschärft, Versionsangaben und Schemaübergang für Leser und
Schreiber präzisiert. Alle neuen Zeilen SC/LF11a, alte 73 unverändert.
Keine Inhaltsduplikate oder verbleibenden Antwortmuster gefunden.

Tatsächlich recherchierte Primärquellen (2026-10-29):
- 074/078: Oracle Java SE 21 FilterInputStream und HttpRequest.Builder.
- 075–077/079–083/085–087: Microsoft Azure Architecture Patterns, Materialized View, Gateway Aggregation, Strangler Fig, CQRS, Sidecar, Transactional Outbox, Saga, Circuit Breaker, Bulkhead und Cache-Aside.
- 084: AWS Builders Library Timeouts/Retries/Backoff; 3×3×3=27 unabhängig bestätigt.
- 088: [Jakarta Persistence 3.2](https://jakarta.ee/specifications/persistence/3.2/jakarta-persistence-spec-3.2.html).
- 089: Oracle Java Deadlock und OSTEP Common Concurrency Problems.
- 090–094: [Git-Dokumentation](https://git-scm.com/docs) zu bisect, stash, cherry-pick, diff und reflog.
- 095: [npm CLI 11 package-lock.json](https://docs.npmjs.com/cli/v11/configuring-npm/package-lock-json/).
- 096: Docker Image Digests.
- 097: Microsoft Schema Migrations Safely und GitLab Multi-Version Compatibility.

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Keine Git-Aufgabenbefehle, Datenbankimporte, Builds, Commits oder Pushes.
