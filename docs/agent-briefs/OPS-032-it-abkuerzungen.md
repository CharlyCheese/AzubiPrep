# Brief OPS-032: Gemeinsame IT-Abkürzungsauflösung

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Gängige IT-Abkürzungen und ausgeschriebene Begriffe allgemein in Theorie,
Glossar und lokaler RAG-Suche zusammenführen, statt Sondercode pro Begriff.
Zentrale belegte Begriffsliste und begrenzte Erkennung ausdrücklich erklärter
Abkürzungen in den gewählten Quellen. Keine allgemeine Synonymerfindung.

## Betroffene Dateien

- backend/src/search-aliases.js, backend/test/search-aliases.test.js
- backend/src/search-query.js, backend/test/search-query.test.js
- backend/src/rag-index.js, backend/test/rag-index.test.js
- backend/src/rag.js, backend/test/rag.test.js
- backend/src/theory.js, backend/test/theory.test.js
- docs/24-Lokales-RAG.md, docs/25-Theorie-Glossar.md
- docs/agent-briefs/OPS-032-it-abkuerzungen.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Belegte zentrale Einträge aus Hardware, Netzwerken, Web/Programmierung und
IT-Sicherheit/Cloud. Langformen mit Wortgrenzen, Groß-/Kleinschreibung,
Leerraum und Bindestrichen; längste Langform zuerst. Ähnliche Akronyme wie
HTTP/HTTPS, RAM/ROM, IPv4/IPv6 und SSL/TLS bleiben verschiedene Begriffe.
Mehrdeutige Kürzel wie MAC, NAS, CA, AP oder CD nicht automatisch vereinheitlichen.
Keine kurze allgemeine Bezeichnung wie Internet oder Speicher als Ersatz.

Zusätzliche ausgeschriebene Definitionen „Langform (ABC)“/„ABC (Langform)“
nur begrenzt, mit passenden Initialen, ohne bekannte Einträge zu überschreiben.
Konflikte verwerfen. Daraus abgeleitete Zuordnungen nur im flüchtigen Kontext
der gewählten Quellen; niemals aus der Nutzerfrage lernen oder persistieren.
Privat und öffentlich strikt getrennt, keine Übernahme in die öffentliche Liste.
Abdeckung/Positionen von Vergleichsfragen mit demselben Alias-Kontext prüfen.

Originalfrage und Quellen unverändert anzeigen, alte Indizes ohne erneutes
Einlesen weiterverwenden. Keine neuen Bibliotheken/Modelle/Installer, keine
Commits oder Uploads. Private Prüfungen ausschließlich lokal mit neutralen
Kennzeichen; keine Dateinamen/Titel/Auszüge/Antworten/abgeleiteten Listen ausgeben.
Review ausschließlich öffentliche Dateien/synthetische Daten.

## Abnahme

- [x] Zentrale belegte Liste mit mindestens50 gängigen Begriffen; generische
  Verarbeitung statt IoT-Sonderfall. Repräsentative echte öffentliche Probe.
- [x] Beide Suchrichtungen, Langformvarianten, längste Form, Wortgrenzen,
  ähnliche/mehrdeutige Kürzel und Vergleichspositionen getestet.
- [x] Quellendefinitionen funktionieren ohne Codeergänzung, begrenzt und
  konfliktfest; getrennte Quellenkontexte/Quellenwechsel ohne Aliasübernahme.
- [x] Öffentliche/private Quellen und Glossar nutzen gemeinsamen Mechanismus;
  Originaldaten und Schutzgrenzen erhalten, Aufwand nachvollziehbar begrenzt.
- [x] Relevante Tests/Lint, frischer unabhängiger Review und Archivcheck grün.

## Ergebnis

Gemeinsames öffentliches Register mit69 IT-Begriffen und Primärlinks ergänzt;
IoT-Sondercode ersetzt. Längste vollständige Langformen zuerst, Unicode-
Wortgrenzen und Trennvarianten; zentrale Akronyme vor Wortstamm-/Fuzzy-
Gleichsetzung geschützt. HTTP/HTTPS, RAM/ROM, SSL/TLS, IPv4/IPv6 und weitere
Negativpaare bleiben unterscheidbar. Deutsch/englisch für KI/AI und ML belegt.
Fachreview hat kein falsches Paar festgestellt. Primärquellen je Registereintrag.

Explizite unbekannte Klammerdefinitionen mit Initialenprüfung werden ohne neue
Suchlogik erkannt: drei bis zehn Großbuchstaben, zwei bis acht Wörter,
höchstens100 Zeichen je Langform; maximal128Paare/2048Definitionen/96MiZeichen
je Kontext. Nur Worttrennung durch Leerraum innerhalb desselben Abschnitts
(Erkennung: Leerzeichen/Tabulatoren/Bindestriche); Tabellen, andere
Definitionsformate und Abschnittsgrenzen sind nicht allgemein abgedeckt.
Widersprüche nach Kürzel oder Langform verworfen, auch bei ausgeschöpfter
Aufnahmegrenze. Zentrale Kürzel und Langformen dürfen nicht überschrieben
werden; häufige mehrdeutige Kürzel ausgeschlossen. Keine Vollständigkeitszusage
für alle möglichen Bedeutungen im gesamten IT-Wortschatz.

Privat: gemeinsamer flüchtiger Kontext der gewählten Unterlagen, keine neuen
Indexdateien oder PDF-Extraktion, zwei Indexdurchläufe vermeiden das gleichzeitige
Halten großer Indexobjekte. Indexfingerprint im zweiten Durchlauf geprüft.
Definitionsabhängigkeiten aller gewählten Unterlagen bei der nachfolgenden
Antwortprüfung berücksichtigt. Entfernte/geänderte Definitionen beeinflussen
keine Folgeanfragen; Originaltexte/-seiten/-frage bleiben bestehen.
Öffentlich: nur tatsächlich übergebene Kandidatenauszüge; Glossar nur nach
Filtern ausgewählte Titel. Kein Lernen aus Nutzerfragen, kein Übernehmen
privater Definitionen in Register/öffentlichen Suchkontext und keine Persistenz.

154Backendtests/Lint grün;20einschlägige Browser-/Electronfälle (KI/RAG/Theorie)
grün. Vollständiger synthetischer Rundlauf aller69Standardpaare in beiden
Suchrichtungen mit Originalindexvergleich. Dynamische Definitionen, Konflikte,
Limitfälle, Vergleichsschutz, Modul-/Quellenwechsel und Entfernen geprüft.
Reale Abrufprobe für zehn Paare (CPU,RAM,DNS,DHCP,HTTP,HTTPS,HTML,CSS,SQL,IoT):
jeweils identische sechs Quellen für Kurz-/Langform, öffentlich und lokal.
Echte DNS-Modellprobe für beide Schreibweisen in beiden Quellenmodi:
source=model/grounded=true mit gültigen Quellenkennungen. Nur neutrale
Prüfflags ausgegeben, keine privaten Titel/Auszüge/Antworten. Dies belegt
funktionierende Abrufe, keine unabhängige semantische Prüfung der Antworten.

Synthetische Performanceprobe:7000Abschnitte mit Fließtext, rund7MiZeichen;
Definitionserkennung212ms, statische Normalisierung26ms, Suchtextreparatur108ms.
Unabhängige Varianten mit6200Zeichen je Seite und7000–8000Chunks: Erkennung
51–227ms, Indexsuche120–191ms. Lokale Messwerte, keine Zusage für jedes Gerät.

Frischer unabhängiger Code-/Fachnachreview ohne offene Code-Findings, eigener
Nachlauf46Tests aus fünf Suites und gezieltes Lint grün. Findings zu
Überschreiben zentraler Langformen, Präfixlänge und Kollision am Limit behoben
und durch Regressionen abgesichert. Prüfer verwendete nur öffentliche Dateien
und synthetische Daten; keine privaten Dateien/Anfragen. Abschließender
Dokumentationsreview ebenfalls ohne Findings. Nach Sammleränderung elf
RAG-/Theorie-Browser-/Electronfälle erneut grün (20unterschiedliche Fälle
insgesamt, keine Mehrfachzählung). Finale lokale DNS-Kurz-/Langformprobe:
identische sechs Quellen und Versionsprüfung grün, keine Inhalte ausgegeben.
Lokalen Server auf Port3002 neu gestartet und Gesundheit geprüft.
Archivcheck288erledigt/10offen grün. Keine neuen Installer/Commits.
