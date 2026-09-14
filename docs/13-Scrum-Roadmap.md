# Scrum, MVP & Roadmap

## Product Vision (ein Satz)
AzubiPrep macht die IHK-Vorbereitung für alle vier Fachinformatiker-Profile
effektiv – mit prüfungsnahen Inhalten, klugen Wiederholungen und
Prüfungssimulation, überall und offline.

## MVP-Umfang (was im MVP enthalten ist)
- Fachrichtungen FIAE, FISI, DPA, DVK + gemeinsame Module (WiSo, PM)
- Theorie & Fragen (18 Module, 182 Fragen im Seed)
- Quizmodus mit Sofort-Feedback
- Karteikarten mit Spaced Repetition (Leitner-Boxen)
- Prüfungssimulation mit Zeitlimit, Zufall & Auswertung
- Lernfortschritt, Statistik, Notizen, Kalender, Suche – lokal
- PWA (installierbar, offline), Dark Mode, responsive
- Excel/CSV-Inhaltsworkflow + Reload-Endpunkt
- Inhalts-Validierungsskript

## Nicht im MVP (Backlog)
- Login & Rollen, Multi-Device-Sync (braucht Backend-Persistenz)
- Push-Benachrichtigungen, E-Mail-Reminder
- Datenbank (SQLite/PostgreSQL) und Nutzerverwaltung
- Autoren-Weboberfläche (Inhalts-CRUD im Browser)
- KI-gestützte Freitext-Bewertung
- Offizielle IHK-Originalfragen (Lizenzthema)

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
6. Als Nutzer möchte ich AzubiPrep offline nutzen und installieren. *(done)*
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
