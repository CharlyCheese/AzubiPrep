# Brief FE-001: Login-/Registrierungs-UI + Umschaltung lokal/synchronisiert

Status: in Testung
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Frontend-Anbindung an das bestehende Backend-Login/Sync aus `DB-001`:
Nutzer:innen können sich optional registrieren/anmelden und ihren lokalen
Lernstand manuell mit dem Server abgleichen (Last-Write-Wins, wie in
`docs/19-Datenbank-Login.md` dokumentiert). Ohne Login bleibt die App exakt
wie bisher rein lokal nutzbar – Login ist eine Ergänzung, kein Zwang.

## Betroffene Dateien (exakte Pfade)

- `backend/src/app.js` (neuer, immer verfügbarer `GET /api/status`)
- `frontend/src/store/authStore.js` (neu)
- `frontend/src/store/localStore.js` (setAll-Methoden für Sync-Import ergänzt)
- `frontend/src/store/gamificationStore.js` (replace-Methode für Sync-Import)
- `frontend/src/api/client.js` (Authorization-Header, put(), 401-Handling)
- `frontend/src/api/sync.js` (neu: hochladen()/herunterladen())
- `frontend/src/pages/Einstellungen.jsx` (neue Karte „Konto & Synchronisierung")

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/19-Datenbank-Login.md` (Architektur, Datenmodell, Last-Write-Wins)
- `backend/src/routes/auth.routes.js`, `backend/src/routes/sync.routes.js`
- `docs/agent-briefs/DB-001-postgres-login-sync.md` (Backend-Grundlage)

## Umsetzungsschritte (Checkliste)

- [x] `GET /api/status` im Backend ergänzen (liefert `{ syncAktiviert }`,
      unabhängig davon ob DB aktiv ist – damit das Frontend weiß, ob es die
      Konto-Sektion überhaupt anzeigen soll)
- [x] `authStore.js`: Token + Nutzer in `localStorage` halten, reaktiv über
      `useSyncExternalStore` (gleiches Muster wie `gamificationStore`)
- [x] `api/client.js`: Authorization-Header aus `authStore` anhängen, `put()`
      ergänzen, bei `401` automatisch lokal ausloggen (kein Endlos-Loop mit
      ungültigem Token)
- [x] `api/sync.js`: `hochladen()` (alle 6 Stores per PUT senden) und
      `herunterladen()` (GET /sync, alle 6 Stores lokal überschreiben)
- [x] Fehlende `setAll`/`replace`-Methoden in den betroffenen Stores ergänzt
- [x] Einstellungen.jsx: Karte „Konto & Synchronisierung" – Login/Register-
      Formular wenn ausgeloggt, Konto-Info + Sync-Buttons wenn eingeloggt,
      Sektion komplett ausgeblendet wenn `syncAktiviert === false`
- [x] Datenschutz-Hinweistext in Einstellungen.jsx entsprechend angepasst
      (nicht mehr pauschal „kein Login nötig")

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Ohne konfigurierte Datenbank (wie bisher) verhält sich die App
      unverändert – keine Konto-Sektion sichtbar, keine Fehler in der Konsole
- [ ] Mit konfigurierter Datenbank: Registrierung, Login, Logout funktionieren
      über die UI
- [ ] „Jetzt hochladen" überträgt den aktuellen lokalen Stand aller 6 Stores
      zum Server (per curl/pgAdmin nachprüfbar)
- [ ] „Jetzt herunterladen" überschreibt den lokalen Stand mit den
      Server-Daten und die UI aktualisiert sich sichtbar
- [ ] Ungültiger/abgelaufener Token führt zu sauberem Logout statt zu
      Endlos-Fehlern

(Abnahme-Kriterien bewusst noch nicht abgehakt – die funktionale Prüfung im
Browser mit echter DB steht noch aus, siehe Ergebnis unten.)

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant, plus ein Punkt über den ursprünglichen Plan hinaus:
`profileStore` bekam kein neues `setAll` (nutzt das bereits vorhandene
`set()`), aber `progressStore`, `examStore`, `activityStore`, `flashcardStore`
je ein neues `setAll(daten)` und `gamificationStore` ein `replace(game)` –
alle nötig, damit „Jetzt herunterladen" den Serverstand vollständig lokal
übernehmen kann.

Sync ist bewusst **manuell** (zwei Buttons „Hochladen"/„Herunterladen"),
kein automatischer Hintergrund-Sync – passt zur dokumentierten
Last-Write-Wins-Strategie und macht für den Nutzer sichtbar, welcher Stand
gerade übernommen wird, statt still im Hintergrund zu überschreiben.

Offen/nicht Teil dieses Tasks: Passwort-Reset-Flow (steht schon als
bekannte Lücke in `docs/19-Datenbank-Login.md`), automatischer Sync,
Konfliktauflösung bei mehreren gleichzeitig aktiven Geräten.

Verifikation: Backend-Syntax mit `node --check` geprüft (app.js, authStore.js,
client.js, sync.js, localStore.js, gamificationStore.js – alle ohne Fehler).
JSX (`Einstellungen.jsx`) konnte im Sandbox nicht automatisiert geprüft
werden (kein Bundler verfügbar) – funktionale Prüfung im Browser
(Registrierung/Login/Sync-Buttons/Logout, jeweils mit und ohne konfigurierte
Datenbank) steht noch durch Sven aus, bevor die Abnahme-Kriterien oben
abgehakt werden.
