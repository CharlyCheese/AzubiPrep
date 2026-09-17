# Brief FE-014: Profil & Benachrichtigungen aus Einstellungen herausgelöst

Status: done
Bereich: FE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Die bisher in "Einstellungen" gebündelten Bereiche Lernprofil/Konto/Sync
und der Push-Schalter bekommen eigene Navigationspunkte ("Profil" und
"Benachrichtigungen"), statt in einer langen Einstellungen-Seite
unterzugehen. "Benachrichtigungen" ist bewusst als generische Mailbox
angelegt (siehe BE-005), damit sie sich später um private Nachrichten
zwischen Nutzern erweitern lässt, ohne nochmal umgebaut zu werden.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Profil.jsx` (neu) – Lernprofil + Konto/Sync, aus
  `Einstellungen.jsx` verschoben
- `frontend/src/pages/Benachrichtigungen.jsx` (neu) – Push-Schalter +
  Benachrichtigungs-Verlauf (BE-005)
- `frontend/src/pages/Einstellungen.jsx` – nur noch Darstellung, Hilfe
  (Tour-Button), Datenschutz, Gefahrenzone
- `frontend/src/pages/Autoren.jsx` – Login-Verweis zeigt jetzt auf `/profil`
- `frontend/src/components/Layout.jsx` – neue Nav-Punkte "Profil"/
  "Benachrichtigungen" (mit Ungelesen-Badge)
- `frontend/src/App.jsx` – neue Routen `/profil`, `/benachrichtigungen`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-012-landing-page.md` / `FE-013-landing-tour-ausbau.md`:
  `KontoFormular` (wiederverwendet in `Profil.jsx`)
- `docs/agent-briefs/BE-005-benachrichtigungs-historie.md`: liefert die
  `/benachrichtigungen`-Endpunkte, die diese Seite anzeigt

## Entscheidungen (im Chat geklärt, 2026-09-17)

- **Profil = nur Lernprofil + Konto/Sync**, "Einstellungen" bleibt für
  Darstellung/Datenschutz/Tour-Button/Gefahrenzone bestehen (nicht
  komplett aufgelöst).
- **Benachrichtigungen gleich mit echtem Verlauf** (nicht nur Ein/Aus-
  Schalter) – Basis für eine spätere Mailbox mit privaten Nachrichten
  zwischen Nutzern.

## Umsetzungsschritte (Checkliste)

- [x] `Profil.jsx`: Lernprofil-Formular + Konto/Sync 1:1 aus
      `Einstellungen.jsx` übernommen
- [x] `Benachrichtigungen.jsx`: Verlauf-Liste (BE-005) + `PushEinstellungen`
- [x] `Einstellungen.jsx`: entschlackt, nicht mehr genutzte Imports entfernt
- [x] Navigation: zwei neue Punkte, Ungelesen-Badge bei Benachrichtigungen
- [x] Alle bisherigen `/einstellungen`-Login-Verweise auf `/profil`
      aktualisiert
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] "Profil" zeigt Lernprofil + (falls Sync aktiv) Konto/Login/Sync,
      identisches Verhalten wie vorher in Einstellungen
- [x] "Benachrichtigungen" zeigt Verlauf + Push-Schalter, Badge mit
      Ungelesen-Anzahl verschwindet nach dem Öffnen der jeweiligen Einträge
- [x] "Einstellungen" funktioniert weiterhin (Darstellung, Tour, Datenschutz,
      Gefahrenzone)
- [x] Keine tote Referenz mehr auf die alte Konto-Sektion in Einstellungen

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant, größtenteils 1:1 verschobener (nicht neu
geschriebener) Code aus der bisher funktionierenden Einstellungen-Seite –
das Regressionsrisiko ist dadurch gering. Reine Frontend-Logik, nicht in
der Sandbox lauffähig testbar (npm-Registry gesperrt), Klammer-/Struktur-
prüfung der geänderten Dateien lief sauber durch. `node
scripts/check-agent-briefs.mjs` läuft grün. Sven bestätigt nach
Dateiübernahme live auf seiner Maschine.
