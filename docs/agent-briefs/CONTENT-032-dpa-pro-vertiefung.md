# Brief CONTENT-032: DPA-PRO vertiefen (Fortsetzung Vertiefungsrunde DPA)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Fortsetzung der DPA-Vertiefungsrunde nach `CONTENT-031` (DPA-DS):
`DPA-PRO` (Prozessmanagement/BPMN) von 27 auf 51 Fragen erweitert.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DPA-PRO.csv` – von 27 auf 51 Fragen erweitert (neue
  IDs `DPA-PRO-028` bis `-051`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (24 Fragen)

AND-Gateway, OR-Gateway (inklusiv-oder), Zwischenereignis (Intermediate
Event), Nachrichtenfluss vs. Sequenzfluss, Subprozess, zusammenführendes
Gateway (Konvergenz), Prozesslandkarte (Kern-/Support-/Führungsprozesse),
Six Sigma/DMAIC, Kaizen, Kanban-Board, Soll- vs. Ist-Prozess,
Prozessreifegradmodell (CMMI), Fehlerquote/Ausschussrate,
Kapazitätsauslastung, Engpasstheorie (Theory of Constraints),
Ausnahmepfade, Eskalationsereignis, Timer-Ereignis, Choreography-Diagramm,
Process Owner, Change Management, Standardisierung vs. Individualisierung,
Prozesssimulation, Fehler-Ende-Ereignis (Error End Event).

Alle Themen vorab gegen die bestehenden 27 Fragen abgeglichen (BPMN-
Grundlagen wie Gateway/Start-Ereignis/XOR-Gateway/Pool/Swimlane/Ereignis-
Grundbegriff/BPMN-Abkürzung, Ist-Analyse, Produktivität, Lean Management,
Wertstromanalyse, RACI, PDCA-Zyklus, Durchlaufzeit x2, Prozesseffizienz,
Medienbruch, Vier-Augen-Prinzip, RPA, Schwachstellenanalyse,
Prozessdokumentation, Geschäftsprozess-Grundbegriff bereits vorhanden) –
keine Dopplungen, die neuen Fragen vertiefen gezielt spezifischere BPMN-
Elemente und Prozessmanagement-Methoden.

## QA-Ablauf – außergewöhnlich sieben Subagent-Review-Durchläufe

Dieser Batch war der bisher aufwändigste Review-Fall des Projekts: der
erste Durchlauf bestand mit vier soliden Ergebnissen (fachliche
Korrektheit, keine Ambiguität, keine Redundanz), fand aber ein neues,
bisher nicht dokumentiertes Fehlermuster – wiederkehrende "Meta-Tell"-
Wörter/Satzschablonen, die **nur** in Distraktoren vorkommen und **nie**
in einer korrekten Antwort des Batches, unabhängig von den vier
AGENTS.md-Beispielwörtern oder der bereits erweiterten Füllwort-Liste.
Über sechs weitere Runden wurden nacheinander folgende Ausprägungen
gefunden und behoben:

1. "Anzahl" (5 Zeilen) + "einzeln-"-Familie (6 Zeilen) + "jeweils/
   jeweilig-" (5 Zeilen) + "völlig" (3 Zeilen) + "Allein"/"Rein" als
   Absolutheits-Öffner (1 Zeile) – erste Korrekturrunde.
2. Nach Synonym-Ersetzung reproduzierte sich dasselbe Muster unter neuen
   Wörtern ("Menge"/"Zahl"/"Größe" statt "Anzahl", neu eingeführtes
   "verschieden-", zwei übersehene "einzeln-"-Reste) – zweite Runde,
   diesmal mit struktureller statt bloß lexikalischer Umformulierung.
3. Die strukturelle Umformulierung erzeugte ein neues Schablonen-Muster
   ("Wie viele ...?" als Interrogativ-Öffner in 3 Zeilen; "Sortiert ..."
   als gemeinsamer Öffner aller drei Distraktoren einer einzelnen Frage,
   `DPA-PRO-034`) – dritte Runde.
4. Ein "Beide [X] ... identisch/denselben"-Muster wurde in vier separaten
   Zeilen gefunden (`DPA-PRO-029`, `-031`, `-038`, `-051`), davon drei in
   Runde vier und die vierte (`-031`) erst in Runde fünf, weil sie beim
   ersten Durchgang übersehen wurde.
5. Runde sechs fand zusätzlich das Wort "endgültig" (3 Zeilen, alle
   Distraktoren) sowie einen direkten Verstoß gegen die bestehende
   Verbotsliste ("jedem", Flexionsform von "jeder", in einem Distraktor).
6. Runde sieben bestätigte schließlich BESTEHT, nachdem auch ein
   zufälliger Phrasen-Doppelgänger ("ohne weitere Prüfung" identisch in
   zwei Zeilen) bereinigt war.

`validate-content.mjs`: 2289 Fragen, 26 Dateien, 0 Fehler (nach jeder
Korrekturrunde erneut geprüft).

**Wichtige neue Lehre für künftige Batches**: Über die bekannte Füllwort-
Liste hinaus ("dabei", "insgesamt", "besonders", "zwingend", "rein" aus
früheren Runden) muss ein Review gezielt auf drei Muster-Typen prüfen,
die sich als eigentliche Fehlerquelle herausgestellt haben:
(a) eine über 3+ Zeilen hinweg **exakt oder nahezu wortgleiche Phrase**,
die nur in Distraktoren auftaucht,
(b) alle drei Distraktoren **einer einzelnen** Frage mit demselben
Eröffnungswort/derselben Satzschablone (z. B. "Beide ... identisch",
"Wie viele ...", "Sortiert ..."), während die korrekte Antwort davon
abweicht,
(c) generische Sachbegriffe (z. B. "Kosten", "technische", "beteiligt",
"Dokumentation", "Mitarbeiter") sind dagegen **kein** Fehler, solange sie
kein starres Schema (a) oder (b) bilden – das wiederholte reflexhafte
Melden solcher Einzelwörter hat die Korrekturrunden unnötig in die Länge
gezogen, bis die Prompt-Anweisung an den Reviewer das explizit
eingegrenzt hat. Künftige Content-Briefs sollten diese Unterscheidung
schon im Review-Prompt mitgeben, um die Anzahl nötiger Runden zu
begrenzen.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

DPA-Gesamtstand: `DPA-ANA` 50, `DPA-DS` 51, `DPA-PRO` jetzt 51, `DPA-DB`
118, `DPA-PROJ` 26. Nächster Schritt: `DPA-PROJ` (26) im bekannten Turnus.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 24 neuen `DPA-PRO`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DPA-PRO` von 27 auf 51 Fragen erweitert. Sieben Subagent-Review-
Durchläufe waren nötig (ungewöhnlich viele – ein sich wiederholt
verschiebendes Meta-Tell-Muster in Distraktor-Formulierungen), zuletzt
BESTEHT ohne offene Findings. `validate-content.mjs`: 2289 Fragen, 0
Fehler. Sven hat die neuen Fragen stichprobenartig fachlich gegengelesen
und freigegeben (2026-09-24).
