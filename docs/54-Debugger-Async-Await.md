# Async/await im Quellcode-Debugger

FE-061 ergänzt native async-Funktionen im HTML-/Ereignismodus. Eine Funktion
beginnt sofort; await setzt nur diese Funktion aus. Ihre Fortsetzung läuft
als echter Engine-Job in derselben VM. Es gibt keine Wiederholung bereits
ausgeführter Anweisungen und keine Generator-Umschreibung.

## Bedienung

„async/await-Beispiel laden“ zeigt eine verzögerte erfolgreiche oder fehlerhafte
Übungsabfrage. Nach Start/Weiter einen Beispielknopf drücken. Der Timer erfüllt
oder verwirft die Promise; die folgende Promise-Fortsetzung hält vor dem nächsten
sichtbaren Schritt. try/catch/finally zeigen Ergebnis, Fehler und Abschluss.

Bei einem Halt listet „Wartende async-Aufrufe“ ausgesetzte Funktionen mit ihrer
Originaldatei und await-Position getrennt von der aktiven Aufrufkette. Veraltete
Variablenwerte werden dort nicht angezeigt. Aktive Aufrufe bleiben wie bisher
inspizierbar. Haltepunkte und Einzelschritte funktionieren vor und nach await.
„Funktion verlassen“ folgt dem aktiven Stack; eine ausgesetzte Funktion ist
kein aktiver Caller. Jede neue Fortsetzung hält zunächst sichtbar an.

## Umfang und Grenzen

- async-Deklarationen, async-Pfeile/-Funktionsausdrücke, eigene Imports und await
  innerhalb dieser Funktionen; kein Top-Level-await oder Generatoren.
- Native Promise-/Fehlersemantik und Auswertungsreihenfolge. Await-Ausdrücke
  laufen genau einmal. Rückgaben aus finally sowie durch break/continue oder
  gefangene Fehler aufgehobene Rückgaben werden bei der Beobachtung behandelt.
- Direkte async-Arraycallbacks bleiben ausdrücklich ausgeschlossen; eine solche
  Array-Methode wartet ihre Ergebnisse nicht automatisch ab.
- Aktive und wartende Aufrufe teilen sich die bestehende Grenze von 32 Frames
  einschließlich Programmebene. Promise-, Job-, Zeit-, Speicher-, Quellen- und
  Protokollgrenzen aus FE-060 bleiben unverändert. Ressourcenfehler beenden den
  Lauf auch dann, wenn async sie zunächst in eine Ablehnung umwandelt.
- Stop, Quellenwechsel und Seitenwechsel beenden die gesamte Worker-VM.
  Wartende Funktionen, Werte und Handles werden nicht exportiert oder an KI
  übertragen. Netzwerk- und private Dateirechte entstehen nicht.

## Prüfung

24 gezielte Browser-/Windows-Electron-Prüfungen (Async, Promises, Fehler) ohne
Wiederholung bestanden; ergänzend ein UI-Modus-/Projektwechsel erfolgreich. Darunter native Ablaufvergleiche, parallele Wartezustände,
mehrere verschachtelte finally-Abschlüsse, echte Pausen, Importpositionen,
Frame-/Speichergrenzen, schmale Tastaturbedienung und vollständiger Desktopneustart.
Unabhängiger Review und Archivnachweis stehen im [Brief](agent-briefs/FE-061-debugger-async-await.md).
