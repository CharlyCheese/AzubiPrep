# Brief OPS-008: "Offline" vs. "kein Konto/DB konfiguriert" – Begriffsklärung projektweit

Status: done
Bereich: OPS
Angelegt: 2026-09-17
Abgeschlossen: 2026-09-17

## Ziel (1–3 Sätze)

Follow-up zu OPS-007: Sven wies zurecht darauf hin, dass "offline" bei einer
Webapp etwas anderes ist als "Server lokal gehostet, ohne Internetzugang" –
und bat um eine projektweite Prüfung, ob diese Vermischung noch irgendwo
sichtbar ist. Fund: In zwei aktiv gelesenen/verlinkten Dokumenten wurde
"kein `DATABASE_URL` konfiguriert" (= kein Konto/Sync) fälschlich als
"Offline-Modus" bezeichnet, obwohl der Server in diesem Fall genauso über
das Netzwerk erreichbar sein muss wie mit Datenbank.

## Betroffene Dateien (exakte Pfade)

- `AGENTS.md` – wird bei jeder Agenten-Session gelesen, höchste Priorität
- `docs/19-Datenbank-Login.md` – von der Landingpage aus nutzerseitig
  verlinkt (Selbstbetreiber:innen-Anleitung)
- `docs/PROJEKTSTATUS.md` – wiederholte die in OPS-007 gefundene falsche
  Offline-Prüfungs-Behauptung
- `docs/13-Scrum-Roadmap.md` – unqualifizierte "offline"-Aussagen +
  veraltete "Nicht im MVP"-Liste (gleiches Muster wie OPS-007 bei
  `00-Produktvision.md`)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/OPS-007-doku-offline-aussagen-korrigiert.md`: erste
  Runde dieses Audits (00-Produktvision.md, 11-PWA-Konzept.md)

## Befunde (Audit, 2026-09-17)

1. **`AGENTS.md`**: "ohne `DATABASE_URL` läuft die App weiterhin komplett
   **offline** mit `localStorage`" – falsch. Ohne Datenbank fehlt nur
   Login/Sync; der Browser braucht in diesem Modus trotzdem durchgehend
   eine Netzwerkverbindung zum laufenden Server (Fragen laden, Quiz
   auswerten etc. laufen über HTTP). Echte Offline-Fähigkeit ist ein davon
   unabhängiges Feature (Service Worker).
2. **`docs/19-Datenbank-Login.md`**: "reiner Offline-/`localStorage`-Modus"
   und "funktionierenden Offline-Modus" – gleiche Vermischung, zusätzlich
   brisant, weil dieses Dokument von der Landingpage aus für
   Selbstbetreiber:innen verlinkt ist.
3. **`docs/PROJEKTSTATUS.md`** (Abschnitt 10, "Bekannte Einschränkungen"):
   wiederholte wortgleich die in OPS-007 widerlegte Behauptung zur
   Offline-Prüfungs-Zwischenspeicherung.
4. **`docs/13-Scrum-Roadmap.md`**: mehrfach unqualifiziertes "offline"
   (Vision-Satz, MVP-Umfang, User Story 6 pauschal "*(done)*"); zusätzlich
   eine "Nicht im MVP"-Liste mit mehreren inzwischen umgesetzten Punkten
   (Login/Multi-Device-Sync, Datenbank, Autoren-Weboberfläche) – gleiches
   Muster wie die in OPS-007 korrigierten "Nicht-Ziele" in
   `00-Produktvision.md`.

Geprüft und unproblematisch (keine Änderung): `README.md`,
`docs/04-UI-UX.md`, `docs/14-Betrieb-Wartung.md`, `docs/17-Sicherheit.md` –
dort bezieht sich "offline" korrekt auf die tatsächliche
Service-Worker-/PWA-Funktion bzw. Font-Fallback, keine Vermischung mit
"kein Konto/DB".

## Entscheidung (im Chat geklärt, 2026-09-17)

- Alle vier Fundstellen korrigieren (nicht nur die zwei kritischen).
- Geschlossene/archivierte Agent-Briefs (`DB-001`, `BE-001-ideen`), die
  denselben Sprachgebrauch enthalten, werden bewusst NICHT nachträglich
  umgeschrieben (historischer Snapshot, Projekt-Konvention).

## Umsetzungsschritte (Checkliste)

- [x] `AGENTS.md`: "offline mit localStorage" → "ohne Konto, mit
      localStorage" + expliziter Klarstellungssatz + Verweis auf
      `11-PWA-Konzept.md`
- [x] `docs/19-Datenbank-Login.md`: "Offline-/localStorage-Modus" →
      "kontofreier localStorage-Modus", Begriffsklärungs-Absatz ergänzt
- [x] `docs/PROJEKTSTATUS.md`: falsche Zeile durch Korrektur-Hinweis
      (mit Datum, Verweis auf OPS-007) ersetzt statt stillschweigend
      gelöscht – bleibt so als nachvollziehbare Korrektur im historischen
      Dokument erhalten
- [x] `docs/13-Scrum-Roadmap.md`: Vision-Satz, MVP-Umfang-Zeile und User
      Story 6 präzisiert; "Nicht im MVP"-Liste mit Erledigt-Markierungen
      versehen (durchgestrichen + Verweis auf Brief-ID), bewusst nicht
      als historischer Snapshot gelöscht
- [x] `node scripts/check-agent-briefs.mjs` bleibt grün

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Keine Aussage in den vier Dateien bezeichnet "kein Konto/keine DB
      konfiguriert" mehr als "offline"
- [x] `docs/19-Datenbank-Login.md` (nutzerseitig verlinkt) enthält eine
      klare Begriffsklärung
- [x] `docs/PROJEKTSTATUS.md` behauptet nicht mehr die nie gebaute
      Offline-Prüfungs-Zwischenspeicherung
- [x] `docs/13-Scrum-Roadmap.md` markiert bereits umgesetzte Backlog-Punkte
      nicht mehr als offen

## Ergebnis (wird beim Abschluss ausgefüllt)

Reine Doku-Korrektur, keine Code-Änderung. Vier Dateien projektweit per
Grep nach "offline" durchsucht und einzeln bewertet (kritisch vs.
unproblematisch), die zwei aktiv gelesenen/verlinkten Dokumente
(`AGENTS.md`, `19-Datenbank-Login.md`) sowie zwei historische Status-/
Roadmap-Dokumente korrigiert. Geschlossene Agent-Briefs bewusst
unverändert gelassen (Projekt-Konvention: kein rückwirkendes Umschreiben
archivierter Datensätze). `node scripts/check-agent-briefs.mjs` läuft
grün.
