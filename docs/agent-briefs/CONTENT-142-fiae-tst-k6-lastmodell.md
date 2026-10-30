# Brief CONTENT-142: FIAE-TST – k6-Lastmodelle und Messwerte

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-TST-173 bis -196 ergänzen, Modul172 →196.
Grafana k6: Szenarien, Ausführungsmodelle, Lebenszyklus, Metriken,
Checks/Thresholds und Interpretation geplanter Iterationen.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-142-fiae-tst-k6-lastmodell.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle172 Altstämme lesen; globale26CSV Lernziele abgleichen.
Allgemeine Last-/Stresstestdefinitionen und Fehlerquotenrechnung nicht
wiederholen. Eigene aktuelle Recherche in offizieller Grafana-k6-Doku.
Keine Installation und keine echten Lasttests, HTTP-Zielaufrufe oder
Cloud-Läufe. Nur Lehrfragen und statische eigene Konfigurationsbeispiele.
Kein DB-Zugriff, Server, Build, Commit oder Push.
Altpräfix97575 Byte SHA256:
840960d11a03b7fe245a615ca0caa1380629fa43fb7e8aeb096b5d53b98c1f7a.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Werkzeugspezifische Musterlösungen eindeutig und frisch belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul196, Gesamt4881 bei Ergänzung. App-Parser196/14,
globaleIDs eindeutig und Altpräfix-SHA256 exakt bestätigt. Content-Validator
und git diff --check grün. Frischer Reviewer content142_review las alle24
Endzeilen, alle172Altstämme und globale semantische Kandidaten über26CSV.
Alle24 Lösungen mit eigener aktueller Grafana-Recherche bestätigt.
Mehrdeutige Zahlenlisten in193/195 präzisiert, tatsächliche gespeicherte
Endfassung vollständig freigegeben. Keine offenen Findings zu Duplikaten,
Fachlichkeit, Distraktoren oder sprachlichen Tells. Keine Lasttestausführung.

Primärquellen unter https://grafana.com/docs/k6/latest/:
using-k6/checks/, thresholds/, test-lifecycle/, metrics/reference/,
k6-options/reference/ (jeweils using-k6/), scenarios/executors/ mit
shared-iterations/, per-vu-iterations/, constant-vus/, constant-arrival-rate/,
scenarios/concepts/dropped-iterations/, arrival-rate-vu-allocation/ und
graceful-stop/ (jeweils using-k6/scenarios/concepts/),
javascript-api/k6-http/set-response-callback/,
javascript-api/k6-metrics/ sowie dessen rate/ und gauge/.
Kein DB-Zugriff, Server, Build, Installation, Commit oder Push.
