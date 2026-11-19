# Texteingaben und Formulare im Debugger

## Schrittweise ausprobieren

Werkstatt → Debugger öffnen → Modus „HTML und Ereignisse“ →
„Formularbeispiel laden“. Das ersetzt nach Bestätigung die bisherigen
HTML-/CSS-/Modulquellen. „Debuggen starten“ hält vor der ersten Anweisung.
Mit „Weiter / bis zum nächsten Haltepunkt“ zunächst die Listener einrichten.

1. Einen Namen in der Vorschau eingeben. Er bleibt zunächst ein flüchtiger
   Eingabeentwurf; die VM kennt weiterhin den zuvor übernommenen Wert.
2. „Eingabe übernehmen“ löst je geändertem Feld einmal input und anschließend
   change aus. Der erste ausgeführte Handler hält vor seinem Beginn an.
3. Mit Einzelschritten beobachten, wann der Hinweistext geändert wird; mit
   „Weiter“ die restlichen Handler ausführen. Die Konsole bestätigt die Eingabe.
4. „Begrüßen“ anklicken. Im submit-Handler preventDefault, Leerprüfung mit
   value.trim() und sichtbare Begrüßung untersuchen. Auch Leerzeichen testen.

Ein Vorschauklick oder Enter im Textinput übernimmt offene Feldentwürfe vor
der Klick-/Submitverarbeitung. Bei mehreren Feldern stehen zunächst alle
übernommenen Werte bereit; danach folgen input/change je geändertem Feld in
Elementreihenfolge. Haltepunkte funktionieren auch in nachfolgenden Handlern.
Während Vorbereitung, Ausführung und Pause werden keine neuen Eingaben oder
Vorschauereignisse angenommen. Es gibt keine Ereigniswarteschlange.

Diese Übernahme ist eine ausdrücklich gekennzeichnete Debug-Bedienung. Im echten
Browser entsteht input bereits bei der Eingabe; change bestätigt eine Änderung,
bei Textfeldern üblicherweise beim Verlassen. Hier werden die Zeichen eines
Entwurfs zusammengefasst, damit nicht nach jedem Buchstaben fortgesetzt werden
muss. Klicks auf Textfelder und Labels dienen hier Fokus/Caret und lösen keine
modellierten Klickhandler aus. Ohne geänderte Entwürfe entstehen keine input-
oder change-Ereignisse. Eine Änderung auf einen leeren Wert löst sie ebenfalls
aus. Programmatische value-Zuweisungen bleiben dagegen still.

## Unterstützter Umfang

- input ohne type bzw. type="text", textarea, form, label mit for und button
  mit type="button"/"submit". Ein Button ohne type gilt im Modell als Submitbutton;
  ohne zugeordnetes umgebendes Formular entsteht kein Submit.
- Eingabewerte über value, boolesche disabled/readOnly; Eingabeattribute value
  (nur input), placeholder und readonly. Initialer Textarea-Inhalt bleibt
  textContent und wird vom späteren Livewert unterschieden. Textarea-textContent
  aktualisiert value nur, solange der Wert noch nicht separat verändert wurde.
  HTML-Typangaben werden ohne Groß-/Kleinschreibung ausgewertet; Textarea-
  Zeichenreferenzen und der erste Zeilenumbruch entsprechen der HTML-Auswertung.
- Textinput entfernt CR/LF aus value; textarea normalisiert CR/CRLF nach LF.
  value=null wird leer, andere erlaubte primitive Werte werden zu Text.
  Primitive Zeichenfolgen unterstützen den gebundenen nativen Aufruf trim().
- Listener für click, input, change und submit, jeweils eigene registrierte
  Funktionen ohne Capture/once/passive. Identität besteht aus Typ und Funktion.
  Entfernen eines click-Listeners entfernt nicht dessen input-Registrierung.
- target/currentTarget/type/bubbles/cancelable/defaultPrevented und
  preventDefault/stopPropagation/stopImmediatePropagation. input/change bubblen
  ohne abbrechbar zu sein; click/submit sind abbrechbar. submitter ist bei Submit
  der auslösende Modellbutton, bei unmittelbarem Submit bzw. Enter ohne Button null.
- Submitbutton-Klick: erst Klickhandler, dann bei nicht verhindertem Standard
  Submit am Formular. Enter im Textinput verwendet den ersten Submitbutton,
  ein deaktivierter Defaultbutton verhindert das Absenden. Ohne Submitbutton
  wird nur bei genau einem Textinput implizit abgesendet. Enter in textarea
  bleibt ein Zeilenumbruch. Weitere native Tastatur-/Fokusdetails folgen separat.

Andere Inputtypen (auch Datei-/Passworteingabe), select, name, form-Zuordnung,
action/method/target/formaction, required/Constraint-Validation/FormData,
reset, submit()/requestSubmit()/dispatchEvent(), HTML-Ressourcen und Inlinehandler
sind noch nicht unterstützt. Nicht unterstützte gültige Webfunktionen sind damit
keine HTML-Fehler, sondern außerhalb dieses freigegebenen Modellumfangs.

## Abschirmung und Speicherung

Die Browservorschau erhält ausschließlich validierte Baumdaten. Mit CSS bleibt
sie im skriptlosen Frame mit unveränderter Sandbox/CSP, einschließlich form-action
none. Tatsächliche Vorschau-Buttons haben type="button"; ihre Submitfunktion wird
erst innerhalb der QuickJS-VM modelliert. Die Elternbrücke verhindert native
Submit-/Enteraktionen. Ein Modellsubmit überträgt niemals Daten und navigiert
auch ohne preventDefault nicht. preventDefault bleibt als Lerninhalt sichtbar.

Ohne CSS werden Quell-IDs/Klassen weiterhin nicht als App-IDs/Klassen benutzt.
Nur Textfelder erhalten intern erzeugte, präfixierte IDs für Labels. Textwerte
werden als Reactwerte dargestellt; kein innerHTML, keine Quelle in srcDoc.
Autovervollständigung wird deaktiviert; der Pilot ist für synthetische Übungswerte.

Controller und Worker prüfen dasselbe enge Ereignisschema unabhängig. Zulässig
sind eine begrenzte Modell-ID, ein festgelegter Aktionstyp und optional eindeutige
Feld-IDs mit primitiven Strings. Feldzugehörigkeit, Verbindung, disabled/readOnly
werden zusätzlich in der VM geprüft. Der Controller kopiert akzeptierte Payloads.
Sitzung, Revision, Sequenzen und synchrones Einzeldispatch-Gate bleiben erhalten.

Unveränderte Grenzen: 2048 UTF-16-Codeeinheiten je Wert, insgesamt 16 KiB Text,
128 Knoten, Tiefe 16, 32 KiB Baumdarstellung, 128 Listenerregistrierungen,
2048 Modellschreiboperationen und eine Sekunde gemeinsame aktive Laufzeit.
Die 64 Ereignisse pro Lauf zählen jetzt jeden click/input/change/submit, auch
ohne Listener: eine Feldübernahme benötigt zwei, ein Submitbutton-Klick zwei.
Die übrigen VM-/AST-/Protokoll-/Pausegrenzen gelten weiterhin unverändert.

JSON und Werkstattspeicher enthalten nur Original-HTML/CSS/JavaScript. Eingabe-
entwürfe, übernommene Livewerte, DOM, Ereignisse und Debugzustände sind flüchtig.
Quellenänderung, Seitenwechsel oder Neustart beendet die Sitzung. Kein Anschluss
an KI, Konten, Unterlagen, Datei- oder Netzwerkfunktionen.

## Nachweise

Die gezielten Fälle stehen in e2e/tests/debugger-forms.spec.js, ergänzt durch
DOM-/CSS-Gegenproben. 454 Gesamtfälle vor der letzten Parserkorrektur, danach
alle 34 betroffenen Formular-/DOM-/CSS-Fälle einschließlich neuer nativer
Parserreferenz ohne Wiederholung bestanden. Sieben Bediengruppen mit drei
kontrollierten Bildern bestätigt. Ausführliche Test-/Bedien-/Reviewbefunde
stehen im [FE-055-Brief](agent-briefs/FE-055-debugger-formulare.md).

Fachreferenzen: [HTML-Textinput](https://html.spec.whatwg.org/multipage/input.html#text-(type=text)-state-and-search-state-(type=search)),
[Formularübermittlung/implizites Absenden](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#implicit-submission),
[DOM-Ereignisdispatch](https://dom.spec.whatwg.org/#concept-event-dispatch).

FE-056 ergänzt darauf aufbauend [Elemente erzeugen und entfernen](49-Debugger-Elemente.md).
Auch dynamisch erzeugte Textfelder nutzen dieselben begrenzten Eingabeereignisse;
Entwürfe abgetrennter/gesperrter Felder werden verworfen. Knoten-/Textbudgets
berücksichtigen nun alle gehaltenen Teilbäume statt nur die sichtbare Wurzel.
