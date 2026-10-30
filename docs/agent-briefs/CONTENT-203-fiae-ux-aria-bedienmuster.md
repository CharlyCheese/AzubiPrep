# Brief CONTENT-203: FIAE-UX – ARIA-Bedienmuster

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-UX-245 bis -268 ergänzen, Modul 244 → 268.
Konkrete zugängliche Bedien- und Zustandsverträge interaktiver Oberflächen.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-203-fiae-ux-aria-bedienmuster.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 244 Altstämme gelesen; globale Suche nach Baumansichten, Feed,
Spinbutton, Switch, Toolbar, Karussell und den neuen Zustandsattributen.
Vorhandene WCAG-, Fokus-/Auswahl-, Combobox-, Dialog- und Radiogruppen-
Beschriftungsfragen von konkreten neuen Tastatur-/Zustandsverträgen abgrenzen.
Frische offizielle W3C-APG-Recherche: treeview, slider-multithumb, feed,
spinbutton, toolbar, carousel, switch und radio.
14 Felder. Altpräfix 147706 Byte SHA256:
79fc6f959a1f41b2c0239e0c3a3e9de0efaf19fae3ad982fd2295c80c58a04ab.
Keine UI-Implementierung, Browser-/Gerätetests, Builds, Installationen,
DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

268 Modulfragen, global nach diesem Batch 6345. Frischer Reviewer
`content203_review` prüfte alle 24 Stämme, 96 Optionen und Erklärungen,
244 Altstämme, 053–100 vollständig und globale Nachbarn in 26 CSV.
Eigene frische Recherche aller acht offiziellen W3C-APG-Quellen.
Das Schablonen-Tell in 247 wurde korrigiert; vollständiger gespeicherter
Endread ohne offene Findings bestanden. Altpräfix-SHA, App-Parser,
14 Felder und globale IDs bestätigt. Content-Validator, Diff- und Archivcheck
erfolgreich. Keine UI- oder Gerätetests behauptet.

Primärquellen: https://www.w3.org/WAI/ARIA/apg/patterns/ mit treeview/,
slider-multithumb/, feed/, spinbutton/, toolbar/, carousel/, switch/, radio/
(auch einzeln in CSV belegt).
