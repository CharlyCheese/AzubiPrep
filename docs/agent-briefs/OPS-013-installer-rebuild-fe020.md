# Brief OPS-013: Desktop-Installer neu bauen (mit FE-020)

Status: done
Bereich: OPS
Angelegt: 2026-09-18
Abgeschlossen: 2026-09-18

## Ziel (1–3 Sätze)

`FE-020` (Lernbereich & Lernreise nach Lernfeld gegliedert, inkl. der beim
Klicktest gefundenen Nachbesserungen) ist nur in der Web-Version bestätigt,
noch nicht in der Desktop-App. Der Windows-Installer muss neu erzeugt
werden, damit die Desktop-App den gleichen Stand wie die Web-Version hat.

## Betroffene Dateien (exakte Pfade)

Keine Code-Änderungen in diesem Brief – reiner Build-Vorgang, wie schon bei
`OPS-012`. Betroffen ist nur der generierte Installer (`Installer/`,
git-ignoriert).

## Kontext (nur Verweise, keine Dokumentkopien)

- `FE-020-lernfeld-akkordeon-navigation.md`: Quelle der Änderungen. Anders
  als ursprünglich in diesem Brief angenommen, sind diesmal **doch** auch
  Backend-Dateien betroffen (`backend/src/content.js`, `backend/db/
  schema.sql`, `backend/scripts/migrate-content-to-db.mjs` – Fund aus der
  Nachbesserung: Svens Backend läuft mit `DATABASE_URL`, siehe unten), nicht
  nur `frontend/src/...` wie ursprünglich angenommen. `npm run dist` packt
  laut `desktop/package.json#extraResources` ohnehin immer den kompletten
  `backend/`-Ordner mit ein, das ist also kein zusätzlicher Schritt.
- **Wichtig zur Datenbank**: die Desktop-App nutzt dieselbe lokale
  PostgreSQL-Instanz wie die Web-Version (`backend/.env#DATABASE_URL` zeigt
  auf `localhost`, wird beim Rebuild mit in den Installer kopiert – siehe
  Sicherheitshinweis unten). Die `lernfeld`-Spalte in der DB wurde von Sven
  bereits per pgAdmin + `migrate-content` ergänzt/befüllt – das muss für
  den Installer **nicht** wiederholt werden, es ist dieselbe Datenbank.
- `OPS-012-installer-rebuild-fe018.md`: gleiches Muster, dort bereits
  zweimal erfolgreich durchlaufen.
- Wie immer: ich kann den Build nicht selbst anstoßen (kein `device_bash`,
  npm-Registry in meiner Sandbox blockiert) – Befehle unten sind
  Kopiervorlage für Sven.

## Umsetzungsschritte (Checkliste)

- [x] Frontend production-build erneut erzeugt.
- [x] `npm run dist` im `desktop`-Ordner ausgeführt – **erster Versuch
      scheiterte lautlos falsch-positiv**: PowerShell blockierte `npm run
      dist` (`npm.ps1` per Skript-Ausführungsrichtlinie deaktiviert, gleicher
      Fehler wie zuvor bei `npm run migrate-content`, siehe Nachbesserung
      unten) – der zuvor installierte Installer war dadurch de facto noch
      der alte Stand, obwohl der Befehl „ausgeführt" wurde. Mit `npm.cmd run
      dist` (umgeht den PowerShell-Skript-Block) lief der Build sauber durch
      (electron-builder 25.1.8, Electron 32.3.3).
- [x] Neuen Installer installiert.
- [x] Funktionscheck: `/lernen` zeigt alle Lernfeld-Gruppen, Zuklappen
      funktioniert, DB-Pfad liefert `lernfeld` korrekt (per
      `Select-String` auf die gepackte `content.js` im
      `resources`-Ordner verifiziert, nicht nur per Sichtprüfung).

Befehle:
```
cd "C:\Users\Charly Cheese\Lernprogramm Azubiprep\AzubiPrep\frontend"
npm run build

cd "C:\Users\Charly Cheese\Lernprogramm Azubiprep\AzubiPrep\desktop"
npm run dist
```
Installer landet wie gehabt unter:
`C:\Users\Charly Cheese\Lernprogramm Azubiprep\AzubiPrep\Installer\AzubiPrep Setup 0.1.0.exe`

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Installer baut ohne Fehler durch.
- [x] Installation läuft durch, App startet.
- [x] `FE-020` (Lernfeld-Akkordeons, alle Gruppen sichtbar, Zuklappen
      funktioniert) ist in der installierten Desktop-App vorhanden, keine
      sichtbare Regression gegenüber der Web-Version.

## Nachbesserung: PowerShell blockiert `npm run <script>` lautlos-nicht-lautlos

Zweiter bekannter Fall (erster: `npm run migrate-content`, siehe `FE-020`)
derselben Windows-Falle: `npm run <script>` ruft intern `npm.ps1` auf, und
Windows' Standard-Skript-Ausführungsrichtlinie blockiert das in PowerShell
(nicht aber in `cmd.exe`/der klassischen Eingabeaufforderung – dort liefen
die allerersten Rebuilds in `OPS-012` deshalb reibungslos durch). Der
Fehler wird zwar angezeigt, ist aber leicht zu übersehen bzw. lässt einen
denken, der Befehl sei "gelaufen", während tatsächlich gar kein neuer Build
entstanden ist – genau das ist hier passiert und hat die Fehlersuche
unnötig in die Länge gezogen (Cache-Löschung, `.env`/DB-Checks – alles
Symptome, nicht die Ursache). **Fix, der zuverlässig funktioniert**:
`npm.cmd run <script>` statt `npm run <script>` in PowerShell. Für
zukünftige Kopiervorlagen in Briefs: wo möglich `npm.cmd` statt `npm`
verwenden, um diese Falle von vornherein zu vermeiden.

## Sicherheitshinweis (Nebenfund, kein Teil dieses Briefs)

Beim Nachvollziehen von `extraResources` aufgefallen: der Installer packt
`backend/` **komplett** ein (`filter: ["**/*", "!**/*.log"]`), inklusive
`backend/.env` – d. h. Svens DB-Passwort (`ITausbildung`) steckt aktuell im
Klartext in der `.exe`. Solange der Installer nur lokal bei Sven bleibt,
unkritisch; falls er je geteilt/veröffentlicht wird (Repo ist bereits
öffentlich auf GitHub, `OPS-010`), wäre das ein Datenleck. Nicht Teil dieses
Briefs, nur als Fund vermerkt – bei Bedarf eigener Task
(`.env` vom `extraResources`-Filter ausschließen, Desktop-App bräuchte dann
einen anderen Weg an `DATABASE_URL`, z. B. eigene Desktop-`.env` ohne
Zugangsdaten = kontofreier CSV-Modus, oder ein separates Desktop-Passwort).

## Ergebnis

Installer erfolgreich mit dem vollständigen `FE-020`-Stand (inkl.
Nachbesserungen) neu gebaut, installiert und von Sven bestätigt: "in der
App selber ist jetzt auch alles wie es soll". Verifiziert per direktem
Blick in die gepackte `content.js` (`resources/backend/src/content.js`),
nicht nur per Sichtprüfung in der App – die SELECT-Query enthält jetzt
`lernfeld`. Ursache der anfänglichen Verwirrung: der PowerShell-`npm
run`-Fallstrick (siehe Nachbesserung oben) ließ den ersten `npm run
dist`-Versuch fehlschlagen, ohne dass das offensichtlich war.
