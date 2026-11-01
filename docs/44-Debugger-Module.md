# Debugger: mehrere Dateien und native Module (FE-050)

Stand: 2026-11-01. Erste begrenzte Modulstufe nach
[synchroner Fehlerbehandlung](43-Debugger-Fehlerbehandlung.md).
Der Debugger führt statische ES-Module in einer gemeinsamen lokalen QuickJS-VM
aus. Er ersetzt Imports nicht durch Textkopien oder kopierte Exportwerte.

**Erweiterter Stand:** FE-051 ergänzt Unterordner, Sammelimports und Weiterexporte.
Die folgenden flachen Pfadregeln und damaligen Namespace-/Reexportausschlüsse
beschreiben die erste FE-050-Stufe. Aktueller Umfang und sichere Ordnerübernahme:
[Modulausbau](45-Debugger-Modulausbau.md).

## Bedienung

Unten in der Werkstatt den Debugger aufklappen und unter „Debugmodus“
„Mehrere Dateien / Module“ wählen. Der bisherige Einzeldateientwurf bleibt
erhalten. Das getrennte Modulprojekt enthält zunächst:

```js
// main.js
import { verdoppeln } from "./berechnung.js";
const ergebnis = verdoppeln(3);
console.log(ergebnis);

// berechnung.js
export function verdoppeln(zahl) {
  return zahl * 2;
}
```

Ausgabe: `6`. „Modulstartdatei“ bestimmt den Einstieg, „Debugdatei“ die Ansicht.
Beim Anhalten öffnet sich automatisch die betroffene Datei. Ein Schritt hinein
führt vom Aufruf in `main.js` zur Funktion in `berechnung.js`. Überspringen und
Verlassen verwenden dieselbe tatsächliche Ausführung. Die Aufrufkette nennt
Datei/Zeile/Spalte; Frameauswahl zeigt die passende Quelle und passive Werte.

Ein bloßer Wechsel der Dateiansicht führt keinen Code aus und beendet keine
Pause. So lassen sich Haltepunkte in mehreren Dateien setzen. Änderung einer
beliebigen Moduldatei, andere Startdatei, Moduswechsel, Stop oder Schließen
verwerfen dagegen den bisherigen Lauf. Es gibt keine nachträgliche Änderung
des Quellstands innerhalb einer pausierten VM. Nur die Entrydatei besitzt den
abschließenden Projekt-Kontrollpunkt; importierte Funktionsdefinitionen erzeugen
keine künstlichen EOF-Pausen und keine erfundenen Modul-Aufrufrahmen.

Neue Dateien über einfache `.js`-Namen anlegen, ausgewählte Dateien einlesen
oder eine Modulprojektsicherung lesen. Einlesen führt nichts automatisch aus.
Mehrfachimport ergänzt vorhandene Dateien; bei Überschreibungen erfolgt eine
Bestätigung. JSON-Sicherung ersetzt bewusst das gesamte Modulprojekt.
Entfernen betrifft nur den lokalen Projektentwurf und erfordert eine Bestätigung.
Vorhandene echte Dateien auf dem Rechner werden dadurch nicht geändert.

Dateien und Startdatei werden im bestehenden lokalen Kursspeicher gesichert.
Bei vorhandener Modulsicherung öffnet der Debugger nach Neuladen wieder den
Modulmodus; der Einzeldateientwurf bleibt weiterhin auswählbar. Eine zusätzliche
JSON-Sicherung ist über „Modulprojekt exportieren“ möglich. Sie enthält nur
Schema, Modus, Startdatei und Quellen, keine Haltepunkte/Frames/Variablen/Logs.
Der bisherige Einzeldateiexport und die geführten Kursprojekte bleiben getrennt.

## Unterstützte Modulsprache

- Statische benannte Imports einschließlich Alias, Defaultimport und
  reine Seiteneffektimports aus anderen vorhandenen Projektdateien.
- Exportierte `const`-/`let`-Deklarationen und benannte Funktionen.
- Lokale Exportlisten einschließlich Alias/default sowie `export default`
  für erlaubte Ausdrücke, etwa eine Pfeilfunktion. Benannte Defaultfunktionen
  sind ebenfalls möglich; anonyme Funktionsdeklarationen bleiben ausgeschlossen.
- Nativer Strict Mode, native Auswertungsreihenfolge, einmalige Ausführung
  gemeinsam importierter Module und echte lebende Importbindungen.

`export default x` exportiert den ausgewerteten Wert, während
`export { x as default }` die Bindung weiterreicht. Änderungen über exportierte
Funktionen sind danach über die Importbindung sichtbar. Importbindings selbst
sind nicht zuweisbar. Die freigegebenen Funktionen/Closures/Fehlerbehandlung
aus den vorangegangenen Stufen gelten auch über Modulgrenzen hinweg.

Die erste Stufe verlangt einen azyklischen Graphen. Namespaceimports,
`export ... from`, `export *`, dynamisches `import()`, `import.meta`, Top-Level-
await, allgemeines Async und weitere bisher ausgeschlossene Sprache sind
noch nicht freigegeben. Eine Importbindung lässt sich über eine lokale
Exportliste weitergeben; direkte Reexportsyntax ist damit nicht gemeint.
Es gibt noch keine Ordnerhierarchie und keine automatische HTML-/DOM-Anbindung.

Kreisimporte sind gültiges JavaScript, benötigen aber einen eigenen Nachweis
für Instanziierung, frühe Funktionsaufrufe/TDZ und private Registrierung vor
Auswertung der beteiligten Module. Sie werden hier vorab verständlich abgewiesen.
Dies ist keine vollständige ECMAScript-Modul- oder Kapitel-26-Toolchain-Freigabe.

## Geschlossener Dateizugriff und Ressourcen

Höchstens 16 einfache, auch ohne Groß-/Kleinschreibung eindeutige JS-Dateinamen.
Imports bestehen genau aus `./datei.js`. Keine URL-/Paket-/Dateisystemimporte,
Ordner, Elternpfade, Query-/Fragment-/Encodingvarianten oder Auflösung fehlender
Endungen. Der native Loader liest ausschließlich aus der bereits geprüften
Projektmap im Arbeitsspeicher; kein Netzwerk, Browserimport oder Host-Dateizugriff.

Alle Quellen, auch unerreichbare Zusatzdateien, werden vor Ausführung geprüft.
Graphprüfung weist fehlende Dateien/Exporte und Zyklen ab. Die geschlossene
AST-/Bindungsprüfung umfasst auch lokale Exportlisten und verhindert das
Exportieren generierter privater Helfer/Leser. Modul-/Strict-Reservierungen
werden anhand normalisierter Bezeichner geprüft, auch bei Unicode-Escapes.
Native Modulsyntax und Verknüpfung werden zusätzlich ohne Ausführung geprüft.

Für JS-Import und JSON-Sicherung werden Dateinamen und vorhandene relative
Pfadmetadaten vor dem Lesen geprüft. Punktdateien wie `.env.js`/`.env.json`
sowie nichtflache oder sensible Ordnerpfade werden abgewiesen. Imports und
Sicherungen müssen die begrenzte Projektstruktur erfüllen. Eigene private
RAG-/KI-Unterlagen oder Kontodaten werden dafür nicht gelesen oder übertragen.

Die bisherigen Caps gelten gemeinsam: insgesamt 64 KiB Quellen, 512 Zeilen,
8192 AST-Knoten, 1024 Punkte und 256 KiB erzeugter Code. Gleiche Datei/Zeile
in zwei Modulen bezeichnet zwei verschiedene Punkte. Funktions-/Scopekennungen
sind ebenfalls projektweit eindeutig. Pro Lauf bleiben ein gemeinsamer
16-MiB-Interpreterheap, 64-KiB-Stack, maximal 32-MiB-WASM und dieselben aktiven
Zeit-/Pause-/Protokoll-/Ausgabe-/Frame-/Snapshotgrenzen bestehen.

Modulvorprüfung läuft innerhalb der extern überwachten Startphase, deren Frist
nicht durch Quellcodehandler beeinflusst werden kann. Private Sprach-/Ressourcen-
Abbrüche aus FE-048 bleiben endgültig. Keine Modelljobs während Pause, keine
neuen KI-Kontexte oder Speicherung von Laufwerten und keine neuen Bibliotheken.

## Besonderheit der nativen Modulvorprüfung

Der `compileOnly`-Modulpfad des QuickJS-Emscripten-0.32.0-Wrappers benutzt einen
Modulzeiger außerhalb des Zweigs, der ihn initialisiert. Der Differentialtest
und unabhängige Sync-/Asyncify-Proben zeigten Speicherzugriffsfehler und scheinbare
Syntaxfehler bei gültigen Quellen. Reine Kontext-/Runtime-Trennung kaschiert dies
nur teilweise. Der Fehler ist im
[versionierten offiziellen C-Wrapper](https://github.com/justjake/quickjs-emscripten/blob/v0.32.0/c/interface.c#L838)
nachvollziehbar. Dieser API-Pfad wird für die Modulvorprüfung nicht verwendet.

Stattdessen bekommt JEDE Quelle der Prüfmap, einschließlich aller Abhängigkeiten,
einen vorangestellten privaten Throw mit zufälligem Erkennungstext. Normale
native Modulauswertung kompiliert/verknüpft zuerst den Graphen und bricht dann
beim allerersten Prüfmodul genau mit diesem Wert ab. Keine Lernanweisung, kein
Reader und keine Registrierung werden ausgeführt. Nur genau dieser primitive
Erkennungswert gilt als bestandene Vorprüfung; Syntax-/Linker-/Ressourcenfehler
werden vor dem eigentlichen Lauf abgewiesen. Keine Fehlereigenschaften werden
dafür inspiziert. Alle Quellen werden als Wurzel eines solchen Checks geprüft,
damit auch unerreichbare Zusatzdateien erfasst sind.

Jeder Check verwendet eine eigene kurzlebige Runtime mit denselben Heap-/Stack-
Caps und einen Kontext ohne Debug-/Ausgabe-/Appfunktionen. Nur der geschlossene
Modul-Loader bleibt für die Verknüpfung verfügbar. Nach dem Check wird beides freigegeben;
erst danach folgt der nächste Check bzw. die eigentliche Ausführungsruntime.
Es ist immer nur eine dieser Runtimes aktiv, die WASM-Instanz mit harter
Speichergrenze und die externe Startfrist bleiben gemeinsam. Die tatsächliche
Ausführungs-VM erhält die unveränderten instrumentierten Modulquellen und
wertet den Entry genau einmal aus. Private Prüfpräfixe verändern keine
Originalpositionen der tatsächlichen Ausführung und landen in keiner Sicherung.

Die tatsächliche Ausführungs-VM besitzt weiterhin die bekannten Asyncify-
Hostreferenzen. Sie wird wie bisher ausschließlich durch physisches Beenden
des Workers verworfen; die getrennten Vorprüfungskontexte ohne solche Hostreferenzen
ändern diese Dispose-Regel aus FE-040 nicht.

## Nachweise und Status

Neue Fälle: `e2e/tests/debugger-modules.spec.js`. Sie prüfen echte Browser-/
Electronpausen, originale Datei-/Framezuordnung, modulübergreifende Schritte,
Dateiansicht versus Codeänderung, native Semantik/Diamond/Livebindungen/Default-
Unterschiede, Closures/Fehler/Strictness, Graph-/Budget-/Privatpfadnegative,
JSON-Roundtrip und Kurs-/Einzelentwurf-/Electronpersistenz sowie Mobilbreite.
Neun Modul-/Browser-/Windows-Electronfälle gezielt grün. Anschließende
agentseitige Bedienprobe direkt gegen die laufende Werkstatt im isolierten
Profil: acht Kontrollpunkte einschließlich dateiübergreifender Schritte,
Dateiansicht, Ausgabe6/9, Reload/Einzelentwurf, JSON-Sicherung und Mobilansicht
bestanden; Desktop-/Mobilbilder zusätzlich visuell geprüft. Es bleibt keine
persönliche Pflicht-Testaufgabe dieser Stufe offen. Gesamtregression400/400
Browser-/Windows-Electronfälle ohne Wiederholung grün, einschließlich86
Debuggerfällen; Build und unabhängiger Abschlussreview grün. Service Worker v39.
Ausführliche Nachweise stehen im
[Arbeitsbrief](agent-briefs/FE-050-debugger-module.md).
Persönliche Rückmeldung bleibt freiwillig. Weitere Modulsyntax, DOM/Ereignisse,
Async/TS/React-Debugging und neue Installationspakete bleiben eigene Aufgaben.
