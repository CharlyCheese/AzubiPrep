# Abnahme des ersten HTML und CSS Pilotabschnitts

Stand: 30.10.2026. Status: 30 von 30 Kriterien im unten beschriebenen
Windows-/Chromium-/Electron-Prüfumfang nachgewiesen. Desktop 0.1.3 ist für
diese Matrix freigegeben; zusätzliche Plattformen sind nicht abgenommen.
Nachweise und Einschränkungen stehen im Protokoll. Dieses Dokument konkretisiert den
[Frontendkursplan](20-Frontendkurs-Qwen-Planung.md), ohne dessen 31 Kapitel,
Projektfolge oder Reihenfolge Pilot → Qwen → Ausbau zu ändern.

## Umfang und Ziel

Der Pilot bildet die erste zusammenhängende Lernstrecke der Kapitel 1–6 bis
zum Projekt „Informationswebsite“ ab. Sie kann aus mehreren kurzen Lektionen
je Kapitel bestehen; elf Lektionen sind als erster Webstand vorhanden. Lernende
erstellen ohne Programmierkenntnisse eine kleine semantische Website mit
zwei verlinkten HTML-Seiten, einer gemeinsamen externen CSS-Datei und einem
lokalen Bild in einem Unterordner. Sie können intern oder ab der ersten zweiten
Datei extern arbeiten, ihre Darstellung untersuchen und Fehler überarbeiten.

Im Pilot werden nur HTML und CSS als Lerncode ausgeführt; aktive Skripte aus
Lern-/Importdateien bleiben gesperrt. JavaScript-Unterricht, Formulare,
Flexbox/Grid, API-Zugriffe, Framework-Builds, produktive RAG-Verarbeitung und
KI-Bewertung sind spätere Ausbaustufen. Eigene Programmlogik der App bleibt
von der Sperre für Lerncode getrennt. Qwen ist keine Voraussetzung der Pilotabnahme.

Vor Beginn der Umsetzung sind Speicher-/Importtechnik, Abschirmung,
Editor-/Validatorwahl und unterstützte Browser-/Desktopversionen festzulegen.
Neue Abhängigkeiten werden durch diese Planung nicht automatisch genehmigt.

## Lernziele und Voraussetzungen

| Reihenfolge | Lernziel | Voraussetzung |
|---:|---|---|
| 1 | Editor, Vorschau und Aufgabenbereich bedienen; Rollen der drei Webtechniken unterscheiden | Keine Programmierkenntnisse |
| 2 | Dokumentgerüst, Elemente, Attribute, Verschachtelung, Überschriften/Absätze erklären und anwenden | Oberfläche bekannt |
| 3 | Listen/Links verwenden, zweite HTML-Datei anlegen; relative Pfade und externe Abgabe verstehen | HTML-Grundlagen |
| 4 | Bild aus Unterordner mit passendem Alternativtext einbinden | Dateien, Attribute und Pfade |
| 5 | Inhalte sinnvoll mit bereits erklärten semantischen Elementen strukturieren und untersuchen | Inhalte und Links |
| 6 | Externe CSS-Datei einbinden; Selektor/Klasse, Farbe und Schrift anwenden | Strukturierte HTML-Seiten |
| 7 | Kleine Informationswebsite nach Anforderungen erstellen und überarbeiten | Alle vorherigen Lernziele |

Diese Lernziele verfeinern die bestehenden Kapitel, sie ersetzen nicht deren
Reihenfolge. Beispiele enthalten keine vorausgesetzten Techniken aus späteren
Kapiteln. Auswahl-/Einleseschritte werden direkt vor der zweiten Datei erklärt.

## Nachweise und Freigaberegel

Für jeden Prüfpunkt werden Version/Build, Testumgebung, verwendeter Projektstand,
Ergebnis, Prüfer und gegebenenfalls Fehlerverweis festgehalten. Die Checkbox
wird erst nach tatsächlichem Nachweis gesetzt. Alle P-Kriterien sind Pflicht
für die Pilotfreigabe; spätere Gates sind separat und blockieren den reinen
HTML-/CSS-Pilot nicht. Bekannte Sicherheits- oder Datenverlustfehler verhindern
die Freigabe. Ein frischer unabhängiger Review prüft Inhalte und Implementierung.

## P1 Lernstrecke und faire Bewertung

- [x] **P1.1 Voraussetzungen:** Jedes Lernziel ist einer Lektion zugeordnet;
  alle im Beispiel/Validator verlangten Techniken wurden zuvor eingeführt.
- [x] **P1.2 Übungsfolge:** Pro neuem Konzept gibt es Erklärung, Beispiel,
  Vorhersage oder geführte Änderung sowie eine selbstständige Aufgabe. Jede
  Kapitelgruppe greift ältere Kenntnisse auf; mindestens eine spätere
  Wiederholungsaufgabe und eine Transferaufgabe vor Projektabschluss sind vorhanden.
- [x] **P1.3 Projektauftrag:** Anforderungen, Pflichtkriterien, ausdrücklich
  verlangte Technik und optionale Empfehlungen sind vor Bearbeitung sichtbar.
  Keine unbeabsichtigte Pixelgleichheit oder feste Beispieldateinamen als Pflicht.
- [x] **P1.4 Prüferprüfung:** Für jede automatisch bewertete Aufgabe sind eine
  Musterlösung, mindestens eine weitere gültige Lösung und mindestens zwei
  typische fehlerhafte Lösungen mit erwarteter Rückmeldung geprüft. Technisch
  unmögliche Alternativen werden im Review ausdrücklich begründet.
- [x] **P1.5 Manuelle Prüfung:** Projekt enthält Selbstprüfungen für Navigation,
  sinnvolle Inhalte, passenden Alternativtext und Tastaturbedienung. Automatische
  Ergebnisse werden nicht als vollständige Barrierefreiheitsprüfung dargestellt.
- [x] **P1.6 Hilfen/Transfer:** Hinweise haben mindestens zwei Abstufungen;
  Musterlösung ist bewusst abrufbar. Hilfen kosten keine Strafpunkte. Bearbeitung,
  Hilfen/Musterlösung und selbstständiger Transfer werden unterscheidbar erfasst;
  Musterlösungsaufruf allein erfüllt keinen Kompetenznachweis.
- [x] **P1.7 Fragwürdige Bewertung:** Ein Meldeweg erhält Aufgabe-, Validator-
  und Abgabestand. Bei blockierendem Prüferfehler sind Weiterarbeiten/Überspringen
  als offen markierte Aufgabe möglich; kein fälschlicher Bestanden-Status.
- [x] **P1.8 Inhaltsreview:** Konkrete Quellen/Prüfdatum je Lektion, selbst
  formulierte Erklärungen und unabhängiger didaktisch-fachlicher Review liegen vor.

## P2 Mehrdateien, externe Bearbeitung und Vorschau

- [x] **P2.1 Frühzeitiger Wechsel:** Ab erster zweiter Datei, aktuell Kapitel 3,
  kann zwischen internem Editor und externem Arbeitsweg gewählt werden. Beide
  bestehen mit demselben Inhalt dieselben Prüfungen.
- [x] **P2.2 Referenzprojekt:** Zwei HTML-Seiten verlinken wechselseitig;
  beide laden dieselbe CSS-Datei und mindestens ein Bild aus einem Unterordner.
  Dateibaum, Dateireiter, Startseitenwahl und Navigation funktionieren intern
  sowie nach externem Einlesen. Keine Zusammenführung in eine HTML-Datei nötig.
- [x] **P2.3 Pfadfälle:** Verschachtelte Ordner, Leerzeichen und gleichnamige
  Dateien in verschiedenen Ordnern bleiben korrekt zugeordnet. Fehlende Ziele
  und abweichende Groß-/Kleinschreibung ergeben nachvollziehbare Rückmeldungen.
- [x] **P2.4 Auswahl:** Desktop-Ordnerdialog und Browser-Datei-/Ordnerübernahme
  werden in der festgelegten Unterstützungsmatrix geprüft. Ein Ersatzweg
  erhält oder erfragt relative Pfade; kein stilles Überschreiben. Kein Zugriff
  allein aufgrund eines eingetippten lokalen Pfads.
- [x] **P2.5 Standbezug:** Jede Abgabe hat einen eindeutigen Stand und Aufgaben-/
  Validatorversionen. Externe Änderung beeinflusst alte Ergebnisse nicht;
  „Neu einlesen und prüfen“ erzeugt neuen Stand und neue Ergebnisse.
- [x] **P2.6 Originalschutz:** Vorher-/Nachher-Vergleich bestätigt unveränderte
  externe Originale. Verarbeitungsort ist sichtbar; keine öffentliche
  Veröffentlichung oder Übertragung an externe Dienste im lokalen Pilot.
- [x] **P2.7 Vorschau/Inspektor:** HTML/CSS-Änderungen erscheinen nach kurzer
  Eingabepause; Elementwahl zeigt zugehörigen Quelltext und relevante Styles.
  Fehler nennen relative Datei und soweit verfügbar Zeile. Kleine/große
  Vorschaugrößen sind wählbar; noch keine responsive Lösung vorausgesetzt.

## P3 Speicherung, Wiederherstellung und Versionen

- [x] **P3.1 Speicherkonzept:** Projektdateien/Bilder liegen in einem gesonderten,
  versionierten Speicher außerhalb des bisherigen localStorage. Speicherort,
  Grenzen und Update-/Migrationsstrategie sind vor Implementierung dokumentiert;
  vorhandene Lernstände werden nicht beiläufig umgestellt.
- [x] **P3.2 Entwürfe:** Interne Änderungen werden automatisch gesichert.
  „Gespeichert“ erscheint erst nach erfolgreicher Sicherung. Ein simulierter
  Schreibfehler zeigt eine verständliche Meldung und lässt Export zu.
- [x] **P3.3 Wiederherstellung:** Nach unerwartetem Schließen bleibt der zuletzt
  bestätigt gespeicherte interne Stand inklusive Pfaden/Bildern wiederherstellbar.
  Nicht bestätigte Änderungen werden nicht als garantiert gespeichert dargestellt.
- [x] **P3.4 Zurücksetzen/Export:** Zurücksetzen betrifft ausschließlich die
  gewählte Aufgabe und verlangt bei Verlust eigener Arbeit eine Bestätigung.
  Export mit Dateibaum lässt sich erneut einlesen; andere Projekte bleiben erhalten.
  Private RAG-Daten, App-Geheimnisse und Bewertungsinterna werden nicht exportiert.
- [x] **P3.5 Versionswechsel:** Eine geänderte Aufgaben-/Validatorversion erhält
  bisherige Ergebnisse mit historischem Bezug. Eine neue Prüfung ist erkennbar;
  kein stiller Verlust oder rückwirkender Abzug früherer Leistung.

## P4 Import und Sicherheit

- [x] **P4.1 Grenzen:** Zulässige Dateitypen, Dateianzahl, Einzel-/Gesamtgröße
  und Verzeichnistiefe sind vor Implementierung numerisch festgelegt. Prüfungen
  direkt an und über jeder Grenze sowie Abbruch ohne Teilüberschreiben bestehen.
- [x] **P4.2 Ausschlüsse:** `.git`, `.env*`, `node_modules`, private RAG-Ablagen
  und nicht benötigte Dateien gelangen nicht in Vorschau, Export oder späteren
  KI-Kontext. Keine automatische Installation/Ausführung von Projekt-Skripten.
- [x] **P4.3 Pfadschutz:** Absolute Pfade, Traversal und ausbrechende symbolische
  Links/Windows-Verzeichnislinks werden abgewiesen. Dateien außerhalb der Freigabe
  können weder gelesen noch überschrieben werden.
- [x] **P4.4 Ausführungsgrenze:** Skript-Tags, HTML-Ereignisattribute und aktive
  importierte Inhalte führen im HTML-/CSS-Pilot keinen Lern-JavaScript-Code aus.
  Versuche, App-Daten, Dateisystem, Electron/Node oder Ollama zu erreichen,
  scheitern. Die Hauptanwendung bleibt bedienbar.
- [x] **P4.5 Ressourcen/Navigation:** Externe Bilder, CSS-Imports, verschachtelte
  Frames, Navigation nach außen, Pop-ups und Downloads eröffnen keine freien
  Netzwerk-/Dateizugriffe. Projektinterne Navigation funktioniert weiterhin.
  Überlast-/Fehlerfälle erlauben Vorschau zurückzusetzen, ohne Entwürfe zu verlieren.
- [x] **P4.6 Desktopprüfung:** Vor Pilotfreigabe sind Electron-Version und
  Sicherheitskonfiguration überprüft und erforderliche Aktualisierungen erfolgt.
  Inspect öffnet nur den vorgesehenen Vorschaukontext und vergibt keine neuen
  App-Rechte; Browser-F12-Unterschiede sind erklärt. Keine absolute Ausbruchsgarantie.

## P5 Bedienbarkeit und praktischer Durchlauf

- [x] **P5.1 Kleiner Bildschirm:** Auf 1366 × 768 Pixeln sind Aufgabe, Dateibaum,
  Editor, Vorschau und Prüfung über wechselbare Ansichten vollständig erreichbar;
  geteilte Ansicht ist optional. Bei 200 % Browserzoom bleiben Bedienelemente
  erreichbar; nötiges Scrollen ist möglich.
- [x] **P5.2 Zugänglichkeit:** Kernablauf mit Tastatur ausführbar, Fokus sichtbar,
  Editor per dokumentiertem Tastaturweg verlassbar, Schrift vergrößerbar und
  Meldungen auch ohne Farberkennung verständlich. Manuelle Prüfung protokolliert.
- [x] **P5.3 Durchlauf ohne KI:** Frischer Testnutzerstand durchläuft Erklärung,
  zweite Datei, externes Einlesen, ersten Fehler, Korrektur, erneute Prüfung,
  Speicherung/Neustart und Projektexport. Kein Modell und kein PDF erforderlich.
- [x] **P5.4 Verständlichkeit:** Mindestens eine nicht an der Umsetzung beteiligte
  Testperson bearbeitet den Durchlauf anhand der Anleitung. Stolperstellen
  werden dokumentiert und blockierende Verständnis-/Bedienfehler behoben.

## Separate Gates vor späteren Ausbaustufen

Diese Kriterien sind ebenfalls offen und werden vor Aktivierung der jeweiligen
Fähigkeit konkretisiert und geprüft:

- **Aktives Lern-JavaScript:** Zeit-/Speicher-/Ausgabelimits, Endlosschleifen,
  Isolation, Stoppen und sichere Wiederherstellung nachweisen.
- **Speicherung/API/Module:** Getrennte Übungsspeicherung und kontrollierte
  Trainings-APIs; Server-/localhost-/file://-Lektion vor deren Verwendung.
- **TypeScript/React:** Kontrollierte Bibliotheksversionen und Buildstrategie,
  keine beliebige Ausführung importierter Paket-/Installationsskripte.
- **Qwen/RAG:** Fester Evaluationsbestand mit Alternativlösungen, Anfängerfehlern,
  unvollständigen Aufgaben, fehlenden/widersprüchlichen Quellen, Angriffen über
  Dokumente/Kommentare, Lernniveau und Hinweisdosierung. Zielgerät mit dokumentierter
  Hardware, Modellversion, Speicherbedarf und Antwortzeiten prüfen; quantitative
  Freigabegrenzen vor dem Evaluationslauf festlegen. Ausfall darf Kernkurs nicht sperren.
- **Fortschrittsrelevante KI-Bewertung:** Eigenständige Abnahme nach ausreichender
  Evaluation; KI bleibt keine alleinige Instanz zum Durchfallen richtiger Lösungen.

## Abnahmeprotokoll bei Umsetzung

| Prüfpunkt | Build/Version und Projektstand | Umgebung | Nachweis und Ergebnis | Prüfer / offener Fehler |
|---|---|---|---|---|
| P1.1–P1.8 | pilot-1.0 / pilot-rules-1.0 | Chromium 153.0.8010.12, lokale Webversion | Elf Musterlösungen, elf Alternativen, zwei Fehlerfälle je Lektion; gezielte Klassen-/Vererbungs-/HTML-Varianten; Quellen-/Didaktikreview | Implementierung und frischer Reviewer fe022_review |
| P2.1–P2.3, P2.5–P2.7 | gleicher Stand, gebaute App index-Dr7DjykK.js | Chromium, isolierte Testprofile | Interner Mehrdateiablauf, echter Ordnerimport, PNG/CSS, Seitenwechsel, Inspektor, relative Pfade einschließlich URL-kodierter Leerzeichen, Report-Snapshot und Startseite | Node-/Playwright-Nachweise in docs/22 |
| P3.1–P3.5 | Schema 1, OPFS | Chromium einschließlich persistentes Testprofil | Gesichert nach vollständigem Browserneustart, Schreibfehler, Kursgrenze, unbekanntes Schema, Export/Reset/Versionen | Node-/Playwright, unabhängiger ZIP-Leser |
| P4.1–P4.2, P4.4–P4.5 | gleicher Stand | Chromium / Node | Importgrenzen, private Dateien, gesperrte Skripte/Netzwerk/Navigation, Überkomplexität und Korrektur | Automatische Regressionen; kein allgemeiner Ausbruchbeweis |
| P2.4, P4.3, P4.6 | OPS-023, Desktop 0.1.3, Electron 45.2.0 / Chromium 156.0.8078.49, Frontend index-MLie1uVL.js | Windows 10.0.19045 x64; Web zusätzlich Chromium 153.0.8010.12 | Native Auswahlbrücke, Abbruch, Mehrdateien/Ergänzen/Konflikte, echter NTFS-Junction-Angriff, Wiederherstellung nach Desktopneustart mit neuer Herkunft; getrennte F12-Vorschau, kein Node/Preload/Netzwerk, blockierte Fremdnavigation, Paket mit 7000 Fragen ohne private Dateien | 8 native/Paket- und 3 Webpakettests; 4 Electron-/Junctiontests an Entwicklungs- und gepackter App; F12-Inhalt/Lebenszyklus ergänzt; 19 Webregressionen + Bildbudgettest; unabhängiger Reviewer ops023_review. OS-Dialogantwort automatisiert ersetzt; Datei-Symlink-Erkennung gemockt, reale Junction separat geprüft. Details/Grenzen in docs/22 |
| P5.1–P5.2, P5.4 | Anwenderbericht nach FE-023/FE-024; genaue Build-/Browserversion nicht separat angegeben | Lokale Webversion | Alle vier angefragten Praxisprüfungen ausdrücklich bestätigt: 200%-Zoom, Tastatur/Fokus/Editor-Ausstieg, Wiederherstellung nach Browserneustart, Mehrdatei-Sicherungsrundlauf. Frühere Stolperstellen in FE-023/FE-024 bearbeitet; ergänzend vorhandene visuelle/automatische Nachweise | Berichtete Nutzerbestätigung, 30.10.2026; keine allgemeine WCAG- oder Plattformzertifizierung |
| P5.3 | pilot-1.0 / pilot-rules-1.0.1, Webbuild index-CglBi8Pu.js | Chromium 153, neues persistentes isoliertes Profil | Ein zusammenhängender erfolgreicher Test: Erklärung, zweite Datei, externer Import mit fehlerhaftem Link, Rückmeldung, Korrektur, erneute Prüfung, Sicherung, vollständiger Browserneustart und Export; keine Modell-/PDF-Anbindung | Gezielter Playwright-Gesamtdurchlauf in OPS-022 bestanden |

FE-022 dokumentiert den ersten Web-Implementierungsschritt. Die Nachträge
FE-023/FE-024 und OPS-022/OPS-023 ergänzen dessen damaligen Prüfstand.
Technische Nachweise und berichtete praktische Nutzerprüfungen sind getrennt
ausgewiesen; es gibt keine plattformübergreifende Gesamtfreigabe.

Erstes praktisches Feedback wurde in FE-023 bearbeitet: schrittweise
Dateiübernahme ohne Verlust anderer Dateien, verständliche Ordnerauswahl,
sichtbare Auswahlknöpfe und Werkstatt in der Einführung. Nachweise: sieben
Node- und 17 Browserprüfungen sowie unabhängiger Nachreview; siehe docs/22.
Stand FE-023: P5.4 wurde durch die Korrekturen allein nicht als bestanden
markiert. Anschließend hat der Anwender alle vier gezielt angefragten
Praxisprüfungen bestätigt; OPS-022 hält diese Rückmeldung und den zusätzlichen
frischen technischen Gesamtdurchlauf fest. P5.1–P5.4 sind damit im dokumentierten
lokalen Webumfang nachgewiesen. Eine Bewertung des ganzen späteren Kurses oder
zusätzlicher Browser/Hardware wird daraus nicht abgeleitet.

OPS-023 schließt die drei zuvor offenen Kriterien für Windows 10.0.19045 x64,
Web-Chromium 153.0.8010.12 und Desktop 0.1.3 mit Electron 45.2.0 ab.
Browser-F12 bleibt ein Werkzeug des Browsers; Desktop-F12 öffnet ausschließlich
eine eigene isolierte Vorschaukopie. Die nativen Dialogaufrufe wurden mit
ersetzten OS-Antworten geprüft, nicht per manueller Dialogbedienung. Computer Use
konnte wegen eines technischen Startfehlers nicht eingesetzt werden. Echte
Datei-Symlinks konnte das Testkonto nicht erzeugen (EPERM); ihre lstat-Abweisung
wurde gemockt, Windows-Verzeichnislinks wurden real angelegt und geprüft.
Andere Browser/Windowsversionen, eine frische Windowsinstallation und die
NSIS-Installationsoberfläche sind damit nicht als praktisch geprüft behauptet.
