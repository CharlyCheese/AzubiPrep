# Brief CONTENT-201: FISI-SEC – firewalld-Regeln

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SEC-401 bis -424 ergänzen, Modul 224 → 248.
firewalld-Konfiguration, Zonen, Policies und Laufzeitzustand anwenden.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-201-fisi-sec-firewalld-regeln.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 224 Altstämme gelesen, globale firewalld-Suche ohne Bestand.
Konkrete firewalld-Verträge von nftables 377–400 und allgemeinen
Firewalllernzielen abgrenzen. Frische offizielle Primärrecherche in
firewall-cmd, firewall-offline-cmd, firewalld.zone, firewalld.policy,
firewalld.richlanguage, firewalld.ipset, firewalld.service und firewalld.conf.
15 Felder, LF11b. Altpräfix 119402 Byte SHA256:
092cf1a9f8b1863f3d9e2d5df4033364cb1c36c51b07cb3e0fff4f39145bc4fc.
Keine Firewalländerungen oder tatsächlichen firewalld-Aufrufe, keine Dienste,
Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes und LF11b erhalten.
- [x] Eindeutige Lösungen, fachnahe Distraktoren und Primärbelege.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

248 Modulfragen, global 6297. Frischer Reviewer `content201_review` prüfte
alle 24 Fragen, 96 Optionen und Erklärungen, 224 Altstämme sowie globale
semantische Nachbarn einschließlich nftables. Eigene Primärrecherche aller acht
verlinkten Handbuchseiten. Zwei falsch-exklusive Totalitätswortmuster korrigiert;
vollständiger Endread und gespeicherte Grammatikendkorrektur bestätigt.
Kein weiterer Befund; ein zunächst vermuteter Artikelbefund wurde als Lesefehler
zurückgezogen. Altpräfix-SHA, App-Parser, Feldzahl, LF und globale IDs bestätigt.
Content-Validator, Diff- und Archivcheck erfolgreich.

Primärbelege: https://firewalld.org/documentation/man-pages/ mit
firewall-cmd.html, firewall-offline-cmd.html, firewalld.zone.html,
firewalld.policy.html, firewalld.richlanguage.html, firewalld.ipset.html,
firewalld.service.html und firewalld.conf.html (auch einzeln in CSV belegt).
