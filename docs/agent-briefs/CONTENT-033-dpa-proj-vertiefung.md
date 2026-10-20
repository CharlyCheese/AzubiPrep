# Brief CONTENT-033: DPA-PROJ vertiefen (Abschluss erste DPA-Vertiefungsrunde)

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

An CONTENT-032 anknüpfen: DPA-PROJ von tatsächlich 27 auf 51 Fragen
erweitern (der Vorgängerbrief nennt irrtümlich 26). 24 zusätzliche
Anwendungsfragen zur kundenspezifischen Prozess- und Datenanalyse in LF12c.
Gesamtbestand vor Beginn: 2289 Fragen, sauberes Git-Arbeitsverzeichnis.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-033-dpa-proj-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext

- `AGENTS.md`, Regel 3: unabhängiger Fachreview mit frischem Kontext.
- `ORCHESTRATOR.md`, Content-Review und Archivierung.
- `docs/agent-briefs/CONTENT-032-dpa-pro-vertiefung.md`, nächster Schritt.
- Bestehende DPA-PROJ-001 bis -027 bleiben unverändert. Neue Fragen
  vertiefen konkrete Entscheidungen, statt vorhandene Begriffsdefinitionen
  zu wiederholen. Modulzuordnung und CSV-Schema bleiben erhalten.

## Quellen und Themen

Quellenabruf: 2026-10-20. Der Rahmenlehrplan begründet die Lernfeld-Zuordnung,
technische Details werden zusätzlich anhand der jeweiligen Primärdokumentation
geprüft. Quellen je Fragen-ID werden im Abschluss ergänzt.

- [KMK-Rahmenlehrplan Fachinformatiker, LF12c](https://www.kmk.org/service/servicebereich-berufliche-schulen/downloadbereich-rahmenlehrplaene?tx_fedownloads_single%5Baction%5D=forceDownload&tx_fedownloads_single%5Bcontroller%5D=Downloads&tx_fedownloads_single%5Bdownload%5D=45009&type=150)
- [Apache Airflow: Best Practices](https://airflow.apache.org/docs/apache-airflow/stable/best-practices.html)
- [pandas: Merge, join, concatenate and compare](https://pandas.pydata.org/docs/user_guide/merging.html)
- [PMI: Requirement traceability](https://www.pmi.org/learning/library/requirement-traceability-tool-quality-results-8873)
- [PMI: Effective requirements management](https://www.pmi.org/learning/library/effective-requirements-management-project-success-8181)
- [dbt: Data tests](https://docs.getdbt.com/reference/resource-properties/data-tests)
- [PostgreSQL: Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [Prometheus: Instrumentation](https://prometheus.io/docs/practices/instrumentation/)
- [Kimball: Declaring the Grain](https://www.kimballgroup.com/2003/03/declaring-the-grain/) (zusätzlicher Beleg des Reviewers für 035)
- [pandas: Missing data](https://pandas.pydata.org/docs/user_guide/missing_data.html) (Reviewer: 039)
- [Microsoft: Performance testing](https://learn.microsoft.com/en-us/azure/well-architected/performance-efficiency/performance-test) (Reviewer: 028/048)
- [CDC: Designing and Conducting Analytic Studies](https://www.cdc.gov/field-epi-manual/php/chapters/design-conduct-analyze-field-studies.html) (Reviewer: 051, Störfaktoren)

Zuordnung der fachlichen Belege:

| Neue IDs | Schwerpunkt / Beleg |
|---|---|
| 028, 035, 039, 046–048, 050–051 | LF12c: operationalisierte Anforderungen, Datenaufbereitung, Qualitätsprüfung, Übergabe und Bewertung; selbst formulierte Anwendungsszenarien |
| 029 | PMI: Nachverfolgung von Anforderung, Umsetzung und Test |
| 030 | Eigene Nutzwert-Rechenaufgabe: A = 3,2, B = 3,4 |
| 031 | PMI: abgestimmte Bewertung und Freigabe von Änderungen |
| 032–034 | Eigene Rechenaufgaben: 700 Euro Verbesserung, 15 Monate Amortisation, 10.800 Euro kalkulatorischer Jahresnettonutzen |
| 036 | pandas: Join-Kardinalität und Eindeutigkeit der Schlüssel |
| 037–038 | dbt: relationships, not_null und accepted_values als getrennte Prüfungen |
| 040–043, 045 | Airflow: feste Eingaben, Wiederholbarkeit, UPSERT, keine Teilresultate, zeitlich begrenzte Verarbeitung; 040 ergänzt allgemeine Reproduzierbarkeitsbedingungen |
| 044 | PostgreSQL: Zeitpunkte, Zeitzonen und gemeinsame Zeitbasis |
| 049 | Prometheus: Zeitpunkt des letzten erfolgreichen Batch-Laufs |

Die Rechenaufgaben und Projektfälle sind eigene Lernaufgaben, keine
übernommenen IHK-Prüfungsfragen. Im Modul werden die Szenarien als SC mit
vier Optionen fortgeführt, zusätzlich zu den zwei vorhandenen MC-Fragen.

## Umsetzungsschritte

- [x] Vorgängerbrief, Ist-Bestand und Quellen prüfen.
- [x] 24 neue Fragen mit IDs DPA-PROJ-028 bis -051 ergänzen.
- [x] Format, Eindeutigkeit, Duplikate und Antwortstil selbst prüfen.
- [x] Frischen Subagenten mit Quellenprüfung und vollständigem Batch-Review beauftragen.
- [x] Findings korrigieren und erforderlichenfalls erneut prüfen lassen.
- [x] Content-Validierung und Archivierungscheck ausführen.

## Abnahme-Kriterien

- [x] Genau 24 neue SC-Fragen, vier unterschiedliche Optionen je Frage,
      genau eine eindeutige Lösung mit nachvollziehbarer Erklärung.
- [x] Bestehende 27 Zeilen unverändert, 14 Spalten, keine ID-/Textduplikate.
- [x] Neue Inhalte passen zu LF12c und wiederholen keine Bestandsfrage bloß sprachlich.
- [x] Kein systematischer Längen-Bias, keine Signalwort- oder Satzschablonen-Tells.
- [x] Unabhängiger Fachreview mit Primärquellen ohne offene Findings abgeschlossen.
- [x] `node backend/scripts/validate-content.mjs` und
      `node scripts/check-agent-briefs.mjs` erfolgreich.

## Ergebnis

### Selbstprüfung

- 24 neue SC-Fragen, IDs 028–051 lückenlos, vier unterschiedliche Optionen
  und ein gültiger Antwortbuchstabe je neuer Frage.
- Alle bisherigen Zeilen byteinhaltlich nach Normalisierung der Zeilenenden
  gegen `git show HEAD:content/questions/DPA-PROJ.csv` verglichen: unverändert.
- Keine identischen Fragetexte der neuen Fragen im gesamten CSV-Bestand.
- Wortzahl-Gegenprobe nach den Korrekturen: korrekte Optionen im Mittel
  9,71 Wörter, Distraktoren 9,28 Wörter. Die Längenprüfung ergänzt den
  sprachlichen Review, sie ist kein starres Zwei-Wörter-Limit.
- Eigene Rechenkontrolle von 030 und 032–034: Ergebnisse bestätigt.
- Erster Validierungslauf: 2313 Fragen, 26 Dateien, keine Fehler.

### Unabhängiger Review

Vollständige Einzelprüfung aller 24 neuen Fragen durch einen frischen
Subagenten ohne geteilten Gesprächsverlauf, einschließlich eigener
Primärquellenrecherche und Abgleich gegen die fünf DPA-Module. Keine
falsche Musterlösung oder fachlich falsche Erklärung gefunden. Alle vier
Rechenaufgaben unabhängig nachgerechnet. Keine bloßen Umformulierungen von
Bestandsfragen, kein systematischer Längen-Bias und keine Beanstandung der
CSV-Antwortbuchstabenverteilung (Anzeige wird gemischt).

Drei Findings wurden umgesetzt:

1. 029: Drei Distraktoren hatten dieselbe Schablone „… mit ihren …
   verknüpfen“. Formulierungen variiert, Fragestamm passend auf „Welche
   Maßnahme …?“ angepasst. Bereits im Vollreview nachgeprüft und bestanden.
2. 035: Fachfremde Distraktoren durch typische Fehler bei der
   Positionsgewichtung ersetzt. Der Fragestamm stellt klar, dass die
   Auftragsdauer je Position wiederholt wird, damit die fachliche
   Auswertungseinheit eindeutig ist.
3. 039: Fachfremde Distraktoren durch verbreitete Fehlannahmen ersetzt:
   Null werde beim Mittelwert wie Missing übersprungen, Missing belege
   Maschinenstillstand, eine unveränderte Summe bedeute einen unveränderten
   Mittelwert. Fragestamm auf die fachliche Bewertung angepasst.

Abschließende Gegenprüfung am 2026-10-20: **BESTANDEN**, keine offenen
Findings. Der Reviewer hat die aktuellen Zeilen 035/039 erneut vom
Datenträger gelesen und Eindeutigkeit, plausible Distraktoren und Stil
bestätigt. Gegenprobe zu 039: [10, fehlend] ergibt beim Überspringen des
fehlenden Werts den Mittelwert 10, [10, 0] dagegen 5.

Abschlussvalidierung: 2313 Fragen in 26 Dateien, 26 Module, 4 Fachrichtungen,
keine Fehler. Archivierung in DONE.md, Entfernung aus STATUS.md und
`node scripts/check-agent-briefs.mjs` gehören zum Abschluss dieses Briefs.

### Umfang und Übergabe

Kein Datenbankimport und kein Installer-Build Bestandteil dieses
Content-Batches. Eine persönliche Freigabe durch Sven wird nicht vorweggenommen.
Die CSV-Erweiterung ist nicht gleichbedeutend mit einer Aktualisierung einer
laufenden PostgreSQL-Instanz oder eines installierten Desktop-Pakets.

DPA nach diesem Batch: ANA 50, DB 118, DS 51, PRO 51, PROJ 51 = 321
fachrichtungsspezifische Fragen. Gesamtbestand: 2313. Die im Vorgängerbrief
benannte DPA-Vertiefungsrunde ist damit um ihr letztes kleines Modul ergänzt.
