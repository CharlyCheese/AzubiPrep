# Debugger: gespeicherte Funktionen und Closures (FE-047)

Stand: 2026-11-01. Zweiter begrenzter D3-Teil nach den
[synchronen Array-Callbacks](41-Debugger-Callbacks.md). Eigene synchrone
Funktionen dürfen jetzt als Werte gespeichert, übergeben und zurückgegeben
werden. Der Debugger setzt weiterhin dieselbe tatsächliche Ausführung fort.

## Unterstützter Umfang

- Gespeicherte Pfeilfunktionen und anonyme synchrone `function`-Ausdrücke,
  jeweils mit einfachen benannten Parametern.
- Aliasse eigener Root-Funktionsdeklarationen und eigener Funktionswerte,
  Callbackparameter eigener Funktionen sowie Funktionen als Rückgabewerte.
- Zurückgegebene Closures mit lebenden äußeren Bindungen, einschließlich
  gemeinsamem oder unabhängigem Zustand und eigenen `for`-Iterationsbindungen.
- Registrierte Funktionen in eigenen Objekt-/Arraydatenfeldern. Eigene Felder
  lassen sich lesen, aliasieren und per Punkt aufrufen, etwa `objekt.fn(2)`.
  Auch eigene Funktionen namens `map` oder `push` sind erlaubt.
- Originalidentität (`===`, `!==`), `typeof`, Truthiness und Neuzuweisung eigener
  `let`-Funktionsvariablen. Root-Deklarationsbindings bleiben unveränderbar.

```js
function zaehler(start) {
  let wert = start;
  return schritt => {
    wert += schritt;
    return wert;
  };
}
const erster = zaehler(10);
const alias = erster;
const zweiter = zaehler(100);
console.log(erster(2));
console.log(alias(3));
console.log(zweiter(1));
```

Ausgabe: `12`, `15`, `101`. Ein Haltepunkt vor `wert += schritt` zeigt
`wert` nacheinander als `10`, `12`, `100`. Der erste und sein Alias teilen sich
die Bindung; der zweite Zähler hat seine eigene. `zaehler` ist dann bereits
beendet und erscheint nicht als aktiver Aufruf in der Aufrufkette. Seine
erhaltenen Variablen stehen unter „Funktion zaehler · äußere Bindungen“.

Bei einer gespeicherten Funktion wird möglichst ihr Variablenname angezeigt,
sonst „Closure Zeile:Spalte“; direkte Array-Rückrufe behalten „Callback …“.
Die Kennzeichnung äußerer Bindungen bezieht sich auf den ausgewählten Frame.
„Einzelner Schritt“, Überspringen, Verlassen und explizite Haltepunkte gelten
auch bei eigenen Callbackketten. Weiter/Über/Aus führen kein Replay aus.

## Geschlossene Funktionswege

Jede erlaubte Funktion wird vollständig instrumentiert und beim Erzeugen in
einem privaten VM-WeakSet registriert. Die Registrierung gibt dieselbe Funktion
zurück, ohne einen Aufrufwrapper an ihre Stelle zu setzen. Jeder dynamische
eigene Aufruf prüft diese Herkunft; uninstrumentierte Funktionen werden verworfen.
Root-Deklarationen werden weiterhin mit leerer Script-Completion registriert.

Eine private Leserfabrik bindet die äußeren Lese-Closures bei der Erzeugung.
Sie liest die ursprünglichen lexikalischen Bindungen, keine eingefrorenen Kopien.
TDZ, spätere Mutation, Shadowing und getrennte `for`-Umgebungen bleiben erhalten.
Beendete Erzeuger werden nicht als künstliche Aufrufrahmen behalten.

Funktionswerte sind weiterhin opaque in Konsole und Variablenansicht. Ihr
Quelltext und ihre Eigenschaften werden nicht inspiziert. Eine private,
nicht überschreibbare `Symbol.toPrimitive`-Eigenschaft verwirft die ausdrücklich
nicht unterstützte Umwandlung von Funktionen zu Text/Zahl, auch nach Aliasbildung,
Übergabe oder innerhalb von `[fn].join()`. Dieses Konvertierungsgate ist eine
bewusste Grenze des Debugger-Sprachumfangs, keine Behauptung nativer Semantik
für Funktionsstringifizierung. `typeof`, Identitätsprüfung und Truthiness
benötigen keine solche Konvertierung und behalten ihre normale Bedeutung.

Punktaufrufe werten Empfänger und Methodenfeld einmal vor den Argumenten aus.
Der private Helfer hält diese Auswahl fest. Callable-Prüfung geschieht erst nach
den Argumenten; null/undefined beim Feldlesen werfen schon vorher. Echte Arrays
ohne eigenes gleichnamiges Feld verwenden die privat gebundenen 15 nativen
Methoden. Sonst gilt das eigene Datendeskriptorgate. Callermetadaten werden nach
Argumentauswertung vor dem tatsächlichen Aufruf aktualisiert.

Keine zusätzlichen Rechte oder Bibliotheken. Die Budgets aus
[Dokument 39](39-Debugger-Technikpilot.md) bleiben unverändert. Stop, Quellwechsel,
Schließen und Neustart beenden die ganze VM einschließlich Closurezustand.
Nach regulärem Ende/Stop darf die Ansicht den zuletzt erfassten passiven Zustand
anzeigen; eine Quelländerung oder ein neuer Lauf verwirft ihn. Nur der eigene
Quelltext gehört zur Kurssicherung, keine Funktionen, Frames oder Laufwerte.
Keine zusätzliche KI-, Datei- oder Netzwerkschnittstelle.

## Weiterhin ausgeschlossen

Benannte Function-Expressions, verschachtelte Funktionsdeklarationen,
`this`/`arguments`, Default-/Rest-/Destrukturierungsparameter, Methodendefinitionen
in Objektliteralen, Getter, Prototyp-/Funktionsreflexion, native Methodenaliase,
berechnete Aufrufe wie `objekt["fn"]()` und Async. Synchrone Fehlerbehandlung
ergänzt inzwischen [FE-048](43-Debugger-Fehlerbehandlung.md).
Eine Funktion aus einem Arrayfeld kann zunächst einer Variablen zugewiesen und
dann aufgerufen werden. Funktionsfelder wie `.name`, `.length`, `.call` oder
`.bind` sind keine freigegebenen Reflexions-/Aufrufwege. Methoden des normalen
freien JS-Bereichs und technische Kursprüfungen bleiben getrennte Angebote.

Statische Syntaxverstöße werden vor jeder Ausführung verworfen. Bei erst
dynamisch erkennbaren gesperrten Daten-/Funktionswerten endet der Lauf an diesem
Zugriff/Aufruf; vorangegangene Anweisungen können bereits gelaufen sein.

## Prüfstatus

Neue Fälle: `e2e/tests/debugger-closures.spec.js`. Sie prüfen echte Browserpausen
und Windows-Electron, gespeicherte Pfeile/eigene Callbackparameter, lebende
Zähler nach Erzeugerrückkehr, Aliasse/getrennte Zustände, Schleifenbindungen,
TDZ, Caller-Snapshots, Identität/Completion, Aufruf-/Argumentreihenfolge,
Konvertierungs-/Reflexionsabwehr und Stop/Quellwechsel/Limits.

68/68 gezielte Debuggerfälle und anschließend 382/382 Browser-/Windows-Electron-
Gesamtfälle ohne Wiederholung bestanden; Build und unabhängiger Abschlussreview
grün. Service Worker v37. Details stehen im
[Arbeitsbrief](agent-briefs/FE-047-debugger-funktionswerte-closures.md).
Die praktische Callback-Rückmeldung aus FE-046 wird nicht als eigene
Nutzerabnahme aller neuen Closurefunktionen wiederverwendet. Strukturierte
Fehlerbehandlung wurde anschließend in [FE-048](43-Debugger-Fehlerbehandlung.md)
ergänzt; folgende D3–D6-Stufen bleiben separat. Keine neuen Installer.
