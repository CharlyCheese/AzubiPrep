# Frontendkurs und lokale Qwen Lernbegleitung

Stand: 30.10.2026. Für Kapitel 1–6 ist ein erster lokaler Webprototyp unter
`/frontendkurs` implementiert: elf Lektionen, Mehrdatei-Editor, externe Projekte,
HTML/CSS-Vorschau, Prüfung und OPFS-Sicherung. Desktop 0.1.3 ergänzt native
Dateiauswahl, vom internen Port unabhängigen Kursspeicher und isoliertes F12.
Die [Pilotabnahme](21-Frontendpilot-Abnahme.md) steht bei 30/30 innerhalb der
dort dokumentierten Windows-/Chromium-/Electron-Matrix; Testgrenzen bleiben ausgewiesen.
[Technik und Nachweise](22-Frontendpilot-Technik.md).
OPS-024 ergänzt die optionale lokale Qwen-Grundanbindung im Entwicklungsstand:
Einstellungen, Hinweise, Prüfer-/Elementerklärungen und Quizhilfe.
[Einrichtung, Grenzen und Nachweise](23-Qwen-Grundanbindung.md).
OPS-026 ergänzt lokale PDF-Aufbereitung und eine erste begrenzte RAG-Suche
mit Quellenbezug: [Bedienung und Grenzen](24-Lokales-RAG.md).
Der vollständige Kurs und aktives Lern-JavaScript bleiben geplante Ausbaustufen.
Dieses Dokument erhält deren abgestimmte Richtung.

## Ziel und Abschlusskompetenzen

Ein deutschsprachiger Praxiskurs führt ohne Vorkenntnisse schrittweise bis zur
selbstständigen Frontend-Entwicklung auf Junior-Niveau. HTML, CSS und JavaScript
bilden die Grundlage; Werkzeugkenntnisse, Qualitätssicherung, TypeScript und
React ergänzen den vollständigen Lernpfad. Ein Kursabschluss garantiert weder
eine Beschäftigung noch ersetzt er Berufserfahrung.

| Bereich | Nachweisbare Kompetenz am Ende |
|---|---|
| HTML | Inhalte semantisch strukturieren und zugängliche Formulare erstellen |
| CSS | Responsive Layouts entwickeln und Darstellungsfehler systematisch beheben |
| JavaScript | Probleme in Funktionen und Datenstrukturen zerlegen; verständlichen Code schreiben |
| Browser | DOM, Ereignisse, Formulare, Speicherung und asynchrone Abläufe einsetzen |
| Daten | APIs anbinden; Lade-, Leer- und Fehlerzustände berücksichtigen |
| Barrierefreiheit | Tastaturbedienung, Labels, Fokus und grundlegende Zugänglichkeit prüfen |
| Qualität | Tests schreiben, Fehler eingrenzen, Sicherheitsprobleme erkennen und Verbesserungen begründen |
| Werkzeuge | Entwicklerwerkzeuge, Git, Projektstruktur, Entwicklungs- und Buildprozess verwenden |
| TypeScript und React | Eine typisierte Anwendung mit Komponenten, Zustand und Navigation entwickeln |
| Selbstständigkeit | Anforderungen verstehen, Dokumentation nutzen, ein Projekt planen, überarbeiten und veröffentlichen |

## Didaktik und Voraussetzungen

Boot.dev dient als methodische Orientierung für den Wechsel zwischen kurzen
Erklärungen, interaktiven Übungen und Projekten. Kursinhalte, Aufgaben und
Gestaltung werden eigenständig entwickelt.

Jede Einheit führt möglichst einen neuen Gedanken ein:

1. Lernziel und bereits eingeführte Voraussetzungen nennen.
2. Kurze Erklärung und nachvollziehbares Beispiel geben.
3. Ergebnis oder Verhalten vorhersagen lassen.
4. Eine geführte Änderung ausprobieren lassen.
5. Eine selbstständige Aufgabe mit verständlicher Prüfung anbieten.
6. Hinweise schrittweise konkreter machen; Musterlösung bewusst abrufbar halten.
7. Frühere Kenntnisse mit einer Wiederholungs- oder Transferaufgabe aufgreifen.

Keine Aufgabe verlangt unangekündigt neue Syntax, Hilfsfunktionen oder Werkzeuge.
Vorbereitete Bestandteile werden als solche erklärt; ihre spätere Einführung
wird benannt. Für jede Einheit werden vor der Erstellung Lernziele,
Voraussetzungen und überprüfbare Abnahmekriterien zugeordnet. Kapitel sind
Planungseinheiten mit mehreren kurzen Lektionen, keine einzelnen langen Texte.

## Kapitelplan

Die Reihenfolge ist der Ausgangspunkt für die detaillierte Lernzielplanung.
Jedes Kapitel enthält praktische Übungen und eine kleine Anwendung; größere
Projekte bilden zusätzliche Meilensteine. Barrierefreiheit und Sicherheit
beginnen früh und werden später vertieft.

Für den Einstieg orientiert sich die Lernfolge am schrittweisen Aufbau einer
Website wie bei SELFHTML. W3Schools ergänzt kleine Übungen und Nachschlagebedarf;
MDN und Standards dienen dem fachlichen Abgleich. Die Reihenfolge bleibt ein
eigener Kursplan. CSS beginnt nach einer sinnvollen HTML-Grundlage, Formulare
folgen nach den ersten Layoutprojekten. Eine vollständige HTML-Referenz muss
nicht vor den ersten Gestaltungsaufgaben abgearbeitet werden.

| Nr. | Inhalt | Praktisches Ergebnis |
|---:|---|---|
| 1 | Editor, Dateien, Vorschau; Aufgaben von HTML, CSS und JavaScript | Erste sichtbare Seite verändern |
| 2 | HTML-Elemente, Attribute und Verschachtelung | Vorstellungsseite |
| 3 | Überschriften, Absätze, Listen, Links, Bilder, relative Pfade | Mindestens zwei verlinkte HTML-Seiten mit Unterordnern |
| 4 | Dokumentaufbau, semantisches HTML, Elemente untersuchen | Sinnvoll gegliederte Website |
| 5 | Externe CSS-Datei einbinden, einfache Selektoren/Klassen, Farben und Schrift | Bekannte HTML-Seiten gemeinsam gestalten |
| 6 | Projekt 1: Informationswebsite | Mehrseitige Website mit gemeinsamer CSS-Datei nach Anforderungen |
| 7 | CSS-Selektoren vertiefen, Kaskade, Vererbung, Spezifität | Gestaltung erklären und widersprüchliche Regeln untersuchen |
| 8 | Farben, Typografie, Einheiten, Boxmodell, Überlauf | Lesbare Inhalts- und Kartenansichten |
| 9 | Dokumentfluss, Display, Flexbox, Layoutdiagnose | Navigation und Kartenlayout |
| 10 | Grid und Positionierung mit sinnvollen Einsatzgrenzen | Strukturierte Übersichtsseite |
| 11 | Responsive Gestaltung, Media Queries, Fokus, reduzierte Bewegung | Mobil nutzbare Oberfläche |
| 12 | Projekt 2: Responsive Website | Neuen Entwurf selbstständig umsetzen |
| 13 | Formulare, Labels, Eingabetypen, native Validierung | Zugängliches Formular in die bekannte Website einbauen |
| 14 | Externe JavaScript-Datei einbinden, Konsole, Werte, Variablen, Typen, Operatoren | Berechnungen mit Ausgabe |
| 15 | Strings, Vergleiche, Bedingungen, Eingabeumwandlung | Tarif- oder Preisrechner |
| 16 | Funktionen, Parameter, Rückgabewerte, Gültigkeitsbereiche | Rechner in überprüfbare Bausteine zerlegen |
| 17 | Arrays, Schleifen, Objekte | Produkte oder Aufgaben verarbeiten |
| 18 | Array-Methoden, Callbacks, Fehlermeldungen, Breakpoints | Daten filtern und umformen; Fehler beheben |
| 19 | Projekt 3: JavaScript-Datenwerkstatt | Auswertung nach Aufgabenbeschreibung entwickeln |
| 20 | DOM auswählen, Inhalte sicher verändern, Elemente erzeugen/entfernen | Dynamische Listenansicht |
| 21 | Ereignisse, Formularverarbeitung, eigene Validierung | Bedienbare Eingabemaske |
| 22 | Zustand, Darstellung, JSON, lokale Speicherung | Aufgabenliste mit gespeichertem Zustand |
| 23 | Projekt 4: Interaktive Anwendung | Aufgaben- oder Lernplanverwaltung |
| 24 | Promises, async/await, HTTP, fetch, Fehlerbehandlung | Daten einer vorbereiteten API laden |
| 25 | Projekt 5: Datenanwendung | Suche/Filter mit Lade-, Leer- und Fehlerzuständen |
| 26 | ES-Module, Git, Paketverwaltung, Buildprozess | Bekanntes Mehrdateiprojekt modularisieren und nachvollziehbar organisieren |
| 27 | Automatische Tests, Barrierefreiheit, sichere DOM-Nutzung, Performance | Anwendung prüfen und überarbeiten |
| 28 | Projekt 6: Qualitätsauftrag | Fremde fehlerhafte Anwendung verbessern und Änderungen erklären |
| 29 | TypeScript: Typen, Objekte, Vereinigungen, Eingrenzung, Funktionen | Bekanntes Projekt schrittweise typisieren |
| 30 | React: Komponenten, Props, Zustand, Formulare, Effekte, Routing | Größere Anwendung in geführten Etappen |
| 31 | Selbstständiges Abschlussprojekt | Planung, Umsetzung, Tests, Dokumentation und Veröffentlichung |

Insbesondere Kapitel 26–30 werden in mehrere aufeinander aufbauende
Unterkapitel zerlegt. Benötigte Werkzeuge werden vor ihrer Verwendung erklärt.
Konkrete Aufgabenzahlen, Bearbeitungszeiten und Kapitelabnahmen sind noch offen.
Die zusätzliche spätere Formulareinführung ergibt insgesamt 31 Kapitel;
die sieben großen Projektmeilensteine einschließlich Abschlussprojekt bleiben
erhalten. Mehrere Dateien werden bereits in den ersten HTML-/CSS-Kapiteln
verwendet, nicht erst bei ES-Modulen oder React.

## Projekte und Kompetenznachweise

Regelmäßige Bau-, Änderungs- und Fehlersuchaufgaben gehören in jedes Kapitel.
Bekannte Projekte werden später erweitert: HTML-Website um CSS und responsive
Layout, Rechner um eine Oberfläche, Aufgabenverwaltung um Speicherung und
simulierte Datenanbindung, anschließend Tests und TypeScript. Neue
Aufgabenstellungen prüfen zusätzlich den Transfer auf unbekannte Probleme.

Die Hilfestellung nimmt stufenweise ab:

| Abschnitt | Unterstützung |
|---|---|
| Einstieg | Vorbereitete Dateien, kleine Schritte, konkrete Zwischenziele |
| Mittlerer Teil | Anforderungen und Teilaufgaben; eigene Umsetzungsplanung |
| Fortgeschritten | Anforderungen, Beispieldaten und Abnahmekriterien |
| Abschluss | Eigenständige Planung, Umsetzung und anschließende Überarbeitung |

Bestandene Einzeltests allein belegen keine vollständige Kompetenz. Projekte
verlangen auch nachvollziehbare Entscheidungen und selbstständige Fehlersuche.
Eine angezeigte Musterlösung zählt nicht automatisch als Kompetenznachweis.
Die genaue Fortschritts- und Wiederholungslogik wird noch geplant.

## Externer Projektmodus und frühe Mehrdateiprojekte

Projekte können wahlweise innerhalb der App oder in einem frei gewählten Editor
wie Notepad++, VS Code oder einem anderen Werkzeug bearbeitet werden. Beide
Wege verwenden dieselben Aufgaben, Kompetenzziele und Abnahmekriterien.
Kleine Einstiegsübungen bleiben bequem im eingebauten Editor lösbar. Sobald
die erste zweite Datei angelegt wird, ist auch externe Bearbeitung samt
Ordner-/Dateiübernahme verfügbar. Im aktuellen Kapitelplan ist das Kapitel 3:
Ein Link wie `<a href="ueber-uns.html">Über uns</a>` verweist auf die zweite
HTML-Seite. Der Wechsel darf nicht erst beim ersten großen Projekt oder bei
CSS beginnen. Nötige Dateikenntnisse und Auswahl-/Einleseschritte werden direkt
vor dieser ersten Mehrdateiübung erklärt. Wird eine zweite Datei im Detailplan
früher eingeführt, beginnt der externe Modus entsprechend früher.

Mehrdateiprojekte sind eine frühe Grundanforderung für Editor, Import,
Validator und Vorschau. Ab Kapitel 3 sind zwei verlinkte HTML-Seiten vorgesehen,
ab Kapitel 5 eine gemeinsam verwendete externe CSS-Datei und ab Kapitel 14
eine externe JavaScript-Datei. Bilder und Unterordner gehören ebenfalls dazu.
Alle Inhalte in ein einzelnes HTML-Dokument einzubetten ist keine Voraussetzung
für die Abgabe. Eine mögliche Struktur entwickelt sich schrittweise:

```text
mein-projekt/
  index.html
  ueber-uns.html
  css/
    style.css
  js/
    script.js       (erst ab der JavaScript-Einführung)
  bilder/
    beispiel.png
```

Dateinamen sind Beispielwerte, keine pauschale Bewertungsvorgabe. Relative
Verweise zwischen HTML, CSS, JavaScript und Bildern sowie Navigation zwischen
den eingereichten HTML-Seiten müssen im isolierten Projektkontext funktionieren.
Der Dateibaum zeigt die vorhandenen Dateien; die Startseite ist je Aufgabe
vorgegeben oder auswählbar. Pfadfehler werden als Lernrückmeldung angezeigt.

Geplanter Ablauf:

1. Anforderungen und Prüfkriterien ansehen; optional Startdateien herunterladen.
2. Im eigenen Editor oder in der App arbeiten und die Darstellung ausprobieren.
3. Projektordner oder zusammengehörige Dateien ausdrücklich auswählen.
4. Eingelesenen Dateibaum, Startseite und Browser-Vorschau kontrollieren.
5. Prüfung für genau diesen eingelesenen Stand starten.
6. Rückmeldung mit relativem Dateipfad, soweit möglich Zeile und Erklärung erhalten.
7. Im gewählten Editor verbessern und über „Neu einlesen und prüfen“ erneut abgeben.

Zunächst wird ein unveränderlicher eingelesener Projektstand geprüft. Jede
Abgabe erhält einen eindeutigen Standbezug; nach externen Änderungen bleiben
alte Ergebnisse dem alten Stand zugeordnet, bis neu eingelesen und geprüft wird.
Keine automatische Überwachung und keine Änderungen an Originaldateien im
ersten Umfang. Ein erneutes Einlesen ersetzt nur die Prüfvorschau und erzeugt
eine neue Bewertung. Dauerhafte Ordnerfreigabe und automatische Aktualisierung
sind mögliche spätere Komfortfunktionen, abhängig von Berechtigungen.

Desktop: Ordner über den nativen Auswahldialog freigeben. Web: Ordner-/Dateiauswahl
im Browser; Unterordner und relative Pfade erhalten. Ein eingetippter lokaler
Pfad allein gibt der Webversion keinen Dateizugriff. Falls ein Browser keine
geeignete Ordnerauswahl unterstützt, muss die Dateiübernahme die relativen
Zuordnungen ausdrücklich erhalten oder abfragen; ein flacher Import darf
gleichnamige Dateien verschiedener Ordner nicht still überschreiben.

Einreichen in der lokalen Anwendung ist keine öffentliche Veröffentlichung.
Der konkrete Verarbeitungsort wird angezeigt; ein späterer gehosteter Modus
muss eine Übertragung an den Server ausdrücklich kenntlich machen. Auswahl
und Import beschränken sich auf relevante Projektdateien. `.git`, `.env*`,
`node_modules`, private RAG-Ablagen und andere nicht benötigte Daten werden
ausgeschlossen. Dateitypen, Anzahl und Größen werden begrenzt; absolute Pfade,
Verzeichniswechsel außerhalb der Freigabe und ausbrechende Datei-/Ordnerlinks
werden abgewiesen. Es wird nicht der gesamte Rechner durchsucht.

Eingereichte Dateien sind nicht vertrauenswürdig. Die Prüfung liest Quelltext;
ausführbare Vorschauen verwenden dieselbe Abschirmung wie der interne Modus.
Keine automatische Ausführung von Installations-, Paket-, Start- oder
Buildskripten aus eingereichten Projekten. Für spätere TypeScript-/React-Projekte
ist eine kontrollierte Buildstrategie gesondert festzulegen. Qwen erhält nur
relevante ausgewählte Codeausschnitte und Prüfergebnisse dieses Projektstands,
keinen allgemeinen Ordner- oder Rechnerzugriff.

## Editor, Browseransicht und Inspektor

- Echte Browser-Vorschau ab der ersten HTML-Lektion, direkt neben dem Editor.
- Früher Dateibaum mit mehreren HTML-Seiten, externer CSS-Datei und später
  JavaScript/Bildern; Dateireiter statt eines einzigen großen Eingabefelds.
- Auswahl der Projektstartseite und Navigation zwischen Projektseiten;
  interne und extern eingelesene Projekte nutzen dieselbe Vorschau/Prüflogik.
- HTML/CSS nach kurzer Eingabepause aktualisieren; JavaScript zunächst bewusst
  über Ausführen starten, mit Stoppen und Zurücksetzen.
- Vorschaugrößen für Handy, Tablet und Desktop.
- Konsolenfehler und Prüfergebnisse mit Bezug zur passenden Codezeile.
- Einfacher eingebauter Inspektor: Element auswählen, zugehörige CSS-Regeln,
  berechnete Werte und Boxmodell ansehen.
- Vollständige Entwicklerwerkzeuge schrittweise lehren: Elemente/Styles,
  Konsole, Breakpoints und schließlich Netzwerkanalyse.

Ziel für Electron ist ein gezieltes Öffnen der Entwicklerwerkzeuge des eigenen
Vorschauinhalts, etwa über F12 oder einen Inspect-Button. In der Webversion
öffnet F12 browserabhängig die Entwicklerwerkzeuge der gesamten Seite; die
Vorschau muss dort als Kontext ausgewählt werden. Der eingebaute Inspektor
bildet die gemeinsame Grundlage. Eine identische F12-Oberfläche in beiden
Varianten ist nicht zugesagt. Technische Machbarkeit und Abschirmung sind vor
der Implementierung gemeinsam zu prüfen.

## Validator und fachliche Qualität

Der Validator unterscheidet Syntaxprobleme, Aufgabenerfüllung und zusätzliche
Verbesserungshinweise. HTML/CSS-Aufgabenprüfungen werden nicht als vollständige
Standardvalidierung ausgegeben. Unterschiedliche richtige Lösungen müssen
akzeptiert werden; ein reiner Textvergleich mit einer Musterlösung reicht nicht.
Prüfungen dürfen keine späteren Kenntnisse voraussetzen.

Jede Lektion erhält konkrete Quellen, Prüfdatum und einen unabhängigen
fachlichen/didaktischen Review. Beispiele und Musterlösungen werden ausgeführt;
Validatoren mit alternativen richtigen Lösungen und typischen Fehlern geprüft.
Sprachregeln, Empfehlungen und didaktische Vereinfachungen werden ausdrücklich
unterschieden. Vorschläge der KI ersetzen diese Prüfung nicht.

## Sicherheit der Lernumgebung

Schutzziel: Ausgeführter Lerncode darf seine Übungsfläche verändern, aber keine
Rechte auf Hauptanwendung, Lerndaten, Rechner oder andere lokale Dienste erhalten.
Der Validator ist keine Sicherheitsgrenze.

- Getrennte Ausführung ohne Node-/Electron-, Dateisystem- oder Terminalzugriff.
- Kein Zugriff auf Speicher oder Anmeldedaten der Hauptanwendung.
- Keine freien Netzwerkzugriffe, einschließlich lokaler Dienste und Ollama.
- Navigation aus der Übung, neue Fenster und Downloads technisch einschränken.
- Nur eng begrenzte, geprüfte Nachrichten zwischen Übung und Hauptanwendung.
- Ausführungszeit, Speicher und Ausgabemenge begrenzen; Endlosschleifen und
  Wiederherstellung durch Stoppen/Zurücksetzen berücksichtigen.
- Isolierte Übungsspeicherung und kontrollierte Trainings-APIs vorsehen, damit
  Speicherung und fetch unterrichtet werden können, ohne App-Daten freizugeben.
- Entwicklerwerkzeuge dürfen die Übung nicht mit zusätzlichen App-Rechten ausstatten.

Konkrete Technik ist noch offen. Eine begrenzte JavaScript-Laufzeit kann für
Grundlagen sinnvoll sein; der vollständige Kurs benötigt echte Browser-/DOM-
Funktionen. Ein iframe allein wird nicht als vollständiges Sicherheitskonzept
behandelt. Vor Auslieferung ausführbaren Lerncodes sind Electron-Aktualisierung,
Bedrohungsmodell und Ausbruch-/Ressourcentests einzuplanen.

Eine absolute Ausbruchsgarantie ist nicht zugesagt. Schutz gegen Lerncode ist
von absichtlichen Änderungen durch den Besitzer des Rechners an eigenen Dateien
oder lokalen Ergebnissen zu unterscheiden. Lokale Lernnachweise sind keine
manipulationssichere Zertifizierung.

## Gemeinsame lokale Qwen Anbindung

Qwen unterstützt seit OPS-024 optional den Pilotkurs und Quiz-Erklärungen
über eine gemeinsame lokale Schnittstelle. Der bestehende Backlogpunkt OPS-003
dokumentiert weitere Ausbaustufen. qwen3:4b über Ollama wurde am 31.10.2026
als vorhandene lokale Testgrundlage geprüft. Kurs und feste Aufgabenprüfungen bleiben
auch ohne KI nutzbar. Dies ist keine zusätzliche Zusage vollständiger
Offline-Fähigkeit der gesamten Anwendung.

Geplante Reihenfolge der KI-Fähigkeiten:

1. Geprüfte Inhalte erklären und Denkanstöße geben.
2. Fehler und Validatorergebnisse verständlich erläutern.
3. Lösungen anhand festgelegter Kriterien besprechen.
4. Erst nach ausreichender Evaluation fortschrittsrelevante Bewertungen unterstützen.

Die gemeinsame Schnittstelle übergibt nur aufgabenbezogene Daten: aktuelle
Lektion/Frage, eingeführte Kenntnisse, eingereichten Code und Prüfergebnisse.
Für „Warum sieht das so aus?“ kommen ausgewähltes Element, relevante CSS-Regeln,
berechnete Werte und eine ausgewählte Fehlermeldung infrage. Qwen erhält lesbare
Ausschnitte, keine selbstständige Steuerung von Entwicklerwerkzeugen oder Rechner.

Keine Werkzeuge zum Ausführen von Befehlen, Ändern von Programmdateien oder
eigenmächtigen Handeln. Code, Kommentare und Modellantworten sind als
unvertrauenswürdige Daten zu behandeln. Qwen bleibt beim aktuellen Lernniveau,
kennzeichnet Unsicherheit und liefert Hinweise vor vollständigen Lösungen.
Feste Validatoren bleiben für objektiv prüfbare Aufgaben maßgeblich; eine
KI-Antwort darf eine tatsächlich richtige Lösung nicht allein durchfallen lassen.

Geprüfte eigene Kursinhalte sollen als Wissensgrundlage dienen. Zusätzlich
ist RAG über eigene lokale PDF-Ausbildungsunterlagen seit OPS-026 als lokale
lexikalische Suche implementiert; das Material
wird zur Laufzeit abschnittsweise als Kontext abgerufen, nicht als Fine-Tuning
in die Modellgewichte übernommen. Dies ergänzt OPS-003. Modellverteilung,
Ressourcenprofile für weitere Zielgeräte und Lizenz-/Verteilungsfragen sind
weiter offen; lokaler Dienstzugang und begrenzte Kontext-/Antwortformate sind
in [OPS-024](23-Qwen-Grundanbindung.md) implementiert. Die Anbindung ist eine
freiwillige Erprobung, keine Freigabe für fortschrittsrelevante KI-Bewertung.

## Eigene PDF Materialien für RAG

Private Ausbildungsbücher werden nicht auf GitHub veröffentlicht oder mit der
App verteilt. Andere Anwender stellen ihr eigenes Material bereit. Geprüfte
öffentliche Kursinhalte und private Wissensbestände bleiben getrennt.

Im Entwicklungsprojekt ist `local-rag/material/` als Ablage erstellt. Die
gesamte Ablage `local-rag/` wird von Git ausgeschlossen, ausgenommen die neutrale
[Anleitung](../local-rag/README.md). Diese Ausnahme darf keine Buchinhalte,
privaten Dateilisten oder Auszüge enthalten. Extrahierte Texte, OCR-Ergebnisse,
Chunks, Embeddings, Suchindex, Quellmetadaten und Zwischenspeicher bleiben
ebenfalls ausschließlich in der privaten Ablage. Die ausdrückliche lokale
Aufbereitung erstellt einen privaten Seiten-/Suchindex. `.gitignore` ist keine Verschlüsselung;
Dateien außerhalb der Ablage oder bereits versionierte Dateien sind dadurch
nicht geschützt. Die Ablage darf nicht erzwungen zu Git hinzugefügt werden.

Aktuelle Buildressourcen beschränken sich auf Backend, öffentlichen Content
und gebautes Frontend; der private Ordner liegt außerhalb davon. Künftige
Builds, Exporte, Diagnosedaten, Synchronisation und Supportpakete müssen sowohl
Originalmaterial als auch abgeleitete private Daten ausschließen. Persönliche
Unterlagen dürfen nicht als Ersatz für öffentliche Kursinhalte veröffentlicht
werden. Eine Vorschau oder eine Lerncode-Ausführung erhält keinen Zugriff auf
die RAG-Dateien oder den Modell-Dienst.

Für installierte Web-/Desktop-Pakete ist ein beschreibbarer lokaler
Benutzerdatenordner außerhalb des Installationsverzeichnisses implementiert.
Der tatsächliche Pfad wird in der Oberfläche angezeigt und kann in der
Electron-Desktopoberfläche über eine Aktion geöffnet werden. Eine Browser-Dateiauswahl kann PDFs über
den kontrollierten lokalen Anwendungsdienst importieren. Konkrete Pfadwahl,
Konfiguration und sichere Import-Endpunkte sind in [OPS-026](24-Lokales-RAG.md) beschrieben.
Anwender benötigen weder GitHub noch einen Terminalbefehl zur Einrichtung.

Implementierte Oberfläche: „Einstellungen → KI und Lernmaterial“ mit
„PDF hinzufügen“, „Materialordner öffnen“ (Electron), „Material aufbereiten“,
„Neu einlesen“ und „Material entfernen“. Statuswerte unterscheiden
„kein Material“, „wird verarbeitet“, „bereit“, „erneut einzulesen“ und
„Fehler“. Nicht erreichbares Ollama/Modell wird getrennt vom Materialstatus
angezeigt. Beim Entfernen sind auch zugehörige Auszüge, Indexeinträge und
Zwischenspeicher zu entfernen; die Löschung ursprünglich ausgewählter Dateien
außerhalb der App-Ablage ist damit nicht automatisch beauftragt.

Vorgesehener Hinweis bei leerer Wissensablage:

> Für Antworten aus deinen eigenen Ausbildungsunterlagen füge hier eine PDF
> hinzu. AzubiPrep liefert keine privaten Fachbücher mit. Über „PDF hinzufügen“
> wählst du dein Material aus; „Materialordner öffnen“ zeigt den Ablageort auf
> diesem PC. Starte anschließend „Material aufbereiten“. Kurs und feste
> Aufgabenprüfungen kannst du auch ohne eigene Unterlagen nutzen.

Implementierter Verarbeitungsablauf: PDF prüfen, Text mit Seitenbezug extrahieren,
in geeignete Abschnitte zerlegen, lokal indexieren, zur Anfrage passende
Abschnitte suchen und an Qwen übergeben. OCR für gescannte PDFs ist gesondert
zu prüfen. Die erste Suche nutzt BM25 ohne zusätzliches Embedding-Modell.
Semantische Suche bleibt ein gesonderter Ausbau. Verarbeitung und Modellanfragen
bleiben lokal; auch ein späteres Embedding-Verfahren muss lokal bleiben. Keine
automatische Übertragung an externe KI-Dienste. Dokumenttexte sind Inhalte,
keine ausführbaren Anweisungen an die Anwendung oder die KI.

Antworten sollen die verwendete Quelle mit Dokument und Seite angeben, soweit
die Extraktion einen verlässlichen Bezug ermöglicht. Fehlende Fundstellen,
schlechte Texterkennung und widersprüchliche oder veraltete Buchinhalte müssen
erkennbar bleiben. Ein Buch mit Ausbildungsinhalten ersetzt weder aktuelle
Webstandards noch die unabhängige Kursprüfung. Antworten ohne passende Quelle
dürfen nicht als durch das Buch belegt erscheinen.

## Ergänzende Anforderungen an Lernbetrieb und Qualität

Die folgenden zehn Punkte ergänzen den Kapitelplan. Die Umsetzung erfolgt
entsprechend dem jeweiligen Kursabschnitt; konkrete Pilotkriterien stehen in
der [Abnahmeliste des Frontendpiloten](21-Frontendpilot-Abnahme.md).

1. **Mehrdateien im technischen Pilot:** Zwei verlinkte HTML-Seiten, gemeinsame
   externe CSS und ein Bild müssen bereits intern und extern durchgängig
   funktionieren. Eine einzelne HTML-Vorschau reicht als Pilotnachweis nicht.
2. **Faire und korrigierbare Prüfergebnisse:** Jede Aufgabe trennt Pflicht,
   ausdrücklich verlangte Technik und Empfehlungen. Alternative richtige
   Lösungen sind zu prüfen. Ein Meldeweg für fragwürdige Bewertungen und ein
   dokumentierter Umgang mit blockierenden Prüferfehlern sind vorzusehen.
3. **Grenzen automatischer Gestaltungsprüfung:** Funktions-/Strukturtests werden
   mit Selbstprüfung und später qualitativer KI-Rückmeldung verbunden.
   Pixelgleichheit gilt nur bei ausdrücklich entsprechender Aufgabenstellung.
   Tastaturbedienung, passende Alternativtexte und sinnvolle Abläufe werden
   zusätzlich manuell geprüft; ein grüner Automatentest bescheinigt keine
   vollständige Barrierefreiheit.
4. **Unterstützung und Verständnis unterscheiden:** Bearbeitung, Hinweise,
   Musterlösungsaufruf und später selbstständiger Transfer werden getrennt
   erfasst. Hilfe kostet keine Strafpunkte. Veränderte Transferaufgaben,
   Wiederholungen mit Abstand und Standortbestimmungen vor größeren Projekten
   ergänzen die Kompetenznachweise; eine Musterlösung schließt sie nicht ab.
5. **Lokale Entwicklungsumgebung erklären:** Datei-/Ordnerkenntnisse werden
   früh eingeführt. Vor ES-Modulen und relevanten API-Übungen folgen file://
   gegenüber localhost, Zweck/Start/Stop eines Entwicklungsservers, Ports und
   typische Fehler. Die App kann unterstützen, setzt aber keinen bestimmten
   Editor voraus. Keine pauschale Zusage, alle Projekte funktionierten per
   Doppelklick auf eine HTML-Datei.
6. **Abschirmung und fortgeschrittene Projekte zusammen planen:** Speicherung,
   Trainings-APIs, ES-Module und Framework-Builds benötigen ausdrückliche
   Freigaben innerhalb der Lernumgebung. Keine automatische Ausführung fremder
   Paket-/Installationsskripte. Vor jeder Erweiterung konkrete Ressourcen-,
   Netzwerk- und Ausbruchtests; sichere Vorgaben gelten auch nach Import.
7. **Verlässliche Sicherung eigener Arbeit:** Interne Entwürfe brauchen
   automatische Sicherung mit sichtbarem Ergebnis, Wiederherstellung nach
   Neustart, gezieltes Zurücksetzen und vollständigen Projektdateiexport.
   Externe Originale bleiben unangetastet. Projekte/Bilder und RAG-Indizes
   werden nicht im bisherigen localStorage untergebracht; ein separates
   versioniertes Speicherkonzept ist vor Implementierung festzulegen.
8. **Eigene Abnahme der KI:** Ein fester Evaluationsbestand enthält richtige
   Alternativlösungen, Anfängerfehler, unvollständige Aufgaben, widersprüchliche
   Quellen und fehlende Fundstellen. Hinweise sollen auf Lernniveau bleiben
   und Lösungen nicht vorschnell vorwegnehmen. Antwortzeit, Speicherbedarf,
   lange Projekte und Ausfallverhalten werden am vorgesehenen Gerät gemessen.
   Anweisungen in PDF-Texten und Codekommentaren werden als Angriffsfälle geprüft.
9. **Versionen und Standbezug:** Aufgaben, Bewertung und Abgaben erhalten
   Versionen. Alte Ergebnisse bleiben ihrem damaligen Regel-/Dateistand
   zugeordnet; eine Regeländerung entwertet keine frühere Leistung still.
   Qwen erklärt ausdrücklich den ausgewählten eingelesenen Projektstand.
10. **Zugängliche Arbeitsoberfläche:** Aufgabe, Editor, Vorschau, Dateibaum,
    Prüfung und spätere KI-Begleitung müssen auf kleinen Laptops bedienbar
    bleiben. Wechselbare Ansichten ergänzen geteilte Layouts. Tastaturzugang,
    Zoom, anpassbare Schrift und verständliche Statusmeldungen ohne reine
    Farbcodierung gehören zur Abnahme der Lernumgebung selbst.

## Vereinbarte Reihenfolge und offene Planung

1. Gemeinsame Grundlage und KI-Schnittstelle planen: Kontext, Datenumfang,
   Befugnisse und Sicherheitsgrenzen definieren.
2. Einen vollständigen HTML-/CSS-Pilotabschnitt bis zum ersten Projekt bauen:
   Editor, frühe Mehrdateien/externer Modus, Vorschau, Validator und Übungen
   nach der [Pilotabnahme](21-Frontendpilot-Abnahme.md).
3. Qwen zentral anbinden und am Pilotabschnitt sowie bestehenden Prüfungsfragen
   erproben, bevor der ganze Kurs ausgearbeitet wird.
4. Richtigkeit, Didaktik, Lernniveau, Antwortzeiten, Ressourcenbedarf, Sicherheit
   und Verhalten ohne verfügbares Modell prüfen.
5. Kurs ausbauen und Begleitung auf weitere Anwendungsbereiche übertragen.

Der Pilot der Kapitel 1–6 wurde in FE-022 implementiert und bis OPS-023 im
dokumentierten Windows-/Chromium-/Electron-Umfang abgenommen. Die private
Materialablage mit Git-Ausschluss wurde in OPS-026 um lokale PDF-Aufbereitung,
lexikalische RAG-Suche und Quellenbelege erweitert.
Die lokale Qwen-Grundanbindung wurde zuvor in OPS-024 umgesetzt.
Offen sind insbesondere semantische Suche/OCR, vertiefte KI-Evaluation,
weitere Plattformnachweise, weitere Kursinhalte,
kontrollierte Builds späterer Framework-Projekte, Fortschrittsmodell, erlaubte
Trainings-APIs sowie weitere KI-Ausbaustufen und deren Evaluation. Neue
Abhängigkeiten werden nicht durch diesen Plan automatisch freigegeben.

## Referenzen

Referenzstand: 30.10.2026. Bei Erstellung einer Lektion sind die konkreten
Quellabschnitte und ihr Prüfdatum zusätzlich zu dokumentieren.

- [Boot.dev](https://www.boot.dev/courses): methodische Orientierung für Übungen und Projekte.
- [SELFHTML](https://wiki.selfhtml.org/): deutschsprachige Grundlagen, Kurse und Nachschlageartikel.
- [W3Schools](https://www.w3schools.com/): ergänzende Beispiele und interaktives Ausprobieren.
- [MDN Curriculum](https://developer.mozilla.org/en-US/curriculum/): fachlicher Rahmen und Abschlusskompetenzen.
- [WHATWG HTML](https://html.spec.whatwg.org/), [W3C CSS](https://www.w3.org/Style/CSS/), [ECMAScript](https://tc39.es/ecma262/): Detailklärung anhand von Spezifikationen; Entwurfsstatus und Browserunterstützung beachten.
- [MDN iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe): Vorschau-Berechtigungen und Einschränkungen.
- [Electron Sicherheit](https://www.electronjs.org/docs/latest/tutorial/security/) und [webContents](https://www.electronjs.org/docs/latest/api/web-contents/): Sicherheitsprüfung und gezielte Entwicklerwerkzeuge.
- [QuickJS Emscripten](https://github.com/justjake/quickjs-emscripten): untersuchte Option für begrenzte JavaScript-Ausführung, keine festgelegte Abhängigkeit.
- [Browser-Ordnerauswahl](https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement/webkitdirectory), [Verzeichniszugriff](https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker) und [Electron Dialoge](https://www.electronjs.org/docs/latest/api/dialog): Grundlagen für externe Projekte; Browser-/Berechtigungsunterschiede beachten.
- [W3C Barrierefreiheitsprüfung](https://www.w3.org/WAI/test-evaluate/): Grenzen automatischer Prüfungen.
- [MDN JavaScript-Module](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules): Voraussetzungen lokaler Modultests.
- [OWASP RAG-Sicherheit](https://cheatsheetseries.owasp.org/cheatsheets/RAG_Security_Cheat_Sheet.html): Angriffe über Dokumente und Retrieval.

Interne Bezüge: [Lernkonzept](01-Lernkonzept.md),
[Sicherheit](17-Sicherheit.md), [offene Planung OPS-003](agent-briefs/STATUS.md).
