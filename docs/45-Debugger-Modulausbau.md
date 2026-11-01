# Debugger: Unterordner, Sammelimports und Weiterexporte (FE-051)

Stand: 2026-11-01. Erweiterung der [ersten Modulstufe](44-Debugger-Module.md).
Dateien dürfen in Projektunterordnern liegen. Native Namespaces und Weiterexporte
erlauben eine zentrale Modulschnittstelle, ohne importierte Werte zu kopieren.

## Beispiel und Bedienung

```js
// js/main.js
import * as rechner from "./api/index.js";
const ergebnis = rechner.verdoppeln(3);
console.log(ergebnis);

// js/api/index.js
export { verdoppeln } from "../berechnung.js";

// js/berechnung.js
export function verdoppeln(zahl) {
  return zahl * 2;
}
```

Im Modulmodus können Dateien mit Pfaden wie `js/api/index.js` angelegt werden.
Die Startdatei ist hier `js/main.js`, die Ausgabe `6`. Hineinschritt und
Haltepunkte führen zur ursprünglichen Funktion in `js/berechnung.js`.
Weiterexporte erzeugen keine künstlichen Nutzeraufrufe. Aufrufkette, Quellansicht
und Meldungen zeigen den vollständigen Projektpfad mit Originalzeile/-spalte.
Ansichtswechsel während Pause bleibt erlaubt; Source-/Entry-/Moduswechsel
beendet weiterhin den bisherigen Lauf.

„Modulordner als Projekt einlesen“ übernimmt nach Bestätigung einen eigenen
Projektordner einschließlich Unterordnern. Der äußere gewählte Ordnername wird
entfernt, seine innere Struktur bleibt erhalten. Kontrolliere danach die
„Modulstartdatei“. Der Import ersetzt das Modulprojekt, startet keinen Code
und verändert keine echten Dateien im gewählten Ordner.

Der Ordnerimport liest ausschließlich geeignete `.js`-Dateien. Nicht-JavaScript-
Dateien und private Teile wie Punktdateien/-ordner, `node_modules`, `local-rag`
und `local-ai` werden vor dem Inhaltslesen übersprungen. Die Rückmeldung nennt
nur die Anzahl übernommener/übersprungener Dateien. Alle Metadaten, Pfade,
Dateizahlen und Größen werden vor dem ersten `text()` vollständig geprüft.
Malformed Pfade oder Überschreiten der Projektgrenzen brechen vor dem Lesen ab.
Der bisherige Stand bleibt dann erhalten. Private Unterlagen werden nicht
als Modellkontext oder Quelldateien verwendet.

Einzelne JS-Dateien lassen sich weiterhin ergänzend einlesen. JSON-Sicherungen
enthalten auch die relativen Unterordnerpfade. Reload und Electron-Neustart
erhalten Quellen und Startdatei; der Einzeldateientwurf bleibt getrennt.
Gesichert werden keine Haltepunkte, Frames, Variablenwerte oder Ausgaben.

## Unterstützte Sprache

- `import * as rechner from "./berechnung.js"` bildet einen nativen Namespace.
  Zugriffe wie `rechner.verdoppeln(3)` verwenden weiterhin registrierte eigene
  Funktionen. Namespacewerte bleiben lebend und ihre Exportfelder read-only.
  Schreibschutz bedeutet keine tiefe Unveränderlichkeit exportierter Datenobjekte.
- `export { verdoppeln as doppelt } from "./berechnung.js"` reicht Bindungen
  nativ weiter; auch Defaultweitergaben sind möglich.
- `export * from "./berechnung.js"` reicht benannte Exporte weiter, ohne default.
- `export * as rechner from "./berechnung.js"` reicht einen Namespace weiter.
- Lokale Exportlisten importierter Bindungen behalten dieselbe Herkunft, ebenso
  mehrstufige Weitergaben. `export default ausdruck` bleibt eine Werteauswertung;
  es wird nicht stillschweigend zu einer lebenden lokalen Exportliste geändert.

Zwei Sternwege zur selben Bindung sind eindeutig. Zwei verschiedene Ursprünge
mit demselben Namen bleiben mehrdeutig. Der Namespace lässt diesen mehrdeutigen
Namen aus; ein gezielter Import/Weiterexport des Namens wird vorab erklärt.
Ein expliziter Export hat Vorrang vor Sternexporten, unabhängig von seiner
Quellposition. Kein automatisches Wählen einer tatsächlich mehrdeutigen Quelle.

## Pfade und Sicherheitsgrenzen

Ein Projektpfad hat höchstens 128 Zeichen und acht Komponenten. Komponenten
verwenden einfache ASCII-Namen, keine leeren Teile, besonderen Trennzeichen oder
Punkt-/Privatteile. Die letzte Komponente ist ein gültiger einfacher `.js`-Name.
Groß-/Kleinschreibungsduplikate sowie Datei-/Ordnerkollisionen sind ausgeschlossen.

Relative Imports werden vom Ordner der importierenden Datei aus aufgelöst.
`../` ist innerhalb der Projektwurzel möglich; darüber hinaus nicht. Zulässige
Varianten wie `./teile/../berechnung.js` werden auf dieselbe Projektdatei
normalisiert und erzeugen keine zweite Modulauswertung. Private Pfadteile
werden auch dann abgewiesen, wenn ein nachfolgendes `..` sie wieder entfernen
würde. Keine URL-/Paket-/absoluten/Windows-/Encoding-/Query-/Fragmentimporte.
Der Loader bleibt ein Lookup in der geprüften Projektmap, ohne Dateisystem-
oder Netzwerkzugriff.

Alle bisherigen Syntax-/Provenienz-/Getter-/Prototyp-/Funktionsgrenzen gelten
auch über Namespaces und Weiterexporte. Namespaces bleiben in der Variablenansicht
opaque; explizites Lesen eigener nativer Exportfelder erweitert keine Reflexion.
Generierte Helfer/Leser können nicht exportiert werden. Zyklen, dynamisches
Importieren, import.meta, Top-Level-await, DOM und allgemeines Async bleiben
für den Debugger gesonderte spätere Stufen.

Höchstens 16 Quelldateien und insgesamt 64 KiB/512 Zeilen, 8192 AST-Knoten,
1024 Punkte und 256 KiB erzeugter Code bleiben projektweit erhalten. Laufzeit-,
Heap-/Stack-/WASM-/Pause-/Nachrichten-/Ausgabegrenzen werden nicht vergrößert.
Auch die sichere native Sentinelvorprüfung aus FE-050 bleibt erhalten; kein
Modul-compileOnly-Pfad, keine Lernanweisung vor bestandener Prüfung.

## Native Kompatibilität und Referenzprüfung

Die in [ECMAScript 2026, ParseModule](https://tc39.es/ecma262/2026/multipage/ecmascript-language-scripts-and-modules.html#sec-parsemodule)
festgelegte Behandlung exportierter Importbindungen wird explizit auf native
indirekte Exporte abgebildet. Damit bleiben Bindungsherkünfte in Diamonds
eindeutig; QuickJS 0.32.0 behandelt die ursprüngliche lokale Form sonst teilweise
fälschlich als neue Bindung. Gewöhnliche lokale Exporte und Defaultausdrücke
werden davon nicht in ihrer Bedeutung verändert.

Der Compiler stellt ursprüngliche statische Imports und Quellweiterexporte
in ihrer ursprünglichen Reihenfolge vor die zusätzlichen indirekten Exporte.
So bleibt die Reihenfolge der Modulanforderungen und ihrer Nebenwirkungen
auch erhalten, wenn eine lokale Exportliste vor ihrem Import steht.
Für eindeutig namespace-originierende Sternnamen wählt der geprüfte Graph
einen bestehenden Sternweg als expliziten nativen Reexport. Dies beseitigt
die ältere Namespaceherkunftsregel der Laufzeiten, ohne Werte zu kopieren,
echte Mehrdeutigkeit aufzulösen oder explizite Exporte zu überschreiben.

Unabhängige Referenzen verwenden für synthetische Fixtures echtes Node-ESM
in physisch beendeten Testthreads; Produktlerncode läuft weiterhin ausschließlich
in QuickJS. Node24 folgt beim Namespace-Diamond noch der älteren Regel.
Dieser Spezialfall wird deshalb gegen eine ausdrücklich eindeutige native
Namespaceweitergabe und einen festen Identitäts-/Werteerwartungswert geprüft,
nicht gegen ein als normativ behauptetes fehlerhaftes Originalergebnis.
Die Node-Referenzdateien sind eigene Testdaten in ignorierten Ergebnisordnern,
mit explizitem Pakettyp module; sie laden keine Anwenderdateien.

## Prüfstatus

Neue Fälle: `e2e/tests/debugger-module-expansion.spec.js`. Neun neue und neun
bisherige Modulfälle gezielt bestanden: unabhängige native Semantikreferenzen,
Reihenfolge/Identität/Schreibschutz, Pfad- und Exportnegative, tatsächlicher
Ordnerimport mit Lesecounter, Metadatenprüfung vor Lesen, JSON/Persistenz,
lange mobile Pfade und Windows-Electron-Neustart.
Agentseitige Bedienprobe im laufenden lokalen Stand mit getrenntem Profil:
sieben Kontrollen zu Ordnerübernahme, echtem Lesecounter, Namespacehalt,
Ansichtswechsel, lebendem Faktor2→3/Ausgabe6 9, Speicherung/Reload und Mobilbedienung
bestanden. Desktop-/Mobilansicht zusätzlich visuell geprüft. Keine persönliche
Pflicht-Testaufgabe offen. Gesamtregression409/409 Browser-/Windows-Electronfälle
ohne Wiederholung grün, einschließlich95 Debuggerfällen; Build und unabhängiger
Abschlussreview grün. Service Worker v40. Ausführliche Nachweise stehen im
[Arbeitsbrief](agent-briefs/FE-051-debugger-modulausbau.md).
Persönliche Rückmeldung bleibt freiwillig. Keine neue Bibliothek, privaten
Ablagen, Installer/Commit/Push. Nächste größere Stufe: DOM und Ereignisse.

Fortsetzung: FE-052 ergänzt den ersten [DOM-/Klickpilot](46-Debugger-DOM-Klicks.md).
Die obigen Testergebnisse bleiben Nachweise des Modulstands FE-051.
