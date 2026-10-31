# HTML-Formulare: Kapitel 13

Stand: 31.10.2026, FE-027. Die Werkstatt enthält im Entwicklungsstand
43 Lektionen für Kapitel 1–13. Sechs neue Lektionen ergänzen die responsive
Website um ein Formular. JavaScript bleibt gesperrt; dessen Ausführung und
Sicherheitsgrenzen werden vor Kapitel 14 gemeinsam geplant. Keine neuen Installer.

## Lernfolge

| Lektion | Neue Inhalte | Praktische Aufgabe |
|---|---|---|
| formular-start | form, label/for/id/name, Textfeld, submit-Button; action/method als Konzept | Wirklich verbundenes Label und benanntes Textfeld mit lokaler Prüfung |
| formular-eingabetypen | email, tel, number, textarea | Passende Kontakt-, Zahlen- und Nachrichtenfelder ergänzen |
| formular-auswahl | select/option, Checkbox, Radiogruppe, fieldset/legend | Sinnvolle Auswahlwerte und echte gegenseitige Radioauswahl |
| formular-browserpruefung | required, min/max/step und Grenzen der Browserprüfung | Pflichtfelder, ganze Platzzahl 1–8 und ungültige/gültige Beispiele |
| formular-bedienung | aria-describedby, flexible Breiten, Fokus, Tastatur | Sichtbarer Zahlenhinweis und bedienbares Formular bei 360/1280px |
| formular-projekt | Selbstständiger Transfer in die eigene Website | Vollständige Anfrage mit eigenem Thema, Korrektur und Export |

Jede Lektion enthält Voraussetzungen, Erklärung, Beispiel, Auftrag, zwei Hinweise
und eine mögliche Lösung. Starter enthalten jeweils den vorherigen HTML-Stand;
neue Elemente oder Regeln müssen tatsächlich ergänzt werden. Die erste Aufgabe
beginnt mit einem Formgerüst, das Projekt mit Grundfeldern. Eigene Zwischenstände
können bewusst eingelesen werden. Eigene IDs, Klassen, Texte und gleichwertige
Labelvarianten einschließlich umschließender Labels sind zulässig.

Die Texte unterscheiden id und name, Platzhalter und sichtbares Label, freiwillige
und erforderliche Angaben sowie Browserhilfe und serverseitige Absicherung.
POST wird nicht als Verschlüsselung dargestellt; tel behauptet keine allgemeine
Nummernprüfung. Im Projekt darf das Formular auf einer beliebigen Projektseite
stehen. Die bekannte Mehrseitenstruktur, gemeinsame CSS und Bilder bleiben erhalten.

## Lokale Vorschau und Versandgrenzen

Freigegebene Elemente: form, label, input, textarea, select, option, optgroup,
fieldset, legend und button. Eingabetypen sind auf text/email/tel/number,
checkbox/radio sowie submit/reset/button begrenzt. Upload-, Passwort-, versteckte
oder Bild-Abgabefelder gehören nicht zu diesem Übungsumfang. Formulareigenschaften
wie Namen, Beschriftungsverweise, min/max/step, required und Anfangswerte werden
kontrolliert übernommen. Externe Formzuordnung wird nicht nachgebildet; eine
redundante Zuordnung zum eigenen eindeutigen Elternformular ist möglich.

Die Sandbox bleibt **allow-same-origin ohne allow-forms und ohne allow-scripts**.
CSP behält form-action:none und die bestehenden Netzwerkverbote. action,
formaction, target/formtarget sowie Autofokus werden nicht in die Vorschau
übernommen. Es wird kein Serverendpunkt für Formularabgaben ergänzt.

Der vertrauenswürdige Vorschau-Controller fängt Abgabeknopf und Enter im
einzeiligen Eingabefeld ab und ruft die native Browserprüfung reportValidity
auf. Dadurch funktionieren Browsermeldungen ohne Lernskripte oder aktivierte
Formularnavigation. Labelklick, Checkbox/Radio und normale Texteingabe behalten
ihre native Wirkung; Enter in textarea bleibt ein Zeilenumbruch. Direkte
submit/requestSubmit-Aufrufe bleiben zusätzlich durch die Sandbox blockiert.
Eine lokale Erfolgsmeldung bedeutet keine tatsächliche Anfrageübertragung.

Eingetippte Vorschauwerte sind flüchtiger DOM-Zustand. Die App übernimmt sie
weder in Kursspeicher, Export noch KI-Kontext. Ein Neuaufbau der Vorschau,
etwa beim Wechsel in den Inspektormodus, setzt sie zurück. Im Quelltext selbst
geschriebene value-Attribute oder textarea-Inhalte sind dagegen Teil der Datei
und werden wie sonstiger Quelltext gespeichert/exportiert. Die App weist auf
erfundene Übungsdaten hin; Autofill wird mit autocomplete=off unterdrückt,
wobei eigenständige Browserfunktionen nicht von der App kontrolliert werden.

Formularnamen können native DOM-Eigenschaften überschreiben. Vorschaucontroller,
Formularprüfung und Inspektor verwenden deshalb native Prototypzugriffe für
kritische Methoden/Eigenschaften. Normale Feldnamen wie dataset, closest oder
reportValidity bleiben verwendbar. Die separate F12-Vorschau erhält keine
zusätzliche Speicher-/Node-/Netzwerkbrücke und keinen eigenen Versandweg.

## Feste Prüfung und Grenzen

Die Formularprüfung verwendet isolierte Kopien der bereinigten Vorschau aus
FE-026. Sie prüft tatsächliche Labelzuordnung, eindeutige IDs, Namen, Formbesitz,
sichtbar lesbare Beschriftungen, aktive Felder und verständliche Abgabeknöpfe.
Radiofelder müssen als eine Gruppe funktionieren; Checkboxen bleiben unabhängig.
Select benötigt mindestens zwei unterschiedliche, tatsächlich wählbare Werte.
Deaktivierte Optionen einschließlich deaktivierter optgroup zählen nicht.

Ab der Validierungslektion werden mit synthetischen Werten valueMissing,
typeMismatch, rangeUnderflow/rangeOverflow und stepMismatch beziehungsweise
native checkValidity-Ergebnisse geprüft. Ganze Zahlen 1 und 8 müssen bestehen,
0/9/1,5 scheitern. Ein gültiger Stand muss ohne freiwillige Telefon-/Materialangabe
funktionieren. disabled/readonly oder novalidate sind keine Scheinlösung.

Bedienungslektion und Projekt verlangen vorhandene, sichtbare Beschreibungstexte,
keinen globalen horizontalen Überlauf sowie sichtbaren Fokus ab 2px Outline.
Label-/Feldtexte werden auf Kontrast geprüft, die Fokusoutline auf mindestens
3:1. Derselbe Formularkandidat muss bei 360 und 1280px bestehen; unterschiedliche
Formulare je Bildschirmbreite können die Anforderungen nicht zusammenstückeln.
display:contents wird bei sichtbaren Feldern als gleichwertig akzeptiert.

Die Prüfung bewertet keine vollständige Barrierefreiheit oder semantische Qualität
der Texte. Sie beweist keine Zustellbarkeit einer E-Mail, Telefonnummernexistenz,
Echtheit von Angaben oder serverseitige Sicherheit. Vollständige HTML-/CSS-
Validierung und weitergehende Formularfunktionen sind nicht Bestandteil dieses
Kapitels. Die KI erklärt eingeführte Inhalte; sie vergibt keine Prüfentscheidung.

## Speicher, KI und Nachweise

Neue Lektionen tragen forms-13.1. Vorhandenes Kursschema und bisherige Ergebnisse
bleiben erhalten; fehlende Lektionen werden ergänzt. Die frühere 40-Projekte-
Grenze wurde für die 43 Lektionen auf mindestens 64 angehoben; die Gesamtgröße
bleibt bei 32 MiB. Neustart und Wiederladen mit 43 Aufgaben sind getestet.

Die KI-Themenfolge enthält alle sechs neuen IDs in Lernreihenfolge. Spätere
Formular-/JavaScriptthemen werden nicht vorausgesetzt. Private RAG-/Kontenablagen
wurden weder gelesen noch verändert; Anbieter-/Cloudgrenzen bleiben unverändert.

- 196 Backendtests in 21 Suiten und Backend-Lint grün, inklusive Themenprogression
  und bestehender Datenschutz-/Anbieterregressionen.
- Frontendbuild und **65 Browser-/Electronfälle** grün: 24 bisherige Werkstatt-,
  24 CSS-, zehn Formular- und sieben Desktopfälle. Die sechs neuen Lösungen und
  Alternativen bestehen, alle sechs Starter bleiben offen. Negative Fälle decken
  Label-/ID-/Gruppenfehler, Grenzwerte, deaktivierte/unsichtbare Scheinlösungen,
  Fokus, Überlauf und externe Formzuordnung ab.
- Echte Vorschauabläufe prüfen Labelklick, Eingabe, Radio-/Checkboxwahl, native
  Fehlermeldungen, Enter und eine gültige lokale Prüfung. Export-/Neustarttest
  bestätigt, dass getippte Vorschauwerte nicht mitgesichert werden.
- Versand-/Upload-/Navigationssperren sowie direkte native Abgabeversuche und
  kollidierende Feldnamen sind geprüft. Beim absichtlichen parentElement-Namen
  scheitert Playwrights eigene Rollenauflösung; diese spezielle Gegenprobe nutzt
  daher einen nativen Klick. Normale Bedienung ist unabhängig davon getestet.
- Frischer unabhängiger Review fe027_review: Fachfolge und Code freigegeben;
  Inspektor-Clobbering korrigiert, Starter geöffnet und Auswahlwerte präzisiert.

Automatisierte Matrix: Windows/Chromium/Electron im vorhandenen Entwicklungsstand,
ausschließlich künstliche Testprofile. Kein neuer Installer oder Nachweis für
andere Betriebssysteme/Browser. Der Build meldet einen Größenhinweis für das
gewachsene JavaScript-Paket über 500 kB; das ist kein Testfehler und keine
Performancevermessung. Eine spätere Aufteilung der Kursinhalte bleibt möglich.

Noch menschlich zu prüfen: verständliche Erklärungen/Rückmeldungen, eigenes
Formularthema, natürliche Tab-/Pfeiltasten-/Leertastenbedienung, 200% Zoom,
Hilfsmittel sowie sinnvolle Labels, Anweisungen und Fehlerrückmeldungen.

## Fachreferenzen

Primärquellen, am 31.10.2026 abgeglichen; je Lektion zusätzlich verlinkt:

- [W3C Labels](https://www.w3.org/WAI/tutorials/forms/labels/),
  [Gruppierung](https://www.w3.org/WAI/tutorials/forms/grouping/),
  [Anweisungen](https://www.w3.org/WAI/tutorials/forms/instructions/)
- [MDN erstes Formular](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Your_first_form),
  [Eingabetypen](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/HTML5_input_types),
  [Auswahlfelder](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Other_form_controls),
  [Browserprüfung](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation),
  [Zahlenfelder](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/number)
- [WHATWG Constraint Validation](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#the-constraint-validation-api)
