# Brief CONTENT-158: FIAE-SWE – Maven-Builds und Abhängigkeiten

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-SWE-194 bis -217 ergänzen, Modul 193 → 217.
Maven 3: Lebenszyklus, POM, Dependencies, Reactor, Einstellungen und Plugins.

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-158-fiae-swe-maven-builds.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 193 Altstämme gelesen, globale 26 CSV auf Lernziele abgleichen.
Eigene frische Apache-Maven-Primärrecherche je Lernziel. Keine Installation,
Maven-Ausführung/Builds, Repository-Downloads, DB/.env, Commits oder Pushes.
15-Feld-Schema mit LF11a erhalten.
Altpräfix 105519 Byte SHA256:
c48701f7b5c37bf9c07806a7895c2cd1944d2cff6c52cfe53f51c8a797729f28.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5265. Frischer Reviewer content158_review
hat alle Fragen, Optionen, Erklärungen, 193 Altstämme und globale Nachbarn
geprüft. Drei zu fachferne Distraktorsätze in 203/209/215 ersetzt; tatsächliche
gespeicherte Endfassung erneut vollständig geprüft und freigegeben, keine
verbleibenden Findings. Korrekte Antworten im Schnitt 34,79 Zeichen,
Distraktoren 37,17; keine systematische Detaildominanz oder Sprach-Tells.

Autor und Reviewer führten eigene frische Apache-Primärrecherche durch:
Lifecycle, POM, Dependency Mechanism, Optional/Excludes, Multiple Modules,
Settings, CLI 3.9.11 sowie Help-, Dependency-, Surefire-, Failsafe-, Resources-
und JAR-Plugin. Mirror-Muster zusätzlich unter
https://maven.apache.org/guides/mini/guide-mirror-settings.html bestätigt.
Quellen je Frage verlinkt. Keine Maven-Ausführung, kein Build oder Artefakt-
Download. Altpräfix erhalten; App-Parser, Content-Validator und Diffcheck grün.
