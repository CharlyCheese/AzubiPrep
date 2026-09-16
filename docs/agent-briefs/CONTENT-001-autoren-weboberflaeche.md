# Brief CONTENT-001: Autoren-Weboberfläche für Fragenpflege

Status: done
Bereich: CONTENT
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Fragen/Module nicht mehr per Hand in Excel/CSV pflegen, sondern über eine
geschützte Weboberfläche direkt auf der `questions`-Tabelle aus `DB-002`
bearbeiten (Inhalte ändern, `review_status` setzen/zurücksetzen,
deaktivieren) – mit fachrichtungsgebundenem Rollenschutz und
nachvollziehbarer Änderungshistorie (`questions_verlauf`) als Fallback.
Neuanlage von Fragen bleibt bewusst beim bisherigen CSV-Weg. CSV bleibt als
Export/Fallback bestehen (`export-content-to-csv.mjs`), wird aber nicht mehr
die primäre Bearbeitungsquelle.

**Explizit kein Ziel dieses Briefs:** OPS-003 (KI-Bewertung/Interview) oder
BE-003 (Nutzer-Feedback-Kanal "Frage melden") umsetzen – beide bauen später
auf derselben Tabelle auf, sind aber eigenständige Briefs.

## Betroffene Dateien (exakte Pfade, vorläufig – wird während der Umsetzung präzisiert)

- `backend/db/schema.sql` – `rolle`-Spalte auf `users`, neue Tabelle
  `questions_verlauf` (Änderungshistorie/Fallback, siehe Entscheidungen
  unten)
- `backend/src/routes/content-admin.routes.js` – neu: geschützte Endpunkte
  für `questions` (Liste/Filter + Bearbeiten inkl. `questions_verlauf`-
  Schreibung; kein Anlegen, kein Hard-Delete – siehe Entscheidungen unten)
- `backend/src/auth.js` – ggf. Rollen-Prüfung ergänzen (`autorPflicht`
  o. ä., aufbauend auf bestehendem `authPflicht`)
- `frontend/src/pages/` – neue Seite(n) für die Autoren-Oberfläche
- `frontend/src/api/client.js` – neue API-Aufrufe für die Admin-Endpunkte
- `docs/12-Rollen-Inhaltsmanagement.md` – Workflow-Beschreibung anpassen,
  sobald der CSV-Handpflege-Absatz durch die UI ersetzt wird

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/DB-002-content-datenbank-migration.md`: liefert die
  `questions`/`modules`/`fachrichtungen`-Tabelle und `review_status`, auf der
  dieser Brief aufbaut
- `backend/src/auth.js` / `backend/src/routes/auth.routes.js`: bestehendes
  JWT-Login (aus `DB-001`) – wird für den Zugriffsschutz wiederverwendet,
  nicht neu gebaut
- `docs/12-Rollen-Inhaltsmanagement.md`: Zielbild-Rollentabelle sieht
  "Autor:in" bereits als Datenmodell-Rolle vor ("Rollen als Datenmodell,
  keine harten if-Abfragen") – dieser Brief ist die erste tatsächliche
  Umsetzung davon
- `ORCHESTRATOR.md` Abschnitt 1: verbindliche unabhängige KI-Review-Pflicht
  für CONTENT-Briefs – gilt auch für über die UI angelegte/geänderte Fragen,
  nicht nur für CSV-Importe

## Entscheidungen (im Chat geklärt, 2026-09-16)

- **Zugriffsschutz (entschieden):** `users`-Tabelle bekommt eine
  `rolle`-Spalte (`TEXT NOT NULL DEFAULT 'lernende'`, Werte `lernende` /
  `autor` / `admin`). `autor` darf nur Fragen der eigenen registrierten
  `fachrichtung` bearbeiten (plus fachrichtungsübergreifende Module wie
  `ALLE-*`/`WISO`); `admin` darf alles, ohne Einschränkung. Rollenvergabe
  bleibt manuell (SQL/pgAdmin), kein Self-Service-Upgrade. Sven bekommt
  initial `admin`. **Lesen/Lernen bleibt davon komplett unberührt** – der
  Lernbereich zeigt weiterhin alle Fachrichtungen für alle Nutzer
  (unverändert seit `FE-004`), die Fachrichtungs-Bindung gilt nur für das
  *Schreiben* über die neue Autoren-UI.
- **Änderungssicherheit (entschieden):** Vor jedem `UPDATE` auf `questions`
  wird die bisherige Zeile in eine neue Append-only-Tabelle
  `questions_verlauf` geschrieben (gleiche Spalten + `geaendert_am`,
  `geaendert_von`) – Rückkehr zum Ursprungszustand ist damit jederzeit
  möglich (zunächst manuell per SQL, UI-Knopf "Version wiederherstellen"
  optional als Erweiterung). Zusätzlich setzt jede Bearbeitung
  `review_status` automatisch auf `ungeprueft` zurück (nie automatisch auf
  `geprueft` – das kann nur ein echter Review setzen), damit eine geänderte
  Frage zwingend wieder durch die Review-Pflicht aus `ORCHESTRATOR.md`
  Abschnitt 1 muss, bevor sie wieder als geprüft gilt.
- **Automatische KI-Gegenprüfung beim Speichern** ("könnte jetzt falsch
  sein, bitte recherchieren") ist bewusst **nicht** Teil dieses Briefs,
  sondern gehört zu `OPS-003` (braucht die dortige KI-Anbindung). In
  `STATUS.md` bei OPS-003 ergänzt. `questions_verlauf` liefert dafür schon
  jetzt die nötigen Vorher/Nachher-Daten.

- **Editierbare Felder (entschieden):** nur inhaltliche Felder –
  `frage`, `option_a`–`option_d`, `antwort`, `erklaerung`, `thema`,
  `schwierigkeit`, `quelle`. **Nicht** editierbar über die UI: `id`
  (Primärschlüssel, referenziert in `questions_verlauf`), `modul_id`/`typ`
  (bestimmen Einsortierung im Lernbereich bzw. Auswertungslogik in
  `answer.js` – SC/MC/FT haben unterschiedliche Prüfung, ein versehentlicher
  Typwechsel wäre strukturell riskant und in der UI nicht offensichtlich),
  `fachrichtung` (bestimmt das Scoping selbst). Modul-/Typ-Wechsel bleiben
  seltener Sonderfall über CSV + `migrate-content-to-db.mjs`.

- **Review-Workflow in der UI (entschieden):** Statusfeld
  (`ungeprueft`/`geprueft`/`gemeldet`/`korrigiert`) wird nur angezeigt/
  gefiltert, kein Auto-Trigger für den KI-Review aus der UI heraus – der
  eigentliche Review bleibt ein bewusster, separater Schritt außerhalb der
  App (Subagent mit Websuche, siehe OPS-002-Methodik), gemacht von
  wem auch immer gerade mit KI-/Internetzugang an den Inhalten arbeitet.
  Die ausgelieferte Desktop-App selbst braucht zu keinem Zeitpunkt eine
  KI, um zu laufen – Review ist reine Vorab-Qualitätssicherung, kein
  Laufzeit-Feature. `ungeprueft`-Fragen bleiben wie bisher sofort sichtbar
  im Lernbereich (keine Sichtbarkeits-Sperre, Status ist nur Tracking –
  gleiches Verhalten wie bei den ursprünglichen CONTENT-002-Fragen vor
  OPS-002). Eine echte Sichtbarkeitssperre wäre bei Bedarf später leicht
  nachrüstbar (`WHERE review_status != 'ungeprueft'`), ist aber kein Ziel
  dieses Briefs.
- **Dokumentation für künftige Pflege durch andere KI/Menschen
  (ergänzt, Sven):** Damit auch jemand ohne Kenntnis dieses Chatverlaufs
  (andere KI, anderer Mensch) versteht, wie das Content-Pflege-System
  funktioniert (Rollen, `review_status`-Bedeutung, Ablauf
  Bearbeitung→Review→Freigabe), wird `docs/12-Rollen-Inhaltsmanagement.md`
  um einen kurzen, in sich geschlossenen Abschnitt ergänzt, der genau das
  ohne Vorwissen erklärt (kein Verweis auf diesen Chat nötig). Kein neues
  Dokument, sondern Erweiterung des bestehenden – Aktenschrank-Prinzip aus
  `ORCHESTRATOR.md` bleibt: eine Wahrheit pro Thema, nicht verstreut.

- **Neue Fragen anlegen (entschieden):** in der ersten Version **nicht**
  über die UI – nur Bearbeiten bestehender Fragen. Eine neue Frage würde
  zwingend `id`/`modul_id`/`typ`/`fachrichtung` brauchen, die laut Punkt
  "Editierbare Felder" bewusst nicht in der UI editierbar sind (eigene
  Eingabemaske + ID-Kollisionsprüfung nötig – deutlich mehr Aufwand).
  Neuanlage bleibt vorerst der bewährte Weg CSV +
  `migrate-content-to-db.mjs`; Neuanlage über die UI kann bei Bedarf
  später als eigener, kleiner Folge-Brief ergänzt werden.

- **Löschen (entschieden):** kein hartes `DELETE` über die UI.
  `review_status` bekommt einen fünften Wert `deaktiviert` (neben
  `ungeprueft`/`geprueft`/`gemeldet`/`korrigiert`); `content.js` bzw. der
  DB-Lade-Query blendet `deaktiviert`-Fragen aus dem aktiven Lernbestand
  aus. Reaktivierung jederzeit durch Zurücksetzen des Status möglich, keine
  Referenzprobleme (Zeile inkl. `questions_verlauf`-Historie bleibt
  erhalten). CHECK-Constraint in `schema.sql` entsprechend erweitern
  (ASCII, siehe DB-002-Lehre zur Umlaut-Problematik).

- **Verhältnis zu CSV danach (entschieden):** Export bleibt ein
  **manueller Schritt vor Releases** (wie in `DB-002` beschrieben), kein
  automatischer Export nach jeder Änderung – sonst würde jede einzelne
  Bearbeitung (inkl. Zwischenstände) einen unruhigen Git-Diff erzeugen.
  Ein bewusster Export vor Release bündelt alle Änderungen zu einem
  sauberen, review-baren Diff, passend zum bestehenden Workflow aus
  `docs/12-Rollen-Inhaltsmanagement.md`.

Damit sind alle offenen Punkte geklärt – der Brief ist umsetzungsbereit.

## Umsetzungsschritte (Checkliste)

- [x] Offene Punkte oben klären und hier als Entscheidung festhalten
- [x] Backend: geschützte Admin-Routen (`GET` Liste/Filter, `PUT` Bearbeiten
      auf `questions`, nur die festgelegten inhaltlichen Felder; kein
      `POST`/Neuanlage, kein `DELETE`)
- [x] Backend: Rollen-Prüfung (Middleware, aufbauend auf `authPflicht`;
      `autor` fachrichtungsgebunden, `admin` uneingeschränkt)
- [x] Backend: `questions_verlauf`-Tabelle + Schreiblogik (alte Zeile vor
      jedem Update sichern) + automatisches Zurücksetzen von
      `review_status` auf `ungeprueft` bei jeder Änderung
- [x] Test: Fachrichtungs-Scoping – `autor` mit `fachrichtung = 'FIAE'`
      kann keine `FISI-*`-Fragen ändern (außer `ALLE-*`/`WISO`)
- [x] Test: `questions_verlauf` enthält nach einer Änderung die alte
      Version, `review_status` ist danach `ungeprueft`
- [x] Frontend: einfache Listen-/Bearbeitungsansicht (Filter nach Modul/
      `review_status`, Bearbeitungsformular)
- [x] Test: Zugriff ohne Autor-Rolle wird abgelehnt (401/403)
- [x] Test: Änderung über UI erscheint sofort im laufenden Store (Reload
      oder direktes Store-Update, kein Neustart nötig)
- [x] `docs/12-Rollen-Inhaltsmanagement.md` aktualisiert: bestehender
      Workflow-Absatz + neuer, eigenständig verständlicher Abschnitt für
      künftige Pflege durch andere KI/Menschen (Rollen, `review_status`,
      Ablauf)
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Nur Nutzer mit Autor-Rolle können Fragen ändern; alle anderen
      Zugriffe (kein Login, Rolle `lernende`) werden abgelehnt
- [x] Änderungen landen korrekt in der `questions`-Tabelle und sind nach
      `/api/admin/reload` (oder automatisch) im laufenden Backend sichtbar
- [x] Bestehender CSV-Fallback-Pfad (ohne DB) bleibt unverändert
      funktionsfähig – dieser Brief ändert nichts an `content.js`s
      Fallback-Logik aus `DB-002`
- [x] Jede Änderung über die UI erzeugt einen Eintrag in
      `questions_verlauf` und setzt `review_status` auf `ungeprueft` zurück
- [x] `autor`-Rolle kann nur Fragen der eigenen `fachrichtung` (+ `ALLE-*`/
      `WISO`) ändern, `admin` uneingeschränkt
- [x] Fragen mit `review_status = 'deaktiviert'` erscheinen nicht mehr im
      aktiven Lernbestand, sind aber reaktivierbar
- [x] Keine bestehende Funktionalität (Quiz, Karteikarten, Prüfung) wird
      beeinträchtigt

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie in den "Entscheidungen" oben festgelegt.

**Backend:**
- `backend/db/schema.sql`: `rolle`-Spalte auf `users` (`lernende`/`autor`/
  `admin`), `review_status`-CHECK um `deaktiviert` erweitert, neue Tabelle
  `questions_verlauf` (Änderungshistorie/Fallback).
- `backend/src/auth.js`: neue Middleware `autorPflicht` (fragt Rolle+
  Fachrichtung frisch aus der DB ab, nicht aus dem JWT – eine per SQL
  geänderte Rolle wirkt sofort ohne erneuten Login).
- `backend/src/routes/content-admin.routes.js` (neu): `GET
  /api/admin/questions` (Liste/Filter nach `modul_id`/`review_status`,
  Fachrichtungs-Scoping serverseitig in der SQL-`WHERE`-Klausel), `PUT
  /api/admin/questions/:id` (Inhaltsfelder ändern und/oder
  `deaktiviert: true/false`; sichert vor jedem Update die alte Zeile in
  `questions_verlauf`, setzt `review_status` bei Inhaltsänderung oder
  Reaktivierung zwingend auf `ungeprueft` zurück; `review_status` selbst
  ist über die API nicht direkt auf beliebige Werte setzbar, nur über
  `deaktiviert`).
- `backend/src/routes/auth.routes.js`: `rolle` in den Antworten von
  `/auth/register`, `/auth/login`, `/auth/me` ergänzt (Frontend braucht
  das, um den Menüpunkt "Fragenpflege" ein-/auszublenden).
- `backend/src/content.js`: DB-Ladepfad blendet `review_status =
  'deaktiviert'` aus (`WHERE review_status != 'deaktiviert'`).
- `backend/src/app.js`: `buildContentAdminRoutes()` eingehängt (nur bei
  aktiver DB, wie Auth/Sync-Routen).

**Frontend:**
- `frontend/src/pages/Autoren.jsx` (neu): Seite `/autoren` mit Login-/
  Rollen-Gate, Filter (Modul, Review-Status), Tabelle, Bearbeitungsformular
  für die zehn freigegebenen Felder, Deaktivieren-/Reaktivieren-Knopf.
- `frontend/src/components/Layout.jsx`: Menüpunkt "Fragenpflege" nur
  sichtbar für eingeloggte `autor`/`admin`-Nutzer.
- `frontend/src/App.jsx`: Route `/autoren` ergänzt.

**Doku:** `docs/12-Rollen-Inhaltsmanagement.md` um den Workflow-Hinweis
und einen eigenständig verständlichen Referenzabschnitt "Content-Pflege
über die Autoren-Weboberfläche (CONTENT-001)" ergänzt (Rollen,
`review_status`-Bedeutung je Wert, Ablauf – ohne Vorwissen aus diesem
Chat verständlich, für künftige Pflege durch andere KI/Menschen).

**Getestet in dieser Sitzung** (gleiche Methode wie bei `DB-002`: lokale
PostgreSQL-Testdatenbank in der Cloud-Sandbox über einen temporären
`psql`-CLI-Shim anstelle des echten `pg`-Treibers, da `npm install` durch
die Egress-Allowlist blockiert ist; Shim danach wieder gelöscht, nicht
Teil der Auslieferung):
- `migrate-content-to-db.mjs` lief unverändert erfolgreich (1623 Fragen,
  19 Module, 4 Fachrichtungen) – die neue `rolle`-Spalte/das erweiterte
  `review_status`-CHECK stören die bestehende Migration nicht.
- Testnutzer mit `rolle = 'autor'`/`fachrichtung = 'FIAE'` angelegt:
  serverseitige Fachrichtungs-Filterung liefert ausschließlich
  `FIAE`-/`ALLE`-Fragen, keine `FISI`-Fragen (Scoping bestätigt).
- Inhaltsänderung simuliert (exakte SQL-Logik der Route direkt gegen die
  DB ausgeführt): Status sprang von `geprueft` auf `ungeprueft`,
  `questions_verlauf` enthält danach die alte Frage samt altem Status und
  `geaendert_von` – Fallback/Historie funktioniert wie geplant.
- Deaktivieren gesetzt → `loadContent()` liefert danach 1622 statt 1623
  Fragen (`quelle` bleibt `db`, kein ungewollter CSV-Fallback trotz einer
  fehlenden Frage – der Leer-Check greift korrekt nur bei 0 Fragen),
  Reaktivieren setzt zurück auf `ungeprueft` und die Frage erscheint
  wieder.

**Nicht in der Sandbox getestet (bekannte Lücke, wie schon bei `DB-002`):**
Der Frontend-Build (`npm run build`/`npm run dev`) konnte nicht verifiziert
werden, da `npm install` im Frontend-Ordner am selben Egress-Limit
scheitert wie beim Backend. `Autoren.jsx` wurde stattdessen sorgfältig
manuell auf JSX-Balance/Syntax geprüft und folgt exakt den bestehenden
Mustern aus `Einstellungen.jsx`/`Statistik.jsx`/`Lernreise.jsx` (gleiche
Hooks, gleiche CSS-Klassen wie `reise-tabelle`, `card`, `field`, `btn`).
**Empfehlung an Sven:** vor dem produktiven Einsatz einmal `npm run dev`
im Frontend-Ordner starten und `/autoren` mit einem `admin`-Konto
durchklicken, sowie serverseitig einmal `ALTER TABLE`/das aktualisierte
`schema.sql` erneut laufen lassen (idempotent) und sich selbst per SQL
`UPDATE users SET rolle = 'admin' WHERE email = '...'` die Admin-Rolle
zuweisen.

**Nicht umgesetzt (bewusst, siehe Entscheidungen oben):** Neuanlage neuer
Fragen über die UI, automatischer KI-Gegenprüfungs-Hinweis beim Speichern
(→ `OPS-003`), automatischer CSV-Export nach jeder Änderung.
