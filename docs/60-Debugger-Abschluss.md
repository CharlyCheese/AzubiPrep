# Debugger-Abschluss und Pakete 0.1.5

Die freigegebenen acht Restschritte verbinden Promises, async/await,
kontrolliertes Datenladen, Abbruch/Aktualität, JavaScript-Gesamtprojekt,
TypeScript und React mit der abschließenden Paketabnahme.

## Umfang

Der eigene Debugger unter /frontendkurs/debugger ergänzt die bereits getrennt
eingebundenen Kursprüfungen. Originalquellen, eigene Haltepunkte, Einzelschritt,
Funktion überspringen/verlassen, aktive/wartende Aufrufe und passive Variablen
arbeiten in derselben begrenzten VM. HTML/CSS und Formular-/DOM-Vorschau sowie
React erhalten ausschließlich geprüfte Darstellungsdaten. Die vorhandenen
Zeit-/Speicher-/Quellen-/Protokollgrenzen gelten weiterhin.

Die feste Lernumgebung ist keine vollständige Browser-IDE. Weitere APIs,
Objektinspektion, JSX-Spreads/Refs/Router und asynchrone React-Handler bleiben
außerhalb dieses Umfangs. [JavaScript-Abnahme](57-Debugger-JavaScript-Abnahme.md),
[TypeScript](58-Debugger-TypeScript.md) und [React](59-Debugger-React.md)
beschreiben die jeweils konkreten Grenzen.

## Kurze praktische Abschlussprobe

1. „HTML und Ereignisse“ wählen, „JavaScript-Gesamtprojekt laden“ und starten.
   Mit Weiter bis zur Bereitschaft gehen. Aufgabe ergänzen, langsam und danach
   schnell laden: die neue Antwort bleibt bestehen.
2. „TypeScript-Beispiel laden“: Haltepunkt vor der Rückgabe in preise.ts,
   Parameter ansehen, weiterlaufen lassen. Konsole: `Tastatur 29.75`.
3. „React-Beispiel laden“: Zähler erhöhen, Name eingeben, weiter durch Handler
   und Effekte gehen; Komponente entfernen und Cleanup beobachten.

Das Laden eines Beispiels ersetzt nach Bestätigung das aktuelle Modulprojekt.
Eigene Quellen vorher als JSON sichern. Livewerte werden nicht exportiert;
Neustart beginnt einen neuen Lauf.

## Paketprüfung

Version 0.1.5: Desktop-Setup unter Installer/, Web-Setup und portable Webversion
unter Installer-Web/. Beide Paketarten bringen die benötigte Laufzeit mit.
Buildziele werden vor Erstellung auf Projektzugehörigkeit und Verknüpfungen
geprüft. Web kopiert Backendbibliotheken als eigene Ressourcenwurzel, da
Builder 26 verschachtelte node_modules andernfalls überspringt.

Die Prüfer vergleichen öffentliche Quellen mit Paketdateien und entpackte
NSIS-Payloads mit dem geprüften Build. Desktop: 4075 Dateien/7 Archiveinträge,
110 identische öffentliche Dateien. Web: 4073 Dateien/3 Archiveinträge,
107 identische öffentliche Dateien; die Anwendungspayloads von Setup und
Portable entsprechen dem geprüften Build. Ausgeschlossen sind .env-Dateien,
private Konten, PDFs, local-ai/local-rag und daraus erzeugte Daten. Originale
private Ablagen werden für diese Prüfung nicht gelesen.

Desktop wird im getrennten Testprofil gestartet. Die Webprüfung startet die
mitgelieferte Electron-Laufzeit im Node-Modus mit dem verpackten Web-Backend
und öffnet die verpackte Oberfläche in einem frischen Testbrowser. Sie ersetzt
keine interaktive Windows-Installations-/Trayabnahme. Signierung und Auto-Update
sind weiterhin nicht enthalten. Kein Commit, Push oder Upload der Pakete.

## Prüfnachweise

JavaScript-Zwischenabnahme 529/529; TypeScript 26/26; React/Module/TypeScript/
Desktop final gezielt 42/42. Frische unabhängige Reviews je Stufe.
Paketkonfiguration und Laufzeit 21/21 Node-Tests.

Abschließende Anwendungssuite: 545/545 Browser-/Windows-Electronfälle ohne
Retries bestanden. Die erstmals gemeinsam ausgeführte Desktop-Paketprobe
scheiterte beim Aufräumen der Testhilfe; die serielle Webprobe wurde dadurch
übersprungen. Nach reiner Testkorrektur beide Paketproben separat 2/2 bestanden
(12,4 Sekunden), ohne weitere Produktänderung. Details und Review im
[Abschlussbrief](agent-briefs/FE-067-debugger-abschluss-pakete.md).
