# JavaScript: Kapitel 16 – Funktionen und Gültigkeitsbereiche

Stand: 31.10.2026, FE-031. Zehn neue Lektionen, insgesamt 71 im gemeinsamen Kurs.
Web-/Electron-Entwicklungsstand; keine neuen Installationspakete.

## Schrittweise Lernfolge

| Schritt | Neues Lernziel | Anwendung |
|---|---|---|
| 1 | Funktionsdeklaration gegenüber Aufruf | Startmeldung zweimal durch Aufrufe erzeugen |
| 2 | Parameter gegenüber konkretem Argument | Begrüßung für unterschiedliche Namen |
| 3 | Mehrere Argumente und Positionszuordnung | Budget minus Kosten |
| 4 | return gegenüber console.log | Zahl zurückgeben, außen speichern/ausgeben |
| 5 | Frühe Rückgabe, alle Wege, undefined/Zeilenumbruch | Alter klassifizieren |
| 6 | Standardparameter für fehlend/undefined | Explizite 0 für Versand erhalten |
| 7 | Lokale Parameter/Bindungen und äußere Bindung | Bonus ohne Änderung äußerer Punkte |
| 8 | let/const im Block | Bereichsfehler im Rabattrechner reparieren |
| 9 | Reine Berechnung und Zusammensetzung | Warenwert plus Versand aus Teilfunktionen |
| 10 | Transfer und getrennte Schnittstellen | Tarifrechner aus Kapitel 15 zerlegen |

Jede Lektion besitzt Voraussetzungen, eigene Erklärung/Beispiel, Aufgabe, zwei
Hinweise, offenen Starter und mögliche Lösung. Die Reparaturaufgabe startet mit
einem absichtlichen Bereichsfehler. Kleine Aufgaben gehen dem Abschlussprojekt
voraus. Arrays, Schleifen, Callbacks, Pfeilfunktionen, Closures oder DOM werden
nicht vorausgesetzt und von der Lernbegleitung nicht vorweggenommen.

Klassische Funktionsdeklarationen sind die gelehrte Schreibweise. Die Erklärung
unterscheidet ihre frühe Verfügbarkeit (Hoisting) von erst später behandelten
anderen Schreibweisen. Lesbarkeitshalber stehen die Beispiele vor ihrem Aufruf.
Gleichwertige Lösungen werden über ihr Verhalten und ihre Schnittstellen geprüft;
die Prüfung ist keine vollständige Syntax- oder Schreibstilanalyse.

## Abschlussprojekt

Die synthetischen Tarifregeln aus Kapitel 15 bleiben gleich: 4 Euro unter 12,
6 Euro für 12–17, ab 18 Jahren 10 Euro oder bei azubi true 8 Euro. Erst die
Anzahl multipliziert den Einzelpreis. Altersbereich 0–120 und ganze Anzahl 1–10
sind vereinbarte Kursgrenzen. Texte müssen getrimmt nicht leer und als Zahlen
endlich und ganzzahlig sein. Ungültige Daten liefern „Bitte Eingaben prüfen.“.

Die Aufgabe benennt drei unabhängig aufrufbare Funktionen:

- `istGanzzahlText(text, minimum, maximum)` liefert nur einen Boolean; Nicht-Text
  ist false. Der Wertebereich wird über Parameter vereinbart.
- `einzelPreis(alter, azubi)` liefert bei bereits gültigen Argumenten den Tarif.
- `tarifText(alterText, anzahlText, azubi)` nutzt die Teilfunktionen und liefert
  die Fehlermeldung oder „Gesamt: X Euro“ zurück.

Die äußere Anweisung speichert den abschließenden Aufruf in `ausgabe` und
protokolliert ihn genau einmal. Die Funktionen selbst protokollieren nichts.
Selbst erklären, welche Argumente wohin gelangen und wie ihre Rückgaben
weiterverwendet werden. Sicherung und erneutes Einlesen wie in den vorigen
Kapiteln. Exportierte Dateien enthalten weiterhin keine automatisch ergänzten
Testkonstanten; das externe Bearbeiten/Einlesen bleibt vollständig möglich.

## Ergebnisprüfung

Die verpackten festen Probes rufen Funktionen jetzt tatsächlich mit anderen
Argumenten direkt auf, zusätzlich zu den wechselnden obersten Kursdaten.
Die Kurskonsole zeigt im normalen Lauf nur den studentischen Programmstart;
interne Prüfaufrufe werden nicht als eigene Ausführung der Aufgabe gespeichert.
Auch bei direktem Aufruf laufen studentische Funktionen ausschließlich innerhalb
QuickJS, nicht im Browser-/Node-Host.

Die vorhandene VM-interne Prüfclosure darf zusätzlich die begrenzte Zahl ihrer
primitiven Konsolenaufzeichnungen vergleichen. Dies erkennt etwa eine Funktion,
die anstelle einer Rückgabe nur protokolliert, und unerwünschte Zusatzmeldungen
aus Berechnungsfunktionen. Es entstehen keine neue Hostfunktion, kein Zugriff
auf App-/RAG-/Konto-/Dateidaten und kein frei angeliefertes Prüfprogramm.
Bestehende Zeit-/Heap-/Stack-/Ausgabe-/Jobgrenzen gelten für Programm und Probe
zusammen; jeder Datenfall hat einen frischen Interpreter/Worker.

Die direkten Prüfaufrufe haben einen ausdrücklich synchronen Vertrag: Wenn
dabei neue nachlaufende Promise-Jobs entstehen, wird die Prüfung abgewiesen,
ohne diese Jobs auszuführen. So werden weder spätere Zusatzmeldungen still
übersehen noch nachlaufende Schleifen freigegeben. Bereits gesetzte Zeit-/
Ausgabe-/Fehlergründe haben Vorrang. Der begrenzte Joblauf des normalen
Programms bleibt unverändert; asynchrone Funktionen sind ein späteres Kapitel.

Ein erst im Prüfaufruf auftretender Fehler wird als solcher mit begrenzter
Fehlermeldung angezeigt. Ein nicht zurückkehrender Aufruf erreicht dieselbe
Zeitgrenze; danach kann ein korrigiertes Programm erneut geprüft werden.
Die vorhandenen Abbruch-/Generations-/Dateistandregeln bleiben erhalten.

Die feste Prüfung erkennt ausgewählte globale Abhängigkeiten, falsche Argument-
reihenfolge, fehlende Rückgaben/Wege, überschriebenen äußeren Zustand und
beobachtete Konsolennebenwirkungen. Wiederholte Aufrufe müssen dieselben Werte
liefern. Das beweist keine mathematische Reinheit für alle Argumente oder alle
möglichen Nebeneffekte. Ebenso beweist eine korrekte Gesamtfunktion allein
nicht die tatsächliche Verwendung aller Teilfunktionen; diese muss zusätzlich
an der eigenen Lösung erklärt werden. Ein lokales Ergebnis ist kein Zertifikat.

## Erhalt und Grenzen

Alle bisherigen 61 Lektionen und ihre Versionen/Ergebnisse bleiben erhalten.
Die Anzahlprüfung verwendet bereits die tatsächliche Kurslänge, sodass die
bisherige Mindestgrenze von 64 den Ausbau auf 71 nicht blockiert. Die Grenze
von 32 MiB für lokale Kursdaten bleibt gleich. Reine Lauf-Ausgaben werden nicht
gesichert; optionale HTML-Textspiegelung bleibt standardmäßig aus.
Keine automatische Ausführung nach Import oder Wiederherstellung und weiterhin
keine aktiven Skripte/DOM-Zugriffe in der HTML-Vorschau.

KI-Themen wachsen je Lektion: eigene Deklaration vor Parametern, Parameter vor
return, Rückgaben vor Standardwerten/Scope und Zusammensetzung. Spätere JS-
Techniken bleiben gesperrt; die existente Freigabe für Codeausschnitte und der
Vorrang aktueller fehlgeschlagener Kriterien bleiben gleich.

## Nachweise

Browser-/Electron-Tests für Starter/Lösungen/Alternativen, direkt aufgerufene
Schnittstellen, falsche globale Abhängigkeit, return/log-Verwechslung, fehlende
Aufrufe, Standard-0, äußeren Zustand, Blockfehler, Zusatzprotokolle und Tarifgrenzen.
Zeitgrenze und Fehler erst während der Probe, erneute Korrektur, Erhalt älterer
Prüfstände, JSON/Reload, optionale Vorschau und vollständiger Desktop-Neustart.
Endgültige Testzahlen und unabhängiger Review im
[Brief](agent-briefs/FE-031-javascript-kapitel-16.md).

Ergebnis: vollständiger Lauf mit 137 Werkstatt-/Kontext-/KI-Fällen grün;
nach Reviewkorrektur alle 23 betroffenen JS16-/freie-Konsole-Fälle grün.
206 Backendtests/22 Suiten, Lint und Build erfolgreich; bestehender Größenhinweis.
Der frische unabhängige Review prüfte alle 47 Lösungs- und 47 Alternativdatenfälle,
zehn Starter sowie direkte Ressourcenüberschreitungen. Die gefundene nachlaufende
Joblücke ist behoben und durch zwei Repros/Nachreview abgesichert. Keine offenen
Findings. Praktische Rückmeldung zum neuen Kapitel und weitere Plattformen bleiben
separat.

Private Unterlagen oder echte Anmeldedaten sind keine Test-/Fachquellen.
Die Nachweise betreffen Windows/Chromium/Electron mit künstlichen Profilen.
FE-034 ergänzt inzwischen [Kapitel 17](34-JavaScript-Kapitel-17.md) mit Arrays,
Schleifen, Objekten und Aufgabenübersicht; später folgen Browser-
DOM und dessen separate Architektur-/Abnahmegates.

Primärquellen für die eigenen Kurstexte:

- [MDN: Funktionen](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Functions)
- [MDN: Rückgabewerte](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Return_values)
- [MDN: Deklarationen](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function)
- [MDN: Standardparameter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: Gültigkeitsbereiche](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types#variable_scope)
