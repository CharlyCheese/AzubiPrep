# FE-033 – Zusatzwerkzeuge aufklappbar

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel und Allowlist

Zusatzbereiche reduzieren insbesondere mobil den Scrollaufwand: Hinweise,
KI-Lernbegleitung und Projektwerkzeuge einzeln aufklappbar, standardmäßig zu.
Freie JavaScript-Fläche mit kompakter aufklappbarer Titelzeile; Technikpilot
bleibt aufklappbar. Übungen bleiben zuerst.

- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/JsPlayground.jsx`, `frontend/src/components/JsSandboxPilot.jsx`
- `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- `e2e/tests/helpers.js`, `e2e/tests/werkstatt-tools.spec.js`
- `e2e/tests/js-playground.spec.js`
- `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`, `e2e/tests/desktoppilot.spec.js`, `e2e/tests/js-course.spec.js`, `e2e/tests/js15-course.spec.js`, `e2e/tests/js16-course.spec.js`, `e2e/tests/ki.spec.js`, `e2e/tests/ki-anbieter.spec.js`, `e2e/tests/rag.spec.js`
- dieser Brief, `docs/agent-briefs/DONE.md`

## Abnahme

1. Drei klar beschriftete native Aufklappbereiche, anfangs zu; Inhalte und
   Aktionen bleiben erhalten. Keine zusätzliche äußere Aufklappebene nötig.
2. Freie JS-Fläche kompakt mit bedienbarer Titel-Schaltfläche und aria-expanded;
   beim Schließen aktive Ausführung wie bisher beenden. Technikpilot erhalten.
3. Tastaturbedienung, sichtbarer Fokus und mindestens44px Bedientreffer;
   mobile Ansicht ohne horizontalen Überlauf. Eingaben über Zu-/Aufklappen erhalten.
4. Speicherung, Prüfungen, Netz-/Datenfreigaben und Ausführungsrechte unverändert.
   Alte Funktionstests öffnen die benötigten Werkzeuge ausdrücklich über UI-Helfer.
5. Gezielte mobile/Keyboard-/Funktionsnachweise, betroffene Regressionen, Build,
   unabhängiger Review und Archivcheck grün. Keine neue Bibliothek oder privaten
   Unterlagen/Testkonten verwenden.

## Ergebnis

Drei eigenständige native details für Hinweise/Musterlösung, KI-Lernbegleitung
und Projekt sichern/einlesen umgesetzt, ohne zusätzliche äußere Aufklappebene.
Standardmäßig geschlossen, Inhalt/React-Zustand bleibt gemountet. Bestehende
Aktionen, Freigaben und Speicherdaten unverändert. Freie JS-Fläche hat eine
kompakte Titel-Schaltfläche mit sichtbarem und zugänglichem Namen
„JavaScript ausprobieren“, aria-expanded und bisheriger Stop-/Importinvalidierung.
Technikpilot behält seine Aufklapplogik. 44px-Ziele, Fokus und mobile Umbrüche;
SW v24 für den neuen Stand.

Gezielte echte Chromium-Tests: alle drei Bereiche zunächst zu, kompakte Höhe
und kein horizontaler Überlauf bei 390px, Enter/Leertaste, Hinweise und Rückfrage
nach Zu-/Aufklappen erhalten, keine dadurch ausgelöste Hilfeanfrage; JS-Entwurf
bleibt, Ausführung endet beim Schließen. Mobiler Screenshot visuell geprüft.
Bestehende Funktionstests öffnen die Werkzeuge ausdrücklich per UI-Helfer.

Nachweise: 149 unterschiedliche Werkstatt-/KI-/Kontextfälle grün. Im Gesamtlauf
148 bestanden, ein neuer Test wählte bei aktiver KI irrtümlich auch eine innere
summary; auf die direkte äußere Titelzeile präzisiert, danach alle vier gezielten
Aufklapptests grün. Import/Export/Neustart, native Desktopauswahl, alle Kapitel,
RAG mit synthetischen Daten und KI-Modelle mit Testprofilen geprüft. Build grün,
bisheriger Größenhinweis unverändert. Backend/Prüf-/Ausführungslogik unverändert,
keine zusätzliche Backendtestwiederholung und kein Installerbau erforderlich.

Frischer unabhängiger Review `fe033_review` ohne Findings: native Bedienung,
Stateerhalt, Aufräumen bei JS-Toggle und Testanpassungen freigegeben. Keine
zusätzlichen Datenfreigaben/Funktionsverluste. Keine privaten Unterlagen oder
realen Anmeldedaten für diese Arbeit gelesen, keine neue Bibliothek.
