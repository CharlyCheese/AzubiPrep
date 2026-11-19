# JSON und geprüfte Speicherzustände im Debugger

## Schrittweise ausprobieren

Debugger → „HTML und Ereignisse“ → „JSON-Beispiel laden“. Das ersetzt nach
Bestätigung die bisherigen Originalquellen. Starten und mit „Weiter“ die Listener
einrichten. Aufgabe hinzufügen, dann „Zustand speichern“ wählen: Der versionierte
Stand wird als JSON-String im laufenden Übungsspeicher abgelegt.

„Nur Ansicht leeren“ verändert weder Datenarray noch gespeicherten Text.
„Zustand laden“ liest den Text, parst JSON, prüft Version und Aufgabenformat
und ersetzt erst anschließend den laufenden Zustand. Die Ansicht wird daraus
neu aufgebaut. Das Beispiel unterscheidet Daten, Darstellung und gespeicherte
Zeichenfolge ausdrücklich; Hinzufügen speichert nicht automatisch.

Unter „JSON-Testtext“ einen anderen Stand oder beschädigten Text eingeben.
„Testtext im Übungsspeicher ablegen“ übernimmt ihn bewusst ohne Formatprüfung.
Erst „Zustand laden“ prüft ihn. Ein SyntaxError oder unpassendes Datenformat
lässt die bisherigen Aufgaben/Ansicht sowie den gerade gelesenen Speichertext
unverändert; ein Lesefehler erzeugt keine automatische leere Sicherung.

Geeignete Haltepunkte des unveränderten Beispiels:

- main.js47:5 vor JSON.stringify und48:5 vor setItem.
- main.js60:5 vor JSON.parse: noch kein gelesener Objektwert.
- main.js62:5 nach erfolgreicher Formatprüfung vor tasks=value.tasks.

Die Übernahme des Datenarrays ist noch kein DOM-Neuaufbau: erst das nachfolgende
render ändert die sichtbaren Zeilen. Alle Halte setzen dieselbe VM fort.

## Freigegebene Datenfunktionen

Im HTML-/Ereignismodus sind JSON.parse/stringify, Array.isArray und
Number.isInteger über private Fassaden verfügbar. Die tatsächlichen VM-
Standardglobals werden nicht ersetzt. Eigene lokale Variablen, Parameter,
Funktionen und Objektfelder mit diesen Namen behalten ihre Bedeutung.
Array und Number sind in diesem Umfang Prüf-Fassaden, keine freigegebenen
Konstruktoren oder allgemeine Umwandlungsfunktionen. Direkter Methodenaufruf
ist erlaubt, freie Methodenaliase und Properties/Prototypen bleiben gesperrt.

Unterstützt sind einfache eigene Datenobjekte, Arrays, null, Booleans, Zahlen
und Strings sowie das nachfolgend beschriebene undefined-Verhalten.
undefined entfällt in Objektfeldern bzw. wird im Array null; stringify(undefined)
liefert undefined. Arraylöcher und nichtendliche Zahlen werden nach nativer
JSON-Semantik serialisiert. Geteilte, nichtzyklische Referenzen dürfen vorkommen.
Ungültige JSON-Syntax wirft einen fangbaren SyntaxError; zyklische Daten einen
fangbaren TypeError. Ein syntaktisch gültiges JSON ist noch kein fachlich gültiger
Lernplan: null, eine Zahl oder eine Liste falscher Aufgaben sind mögliche Werte.

Reviver, Replacer, Einrückungsoptionen, toJSON-Hooks, Funktionen, Accessors,
benutzerdefinierte Objektkoerzierung sowie DOM-/Storage-/Prüffassaden als
Serialisierungsdaten sind gesperrt. Vor dem nativen stringify wird ein begrenzter
Datenbaum aus eigenen Deskriptoren kopiert, ohne Getter aufzurufen und ohne
Prototyp am kopierten Objekt/Array. Source-Getter/Proxy-Konstruktion bleibt
compilerseitig gesperrt; dies ist kein allgemeiner sicherer Proxy-Inspektor.
JSON läuft vollständig in QuickJS, niemals über Browser-/Node-eval.

## Beispiel-Schema

version muss1 sein. tasks ist ein Array mit höchstens6 Aufgaben. Jede Aufgabe
benötigt eine eindeutige, nichtleere String-id bis40 Zeichen, einen Titel mit
1–80 Zeichen nach Leerprüfung, ganzzahlige Minuten1–240 und boolesches done.
Zusätzliche sichere Datenfelder dürfen enthalten sein. Das Beispiel nimmt pro
neuer Aufgabe25 Minuten und done=false an; über JSON lassen sich weitere gültige
Stände testen. Schema-Prüfung ist sichtbar ausgeschriebener Lerncode, keine
versteckte KI-Bewertung. Die kleine Beispielgrenze ersetzt nicht die allgemeine
200er-Datenanforderung aus Kapitel22; andere Laufzeitgrenzen bleiben eigenständig.

## Grenzen und Lebenszyklus

| Grenze pro Sitzung/Aufruf | Wert |
|---|---|
| JSON-Eingabe/-Ausgabe und gesamter besuchter Schlüssel-/Stringtext | jeweils16KiB UTF-8 |
| Verschachtelte Container | 16 |
| Besuchte Datenwerte pro JSON-Aufruf | 512, einschließlich Wurzel und Arraylöchern |
| Schlüssel oder Stringfeld | 2048 UTF-16-Codeeinheiten |
| JSON-/Prüfmethodenoperationen pro Sitzung | 256 |

Die Eingabetiefe wird vor parse außerhalb von JSON-Strings lexikalisch begrenzt.
Die Graphprüfung findet vor stringify statt. Ressourcen-/Abschirmungsfehler
beenden endgültig; try/catch kann diese Grenzen nicht aufheben. Aktive Zeit,
Heap, Stack, Protokoll und die bestehenden DOM-/Speicherbudgets steigen nicht.
Der Übungsspeicher erlaubt weiterhin nur2048 Zeichen pro Wert; auch gültiges
größeres JSON kann deshalb beim Speichern einen fangbaren Quota-Fehler auslösen.

Alle Daten bleiben in der aktuellen Sitzung. Die Speicheransicht zeigt weiterhin
lediglich Strings, die Variablenanzeige weiterhin passive Platzhalter für Objekte.
Keine automatische Objektinspektion, dauerhafte Sicherung, App-Storage-/Datei-/
Netz-/KI-/Unterlagenanbindung. Stop, Quellen-/Seitenwechsel, Reload und Electron-
Neustart verwerfen Livezustände; Originalexport enthält ausschließlich Quellen.

## Nachweise

Automatisierte Fälle: e2e/tests/debugger-json.spec.js, bestehende Speicher-/DOM-
Gegenproben. Test-/Bedien-/Reviewbefunde stehen im
[FE-058-Brief](agent-briefs/FE-058-debugger-json.md).
63 gezielte Fälle und484 gesamte Browser-/Windows-Electronfälle ohne
Wiederholung grün. Nach ergänzten echten Worker-Grenzproben und kleiner
Darstellungsnacharbeit alle10 JSON-Fälle erneut grün. Sieben Bediengruppen
bestätigt; unabhängiger Code-Review mit1000 nativen Datenvergleichen und27
Einzelproben ohne Findings.

Fachreferenzen: [ECMAScript JSON](https://tc39.es/ecma262/2026/multipage/structured-data.html),
[Array-/Typprüfung](https://tc39.es/ecma262/2026/multipage/abstract-operations.html),
[Number.isInteger](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html).
