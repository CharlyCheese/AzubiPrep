# Lokale PDF-Unterlagen für Qwen

Stand: 31.10.2026, OPS-026. Implementiert im aktuellen Web-/Desktop-Quellstand
und lokalen Frontendbuild. Bestehende Installer wurden nicht neu gebaut.
OPS-027 ergänzt [Theorie, Glossar und Quellenlesen](25-Theorie-Glossar.md):
begrenzt lokale Originalauszüge lesen, auch ohne laufendes Qwen; keine neue
öffentliche Dokumentauslieferung oder Speicherung privater Antworten.
Mozilla PDF.js wurde als zusätzliche Bibliothek ausdrücklich genehmigt.
Backend: Node.js ab 22.13, empfohlen 24; CI verwendet Node.js 24.

## Bedienung

1. Unter **Einstellungen → KI und Lernmaterial** eine eigene PDF hinzufügen
   oder im angezeigten privaten Materialordner ablegen. Electron kann genau
   diesen Ordner öffnen; die Schnittstelle akzeptiert keine freien Pfade.
2. **Material aufbereiten / neu einlesen** starten. Fortschritt, Fehler und
   Materialstatus sind unabhängig vom Modellstatus. Abbrechen erhält einen
   noch gültigen Index. Fehlender Text oder teilweise unlesbare Seiten werden
   sichtbar; gescannte PDFs benötigen eine noch nicht verfügbare OCR-Erkennung.
3. Ollama mit installiertem lokalem Qwen starten, Verbindung prüfen und die
   Lernbegleitung aktivieren. Die App lädt keine Modelle herunter.
4. Im Kurs oder nach der festen Quizprüfung die Verwendung eigener Unterlagen
   ausdrücklich auswählen. Diese Auswahl ist standardmäßig aus und wird nicht
   dauerhaft gespeichert. Code-/Elementfreigaben bleiben zusätzlich nötig.
5. Quellen erscheinen als `[S1]` usw. mit neutraler Unterlagenkennung und
   **physischer PDF-Seite**, gezählt ab 1. Gedruckte Seiten können abweichen.
   Es gibt keinen PDF-Download in der App.

Veränderte PDFs erfordern erneutes Einlesen. Änderungen/Entfernen invalidieren
laufende und sichtbare Quellenantworten. Entfernen löscht Index-/Stagingdaten
und importierte Arbeitskopien. Selbst im Materialordner abgelegte Originale
bleiben erhalten und werden anschließend intern vom erneuten Entdecken
ausgeschlossen; bei Bedarf ausdrücklich über „PDF hinzufügen“ erneut importieren.
Die App versucht außerdem, den lokalen Modellkontext zu entladen. Fehlende
Bestätigung durch einen nicht erreichbaren Modelldienst wird sichtbar gemeldet.
Kurs und feste Prüfungen bleiben ohne KI oder eigenes Material nutzbar.

## Datenfluss und Schutzgrenzen

Private PDF → separater lokaler PDF.js-Prozess → begrenzte Seitenabschnitte →
lokaler BM25-Suchindex → höchstens drei passende Abschnitte → lokales Qwen →
Antwort mit geprüften Quellenkennungen. Kein Fine-Tuning, keine Embeddings und
kein zusätzliches Modell erforderlich. Die erste Suche nutzt Wörter und
deutsche Schreibvarianten; sie versteht nicht beliebige Synonyme oder Bedeutung.

Im Entwicklungsprojekt bleibt alles unter `local-rag/`. Installierte Varianten
verwenden das beschreibbare lokale App-Profil außerhalb ihrer Ressourcen.
`material/` enthält Originale/Arbeitskopien, `index/` private Abschnitte und
Suchdaten, `staging/` temporäre PDF-Kopien und Seitentexte. `catalog.json`
verwaltet Versionen/Metadaten und kann private Dateinamen enthalten; auch dieser
Katalog bleibt privat. Die Oberfläche erhält neutrale Dokumentlabels,
Statuswerte und den Materialordner. Antworten bleiben im flüchtigen UI-Zustand.

Die gesamte Ablage außer ihrer neutralen README ist von Git ausgeschlossen.
Paketressourcen beschränken sich auf Backend, öffentlichen Content und gebautes
Frontend. Keine Übernahme in Projektdateiexporte, Konto-Synchronisation oder
öffentliche statische Auslieferung. Private Dateilisten, Parserdetails,
Dokumenttitel und reale Auszüge gehören weder in Logs noch Doku/Chat/Testartefakte.
Git-Ausschluss ist keine Verschlüsselung oder Kontrolle fremder Backupsoftware.

Die lokale Material-API verwendet dieselben Zugriffssperren wie die KI:
direktes Loopback, geprüfter Host/Origin und Anforderungskennung, kein CORS,
`no-store`, kein Service-Worker-Cache. Keine freien Lesepfade und keine
öffentliche Volltext-/Download-Schnittstelle. Öffentliche App-/Contentpfade,
Laufwerkswurzeln und ausbrechende Symlinks/Junctions sind als Ablage gesperrt.
Lernvorschau und Inspektor erhalten keine zusätzlichen Rechte.

PDF.js verarbeitet ausschließlich lokale Bytes und mitinstallierte Assets:
keine PDF-Aktionen/Links/Skripte, kein fetch/Eval oder Abruf externer Ressourcen.
Der separate Prozess erhält kein Entwicklungs-Environment und nur begrenzte
Dateisystemrechte für Parsercode, Bibliotheken und ausgewählte temporäre Dateien.
stdout/stderr werden verworfen. Abbruch/Timeout beendet den Prozess und
bereinigt temporäre Dateien.

Katalog- und Indexaustausch erfolgen atomar. Kurze Windows-Dateisperren und
Katalogwechsel beim Lesen werden begrenzt erneut versucht; der bestätigte
Zielstand wird nie vorher gelöscht. Ein exklusiver Loopback-Port dient als
Prozessmutex, überträgt keine Materialdaten und wird beim Prozessende vom
Betriebssystem freigegeben. Fingerprints prüfen Original/Index vor Retrieval
und nach Generierung. Altversionen werden erst nach erfolgreichem Commit bereinigt.

## Quellen und fachliche Grenzen

Feste Codehinweise und Validatoren haben Vorrang. Fehlende/unpassende Fundstellen
führen zu einer klaren Rückmeldung statt behaupteter Materialantworten.
PDF-Inhalte sind unvertrauenswürdiger Kontext, keine Befehle. Qwen bekommt keine
Datei-, Netzwerk-, Werkzeug- oder Fortschrittsrechte.

Das Modell liefert `answer`, `citations` und `grounded`. Quellenlisten müssen
nichtleer sein und ausschließlich eindeutige tatsächlich übergebene IDs
enthalten. Vorhandene Inlinekennungen müssen genau dazu passen; unbekannte
oder widersprüchliche Kennungen werden abgewiesen. Fehlen lediglich sichtbare
Inlinekennungen, ergänzt der Server Marker aus der geprüften Liste. Label und
Seiten stammen aus dem Index, nicht aus Modellbehauptungen.

Dies prüft die **Quellzuordnung**, keine semantische Beweisführung: Das Modell
kann einen vorhandenen Ausschnitt falsch verstehen oder zu Unrecht als
ausreichend ansehen. Unterlagen können veraltet sein. Tabellen, Spalten und
Bilder werden unter Umständen unvollständig oder in falscher Reihenfolge
extrahiert. Keine automatische Benotung oder Fortschrittsentscheidung.

## Grenzen und Konfiguration

| Grenze | Wert |
|---|---|
| PDFs / Gesamtgröße | 8 / 512 MiB |
| Einzel-PDF / Seiten | 128 MiB / 2500 |
| Text je Seite / insgesamt | 20000 / 12000000 Zeichen |
| Abschnitte / Indexdatei | 16000 / 64 MiB |
| Abschnitt / Überlappung | bis 1000 / 120 Zeichen |
| Quellen pro Anfrage | höchstens 3 |
| Parserprozess | 512 MiB JS-Heap; standardmäßig 120 s |
| Private Modellanfrage | 8192 Kontexttokens; höchstens 384 Ausgabetokens |

| Variable | Standard / Zweck |
|---|---|
| `AZUBIPREP_RAG_DIR` | Projekt-`local-rag/`; installierte Pakete: privates App-Profil |
| `RAG_TIMEOUT_MS` | 120000; maximal 300000 |
| `RAG_CONTEXT_TOKENS` | 8192; maximal 16384 |
| `RAG_LOCK_PORT` | aus kanonischer Ablage abgeleitet; nur bei lokaler Portkollision anpassen |

Materialverwaltung: 90 Anfragen/Minute; Modellhilfe weiterhin 20/Minute und
höchstens eine aktive Generierung. Private Anfragen verwenden `keep_alive:0`,
damit Ollama das Modell anschließend entlädt; die nächste Antwort kann dadurch
länger dauern. Die App führt keinen persistenten Prompt-Cache. Andere Programme
und deren Protokoll-/Backupeinstellungen bleiben außerhalb dieser Grenze;
kein automatisches Löschen fremder Logs.

## Nachweise

Windows 10 x64, Chromium 153, Electron 45.2.0 und lokales Ollama/Qwen gemäß
[OPS-024](23-Qwen-Grundanbindung.md). Synthetische PDFs prüfen echte PDF.js-
Extraktion in Node/Electron, Seitenbezug, BM25, Neustart, Abbruch/Timeout,
Originalerhalt, Quoten, Versionierung, Entfernen, Links und Zugriffssperren.
Große Dateigrößen werden über kontrollierte Dateimetadaten simuliert.
Browserfälle prüfen Zustimmung, Quellenanzeige und Verwerfen alter Antworten;
ein echter Electronlauf prüft Import → Parser → lokaler Modellmock → Entfernen.
Ein synthetischer PDF→Qwen-Lauf mit dem installierten echten Modell bestätigt
die Quellenformatierung. Private Verarbeitung wird ausschließlich durch neutrale
Prüfkennzeichen zu Originalerhalt, Suche, Seitenbezug und Git-Ausschluss belegt.
Keine realen Inhalte oder Modellantworten als Testartefakte veröffentlichen.

Vertiefte didaktische Evaluation, Geräte mit wenig RAM, weitere Plattformen,
semantische Suche, OCR und neue Pakete bleiben separate Schritte.

Abschlussstand: 115 Backendtests/Lint, 12 Desktop-/Webruntimeprüfungen und
37 Browser-/Electronfälle bestanden. Frischer unabhängiger Nachreview ohne
offene Findings; zusätzlich 60 synthetische Lebenszyklen mit 120 Aufbereitungen
einschließlich Neustart, Retrieval, Versionsinvalidierung und Löschung grün.
Produktionsabhängigkeiten im aktuellen Lockfile: `npm audit --omit=dev` ohne Befunde.

Technische Primärquellen:
[PDF.js-API](https://mozilla.github.io/pdf.js/api/draft/module-pdfjsLib.html),
[lokales Node-Beispiel](https://github.com/mozilla/pdf.js/blob/master/examples/node/getinfo.mjs),
[Ollama Chat](https://docs.ollama.com/api/chat).
