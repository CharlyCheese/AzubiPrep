# FE-032 – Übungen in der Werkstatt zuerst

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel und Allowlist

Freien JavaScript-Bereich und Technikpilot gemeinsam ans Seitenende versetzen.
Lektionsauswahl und Übungen sollen im Vordergrund stehen; Funktionen erhalten.

- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/JsPlayground.jsx`
- `frontend/public/sw.js`
- dieser Brief, `docs/agent-briefs/DONE.md`

## Abnahme

Beide Zusatzbereiche stehen nach dem gesamten Übungsbereich. Richtungshinweis
passt zur Position. Keine Änderung an Speicherung/Ausführung/Prüfung. Build und
gezielte Prüfung der tatsächlichen DOM-Reihenfolge, unabhängiger Review und
Archivcheck grün. Keine zusätzlichen Tests oder Bibliotheken nötig.

## Ergebnis

Beide Zusatzbereiche hinter den gesamten Übungs-/Import-/Hilfebereich versetzt,
unveränderte Props. Richtungshinweis auf „oben“ korrigiert, SW v23 für neuen
Seitenstand. Build grün (bestehender Größenhinweis). Im frischen Chromium-Profil
gegen laufende App geprüft: Lektion vor freier Konsole, diese vor Technikpilot,
Technikpilot letztes Seitenelement, weiterhin 71 Lektionen; freie Konsole öffnet.
Keine Speicherung/Prüf-/Ausführungslogik verändert, kein Installer gebaut.
Frischer unabhängiger Review `fe032_review` ohne Findings freigegeben.
