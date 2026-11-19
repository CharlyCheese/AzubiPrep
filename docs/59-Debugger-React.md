# React im Quellcode-Debugger

FE-066 ergänzt den Modus „React-Komponenten“. „React-Beispiel laden“ ersetzt
nach Bestätigung das Modulprojekt durch einen Zähler mit Texteingabe und Effekt.
Originale JSX-/TSX-Dateien werden angezeigt, eingelesen und als Projekt gesichert.

## Schrittweise ausprobieren

1. Beispiel laden und Debuggen starten. Eigene Komponenten halten vor ihren
   Anweisungen; mit Weiter bis zur Ereignisbereitschaft gehen.
2. „Eins dazu“ anklicken. Im Handler und funktionalen Zustands-Updater lässt
   sich der bisherige Wert verfolgen. Erst die tatsächliche React-Übernahme
   verändert die Vorschau; die Konsole zeigt alten Cleanup und neuen Effekt.
3. Namen eingeben und „Eingabe übernehmen“ oder einen Vorschauknopf wählen.
   Eingaben werden wie im bisherigen DOM-Modus ausdrücklich gesammelt und
   übernommen. Es wird nicht bei jedem physischen Tastendruck ausgeführt.
4. „React-Komponente entfernen“ führt die Aufräumfunktion mit echten Halten aus.
   Stop beendet hingegen die ganze Ausführung, ohne weitere Lernfunktionen
   aufzurufen. Zum erneuten Einbinden Debuggen starten.

## Freigegebener Umfang

Benannte synchrone Funktionskomponenten, eigene Props/Callbackprops, Listen mit
Schlüsseln, JSX-Elemente/Text/Ausdrücke, useState einschließlich funktionalem
Updater und useEffect einschließlich Cleanup. Die Startdatei exportiert ihre
benannte Funktion direkt als default. Named Imports aus `react` sind auf
useState, useEffect und createElement begrenzt; weitere Dateien bleiben exakt
relative Projektimports. Ein einfaches Paar `[wert, setWert]` wird ausschließlich
bei direktem useState-Aufruf unterstützt.

TSX wird mit vorhandenen lokalen React-Typdefinitionen streng geprüft.
Typentfernung erhält Zeichenpositionen; JSX wird direkt anhand des ursprünglichen
Syntaxbaums instrumentiert. Haltepunkte beziehen sich somit auf eigene Quellen.
JavaScript-/JSX-Dateien werden selbst nicht streng typgeprüft.

Ausführung verwendet die tatsächlich installierten React-/ReactDOM-Bibliotheken
und Linkedom innerhalb der begrenzten QuickJS-VM. Die Anzeige erhält ausschließlich
geprüfte Darstellungsdaten. Eigene Funktionen erhalten keine Roh-DOM-Knoten,
React-internen Elemente oder Browserereignisse. Zustands-/Propsprüfung bewahrt
Objektidentität. Die Bibliotheksjobs werden einzeln über Asyncify abgearbeitet;
es gibt keinen Wiedereintritt in eine pausierte VM und kein Replay.

Kein Zugriff auf Browserglobals, Netzwerk, private Dateien oder Konten. Async-
Komponenten/Handler, refs, Router, Portale, Fragmente, JSX-Spreads, freie styles,
Roh-HTML sowie ReactDOM-Imports sind in dieser Stufe nicht freigegeben.
Die freigegebenen Intrinsic-Tags/Attribute entsprechen dem begrenzten DOM-Modell.
Die Vorschau bildet keine vollständige Browser-/React-Entwicklungsumgebung ab.

## Grenzen und Nachweise

Bestehende Grenzen unverändert: 16 MiB JS-Heap, 64 KiB Stack, maximal32 MiB WASM,
eine Sekunde kumulative aktive Zeit, 64 KiB/512 Quellzeilen,16 Dateien und die
bestehenden Pausen-/Nachrichtenlimits. React zusätzlich:2048 Elementwerte,
4096 Adapteroperationen,2048 Callbacks/Hooks,128 Datenknoten, Tiefe16,
32 Abhängigkeiten,512 Bibliotheksaufgaben/32 offen und32 Abschlusszyklen.

Acht gezielte Browser-/Windows-Electronfälle ohne Wiederholung bestanden.
Isolierte echte VM-Probe:60 validierte Pausen, sieben geprüfte Vorschauen,
Komponentenprops/Ereignisse/Effekte/Cleanup;23 negative Compilerfälle.
TSX-Vorprüfung:19 Gruppen, daneben unveränderte34 TypeScript-Gruppen und140
native Vergleiche. Frischer Gesamt-Review: acht unabhängige Produktproben,
einschließlich identischer Reihenfolge gegen natives Chromium-React,
Fehlerfortleitung und begrenzter Effekt-Schleife. Abschlussstatus im
[Brief](agent-briefs/FE-066-debugger-react.md).
