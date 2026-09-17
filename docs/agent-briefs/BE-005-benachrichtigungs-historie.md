# Brief BE-005: Benachrichtigungs-Historie ("Mailbox"-Grundlage)

Status: done
Bereich: BE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Jede Benachrichtigung (bisher: die beiden Push-Trigger aus BE-001/BE-004)
wird jetzt zusätzlich dauerhaft in der Datenbank gespeichert und über
neue Endpunkte gelistet/als-gelesen-markierbar – unabhängig davon, ob
Push aktiv konfiguriert ist. Bildet die Grundlage für den neuen
"Benachrichtigungen"-Bereich im Frontend (FE-014) und lässt sich später
um private Nachrichten zwischen Nutzern erweitern, ohne die Tabelle/Route
nochmal umzubauen.

## Betroffene Dateien (exakte Pfade)

- `backend/db/schema.sql` – Tabelle `benachrichtigungen`
- `backend/src/push.js` – neue Funktion `benachrichtigeNutzer()`
- `backend/src/routes/benachrichtigungen.routes.js` (neu)
- `backend/src/routes/content-admin.routes.js` – nutzt jetzt
  `benachrichtigeNutzer()` statt der bisherigen `sendePushAnNutzer()`
  direkt
- `backend/src/routes/melden.routes.js` – ebenso
- `backend/src/app.js` – neue Route eingehängt

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/BE-001-push-benachrichtigungen.md`: liefert die
  bisherige `sendePushAnNutzer()`-Funktion (jetzt intern, nicht mehr
  exportiert – siehe unten)
- `docs/agent-briefs/BE-004-push-meldung-eingegangen.md`: zweiter
  bestehender Trigger, nutzt jetzt ebenfalls `benachrichtigeNutzer()`
- `docs/agent-briefs/FE-014-profil-benachrichtigungen-split.md`: Frontend-
  Seite, die diese Endpunkte anzeigt

## Entscheidung (im Chat geklärt, 2026-09-17)

- Gleich mit echtem Verlauf statt nur Ein/Aus-Schalter: neue Tabelle
  `benachrichtigungen`, bewusst generisch (kein fester Typ/Absender), um
  später private Nachrichten zwischen Nutzern zu ermöglichen.

## Umsetzungsschritte (Checkliste)

- [x] `benachrichtigungen`-Tabelle: `user_id`, `titel`, `text`, `url`,
      `gelesen_am`, `erstellt_am`
- [x] `push.js`: `sendePushAnNutzer()` intern (nicht mehr exportiert),
      neue öffentliche Funktion `benachrichtigeNutzer()` schreibt IMMER
      einen Historie-Eintrag und stößt zusätzlich, best-effort, Push an
- [x] Bestehende Trigger (BE-001 "Meldung bearbeitet", BE-004 "Neue
      Meldung") auf `benachrichtigeNutzer()` umgestellt
- [x] `GET /benachrichtigungen` (Liste + Ungelesen-Zähler),
      `POST /benachrichtigungen/:id/gelesen`,
      `POST /benachrichtigungen/alle-gelesen`
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Benachrichtigung landet in der Historie, auch wenn Push nicht
      konfiguriert ist
- [x] `GET /benachrichtigungen` liefert korrekten Ungelesen-Zähler
- [x] Als-gelesen-Markieren (einzeln und "alle") funktioniert und wirkt
      sich auf den Zähler aus
- [x] Bestehende Push-Zustellung (BE-001/BE-004) funktioniert unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. In der Sandbox getestet (lokaler PostgreSQL-16-
Cluster, danach wieder entfernt): `schema.sql` läuft sauber durch, die
komplette Trigger-Logik wurde als SQL-Sequenz nachgestellt (zwei
Benachrichtigungen anlegen → Liste + Zähler prüfen → einzeln als gelesen
markieren → Zähler prüfen → alle als gelesen markieren → Zähler prüfen)
und lief exakt wie erwartet durch. `node scripts/check-agent-briefs.mjs`
läuft grün. Sven bestätigt nach Dateiübernahme live auf seiner Maschine.
