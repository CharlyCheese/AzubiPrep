# Brief OPS-030: Spezifische Begriffs- und Vergleichsfragen finden

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Konkrete Vergleichsfrage wird weder mit App-Lerninhalten noch mit eigenen
lokalen Unterlagen beantwortet. Beide Suchwege auf Wortformen, getrennte
Zusammensetzungen und Trefferqualität verbessern; keine bloße Lockerung der
Quellenbindung oder Erfindung fehlenden Wissens. Beispiel ist die Unterscheidung
Gewerkschaft/Arbeitgeberverband; abweichende Eingaben wie Arbeitgeber Verbund
berücksichtigen, ohne andere Begriffe oder Vertretungsgremien gleichzusetzen.

## Betroffene Dateien

- backend/src/search-query.js, backend/test/search-query.test.js
- backend/src/rag-index.js, backend/src/rag.js, backend/src/theory.js
- backend/src/ai.js, backend/test/ai.test.js
- backend/test/rag-index.test.js, backend/test/rag.test.js, backend/test/theory.test.js
- content/theorie/WISO.md
- docs/24-Lokales-RAG.md, docs/25-Theorie-Glossar.md
- docs/agent-briefs/OPS-030-spezifische-theoriefragen.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen und Befund

Öffentliche Vorprobe: ursprüngliche wie fachsprachlich korrigierte Frage
liefern jeweils sechs Quellen. Diese enthalten mehrfach die Tarifparteien,
aber keine ausreichende Rollenbeschreibung; zusätzlich unpassende Treffer
über allgemeine Fragewörter. Die öffentlichen WISO-Grundlagen deshalb eng
um selbst formulierte, amtlich belegte Begriffsunterscheidung ergänzen.
Primärquelle BMAS-Tarifpartnerglossar/Tarifregister, geprüft 31.10.2026.
Keine privaten Inhalte für diese Ergänzung verwenden.

Deterministische begrenzte Suchnormalisierung ohne neue Bibliothek/Modelle:
Fragefüllwörter entfernen, deutsche Wortformen/nahe Schreibvarianten und
erkannte Zusammensetzungen abgleichen. Originalfrage bleibt erhalten.
Keine globale freie semantische Umdeutung. Technische Kurzbegriffe wie RAM/ROM
nicht über unscharfe Ähnlichkeit gleichsetzen. Indexbestand kompatibel halten;
keine automatische erneute PDF-Extraktion erforderlich.

Mehrteilige Vergleiche dürfen Quellen von getrennten Textstellen vereinen.
Begriffe möglichst gemeinsam abdecken, Wiederholungen reduzieren. Erkannte
unvollständige Vergleichsgrundlage klar benennen; fehlendes Wissen nicht
stillschweigend durch allgemeines Modellwissen oder andere Quelle ersetzen.
Gültige IDs/Seiten, Quoten/Transport/Zustimmung und Löschschutz erhalten.

Private Diagnose/Prüfung nur lokale Prozesse mit neutralen Kennzeichen:
keine Dateinamen, Titel, Auszüge, Fingerprints oder realen Modellantworten in
Toolausgaben/Chat/Doku/Screenshots. Tests/Review nur öffentliche Inhalte und
selbst geschriebene synthetische Seiten. Keine neuen Installer.

## Abnahme

- [x] Konkretes Beispiel findet tragfähige öffentliche Begriffsgrundlage;
  Wortformen, getrennte Schreibweisen und getrennte Seiten getestet.
- [x] Kein globales Gleichsetzen ähnlicher/fachlich verschiedener Begriffe;
  Negativfälle, leere Suchfragen und begrenzter Aufwand geprüft.
- [x] Vergleichsabdeckung, Vielfalt und fehlende Belege nachvollziehbar;
  vollständige Quellenbindung bleibt bestehen.
- [x] Bestehende private Indizes ohne Neuauslesen verwendbar; lokale Diagnose
  und Modellprobe ohne private Ausgabe, Zugriffsschutz unverändert.
- [x] Relevante Tests, frischer unabhängiger Review, Doku/Archivcheck grün.

## Ergebnis

Implementiert: begrenzte Fragewortfilterung, bis24 Suchbegriffe, höchstens6
Varianten je Begriff; deutsche Wortformen, Ein-Zeichen-Nähe nur ab sieben
Stammzeichen sowie vollständige Wortteilgruppen. Zusammenfügen von Suchwörtern
nur bei tatsächlicher Nachbarschaft ohne Vergleichsseparator. Eng begrenzter
und sichtbarer Begriffshinweis für Arbeitgeberverbund im Gewerkschaftskontext.

Alte private Indizes ohne Re-Extraktion nutzbar: PDF-Silbentrennung ergänzt nur
die flüchtige Suchsicht. Originale Wörter, Text, Seiten und gespeicherte Indizes
bleiben bestehen. Wortteilgruppen berücksichtigen mehrere Flexionsformen;
beide Gruppen müssen innerhalb desselben Abschnitts vorkommen.

Vergleichstreffer vor dem Top12-Abschneiden nach zusätzlicher Begriffsabdeckung
priorisiert. Erkannte Vergleiche verlangen alle relevanten Wörter beider Seiten;
Kontextwörter oder gemeinsame Oberbegriffe zählen nicht als Ersatz. Öffentliche
Treffer dürfen nicht auf abgeschnittenen, gar nicht übergebenen Texten beruhen.
Schutz-/Quellen-/Transportgrenzen unverändert.

Öffentliche echte lokale Qwen-Probe: ursprüngliche Eingabe mit sichtbarem
Begriffshinweis und vier gültigen Quellen beantwortet; Rollenunterschied korrekt,
keine erfundene Zusatzbedingung für einzelne Arbeitgeber. Weitere kanonische
Vergleichsformulierungen ebenfalls geprüft. Modellantworten bleiben variabel;
Quellenkennungen beweisen keine fachliche Wahrheit.

Private Probe ausschließlich lokal und ohne Inhaltsausgabe: vor Korrektur
unpassende Treffer, nach Korrektur beide Begriffe gefunden (ready/eine Quelle).
Die echte Modellprobe lehnt die Erklärung weiterhin als unzureichend belegt ab
(context_guard/grounded=false). Ein flüchtiger Versuch mit direkten
Nachbarabschnitten brachte keine Verbesserung, daher nicht eingebaut. Keine
Zusage, dass die private Quelle diese Rollen ausreichend erklärt; keine Aussage
über ihren gesamten Inhalt. Die ursprüngliche lokale Nichtantwort ist deshalb
nicht als vollständig behoben zu melden. Weiterer Ausbau der semantischen Suche
und Materialabdeckung bleibt offen. PDF, Index und private Inhalte unverändert;
keine Titel, Auszüge oder Antworten veröffentlicht.

Prüfstand:142 Backendtests und Lint grün;20 einschlägige Browser-/Electronfälle
(KI/RAG/Theorie) grün. Synthetische Regressionen zu Wortformen, Silbentrennung,
Akronymen, getrennten Seiten, Top12-Vielfalt, leeren/negativen Abfragen,
Vergleichslücken und abgeschnittenen Quellen. Neue Installer nicht erstellt.
Frischer unabhängiger Abschlussreview ohne offene bestätigte Findings;
eigener Nachlauf55/55 gezielte Tests und Lint grün. Findings zu
Vergleichsabdeckung, Wortformen, unsichtbar gekürzten Belegen und verlorenem
SQL/TCP/API-Token behoben und durch Regressionen abgesichert. Nur öffentliche
Dateien/synthetische Tests im Review. Lokaler Server auf Port3002 mit neuem
Stand gestartet. Archivcheck286done/10offen grün.
