# Brief OPS-002: Strukturierter KI-Fachreview statt menschlichem Review

Status: done
Bereich: OPS
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Fachlicher Inhalts-Review aller Prüfungsfragen war ursprünglich als
Review durch Praktiker mit Berufserfahrung je Fachrichtung geplant.
Da ein dauerhaft verfügbarer menschlicher Reviewer realistisch nicht zu
finden ist (Entscheidung Sven, 2026-09-16), wird dieser Schritt durch
einen strukturierten, verbindlichen KI-Review-Prozess ersetzt: ein
frisch gestarteter, unabhängiger Subagent ohne Gesprächskontext zur
Implementierung prüft neue Fragen mit Websuche gegen aktuelle,
autoritative Quellen statt reiner Plausibilität.

## Betroffene Dateien (exakte Pfade)

- `ORCHESTRATOR.md` – Abschnitt 1, neue verbindliche Ausnahme für
  `CONTENT`-Briefs (Regeln 1–5)
- `docs/agent-briefs/CONTENT-002-fragenkatalog-import.md` – erste
  praktische Anwendung der neuen Regel (zwei Review-Durchgänge)
- `content/questions/*.csv` – Korrekturen aus dem Review (siehe Ergebnis)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/18-Fachreview-Fragenkatalog.md` – deckt die ursprünglichen 500
  Fragen ab (vor CONTENT-002)
- `docs/agent-briefs/CONTENT-002-fragenkatalog-import.md` – Abschnitte
  "Unabhängiger Review (nachträglich)" und "Vollständiger OPS-002-Review
  der 1123 Fragen" – vollständige Befunde und Korrekturen

## Umsetzungsschritte (Checkliste)

- [x] Methodik festgelegt und in `ORCHESTRATOR.md` Abschnitt 1 als
      verbindliche Regel für CONTENT-Briefs verankert
- [x] Ursprüngliche 500 Fragen bereits vorher geprüft
      (`18-Fachreview-Fragenkatalog.md`)
- [x] Erster (struktureller) Review-Durchgang der 1123 CONTENT-002-Fragen
      durch einen unabhängigen Subagenten (fand 2 CSV-Formatfehler,
      korrigierte fälschliche "kritisch"-Einschätzung zur
      Antwortposition dank Kenntnis von `mischeOptionen`)
- [x] Vollständiger fachlicher Review-Durchgang der 1123 Fragen durch 5
      parallele, unabhängige Subagenten (je einer pro Modul-Gruppe),
      strukturelle Vollprüfung + fachliche Stichprobe/Vollprüfung mit
      Websuche gegen autoritative Quellen
- [x] Alle 16 gefundenen Fundstellen (davon 2 echte Musterlösungsfehler)
      korrigiert
- [x] Erneute Validierung mit `loadContent()`: 0 Warnungen, 1623 Fragen

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Jede der 1123 neu importierten Fragen war Teil einer strukturellen
      Vollprüfung (Duplikate, Format, Musterlösung vorhanden)
- [x] Jedes Modul hatte eine begründete fachliche Stichprobe bzw.
      Vollprüfung (mind. 3–5 Fragen, mehr bei großen Modulen)
- [x] Websuche gegen aktuelle Quellen wurde aktiv genutzt, nicht nur
      Plausibilität aus Trainingswissen
- [x] Alle gefundenen echten Fehler sind behoben und im Brief dokumentiert
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Ergebnis (wird beim Abschluss ausgefüllt)

Die Methodik ist etabliert und wird ab sofort automatisch für jeden
zukünftigen CONTENT-Brief angewendet (verbindliche Regel in
`ORCHESTRATOR.md`). Für den bestehenden Fragenbestand ist der Review
damit vollständig: 500 (Alt-Bestand) + 1123 (CONTENT-002) = alle 1623
Fragen sind jetzt mindestens einmal fachlich geprüft.

16 echte Fundstellen wurden im CONTENT-002-Bestand gefunden und behoben,
darunter 2 Musterlösungsfehler (`ALLE-WISO-075`, `FIAE-DB-057`/
`DPA-DB-057`), die Lernenden ohne diesen Prozess aktiv falsches Wissen
vermittelt hätten. Details siehe
[CONTENT-002-Brief](CONTENT-002-fragenkatalog-import.md).

Zurückgestellte, nicht-blockierende Beobachtungen (inhaltliche
Redundanz einzelner Fragen, dünne Themenabdeckung bei DVK-CLD,
Stilbruch alt/neu) sind dort ebenfalls dokumentiert und eignen sich als
spätere Aufgaben für `CONTENT-001` (Autoren-UI), sobald diese existiert.

Diese Methodik gilt ab jetzt als Standing Process, kein einmaliger
Task mehr – jeder künftige CONTENT-Brief durchläuft sie automatisch
gemäß `ORCHESTRATOR.md` Abschnitt 1.
