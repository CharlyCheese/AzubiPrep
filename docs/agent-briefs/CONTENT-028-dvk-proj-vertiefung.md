# Brief CONTENT-028: DVK-PROJ vertiefen (zweite Vertiefungsrunde, Abschluss DVK-Module)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Abschluss der zweiten Vertiefungsrunde nach `CONTENT-027` (DVK-NET):
`DVK-PROJ` (Projektmanagement für CPS-Projekte) von 52 auf 75 Fragen
erweitert – damit sind alle sechs DVK-Module dieser Runde bei 75 (bzw.
DVK-CLD bei 62, siehe unten) Fragen angekommen.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-PROJ.csv` – von 52 auf 75 Fragen erweitert (neue
  IDs `DVK-PROJ-053` bis `-075`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (23 Fragen)

Projektstrukturplan (PSP), Kick-off-Meeting, Earned-Value-Analyse,
Gantt-Diagramm, Werkvertrag vs. Dienstvertrag, Gewährleistung im
Projektkontext, Service Level Agreement (SLA), Eskalationsmanagement,
Kommunikation in Remote-Teams, Kanban-Board/WIP-Limits, Definition of
Done, Retrospektive vs. Lessons Learned, Nutzwertanalyse,
Amortisationsrechnung, Projektphasenmodell, Multiprojektmanagement/
Portfoliomanagement, Vertragsstrafe bei Terminverzug, Konfliktmanagement
im Team, Bottom-up- vs. Top-down-Schätzung, Projekt-Controlling-Kennzahlen
(Soll-Ist-Vergleich), User Story und Akzeptanzkriterien, Daily Stand-up,
Projektabbruchkriterien.

Alle Themen vorab gegen die bestehenden 52 Fragen abgeglichen (u. a.
RACI-Matrix, Scrum Product Owner/Sprint, kritischer Pfad, allgemeiner
Change-Request-Prozess, Lastenheft/Pflichtenheft, Meilensteine,
Risikomanagement, Stakeholder-Analyse bereits vorhanden) – keine echten
Dopplungen, zwei thematisch nahe, aber inhaltlich klar verschiedene Fragen
bewusst zugelassen (Retro-vs-Lessons-Learned-Vergleich neben der
bestehenden Lessons-Learned-Frage, laufender Soll-Ist-Vergleich neben dem
bestehenden Abschlussbericht/Frühwarnindikatoren-Kontext).

## QA-Ablauf – ein Subagent-Review-Durchlauf, zwei gezielte Wortkorrekturen

Der Batch bestand im **ersten** Durchlauf mit zwei kleinen Findings:

- Fachliche Korrektheit bestätigt, auch bei den rechtlich anspruchsvollen
  Themen (Werkvertrag/Dienstvertrag nach §631/§611 BGB, Gewährleistung vs.
  Garantie) und den Scrum-Events (Definition of Done, Daily, Retrospektive
  gemäß Scrum Guide).
- Keine Ambiguität, keine Redundanz zu Bestandsfragen.
- **Längen-Bias**: nur eine einzige Zeile (`DVK-PROJ-057`, Werkvertrag vs.
  Dienstvertrag) überschritt die Schwelle (Option a 2–3 Wörter länger als
  jeder Distraktor) – die übrigen 22 Zeilen lagen im Toleranzbereich
  (max. 1 Wort Unterschied). Gefixt durch Kürzung von Option a
  ("Werkvertrag schuldet ein Ergebnis, Dienstvertrag die Tätigkeit").
- **Signalwörter**: `DVK-PROJ-067` enthielt "Nur"/"Allein" in zwei
  Distraktoren (Aufzählung der Projektphasen) – als Hinweis gemeldet und
  durch neutralere Formulierungen ersetzt ("Planung, gefolgt von direkter
  Auslieferung ohne weitere Phasen" / "Programmierung und ein
  abschließender Test ohne vorherige Planung").

Beide Korrekturen sind reine Wortänderungen ohne Wechsel der korrekten
Antwort oder des Fachinhalts – kein erneuter vollständiger Review-Durchlauf
nötig (gleiches Vorgehen wie bei `CONTENT-025`/`CONTENT-026`).

`validate-content.mjs`: 2204 Fragen, 26 Dateien, 0 Fehler (vor und nach den
Korrekturen).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

DVK-Gesamtstand: `DVK-CLD` 62, `DVK-NET` 75, `DVK-PROJ` jetzt 75, `DVK-SEC`
74, `DVK-AUT` 75, `DVK-IOT` 75. Damit ist die zweite DVK-Vertiefungsrunde
für fünf von sechs Modulen abgeschlossen; `DVK-CLD` (62) ist das einzige
DVK-Modul, das noch unter 74/75 liegt und für eine künftige Runde
vorgemerkt bleibt. Nächster Schritt laut Fortsetzungsplan: DPA- oder
FIAE-Fachrichtung als nächste Vertiefungsrunde.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 23 neuen `DVK-PROJ`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-PROJ` von 52 auf 75 Fragen erweitert. Ein Subagent-Review-Durchlauf,
zwei kleine Nachschärfungen (Längen-Bias in einer Zeile, Signalwörter in
einer weiteren Zeile), beide ohne erneuten vollständigen Review behoben.
`validate-content.mjs`: 2204 Fragen, 0 Fehler. Sven hat die neuen Fragen
stichprobenartig fachlich gegengelesen und freigegeben (2026-09-24).
