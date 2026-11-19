# Abgeschirmter Übungsspeicher im Debugger

## Ausprobieren

Debugger → „HTML und Ereignisse“ → „Speicherbeispiel laden“. Nach bewusster
Ersetzungsbestätigung starten, Initialpause mit „Weiter“ fortsetzen. Einen
Aufgabentitel eingeben und „Aufgabe speichern“ wählen. Der submit-Handler speichert
den String unter einem eigenen Schlüssel und fügt anschließend den Eintrag ein.

Die aufklappbare „Übungsspeicher“-Ansicht zeigt Schlüssel, Werte und Bytebelegung.
Ein Haltepunkt vor main.js31:5 zeigt den Zustand vor setItem; ein Schritt später
steht der Titel im Speicher, bevor die Aufgabenzeile eingefügt wird. Anzeigen
oder Öffnen der Tabelle führt keinen Lerncode aus und verändert den Speicher nicht.

„Nur Ansicht leeren“ entfernt die DOM-Zeilen. Mit „Aus Übungsspeicher laden“
erscheinen sie aus demselben VM-Speicher wieder. „Entfernen“ löscht den passenden
Speicherschlüssel und dann den Eintrag. „Übungsspeicher löschen“ leert alle
Einträge dieser Sitzung. Die Schlüsselreihenfolge ist kein Ordnungsschema für
eine fachlich sortierte Aufgabenliste.

## Bewusste Grenze: nur diese Sitzung

Der Name localStorage dient zum Üben der bekannten Storage-Methoden. Hier handelt
es sich um einen eigenen Arbeitsspeicher innerhalb QuickJS. Echtes Browser-
localStorage überdauert normalerweise das Neuladen; dieser erste Modellumfang
überdauert keinen Stop, Quellwechsel, Seitenwechsel, Reload oder Electron-Neustart.
Die Abweichung ist ausdrücklich in der App angegeben. Dauerhafte Übungssicherung
benötigt einen eigenen Ausbau mit Projekttrennung und bewusster Datenübernahme.

App-Lernfortschritt, Profile, Konten, OPFS-Projektdateien, private Unterlagen und
deren Datenablagen sind für Lerncode nicht erreichbar. Auch clear() löscht nur
die eigene VM-Map. Originalexport und Werkstattspeicher enthalten weiterhin
HTML/CSS/JavaScript, keine Übungsspeicherwerte. Es gibt keine KI-Übertragung.

## API und Fehler

- getItem(key): String oder null bei fehlendem Schlüssel.
- setItem(key,value): Strings speichern/überschreiben, Rückgabe undefined.
- removeItem(key): vorhandenen Schlüssel entfernen; fehlender Schlüssel bleibt
  unverändert. Rückgabe undefined.
- clear(): sämtliche eigenen Einträge entfernen, Rückgabe undefined.
- length: Anzahl der Einträge, ausschließlich lesbar.
- key(index): Schlüssel an einer Position oder null. Primitive Zahlkonvertierung
  wie unsigned long; fachlicher Code soll nicht auf eine bestimmte Reihenfolge
  vertrauen. Das Modell verwendet eine stabile Einfügereihenfolge.

Primitive Schlüssel und Werte werden zu Strings (auch null/undefined/Booleans).
Objekt-/Funktions-/Symbolkonvertierungen und Benutzerhooks sind gesperrt.
Fehlende erforderliche Argumente werfen einen fangbaren TypeError. Eigene
Schlüssel wie "constructor" sind reine Daten und besitzen keine Objektfunktion.
Benannte Propertyzugriffe/-zuweisungen, Methodenaliase, Storage-Events,
sessionStorage und JSON sind nicht Bestandteil dieser Stufe. localStorage ist
derzeit nur im HTML-/Ereignismodus freigegeben. Andere gültige Webfunktionen
werden damit nicht als grundsätzlich falsches JavaScript bezeichnet.

Das Beispiel speichert einzelne Titelstrings. JSON und fachliche Schemavalidierung
für strukturierte Aufgabenstände aus Kapitel22/23 folgen als eigener Ausbau.

## Grenzen und Datenpfad

| Grenze pro Sitzung | Wert |
|---|---|
| Einträge | 16 |
| Schlüssel | 128 UTF-16-Codeeinheiten |
| Wert | 2048 UTF-16-Codeeinheiten |
| Schlüssel- und Werttext zusammen | 16 KiB UTF-8 |
| Serialisierte Speicheransicht | 32 KiB UTF-8 |
| Speicheroperationen, einschließlich length-Lesen | 256 |

Schlüssel und Werte werden für UTF-8 jeweils getrennt gezählt, auch bei einzelnen
Surrogaten. JSON-Escapes in der Darstellung zählen zum separaten32KiB-Limit.
Ein Quota-Verstoß wirft einen fangbaren Fehler mit name="QuotaExceededError";
der alte Speicher bleibt unverändert. Das ist ein begrenztes Fehlermodell mit
Error-Prototyp, keine vollständige native DOMException-Implementierung.
So kann die Übung „Nicht gespeichert“ melden und weiterarbeiten. Operations-,
Zeit-, Heap- und Protokollüberschreitungen beenden den Lauf endgültig. Die
bestehenden allgemeinen Debuggerbudgets steigen nicht.

Private Modellhandles erlauben ausschließlich diese Methoden und length. Die
Speicher-Map existiert nur in der VM; Host und Oberfläche erhalten eng begrenzte
primitive Snapshots. Worker und Controller prüfen Typen, eindeutige Schlüssel,
Feld-/Eintrags-/Bytegrenzen und Sitzungszustand unabhängig. Daten dürfen nur
während Aufbau oder laufender Ausführung eintreffen, niemals eine VM-Pause
nebenher verändern. Das Widget rendert alle Werte als Text, auch HTML-Fragmente.

## Nachweise

Automatisierte Fälle: e2e/tests/debugger-storage.spec.js; Test-/Bedien-/Review-
Ergebnisse stehen im [FE-057-Brief](agent-briefs/FE-057-debugger-uebungsspeicher.md).
Zehn Speicherfälle und anschließend474 gesamte Browser-/Windows-Electronfälle
ohne Wiederholung grün. Sieben agentseitige Bediengruppen und drei kontrollierte
Bilder bestätigt; unabhängiger Code-/Dokument-/Bildreview ohne Findings, ergänzt
durch10.000 synthetische Unicode-/UTF-8-Proben.
Referenz: [HTML-Standard: Web Storage](https://html.spec.whatwg.org/multipage/webstorage.html).

FE-058 ergänzt darauf aufbauend [begrenztes JSON und fachliche Formatprüfung](51-Debugger-JSON.md).
Die JSON-Ausschlüsse oben beschreiben den ursprünglichen FE-057-Umfang; die
String-/Quota-/Sitzungsgrenzen des Übungsspeichers bleiben unverändert.
