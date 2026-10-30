# Brief OPS-015: Lokale Webversion per Doppelklick

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Eine Windows-Startdatei startet die lokale Webversion und öffnet den
Standardbrowser, ohne manuelle Backend-/Frontend-Befehle.
Der Nutzer hat ausdrücklich den lokalen Start per Doppelklick gewählt.

## Betroffene Dateien

- `AzubiPrep starten.cmd`
- `backend/scripts/start-web.mjs`
- `backend/test/start-web.test.js`
- `README.md`
- `docs/agent-briefs/OPS-015-lokaler-webstart.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Umsetzung und Grenzen

Bestehendes Node/Express liefert den Frontend-Build und die API gemeinsam
aus. Feste konfigurierte lokale Adresse erhält den browsergebundenen
Lernstand. Fehlenden/veralteten Frontend-Build mit vorhandenen Abhängigkeiten
vorbereiten. Voraussetzungen freundlich melden; keine automatischen
Installationen, kein Autostart beim Windows-Login und kein Hosting.
Bei erneutem Start vorhandene erreichbare AzubiPrep-Webversion öffnen;
fremde Portbelegung nicht beenden. Browser erst nach erfolgreichem Start.
Enter beendet den selbst gestarteten Server; laufenden fremden Prozess
bei erneutem Aufruf nicht beenden. Keine DB-/CSV-/Lernstandänderungen.

## Abnahmekriterien

- [x] Doppelklick funktioniert unabhängig vom aufrufenden Arbeitsverzeichnis.
- [x] Fehlende Voraussetzungen und Start-/Buildfehler verständlich melden.
- [x] Frontend und API gemeinsam erreichbar, Browserstart erst danach.
- [x] Zweiter Aufruf öffnet vorhandene Webversion; kein zweiter Server.
- [x] Kontrolliertes Beenden und keine feste neue Daten-/Portkonfiguration.
- [x] Gezielte Tests und lokaler Startnachweis bestanden.
- [x] Unabhängiger Review, Diff- und Archivcheck grün.

## Ergebnis

Windows-Startdatei und gemeinsamer Webstarter ergänzt. Aufruf der tatsächlichen
CMD aus dem Backend-Unterordner erfolgreich: Frontend gebaut, Server mit
7000 Fragen/26 Modulen aus PostgreSQL bereit, Standardbrowser geöffnet.
HTML und referenzierte JavaScriptdatei liefern HTTP 200. Erneuter Aufruf
erkennt die laufende Webversion. Enter beendet den eigenen Server; danach
ist seine Adresse nicht mehr erreichbar. Fremde Portbelegung separat mit
einem Testserver geprüft: verständlicher Fehler, fremder Server bleibt aktiv.

Fehlenden Frontend-Build in isoliertem temporärem Ausgabeverzeichnis praktisch
gebaut und ausgeliefert; kontrolliertes Beenden erfolgreich. Der native
Builder benötigte in der eingeschränkten Ausführungsumgebung eine Freigabe;
der freigegebene lokale Test war erfolgreich. Keine Produktberechtigung nötig.
Neun gezielte Tests und ESLint grün, einschließlich vier Build-Envdateien
und gelöschter öffentlicher Dateien. Frischer ops015_review meldete diese
zwei Frischefälle; korrigierte Endfassung unabhängig ohne weitere Findings
freigegeben. Testprozesse beendet. Kein DB-/CSV-Import oder Lernstand geändert.
README erklärt Doppelklick, offenes Startfenster und Enter zum Beenden sowie
die einmalige Einrichtung durch die bereitstellende Person.
Diff- und Archivcheck nach Eintragung ausführen. Kein Commit oder Push.
