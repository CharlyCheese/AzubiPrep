# Brief FE-005: Begrüßungsnachricht als zentrales Popup

Status: in Testung
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Die bisher fest im Dashboard-Header stehende Begrüßung ("Willkommen
zurück 👋") wird zu einem zentrierten Popup beim Programm-/Browserstart.
Nach dem Schließen bleibt es unsichtbar, bis der Nutzer sich das nächste Mal
neu anmeldet (oder eine neue Browser-Sitzung startet).

## Betroffene Dateien (exakte Pfade)

- `frontend/src/components/WillkommenModal.jsx` (neu)
- `frontend/src/components/Layout.jsx` (Modal eingebunden)
- `frontend/src/pages/Dashboard.jsx` (Header-Begrüßung entfernt, steht jetzt nur im Popup)
- `frontend/src/styles/global.css` (Modal-Styles ergänzt)

## Kontext (nur Verweise, keine Dokumentkopien)

- `frontend/src/components/ToastHost.jsx` (ähnliches Muster für ein globales,
  in `Layout.jsx` eingehängtes UI-Element)
- `frontend/src/store/authStore.js` (Login-Ereignis als Trigger zum erneuten
  Anzeigen)

## Umsetzungsschritte (Checkliste)

- [x] `WillkommenModal.jsx`: zentriertes Overlay mit der Begrüßung,
      personalisiert mit dem Anzeigenamen aus dem Lernprofil (falls gesetzt)
- [x] Sichtbarkeits-Logik: `sessionStorage`-Flag (verschwindet automatisch
      bei Browser-/Programm-Neustart) + Reset des Flags bei jedem neuen
      Login (`authStore`-Ereignis), damit es nach der nächsten Anmeldung
      wieder erscheint
- [x] In `Layout.jsx` eingebunden (App-weit, nicht nur auf dem Dashboard)
- [x] Dashboard-Header vereinfacht (Begrüßung nicht mehr doppelt)
- [x] Modal-Styles (zentriert, Overlay abdunkelt Hintergrund, per Klick
      außerhalb oder Escape schließbar) in `global.css` ergänzt

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Beim ersten Öffnen der App (neue Browser-Sitzung) erscheint das Popup
      zentriert
- [ ] Nach dem Schließen bleibt es bei weiterer Navigation innerhalb der App
      unsichtbar
- [ ] Nach Login/Registrierung erscheint es erneut (auch ohne Browser-Neustart)
- [ ] Kein Layout-Sprung/Bug auf Seiten ohne Popup (Escape/Klick außerhalb
      schließt sauber, kein Scroll-Lock-Bug)

## Ergebnis (wird beim Abschluss ausgefüllt)

<wird nach Umsetzung/Test ausgefüllt>
