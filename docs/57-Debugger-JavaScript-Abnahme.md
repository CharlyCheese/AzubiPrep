# JavaScript-Gesamtprojekt und technische Abnahme

FE-064 verbindet die freigegebenen JavaScript-Schritte im Beispiel „Mein Lernplan“.
„JavaScript-Gesamtprojekt laden“ ersetzt nach Bestätigung das aktuelle Projekt.
Das Beispiel enthält main.js (Bedienung/Zustand) und data.js (Datenprüfung).

## Lernablauf

1. Start/Weiter: eine Aufgabe erscheint. Titel und Minuten im Formular eingeben,
   hinzufügen und im Übungsspeicher sichern. Entfernen und gesicherten Stand lesen.
2. In data.js vor der Datenprüfung einen Haltepunkt setzen. „Gesicherten Stand
   lesen“ zeigt den importierten Aufruf; mit „Funktion verlassen“ zum Caller in
   main.js wechseln und anschließend mit Weiter abschließen.
3. Langsam laden, bis zur Ereignisbereitschaft fortsetzen, dann schnell laden.
   Die schnelle Antwort mit zwei Aufgaben bleibt bestehen. Der alte Ladevorgang
   darf weder Daten noch Meldung noch den Abbrechen-Knopf verändern.
4. Ungültige Daten laden: gültiges JSON mit ungültiger Minutenzahl wird vor der
   Zustandsübernahme abgewiesen. Die bisherige Aufgabenliste bleibt bestehen.
5. Erneut langsam laden und abbrechen. Danach Stop/Neustart: Laufzeitzustand und
   Übungsspeicher sind neu; nur Projektquellen und Übungsantworten bleiben gesichert.

## Technische Entscheidungen

Höchstens sechs Aufgaben mit eindeutigen IDs, begrenzten Titeln und ganzen Minuten
von 1 bis 240. Nur geprüfte Felder werden in den neuen Zustand übernommen. Sechs
DOM-Zeilen werden einmal angelegt und wiederverwendet; wiederholtes Rendern
verbraucht dadurch keine zusätzlichen Element-IDs. Quellen: 196 Zeilen/7143 Bytes,
257 Kontrollpunkte. Bestehende VM-/Quellen-/Daten-/Protokollgrenzen bleiben unverändert.

Abbruch und Anfragenummern schützen Erfolge, Fehler und finally. Änderungen durch
Hinzufügen, Entfernen und Speicheraktionen ersetzen ebenfalls die aktuelle Anfrage.
Es gibt keine Netzwerkrechte, privaten Dateizugriffe oder KI-Übertragung.
Die Quellsicherung enthält keine Livewerte oder Übungsspeicherinhalte.

## Prüfstatus

Drei gezielte Browser-/Electron-Projektprüfungen grün. Anschließend vollständige
Suite: 529/529 Tests ohne Wiederholung bestanden (8,1 Minuten). Frischer
unabhängiger Review mit 42 Verhaltensprüfungen und echtem Beispielknopf-/
Mobiltest ohne offene Findings. Details im
[Brief](agent-briefs/FE-064-debugger-js-abnahme.md).
Der persönliche Praxistest ist erst nach allen freigegebenen Restschritten vorgesehen.
