# CSS-Unterstützung im Debugger

## Einstieg

Werkstatt → Debugger öffnen → Debugmodus „HTML und Klickereignisse“.
„CSS bearbeiten und einlesen · styles.css“ aufklappen. Dort CSS schreiben oder
bewusst eine einzelne CSS-Datei einlesen. „CSS-Beispiel laden“ ersetzt nach
Bestätigung HTML, CSS und Moduldateien durch eine Karte mit Umschaltbutton.

„Debuggen starten“ hält vor der ersten Anweisung. Mit „Weiter“ die Listener
anlegen, dann in der gestalteten Vorschau „Farbe wechseln“ anklicken. Der erste
Ereignishalt liegt vor dem Handler. Vor classList.toggle ist die Karte blau;
nach Ausführen dieser Anweisung grün. Weitere Klicks wechseln wieder zurück.
Haltepunkte, Schritte und Parameter bleiben echte Zustände derselben QuickJS-VM.

Die Gestaltung stammt vom Browser im 400 Pixel hohen Vorschaurahmen. Klassen,
IDs, Farben, Typografie, Abstände, Rahmen, Flex/Grid und begrenzte Medienregeln
werden dort angewendet. Text-/Klassen-/ID-Änderungen aus dem Modell erscheinen
erst nach ihrer Ausführung. Die tatsächliche Modell-Baumstruktur bleibt in
„Elementzustand: IDs und Klassen“ sichtbar. Während Pause/Lauf sind Vorschauklicks
und Buttons gesperrt; diese Bediensperre ist keine Änderung des Modell-disabled.

## Quellen und Speicherung

HTML bleibt ein Body-Ausschnitt, JavaScript bleibt im geprüften Modulprojekt.
CSS ist eine zusätzliche einzelne Quelle mit festem Exportnamen styles.css.
HTML-Link-/Style-Tags und CSS-Imports aus JavaScript bleiben gesperrt. Ein
Modulordnerimport übernimmt weiterhin ausschließlich geeignete JS-Dateien.
Mehrere CSS-Dateien und deren Verknüpfungen sind eine spätere Erweiterung.

JSON-Sicherung und bestehender lokaler Werkstattspeicher enthalten optional das
ursprüngliche CSS-Feld. Alte Stände ohne CSS bleiben kompatibel. Einzelner
CSS-Export enthält den eigenen Originaltext; der Vorschaufilter ändert ihn nicht.
Einlesen prüft einfache Dateinamen, Pfad und Größe vor Lesen. Ersetzen erst nach
Bestätigung, veraltete Leseergebnisse nach Projektwechsel werden verworfen.

Änderungen an CSS beenden die Sitzung wie Änderungen an HTML/JavaScript. Beim
Neustart beginnt die Vorschau aus den Originalen, nicht dem zuvor veränderten
Live-DOM. Reload/Seitenwechsel/Electron-Neustart starten keinen Code automatisch.
CSS, DOM-Werte und Debugzustände werden nicht an KI übertragen. Keine privaten
Unterlagen oder Kontodaten sind an diese Funktion angebunden.

## Freigegebener CSS-Umfang und Grenzen

Wiederverwendung des vorhandenen Werkstattfilters cleanCSS, keine neue Bibliothek.
Native CSSOM-Auswertung mit erlaubten Eigenschaften und einfachen Selektoren
(Tag, #id, .klasse, Kombinationen, Listen/Kombinatoren und die vorhandenen
hover/focus/root-Pseudoklassen). Unterstützte Medienbedingungen betreffen
min/max-width mit px/em/rem sowie prefers-reduced-motion, begrenzt kombiniert.

CSS maximal 16 KiB UTF-8, maximal 300 Regeln, Medientiefe 4, maximal 250 Zeichen pro
Wert und 300 Zeichen pro Selektor. Zusätzlich gelten alle vorhandenen HTML-/Baum-/
VM-/Nachrichten-/Klickgrenzen. Nicht unterstützte Regeln/Eigenschaften werden
mit Hinweis verworfen. Bei einer überschrittenen Regellimitierung bleibt die
Gestaltung aus, mit Meldung; das begrenzte JS-Modell kann weiter untersucht werden.
Bei Kurzschreibweisen können Browser zusätzliche Reset-Eigenschaften erzeugen;
auch dafür können Filterhinweise erscheinen. Das mitgelieferte Beispiel verwendet
explizite Rahmen-Langformen und benötigt keine solchen Hinweise.
Dies ist kein vollständiger CSS-Validator: Browser können fehlerhafte oder
unvollständige Regeln ignorieren. Exportiert wird weiterhin die Originalquelle.

Keine Ressourcen-URLs, Imports, Webfonts, eigenen Eigenschaften/var(), Animationen
mit keyframes, freien At-Regeln oder allgemeinen CSS-/getComputedStyle-Zugriffe
für Lern-JavaScript. CSS-Transitions können als reine Browserdarstellung weiter-
laufen; sie erzeugen keine Modelljobs oder zusätzlichen JavaScript-Schritte.

## Abschirmung

Mit CSS rendert React ausschließlich validierte Baumdaten in einem eigenen
iframe. srcDoc ist ein fester vertrauenswürdiger Rahmen ohne Quelltextinterpolation.
Der iframe erlaubt keine Skripte. allow-same-origin dient ausschließlich dem
vertrauenswürdigen Elternrenderer und der Klickbrücke; Lern-JS bleibt in QuickJS
und erhält niemals das echte Dokument oder Fenster. CSS gelangt nur als gefilterter
Textknoten in einen Style-Knoten. Quell-IDs/-Klassen existieren nur im Frame.

CSP default-src/script-src/connect-src/img-src/font-src/media-src/frame-src/
object-src/worker-src/base-uri/form-action none sperrt Ressourcen und Aktionen;
style-src unsafe-inline erlaubt nur die lokale Gestaltung. Der CSS-Filter und
CSP werden unabhängig geprüft. Sandbox sperrt Skripte, Formulare und Navigation
außerhalb des Rahmens zusätzlich. Auch fixed/inset/z-index können die App und
Stopknöpfe nicht überdecken. Ohne CSS bleibt die bisherige strukturelle Ansicht.

Klicks verwenden ausschließlich IDs aus dem aktuellen validierten Modellbaum.
Parent und VM sperren synchron gegen doppelte Ereignisse. Der Renderer sperrt
zusätzlich lokal bis zum nächsten bestätigten Idle-Zyklus; auch handlerlose Klicks
werden wieder freigegeben. Keine zweite VM-Auswertung während einer Pause.
Listener hängen am konkreten Framedokument und werden beim Entfernen gelöst.

## Nachweise

Automatisierte Fälle in e2e/tests/debugger-css.spec.js ergänzen native Gestaltung,
Kaskade/Vererbung/Media/Grid, echte Handlerpausen, Tastatur und verschachtelte
Targets, Doppelklick-/Idle-Gates, CSS-/CSP-Negative, Import/Persistenz und
Windows-Electron-Neustart. 440/440 gesamte Browser-/Windows-Electronfälle ohne Wiederholung bestanden.
Nach Bereinigung der Beispieldaten alle 10 CSS-Fälle erneut ohne Wiederholung
grün, einschließlich Windows-Electron-Neustart und unabhängiger CSP-Probe.
Sieben tatsächliche agentseitige Bediengruppen sowie Vor-/Nach-/Mobilbilder
abschließend bestätigt. Unabhängiger Review ohne offene Findings. SW v44.
Die ausführlichen Ergebnisse sind im [FE-054-Brief](agent-briefs/FE-054-debugger-css.md) dokumentiert.

Technische Referenzen: [HTML-iframe/Sandbox](https://html.spec.whatwg.org/multipage/iframe-embed-object.html#attr-iframe-sandbox),
[CSSOM replaceSync](https://drafts.csswg.org/cssom/#dom-cssstylesheet-replacesync).
