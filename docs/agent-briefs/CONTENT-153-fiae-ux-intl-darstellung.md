# Brief CONTENT-153: FIAE-UX – Sprachabhängige Darstellung mit Intl

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-UX-197 bis -220 ergänzen, Modul196 →220.
JavaScript Intl: Zahlen, Datum/Zeit, Relativzeit, Pluralkategorien,
Listen, sprachgerechtes Sortieren, Textsegmente und Locale-Kennungen.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-153-fiae-ux-intl-darstellung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle196 Altstämme lesen; globale26CSV semantisch abgleichen. Vorhandene
Formular-, DOM-, CSS- und WCAG-Fragen nicht wiederholen. Eigene aktuelle
Primärrecherche ECMA-402 und offizielle JavaScript-Referenzdokumentation.
Alle konkreten Ausdrücke lokal mit vorhandenem Node/Intl nachprüfen;
Locale und Optionen explizit, keine Annahmen über Systemlocale/Zeitzone.
Typografische Leerzeichen nicht als Fallen verwenden. Keine Abhängigkeiten,
Installationen, DB/.env, Server, Build, Commit oder Push.
Altpräfix122086 Byte SHA256:
a104471f793275eaa0d9b1d757e38f3527d82ee87a3ced37b77dfb9b9ce8bca2.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] API-Semantik frisch belegt und24 Beispiele lokal nachgerechnet.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt; insgesamt 5145 Fragen. Frischer Reviewer content153_review
hat alle 24 Fragen, 96 Optionen, Erklärungen, 196 Altstämme und globale
Nachbarn geprüft: keine Findings. Autor und Reviewer haben unabhängig
24/24 Ausdrücke auf Node v24.19.0 / ICU 78.3 nachgerechnet und aktuelle
ECMA-402-/MDN-Primärquellen gelesen. Präfixhash unverändert; App-Parser,
Content-Validator und Diffcheck bestanden.

Quellen: https://tc39.es/ecma402/ sowie
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl
mit den Referenzen zu NumberFormat, DateTimeFormat, RelativeTimeFormat,
PluralRules, ListFormat, Collator, Segmenter und getCanonicalLocales.
