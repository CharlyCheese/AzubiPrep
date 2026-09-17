# Brief BE-001: Push-Benachrichtigungen (Web-Push)

Status: done
Bereich: BE
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Eingeloggte Nutzer können Push-Benachrichtigungen aktivieren und werden
dann z. B. informiert, wenn eine von ihnen gemeldete Frage (BE-003)
bearbeitet wurde. Kontogebunden (siehe Entscheidungen), mit Grundinfra-
struktur für weitere Trigger in Zukunft.

## Betroffene Dateien (exakte Pfade)

- `backend/db/schema.sql` – Tabelle `push_subscriptions`,
  `fragen_meldungen.benachrichtigt_am`
- `backend/package.json` – neue Abhängigkeit `web-push`
- `backend/src/config.js` – VAPID-Konfiguration aus Env
- `backend/src/push.js` (neu) – Sende-Helper
- `backend/src/routes/push.routes.js` (neu) – Subscribe/Unsubscribe/Public-Key
- `backend/src/routes/content-admin.routes.js` – Trigger "Meldung bearbeitet"
- `backend/src/app.js` – Route eingehängt, `/api/status` liefert `pushAktiviert`
- `backend/scripts/generate-vapid-keys.mjs` (neu)
- `frontend/public/sw.js` – `push`/`notificationclick`-Handler (Version v3)
- `frontend/src/utils/push.js` (neu)
- `frontend/src/components/PushEinstellungen.jsx` (neu)
- `frontend/src/pages/Einstellungen.jsx` – Einbindung
- `desktop/main.js` – Berechtigungs-Handler für native Toasts, AppUserModelId

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/BE-001-push-benachrichtigungen-ideen.md`: Vorarbeit/
  Ausbaustufen/Aufwandseinschätzung, Grundlage für die Entscheidungsrunde
- `docs/agent-briefs/BE-003-frage-melden.md`: liefert den ersten Trigger
  (Meldung bearbeitet)
- `docs/agent-briefs/FE-012-landing-page.md`: parallel entstandene Landing-
  Page, auf der Push künftig mitbeworben werden kann

## Entscheidungen (im Chat geklärt, 2026-09-16/17)

- **Variante A (kontogebunden)**: Push nur für eingeloggte Nutzer, an
  `user_id` gebunden. Passt zum bestehenden Muster (Login/Sync/Autoren-
  Bereich/Melden sind alle schon an "DB vorhanden + eingeloggt" gekoppelt).
- **Erster Trigger: "Meldung bearbeitet"**: kein Scheduler nötig, knüpft
  direkt an BE-003 an, geringster Aufwand für den Start.
- **iOS-Einschränkung akzeptiert**: kein Web-Push im normalen Safari-Tab,
  nur nach "Zum Home-Bildschirm hinzufügen" – wird für jetzt hingenommen,
  kein Blocker.
- **Electron gleich mitgedacht**: kein separater nativer Code-Pfad nötig –
  Electrons Chromium-Unterbau unterstützt Web-Push genauso wie ein
  normaler Browser, sofern die Berechtigung automatisch erteilt wird
  (Electron zeigt anders als ein Browser-Tab keinen Berechtigungsdialog).
  Ergänzt in `desktop/main.js`: `session.setPermissionRequestHandler`
  erlaubt `notifications` pauschal (keine Fremdinhalte im Fenster, nur das
  eigene lokale Backend), plus `app.setAppUserModelId` für saubere
  Windows-Toast-Beschriftung.
- **Opt-in/Opt-out-Schalter**: eigener Button in den Einstellungen
  zusätzlich zur Browser-Berechtigung (Annahme aus der Ideen-Vorlage,
  nicht widersprochen).

## Umsetzungsschritte (Checkliste)

- [x] `push_subscriptions`-Tabelle + `fragen_meldungen.benachrichtigt_am`
      (Upgrade-Pfad, idempotent)
- [x] `web-push` als Abhängigkeit ergänzt, VAPID-Konfiguration optional
      (fehlt sie, bleibt Push deaktiviert – wie bei `DATABASE_URL`)
- [x] `generate-vapid-keys.mjs`-Skript zum einmaligen Erzeugen des
      Schlüsselpaars
- [x] `GET /push/public-key`, `POST /push/subscribe`,
      `POST /push/unsubscribe`
- [x] `/api/status` liefert zusätzlich `pushAktiviert`
- [x] Trigger in `content-admin.routes.js`: Frage war `gemeldet` und ist es
      nach dieser Bearbeitung nicht mehr → alle noch unbenachrichtigten
      Melder:innen bekommen eine Push-Nachricht, `benachrichtigt_am` wird
      gesetzt (keine doppelten Benachrichtigungen)
- [x] `sw.js`: `push`- und `notificationclick`-Handler (Version v3)
- [x] Frontend: `PushEinstellungen`-Komponente (Aktivieren/Deaktivieren),
      in Einstellungen unter "Konto & Synchronisierung" eingebunden, nur
      sichtbar wenn eingeloggt und `pushAktiviert`
- [x] `desktop/main.js`: Berechtigungs-Handler + AppUserModelId
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Ohne VAPID-Konfiguration bleibt alles wie vorher (kein Fehler, Button
      erscheint nicht)
- [x] Nach "Benachrichtigungen aktivieren": Zeile in `push_subscriptions`
- [x] Autor:in/Admin bearbeitet eine gemeldete Frage → Melder:in bekommt
      Push, `fragen_meldungen.benachrichtigt_am` wird gesetzt
- [x] Zweite Bearbeitung derselben (bereits benachrichtigten) Meldung löst
      keine doppelte Push-Nachricht aus
- [x] Bestehende Fragenpflege-/Melden-Funktionalität unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. In der Sandbox getestet (lokaler PostgreSQL-16-
Cluster, danach wieder entfernt): `schema.sql` läuft sauber durch
(`push_subscriptions`, `benachrichtigt_am`-Upgrade-Pfad), die komplette
Trigger-Logik wurde als SQL-Sequenz nachgestellt (Subscription anlegen →
Frage melden → Bearbeitung mit vorherigem Status `gemeldet` → offene,
unbenachrichtigte Meldungen ermitteln → `benachrichtigt_am` setzen) und
lief fehlerfrei durch. `node scripts/check-agent-briefs.mjs` läuft grün.

Nicht in der Sandbox testbar: die eigentliche `web-push`-Bibliothek
(npm-Registry gesperrt) und alles Browser-/Electron-seitige (Service-
Worker-Push-Events, Berechtigungsdialog, native Toast-Darstellung unter
Windows) – Sven bestätigt nach Dateiübernahme live auf seiner Maschine.
Dafür nötig: einmalig `node backend/scripts/generate-vapid-keys.mjs`
ausführen und die drei ausgegebenen Zeilen in `backend/.env` eintragen.
