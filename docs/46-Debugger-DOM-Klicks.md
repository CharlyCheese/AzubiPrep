# Debugger: HTML und Klickereignisse

## Einstieg

In der Frontend-Werkstatt „Debugger öffnen“ wählen. Auf der eigenen Seite
`/frontendkurs/debugger` ist der Arbeitsbereich sofort offen. Dort den Debugmodus „HTML und Klickereignisse“ wählen. Vorhandene Modulquellen bleiben
zunächst erhalten. „DOM-Beispiel laden“ ersetzt nach Bestätigung HTML und JS
bewusst durch einen Klickzähler. Die HTML-Quelle ist ein kurzer Body-Ausschnitt;
Skripte gehören in die Moduldateien, nicht in das HTML.

„Debuggen starten“ hält vor der ersten Anweisung. Mit „Weiter / bis zum nächsten
Haltepunkt“ zunächst die Listener einrichten. Danach meldet die Vorschau
„Bereit für Klicks“. Ein Klick hält vor dem ersten Handler an. Schritte,
Überspringen, Verlassen und dateigenaue Haltepunkte funktionieren wie bisher.
Textänderungen werden erst sichtbar, wenn die Zuweisung ausgeführt wurde.
Weitere Klicks sind während Vorbereitung, Lauf und Pause gesperrt. Nach dem
Handler bleibt derselbe VM-Zustand für weitere Klicks erhalten, ohne Replay.

Die Aufrufkette bezeichnet den internen Ereignisaufrufer als „Vorschauklick“;
seine technische Position wird nicht als Nutzerzeile ausgegeben. Handler haben
echte ursprüngliche Datei-/Zeilen-/Spaltenpositionen und erfasste Bindungen.

## Erster freigegebener Umfang

- document.body, querySelector/querySelectorAll für #id, .klasse oder einen
  Tagnamen sowie getElementById. querySelectorAll liefert eine statische Liste
  in Form eines begrenzten Arrays von Elementhandles, keine vollständige NodeList.
- textContent, id, className, tagName; disabled bei Buttons. classList mit
  add/remove/toggle/contains. Klassen und IDs sind im aufklappbaren Elementzustand
  sichtbar. Eigene CSS-Regeln und App-Styles werden nicht angewendet.
- add/removeEventListener für click mit eigener registrierter Funktion; drittes
  Argument ausschließlich false/undefined. Identität, Entfernen, spätes
  Hinzufügen und Bubbling im Elternpfad werden berücksichtigt.
- event.type/target/currentTarget/bubbles/defaultPrevented,
  preventDefault/stopPropagation/stopImmediatePropagation. Erzeugte Klicks
  bubblen und sind abbrechbar; keine Standardnavigation oder Formaktion.
- Sichere Struktur-/Text-/Button-Tags. Kein innerHTML, keine Ressourcen, Styles,
  Inlinehandler, Links, Formulare, Eingaben, DOM-Erzeugung oder programmgesteuertes
  click/dispatchEvent. Kein asynchroner Code, Timer oder Browser-/Hostzugriff.

Ein Teilumfang ist bewusst explizit. Nicht unterstütztes gültiges HTML/JS wird
abgewiesen, nicht als generell falsches Webwissen dargestellt. Der lokale Parser
interpretiert HTML; dies ist kein vollständiger HTML-Validator oder nativer
Browser-DOM-Debugger. Funktionen wie Capture/once/passive, Pointer-/Tastaturdaten,
weitere Ereignistypen, Formular- und CSS-Verhalten benötigen eigene Ausbaustufen.

## Abschirmung und Lebenszyklus

Das bereits freigegebene Linkedom interpretiert ausschließlich den begrenzten
HTML-Text im Vorbereitungsworker. Keine Browser-DOMParser-Ressourcenauflösung.
QuickJS erhält nur einen validierten Baum und gebrandete private Modellhandles.
Sourcezugriffe passieren die bestehenden Schlüssel-/Reflexions-/Funktionsgates;
keine Eigenschaft führt zu einem echten App-/Browser-/Datei-/Netzobjekt.
React rendert nur erlaubte Baumdaten als Text/Tags. Quell-ID und -Klasse werden
nicht als echte DOM-ID/-Klasse oder Styles in die App übernommen. Kein Roh-HTML.
Host und Worker prüfen Baumdaten, Klick-IDs, Revision, Reihenfolge und Phase.

Nach der einmaligen Initialisierung lebt dieselbe begrenzte VM weiter. Pro Klick
läuft genau eine sequentielle Auswertung; kein zweiter VM-Aufruf bei Pause,
keine Warteschlange für nachträgliche Klicks. Stop, Quell-/Moduswechsel und
Schließen beenden den Worker physisch. Fünf Minuten ohne Bedienung in Pause oder
Ereigniswartepunkt beenden die Sitzung ebenfalls. Ein Neustart beginnt wieder
mit Original-HTML und neuem Programmzustand.

HTML/JS werden lokal mit dem Modulprojekt gesichert und als JSON exportiert.
Live-DOM, Ereignisse, Listener, Logs, Variablen und Haltepunkte werden nicht
mitgesichert oder an KI übertragen. Einlesen/Reload führt nichts automatisch aus.
Private Unterlagen und Konten sind für diesen Debugger nicht zugänglich.

## Grenzen

| Grenze | Maximum je Sitzung |
|---|---:|
| HTML | 16 KiB UTF-8 |
| Modellknoten einschließlich Text | 128 |
| Tiefe ab Body | 16 |
| Text-/Attributfeld | 2048 Zeichen |
| Gesamter Text/Attribute | 16 KiB UTF-8 |
| Baumdarstellung | 32 KiB UTF-8 |
| Listenerregistrierungen, auch später entfernte | 128 |
| Klickaktionen | 64 |
| DOM-Schreiboperationen | 2048 |

Die bisherigen Grenzen gelten gemeinsam über Initialisierung und sämtliche
Klicks, insbesondere eine Sekunde aktive Laufzeit, 16 MiB Heap, 64 KiB Stack,
32 MiB WASM, 10000 Kontrollpunkte, 2000 Pausen und 4096 Nachrichten/2 MiB
Protokoll. Eine andere Grenze kann deshalb früher greifen. Lese-/Idlezeit zählt
nicht als aktive Zeit. Modellschutz- und Ressourcengrenzen bleiben endgültig,
auch bei try/catch. Vollständige Budgettabelle: Dokument39.

## Prüfung

Synthetische DOM-/Klick-, Semantik-, Sicherheits-, Ressourcen-, Persistenz-,
Mobil- und Windows-Electronfälle in e2e/tests/debugger-dom.spec.js. Listener-
und Tokenverhalten zusätzlich gegen einen unabhängigen echten Chromium-DOM
verglichen; ausschließlich selbstverfasste Testprogramme, kein Nutzerquelltext.
12/12 neue gezielte und421/421 gesamte Browser-/Windows-Electronfälle ohne
Wiederholung grün. Sieben agentseitige Bedienkontrollen im laufenden lokalen
Stand, Tastaturklick sowie Hell-/Dunkel-/Mobilansicht bestätigt. Unabhängiger
Abschlussreview ohne offene Findings. Service Worker v41.
Ausführliche Prüfergebnisse und unabhängiger Abschlussreview sind im
[Arbeitsbrief FE-052](agent-briefs/FE-052-debugger-dom-klicks.md) festgehalten.

Referenz für Tokenlisten und Eventdispatch:
[WHATWG DOM Standard](https://dom.spec.whatwg.org/#domtokenlist).
Keine neue Bibliothek, keine Installationspakete, kein Commit/Push.

FE-053 ergänzt die eigene Debuggerseite mit Rückweg und gemeinsamem Projektspeicher.
Die oben dokumentierte421er-Regressionszahl gehört zum DOM-Stand FE-052; aktuelle
Navigationsnachweise stehen im [FE-053-Brief](agent-briefs/FE-053-debugger-eigene-seite.md).

FE-054 ergänzt optionale eigene [CSS-Gestaltung im Debugger](47-Debugger-CSS.md).
Mit CSS wird nur ein gesonderter skriptloser Rahmen gestaltet; die oben genannten
CSS-Ausschlüsse beschreiben den ursprünglichen FE-052-Umfang. Formular-/weitere
DOM-APIs bleiben eigene Stufen.
