# Brief CONTENT-205: FIAE-PRG – Java-Zeitverarbeitung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-PRG-243 bis -266 ergänzen, Modul 242 → 266.
Datums-, Uhrzeit-, Zeitspannen- und Formatierungsverträge in Java SE 21 anwenden.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-205-fiae-prg-java-zeitverarbeitung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 242 Altstämme gelesen, globale java.time-/Klassennamen-Suche ohne Bestand.
Python-datetime 145 und JavaScript-Intl-Fragen sind Nachbarn, keine Java-Verträge.
Frische offizielle Java-SE-21-Primärrecherche: LocalDate, LocalTime, Instant,
Duration, Period, ZonedDateTime, DateTimeFormatter, TemporalAdjusters und
ergänzend ResolverStyle. Zeitumstellungsregeln im Szenario vorgeben, keine
Annahme über zukünftige regionale Zeitzonendaten.
14 Felder. Altpräfix 110081 Byte SHA256:
e7a71a4af73eed85baf2112f6b1b57a53e669d408d9148a4859801730fee2ea1.
Keine Java-Installation oder behaupteten Java-Laufzeittests; statische Prüfung
der API-Verträge und Beispielrechnungen. Keine Builds, DB/.env, Commits/Pushes.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

266 Modulfragen, global nach diesem Batch 6393. Frischer Reviewer
`content205_review` prüfte alle 24 Stämme, 96 Optionen und Erklärungen,
242 Altstämme und globale semantische Nachbarn in 26 CSV. Eigene frische
Primärrecherche aller neun Oracle-SE21-Seiten einschließlich Detailverträgen
zur Normalisierung, Genauigkeit, strikten Auflösung und Ordinalzahl null.
Keine Findings oder systematischen Antwort-Tells. App-Parser, 14 Felder,
globale IDs und unverändertes Altpräfix bestätigt. Content-Validator,
Diff- und Archivcheck erfolgreich. Keine Java-Laufzeittests behauptet.

Primärquellen: https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/time/
mit LocalDate.html, LocalTime.html, Instant.html, Duration.html, Period.html,
ZonedDateTime.html, format/DateTimeFormatter.html, format/ResolverStyle.html
und temporal/TemporalAdjusters.html (auch einzeln in CSV belegt).
