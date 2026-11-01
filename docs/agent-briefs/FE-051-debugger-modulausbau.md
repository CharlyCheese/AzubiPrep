# FE-051 – Modulunterordner, Namespaces und Weiterexporte

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel

Native Modulstufe um kanonische Projektunterordner, relative Elternimporte
innerhalb der Projektwurzel, Namespaceimports und benannte/Star-/Namespace-
Weiterexporte erweitern. Native Livebindungen, Identität, Strict Mode,
Einmaligkeit und Originalpositionen erhalten. Azyklische Graphen bleiben Pflicht.

Dateipfade höchstens128 Zeichen/8 Komponenten, einfache ASCII-Komponenten;
keine Punkt-/Privatordner, URL-/Paket-/Hostpfade oder Encoding-/Trennervarianten.
Normierung erlaubt ../ ausschließlich innerhalb der geprüften Projektmap.
Ordnerimport filtert ungeeignete/private Dateien vor text(), prüft alle Metadaten/
Caps zuerst und ersetzt bewusst nach Bestätigung das Modulprojekt. JSON und
Einzelentwurf bleiben kompatibel. Keine zusätzlichen Rechte oder Bibliotheken.

## Allowlist

- `frontend/src/pilot/debugger-project.js`, `debugger-compiler.js`, `debugger-core.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- `frontend/src/styles/pilot.css` nur bei nötiger Umbruch-/Mobilkorrektur
- neue `e2e/tests/debugger-module-expansion.spec.js`; bestehende
  `e2e/tests/debugger-modules.spec.js` nur nun unterstützte alte Negativfälle
- neue `docs/45-Debugger-Modulausbau.md`, Dokumente38/39/44
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`
- synthetische temporäre Prüfartefakte unter ignoriertem `e2e/test-results/`

## Abnahme

1. Unterordnerauflösung kanonisch und wurzelgebunden, selbe Datei über erlaubte
   Normalisierungswege nur einmal ausgewertet. Private/absolute/externe/Paket-/
   kodierte/Windows-/Rootescape-Pfade ausgeschlossen, auch in unbenutzten Quellen.
2. Namespace- und benannte/Star-/Namespace-Weiterexporte nativ, lebend/read-only;
   Sternexport ohne default, korrekte Mehrdeutigkeit/Explizitvorrang und identische
   Bindingherkunft bei Diamond. Fehlende/mehrdeutige Imports/Exporte vorab erklären.
   Kein Export generierter Helfer, keine Funktions-/Prototyp-/Getter-/Hostwege.
3. Datei/Zeile/Spalte/Frames und Hinein/Über/Aus/Haltepunkte bei verschachtelten
   Projektpfaden korrekt; Ansicht versus Änderung/Entry/Modus wie bisher.
4. Anlegen/Ordnerimport/JSON-Roundtrip/Persistenz inkl Electron-Neustart mit
   Unterordnern, Einzelentwurf erhalten. Private/ungeeignete Quelldateien vor
   Lesen ignorieren, malformed Pfade vor Lesen ablehnen. Keine automatische
   Ausführung/Netzwerk/KI/Debugwertpersistenz. Caps weiter projektweit unverändert.
5. Gezielte native Semantik-/Sicherheits-/Ressourcen-/Browser-/Electronfälle,
   angemessene Gesamtregression und agentseitige Bedienprobe grün. Frischer
   unabhängiger Review und Archivcheck. Kein persönlicher Pflichttest, kein
   Installer/Commit/Push, keine privaten Ablagen; DOM/Ereignisse separat.

## Ergebnis

Projektpfade bis128 Zeichen/8 Komponenten mit kanonischer ../-Auflösung innerhalb
der Wurzel ergänzt. Private/absolute/kodierte/Windows-/Querypfade und Kollisionen
abgewiesen. Namespaceimports, named/star/namespace-Weiterexporte nativ eingebunden;
Graph verfolgt Bindingherkunft, default-Abgrenzung, Mehrdeutigkeit und expliziten
Vorrang. Native Descriptor-/Provenienz-/Fatalgates und sämtliche Budgets erhalten.

Pfadanlegen und bewusster Ordnerimport im Modulwerkzeug ergänzt. Vollständige
Metadatenprüfung vor text(), private/ungeeignete Dateien vorher übersprungen,
Größen-/Dateicaps auch beim ergänzenden Import vor dem Lesen geprüft. JSON und
bestehender Einzelentwurf erhalten; Ordnerübernahme erst nach Bestätigung, keine
automatische Ausführung. Rückmeldung nennt lediglich Übernahme-/Überspringzahlen.

Erster18er-Lauf15/18: Test-Grenzpfad hatte eine zu lange Leafkomponente statt
eines gültigen128-Zeichen-Pfads (korrigiert); lange Editor-Dateibeschriftung machte
die390px-Mobilansicht505px breit (gezielter label-Umbruch, danach390px); gültiger
Import-/lokalerExport-/Star-Diamond wurde von QuickJS0.32 fälschlich als mehrdeutig
abgewiesen. Native Node-/Asyncify-Gegenproben und ECMAScript2026-Primärregel
ParseModule bestätigten die abweichende Herkunftsbehandlung älterer Laufzeiten.

Enger Compilerfix senkt exportierte Importbindings zu nativen indirekten
Reexports ab; keine Wertkopien und keine Änderung von export default expression.
Unabhängiger Reviewer fe051_module_expansion_review fand dabei ein P1:
export-before-import konnte die native Nebenwirkungsreihenfolge verändern.
Originale statische Imports/Quellreexports stehen nun vollständig und in
Originalreihenfolge vor den hinzugefügten indirekten Exporten; vier unabhängige
Reihenfolgevergleiche bestätigten den Fix. Gemischte Listen/default/namespace
ebenfalls abgesichert. Ein weiteres Testbeispiel benötigte einen ausdrücklich
benannten Export zusätzlich zur benannten Defaultfunktion; Referenz korrigiert.

Namespace-Diamonds folgen in Node24 und QuickJS teilweise noch der älteren
Regel. Für bewiesen eindeutige namespace-originierende Sternnamen ergänzt der
Graph einen expliziten nativen Reexport über einen vorhandenen Sternweg; echte
Mehrdeutigkeiten/default/explizite Originale werden nicht überschrieben.
Sechs unabhängige Asyncify-Proben bestätigten Identität, Schreibschutz,
mehrstufige Diamonds, Nichtauswahl mehrdeutiger Quellen und Reihenfolge.
Node-Referenz nutzt echte ESM-Testpakete in physisch endenden Threads; der
Namespace-Sonderfall eine eindeutige Direktreferenz samt festem true2-Erwartungswert.
Produktcode läuft unverändert ausschließlich in QuickJS.

18/18 gezielte neue/bestehende Modulfälle ohne Wiederholung grün. 18 semantische
Referenzprojekte inklusive zusätzlicher Reihenfolgefälle, unveränderte Schutz-
negative und Metadatencounter. Tatsächlicher Folder-Upload liest nachweislich
nur drei geeignete JS-Dateien, fünf synthetische private/sonstige Dateien nicht.
Dokumente38/39/44/45 aktualisiert. Vollständige Regression409/409 grün.

Agentseitige Bedienprobe gegen tatsächlichen lokalen Stand3002 in frischem
Chromiumprofil: sieben Kontrollpunkte grün. Ordnerstruktur/Lesecounter, ursprüngliche
Datei/Parameter am Namespaceaufruf, Ansicht ohne Fortsetzen, lebender Faktor2→3,
Ausgabe6 9, JSON/Reload/Einzelentwurf und mobile Frames/Stop. Zwei Ansichten
zusätzlich visuell geprüft; Skript/JSON/Bilder unter ignoriertem
e2e/test-results/fe051-bedienung. Keine Nutzerentwürfe oder privaten Quellen
verändert. Persönliche Rückmeldung freiwillig. Unabhängiger Abschlussreview
der finalen Compiler-/Graph-/Oracle-/UI-/Dokumentationsfassung und beider
Bedienbilder ohne offene Findings freigegeben.

Vollständige Regression409/409 Browser-/Windows-Electronfälle ohne Retries grün
(Chromium153.0.8010.12,6,1Minuten), einschließlich aller95 Debuggerfälle und der
verstärkten Ordner-Lesecounter-/Native-Oracle-Proben. Produktionsbuild grün,
vorhandener Bundlegrößenhinweis unverändert. Archiv-/Diffprüfung grün; lokaler
Stand liefert SWv40. Keine Bibliothek, privaten Ablagen, Installer/Commit/Push
oder erweiterten Hostrechte. Nächste größere Stufe bleibt DOM/Ereignisse.
