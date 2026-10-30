# Brief OPS-018: Frontendkurs und Qwen Lernbegleitung dokumentieren

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Vereinbarten Planungsstand zum aufbauenden Frontendkurs und zur gemeinsamen
lokalen Qwen-Anbindung dauerhaft festhalten. Keine Implementierung beginnen;
weitere Planung bleibt ausdrücklich offen.

## Betroffene Dateien

- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/00-Start.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/OPS-018-frontendkurs-qwen-planung.md`

## Umsetzung

- [x] Ziele, 30 Kapitel, regelmäßige Projekte und didaktische Voraussetzungen sichern.
- [x] Vorschau, Inspektor, Qwen-Rolle, Quellen und Sicherheit festhalten.
- [x] Reihenfolge: gemeinsame Grundlage planen, Pilotkapitel bauen, Qwen anbinden, prüfen, ausbauen.
- [x] Dokument verlinken und Umsetzung als offen vormerken; OPS-003 erhalten.
- [x] Frischer unabhängiger Dokumentationsreview, Archivierung und Konsistenzprüfung.

## Abnahmekriterien

- [x] Bisherige Anforderungen vollständig; Ziel Junior-Niveau ohne Berufsgarantie.
- [x] Plan und bestehende Funktionen sowie offene Architekturentscheidungen klar getrennt.
- [x] Keine neue Programmlogik, Abhängigkeiten, Prüfungsinhalte oder persönlichen Angaben.
- [x] Kapitel bauen aufeinander auf; Projekte, echte Vorschau und Inspect berücksichtigt.
- [x] KI bleibt optional und ohne Ausführungsrechte; Validator und unabhängige QS bleiben maßgeblich.
- [x] Quellen, Einstieg und offene Folgeschritte auffindbar; Review und Archivcheck bestanden.

## Ergebnis

Planungsdokument mit Abschlusskompetenzen, 30 Kapiteln, sieben großen
Projektmeilensteinen einschließlich Abschlussprojekt, regelmäßigen kleinen
Übungen und späteren Projekterweiterungen erstellt. Echte Vorschau, Inspect/F12,
Validator, Quellenprüfung, Sicherheitsziele und zentrale optionale KI-Anbindung
mit Evaluationsreihenfolge erfasst. Offene Architekturentscheidungen und
weitere Planung sind ausdrücklich benannt. Im Dokumentationseinstieg verlinkt;
eigene offene Vormerkung ergänzt, bestehendes OPS-003 unverändert erhalten.

Prüfung: Kapitelnummern 1–30 vollständig, lokale Links der drei betroffenen
Konzept-/Einstiegsdateien erreichbar und Kernanforderungen vorhanden;
`git diff --check` bestanden. Keine Programm-, Datenbank-, Modell- oder
Paketänderungen. Frischer unabhängiger Read-only-Review durch
`ops018_plan_review`: Freigabe ohne Findings; außerdem elf externe
Referenzziele erfolgreich abgerufen. Dokumentationsaufgabe archiviert;
Kurs-/KI-Implementierung bleibt separat als offene Planung vorgemerkt.
Abschlussprüfung: `node scripts/check-agent-briefs.mjs` und
`git diff --check`.
