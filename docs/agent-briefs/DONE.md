# Archiv erledigter Tasks

> Nur Einzeiler + Link. Diese Datei wird **nie komplett gelesen**, nur
> gezielt per ID/Suche angesteuert. Details stehen in der jeweiligen
> `<ID>-<slug>.md`. Neue Einträge werden **angehängt** (chronologisch),
> nie umsortiert oder gekürzt.
>
> Rückwirkende Erfassung: Arbeit vor Einführung dieses Systems
> (2026-09-14) ist in `docs/PROJEKTSTATUS.md` Abschnitt 2+9 dokumentiert,
> aber nicht zwingend hier einzeln nacherfasst. Ab `DB-001` gilt die
> Archivierungspflicht (siehe `ORCHESTRATOR.md`) für jeden neuen Task.

- [DB-001] PostgreSQL-Login & Geräte-Sync (Grundlage) — 2026-09-14 — [Brief](DB-001-postgres-login-sync.md)
- [OPS-005] Backend Code-Cleanup (ESLint, Rate-Limiter-Leak, Dedupe, Fehlerbehandlung) — 2026-09-15 — [Brief](OPS-005-backend-code-cleanup.md)
- [FE-003] Frontend Code-Audit (41 Dateien) + Fix natives alert() → eigenes Alert-Muster — 2026-09-15 — [Brief](FE-003-frontend-code-audit.md)
- [FE-001] Login-/Registrierungs-UI + manueller Geräte-Sync (Frontend-Anbindung an DB-001) — 2026-09-15 — [Brief](FE-001-login-sync-ui.md)
- [BE-002] Passwort-Komplexitätsanforderungen bei Registrierung — 2026-09-15 — [Brief](BE-002-passwort-komplexitaet.md)
- [FE-004] Fachrichtung als Prio statt Zugriffsbeschränkung, zentraler Lernbereich — 2026-09-15 — [Brief](FE-004-fachrichtung-als-prio.md)
- [FE-005] Begrüßungsnachricht als zentrales Popup — 2026-09-15 — [Brief](FE-005-begruessungs-popup.md)
- [FE-006] Karteikarten: gemischte, klickbare Antwortoptionen — 2026-09-15 — [Brief](FE-006-karteikarten-interaktiv.md)
- [FE-007] Karteikarten: wählbare Stapelgröße + Auto-Flip beim Antworten — 2026-09-15 — [Brief](FE-007-karteikarten-stapelgroesse.md)
- [FE-008] Design-System-Grundlage (Farben/Typografie/Radius) nach Stitch-Vorlage — 2026-09-15 — [Brief](FE-008-design-tokens-stitch.md)
- [FE-009] Dashboard- & Karteikarten-Layout nach Stitch-Vorlage (Phase 2) — 2026-09-15 — [Brief](FE-009-dashboard-karteikarten-layout.md)
- [FE-010] Redesign-Abschluss: Lernbereich/Kalender/Prüfungssimulation nach Stitch-Vorlage — 2026-09-15 — [Brief](FE-010-lernbereich-kalender-pruefung.md)
- [FE-011] UX-Feinschliff & Micro-Interactions (Stitch-Vorschlag): Tastatur-Shortcuts, Skeleton-Loading, XP-Indikator, CSS-Feinschliff, Ziffern statt Buchstaben bei Antwortoptionen, Bugfix Modul.jsx (Rules-of-Hooks-Absturz) — 2026-09-15 — [Brief](FE-011-ux-polish-stitch.md)
- [FE-002] UX-Feinschliff: Stitch-Layout-Muster (Haupt-/Seitenspalte) auf Statistik/Modul/Quiz übertragen, 3 Seiten waren bereits konform, plus Bugfix Karteikarten-Flashcard-Overflow bei schmalen Fenstern — 2026-09-15 — [Brief](FE-002-ux-feinschliff-stitch-abgleich.md)
- [CONTENT-002] Zusatz-Fragenkatalog bereinigt und importiert (500 → 1623 Fragen, 18 → 19 Module, neues Modul HARDWARE) — 2026-09-16 — [Brief](CONTENT-002-fragenkatalog-import.md)
- [OPS-001] Windows-Installer real installiert und getestet (App startet, läuft einwandfrei) — 2026-09-16 — [Brief](OPS-001-installer-test.md)
- [OPS-002] Strukturierter KI-Fachreview statt menschlichem Review etabliert und auf alle 1123 CONTENT-002-Fragen angewendet (5 unabhängige Subagenten, 16 Fundstellen behoben, davon 2 Musterlösungsfehler) — 2026-09-16 — [Brief](OPS-002-ki-fachreview-methodik.md)
- [DB-002] Content-Datenbank (Fragen/Module/Fachrichtungen) in PostgreSQL, CSV bleibt als automatisch erzeugter Fallback + git-versionierter Review-Snapshot (Migrations-/Export-Skripte, review_status-Spalte, Dual-Mode-Laden mit CSV-Fallback bei fehlender/leerer/nicht erreichbarer DB) — 2026-09-16 — [Brief](DB-002-content-datenbank-migration.md)
- [CONTENT-001] Autoren-Weboberfläche für Fragenpflege (`/autoren`): fachrichtungsgebundene Autor:innen-/Admin-Rolle, nur Bearbeiten bestehender Fragen (kein Anlegen/Löschen), Änderungshistorie `questions_verlauf` als Fallback, automatisches Zurücksetzen auf `review_status = 'ungeprueft'` bei jeder Änderung, Deaktivieren/Reaktivieren statt Hard-Delete, Doku-Referenzabschnitt für künftige Pflege durch andere KI/Menschen — 2026-09-16 — [Brief](CONTENT-001-autoren-weboberflaeche.md)
- [CONTENT-003] Fragenpflege-UX-Politur: Auto-Scroll zum Bearbeiten-Formular, Paginierung (20/Seite), clientseitige Suche über ID/Frage/Thema — direkt aus Svens erstem Praxistest von CONTENT-001 entstanden — 2026-09-16 — [Brief](CONTENT-003-fragenpflege-ux-polish.md)
- [BE-003] In-App-Feedback-Kanal ("Frage melden"): eingeloggte Nutzer können eine Frage im Quiz als falsch/unklar melden (optionaler Freitext-Grund), Meldung landet in neuer Tabelle `fragen_meldungen`, `review_status` springt auf `gemeldet`; zusätzlich generischer GRANT-Block in `schema.sql`, der die wiederkehrende pgAdmin-Berechtigungsfalle (DB-002, CONTENT-001) für alle aktuellen und künftigen Tabellen dauerhaft behebt — 2026-09-16 — [Brief](BE-003-frage-melden.md)
- [CONTENT-004] "Als geprüft markieren"-Button in der Fragenpflege, bewusst nur für Rolle `admin` (nicht `autor`) – spart das manuelle SQL-Zurücksetzen von `review_status` nach unbegründeten Meldungen (BE-003) oder abgeschlossenem Review — 2026-09-16 — [Brief](CONTENT-004-als-geprueft-markieren.md)
