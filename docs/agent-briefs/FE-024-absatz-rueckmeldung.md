# Brief FE-024: Absatzlernziel und gültiges pre unterscheiden

Status: done
Bereich: FE
Angelegt: 2026-10-30

## Ziel

Praxisfeedback zu pre statt p: semantisch gültigen vorformatierten Text nicht
als grundsätzlich falsches HTML darstellen. Das ausdrückliche Absatzlernziel
der ersten Übung erhalten, Aufgabe und Rückmeldungen verständlich präzisieren.

## Betroffene Dateien

- `frontend/src/pilot/course.js`
- `frontend/src/pilot/validator.js`
- `frontend/src/pages/FrontendKurs.jsx`
- `e2e/tests/frontendpilot.spec.js`
- `docs/22-Frontendpilot-Technik.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/FE-024-absatz-rueckmeldung.md`

## Abnahme

- [x] Erstaufgabe nennt h1 und p als verlangte Technik, freie Inhalte bleiben erlaubt.
- [x] pre ohne p erklärt Vorformatierung und offenes Absatzlernziel, keine Behauptung vollständiger Syntaxvalidierung.
- [x] p zusammen mit pre besteht; Verse/Leerzeichen in Vorschau erhalten.
- [x] Erfolgreiche Regeln zeigen Erfolgstext statt bisheriger Fehlermeldung.
- [x] Rückmeldungs-/Prüferversion, Regressionen, unabhängiger Review und Archivcheck konsistent.

## Ergebnis

Aufgabe präzisiert und Absatzrückmeldung um kontextbezogene Erklärung von pre
ergänzt. Kein pauschales Syntaxurteil; Absatzlernziel p bleibt erhalten.
Alle zehn Prüfregeln erhalten eigene Erfolgstexte statt irreführender
Fehlersätze bei erfüllter Anforderung. Prüfer 1.0.1 erhält alte Ergebnisse mit
historischem Bezug und verlangt für aktuelle Rückmeldung erneute Prüfung.

Frontendbuild index-CglBi8Pu.js erfolgreich. Drei gezielte Playwrightfälle
bestanden: elf Musterlösungen/Alternativen/Fehlerfälle, freie HTML-/CSS-Varianten
und Vers mit pre inklusive Leerzeichen-/Darstellungsprüfung und zusätzlichem p.
Frischer unabhängiger Fach-/Codereview fe024_review gegen MDN p/pre freigegeben.
Techniknachweis ergänzt, archiviert; Diff- und Archivcheck bestanden.
Keine Desktop-/Gesamtfreigabe, keine neue Abhängigkeit oder Speicherumstellung.
