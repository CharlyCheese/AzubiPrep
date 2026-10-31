# Brief OPS-028: README und aktuelle Screenshots

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag und Umfang

README auf aktuellen Quellstand bringen; elf bestehende Screenshots im
vorhandenen Ordner unter denselben Dateinamen ersetzen. Aktuelle Ansichten
der Frontend-Werkstatt, des Theorie-/Glossarkatalogs und Quellenlesemodus
ergänzen und in der README verlinken. Keine Veröffentlichung oder neuer Build
von Installern beauftragt.

## Betroffene Dateien

- README.md
- frontend/src/pages/Dashboard.jsx (vorhandene Health-Feldnamen korrekt verwenden)
- screenshots/dashboard.png, screenshots/lernbereich.png
- screenshots/karteikarten.png, screenshots/pruefungssimulation.png
- screenshots/statistik-abzeichen.png, screenshots/lernreise.png
- screenshots/lernkalender.png, screenshots/notizen.png, screenshots/einstellungen.png
- screenshots/lernbereich-mobile.png, screenshots/pruefungssimulation-mobile.png
- screenshots/frontend-werkstatt.png, screenshots/theorie-glossar.png
- screenshots/theorie-fundstellen.png
- e2e/scripts/update-screenshots.mjs
- docs/agent-briefs/OPS-028-readme-screenshots.md
- docs/agent-briefs/DONE.md

## Vorgehen und Datenschutz

Aufnahmen der gebauten echten Oberfläche in eigenem frischem Browserkontext
und separatem lokalen Backend: keine Datenbank, keine Konten, isolierte leere
RAG-Ablage außerhalb des Projekts, keine Verbindung zum persönlichen
Browserprofil. Nur öffentliche App-Inhalte und explizit selbst erstellte
Demodaten verwenden. Keine privaten Unterlagen oder Ableitungen lesen,
keine realen Modellantworten oder persönlichen Pfade in Bilder übernehmen.
Der Quellenlesemodus verwendet ausschließlich App-Lerninhalte ohne Modell.
Materialstatus darf den leeren privaten Ablagepfad für Bilder ausblenden;
keine UI-Funktionen erfinden oder KI-Antworten als echt simulieren.

Reproduzierbares Skript mit vorhandenen Playwright-Abhängigkeiten. Erst alle
Aufnahmen in temporärem Verzeichnis prüfen, dann die ausdrücklich benannten
PNG-Zieldateien ersetzen. Vor rekursiver Fixturelöschung kanonische Tempwurzel
und erwarteten Präfix überprüfen. Benutzer-App und persönliche Daten unverändert.

Bei der visuellen Prüfung gefundener kleiner Vertragsfehler: Dashboard liest
`fragenGesamt`, die bestehende Health-API liefert `fragenAnzahl`. Diesen echten
Anzeigefehler im Verbraucher korrigieren, statt Bilder oder API-Daten zu fälschen;
Screenshot-Prüfung verlangt die tatsächliche geladene Fragenzahl.

README: 7000 Fragen/26 Module, Node-Minimum22.13/Empfehlung24, Electron45.2,
Werkstatt und lokale optionale Qwen/RAG-/Theorie-Funktionen erklären. Quellstand
und bestehende Installer unterscheiden; private Materialien nicht mitliefern.
Veraltete Zahlen/Features/Strukturangaben korrigieren, keine vollständige
didaktische Abdeckung oder Offline-KI ohne Dienst behaupten.

## Abnahme

- [x] README konsistent mit aktuellem Code und tatsächlichen Paketgrenzen.
- [x] Elf bestehende PNGs ersetzt, drei neue Ansichten ergänzt; README-Bildlinks gültig.
- [x] Lesbare echte UI-Aufnahmen ohne Lade-/Fehler-/Onboarding-Overlays;
  Desktop und vorhandene mobile Ansichten visuell geprüft.
- [x] Keine privaten Inhalte, persönlichen Lerndaten, Dateipfade oder Zugangsdaten.
- [x] Frischer unabhängiger Review und Archivcheck grün.

## Ergebnis

README auf 7000 Fragen/26 Module, 18 vorhandene öffentliche Kurztexte,
Node22.13/Empfehlung24 und Electron45.2 aktualisiert. Werkstatt, Theorie/Glossar,
freiwillige lokale Qwen/RAG-Anbindung und Quellenlesemodus beschrieben;
Quellstand von vorhandenen Desktop0.1.3-/Web0.1.2-Paketen unterschieden.
Veraltete Vollständigkeits-/Roadmapangaben korrigiert. Keine neuen Installer.

Elf bestehende Screenshots unter unveränderten Dateinamen ersetzt, drei neue
PNG-Ansichten ergänzt. README verlinkt alle 14 Bilder. Reproduzierbares Skript
unter e2e/scripts/update-screenshots.mjs verwendet nur bestehende Abhängigkeiten,
eigenen Loopbackserver, frisches Chromiumprofil, öffentlichen CSV-Content,
selbst erstellte Beispieldaten und leere externe Temp-RAG-Ablage. Keine echte
PDF, Privatmetadaten oder Modellantworten gelesen/aufgenommen. Materialpfad
für die Aufnahme entfernt; Modellaufrufe und private Quellennutzung gesperrt.
Aufnahmen zunächst gesammelt, geprüft und erst vollständig ins Ziel kopiert;
Tempdaten mit kanonischer Grenzprüfung bereinigt.

Kleinen echten Dashboard-Anzeigefehler korrigiert: Health liefert fragenAnzahl,
nicht fragenGesamt. Ungenutzte ältere Modul-Fallbackvariable entfernt. Neue
Capture-Assertion prüft die tatsächlich geladene Gesamtzahl im Dashboard.
Frontendbuild grün (index-Dbr-BLRA.js); vollständiger erneuter Capture-Lauf
mit 14 gültigen PNGs und ohne JavaScriptfehler bestanden. Desktop1440x1000,
Quellenlesen1440x1200 und mobile390x844; Desktop dunkel, mobil hell.

Frischer unabhängiger Reviewer ops028_review prüfte Script/Backendisolation,
Paketgrenzen, öffentliche Kennzahlen und sämtliche 14 Bilder visuell.
32 lokale README-Links einschließlich14Bildlinks gültig; keine privaten Daten,
Zugangsdaten oder störenden Overlays, Dashboardzahl nach Korrektur korrekt.
Keine offenen Findings. Format-/Archivcheck grün; kein Git-Push ausgeführt.
