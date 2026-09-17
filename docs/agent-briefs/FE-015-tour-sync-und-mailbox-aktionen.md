# Brief FE-015: Tour-Synchronisierung, Benachrichtigungs-Polling-Reduktion, Mailbox-Aktionen

Status: done
Bereich: FE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Drei direkt aus Svens Praxistest von FE-014/BE-005 entstandene Fixes:
(1) Die kurze Seiten-Tour (FE-013) zeigte das Popup eines Schritts, bevor
die zugehörige Seite tatsächlich geladen war ("Popup erklärt Bereich X,
sichtbar ist aber noch Bereich X-1"). (2) Das Ungelesen-Badge in der
Navigation lud bei jedem Seitenwechsel neu und hat spürbar zum globalen
API-Rate-Limit beigetragen ("Zu viele Anfragen" beim Speichern in der
Fragenpflege). (3) UI für das neue Archivieren/Löschen aus BE-006.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/components/AppTour.jsx` – Navigation an den angezeigten
  Schritt gekoppelt statt separat ausgelöst
- `frontend/src/components/Layout.jsx` – Badge-Polling: einmalig +
  60s-Intervall statt bei jedem Seitenwechsel
- `backend/src/config.js` – `rateLimitMax` als zusätzliche Sicherheitsmarge
  von 240 auf 360 angehoben
- `frontend/src/api/client.js` – `api.del()` ergänzt (für BE-006)
- `frontend/src/pages/Benachrichtigungen.jsx` – Archivieren/Wiederherstellen/
  Löschen-Buttons pro Eintrag, Archiv-Ansicht umschaltbar

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-013-landing-tour-ausbau.md`: liefert die
  ursprüngliche Tour-Komponente
- `docs/agent-briefs/FE-014-profil-benachrichtigungen-split.md`: liefert
  das Nav-Badge
- `docs/agent-briefs/BE-006-benachrichtigungen-archiv-loeschen.md`: Backend
  für Punkt 3

## Root-Cause-Analyse (im Chat, 2026-09-17)

- **Tour-Bug**: `weiter()` navigierte zum Pfad des *aktuellen* (gerade
  verlassenen) Schritts und zeigte im selben Klick schon den Text des
  *nächsten* Schritts an – Anzeige und Navigation liefen dadurch immer
  einen Schritt lang auseinander. Fix: ein `useEffect`, das bei jeder
  Änderung von `schritt` (bzw. beim Sichtbarwerden der Tour) zum Pfad des
  gerade *angezeigten* Schritts navigiert – Anzeige und Navigation sind
  jetzt an dieselbe State-Änderung gekoppelt und laufen nie mehr
  auseinander.
- **Rate-Limit-Bug**: `Layout.jsx` lud `/benachrichtigungen` bisher mit
  `location.pathname` als Abhängigkeit, also bei *jeder* Navigation neu –
  in einer Testsession mit vielen Reloads/Klicks (zusätzlich durch
  React-StrictMode in der Entwicklung effektiv verdoppelt) hat das spürbar
  zum globalen 240/min-Limit (`sicherheit.js`) beigetragen, was zum
  gemeldeten Fehler beim Speichern in der Fragenpflege führte. Fix: Badge
  lädt jetzt nur noch einmal beim Einloggen/Mounten und danach alle 60s im
  Hintergrund, plus sofort beim Besuch von `/benachrichtigungen` selbst.
  Zusätzlich `rateLimitMax` als Sicherheitsmarge angehoben (240 → 360).

## Umsetzungsschritte (Checkliste)

- [x] `AppTour.jsx`: Navigation via `useEffect([sichtbar, schritt])`,
      `weiter()`/`zurueck()` ändern nur noch den State
- [x] `Layout.jsx`: Badge-Polling auf Mount+Intervall(60s)+Besuch der
      Benachrichtigungen-Seite umgestellt, `location.pathname` nicht mehr
      als generelle Reload-Abhängigkeit
- [x] `config.js`: `rateLimitMax`-Default angehoben
- [x] `api/client.js`: `del()`-Methode ergänzt
- [x] `Benachrichtigungen.jsx`: Archivieren-/Löschen-Buttons (aktive
      Ansicht), Wiederherstellen-Button (Archiv-Ansicht), Umschalter
      zwischen beiden Ansichten
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Tour zeigt beim Klick auf "Weiter" erst die neue Seite, dann (bzw.
      synchron) das passende Popup – kein sichtbarer Versatz mehr
- [x] Navigation in der App löst keine Benachrichtigungs-Anfrage mehr aus
      (nur noch beim Besuch von `/benachrichtigungen` selbst oder alle 60s)
- [x] "Archivieren" blendet einen Eintrag aus der Standardliste aus, ohne
      ihn zu löschen; "Archiv anzeigen" zeigt ihn dort wieder
- [x] "Löschen" fragt vorher nach Bestätigung und entfernt den Eintrag
      danach endgültig

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. Reine Frontend-Logik (Tour, Layout-Polling,
Mailbox-Buttons), nicht in der Sandbox lauffähig testbar (npm-Registry
gesperrt) – Klammer-/Strukturprüfung aller geänderten Dateien lief sauber
durch. Die Backend-Seite (BE-006-Endpunkte, auf die die neuen Buttons
zeigen) wurde separat per SQL-Sequenz in der Sandbox verifiziert (siehe
BE-006-Brief). `node scripts/check-agent-briefs.mjs` läuft grün. Sven
bestätigt: Funktioniert live auf seiner Maschine (Tour-Synchronisierung
und Rate-Limit-Problem in der Fragenpflege beide behoben).
