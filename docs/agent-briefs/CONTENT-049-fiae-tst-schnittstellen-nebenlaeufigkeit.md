# Brief CONTENT-049: FIAE-TST – Schnittstellen und Nebenläufigkeit testen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

Zwölf neue SC-Anwendungsfragen FIAE-TST-065 bis -076 ergänzen.
FIAE-TST wächst von 64 auf 76 Fragen. Bestehende Fragen unverändert erhalten.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-049-fiae-tst-schnittstellen-nebenlaeufigkeit.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Quellen und Kontext

AGENTS.md und ORCHESTRATOR.md beachten. Eigene Aufgaben, keine IHK-Kopien.
Primärquellen tatsächlich recherchieren und im Ergebnis zuordnen:
NIST SP 800-142, PostgreSQL Transaktionen/Isolation, Playwright API-Tests,
Python threading Barrier, Hypothesis und ISTQB CTFL.

## Abnahmekriterien

- [x] Zwölf neue SC-Fragen, Schema und alte 64 Datensätze unverändert.
- [x] Eindeutige Lösungen, geprüfte Rechnungen und klare Systemannahmen.
- [x] Keine Inhaltsduplikate, fachnahe Distraktoren und keine sprachlichen Tells.
- [x] Unabhängiger Vollreview mit recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

Zwölf SC-Fragen FIAE-TST-065 bis -076 ergänzt, Modul jetzt 76 Fragen.
Unabhängiger Vollreview und Nachprüfungen bestanden. 066 auf höchstens eine
Bestätigung korrigiert, fachnahe Distraktoren 066/068/070/071/076 ergänzt,
Eröffnungsmuster 068 beseitigt und Quelle 075 präzisiert. Alte 64 Zeilen
unverändert. Keine neuen Inhaltsduplikate oder belastbaren Tells.

Tatsächlich recherchierte Primärquellen (2026-10-29):
- 065: [NIST SP 800-142](https://csrc.nist.gov/pubs/sp/800/142/final), paarweise und höhere Wechselwirkungen.
- 066/067: [PostgreSQL Isolation](https://www.postgresql.org/docs/current/transaction-iso.html).
- 068: [PostgreSQL Transaktionen](https://www.postgresql.org/docs/current/tutorial-transactions.html).
- 069: [JSON Schema Typen](https://json-schema.org/understanding-json-schema/reference/type).
- 070: [Playwright API Testing](https://playwright.dev/docs/api-testing).
- 071: [PostgreSQL SELECT / LIMIT](https://www.postgresql.org/docs/current/sql-select.html).
- 072: [AWS Idempotente APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/).
- 073: [Hypothesis Roundtrip](https://hypothesis.readthedocs.io/en/latest/ghostwriter.html).
- 074: eigene Rechnung, 18/200 = 9 %.
- 075: [ISTQB Automotive MC/DC](https://istqb.org/?download_id=3615&sdm_process_download=1).
- 076: [Python Barrier](https://docs.python.org/3.12/library/threading.html).

Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
Gesamtstand nach allen elf Batches: 2685 Fragen, Zuwachs 252 Fragen.
Alle bisherigen CSV-Datensätze zusätzlich gegen HEAD abgeglichen und
unverändert bestätigt. Keine Datenbankimporte, Builds, Commits oder Pushes.
