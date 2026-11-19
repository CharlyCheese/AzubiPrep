# Anfragen abbrechen und aktuelle Antworten schützen

FE-063 ergänzt AbortController im HTML-/Ereignismodus. Der Controller gehört
nur zum Debuglauf und kann ausschließlich dessen vorbereitete Anfragen steuern.

## Ablauf im Beispiel

„Abbruchbeispiel laden“, Start und Weiter. Zunächst „Langsam laden“ wählen,
bis zur Ereignisbereitschaft fortsetzen und dann „Schnell laden“ wählen.
Der alte Controller wird abgebrochen. Die schnelle Antwort bleibt angezeigt.
„Anfrage abbrechen“ beendet eine noch offene aktuelle Anfrage; vorhandene Daten
bleiben erhalten. Der catch-Zweig erkennt den Fehlernamen AbortError.

Jeder Start erhöht zuerst die Anfragenummer. Danach wird die bisherige Anfrage
abgebrochen und eine neue angelegt. Erfolg, catch und finally prüfen ihre Nummer,
bevor sie die Oberfläche ändern. Ein bereits abgeschlossenes Ergebnis lässt
sich durch einen späteren Abbruch nicht zurücknehmen.

## Freigegebene Teilmenge

- new AbortController() ohne Argumente; stabile schreibgeschützte signal-Eigenschaft.
- abort() ohne Argumente, mehrfach aufrufbar. signal.aborted und signal.reason sind
  lesbar. Nach Abbruch ist reason ein Fehler mit dem Namen AbortError.
- fetch(pfad, {signal: controller.signal}) nimmt nur eigene Signale an. Ein schon
  abgebrochenes Signal lehnt sofort ab; es wird kein Task eingeplant. Ein Signal
  kann mehrere offene Anfragen abbrechen. Abbruch entfernt sie aus der Warteliste.
- Nach Antwortzustellung verhindert Abbruch das Lesen eines ungelesenen normalen
  Bodys. Hier gilt das getestete Chromiumverhalten: bodyUsed bleibt false,
  weitere Leseversuche lehnen erneut mit AbortError ab. Bereits verbrauchte
  Bodies lehnen weiterhin mit TypeError ab.
- Bereits erfüllte Lese-Promises bleiben erfüllt. Übungsantworten sind vollständig
  gepuffert; ein laufender Netzwerkstream wird hier nicht nachgebildet.
  204/205 behalten den standardgemäßen Nullbody: text liefert leer, json scheitert
  an leerem JSON, bodyUsed bleibt false. Native Engines unterscheiden sich in
  Randfällen der Bodybeobachtung; daraus wird keine allgemeine Browsergarantie.
- Keine eigenen Abbruchgründe, Signalereignisse, Streams, AbortSignal.timeout() oder
  echten Browser-/Netzwerkobjekte. Höchstens 64 Controller; vorhandene Anfrage-,
  Promise-, Speicher-, Zeit- und Operationsgrenzen bleiben aktiv.

Stop, Projektwechsel und Neustart vernichten alle Signale und wartenden Aufgaben.
Nur Quelltext und vorbereitete Antworten werden gesichert, keine Laufzeitdaten.

## Prüfung und Referenz

13 gezielte Browser-/Electron-Prüfungen und 14 unabhängige Gegenproben bestanden.
Der Review enthält zusätzlich einen Vergleich mit Node und echten lokalen
HTTP-Antworten. Abschlussnachweis im [Brief](agent-briefs/FE-063-debugger-abbruch.md).

Referenz: [WHATWG Fetch – Body-Verarbeitung](https://fetch.spec.whatwg.org/#body-mixin)
und [Nullbody-Status](https://fetch.spec.whatwg.org/#null-body-status).
