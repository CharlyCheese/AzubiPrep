# Brief OPS-007: Doku-Korrektur – veraltete Offline-/MVP-Aussagen

Status: done
Bereich: OPS
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Sven hatte bei einer OpenAI-Prüfung eines verwandten Projekts widersprüchliche
Aussagen zu Offline-Betrieb/Login/Hosting auf dessen Landingpage gefunden und
bat um eine analoge Prüfung hier. Ergebnis: Die AzubiPrep-Landingpage selbst
ist sauber, aber zwei interne Gründungsdokumente (`00-Produktvision.md`,
`11-PWA-Konzept.md`) waren seit dem MVP nicht mehr aktualisiert worden und
enthielten überholte bzw. nie umgesetzte Aussagen.

## Betroffene Dateien (exakte Pfade)

- `docs/00-Produktvision.md`
- `docs/11-PWA-Konzept.md`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/PROJEKTSTATUS.md`: zum Vergleich unproblematisch, da dort explizit
  mit Datum/Phasen gearbeitet wird (MVP-Stand vs. spätere Ergänzungen)
- `frontend/src/pages/PruefungLauf.jsx`: Gegenprobe für den fälschlich
  behaupteten Offline-Prüfungs-Ablauf

## Befunde (Audit, 2026-09-17)

1. **`11-PWA-Konzept.md` Abschnitt "Offline-Verhalten (MVP)"**: behauptete
   "vollständig offline nutzbar" – stimmt seit DB-001 (Login/Sync), BE-001
   (Push), BE-003 (Frage melden) und CONTENT-001 (Autoren-Pflege) nicht
   mehr, da diese zwingend den Server brauchen.
2. **Gleicher Abschnitt, konkreter Ablauf-Absatz**: behauptete, eine offline
   gestartete Prüfung würde lokal zwischengespeichert und bei
   Wiederverbindung automatisch nachgereicht. Per Code-Gegenprobe
   verifiziert, dass das **nie implementiert wurde** – `PruefungLauf.jsx`
   hat keinerlei Offline-Erkennung, ein fehlgeschlagenes `POST
   /pruefung/auswerten` zeigt nur `e.message` als generische Fehlermeldung,
   Antworten gehen danach verloren. Kein Formulierungsproblem, sondern eine
   Diskrepanz zwischen Doku und Code.
3. **"Ausbaustufen (nicht im MVP)"**: listete "Push-Benachrichtigungen" und
   "Geräteübergreifende Synchronisation" als zukünftig – beide sind längst
   umgesetzt (BE-001, DB-001), die Liste wurde bei deren Fertigstellung
   nicht gepflegt.
4. **`00-Produktvision.md` Abschnitt "Nicht-Ziele (MVP)"**: "Kein
   Multi-User-/Login-System, keine Cloud-Synchronisation" (durch DB-001
   überholt) und "Keine eigene Autoren-Oberfläche im Web" (durch CONTENT-001
   überholt).
5. Positivbefund: Die tatsächlichen Nutzer-Texte (`Landing.jsx`,
   `WillkommenModal.jsx`, Datenschutz-Hinweise in `Einstellungen.jsx`)
   enthalten keine der problematischen Aussagen – das Risiko war auf die
   beiden internen Dokumente begrenzt, nicht auf nutzerseitig sichtbaren
   Text.

## Entscheidung (im Chat geklärt, 2026-09-17)

- Nur die Dokumentation korrigieren (keine neue Offline-Prüfungs-Resilienz
  nachbauen) – die im Text beschriebene Funktion wird aus der Doku entfernt
  statt implementiert; kann bei Bedarf als eigener Task später aufgesetzt
  werden.

## Umsetzungsschritte (Checkliste)

- [x] `11-PWA-Konzept.md`: Offline-Abschnitt durch tatsächlichen,
      geprüften Stand ersetzt (inkl. Hinweis-Box zur Historie), falscher
      Prüfungs-Ablauf-Absatz entfernt
- [x] `11-PWA-Konzept.md`: "Ausbaustufen" bereinigt (nur noch offene Punkte)
- [x] `00-Produktvision.md`: Offline-/Login-/Autoren-Aussagen präzisiert,
      Verweis auf `11-PWA-Konzept.md` ergänzt
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Keine Aussage in den beiden Dokumenten behauptet mehr uneingeschränkte
      Offline-Nutzung
- [x] Keine Aussage beschreibt mehr die nie gebaute Offline-Prüfungs-
      Zwischenspeicherung
- [x] "Nicht-Ziele"/"Ausbaustufen" führen keine bereits umgesetzten Features
      mehr als offen/zukünftig

## Ergebnis (wird beim Abschluss ausgefüllt)

Reine Doku-Korrektur, keine Code-Änderung. Beide Dateien gegen den
tatsächlichen Implementierungsstand geprüft (Grep über Login/Push/Melden/
Autoren-Routen, Gegenprobe der Offline-Prüfungs-Behauptung im
Frontend-Code). `node scripts/check-agent-briefs.mjs` läuft grün.
