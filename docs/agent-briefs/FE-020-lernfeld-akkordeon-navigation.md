# Brief FE-020: Lernbereich & Lernreise nach Lernfeld gliedern (Akkordeon)

Status: done
Bereich: FE
Angelegt: 2026-09-18
Abgeschlossen: 2026-09-18

## Ziel (1–3 Sätze)

Lernbereich (Modulauswahl für Quiz/Karteikarten) und Lernreise (Fortschritts-
Landkarte) sollen die Module nicht mehr nach Fachrichtungs-Blöcken, sondern
chronologisch nach der offiziellen KMK-Lernfeldstruktur (`LF1`–`LF12`, siehe
`CONTENT-007`) gliedern – als aufklappbares Akkordeon je Lernfeld. Ziel laut
Sven: die Struktur soll Lernende aktiv durch den Ausbildungsablauf führen,
nicht nur Module nach Fachrichtung sortiert auflisten.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/utils/lernfeldOrdnung.js` (neu) – kanonische Sortierreihenfolge
  LF1…LF9, dann LF10/11/12 mit Suffix der eigenen Fachrichtung zuerst, `KEIN_LF`
  (WiSo/PM) ans Ende. Enthält auch die Anzeige-Titel je LF (z. B. „LF3/LF9 –
  Netzwerktechnik-Grundlagen“ aus dem vorhandenen `lernfeld`-Feld der Module).
- `frontend/src/pages/Lernen.jsx` – Fachrichtungs-Blöcke + Sprunglink-Leiste
  durch Akkordeon-Gruppen je Lernfeld ersetzen (bestehende `ModulKarte`
  unverändert wiederverwendet, nur die Gruppierung ändert sich).
- `frontend/src/utils/lernreise.js` – `baueLernreise` sortiert Stationen künftig
  nach Lernfeld-Reihenfolge statt „gemeinsam zuerst, dann eigene in CSV-
  Reihenfolge“; `gemeinsam`/`eigene`-Trennung entfällt als primäre Gruppierung
  (Lernfeld ersetzt sie – gemeinsame und fachrichtungsspezifische Module
  mischen sich jetzt korrekt in der zeitlichen Reihenfolge).
- `frontend/src/pages/Lernreise.jsx` – Anpassung an die neue Gruppenstruktur
  aus `lernreise.js` (Akkordeon je Lernfeld statt der beiden festen Gruppen).
- `frontend/src/styles/global.css` – ggf. kleinere Ergänzungen, falls das
  bestehende `.akkordeon-*`-Styling für mehrere gleichzeitige Gruppen (statt
  bisher nur im Modul-Theorie-Kontext) Anpassungen braucht.

## Kontext (nur Verweise, keine Dokumentkopien)

- `CONTENT-007-lernfeld-taxonomie.md`: legt das `lernfeld`-Feld auf Modul- und
  Fragen-Ebene an (`modules.csv`, 6. Spalte), inkl. der vollständigen
  Mapping-Tabelle. Diese Werte werden hier nur *genutzt*, nicht verändert.
- `Akkordeon.jsx` (`frontend/src/components/`) existiert bereits (genutzt in
  `Modul.jsx` für Theorie-Abschnitte) und wird hier wiederverwendet statt neu
  gebaut.
- Entscheidungen, mit Sven im Chat abgestimmt (2026-09-18):
  - **Umfang**: sowohl Lernbereich- als auch Lernreise-Seite (nicht nur eine
    von beiden).
  - **Struktur**: flache Liste LF1–LF12 (keine zusätzliche Jahres-Über­gruppe
    Jahr 1/2/3) – mein Vorschlag, unwidersprochen übernommen.
  - **Genauigkeit**: die bestehende, grobe Lernfeld-Zuordnung aus
    `CONTENT-007` wird direkt verwendet, keine zusätzliche Einzelmodul-
    Nachrecherche vorab – mein Vorschlag, unwidersprochen übernommen.
  - Module mit Doppelwert (`NETZ-GRUND` → `LF3/LF9`) werden für die
    Sortierung/Gruppierung über den ersten Wert (`LF3`) einsortiert, im
    Akkordeon-Titel aber weiterhin mit dem vollen Wert angezeigt.
  - `KEIN_LF`-Module (WiSo, PM) bilden eine eigene Gruppe „Sonstige
    Prüfungsbereiche“ am Ende der Liste (sind offiziell keine Lernfelder,
    sollen aber nicht verschwinden).
- Die Haupt-Seitenleiste (`Layout.jsx`, Dashboard/Lernbereich/Prüfung/…)
  bleibt unverändert – die dort gelisteten Einträge sind Seiten, keine
  Module, und waren nicht Teil der Absprache.

## Umsetzungsschritte (Checkliste)

- [x] `lernfeldOrdnung.js` mit Sortierfunktion + Anzeige-Titel-Zuordnung
      angelegt, reine Funktion (testbar, kein React).
- [x] `Lernen.jsx`: Fachrichtungs-Blöcke durch Lernfeld-Akkordeon ersetzt
      (wiederverwendet `Akkordeon.jsx`); nach Nachbesserung (s. u.) starten
      alle Gruppen eingeklappt, mehrere gleichzeitig aufklappbar.
- [x] `lernreise.js`: `baueLernreise` auf Lernfeld-Sortierung umgestellt –
      `alle`/`fortschritt`/`naechsteStation`-Verhalten bewusst kompatibel
      gehalten, nur `gemeinsam`/`stationen` (feste Zwei-Gruppen-Trennung)
      durch `gruppen` (Lernfeld-Gruppen) ersetzt.
- [x] `Lernreise.jsx`: Darstellung an neue Lernfeld-Gruppen angepasst
      (Akkordeon statt fester Karten-Blöcke), Fachrichtungswechsel setzt die
      aufgeklappten Gruppen korrekt zurück.
- [x] Kein Frontend-Testframework vorhanden (`frontend/package.json` hat
      keinen `test`-Script, nur `dev`/`build`/`preview`) – daher keine
      Unit-Tests zu aktualisieren. Stattdessen die reine Sortier-/Gruppier-
      Logik (`lernfeldOrdnung.js` + `lernreise.js#baueLernreise`) in meiner
      Sandbox gegen die echten Daten aus `content/modules.csv` mit einem
      Wegwerf-Skript durchgerechnet (für alle vier Fachrichtungen geprüft:
      eigene LF10-12-Gruppe steht jeweils vor den anderen drei, `KEIN_LF`
      immer am Ende, Lernreise enthält nur eigene + `ALLE`-Module in
      durchgehender Nummerierung) – Skript nicht Teil der Auslieferung.
- [x] `npm run build` im `frontend`-Ordner – von Sven ausgeführt, lief
      fehlerfrei durch (vite build, 94 Module, 745ms).
- [x] Klicktest durch Sven (Web-Version, nach Nachbesserung): Lernbereich
      zeigt Lernfeld-Gruppen statt Fachrichtungs-Blöcken, Zuklappen
      funktioniert, Lernreise zeigt eine durchgehende, nach Lernfeld
      sortierte Stationenkette – "in der Web-Version passt alles".

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Lernbereich gruppiert alle Module nach Lernfeld (LF1–LF12 + „Sonstige
      Prüfungsbereiche“), nicht mehr nach Fachrichtung.
- [x] Lernreise zeigt Stationen in Lernfeld-Reihenfolge, gemeinsame und
      fachrichtungsspezifische Module korrekt gemischt statt in zwei
      getrennten Blöcken.
- [x] Keine Regression: Modul öffnen, Fortschrittsanzeige, „nächste Station“
      funktionieren weiterhin wie vorher.
- [x] `npm run build` läuft im `frontend`-Ordner fehlerfrei durch.

## Nachbesserung (Klicktest-Fund, Sven, 2026-09-18)

Beim Klicktest zwei Probleme gemeldet:
1. Im Lernbereich lässt sich die aufgeklappte Gruppe nicht zuklappen.
   **Ursache gefunden**: `Lernen.jsx` nutzte `null` sowohl für „noch nicht
   initialisiert" als auch für „vom Nutzer zugeklappt" – das Zuklappen hat
   dadurch sofort wieder die Auto-Öffnen-Logik ausgelöst. Behoben: State ist
   jetzt ein `Set` (wie schon in `Lernreise.jsx`), keine Auto-Öffnen-Logik
   mehr – auf Svens Wunsch starten jetzt alle Gruppen eingeklappt.
2. Im Lernbereich wird nur die Gruppe „Sonstige Prüfungsbereiche" angezeigt,
   alle anderen Lernfeld-Gruppen fehlen. **Ursache bestätigt**: Sven hat
   eine `DATABASE_URL` konfiguriert (`backend/.env`), sein Backend lädt
   Inhalte also aus PostgreSQL statt aus den CSV-Dateien (`DB-002`). Die
   `modules`-Tabelle hatte bisher keine `lernfeld`-Spalte – genau die in
   `CONTENT-007` dokumentierte, damals als "nicht-blockierend" eingestufte
   Lücke, die jetzt durch `FE-020` erstmals sichtbar wurde (`content/
   modules.csv` selbst hat die Spalte korrekt, das war also nicht der
   Fehler). **Behoben**:
   - `backend/db/schema.sql`: `modules.lernfeld`-Spalte ergänzt (in der
     `CREATE TABLE`-Definition für Neuinstallationen + als idempotentes
     `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` für bestehende wie Svens).
   - `backend/scripts/migrate-content-to-db.mjs`: INSERT/UPSERT für
     `modules` schreibt `lernfeld` jetzt mit.
   - `backend/src/content.js`: DB-Ladepfad selektiert `lernfeld` jetzt aus
     der DB (vorher nur aus CSV).
   Sven muss `schema.sql` erneut anwenden (idempotent, kein Datenverlust)
   und danach `npm run migrate-content` laufen lassen, damit die
   bestehenden `lernfeld`-Werte aus den CSV-Dateien in die Live-DB
   nachgezogen werden – siehe Checkliste unten.

Von Sven durchgeführt: `schema.sql`-Spalte über pgAdmin (nicht `psql` –
`azubiprep_app` ist nicht Eigentümer der Tabellen, siehe bekannte "Falle" in
`docs/19-Datenbank-Login.md`) sowie `node scripts/migrate-content-to-db.mjs`
(direkt statt über `npm run` – PowerShell-Skriptausführung war deaktiviert).
Migration lief sauber durch: 1627 Fragen, 21 Module, 4 Fachrichtungen.

## Noch offen: Lernfeld-Lücken sind erwartet, kein Bug

Sven hat bemerkt, dass die Lernfeld-Reihenfolge "Sprünge" macht (z. B. fehlt
LF1, LF6, LF7, LF8 komplett). Bestätigt: das liegt daran, dass aktuell nicht
zu jedem Lernfeld ein Modul existiert – `gruppiereNachLernfeld` zeigt nur
Gruppen, zu denen mindestens ein Modul gehört. Kein Fehler, sondern Stand
des Fragenkatalogs (1627 von grob geschätzt 2500–3000 für volle Abdeckung);
schließt sich automatisch, sobald künftige Content-Briefs (Richtung „1000
Fragen je Fachrichtung") Module für die fehlenden Lernfelder ergänzen.

## Noch offen: Desktop-Installer

Web-Version von Sven bestätigt ("in der Web-Version passt alles"). Der
Desktop-Installer wurde seit dieser Nachbesserung (Zuklapp-Fix + DB-Fix)
noch nicht neu gebaut – das läuft über `OPS-013` (separater Brief, dort
jetzt „Runde 2" ergänzt).

## Ergebnis

Web-Version vollständig funktionsfähig und von Sven bestätigt: Lernbereich
und Lernreise gruppieren nach Lernfeld statt Fachrichtung, Zuklappen
funktioniert, DB-Pfad liefert `lernfeld` korrekt. Zwei Nachbesserungen aus
dem Klicktest behoben (Zuklapp-Logik in `Lernen.jsx`, fehlende
`lernfeld`-Spalte im DB-Pfad). Desktop-Rebuild folgt separat über
`OPS-013`.
