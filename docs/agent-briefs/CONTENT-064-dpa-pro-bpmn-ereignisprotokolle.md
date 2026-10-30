# Brief CONTENT-064: DPA-PRO – BPMN-Sonderfälle, Ereignisprotokolle und Prozesskennzahlen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

DPA-PRO von 75 auf 99 Fragen erweitern.
24 neue SC-Fragen DPA-PRO-076 bis -099.
Alte Datensätze und IDs unverändert erhalten.
Zusätzlich den kompakten Übergabestand nach 15 Batches seit CONTENT-050
in CONTENT-CHECKPOINT.md dokumentieren (Nutzerwunsch).

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-064-dpa-pro-bpmn-ereignisprotokolle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Mathematische Modelle, Voraussetzungen und Protokoll-/Engineannahmen
ausdrücklich nennen. Primärquellen tatsächlich recherchieren und zuordnen.

- https://www.omg.org/spec/BPMN/2.0.2/
- https://docs.camunda.io/docs/components/modeler/bpmn/
- https://processintelligence.solutions/pm4py/

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Lösungen und Erklärungen eindeutig; Rechnungen/Annahmen unabhängig geprüft.
- [x] Keine Inhaltsduplikate; nahe plausible Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.
- [x] Übergabestand nach 15 Batches mit Gesamtzahl, Prüfstatus und nächsten Einstiegspunkten dokumentiert.

## Ergebnis

24 Fragen DPA-PRO-076 bis -099 angehängt, Modul 75 → 99.
Unabhängiger Vollreview durch content064_review mit recherchierten Primärquellen und Nachprüfung der tatsächlichen Endfassung BESTANDEN. 079 durch eine neue Aufgabe über abgeschlossene gegenüber aktiven Kompensationshandlern ersetzt, damit die Nähe zu FIAE-SWE-083 behoben. Distraktoren in 077/081/082 fachlich angenähert, Satzanfangmuster in 082/086 korrigiert. Weitere Alternativen konkretisiert.

Quellenzuordnung: 076 Camunda Exclusive Gateway; 077 Error Events; 078 Escalation; 079 Compensation/Triggering; 080 OMG BPMN 2.0.2 Cancel; 081 Camunda Terminate; 082 Call Activities; 083 OMG Data Associations; 084 Camunda Link Events; 085 User/Manual Tasks; 086 Camunda Job Workers; 087/088 PM4Py Statistics/Intervallzeiten; 089 pandas drop_duplicates mit ausdrücklichem ID-Vertrag; 090 IEEE Process Mining Manifesto/Ereignisqualität; 091 PM4Py get_variants_as_tuples; 092 PM4Py Rework Activities; 093/094 IEEE Process Mining Manifesto; 095/096 eigene vollständige Bilanz-/Chargenrechnung; 097/098 Penn State STAT414 Lesson08/Erwartungswert; 099 Open University Why do we have queues plus eigener deterministischer Fall.
Direkte Belege: https://docs.camunda.io/docs/components/modeler/bpmn/compensation-events/ ; https://docs.camunda.io/docs/components/modeler/bpmn/terminate-events/ ; https://www.omg.org/spec/BPMN/2.0.2/PDF ; https://docs.camunda.io/docs/components/concepts/job-workers/ ; https://processintelligence.solutions/pm4py/examples/statistics/ ; https://processintelligence.solutions/app/pm4py/api/api/pm4py.stats.html ; https://www.tf-pm.org/upload/1580737614108.pdf ; https://online.stat.psu.edu/stat414/Lesson08 ; https://www.open.edu/openlearn/society-politics-law/criminology/capacity-and-demand-management/content-section-11
Rechnungen unabhängig bestätigt: 5 Minuten Überlappung, 60 % häufigste Variante, 30 offene Fälle, 5 Minuten/Stück, 80 Fälle/h, erwartete 4,4 Minuten, neun zunächst wartende Fälle.

Alle 24 Lösungen eindeutig, keine verbleibenden Duplikat- oder Sprachmusterbefunde. 14-Feld-Schema, eindeutige IDs und alle 26 HEAD-Präfixe unabhängig bestätigt. Der kompakte Übergabestand dokumentiert 15 Batches seit CONTENT-050, +360 auf 3045 Fragen, nächste Brief-ID 065 und nächsten 15er-Punkt 079. Zahlen und kleinere Modulbestände wurden unabhängig nachgeprüft.
Content-Validierung, git diff --check und Archivierungscheck erfolgreich. Keine Datenbankimporte, Builds, Commits oder Pushes.
