# Brief CONTENT-085: FIAE-PRG – JavaScript-Auswertung und asynchrone Abläufe

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FIAE-PRG-147 bis -170 ergänzen, Modul 146 → 170.
Konkrete JavaScript-Auswertung, Datenstrukturen und Promise-Abläufe.
Browser-APIs ausdrücklich als solche kennzeichnen. Vorhandene Python-/
Java-Fälle nicht nur mit neuen Zahlen oder anderer Syntax wiederholen.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-085-fiae-prg-javascript-ablauf.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle146Bestandsfragen gelesen.
ECMAScript-Spezifikation, WHATWG und Mozilla-Browserdokumentation.
Node ist vorhanden; sichere isolierte Auswertungen ohne Netzwerk oder
Dateioperationen können Ergebnisse prüfen. Keine Projektcodeänderung.
Alter Byte-Präfix vor Änderungen SHA256:
cee9b78846cbccf9415166fd6dcc41dbac896217f0be132eb8be8f1381a7589f.

## Abnahmekriterien

- [x] Genau24 neue SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Laufzeit-/Auswertungsannahmen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

FIAE-PRG 146 → 170, Gesamtstand 3513 Fragen: mehr als die Hälfte von7000.
24 konkrete JavaScript-Fälle zu Bindung/Auswertung, Array-/Map-/Set-APIs,
JSON und asynchronem Ablauf. 158,161,168 ausdrücklich Browserfälle.

Frischer unabhängiger Vollreview content085_review und tatsächliche
Endstands-Nachprüfung: BESTANDEN. Anfangs teilten148 und160 jeweils drei
Distraktoren das „Es/Er liefert“-Template, abweichend vom Ausnahmefall.
Jeweils erster Distraktor umformuliert. Zusätzlich167a umformuliert, damit
die ähnliche ausschließlich falsche Phrase nicht über drei Fragen läuft.
Keine weiteren Findings; kein systematischer Längen-/Detailtell.

Autor und Reviewer haben jeweils24 sichere Auswertungsfälle in der
vorhandenen Node-v24.19.0-Laufzeit bestätigt. Keine Netzwerk- oder
Dateioperationen durch die Beispiele; abgebrochener Fetch nur mit data-URL.
Browsersemantik zusätzlich anhand Primärquellen geprüft. Keine tatsächlich
ausgeführten Browsertests behauptet und keine Testdateien hinzugefügt.

Quellen je CSV-Zeile: Mozilla-Referenzen für die einzelnen Sprach-/API-
Funktionen sowie ECMAScript2024 Promise.all. Reviewer zusätzlich
PerformPromiseAll und WHATWG Fetch/DOM-AbortController selbst abgerufen.
https://tc39.es/ecma262/2024/multipage/control-abstraction-objects.html#sec-performpromiseall
https://fetch.spec.whatwg.org/#fetch-method
https://dom.spec.whatwg.org/#interface-abortcontroller

Globaler Lernzielvergleich aller26CSV ohne neues Duplikat. Insbesondere
konstante JS-Bindung gegenüber Alias-/Tupelmutation; zyklischer Clone
gegenüber flacher Kopie; JS-sort-Referenz gegenüber Python-None;
sofortiges Promise gegenüber noch nicht gestarteter Python-Coroutine;
Nullish gegenüber einfachem or; SameValueZero gegenüber gewöhnlicher
Mengendopplung/NaN-Selbstvergleich. Quellen und tatsächliche Fälle einzeln
geprüft, keine bloßen Zahlenvarianten.

App-Parser:170 Modulfragen,3513 global eindeutige IDs,14 Felder.
Alter Byte-Präfix aus147physischen Zeilen exakt gemäß SHA256 erhalten.
Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Builds, Installationen, Datenbankimporte, Commits oder Pushes.
