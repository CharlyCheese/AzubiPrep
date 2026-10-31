# Brief OPS-031: IoT und ausgeschriebenen Begriff gleich finden

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

IoT wird gefunden, dieselbe Frage mit Internet of Things nicht. Einen eng
begrenzten, belegten Suchalias in beiden Richtungen ergänzen. Keine freie
Synonymerfindung, keine Änderung privater Dokumente oder Quellenbindung.

## Betroffene Dateien

- backend/src/search-query.js, backend/test/search-query.test.js
- backend/src/theory.js, backend/test/theory.test.js
- backend/test/rag-index.test.js
- docs/24-Lokales-RAG.md, docs/25-Theorie-Glossar.md
- docs/agent-briefs/OPS-031-iot-suchalias.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Nur die vollständige englische Wortgruppe Internet of Things, unabhängig von
Großschreibung, Leerraum oder Bindestrichen, auf den Suchbegriff IoT abbilden.
Originalfrage, Originalquellen und gespeicherte Indizes erhalten. Alte Indizes
verwenden die vorhandene flüchtige Suchsicht; kein neues Aufbereiten nötig.
Querypositionen für Vergleichsfragen müssen nach Normalisierung konsistent
bleiben. Internet allein, Thing, IoT-Präfixe und andere Akronyme nicht zu IoT
erklären. Keine neuen Bibliotheken, Modelle, Installer oder Commits.

Primärbeleg: [NIST-Glossar](https://csrc.nist.gov/glossary/term/iot),
geprüft 31.10.2026. Nur diese Begriffsgleichheit übernehmen, keine weiteren
Fachinhalte. Private Materialien/Indizes ausschließlich lokal prüfen und nur
neutrale Kennzeichen ausgeben; keine Titel, Auszüge, Antworten oder Dateilisten.
Review ausschließlich öffentliche Dateien und synthetische Tests.

## Abnahme

- [x] Abkürzung und ausgeschriebener Begriff finden dieselben synthetischen
  Fundstellen in öffentlicher Theorie und alten privaten Indexformaten.
- [x] Großschreibung, Bindestriche, Vergleiche und Negativfälle geprüft;
  keine bloßen Internet-Treffer als Beleg für IoT.
- [x] Theorie-/Glossarfilter unterstützen dieselbe Zuordnung; Originaltitel,
  Text und Seiten bleiben erhalten.
- [x] Relevante Tests/Lint, frischer unabhängiger Review und Archivcheck grün.

## Ergebnis

Der explizite Alias wird nur in Suchsicht und Filterabfragen kanonisiert.
Originalfrage an das Modell, Originaltitel/-quellen und gespeicherte Indizes
bleiben erhalten. Vorhandene PDF-Reparatur ergänzt IoT auch für Langformen
in alten Indizes. Alias vor/nach PDF-Reparatur anwenden, damit gemischte
Schreibweisen wie Internet- of Things erhalten bleiben. Vergleichspositionen
normalisieren vor dem Zeilenumbruch-Schnitt, damit eine mehrzeilige Langform
keinen Vergleichsschutz umgeht. Internet allein oder längere Wortpräfixe
werden nicht zu IoT erklärt. Keine freie Synonymgenerierung.

145 Backendtests und Lint grün; acht Theorie-Browser-/Electronfälle grün.
Regressionen prüfen identische Treffer in beiden Richtungen, Altindexerhalt,
Großschreibung/Bindestriche/gemischte Trennung, mehrzeilige Wortgruppe,
Vergleichslücke und Negativfälle. Öffentliche und private reale Quellenprobe:
beide Fragen liefern jeweils dieselben sechs Fundstellen. Echte lokale
Qwenprobe mit privaten Quellen für beide Fragen source=model/grounded=true;
nur neutrale Prüfflags ausgegeben, keine Inhalte oder Antworten. Der Nachweis
belegt funktionierende Abrufe, keine unabhängige semantische Antwortprüfung.
Keine privaten Inhalte übernommen oder verändert, keine neuen Pakete.
Frischer unabhängiger Nachreview ohne offene Findings, eigener Nachlauf26/26
Tests sowie zusätzliche Quellen-/Wortgrenzen-/Negativproben grün. Gemischte
Trennschreibung und mehrzeilige Vergleichsfrage aus dem Review behoben.
Nur öffentliche Dateien und synthetische Daten im Review. Lokalen Server
auf Port3002 neu gestartet; Archivcheck287erledigt/10offen grün.
