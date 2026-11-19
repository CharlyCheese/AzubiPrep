# FE-055 – Texteingaben und Formulare im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-02

## Ziel und Schritte

Auf FE-054 aufbauend zuerst text-input/textarea und value/disabled/readOnly,
dann input/change und zuletzt form/submit mit preventDefault und submitter.
Bewusst ladbares Begrüßungsbeispiel mit Leerprüfung, Ereignishalten derselben VM.
Keine neue Bibliothek. Quellen lokal, Laufwerte ausschließlich flüchtig.
Für die Leerprüfung primitiveString.trim() als eng gebundene, privat erfasste
native Methode ergänzen; keine allgemeinen Stringprototyp- oder Methodenaliase.

Explizite didaktische Bedienung: Texte werden zunächst im Renderer als Entwurf
gesammelt. „Eingabe übernehmen“ überträgt begrenzte Textwerte und löst für
geänderte Felder input, danach change aus. Vorschauklicks/Absenden übernehmen
offene Eingaben vorher. Das ist eine gekennzeichnete Zusammenfassung realer
Eingabeereignisse; keine Behauptung nativer Ereigniszeitpunkte beim Tippen.
Native Eingaben/Enter/Submit dürfen nie eine Formularnavigation auslösen.

## Allowlist

- frontend/src/pilot/debugger-dom.js, debugger-dom-parse.js
- frontend/src/pilot/debugger.js, debugger.worker.js, debugger-core.js
- frontend/src/components/DebugDOMPreview.jsx, JsDebuggerPilot.jsx
- frontend/src/styles/pilot.css, frontend/public/sw.js
- neue e2e/tests/debugger-forms.spec.js
- e2e/tests/debugger-dom.spec.js (veraltete Ausschlüsse ersetzen, alte Gates erhalten)
- docs/38-Quellcode-Debugger-Planung.md, 46-Debugger-DOM-Klicks.md,
  47-Debugger-CSS.md; neue docs/48-Debugger-Formulare.md
- dieser Brief, docs/agent-briefs/STATUS.md, DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahmekriterien

1. Textinput/textarea, label-for, form und button button/submit; Standardbutton
   im Formular submit. Andere Typen, URLs, name/form-Zuordnungen, Inlinehandler,
   Ressourcen, native submit/requestSubmit/dispatchEvent und Hostzugriffe gesperrt.
   Snapshot validiert Zustände, Typen, Attribute, Knoten-/Text-/Bytegrenzen genau.
2. value primitiver String/Normalisierung wie Textfelder, initiales value bzw.
   textarea-Inhalt getrennt vom aktuellen Wert. Programmatische value-Zuweisung
   erzeugt keine Eingabeereignisse. disabled/readOnly verhindern Nutzereingabe,
   nicht die erlaubte programmgesteuerte Zuweisung.
3. input/change bubblen, sind nicht abbrechbar; click/submit sind abbrechbar.
   Listeneridentität nach Typ und Funktion; Target/currentTarget/submitter korrekt,
   unveränderte Handler-/Bubbling-/Entfernungsregeln. Click.preventDefault
   verhindert modelliertes Submit. submit.preventDefault sichtbar, auch ohne
   preventDefault niemals echter Versand. Enter mit Defaultbutton bzw. einem
   Textinput begrenzt unterstützt, textarea-Enter bleibt Zeilenumbruch.
4. Streng begrenztes Ereignisschema in Controller UND Worker; fremde/alte/
   doppelte Ereignisse, Werte fremder Knoten, Eingaben während Pause abweisen.
   Ein Dispatch, kein Replay/keine Queue; unveränderte gemeinsame Zeit-/Schreib-/
   Ereignis-/Nachrichtenlimits. Unter/auf/über Grenzen und Abbruch/Neustart prüfen.
5. Gestalteter skriptloser Frame und strukturelle Ansicht funktionieren. Keine
   Navigation/Netz-/Datei-/Konten-/KI-/RAG-Rechte, Stop bleibt außerhalb der CSS.
   Keine Quelle in srcDoc, nur validierte Daten. Texte als Reactwerte rendern.
6. Originalexport/Reload/Seitenwechsel/Electron-Neustart erhalten nur Quellen,
   keine Entwürfe der Eingabefelder, Ereignisse oder Livewerte. Alte Projekte
   kompatibel; Tastatur/Mobilansicht verständlich und nutzbar.
7. Zieltests und angemessene Gesamtregression/Build, eigene Bedien-/Bildprobe,
   frischer unabhängiger Review; Doku und Archivcheck grün vor Fertigmeldung.

## Ergebnis

Textinput und textarea mit getrenntem Default-/Livewert, value/disabled/readOnly,
Formulare und Submitbuttons implementiert. Textentwürfe werden in der Vorschau
gesammelt und ausdrücklich übernommen; Vorschauklick/Enter/Absenden übernehmen
sie vorher. Zuerst alle Batchwerte anwenden, danach input/change je geändertem
Feld in Elementreihenfolge. Initiale/programmatische Wertänderungen bleiben ohne
Ereignisse. Vergleich des Textarea-dirty-Verhaltens und der Zeilenendnormalisierung.
Primitive String.trim() privat erfasst und eng gebunden, keine Reflexion/Aliase.

Getrennte Listeneridentität nach Typ und Funktion, nicht abbrechbare input/change,
abbrechbare click/submit, submitter und Click-Defaultaktion. Enter verwendet den
Defaultbutton oder bei genau einem Textinput einen impliziten Submit. Deaktivierter
Defaultbutton sperrt diesen Pfad, readonly-Input kann weiterhin absenden;
Textarea-Enter bleibt Zeilenumbruch. Kein echter Datentransport, auch ohne
preventDefault. Weitere Feldtypen und native Validierungs-/Form-APIs bleiben
gesperrt, nicht als allgemein ungültiges HTML bezeichnet.

Controller und Worker prüfen identisches enges Ereignisschema unabhängig;
akzeptierte Controllerdaten werden kopiert. VM prüft Feldtyp/Verbindung/Flags
vor der Batchänderung. Alte Sitzung/falsche Revision, doppelte Ereignisse und
Eingaben während Pause werden nicht angenommen. Alle bestehenden Ressourcen-
und Rechtegates unverändert. Das unveränderte 64er-Ereignisbudget umfasst nun
jeden click/input/change/submit; Feldübernahme bzw. Submitbutton benötigen je
zwei Ereignisse. Eingabeentwürfe und Livewerte bleiben flüchtig, keine KI-/RAG-
oder Kontoanbindung. Originalexport/OPFS bleiben kompatibel.

Einheitliche Elternbrücke für strukturierte Ansicht und skriptlosen CSS-Frame;
echte Buttons stets type=button, native Submit-/Enteraktionen abgefangen,
unveränderte CSP/Sandbox. Quell-IDs/Klassen bleiben im Frame; in der Struktur-
ansicht nur interne präfixierte Textfeld-IDs für Labels. Bewusstes Formular-
beispiel und kompakte Anleitung mit aufklappbarer Erklärung des vom Browser
abweichenden Eingabezeitpunkts. Cacheversion v46.

Zwölf neue Formularfälle einschließlich Browser-/Windows-Electronpraxis,
Source-/Entwurfs-/Livewerttrennung, Unicode-/Feld-/Gesamttextschema, tatsächlicher
Worker-Negative, Controller-Own-Copy/Revision/Idle-Gates, exakter Schreib-/
Ereignisgrenzen sowie nativer Browserreferenzen für Ereignisse/Parser.
Erster Zielstand31/31 grün; danach vollständige Regression454/454 ohne
Wiederholung (Chromium153.0.8010.12, Windows-Browser/Electron,6,4Minuten).

Der anschließende frische unabhängige Reviewer fe055_forms_review fand zwei
P2-Parserabweichungen: Linkedom erhielt Textarea-Entities/erstes LF unverändert
und der Typfilter unterschied Groß-/Kleinschreibung. Lokal sicher dekodiert/
normalisiert, ohne Quellen zu verändern oder Markup auszuführen. Zwölfteiliger
Chromium-Referenztest ergänzt (inkl. literalem Markup, doppelter Entity, Unicode,
numerischem LF, CRLF, Typ-Großschreibung und weiter gesperrten Feldtypen).
Reviewer prüfte beide Korrekturen eigenständig nach, keine offenen Codefindings.
Nach diesen begrenzten Parser-/Hinweisänderungen Produktionsbuild und sämtliche
34 betroffenen Formular-/DOM-/CSS-Fälle erneut ohne Wiederholung grün. Der neue
Parserfall war noch nicht im vorhergehenden454er-Gesamtlauf enthalten.

Sieben selbstständige Bediengruppen am tatsächlich laufenden lokalen Webstand
in isoliertem Chromiumprofil bestanden: Startpause/Initialisierung, zunächst
passiver Textentwurf, Tastaturübernahme mit echtem input-Halt und Mutation nach
Einzelschritt, Submit mit Haltepunkt vor trim/korrektem Variablenwert/Begrüßung,
Enter mit Leerprüfung, Seitenwechsel mit physischem Workerende und verworfenen
Livewerten/Entwürfen,390px-Dunkelansicht ohne Seitenüberlauf und Tastatur-Stop.
Skript, Ergebnis und drei kontrollierte Bilder unter ignoriertem
e2e/test-results/fe055-bedienung. Keine Nutzerdaten/Entwürfe verwendet.

Keine neuen Bibliotheken, privaten Ablagen/PDFs, Installer, Commits oder Pushes.
Die vorherige OPS-042-GitHub-CI-Bestätigung im Status/Archiv sachlich nachgetragen.
Abschließender Dokument-/Bildreview bestätigt die drei Ansichten und die
Test-/Bediennachweise. Eine missverständliche Aussage zu leeren Entwürfen
präzisiert: Eine Änderung auf den leeren Wert erzeugt ebenfalls input/change;
nur ohne geänderte Entwürfe entstehen keine Eingabeereignisse. Keine offenen
Code-, Dokument- oder Bildfindings. STATUS/DONE aktualisiert. Archivcheck grün:
329 erledigte Tasks,10 offen; git diff --check ohne Fehler.
