# Brief CONTENT-005: Content-Qualität nachbessern (Redundanz, DVK-CLD-Tiefe, Stil)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-18

## Ziel (1–3 Sätze)

Drei bei `CONTENT-002`/`OPS-002` bewusst zurückgestellte, nicht-blockierende
Beobachtungen aus dem KI-Fachreview, nie im Backlog erfasst (Fund beim
Brief-Audit 2026-09-17): (1) inhaltliche Redundanz einzelner Fragen v. a.
in WISO/FIAE-PRG/DVK-CLD, (2) DVK-CLD deckte Cloud/Kubernetes zu dünn ab,
(3) Stilbruch zwischen vollständigen und elliptischen Fragen.

## Entscheidungen (im Chat geklärt, 2026-09-18)

- **DVK-CLD-Tiefe:** trotz gewachsenem Bestand (33 statt ursprünglich 6
  Fragen durch `CONTENT-002`) nochmal gezielt auf Kubernetes-Tiefe prüfen.
- **Redundanz:** Doppel-Fragen nicht löschen, sondern behalten und
  inhaltlich differenzieren (unterschiedliche Aspekte desselben Themas
  abfragen, z. B. Definition vs. Anwendung/Abgrenzung).
- **Stilbruch:** alle elliptischen Fragen auf vollständige Fragesätze
  umschreiben.

## Umsetzung

### 1. DVK-CLD-Tiefe (Kubernetes)

Geprüft: von den 33 vorhandenen DVK-CLD-Fragen deckte nur eine einzige
(DVK-CLD-031 "Was ist Kubernetes (K8s)?") das Thema überhaupt ab – die
vom ursprünglichen Review genannten Kubernetes-Kernkonzepte Pod,
Deployment und Autoscaling fehlten komplett. Ergänzt: 4 neue Fragen
(DVK-CLD-034 bis 037) zu Pod, Deployment, Horizontal Pod Autoscaler und
Namespace. DVK-CLD.csv hat jetzt 37 Fragen.

### 2. Redundanz differenziert (nicht gelöscht)

Per Text- und Themenabgleich (exakte Duplikate + "Kernbegriff"-Gruppierung
bei "Was ist X? / Was bedeutet X?"-Mustern) gefunden und bearbeitet:

- **17 Paare aus dem ursprünglich gemeldeten Scope** (WISO 11, DVK-CLD 2,
  FIAE-PRG 1, FIAE-SWE 2, FIAE-TST 1): jeweils eine der beiden Fragen
  behalten, die andere auf einen anderen Aspekt umformuliert (z. B.
  "Was ist Deckungsbeitrag?" bleibt Definition, die zweite Frage testet
  jetzt "Wozu dient der Deckungsbeitrag in der Kostenrechnung?").
- **Zusätzlicher Fund während der Stil-Vereinheitlichung:** die
  automatisierte Nachprüfung auf exakte Frage-Duplikate deckte 13 weitere,
  vorher nicht gemeldete Fälle auf (DVK-AUT 1, FIAE-DB 2, FISI-NET 3,
  FISI-SEC 6, PM 1) – teils vorbestehend, teils durch die Stil-Angleichung
  neu entstanden (z. B. drei unterschiedlich formulierte DHCP-Fragen, die
  nach der Vereinheitlichung wortgleich geworden wären). Nach demselben
  Muster differenziert (z. B. die drei DHCP-Fragen testen jetzt Aufgabe,
  Lease-Konzept und DORA-Ablauf statt dreimal dasselbe).

Damit insgesamt 30 Fragen inhaltlich differenziert, 0 exakte
Frage-Duplikate im gesamten Bestand verblieben (automatisiert geprüft).

### 3. Stil vereinheitlicht

97 elliptische Fragen (z. B. "Matrixorganisation?", "Pair Programming?")
projektweit auf vollständige Fragesätze umgeschrieben (FISI-NET 23,
WISO 22, HARDWARE 17, FIAE-DB 10, DPA-DB 9, FISI-SEC 5, DVK-AUT 3,
FIAE-SWE 2, FIAE-TST 2, DPA-DS 1, DVK-CLD 1, FIAE-PRG 1, PM 1) – über 4
parallele KI-Durchläufe, danach automatisiert geprüft: Antwortoptionen
und korrekte Antworten wurden nicht verändert, nur die Frageformulierung.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv` (4 neue Fragen, mehrere differenziert)
- `content/questions/WISO.csv`
- `content/questions/FIAE-PRG.csv`
- `content/questions/FIAE-SWE.csv`
- `content/questions/FIAE-TST.csv`
- `content/questions/FISI-NET.csv`
- `content/questions/FISI-SEC.csv`
- `content/questions/HARDWARE.csv`
- `content/questions/FIAE-DB.csv`
- `content/questions/DPA-DB.csv`
- `content/questions/DVK-AUT.csv`
- `content/questions/DPA-DS.csv`
- `content/questions/PM.csv`

## Abnahme-Kriterien

- [x] `npm run validate` weiterhin grün (1627 Fragen, 19 Dateien, 0 Probleme)
- [x] 0 exakte Frage-Duplikate im gesamten Bestand (automatisiert geprüft)
- [x] Stichprobenartige inhaltliche Prüfung neuer/differenzierter Fragen
      und umformulierter Frage-Stile – fachlich korrekt, Antwortoptionen
      passen weiterhin zur (unveränderten) korrekten Antwort
- [x] Sven führt `node scripts/migrate-content-to-db.mjs` aus (2026-09-18):
      1627 Fragen, 19 Module, 4 Fachrichtungen migriert
- [x] Sven bestätigt `npm run validate` auf seinem Rechner ebenfalls grün

## Ergebnis

Alle drei Teilpunkte aus dem ursprünglichen KI-Fachreview (OPS-002)
bearbeitet: DVK-CLD um 4 gezielte Kubernetes-Fragen erweitert (Pod,
Deployment, Autoscaling, Namespace), 30 Doppel-Fragen behalten aber
inhaltlich differenziert statt gelöscht, 97 elliptische Fragen auf
vollständige Fragesätze umgestellt. Gesamtbestand jetzt 1627 Fragen
(vorher 1623), `npm run validate` durchgehend grün. Sven hat
`migrate-content-to-db.mjs` ausgeführt (1627 Fragen migriert) und
`npm run validate` erneut bestätigt – Live-DB und CSV sind damit
synchron, Task vollständig abgeschlossen.
