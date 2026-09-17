# Brief BE-006: Benachrichtigungen archivieren & löschen

Status: done
Bereich: BE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Nutzer:innen sollen einzelne Benachrichtigungen aus der Mailbox (BE-005)
entweder reversibel archivieren (bleibt gespeichert, nur ausgeblendet) oder
endgültig löschen können, statt sich mit einer immer länger werdenden Liste
abfinden zu müssen. Direkt aus Svens Feedback zu FE-014/BE-005 entstanden.

## Betroffene Dateien (exakte Pfade)

- `backend/db/schema.sql` – neue Spalte `benachrichtigungen.archiviert_am`
- `backend/src/routes/benachrichtigungen.routes.js` – neue Endpunkte

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/BE-005-benachrichtigungs-historie.md`: liefert die
  Basistabelle/-route, die hier erweitert wird
- `docs/agent-briefs/FE-015-tour-sync-und-mailbox-aktionen.md`: Frontend-UI
  für diese Endpunkte

## Entscheidung (im Chat geklärt, 2026-09-17)

- Beides anbieten: "Archivieren" (reversibel, `archiviert_am` gesetzt) UND
  "Löschen" (endgültig, `DELETE`-Statement) – zwei getrennte Aktionen pro
  Eintrag, keine Zwangsentscheidung für eine der beiden Varianten.

## Umsetzungsschritte (Checkliste)

- [x] `benachrichtigungen.archiviert_am TIMESTAMPTZ` (nullable,
      `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`, upgrade-sicher)
- [x] `GET /benachrichtigungen` filtert standardmäßig `archiviert_am IS
      NULL`; `?ansicht=archiv` zeigt `archiviert_am IS NOT NULL`
- [x] Ungelesen-Zähler zählt archivierte Einträge nie mit (unabhängig von
      der angefragten Ansicht – bleibt konsistent mit dem Nav-Badge)
- [x] `POST /benachrichtigungen/:id/archivieren`
- [x] `POST /benachrichtigungen/:id/wiederherstellen`
- [x] `DELETE /benachrichtigungen/:id` – nur der eigene Eintrag
      (`user_id`-Check im WHERE, sonst 404 statt fremdes Löschen)
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Archivierter Eintrag verschwindet aus der Standard-Liste, taucht aber
      unter `?ansicht=archiv` weiterhin auf
- [x] Wiederherstellen macht das Archivieren rückgängig
- [x] Löschen entfernt den Eintrag endgültig aus der Tabelle
- [x] Ein Löschversuch mit falscher `user_id` löscht nichts (0 betroffene
      Zeilen statt eines Fehlers, der fremde IDs verraten würde)
- [x] Ungelesen-Zähler sinkt korrekt, wenn ein ungelesener Eintrag
      archiviert wird

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. In der Sandbox getestet (lokaler PostgreSQL-16-
Cluster, danach wieder entfernt, Rolle `azubiprep_app` simuliert die
Produktions-Rechte): `schema.sql` läuft sauber als Upgrade auf einer
bereits mit BE-005 bestückten DB durch. Komplette SQL-Sequenz nachgestellt
– zwei Benachrichtigungen anlegen → aktive Liste + Ungelesen-Zähler (2)
prüfen → Eintrag 1 archivieren → aktive Liste zeigt nur noch Eintrag 2,
Archiv-Ansicht nur Eintrag 1, Ungelesen-Zähler sinkt auf 1 → Eintrag 1
wiederherstellen → Löschversuch von Eintrag 2 mit falscher `user_id`
löscht nichts (DELETE 0) → Löschen mit korrekter `user_id` entfernt ihn
(DELETE 1) – alles exakt wie erwartet. `node scripts/check-agent-briefs.mjs`
läuft grün. Sven bestätigt: Funktioniert live auf seiner Maschine.
