# Brief CONTENT-096: DPA-PROJ – Datenläufe orchestrieren

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DPA-PROJ-088 bis -111 ergänzen, Modul87 → 111.
Konkrete Planung und Steuerung von Datenläufen anhand von Apache Airflow
2.10.5, mit ausdrücklich versionierten API-Fällen. Keine Installation.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-096-dpa-proj-datenorchestrierung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;87 Bestandsfragen gelesen. Globale Vorprüfung
auf Airflow-/DAG-Lernziele, keine bloße Wiederholung von Idempotenz,
Retry-Backoff, allgemeinem Monitoring oder Wiederanlaufplanung.
Offizielle Apache-Airflow-Dokumentation:
https://airflow.apache.org/docs/apache-airflow/2.10.5/
Alter Byte-Präfix SHA256:
4548946972708e36d7822a36d38665d5d859d2da6f3207d89a802c575496a7a3.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Versionierte Orchestrierungssemantik und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen DPA-PROJ-088–111 zu Apache Airflow2.10.5 ergänzt:
Abhängigkeiten/Zyklus, Task Instance, logical date und Datenintervalle,
Catchup und Schedulewerte, depends_on_past, Trigger Rules/Branch-Join,
Blattbewertung, TaskGroups, XCom/Variables, Pools/Slotrechnung,
Deferral und Sensormodi, execution_timeout, FailException und Clear.

Frischer Reviewer content096_review las alle24 tatsächlichen neuen Zeilen
und87 Bestandsfragen. Eigene Primärrecherche ausschließlich in offiziellen
Airflow2.10.5-Dokumenten: core-concepts/dags.html, tasks.html, dag-run.html,
xcoms.html, variables.html, sensors.html, administration-and-deployment/
pools.html sowie authoring-and-scheduling/cron.html und deferring.html.
Quellen stehen je Frage. Globale semantische Suche über26CSV: keine neuen
Lernzielduplikate. Ein Strukturkontrast in102 wurde korrigiert: alle vier
Optionen jetzt knappe Begriffe. Tatsächliche gespeicherte Endfassung erneut
gelesen, Vollreview bestanden, keine offenen Findings. Keine exklusiven
falschen Phrasen über3+Fragen, Füllwort- oder systematischen Längensignale.

App-Parser111 Datensätze/14 Felder,24 neue SC-Fragen; alter Byte-Präfix
SHA256 unverändert wie oben. Content-Validator nach Folgeentwurf097:
3801 Fragen/26Dateien grün. Diff- und Archivierungscheck erfolgreich.
Airflow wurde weder installiert noch gestartet, keine Datenläufe ausgeführt.
