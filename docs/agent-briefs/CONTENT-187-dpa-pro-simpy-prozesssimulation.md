# Brief CONTENT-187: DPA-PRO – SimPy-Prozesssimulation

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-PRO-220 bis -243 ergänzen, Modul 219 → 243.
Diskrete Ereignissimulation für Prozesszeiten, Warteschlangen und Ressourcen.

## Betroffene Dateien

- `content/questions/DPA-PRO.csv`
- `docs/agent-briefs/CONTENT-187-dpa-pro-simpy-prozesssimulation.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

219 Altstämme gelesen; globale SimPy-Suche ohne Lernzieltreffer.
Prozesskennzahlen/Modellierung nicht bloß umformulieren: konkrete SimPy-4.1-
Ereignis-, Zeit- und Ressourcenverträge mit eigenen kleinen Beispielen.
Frische Primärrecherche in offizieller SimPy-Dokumentation.
Keine Installation, Dienste, Builds, DB/.env, Commits oder Pushes.
Altpräfix 113702 Byte SHA256:
c07cc80a2e6b9ce1cd62c602e3ed72d40b0e521b2fe40ac691def194d994dbba.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen und fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 219 → 243, Gesamtkatalog 5937 → 5961.
Frischer unabhängiger content187_review prüfte alle 24 gespeicherten Fragen,
96 Optionen, Erklärungen, 219 Altstämme und semantische Nachbarn aus 26 CSV.
Eigene frische Recherche auf sieben offiziellen SimPy-4.1.2-Seiten.
Findings: lokale Satzschablonen in 229/233 sowie falsch-exklusive Wendung
„unabhängig von“ in 223/234/243. Optionen fachlich variiert; danach alle
24 tatsächlichen Endzeilen erneut vollständig gelesen und freigegeben.
Keine Lernzielduplikate: API-Verträge unterscheiden sich von abstrakter
Prozesssimulation PRO050, Parallelzeiten PRO053, Abtastung AUT077 und
anderen Queue-APIs PRG081/IOT102. Kein offener Antwort-Tell.
Altpräfix unverändert, globale IDs eindeutig, App-Parser mit 243 Records.
Statisch geprüft: 20+3=23, AllOf max(2,5)=5, AnyOf a bei t=2,
Container 2 freie Plätze <4 sowie Vorrat 3<5. SimPy nicht installiert,
keine Laufzeitprüfung behauptet. Content-Validator (5961 Fragen/26 CSV),
Diff- und Archivierungscheck erfolgreich.

Primärquellen unter https://simpy.readthedocs.io/en/stable/:
- topical_guides/environments.html
- topical_guides/events.html
- topical_guides/process_interaction.html
- topical_guides/time_and_scheduling.html
- topical_guides/resources.html
- api_reference/simpy.resources.html
- examples/gas_station_refuel.html
