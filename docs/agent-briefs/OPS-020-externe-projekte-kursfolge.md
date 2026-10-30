# Brief OPS-020: Externe Projekte und Kursreihenfolge festhalten

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Externen Projektmodus, frühzeitige Mehrdateiprojekte und angepasste Lernfolge
in der bestehenden Planung sichern. Nur Dokumentation ändern; keine Kurs-,
Import- oder Editorfunktionen implementieren.

## Betroffene Dateien

- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/OPS-020-externe-projekte-kursfolge.md`

## Abnahme

- [x] HTML-Grundlage, frühes CSS, Layout/responsive Projekte, dann Formulare und JavaScript; Kapitelnummern konsistent.
- [x] Mehrere HTML-Dateien ab Kapitel 3, externe CSS ab Kapitel 5, externe JS bei JavaScript-Einstieg; ES-Module gesondert später.
- [x] Freie Editorwahl und gleichwertige interne/externe Projektbearbeitung dokumentiert.
- [x] Externer Modus schon ab erster zweiter Datei, aktuell beim Seitenlink in Kapitel 3; bei früherer Einführung ebenfalls früher.
- [x] Ordner-/Dateiauswahl, Dateibaum, relative Pfade, Snapshot, erneutes Einlesen, dateibezogene Prüfung und Vorschau enthalten.
- [x] Web-/Desktop-Unterschiede, Originalschutz, Import-/Ausführungssicherheit und Qwen-Kontext klar; keine Funktionsbehauptung.
- [x] Frischer unabhängiger Review, Diff-/Link-/Kapitel- und Archivprüfung bestanden.

## Ergebnis

Planungsdokument und offene Vormerkung ergänzt. Frühes HTML/CSS bleibt
projektbezogen; Formulare folgen nach den Layoutprojekten. Aus den bisherigen
30 werden 31 Kapitel mit weiterhin sieben großen Projektmeilensteinen.
Mehrdateiarbeit beginnt mit zwei HTML-Seiten in Kapitel 3, externer CSS in
Kapitel 5 und externer JS in Kapitel 14; ES-Module bleiben gesondert Kapitel 26.

Externe Bearbeitung beginnt verbindlich ab der ersten zweiten Datei, aktuell
beim Link auf eine zweite HTML-Seite in Kapitel 3. Bei einer früheren zweiten
Datei im Detailplan wird der Modus entsprechend früher verfügbar.
Externe Bearbeitung mit freier Editorwahl, Ordner-/Dateiauswahl und erhaltenen
relativen Pfaden festgehalten. Prüfung/Vorschau beziehen sich auf einen bewusst
eingelesenen Stand; Ergebnisse mit Dateibezug, erneutes Einlesen und unveränderte
Originale vorgesehen. Unterschiede Web/Desktop, lokale/gehostete Verarbeitung,
Importgrenzen, abgeschirmte Ausführung und keine automatischen Projekt-Skripte
beschrieben. Spätere Framework-Buildstrategie bleibt ausdrücklich offen.

Mechanische Prüfung: Nummern 1–31 vollständig, sieben Projektmeilensteine,
STATUS-Zahl und lokale Links konsistent; `git diff --check` grün. Keine
Programmlogik, Pakete oder Kursinhalte implementiert. Frischer unabhängiger
Read-only-Review durch `ops020_review` ohne Findings; erneute Freigabe nach
Präzisierung des Einstiegs ab der ersten zweiten Datei. Dokumentationsaufgabe
archiviert; Umsetzung bleibt offen. Abschlussprüfungen:
`node scripts/check-agent-briefs.mjs` und `git diff --check` bestanden.
