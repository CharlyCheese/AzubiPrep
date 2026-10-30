# Brief CONTENT-082: FIAE-UX – konkrete CSS-Layoutfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 neue SC-Fragen FIAE-UX-125 bis -148, Modul 124 → 148.
Konkrete CSS-Layout-/Kaskadenfälle mit vollständigen Voraussetzungen,
abgegrenzt von vorhandenen allgemeinen Responsive-/HTML-/WCAG-Fragen.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-082-fiae-ux-css-layoutfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 124 Bestandsfragen gelesen.
Primärquellen CSSWG/W3C-Spezifikationen, ergänzend Browserhersteller-
Dokumentation. Zahlenmodelle geben Box, Achsen, Abstände und Mindestgrößen
explizit vor. Alter Byte-Präfix vor Änderungen SHA256:
f6e68ae925b3c8877fe3326751c9d64dc7a57c5464ddfc56ba525912f4540ed5.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, alte Bytes und Schema erhalten, eindeutige IDs.
- [x] Kaskaden-/Layoutannahmen vollständig, Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Unabhängiger frischer Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

FIAE-UX 124 → 148, Gesamtstand nach diesem Batch 3441 Fragen.
24 konkrete CSS-Fälle zu Boxmodell, Kaskade, Einheiten, Flex/Grid,
Positionierung, Stapelkontext, Sichtbarkeit und Bild-/Containergrößen.

Frischer unabhängiger Vollreview content082_review: BESTANDEN nach
zwei Korrekturen. 127b beseitigt eine nur in drei Distraktoren wiederholte
Erbfarbenphrase. 146 ergänzt natürliche Bildmaße 400×200px, Box 200×200px
und maximale vollständige Einpassung: dadurch ist none kein weiterer
möglicher Lösungswert. Tatsächlicher gespeicherter Endstand erneut gelesen.
Keine offenen Findings, systematischen Tells oder globalen Lernzielduplikate.

Primärquellen je CSV-Zeile: W3C/CSSWG Sizing3/4, Cascade5, Color4,
Variables1, Values4, Flexbox1, Grid1, Position3, Overflow3, Images3,
Contain3 und CSS22 Box/Visual Formatting/Visibility. Zusätzlich unabhängig
recherchiert: Selectors4-Spezifität und Transforms1-Rendering.
https://www.w3.org/TR/css-flexbox-1/#resolve-flexible-lengths
https://www.w3.org/TR/css-images-3/#the-object-fit
https://www.w3.org/TR/css-transforms-1/#transform-rendering

Rechnungen unabhängig bestätigt: Borderbox244/200; rem24; em-Abstand48;
calc368; Flex-Schrumpfung80/160; Wachstum80/110; Grid160/320;
Auto-Höhe135. Alle Größen in CSS-Pixeln. Keine Browsertests behauptet.
144 behandelt Layoutplatz und damit ein anderes Lernziel als088 zur
Screenreader-Zugänglichkeit. 140 berücksichtigt den nicht-none-Transform,
142 den atomaren übergeordneten Stapelkontext.

App-Parser: 148 Datensätze mit 14 Feldern, global eindeutige IDs.
Alter Präfix aus 125 physischen Zeilen exakt gemäß vorherigem SHA256
erhalten. Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Imports, Builds, Installationen, Commits oder Pushes.
