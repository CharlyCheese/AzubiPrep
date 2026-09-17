# Brief FE-013: Landing-Page-Ausbau + Seiten-Tour

Status: done
Bereich: FE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Follow-up zu FE-012: Landing-Page inhaltlich ausgebaut (klarere
Nutzenerklärung, Lernreise-Tipp, Hinweis für Selbstbetreiber:innen auf die
DB-Anleitung) und eine kurze, seitenunabhängige Tour ergänzt, die
Dashboard, Lernreise, Lernbereich und Prüfungssimulation kurz erklärt.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Landing.jsx`
- `frontend/src/utils/tour.js` (neu)
- `frontend/src/components/AppTour.jsx` (neu)
- `frontend/src/components/Layout.jsx` – `AppTour` eingebunden
- `frontend/src/pages/Einstellungen.jsx` – Button "Tour erneut anzeigen"

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-012-landing-page.md`: Grundlage (Landing-Page,
  KontoFormular)
- `docs/agent-briefs/FE-005-begruessungs-popup.md`: bestehendes
  Begrüßungs-Popup (session-basiert), mit dem sich die Tour beim
  automatischen Start koordiniert (siehe Entscheidung unten)

## Entscheidungen (im Chat geklärt, 2026-09-17)

- **Landing-Page-Inhalt**: klarere Formulierung des App-Nutzens, expliziter
  Tipp "am besten mit der Lernreise starten", und – nur wenn `syncAktiviert`
  false ist – ein Hinweis für Selbstbetreiber:innen mit Link auf
  `docs/19-Datenbank-Login.md` im GitHub-Repo sowie ein transparenter
  Hinweis, dass eine lokale KI-Integration nur eine Backlog-Idee (OPS-003)
  und noch nicht umgesetzt ist (kein falscher Eindruck von Verfügbarkeit).
  **Achtung:** der Link geht von `https://github.com/CharlyCheese/AzubiPrep`
  aus – bitte prüfen/korrigieren, falls der tatsächliche Repo-Name/Branch
  davon abweicht.
- **Tour als Modal-Sequenz statt angehefteter Tooltips**: robuster
  gegenüber Layout-Änderungen, funktioniert auf jeder Seite gleich,
  navigiert beim "Weiter"-Klick zur jeweils erklärten Seite.
- **Reihenfolge/Inhalt** (Sven, 2026-09-17): Dashboard → Lernreise →
  Lernbereich → Prüfungssimulation, mit explizitem Hinweis, dass die
  Fehler-Nachbereitung bewusst im Prüfungsverlauf liegt statt direkt nach
  der Simulation.
- **Start: automatisch + manuell**: einmalig automatisch (Flag in
  `localStorage`, dauerhaft – anders als das session-basierte FE-005-
  Popup), koordiniert per kurzem Polling mit dem Begrüßungs-Popup, damit
  nicht beide gleichzeitig übereinander erscheinen. Zusätzlich jederzeit
  über einen neuen Button in den Einstellungen ("🧭 Kurze Tour erneut
  anzeigen") erneut aufrufbar.

## Umsetzungsschritte (Checkliste)

- [x] Landing-Page: Nutzenerklärung, Lernreise-Tipp, DB-Anleitung-Hinweis
      (nur ohne Sync)
- [x] `AppTour.jsx`: 4-teilige Modal-Sequenz mit Navigation zur jeweiligen
      Seite
- [x] Automatischer Einmal-Start, koordiniert mit dem Begrüßungs-Popup
- [x] Manueller Re-Start über Einstellungen
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Tour erscheint beim allerersten Besuch automatisch, danach nicht
      mehr von selbst
- [x] "Tour erneut anzeigen" in den Einstellungen startet sie jederzeit neu
- [x] "Weiter" navigiert zur passenden Seite, "Zurück"/"Überspringen"
      funktionieren
- [x] Landing-Page zeigt den DB-Hinweis nur, wenn kein Sync verfügbar ist

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. Reine Frontend-Logik, nicht in der Sandbox
lauffähig testbar (npm-Registry gesperrt) – Sven bestätigt nach
Dateiübernahme live auf seiner Maschine. Bitte insbesondere den GitHub-
Link auf der Landing-Page (Repo-Name/Branch) und die Tour-Inhalte auf
Praxistauglichkeit prüfen.
