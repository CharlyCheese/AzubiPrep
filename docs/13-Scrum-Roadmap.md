# Scrum, MVP & Roadmap

## Product Vision (ein Satz)
AzubiPrep macht die IHK-Vorbereitung für alle vier Fachinformatiker-Profile
effektiv – mit prüfungsnahen Inhalten, klugen Wiederholungen und
Prüfungssimulation, überall und mit eingeschränkter Offline-Nutzung (siehe
`11-PWA-Konzept.md`).

## MVP-Umfang (was im MVP enthalten ist)
- Fachrichtungen FIAE, FISI, DPA, DVK + gemeinsame Module (WiSo, PM)
- Theorie & Fragen (18 Module, 182 Fragen im Seed)
- Quizmodus mit Sofort-Feedback
- Karteikarten mit Spaced Repetition (Leitner-Boxen)
- Prüfungssimulation mit Zeitlimit, Zufall & Auswertung
- Lernfortschritt, Statistik, Notizen, Kalender, Suche – lokal
- PWA (installierbar, Grundfunktionen offline nutzbar), Dark Mode, responsive
- Excel/CSV-Inhaltsworkflow + Reload-Endpunkt
- Inhalts-Validierungsskript

## Nicht im MVP (Backlog)

> Stand ursprüngliches MVP. Mehrere Punkte sind inzwischen umgesetzt (siehe
> `docs/agent-briefs/DONE.md`) und unten markiert – diese Liste wird bewusst
> nicht rückwirkend umgeschrieben (historischer Snapshot), Details zum
> jeweils aktuellen Stand stehen im Brief-Archiv.

- ~~Login & Rollen, Multi-Device-Sync (braucht Backend-Persistenz)~~ →
  umgesetzt in `DB-001`
- Push-Benachrichtigungen, E-Mail-Reminder → Push umgesetzt in `BE-001`/`BE-004`,
  E-Mail-Reminder weiterhin offen
- ~~Datenbank (SQLite/PostgreSQL) und Nutzerverwaltung~~ → umgesetzt in
  `DB-001` (Login) und `DB-002` (Content, PostgreSQL statt SQLite)
- ~~Autoren-Weboberfläche (Inhalts-CRUD im Browser)~~ → umgesetzt in
  `CONTENT-001` (bewusst nur Bearbeiten bestehender Fragen, kein CRUD)
- KI-gestützte Freitext-Bewertung → weiterhin offen
- Offizielle IHK-Originalfragen (Lizenzthema) → weiterhin offen

## User Stories (Auswahl, Priorität)
1. Als Auszubildende möchte ich meine Fachrichtung wählen, damit ich passende
   Module sehe. *(done)*
2. Als Lernende möchte ich nach der Theorie ein Modul-Quiz machen und sofort
   sehen, ob meine Antwort richtig ist. *(done)*
3. Als Lernende möchte ich schwierige Fragen als Karteikarten wiederholen,
   damit ich sie langfristig behalte. *(done)*
4. Als Prüfling möchte ich eine Prüfung unter Zeitdruck simulieren und eine
   Stärken-/Schwächenanalyse erhalten. *(done)*
5. Als Ausbilder möchte ich neue Fragen ohne Codeänderung ergänzen. *(done)*
6. Als Nutzer möchte ich AzubiPrep installieren und die Grundfunktionen
   (bereits geladene Inhalte, Karteikarten, Notizen) auch offline nutzen.
   *(done – eingeschränkt: Login, Sync, Melden, Prüfungsauswertung und
   Fragenpflege brauchen weiterhin eine Verbindung, siehe
   `11-PWA-Konzept.md`)*
7. Als Nutzer möchte ich meinen Fortschritt über Geräte synchronisieren.
   *(offen – braucht Backend-Persistenz)*

## Meilensteine / Roadmap
| Meilenstein | Inhalt | Status |
|---|---|---|
| **M1 MVP-Prototyp** | siehe MVP-Umfang oben | ✅ abgeschlossen |
| **M2 Beta** | Feedback-Runde, Feinschliff UX, erweiterter Fragenbestand, Inhalts-Review | geplant |
| **M3 Release 1.0** | Auth + Rollen, Backend-Persistenz (SQLite → PostgreSQL), Sync, Push | geplant |
| **M4 Langfristig** | Autorenportal, KI-Feedback, Lernanalytik, Multi-Mandant (Schulen) | Ausblick |

## Definition of Done (je Story)
- [ ] Funktional im Browser getestet (Lern-/Prüfungspfad)
- [ ] Backend-Validierung ohne Fehler
- [ ] Dokumentation aktualisiert
- [ ] Review durch frischen Agenten (siehe `ORCHESTRATOR.md`)
