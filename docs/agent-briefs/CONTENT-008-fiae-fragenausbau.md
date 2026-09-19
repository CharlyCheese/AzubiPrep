# Brief CONTENT-008: FIAE-Fragenausbau Richtung 1000 (Runde 1)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19 (nachts, während Sven schläft – unbeaufsichtigte
Sitzung, siehe „Hinweis zur Arbeitsweise“ unten)

## Ziel (1–3 Sätze)

Sven möchte den Fragenkatalog schrittweise auf ca. 1000
fachrichtungsspezifische Fragen je Fachrichtung ausbauen, beginnend mit
FIAE (seiner eigenen Fachrichtung). Dieser Brief ist Runde 1: echte
Curriculum-Recherche zu den FIAE-spezifischen Lernfeldern (LF10a-12a),
eine daraus abgeleitete Lücken-Analyse und ein erster, geprüfter Fragen-Batch.

## Hinweis zur Arbeitsweise (unbeaufsichtigte Sitzung)

Sven ist schlafen gegangen und hat gebeten, die Fragen „vorzubereiten,
prüfen, vorsortieren". Ich habe daher eigenständig entschieden, wie weit
ich gehe, ohne Rückfragen zu stellen (die ohnehin niemand hätte
beantworten können): **neue Inhalte nur dort ergänzt, wo eine echte,
unstrittige Lücke besteht** (LF10a hatte bei FIAE bisher buchstäblich null
Fragen), und **bei Entscheidungen, die Geschmackssache/Ermessen sind**
(Neuzuordnung bestehender Fragen), nur einen konkreten, umsetzungsfertigen
**Vorschlag** dokumentiert statt ihn direkt anzuwenden – genau das Muster,
das wir bei `CONTENT-007` schon für die FISI-NET/FISI-SEC-Aufteilung
genutzt haben. Alle neuen Fragen sind als „ungeprüft" zu behandeln, bis
Sven sie gegengelesen hat (siehe Abnahme-Kriterien).

## Betroffene Dateien (exakte Pfade)

- `content/questions/FIAE-UX.csv` (neu) – 30 neue Fragen für das neue
  Modul `FIAE-UX`.
- `content/modules.csv` – neue Zeile für `FIAE-UX` (fachrichtung=FIAE,
  lernfeld=LF10a).
- Keine Code-Änderungen (Schema unverändert, `lernfeld` existiert seit
  `CONTENT-007`/`FE-020`).

## Kontext: echte Curriculum-Recherche (KMK-Rahmenlehrplan)

Quelle: [KMK-Rahmenlehrplan Fachinformatiker](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf),
Feinziele/Inhalte der drei FIAE-spezifischen Lernfelder extrahiert:

- **LF10a – Benutzerschnittstellen gestalten und entwickeln**: bestehende
  Geschäftsprozesse analysieren/modellieren, Optimierungspotenzial
  erkennen, Benutzeroberflächen mit agilen Methoden für verschiedene
  Geräte/Betriebssysteme gestalten und entwickeln, Informationsfluss
  vollständig abbilden, Datenschutzkonformität und Usability prüfen,
  funktionale Korrektheit testen, Prozesskosten-Einsparung quantifizieren.
- **LF11a – Funktionalität in Anwendungen realisieren**: Datenstrukturen/
  Funktionalitäten aus Kundenprozessbeschreibungen ableiten, modulare
  Softwarekomponenten mit Diagrammen planen, passende
  Softwareentwicklungsmethode wählen, Komponenten realisieren und an
  Datenquellen anbinden, Schnittstellen dokumentieren, Testfälle
  formulieren und automatisiert testen, Funktionalität gegen
  Kundenkriterien bewerten.
- **LF12a – Kundenspezifische Anwendungsentwicklung durchführen**:
  Anforderungsanalyse mit Kunden, Projektplanung/-kalkulation,
  Lösungsvarianten inkl. Datenschutz/Sicherheit entwickeln, Angebot/
  Leistungsbeschreibung erstellen, Umsetzung mit Qualitätssicherung,
  Ergebnispräsentation und Kundenschulung, Bewertung von Zielerreichung
  und Skalierbarkeit, Reflexion inkl. Kundenfeedback.

**Wichtiger Fund**: Die ursprüngliche `CONTENT-007`-Grobzuordnung hatte
FIAE-PRG/FIAE-SWE/FIAE-TST pauschal alle auf `LF11a` gelegt (nur FIAE-DB
ging auf `LF5`). Bei genauerem Blick auf die echten Feinziele ist das nur
für FIAE-PRG und FIAE-TST wirklich treffend. FIAE-SWE ist inhaltlich
gemischt: klassische Vorgehensmodelle/Anforderungsanalyse/Projektplanung
gehören eher zu **LF12a**, UML/Architektur/Entwurf modularer Komponenten
eher zu **LF11a**. Und: **LF10a hatte bislang für FIAE gar kein Modul und
damit null Fragen** – exakt die Lücke, die Sven bei seiner Beobachtung zu
den „Lernfeld-Sprüngen" schon selbst richtig vermutet hat.

## Neu: Modul `FIAE-UX` (LF10a) – 30 Fragen, geprüft auf Format/Duplikate

Da LF10a komplett unbesetzt war, statt einzelne Fragen umzusortieren: neues
Modul `FIAE-UX` („Benutzeroberflächen & Usability") angelegt, 30 Fragen zu
den zentralen LF10a-Themen: UI/UX-Grundlagen, Nielsen-Usability-
Heuristiken, Barrierefreiheit/WCAG, Responsive Design, Wireframing/
Prototyping, Prozessmodellierung (BPMN-Grundlagen), Datenschutz im
UI-Design (DSGVO-Bezug), UI-/Usability-Testing. Inhaltlich auf etablierten,
stabilen Fachgrundlagen aufgebaut (ISO 9241-11, Nielsen Norman Group,
W3C WCAG, BPMN-Spezifikation, DSGVO Art. 25), keine tool-/versionsspezifischen
Behauptungen, die schnell veralten könnten.

**Qualitätssicherung, die ich selbst durchführen konnte** (ohne Svens
Fachreview zu ersetzen):
- `validate-content.mjs` gegen den kompletten Content-Ordner inkl. der
  neuen Datei ausgeführt (per Stub-`node_modules`-Trick wie schon bei
  `CONTENT-007`, da meine Sandbox keinen npm-Registry-Zugriff hat): **0
  Fehler**, 1657 Fragen, 22 Module, 4 Fachrichtungen.
- `content.js#loadContent()` real ausgeführt: 0 Warnungen, `FIAE-UX`-Modul
  und alle 30 Fragen korrekt geladen, `lernfeld=LF10a` korrekt gesetzt.
- Formatfehler dabei tatsächlich gefunden und behoben: eine Erklärung
  enthielt ein Semikolon im Fließtext, das die CSV-Spalten verschoben hat
  (`FIAE-UX-015`) – durch Komma ersetzt, danach sauber.
- Duplikat-Check: keine der 30 neuen Fragetexte kommt wortgleich in einer
  bestehenden Fragen-Datei vor.
- Verteilung: 28 SC / 2 MC, 9 leicht / 18 mittel / 3 schwer – ähnliches
  Profil wie die bestehenden FIAE-Module.

**Was ich NICHT prüfen kann**: fachliche Richtigkeit im Detail (bin kein
Ersatz für den in `AGENTS.md`/`ORCHESTRATOR.md` vorgeschriebenen
Fachreview) und ob der Schwierigkeitsgrad/die Formulierung zu Svens
bisherigem Fragenkatalog passt. Bitte vor Migration in die DB einmal
gegenlesen (siehe Abnahme-Kriterien).

**Update (2026-09-19): unabhängiger Subagent-Fachreview durchgeführt.** Auf
Svens Nachfrage ("werden/sind alle Fragen geprüft von dem passenden
Agent") gemäß `AGENTS.md`-Review-Pflicht ("frischer Subagent, eigener
Kontext") nachgeholt, da das zuvor nur meine eigene strukturelle Prüfung
war (Format/Duplikate), kein unabhängiger fachlicher Blick. Ergebnis:
29 von 30 Fragen fachlich einwandfrei. Ein echter Fehler gefunden und
behoben:

- **`FIAE-UX-010`**: Frage fragte nach dem WCAG-Prinzip für
  "Screenreader-Nutzbarkeit", markierte aber "Operable" als richtig,
  während die Erklärung von Tastaturbedienbarkeit sprach – Frage und
  Erklärung passten fachlich nicht zusammen. Fix: Frage umformuliert auf
  "ohne Maus – z. B. ausschließlich über die Tastatur – bedienbar", damit
  passt "Operable" (Antwort/Erklärung unverändert, da fachlich korrekt).

Zusätzlich zwei Schwierigkeitsgrade nachjustiert (unkritisch, vom
Subagenten als zu hoch eingeschätzt): `FIAE-UX-008` schwer→mittel
(Heuristik-Name verrät die Antwort bereits), `FIAE-UX-014` mittel→leicht
(fachfremde, leicht ausschließbare Distraktoren). Nach der Korrektur
erneut mit `validate-content.mjs` geprüft: weiterhin 0 Fehler, 1657 Fragen.
Ersetzt weiterhin NICHT Svens eigenen Fachreview (siehe
Abnahme-Kriterien), ist aber eine zusätzliche, unabhängige
Qualitätssicherungs-Ebene, die vorher fehlte.

## Vorschlag (noch NICHT angewendet): FIAE-SWE feiner nach LF11a/LF12a sortieren

Nur ein Vorschlag zur Bestätigung, keine Datei wurde dafür geändert. Die
49 FIAE-SWE-Fragen würden sich anhand der echten Feinziele so aufteilen
lassen (Frage-eigenes `lernfeld`-Feld, wie schon bei `NETZ-GRUND`/
`FISI-NET` genutzt – Modul bleibt `FIAE-SWE`, nur einzelne Fragen bekommen
ein abweichendes `lernfeld`):

| Thema | Anzahl | Vorschlag |
|---|---|---|
| Vorgehensmodelle, Anforderungsanalyse, Anforderungen, Agile Planung, Agile Methoden | 15 | → `LF12a` (Projektplanung/Kundenanforderungen) |
| UML, Entwurf, Architektur, Design, Versionsverwaltung | 20 | → `LF11a` (bleibt, modulare Komponenten/Diagramme) |
| „Methoden" (Sammelthema, inhaltlich uneinheitlich – Compiler/Interpreter, Scrum/Kanban/CI/DevOps, Pair Programming, Unit-Testing) | 14 | **uneindeutig** – teils LF11a (Compiler/Interpreter, Unit-Testing), teils LF12a (Scrum/Kanban/Sprint/Backlog), teils Überschneidung mit dem bestehenden gemeinsamen `PM`-Modul (Scrum/Kanban dort schon vorhanden) |

Bewusst nicht selbst entschieden, weil die dritte Zeile eine echte
inhaltliche Abwägung ist (u. a. mögliche Redundanz mit `PM`), die Sven
besser beurteilen kann als eine automatisierte Einzelfall-Zuordnung ohne
Rückfragemöglichkeit.

**Update (2026-09-19): von Sven freigegeben ("sortiere die nach deinem
vorschlag") und umgesetzt.** `content/questions/FIAE-SWE.csv` hat jetzt eine
15. Spalte `lernfeld` (Frage-eigenes Feld, Modul bleibt `FIAE-SWE`/`LF11a`
als Default – gleiches Muster wie `NETZ-GRUND`). Reale Zeilenzahlen wichen
leicht von der ersten Schätzung ab (Themen tatsächlich ausgezählt statt
geschätzt): 14 Fragen (Vorgehensmodelle, Anforderungsanalyse, Anforderungen,
Agile Planung, Agile Methoden) → `LF12a`; 17 Fragen (UML, Entwurf,
Architektur, Design, Versionsverwaltung) → explizit `LF11a`; die 18
"Methoden"-Fragen (ursprünglich auf 14 geschätzt) wurden einzeln nach Inhalt
entschieden, da eine pauschale Zuordnung hier nicht sauber möglich war:

- → `LF11a` (technische Realisierungs-/Testpraxis): Compiler/Interpreter,
  Bug-Begriff, Pair Programming (2×), Unit-Testing, Use-Case-Diagramm, CI,
  DevOps (8 Fragen).
- → `LF12a` (Vorgehens-/Projektebene, Scrum-Artefakte): Scrum-Definition,
  Wasserfallmodell, agile Softwareentwicklung, Sprint, Kanban, Product
  Backlog, Burndown-Chart, User-Story-Format, Sprint Review, Daily Stand-up
  (10 Fragen).

Ergebnis: 24 Fragen `LF12a`, 25 Fragen `LF11a` (von 49 gesamt). Mit
`validate-content.mjs` gegen den vollständigen `content/`-Ordner erneut
geprüft: weiterhin 0 Fehler, 1657 Fragen, 22 Module, 4 Fachrichtungen
(reine Metadaten-Ergänzung, keine neuen/gelöschten Fragen, daher
unveränderte Gesamtzahlen). Datei an Sven ausgeliefert und byte-verifiziert.

## Runde 2 (2026-09-19): FIAE-UX vertiefen – 22 weitere Fragen

Wie in der Roadmap vorgeschlagen (Punkt 2, siehe unten): 30 Fragen für ein
ganzes Lernfeld sind dünn, daher `FIAE-UX` um 22 weitere Fragen (IDs
`FIAE-UX-031` bis `FIAE-UX-052`) ergänzt. Themen: UI-Pattern Formulare (3),
UI-Pattern Navigation (2), UI-Pattern Fehlermeldungen (2), Interaktionsdesign
inkl. Fitts's Law/Hick's Law (4), Prototyping-Werkzeuge (2),
Informationsarchitektur/Card Sorting (3), Design Systems (2),
Microinteractions (2), Typografie & Farbe (2). Format: 20 SC / 2 MC.
`FIAE-UX` hat damit jetzt **52 Fragen**.

**QA wie bei Runde 1, plus jetzt standardmäßig unabhängiger
Subagent-Fachreview (siehe `AGENTS.md`-Update unten):**
- `validate-content.mjs`: weiterhin 0 Fehler (1679 Fragen gesamt).
- Unabhängiger Subagent-Review (frischer Kontext) der 22 neuen Fragen:
  21 von 22 einwandfrei. Ein Fund: `FIAE-UX-038` (Hick's Law) war mit
  "schwer" zu hoch eingestuft (reine Definitionsfrage, Distraktoren trivial
  ausschließbar) – auf "mittel" korrigiert. Kein fachlicher Fehler in
  Antwort/Erklärung gefunden. Zusätzlich vom Subagenten notiert (kein
  Fehler, nur Hinweis für künftige Batches): `FIAE-UX-052` wiederholt
  inhaltlich die Definitionen aus `FIAE-UX-037`/`038` als
  Multiple-Choice-Zusammenfassung – bewusst so belassen (legitime
  Transferfrage), aber bei künftigen Erweiterungen stärker variieren
  (z. B. Anwendungsbeispiele statt Reformulierung).
- Nach der Korrektur erneut `validate-content.mjs`: weiterhin 0 Fehler.

## Prozess-Update (2026-09-19): Subagent-Review jetzt bindend

Sven hat auf Nachfrage entschieden, dass der unabhängige Subagent-Review
(bisher nur "empfohlen bei größeren Änderungen") ab sofort für alle
inhaltlichen/fachlichen Änderungen verbindlich ist, auch wenn das die
Bearbeitung verlangsamt ("die agenten struktur muss eingehalten werden, mir
ist das lieber wenn alles ein wenig länger dauert aber dafür sauber ist").
`AGENTS.md` Regel 3 wurde entsprechend angepasst. Gilt ab sofort für alle
weiteren Runden dieses Fragenausbaus.

## Weg zu 1000 FIAE-Fragen – Stand & nächste Schritte

Vorher (vor `CONTENT-008`): 281 FIAE-spezifische Fragen (FIAE-PRG 74,
FIAE-DB 118, FIAE-SWE 49, FIAE-TST 40). Nach Runde 1 (+30, `FIAE-UX` neu):
311. Nach Runde 2 (+22, `FIAE-UX` vertieft): **333**. Es fehlen noch grob
667, um die ~1000er-Zielgröße zu erreichen.

Vorschlag für die nächsten Runden (jeweils eigener Brief, wie gehabt):
1. ~~FIAE-SWE-Nachsortierung entscheiden~~ — erledigt (siehe Update oben).
2. ~~`FIAE-UX` vertiefen~~ — erledigt (siehe Runde 2 oben). Bei Bedarf
   später noch weiter ausbaubar (LF10a ist mit 52 Fragen für ein ganzes
   Lernfeld im Vergleich zu FIAE-DB mit 118 immer noch unterrepräsentiert).
3. FIAE-PRG/FIAE-TST (LF11a) vertiefen – aktuell 74 bzw. 40 Fragen,
   deutlich ausbaufähig (Datenstrukturen, Algorithmen, Testarten,
   Testautomatisierung).
4. LF12a eigenständig stärken (Projektkalkulation, Angebotserstellung,
   Kundenschulung/-präsentation, Skalierbarkeitsbewertung) – aktuell fast
   nichts davon abgedeckt, auch nicht nach der FIAE-SWE-Nachsortierung.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 30 `FIAE-UX`-Fragen fachlich gegen (Inhalt,
      Formulierung, Schwierigkeitsgrad, evtl. Duplikate mit seinem eigenen
      Wissen, das über CSV-Textvergleich hinausgeht).
- [x] Sven entscheidet über den FIAE-SWE-Nachsortierungs-Vorschlag (ganz,
      teilweise oder gar nicht übernehmen). — Entschieden 2026-09-19: ganz
      übernehmen, umgesetzt (siehe Update oben).
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung (ich habe die Logik selbst schon geprüft, siehe oben,
      aber die verbindliche Bestätigung auf seiner Maschine steht noch
      aus).
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen
      (nicht der Default `geprueft`!), damit sie in der Autoren-UI korrekt
      als „noch zu prüfen" markiert sind, bis der Fachreview erfolgt ist.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
