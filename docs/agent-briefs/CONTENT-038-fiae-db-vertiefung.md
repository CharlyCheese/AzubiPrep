# Brief CONTENT-038: FIAE-DB mit Abfragen und Transaktionsfällen vertiefen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

FIAE-DB von 118 auf 142 Fragen erweitern. 24 zusätzliche Anwendungsfragen
zu SQL-Ergebnissemantik, Datenintegrität, Indizes und Transaktionen.
Modulzuordnung LF5 bleibt erhalten. PostgreSQL-spezifische Aussagen werden
ausdrücklich als solche bezeichnet.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-038-fiae-db-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Erst den vorhandenen Bestand gegen die geplanten
Anwendungsfälle abgleichen. Eigene Aufgaben, Recherche am 2026-10-20.

- [PostgreSQL SELECT](https://www.postgresql.org/docs/current/sql-select.html)
- [PostgreSQL Aggregate Functions](https://www.postgresql.org/docs/current/functions-aggregate.html)
- [PostgreSQL Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [PostgreSQL Transaction Isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL Indexes](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)

Weitere konkrete Quellen und ID-Zuordnung aus dem unabhängigen Review:

- 119–121/128: Aggregate Functions und [Aggregate Expressions](https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-AGGREGATES).
- 122–123: [NULL-Vergleiche](https://www.postgresql.org/docs/current/functions-comparison.html) und [NOT IN](https://www.postgresql.org/docs/current/functions-comparisons.html).
- 124–127: [Table Expressions](https://www.postgresql.org/docs/current/queries-table-expressions.html).
- 129–130: [UNION](https://www.postgresql.org/docs/current/queries-union.html) und [ORDER BY](https://www.postgresql.org/docs/current/queries-order.html).
- 131–134: Constraints, Kombination von Primär-/Fremdschlüssel, NOT NULL und CHECK.
- 135–136: [Transaktionen](https://www.postgresql.org/docs/current/tutorial-transactions.html) und [UPDATE](https://www.postgresql.org/docs/current/sql-update.html).
- 137–139: Isolation und [Serialization Failure Handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html).
- 140–142: EXPLAIN und [Multicolumn Indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html).

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen FIAE-DB-119 bis -142, vier unterschiedliche Optionen.
- [x] Bestehende 118 Zeilen unverändert, 14 Spalten, keine IDs-/Textduplikate.
- [x] SQL-Ergebnisse an kleinen Datenbeispielen nachvollziehbar gegenprüfen.
- [x] Fachlich korrekt und eindeutig, Annahmen/DB-System klar, keine Definitionswiederholungen.
- [x] Plausible Distraktoren, kein systematischer Längen-/Schablonen-Tell.
- [x] Vollständiger unabhängiger Fachreview mit Primärquellen ohne offene Findings.
- [x] Content-Validierung und Archivierungscheck erfolgreich.

## Ergebnis

24 SC-Fragen ergänzt, FIAE-DB jetzt 142. Vollständiger unabhängiger
Fachreview am 2026-10-20: alle 24 Fragen mit 96 Optionen, Lösungen,
Erklärungen und Schwierigkeit geprüft. Keine falsche Musterlösung, keine
bloßen Definitionswiederholungen, kein systematischer Längen-/Meta-Tell.
Alte 118 Zeilen samt Header unverändert, 14 Spalten, eindeutige IDs/Texte.

Ein P2-Finding zu 136d korrigiert: sachfremde Verwechslung der betroffenen
Zeilenzahl mit einer Artikelnummer ersetzt durch die plausible falsche
Annahme einer schon früher erfolgten Reservierung. In 120/121 wurde zur
Klarheit zwischen NULL und Zahlenwert 0 sprachlich unterschieden. Aktuelle
Zeilen 120/121/136 vom Reviewer erneut gelesen: **BESTANDEN**, keine
offenen Findings.

Reviewer-Gegenrechnungen: 119 (3,2), 120 (15), 121 (eine NULL-Zeile),
122 IS NULL, 123 keine Zeile, 124 ON erhält unpassende Kunden, 125 drei
Zeilen, 126 A=110, 127 WHERE vor/HAVING nach Gruppierung, 128 zwei Werte,
129 vier Zeilen, 130 eindeutiger zusätzlicher Schlüssel. Auch 131–142
einzeln anhand der PostgreSQL-Dokumentation bestätigt.

Zusätzliche lokale Gegenproben für standardnahe Abfragesemantik in einer
flüchtigen SQLite-In-Memory-Datenbank (keine Datei, keine Projekt-DB):
119,120,121,123,124,126,128,129 bestätigen die Ergebnisse. PostgreSQL-
spezifische CHECK-, Isolations-, Retry- und EXPLAIN-Aussagen wurden über
die offizielle Dokumentation geprüft; kein PostgreSQL-Livetest behauptet.

## Abschluss der FIAE-Runde CONTENT-034 bis -038

| Modul | Vorher | Danach | Neu |
|---|---:|---:|---:|
| FIAE-TST | 40 | 64 | 24 |
| FIAE-SWE | 49 | 73 | 24 |
| FIAE-UX | 52 | 76 | 24 |
| FIAE-PRG | 74 | 98 | 24 |
| FIAE-DB | 118 | 142 | 24 |

120 neue Fragen, FIAE-spezifisch jetzt 453, Gesamtbestand 2433.
Alle fünf Batches vollständig unabhängig geprüft und ohne offene Findings.
Gemeinsame Abschlussprüfung: 120 neue SC-Fragen mit fortlaufenden IDs und
vier unterschiedlichen Optionen, keine identischen neuen Fragetexte im
Gesamtbestand, sämtliche bisherigen Zeilen der fünf Dateien unverändert
gegen HEAD. Wortzahlmittel korrekt/Distraktor: TST 7,25/6,96; SWE 7,58/7,24;
UX 8,75/8,51; PRG 4,58/4,88; DB 6,25/6,31 (vor kleiner 136d-Präzisierung).
Die Sprachprüfung beurteilt zusätzlich den Inhalt, nicht bloß die Zahlen.

Content-Validierung: 2433 Fragen, 26 Dateien, 26 Module, 4 Fachrichtungen,
keine Fehler. Archivierung in DONE.md, laufende Punkte aus STATUS.md
entfernt, check-agent-briefs grün. Frühere Arbeit aus CONTENT-033 erhalten.
Keine bestehende Datenbank geändert, kein Installer-Build oder Commit und
keine persönliche Freigabe vorweggenommen.

Nach dieser Runde sind die kleineren FIAE-Module aufgefüllt. Als nächster
überschaubarer Einstieg bietet sich DPA-ANA (50) oder DPA-DS/DPA-PRO/
DPA-PROJ (je 51) an; Bestand und Themenlücken vor dem nächsten Batch neu
prüfen. Keine weitere Erweiterung in diesem Brief begonnen.
