# Debugger: synchrone Fehlerbehandlung (FE-048)

Stand: 2026-11-01. Dritter begrenzter D3-Teil nach den
[Funktionswerten und Closures](42-Debugger-Funktionswerte-Closures.md).
Eigener synchroner Code kann `throw`, `try`, `catch` und `finally` verwenden.
Die normale Kursausführung und feste Modellspur bleiben getrennte Angebote.

## Umfang und Bedienung

`catch(fehler)` mit einem einfachen Namen sowie `catch` ohne Parameter sind
möglich. Der Parameter ist eine echte lexikalische Catchbindung, bleibt nur im
Catchbereich sichtbar und kann von zurückgegebenen Closures erfasst werden.
Ein gleichnamiges `let`/`const` direkt im Catchblock wird als Syntaxfehler
abgewiesen; in einem weiteren inneren Block ist Shadowing erlaubt.

Vor `try`, vor `throw` und vor den einzelnen Anweisungen gibt es Haltepositionen.
Catch- und Finally-Blöcke haben zusätzlich eigene Eintrittspunkte, auch wenn
sie leer sind. Die Originalzeile und -spalte bleiben maßgeblich. Einzelschritt,
Überspringen, Verlassen und explizite Haltepunkte gelten auch hier. Es gibt
keinen künstlichen Aufruf für einen Catch-/Finallyblock und keine automatische
Pause bei jeder geworfenen Ausnahme außerhalb dieser Punkte.

```js
function lesen() {
  try {
    throw new Error("Test");
  } finally {
    console.log("aufräumen");
  }
}
try {
  lesen();
} catch (fehler) {
  console.log(fehler.name, fehler.message);
}
console.log("weiter");
```

Ausgabe: `aufräumen`, `Error Test`, `weiter`. Im Finally ist `lesen` noch ein
aktiver Aufruf. Beim Eintritt in den äußeren Catchblock ist dieser Aufruf
bereits abgewickelt. Der Fehler steht als opaque Platzhalter unter
„Catchbindung …“ in der Variablenansicht. Explizites Lesen von `name` und
`message` erlaubt die Ausgabe des Fehlertyps und der Nachricht.

Native JavaScript-Regeln gelten für frühe Rückgaben, erneutes Werfen,
`break`/`continue` und Finally-Übersteuerung. Beispielsweise liefert
`try { return 1; } finally { return 2; }` den Wert `2`. Ein normal durchlaufener
Finallyblock lässt die vorherige Rückgabe oder Ausnahme bestehen. Der
Debugger hält dieselbe tatsächliche Ausführung an; kein Replay.

## Standardfehler und Datenzugriff

`new Error`, `new TypeError`, `new RangeError`, `new ReferenceError`,
`new SyntaxError`, `new URIError` und `new EvalError` sind mit keinem oder
einem Nachrichtenargument möglich. Die Konstruktoren werden privat gebunden.
Keine zusätzlichen Optionen/`cause`, freien Konstruktoraliasse oder allgemeine
`new`-Freigabe. Ein lexikalisch überschatteter Konstruktorname wird nicht als
dieser eingebaute Konstruktor interpretiert und ist hier nicht freigegeben.
Die Nachrichtenumwandlung ist eine explizite native Operation innerhalb der VM;
sie erlaubt weiterhin keine gesperrten Funktions-/Serializerwege.

Geworfen werden dürfen auch primitive Werte, eigene Datenobjekte und eigene
registrierte Funktionen. Ihre Identität und der bisherige Daten-/Aufrufumfang
bleiben erhalten. Echte Fehlerobjekte sind in Konsole/Variablenansicht weiterhin
nicht inspizierte Platzhalter. Ausschließlich `name` und `message` sind per
explizitem Zugriff lesbar; die private Referenz liest Datendeskriptoren und ruft
keine Getter auf. Schreiben dieser Fehlerfelder und andere Fehlerfelder wie
`stack`, `cause`, Konstruktoren oder Prototypwege sind gesperrt. Ein selbst
geworfenes gewöhnliches Datenobjekt bleibt ein gewöhnliches Datenobjekt.
Der Host wandelt geworfene Objekte nicht in Text um und liest keine Fehlerstacks.
Unbehandelte Programmausnahmen beenden den Lauf mit der bisherigen neutralen
Meldung und dem letzten Kontrollpunkt.

## Endgültige Schutzabbrüche

Native Programmausnahmen wie TypeError beim Aufruf einer Zahl, null-Zugriff
oder TDZ-ReferenceError sind fangbar. Private Sprachgates und Ressourcenlimits
sind dagegen endgültige Abbrüche. Ein privater, bleibender Fatalzustand wird
vor jedem Catch-/Finally-Lerncode und an weiteren Kontrollpunkten geprüft.
Auch `finally { return ...; }` macht einen solchen Lauf nicht erfolgreich.

Jeder Source-Try-/Catch-/Finallyblock besitzt zusätzlich einen internen
Catch-/Re-Throw-Rahmen ohne eigene Halteposition. Er erkennt native QuickJS-
`InternalError`-Instanzen anhand ihres privat gebundenen Prototyps, bevor Source-
Handler Heap-/Stackfehler unterdrücken könnten. Keine Fehlereigenschaften oder
Getter werden dafür ausgewertet. Originale Programmausnahmen werden unverändert
weitergeworfen; Script-Completion und native Finally-Reihenfolge bleiben erhalten.
Die ohnehin vorhandene interne Frame-Finalisierung baut Aufrufe weiterhin ab.

Hostfehler bei Pause/Protokoll/Budgets setzen ebenfalls einen bleibenden
Abbruchgrund. Der Worker prüft ihn nach der VM-Auswertung auch dann, wenn die
VM sonst einen Wert zurückliefert. Der externe Zeitwächter und physische
Workerabbruch bleiben unabhängig von Quellcodehandlern wirksam.

Alle bestehenden Quelltext-/AST-/Heap-/Stack-/WASM-/Zeit-/Nachrichten-/Ausgabe-
Grenzen aus [Dokument 39](39-Debugger-Technikpilot.md) bleiben unverändert.
Stop, Quellwechsel, Schließen und Neustart verwerfen VM und Fehlerbindungen.
Keine neuen Host-/Datei-/Netzrechte, Bibliotheken oder KI-Anfragen. Nur eigener
Quelltext wird gesichert; keine Fehlerobjekte, Frames, Captures oder Debugwerte.

## Abnahme und weitere Grenzen

Neue Nachweise: `e2e/tests/debugger-errors.spec.js`, darunter echte Catch-/Finally-
Pausen und Electron-Neustart, native Differentialfälle, Catchclosures/TDZ,
leere Handler/Completion, Fehleridentität, Schrittausführung bei Unwinding,
unfangbare Gate-/Budgetabbrüche und echte reduzierte Heapquoten im Interpreter.
Neun neue Fehlerfälle gezielt bestanden; anschließend 391/391 Browser-/Windows-
Electron-Gesamtfälle ohne Wiederholung grün, einschließlich aller 77 Debuggerfälle
und zusätzlicher aktiver Zeitgrenzenprobe. Build und frischer unabhängiger Review
grün, Service Worker v38. Details stehen im
[Arbeitsbrief](agent-briefs/FE-048-debugger-fehlerbehandlung.md).

Keine Pause-bei-Ausnahme-Auswahl, Stackinspektion oder aktive Objekt-/Error-
Auswertung. Catch-Destrukturierung, allgemeine Konstruktoren, Async,
DOM-/TS-/React-Debugging und spätere D3–D6-Ziele bleiben separat.

Der sichtbare Bedienablauf wurde anschließend in FE-049 selbstständig gegen
die laufende lokale Werkstatt in einem getrennten Chromiumprofil geprüft:
neun Kontrollpunkte zu Weiter, Finally-/Catchhalt, Einzelschritt/Über/Aus,
Frameabbau/Fehlerbindung, Finally-Rückgabe, fangbarem TypeError, unbehandeltem
Fehler, endgültiger Gate-Abwehr und frischem Folgelauf bestanden. Catchansicht
und erfolgreicher Folgelauf zusätzlich per Screenshot visuell kontrolliert.
Benutzerentwürfe blieben unberührt. Damit ist für diese Stufe keine weitere
persönliche Testaufgabe offen. Persönliche Rückmeldung zu Verständlichkeit
und Bediengefühl bleibt freiwillig; sie wird durch Agentprüfungen nicht als
abgegeben behauptet. → [Bedienabnahme](agent-briefs/FE-049-debugger-fehler-bedienabnahme.md)
Keine neuen Installer/Commit/Push.
Eine erste Modulstufe wurde anschließend in [FE-050](44-Debugger-Module.md)
ergänzt; Fehlerbehandlung gilt dort ebenfalls mit den dokumentierten Grenzen.
