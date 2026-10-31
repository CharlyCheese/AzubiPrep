# Brief FE-026: CSS-Kapitel 8–12 abschließen

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Freigegebenen CSS-Ausbau der Reihe nach abschließen: lesbare Gestaltung,
Boxmodell/Überlauf, Flexbox, Grid/Positionierung, responsive Gestaltung,
Fokus/reduzierte Bewegung und Projekt 2. Kapitel 7 ist praktisch bestätigt.
Vor JavaScript bleibt eine eigene Planung mit Ausführungs-/Sicherheitsgate nötig.
Formularkapitel 13 bleibt ein anschließender HTML-Abschnitt, kein Teil dieses Tasks.

## Betroffene Dateien (Allowlist)

- `frontend/src/pilot/course.js`
- `frontend/src/pilot/css-course.js`
- `frontend/src/pilot/layout-checks.js`
- `frontend/src/pilot/preview.js`
- `frontend/src/pilot/css-checks.js`
- `frontend/src/pilot/validator.js`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/PilotPreview.jsx`
- `frontend/public/sw.js`
- `backend/src/ai.js`
- `backend/test/ai.test.js`
- `e2e/tests/frontendpilot.spec.js`
- `e2e/tests/css-course.spec.js`
- `e2e/tests/desktoppilot.spec.js`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/22-Frontendpilot-Technik.md`
- `docs/27-CSS-Kurs-Abnahme.md`
- `docs/agent-briefs/FE-026-css-kapitel-8-12.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Vorgehen und Abnahme

- [x] Kapitel 8: Farben/Lesbarkeit, Schrift, relative Einheiten, Boxmodell und
  Überlauf schrittweise erklärt und praktisch an Inhaltskarten angewendet.
- [x] Kapitel 9: Fluss/Display vor Flexbox, Achsen vor Umbruch; Navigationsprojekt.
- [x] Kapitel 10: Grid vor benannten Bereichen/Positionierung; Übersichtsprojekt.
- [x] Kapitel 11: Viewport, mobile-first Media Queries, flexible Inhalte,
  Tastaturfokus und reduzierte Bewegung; responsive Transferaufgabe.
- [x] Kapitel 12: selbstständiges mehrseitiges Projekt mit freiem Thema,
  Kriterien statt pixelgenauer Vorlage und sichtbarer Selbstprüfungsgrenze.
- [x] Jede Lektion besitzt Voraussetzungen, nachvollziehbare Erklärung, Beispiel,
  konkreten Auftrag, gestufte Hinweise, Starter und Lösung. Keine unkommentierten
  Vorgriffe, regelmäßige Wiederholung und Projekte, keine KI-Benotung.
- [x] Bereinigte Vorschau unterstützt den benötigten CSS-Umfang inklusive
  begrenzter Medienregeln/Fokuszustände ohne Netzwerk, Skripte oder neue Bibliothek.
  Grenzen gelten rekursiv; alte Sicherheits-/Lernstandnachweise bleiben erhalten.
- [x] Pflichtprüfung verwendet Browserwerte und Geometrie bei mehreren Breiten,
  erkennt wirkungslose Regeln/Überlauf und gleichwertige Lösungen. Bewegungs-
  und Fokuszustand werden kontrolliert geprüft und als Prüfsimulation dokumentiert.
- [x] Bestehende Projekte/Ergebnisse erhalten, neue Lektionen ergänzen; KI-Themen
  folgen der Kursfolge und halten spätere Themen gesperrt. Private Ablagen unberührt.
- [x] Lösungen/Alternativen und sinnvolle Fehlerfälle aller neuen Lektionen,
  reale Browser-/Electron-Vorschau, Speicher und Sicherheitsgrenzen geprüft.
- [x] Fachreferenzen/Nachweise, unabhängiger frischer Review, Doku und Archivcheck grün.

## Ergebnis

21 neue Lektionen in css-course.js; insgesamt 37 Lektionen bis Kapitel 12.
Regelmäßige Übungen, Diagnose, Mini-Projekte und Projekt 2 mit eigenen Klassen,
Texten und Themen. Bestehende Projekte/Ergebnisse erhalten; neue Version
css-8-12.1 nur für die ergänzten Lektionen. Kapitel 7 praktisch bestätigt.

Vorschau mit begrenzter rekursiver Medien-/Pseudoklassen-/Propertyfreigabe
erweitert. CSSOM-Langformen erhalten Kurzformen korrekt. Kein Netzwerk,
keine Lernskripte, keine neue Bibliothek. Isolierte Layoutprüfung wartet auf
lokale Bilder und misst Geometrie/Browserverhalten bei 360/768/960/1280px.
Fokus/Hover/Bewegungspräferenz reproduzierbar simuliert, zusätzlich unveränderte
Vorschauzustände im Browser und Electron geprüft. App verwirft asynchron
überholte Prüfstände. Menschliche Selbstprüfung und automatische Grenzen klar.

Nachweise: Frontendbuild, 195 Backendtests in 21 Suiten, Backend-Lint und
54 Browser-/Electronfälle grün (24 bisherige Werkstatt-, 24 CSS- und sechs
Desktopfälle). Alle 37 Lösungen/Alternativen, 21 offene Starter, gezielte
Fehler-/Umgehungsfälle, Bildladevarianten, H3, Medien-/Ressourcengrenzen,
Speicherübernahme und F12-/IPC-Abschottung erfasst.

Frischer unabhängiger Review fe026_review: Nachbesserungen bei Prüfung beider
Seiten, sichtbaren/kontrastreichen Pflichtinhalten, natürlicher Bildladung,
gleichwertigen Überschriften, Kurzformen und Positions-/Bewegungskriterien.
Alle Gegenproben danach unabhängig bestätigt; Code und Dok27/20/22/STATUS
ohne offene Findings freigegeben. Detaillierte Matrix und praktische offene
Abnahmepunkte in docs/27-CSS-Kurs-Abnahme.md.

Aktueller Stand unter Port 3002 bereitgestellt. Keine privaten Ablagen gelesen
oder verändert, kein neuer Installer, keine neue manuelle Nutzerabnahme.
Formularkapitel 13 bleibt offen; vor JavaScript wird Ausführung/Sicherheit
separat geplant. Archivcheck ist Voraussetzung der Abschlussmeldung.
