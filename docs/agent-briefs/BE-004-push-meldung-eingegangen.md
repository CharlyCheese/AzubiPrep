# Brief BE-004: Push "Neue Meldung eingegangen" (Autor:innen/Admins)

Status: done
Bereich: BE
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Zweiter Push-Trigger auf Basis der BE-001-Grundinfrastruktur: sobald eine
Frage gemeldet wird (BE-003), bekommen die zuständigen Autor:innen
(fachrichtungsgebunden) und alle Admins sofort eine Push-Benachrichtigung,
statt es erst beim nächsten Blick in die Fragenpflege zu bemerken.

## Betroffene Dateien (exakte Pfade)

- `backend/src/routes/melden.routes.js`

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/BE-001-push-benachrichtigungen.md`: liefert
  `sendePushAnNutzer` und die Grundinfrastruktur
- `docs/agent-briefs/BE-003-frage-melden.md`: liefert den Meldungs-Endpunkt
- `backend/src/routes/content-admin.routes.js`: `darfBearbeiten()` – gleiche
  Fachrichtungs-Scoping-Logik wie hier für die Empfänger-Auswahl übernommen

## Entscheidung (im Chat geklärt, 2026-09-17)

- Empfänger: alle `admin`-Nutzer sowie `autor`-Nutzer, deren `fachrichtung`
  zur gemeldeten Frage passt (gleiche Regel wie beim Bearbeiten-Zugriff:
  eigene Fachrichtung oder Frage ist `ALLE`-Fachrichtung).

## Umsetzungsschritte (Checkliste)

- [x] `POST /fragen/:id/melden` lädt zusätzlich `fachrichtung` der Frage
- [x] Nach dem Speichern: `benachrichtigeZustaendige()` ermittelt
      passende Autor:innen/Admins und verschickt Push (nach der Antwort an
      den Client, Fehler landen nur im Log)
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Meldung zu einer FIAE-Frage → Push an Admins + FIAE-Autor:innen,
      nicht an FISI-Autor:innen
- [x] Meldung zu einer `ALLE`-Frage → Push an Admins + alle Autor:innen
- [x] Melden selbst funktioniert weiterhin unverändert, auch wenn Push
      fehlschlägt oder nicht konfiguriert ist

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. Die Empfänger-Auswahl-Query wurde in der Sandbox
gegen einen lokalen PostgreSQL-16-Cluster getestet (danach wieder
entfernt): vier Test-Nutzer (admin, autor/FIAE, autor/FISI, lernende)
angelegt, beide Fälle (Frage-Fachrichtung `FIAE` und `ALLE`) geprüft –
genau die erwarteten Empfänger kamen zurück. `node
scripts/check-agent-briefs.mjs` läuft grün. Der eigentliche Push-Versand
(`web-push`) ist wie bei BE-001 nicht in der Sandbox testbar – Sven
bestätigt nach Dateiübernahme live auf seiner Maschine.
