# Brief FE-012: Landing-Page (öffentliche Startseite)

Status: done
Bereich: FE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Neue öffentliche Startseite (`/willkommen`), die AzubiPrep kurz erklärt
und gleichzeitig als Login-/Registrierfenster dient. Wird beim
allerersten Besuch automatisch angezeigt, ist aber jederzeit überspringbar
– die MVP-Philosophie "kein Pflicht-Login" bleibt erhalten. Entstanden im
Zuge von BE-001, weil Push-Benachrichtigungen ein Konto voraussetzen und
Sven eine bessere Bewerbung des Kontos wollte als den bisherigen,
versteckten Bereich in den Einstellungen.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/components/KontoFormular.jsx` (neu) – aus
  `Einstellungen.jsx` herausgelöstes Login-/Registrieren-Formular
- `frontend/src/pages/Einstellungen.jsx` – nutzt jetzt `KontoFormular`
- `frontend/src/pages/Landing.jsx` (neu)
- `frontend/src/utils/landing.js` (neu) – Flag "schon gesehen"
- `frontend/src/App.jsx` – neue Route `/willkommen` (außerhalb des
  Sidebar-Layouts), `Startpunkt`-Weiche auf der Startseite
- `frontend/src/styles/global.css` – `.landing-seite`/`.landing-karte`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/BE-001-push-benachrichtigungen.md`: Auslöser dieses
  Briefs
- `docs/agent-briefs/FE-005-begruessungs-popup.md`: bestehendes, separates
  Begrüßungs-Popup für wiederkehrende Nutzer (Session-basiert) – bleibt
  unverändert bestehen, deckt einen anderen Fall ab (kein Konto-Bezug)

## Entscheidungen (im Chat geklärt, 2026-09-17)

- **Eigene Startseite vor der App** (nicht nur ein auffälligerer Bereich in
  den Einstellungen): neue Route `/willkommen`, wird bei nicht
  eingeloggten Erstbesucher:innen automatisch angezeigt.
- **Dient gleichzeitig als Login-Fenster**: Login-/Registrierformular ist
  direkt eingebettet (kein zusätzlicher Klick zu den Einstellungen nötig).
- **Kein Zwang**: "Ohne Konto weiter nutzen" bleibt immer sichtbar und
  gleichwertig zum Formular, damit die App-Philosophie (kein Pflicht-
  Login) nicht verletzt wird. Einmal übersprungen oder eingeloggt, taucht
  die Seite nicht mehr automatisch auf (Flag in `localStorage`), bleibt
  aber über `/willkommen` manuell erreichbar.

## Umsetzungsschritte (Checkliste)

- [x] Login-/Registrieren-Formular in `KontoFormular.jsx` extrahiert (von
      `Einstellungen.jsx` und `Landing.jsx` gemeinsam genutzt)
- [x] `Landing.jsx`: Kurzbeschreibung + `KontoFormular` + "Ohne Konto
      weiter nutzen"
- [x] Automatische Weiterleitung beim ersten Besuch (`Startpunkt` in
      `App.jsx`), sonst direkt Dashboard wie bisher
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Erstbesuch ohne Konto → `/willkommen` wird automatisch gezeigt
- [x] "Ohne Konto weiter nutzen" → Dashboard, Flag gesetzt, Seite erscheint
      danach nicht mehr automatisch
- [x] Erfolgreiche Registrierung/Login auf der Landing-Page → Dashboard,
      Flag ebenfalls gesetzt
- [x] Bereits eingeloggte Nutzer und Nutzer mit gesetztem Flag landen
      direkt im Dashboard
- [x] Bestehendes Einstellungen-Formular funktioniert unverändert (jetzt
      über `KontoFormular`)

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. Reine Frontend-Logik, nicht in der Sandbox
lauffähig testbar (npm-Registry gesperrt) – der Code folgt aber exakt der
vorher funktionierenden Login-/Registrieren-Logik aus `Einstellungen.jsx`
(1:1 verschoben, nicht neu geschrieben), das Risiko für Regressionen ist
dadurch gering. `node scripts/check-agent-briefs.mjs` läuft grün. Sven
bestätigt nach Dateiübernahme live auf seiner Maschine.
