# Kontrolliertes Datenladen im Debugger

FE-062 bietet fetch ausschließlich für vorbereitete Antworten im eigenen
Debuggerprojekt. Es findet kein realer Netzwerk- oder Dateizugriff statt.
Die Pfade /uebung/... sind Übungskennungen, keine Serverrouten.

## Schrittweise üben

1. Im Modus „HTML und Ereignisse“ das Datenladebeispiel laden.
2. Debuggen starten und Weiter wählen, dann einen der vier Vorschauknöpfe drücken.
3. Im Ereignishandler startet fetch die Anfrage. Die aktuelle Funktion wartet
   bei await, während der übrige synchrone Code weiterlaufen kann.
4. Nach der vorbereiteten Wartezeit hält die Promise-Fortsetzung. status und ok
   unterscheiden erfolgreiche Antworten von HTTP-Fehlern. json liest und prüft
   den Antworttext; try/catch behandelt Fehler, finally zeigt den Abschluss.

Unter „Übungsantworten“ können Pfad, Ergebnis, Wartezeit, Status und Antworttext
geändert werden. „Übernehmen“ aktiviert die Definitionen und beendet einen alten
Lauf. Eine Modulsicherung enthält diese Definitionen; Einlesen startet nichts.
Fehlerhaftes JSON darf absichtlich als Antworttext eingetragen werden.

## Abgebildetes Verhalten

- fetch(path) liefert eine native Promise. Ein HTTP-Fehler wie 404 erfüllt sie
  mit ok=false. Ein simulierter Verbindungsausfall oder fehlender Übungspfad
  lehnt mit TypeError ab. URLs und nicht freigegebene Argumente werden abgewiesen.
- Antworten haben lesbare status, ok, bodyUsed und direkte text()/json()-Aufrufe.
  Jeder Leseaufruf liefert eine native Promise. Ungültiges JSON führt zu
  SyntaxError, erneutes Lesen eines verbrauchten Bodys zu TypeError.
- 204/205 haben keinen Body: text ergibt eine leere Zeichenfolge, json scheitert,
  bodyUsed bleibt false. Für andere Status ist auch ein leerer Body verbrauchbar.
- Antworten werden vollständig gepuffert zugestellt; Netzwerkstreams,
  Header-/Requestobjekte, Upload, Weiterleitungen und Response-Konstruktoren
  sind nicht enthalten. Abbruch und veraltete Antworten folgen in FE-063.
- Timer und Anfragen teilen sich eine pausebewusste Uhr. Gleiche Fälligkeit
  verwendet Registrierungsreihenfolge; native Jobs laufen vor dem nächsten Task.
  Debugpausen halten die Wartezeit an. Stop beendet auch wartende Anfragen.

## Grenzen und Datenschutz

Höchstens acht Definitionen, 128 Zeichen pro Pfad, 16 KiB pro Antworttext,
64 KiB insgesamt definierte Antworten, 0–30000 ms Wartezeit. Acht Anfragen dürfen
zugleich offen sein, höchstens 64 pro Sitzung; 256 Zugriffe/Operationen und
256 KiB ausgelieferte Texte. Vorhandene Promise-/JSON-/VM-Grenzen gelten zusätzlich.
Private Pfadteile, URLs, Pfadwechsel und automatische Fallbacks sind gesperrt.

Definitionen werden nur als ausdrücklich bearbeiteter Bestandteil des eigenen
Projekts gesichert. Liveantworten, Aufrufwerte und interne Handles sind flüchtig;
keine Übertragung an KI oder Zugriff auf private Lernunterlagen.

## Prüfung

27 Browser-/Windows-Electron-Prüfungen für Datenladen, Timer und async/await ohne
Wiederholungen grün. Native Reihenfolge, Pausen, Fehlerarten, Nullbody/Mehrfachlesen,
Grenzen, schmale Bedienung, Sicherung und Desktopneustart sind enthalten.
Nach UI-Resetkorrektur abschließend 7/7 Fetch-Prüfungen grün.
Zusätzlich 83 isolierte Modellprüfungen und eine echte QuickJS-Integration.
Unabhängiger Review und Abschluss im [Brief](agent-briefs/FE-062-debugger-datenladen.md).
