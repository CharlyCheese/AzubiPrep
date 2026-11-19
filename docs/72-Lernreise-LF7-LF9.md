# Lernreise – LF7 bis LF9

Stand: 2026-11-16 · FE-078 · R4 des [FIAE-Plans](61-Lernreise-FIAE-Planung.md)

## Umfang und Lernfolge

17 Themen ergänzen 44 Lernziele, 68 Theorieblöcke, 238 Fragen, 51 Reflexionen
und 102 Karten. Insgesamt sind 74 von 94 geplanten Themen ausgearbeitet:
193 Ziele, 296 Blöcke, 1036 Lernreisefragen, 222 Reflexionen und 444 Karten.
Die 20 Themen der FIAE-Spezialisierung bleiben geplant; nächste Etappe ist LF10a.
Die bestehenden 7.000 Modulfragen und die Datenbank bleiben unverändert.

| Lernfeld | Themenfolge | Praktischer Abschluss |
| --- | --- | --- |
| LF7 | Komponenten; Signale; Erweiterung; Steuerlogik; Verifikation | Sensorsteuerung mit eigener JavaScript-Funktion und Energieprüfung |
| LF8 | Quellen; Formate; Abfragen; Schnittstellen; Integrität; Bereitstellung | Bereinigung, Verknüpfung, Aggregation und lokale Übertragungsproben |
| LF9 | Anforderungen; Netzplanung; Dienste; Sicherheit; Monitoring; Übergabe | Drei Dienststörungen erkennen, korrigieren und erneut prüfen |

Jedes Thema folgt dem bestehenden Ablauf: vier Theorieblöcke, sechs Quizfragen,
drei Reflexionen, sechs Karten und acht getrennte Mini-Test-Fragen. Sieben von
acht richtigen Antworten bestehen den Mini-Test. Theorie und Aufgaben sind über
dieselben Lernziele und konkrete Blockverweise verbunden. Der jeweilige Abschluss
wiederholt im vierten Block, in der dritten Reflexion und allen acht Testfragen
das gesamte Lernfeld. Die Praxis beginnt in der zweiten Reflexion, nach der
ersten abgeschlossenen Reflexion. Danach bleibt eine bewusste Bestätigung nötig.

## LF7: Sensorsteuerung

Das ungefährliche, fiktive Tischmodell besteht aus Sensor, Steuerung und Lüfter.
Ein UART-Sensor liefert bei 9600 Baud/8N1 mit 3,3-V-Signalpegel den ASCII-Rahmen
`temp=28.0 degC` mit LF-Zeilenende. Versorgung und Signalpegel werden getrennt
behandelt. Bei 5 V benötigen die drei Module 0,1 + 0,2 + 0,4 = 0,7 A, also
3,5 W. Unter der ausdrücklich idealisierten Annahme konstanter Volllast ohne
weitere Verluste ergeben acht Stunden 28 Wh; das 1-A-Netzteil hat 0,3 A Reserve.

Lernende schreiben `control(temperature, connected)`. Nur `connected === true`
und endliche Zahlen von −20 bis einschließlich 80 °C gelten als gültig. Ab
einschließlich 30 °C lautet die Rückgabe `"on"`, darunter `"off"`; ungültige Werte
oder eine unterbrochene Verbindung ergeben `"fault"`. Letzteres bedeutet im
Tischmodell Lüfter aus und Alarm an, keine allgemeine Sicherheitsregel für
echte Lüfter oder Anlagen. Der vorherige Theorieteil erklärt die nötige Syntax.

Die vorhandene QuickJS-Laufzeit führt den eigenen Code mit 15 sichtbaren
Normal-, Grenz-, Typ- und Verbindungsfällen aus. Zusätzlich prüft jeder Lauf
NaN, ±Infinity und einen fehlenden Wert sowie anschließend erneut einen gültigen
20-°C-Wert in derselben Funktionsinstanz. Gleichwertige Implementierungen sind
zulässig. Zeit, Speicher und Ausgabe bleiben begrenzt; Host-, Datei- und
Netzwerkzugriff fehlen. Die Prüfung lässt sich stoppen. Code ist auf 4096
Zeichen begrenzt; Änderungen verwerfen den bisherigen Prüfstatus. Gespeicherte
Ergebnisse sind an den geprüften Quelltext gebunden, kein signiertes Zertifikat.

## LF8: Vom Ausgangsbestand zum Empfänger

Zwei Kundendatensätze ordnen ID 1 dem Norden und ID 2 dem Süden zu. Die fünf
Auftragszeilen enthalten 101/1/10 €, 102/1/20 €, 103/2/5 €, eine identische
Wiederholung von 102 und 104 ohne Kunden-ID über 7 €. Alle Beträge sind hier
ganze Euro. Ein Duplikat wird entfernt und der unvollständige Auftrag mit Grund
zurückgestellt. Drei gültige Aufträge werden über die Kunden-ID verknüpft und
nach Region summiert: Nord 30 €, Süd 5 €, zusammen 35 €.

Ein begrenzter lokaler Empfänger verarbeitet simulierte `POST /reports`-Anfragen
mit `application/json`. Der JSON-Vertrag erlaubt nur `batchId` und `rows`:
Die ID enthält 1–40 ASCII-Buchstaben, Ziffern, `_` oder `-`; die beiden Zeilen
enthalten jeweils nur `region` und `total`, Nord/Süd je einmal und eine ganze
Zahl zwischen 0 und 1.000.000. Der Empfänger übernimmt den ganzen Bericht
oder nichts. JSON-Syntaxfehler ergeben 400, Schemafehler 422. Rollenfehler 401
und unverschlüsselter Transport 426 sind vorgegebene Modellantworten, keine
echten Netzwerkprüfungen. Eingaben sind auf 4096 Zeichen und 16 Anfragen pro
zurücksetzbarer Testfolge begrenzt; es werden keine Zugangsdaten benötigt.

Die Pflichtfolge ist 422 → 201 → 200 → 409: Typfehler, korrigierter Bericht,
gleiche Lieferung erneut, derselbe Schlüssel mit geändertem Inhalt. Die
Reihenfolge der Regionen ist für den semantischen Vergleich unerheblich.
Fehler, Wiederholung und Konflikt erhalten den Empfängerbestand; doppelte
Lieferungen verdoppeln keine Summen. Das Modell verwaltet einen Bericht und
weist einen anderen Schlüssel bei belegtem Empfänger ebenfalls als Konflikt ab.
Dieses Wiederholungsverhalten gehört zum Übungsvertrag, nicht allgemein zu POST.
Der bestätigte Bestand muss am Ende Nord 30/Süd 5 enthalten. Das Protokoll bleibt
lesbar; keine echte Schnittstelle, Datenbank oder fremde Datei wird angesprochen.

## LF9: Netz und Dienst prüfen

Dokumentationsnetze trennen Mitarbeitende (`192.0.2.0/26`), Gäste
(`192.0.2.64/26`) und Dienste (`198.51.100.0/27`). Der vorgegebene DNS-Dienst
`203.0.113.53` gehört zur funktionierenden Infrastruktur. Das Ziel
`portal.example.test` zeigt auf `198.51.100.10`; HTTPS läuft auf TCP 443.
Routing, DNS-Transport, Rückverkehr und TLS-Identität werden als funktionsfähig
vorausgesetzt, nicht tatsächlich erzeugt oder geprüft.

Drei aufeinanderfolgende Fälle enthalten einen falschen DNS-Eintrag, einen
gestoppten Dienst und eine zu breite Gastfreigabe. Erst wird der Befund angesehen,
dann die Ausgangsursache zugeordnet, die Konfiguration korrigiert und erneut
geprüft. IP-Adresse, Präfix, Gateway, DNS-Ziel, Port, Dienstbetrieb und Regel
sind begrenzte Modellwerte. Jede Änderung verwirft das Prüfergebnis. Erfolg
erfordert sowohl eine erfolgreiche Mitarbeiterprobe als auch einen gesperrten
Gastzugriff; ein Ausfall für beide genügt nicht. Netzplan, Zuständigkeiten,
Rückfall und Ergebnisse gehören zur Übergabe. Sicherung, erprobte
Wiederherstellung und Redundanz werden unterschieden.

Die abschließende Rückschau verbindet LF1–LF9 mit dem Einstieg in LF10a.
Modelle ersetzen keine beaufsichtigte Arbeit an freigegebenen echten Systemen,
keine reale Kapazitätsmessung und keine berufliche Abschlussprüfung.

## Speicher- und Datenschutzgrenzen

17 feste Ablagen ergänzen die bisherigen 57. Bestehende Lernstände und
Manifestversion 1.0.0 bleiben kompatibel. Die drei Laborzustände sind an ihr
Abschlussthema und die Reihenfolge gebunden. Unbekannte Felder, überschrittene
Größen und vorgezogene Bestätigungen werden abgewiesen. Sicherungen und
Wiederaufnahme enthalten auch die Übungsstände; abgeschlossene Schritte bleiben
im Lernablauf unveränderlich. Ein Themenstand bleibt auf 128 KiB begrenzt.
Die Lernreise verwendet weiterhin keinen Kontosync für diese Stände.

Die Inhalte beruhen auf öffentlichen Primärquellen und eigenen Beispielen.
Private Unterlagen, daraus erzeugte Daten und Zugangsdaten wurden dafür nicht
gelesen oder verwendet. Übungscode und Modellzustände werden nicht automatisch
in KI-Kontexte aufgenommen. Alle Inhalte sind ohne KI nutzbar. Prüfungen verwenden
synthetische Daten und isolierte Profile ohne echte Datenbank-/Modellaufrufe.

## Prüfstand

Drei frische Fachreviews haben alle 238 Fragen mit 952 Optionen sowie sämtliche
Begleitmaterialien geprüft. Erkannte Formulierungs-, Reihenfolge- und
Zuordnungsfehler sind korrigiert und nachgeprüft. 35 öffentliche Quellen-IDs
wurden ergänzt; der Bestand enthält 196 Quellen-IDs.

Der frische Technikreview fand zwei korrigierte Fehler: Die abschließende
LF8-Konfliktprobe muss denselben Schlüssel betreffen und nach der Wiederholung
liegen. Das asynchrone LF7-Prüfergebnis wartet auf gleichzeitig gespeicherte
Reflexionsnotizen, bevor es nach erneuter Quellen-/Phasenprüfung übernommen wird.
Beide Korrekturen sind unabhängig nachgeprüft.

537 Inhalts-/Zustands-/Modelltests, 987 Backendtests in 25 Dateien und
47 native Desktoptests sind grün. Die Browser-/Electronmatrix deckt 147 Fälle
ab: Im Gesamtlauf bestanden 146 Fälle; der verbleibende LF9-Test hatte einen
mehrdeutigen Textselektor für aktuellen Befund und verborgenes Protokoll. Der
Selektor wurde eingegrenzt; der Fall und anschließend alle drei ergänzten
Mobilproben liefen grün. Es gab dadurch keine Änderung am Produktcode.

Alle 17 neuen Themen sind vollständig durchlaufen, einschließlich Praxis,
Bestätigung, Auswertung und Fortsetzung. Der echte Electron-Neustart erhält
74 Themenstände und alle drei Laborprotokolle. Die gemeinsame JavaScript-Laufzeit
ist auf fehlenden Hostzugriff sowie Zeit-, Stack-, Heap-, Ausgabe- und Jobgrenzen
geprüft. Das zusätzliche LF7-Speicherrennen ist im Browser nachgestellt und grün.

Bei 390 px sind Tabellen und Editoren ohne Seitenüberbreite nutzbar. Für alle
drei Labore wurden tatsächliche Viewport-Aufnahmen unabhängig geprüft:
Weiter-Schaltflächen sichtbar, nicht von der festen Navigation überdeckt,
per Tastatur erreichbar und mit Enter bedienbar. Der Frontendbuild ist
abgeschlossen; die bekannte Größenwarnung bestehender Bündel bleibt bestehen.
Die normale Web-App liefert 74 Themen und Service Worker v67 aus. Ihre vorhandene
Datenbank liefert weiterhin 7.000 Fragen und 26 Module; Login/Sync bleiben aktiv.
Neue Weitergabepakete und Installer sind nicht Teil dieses Schritts.
