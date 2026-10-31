# Brief OPS-029: Ausführliche Theorie und gegliederte Lernfelder

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Praxisabnahme des bisherigen Theorieeinstiegs bestätigt; Erklärungen sollen
ausführlicher werden und ein Lernfeld geordnet durchgehen. Die bisherige
450-Wörter-/3-Quellen-Antwort reicht dafür nicht. Mehrteiligen Lernfeldmodus
mit einzelnem und sequenziellem Erklären aller Abschnitte ergänzen.

## Betroffene Dateien

- backend/src/theory-outline.js, backend/src/theory.js, backend/src/ai.js
- backend/src/rag.js, backend/test/rag.test.js
- backend/test/theory.test.js, backend/test/ai.test.js
- frontend/src/components/TheorieLektion.jsx, frontend/src/styles/theorie.css
- frontend/src/pages/Theorie.jsx
- frontend/public/sw.js, e2e/tests/theorie.spec.js
- README.md, docs/24-Lokales-RAG.md, docs/25-Theorie-Glossar.md
- docs/agent-briefs/OPS-029-ausfuehrliche-lernfelder.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Festlegungen

Öffentliche, selbst formulierte didaktische Abschnittspläne je Lernfeld,
an amtlichen Kompetenzbereichen orientiert; keine privaten PDF-Gliederungen
übernehmen. Grundlage KMK-Rahmenlehrplan13.12.2019, aktuell geprüft31.10.2026.
Plan ist eine Lernhilfe, kein Nachweis vollständiger Quellen-/Curriculumabdeckung.
Gemeinsame und fachrichtungsspezifische Lernfelder zugänglich machen.

Normale kurze Erklärung bleibt verfügbar; ausführliche Erklärung je Abschnitt
mit Grundlagen, schrittweiser Erläuterung, Beispiel, typischen Fehlern und
Zusammenfassung. Größere, begrenzte Ausgabe nur für Theorie. Pro Abschnitt
eigene gezielte Quellenabfrage; keine einzige breit gestreute Anfrage für das
ganze Lernfeld. Kapitel-ID/Detailstufe serverseitig validieren. Quellen-/
Zustimmungs-/Transport-/Interpretationsgrenzen bleiben unverändert.
Ausführliche Theorie bekommt bis sechs Fundstellen pro Abschnitt, kompakte
Hilfe/Quellenlesen weiterhin drei; Eingabe-/Kontextgrenzen bleiben begrenzt.

Alle Abschnitte bewusst starten, nacheinander abarbeiten, ohne parallele
Modellanfragen. Antworten im aktuellen UI getrennt erhalten, keine dauerhafte
Speicherung oder Exporte privater Inhalte. Abbrechen behält fertige Abschnitte;
Quellen-/Modell-/Themen-/Materialwechsel verwirft alte Antworten und laufende
Anfragen. Fehlende Quellen als Lücke, Fehler als wiederholbar zeigen. Anzahl
bearbeiteter Abschnitte niemals als bewiesene fachliche Vollständigkeit ausgeben.
Keine Buchkopie, keine neuen Abhängigkeiten oder Installer.

## Abnahme

- [x] Lernfeldbezogene öffentliche Abschnittspläne und gezielte Kapitelabfragen.
- [x] Ausführliche Einzel-/Kapitelantworten, klare Abschnitte/Quellen/Lücken.
- [x] Bewusstes sequenzielles Erklären aller Teile, Abbruch und Wiederholung;
  keine doppelten/parallelen Anfragen oder Übernahme veralteter Antworten.
- [x] Private Daten weiterhin lokal/flüchtig, keine echten Inhalte in Tests/
  Tools/Doku/Screenshots; Modellgrenzen und fehlende Abdeckung klar.
- [x] Backend-/Browser-/Desktopregressionen und synthetische Modellprobe grün.
- [x] Frischer unabhängiger Review, neutrale Doku und Archivcheck grün.

## Ergebnis

21 Lernfeldeinstiege mit eigenen didaktischen Plänen von fünf bis acht Teilen
ergänzt: gemeinsame LF1–9 und vier Fachrichtungen mit LF10–12. Offizielle Titel/
Zuordnung gegen KMK-Rahmenlehrplan (13.12.2019, geprüft31.10.2026) verifiziert;
die didaktischen Untergliederungen sind selbst formulierte Orientierung,
keine aus privaten Unterlagen abgeleiteten Buchstrukturen oder garantierte
Vollständigkeitsnachweise. Nicht unterstützte Module/Begriffe verlinken auf
ihren Lernfeldeinstieg, Karten zeigen die Zahl der Abschnitte.

Theorie startet im ausführlichen Modus: Grundlagen, Zusammenhänge,
durchgearbeitetes Beispiel, typische Fehler, Zusammenfassung und unbenotete
Verständnisfrage. Anweisungsziel bei ausreichender Quellenlage500–900Wörter,
maximal2400Ausgabetokens/18000Zeichen; Kompaktmodus450/1100 bleibt verfügbar.
Ausführliche Theorie erhält bis sechs statt drei Fundstellen, Eingabe-/Kontext-
grenzen bleiben begrenzt. Gültige Kapitel-/Detail-IDs werden serverseitig
aufgelöst; eigene Abfrage pro Teil, kein bloßes Verlängern einer breit gestreuten
Lernfeldantwort. Antworttokens prüfen jede verwendete Unterlage nur einmal.

Alle offenen Teile werden bewusst nacheinander angefordert. Fertige Antworten
bleiben flüchtig auf der Seite; Abbruch und Dienstfehler erhalten bestätigte
Teile, Fortsetzung betrifft nur offene/fehlgeschlagene Teile. Quellenlücken
werden getrennt angezeigt und bei Bedarf einzeln wiederholt. Quellen-/Modell-/
Detail-/Themen-/Materialwechsel verwirft fertige und laufende Antworten.
Kein Chat-/Antwortspeicher, Export, Punktestand oder KI-Benotung.

Nachweise Windows10x64, Chromium153, Electron45.2:

- 127 Backendtests und Lint grün, einschließlich vier neuer Fälle zu Plänen,
  Validierung/Detailausgabe, Quellenlimit und LF12-Fachkontext.
- 20 KI/RAG/Theorie-Browser-/Electronfälle und25bestehende Kurs-/Quiz-/Desktop-
  Regressionen grün; zwölf Desktop-/Webruntimeprüfungen bestanden.
- Drei neue Browserfälle: streng sequenzielle Bearbeitung/Quellenlücke,
  Abbruch mit erhaltenen Teilen und Wiederaufnahme sowie Quellenwechsel/
  Detailwahl. Synthetische390px-Darstellung ohne horizontalen Überlauf,
  umbrochene lange Schaltflächen und lesbare Teilantworten visuell geprüft.
- Echter lokaler Qwen-Test mit ausschließlich selbst geschriebenem Hardware-
  Lerntext:376Wörter, Praxisbeispiel, Zusammenfassung, sechs validierte Quellen,
  nicht abgeschnitten. Wortziel ist keine erzwungene Mindestlänge; begrenzte
  Quellen werden nicht durch unbelegtes Füllmaterial ersetzt. Keine private PDF
  oder echte private Antwort in Tests/Toolausgaben/Doku/Screenshots übernommen.
- Vorhandenen Modelldienst lokal ohne Cloudzugriff neu gestartet; Ausgaben
  bleiben ausschließlich unter ignorierter privater runtime-Ablage. Kein
  Modell heruntergeladen. Lokale Webversion auf3002 mit finalem Backend
  aktualisiert; Frontendbuild index-DNNGRXFu.js, ServiceWorker v11.

Frischer unabhängiger Reviewer ops029_review fand fehlenden Fachkontext in
generischen LF12-Projektabfragen. Behoben durch eigene Fachkeywords und
Lernfeldtitel; CPS behandelt ausdrücklich Optimierung bestehender Systeme.
Synthetischer Regressionstest vergleicht alle vier Abfragen. Eigener Prüfer-
Nachlauf36/36grün. Finaler Code-/UI-/Dokunachreview ohne offene bestätigte
Findings. README und docs24/25 aktualisiert; kein neuer Installer.
