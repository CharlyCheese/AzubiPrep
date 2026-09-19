# Brief CONTENT-011: DPA-Fragenausbau Richtung 1000 (Runde 1)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung von `CONTENT-008` (FIAE) und `CONTENT-009` (FISI), jetzt für DPA:
gleiche Vorgehensweise (echte Curriculum-Recherche, Lücken-Analyse,
geprüfter Fragen-Batch, verbindlicher Subagent-Fachreview gemäß `AGENTS.md`
Regel 3), Ziel weiterhin ~1000 fachrichtungsspezifische Fragen je
Fachrichtung.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DPA-PROJ.csv` (neu) – 27 neue Fragen für das neue
  Modul `DPA-PROJ`.
- `content/modules.csv` – neue Zeile für `DPA-PROJ` (fachrichtung=DPA,
  lernfeld=LF12c).

## Kontext: echte Curriculum-Recherche (KMK-Rahmenlehrplan)

Quelle: KMK-Rahmenlehrplan Fachinformatiker, Feinziele der drei
DPA-spezifischen Lernfelder:

- **LF10c – Werkzeuge des maschinellen Lernens einsetzen**: ML-Use-Case
  bewerten, heterogene Datenquellen integrieren, Werkzeug-/Systemauswahl,
  technische Einrichtung, Lernfortschritt überwachen, Wirksamkeit
  reflektieren.
- **LF11c – Prozesse analysieren und gestalten**: Informationsfluss aus
  Kundenprozessbeschreibungen ableiten, Prozessdaten analysieren,
  Digitalisierungslösungen planen, Variante unter betriebswirtschaftlichen
  Kriterien auswählen, umsetzen/dokumentieren, Kundentransformation
  begleiten, ökonomische/ökologische Aspekte reflektieren.
- **LF12c – Kundenspezifische Prozess- und Datenanalyse durchführen**:
  Anforderungsanalyse mit Kunden, Projektplanung/-kalkulation,
  Lösungsvarianten inkl. Datenschutz entwickeln und vergleichen,
  Angebot/Dokumentation, Umsetzung mit Qualitätssicherung, Präsentation und
  Schulung, Übergabe, Bewertung (Zielerreichung, Wirtschaftlichkeit,
  Skalierbarkeit, Verlässlichkeit), Reflexion mit Kundenrückmeldungen.

**Fund**: Analog zu FIAE (LF10a fehlte) und FISI (LF12b fehlte) ist bei DPA
`LF10c` bereits über `DPA-DS` abgedeckt, `LF11c` über `DPA-ANA`/`DPA-PRO` –
**`LF12c` hatte jedoch noch gar kein Modul und damit null Fragen.**

## Neu: Modul `DPA-PROJ` (LF12c) – 27 Fragen, geprüft

Neues Modul `DPA-PROJ` ("Kundenspezifische Prozess- und Datenanalyse")
angelegt, 27 Fragen zu: Anforderungsanalyse (4, davon 1 MC),
Projektplanung & Kalkulation (3), Lösungsvarianten & Datenschutz (4),
Angebot & Leistungsbeschreibung (3), Qualitätssicherung (4), Präsentation
& Schulung (3), Übergabe & Dokumentation (3, davon 1 MC), Wirtschaftlichkeit
& Skalierbarkeit (3). Format: 25 SC / 2 MC. Inhaltlich parallel zu
`FISI-PROJ` strukturiert (gleiches LF12-Muster für kundenspezifische
Projekte), aber mit DPA-typischer Fachfärbung (Datenpipelines, Overfitting/
Validierung gegen Testdaten, Data Lineage, DSGVO-Datenminimierung bei
personenbezogenen Daten, TCO für Datenanalyse-Lösungen).

**Antwortpositionen von Anfang an rotiert** (Lehre aus `CONTENT-009`,
siehe dortigen `AGENTS.md`-Hinweis): ein Python-`build()`-Helfer hat die
korrekte Antwortposition deterministisch per `i % 4` durchrotiert statt
nach einem Gewohnheitsmuster zu schreiben und hinterher zu fixen. Das ist
ohnehin nicht sicherheitsrelevant, weil die App die Optionen bei jeder
Anzeige neu mischt (siehe `AGENTS.md` Regel 3 / `CONTENT-010`), aber sauberer.

**QA-Ablauf (wie bei `CONTENT-008`/`CONTENT-009`, inkl. verbindlichem
Subagent-Review):**
- Eigener Spalten-/Semikolon-Scan vor Auslieferung: 27 Zeilen, je 14
  Spalten, keine Auffälligkeiten.
- `validate-content.mjs` gegen den kompletten `content/`-Ordner: 0 Fehler,
  1760 Fragen, 24 Module, 4 Fachrichtungen.
- **Unabhängiger Subagent-Fachreview** (frischer Kontext, mit explizitem
  Hinweis auf das Mischen der Anzeigeoptionen, damit die CSV-
  Antwortverteilung nicht fälschlich als Fehler gemeldet wird): kein
  einziger fachlicher Fehler in Antwort oder Erklärung gefunden, beide
  MC-Fragen (`-004`, `-024`) korrekt geprüft. Hauptfund: wiederkehrende,
  leicht erkennbare Lücken-Distraktoren ("… ist gesetzlich
  vorgeschrieben/erlaubt/dokumentiert …" in 5 Fragen, "… keine Rechnung
  gestellt werden darf" in 3 Fragen, "automatisch …" in 3 weiteren Fragen)
  – Prüflinge könnten diese Muster ohne Fachwissen als "immer falsch"
  erkennen. **Behoben**: alle 11 betroffenen Distraktoren in
  `DPA-PROJ-002`, `-007`, `-016`, `-019`, `-021`, `-027` durch inhaltlich
  plausiblere, themennähere Falschaussagen ersetzt. Antwort/Erklärung
  unverändert, da fachlich korrekt. Zusätzlich die vom Subagenten als
  Anregung genannte Schwierigkeitsstufe von `DPA-PROJ-010` (Datenminimierung
  als DSGVO-Grundprinzip) von "schwer" auf "mittel" herabgestuft.
- Nach den Korrekturen erneut `validate-content.mjs`: weiterhin 0 Fehler,
  unveränderte Gesamtzahlen (reine Textänderung an Distraktoren plus eine
  Schwierigkeits-Anpassung, keine neuen/gelöschten Fragen).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DPA-Fragen – Stand & nächste Schritte

Vorher: 198 DPA-spezifische Fragen (DPA-DB 118, DPA-DS 27, DPA-ANA 26,
DPA-PRO 27). Nach Runde 1 (+27, `DPA-PROJ` neu): **225**. Es fehlen noch
grob 775, um die ~1000er-Zielgröße zu erreichen.

Vorschlag für die nächsten Runden (jeweils eigener Brief):
1. `DPA-DS`/`DPA-ANA`/`DPA-PRO` vertiefen (analog zu `FISI-SYS` in
   `CONTENT-009` Runde 2), `DPA-DB` ist mit 118 bereits vergleichsweise
   umfangreich.
2. Danach: DVK (Digitale Vernetzung) nach demselben Muster – erst
   Curriculum-Recherche zu den DVK-spezifischen Lernfeldern (LF10d-12d),
   dann Lücken-Analyse (bereits vorab identifiziert: `LF12d` fehlt
   komplett, `LF11d` ist ebenfalls noch nicht abgedeckt), dann
   Fragen-Batches.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 27 `DPA-PROJ`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
