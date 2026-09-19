# Brief CONTENT-009: FISI-Fragenausbau Richtung 1000 (Runde 1+2)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung von `CONTENT-008` (FIAE), jetzt für FISI: gleiche Vorgehensweise
(echte Curriculum-Recherche, Lücken-Analyse, geprüfter Fragen-Batch,
verbindlicher Subagent-Fachreview gemäß `AGENTS.md` Regel 3), Ziel weiterhin
~1000 fachrichtungsspezifische Fragen je Fachrichtung.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-PROJ.csv` (neu) – 30 neue Fragen für das neue
  Modul `FISI-PROJ`.
- `content/modules.csv` – neue Zeile für `FISI-PROJ` (fachrichtung=FISI,
  lernfeld=LF12b).

## Kontext: echte Curriculum-Recherche (KMK-Rahmenlehrplan)

Quelle: KMK-Rahmenlehrplan Fachinformatiker, Feinziele der drei
FISI-spezifischen Lernfelder:

- **LF10b – Serverdienste bereitstellen und Administrationsaufgaben
  automatisieren**: Serverdienste/Plattformen analysieren und nach
  Kundenanforderungen auswählen, Verfügbarkeit/Skalierbarkeit/
  Administrierbarkeit/Wirtschaftlichkeit/Sicherheit berücksichtigen,
  Konfigurationskonzepte erstellen, implementieren, testen, überwachen,
  Administrationsprozesse automatisieren, dokumentieren.
- **LF11b – Betrieb und Sicherheit vernetzter Systeme gewährleisten**:
  Risikoanalyse, Schutzbedarf ermitteln, Schutzziele im Kundengespräch
  identifizieren, Systeme auf Informationssicherheit analysieren,
  Vorkehrungen unter IT-Sicherheitsleitlinien/rechtlichen Regelungen
  planen, Maßnahmen implementieren, Sicherheitsniveau bewerten,
  dokumentieren.
- **LF12b – Kundenspezifische Systemintegration durchführen**:
  Anforderungsanalyse mit Kunden, Projektplanung/-kalkulation,
  Lösungsvarianten inkl. Datenschutz/Datensicherheit entwickeln und
  vergleichen, Angebot/Leistungsbeschreibung erstellen, Umsetzung mit
  Qualitätssicherung, Präsentation und Schulung, Übergabe von Produkt und
  Dokumentation, Bewertung von Zielerreichung/Wirtschaftlichkeit/
  Skalierbarkeit/Verlässlichkeit, Reflexion mit Kundenrückmeldungen.

**Fund**: Anders als bei FIAE (wo LF10a komplett fehlte) sind LF10b und
LF11b bei FISI bereits über bestehende Module abgedeckt – `FISI-BET`/
`FISI-SYS` (beide `LF10b`) bzw. `FISI-NET`/`FISI-SEC` (beide `LF11b`), das
passt inhaltlich gut zur Rahmenlehrplan-Beschreibung. **`LF12b` hatte
jedoch, genau wie zuvor `LF10a` bei FIAE, noch gar kein Modul und damit
null Fragen.**

## Neu: Modul `FISI-PROJ` (LF12b) – 30 Fragen, geprüft

Neues Modul `FISI-PROJ` ("Kundenspezifische Systemintegration") angelegt,
30 Fragen zu: Anforderungsanalyse (5, davon 1 MC), Projektplanung &
Kalkulation (4), Lösungsvarianten & Datenschutz (4), Angebot &
Leistungsbeschreibung (3), Qualitätssicherung (4), Präsentation & Schulung
(3), Übergabe & Dokumentation (4, davon 1 MC), Wirtschaftlichkeit &
Skalierbarkeit (3). Format: 28 SC / 2 MC. Schwerpunkt bewusst auf
projekt-/kundenbezogenen Kompetenzen (Lastenheft/Pflichtenheft,
Kalkulation, Scope Creep, Abnahmetest, Change Management, TCO,
horizontale/vertikale Skalierung) statt auf bereits durch `FISI-NET`/
`FISI-SEC`/`FISI-BET`/`FISI-SYS` abgedeckten Technikthemen.

**QA-Ablauf (wie bei `CONTENT-008`, inkl. jetzt verbindlichem
Subagent-Review):**
- `validate-content.mjs` gegen den kompletten `content/`-Ordner: 0 Fehler,
  1709 Fragen, 23 Module, 4 Fachrichtungen.
- Eigener Semikolon-Scan vor dem Schreiben (Lehre aus `CONTENT-008`): einen
  Fall gefunden und direkt behoben (`FISI-PROJ-029`, Erklärung enthielt ein
  Semikolon zwischen zwei Teilsätzen zu horizontaler/vertikaler Skalierung
  – durch Punkt ersetzt).
- **Unabhängiger Subagent-Fachreview** (frischer Kontext) der kompletten 30
  Fragen: 24 von 30 auf Anhieb einwandfrei. Kein einziger fachlicher Fehler
  in Antwort/Erklärung gefunden. Hauptfund: derselbe Trivial-Distraktor
  ("… ist gesetzlich vorgeschrieben") wurde 5× wiederverwendet, dazu 2×
  "… erhöht automatisch das Projektbudget" – das schwächt die
  Trennschärfe der Aufgaben, da Prüflinge solche Muster ohne Fachwissen
  als "immer falsch" erkennen können. **Behoben**: alle 6 betroffenen
  Distraktoren in `FISI-PROJ-002`, `-009`, `-018`, `-021`, `-023` (2×),
  `-025` durch inhaltlich plausiblere, themennähere Falschaussagen
  ersetzt. Antwort/Erklärung unverändert, da fachlich korrekt.
- Zusätzlicher Hinweis des Subagenten (kein Fehler, nur geprüft und für
  korrekt befunden): `FISI-PROJ-012` (DSGVO bei Cloud-Anbieterwahl) wurde
  als möglicherweise eher datenschutzrechtlich statt LF12b-spezifisch
  hinterfragt – beim Abgleich mit dem Rahmenlehrplan-Text ("Lösungsvarianten
  entwickeln und vergleichen, Datenschutz/Datensicherheit beachten")
  bestätigt sich, dass das explizit Teil von LF12b ist. Keine Änderung
  nötig.
- Nach den Korrekturen erneut `validate-content.mjs`: weiterhin 0 Fehler,
  unveränderte Gesamtzahlen (reine Textänderung an Distraktoren, keine
  neuen/gelöschten Fragen).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Runde 2 (2026-09-19): `FISI-SYS` vertiefen – 24 weitere Fragen

`FISI-SYS` war mit 27 Fragen das kleinste bestehende FISI-Modul. 24 weitere
Fragen ergänzt (IDs `FISI-SYS-028` bis `-051`): Hardware (2, Hot-Swap/
redundante Netzteile), Speicher/RAID (3, RAID 10, RAID 6, Snapshot vs.
Backup), Virtualisierung (5, Overcommitment, Thin/Thick Provisioning,
Ressourcenkonkurrenz, Kubernetes/Container-Orchestrierung), Cloud (2,
Vendor Lock-in, Multi-Cloud), Backup (3, inkrementell vs. differentiell,
RTO, Restore-Test), Serverbetrieb (3, Wartungsfenster, Patch-Management,
Failover-Cluster), Monitoring (3, Schwellenwert-Alarmierung, Log-Management,
Auslastungskennzahlen), Verfügbarkeit (3, SLA, N+1-Redundanz, Single Point
of Failure). `FISI-SYS` hat damit jetzt **51 Fragen**.

`validate-content.mjs`: 0 Fehler, 1733 Fragen gesamt.

## QA-Fund (Runde 2): Antwortpositions-Verteilung in den neuen Fragen

Der Subagent-Fachreview für die 24 neuen `FISI-SYS`-Fragen fand keine
fachlichen Fehler, meldete aber eine auffällige Häufung: 23 von 24 Fragen
hatten "a" als korrekte Antwort in der CSV-Spalte `antwort`.

**Wichtige Korrektur (Sven, 2026-09-19):** Das ist **kein
Prüfungsdesign-Fehler und war es auch nie** – die App mischt die
Antwortoptionen bei jeder Anzeige (`frontend/src/utils/
optionen.js#mischeOptionen()`, Fisher-Yates mit Rückabbildung auf die
Original-Buchstaben) in allen echten Abfrage-Ansichten (`Quiz.jsx`,
`Pruefung.jsx`, `Karteikarten.jsx`, `PruefungLauf.jsx`). Ein Prüfling
sieht die CSV-Reihenfolge nie, "immer a wählen" funktioniert also nicht.
`AGENTS.md` Regel 3 wurde entsprechend ergänzt, damit künftige
Review-Subagenten diese Verteilung nicht mehr als Fehler melden.

Trotzdem wurden die betroffenen Batches zur besseren Lesbarkeit/
Datenhygiene in den CSV-Rohdaten selbst durchgemischt (kein funktionaler
Fix, rein optional gewesen) – Details unten der Vollständigkeit halber:

Stichprobenartig auch die vorherigen Batches dieser Sitzung geprüft – das
gleiche Muster fand sich in allen drei neu angelegten Dateien:
- `FIAE-UX` (Runde 1+2, 52 Fragen): 20/30 "b" in Runde 1, 12/22 "b" in
  Runde 2.
- `FISI-PROJ` (30 Fragen): 18/28 "a".
- `FISI-SYS` (neue 24): 23/24 "a".

**Fix**: Alle Antwortoptionen in allen drei Dateien (106 Fragen insgesamt)
programmatisch durchgemischt (Options-Reihenfolge zufällig permutiert,
`antwort`-Feld entsprechend mitgeführt – Fragetext, Optionstexte und
Erklärung inhaltlich unverändert, nur die Zuordnung Buchstabe↔Position neu).
Ergebnis nach dem Fix, deutlich gleichmäßiger verteilt:
- `FIAE-UX`: a=18, b=9, c=9, d=12
- `FISI-PROJ`: a=6, b=4, c=8, d=10
- `FISI-SYS` (neue): a=10, b=4, c=6, d=4

Nach dem Fix erneut `validate-content.mjs`: weiterhin 0 Fehler, unveränderte
Gesamtzahlen (reine Positions-/Buchstaben-Änderung, keine neuen/gelöschten
Fragen). Stichprobenartig die Zuordnung manuell gegengeprüft (korrekte
Antwort-Buchstaben zeigen weiterhin auf denselben Optionstext wie vorher).

**Zusätzlicher Fund dabei (ohne Nutzerauswirkung, siehe Korrektur oben)**:
Eine Auszählung über den gesamten Fragenkatalog (alle 23 Dateien, 1654
Single-Choice-Fragen) zeigt, dass dieses Verteilungsmuster in den
CSV-Rohdaten projektweit und schon lange vor dieser Sitzung besteht: 1157
von 1654 (70 %) haben "b" als korrekte Antwort, nur 480 "a", 15 "c" und 2
"d". Da die Anzeige-Reihenfolge ohnehin bei jedem Aufruf neu gemischt wird
(siehe oben), hat das **keine Auswirkung auf die Prüfungsvalidität** und
wird nicht als eigenständiger Fix-Task behandelt – siehe herabgestuften
Backlog-Punkt `CONTENT-010` in `STATUS.md` (niedrige Priorität, reine
Datenhygiene-Notiz, kein Brief nötig).

## Weg zu 1000 FISI-Fragen – Stand & nächste Schritte

Vorher: 169 FISI-spezifische Fragen (FISI-NET 51, FISI-SEC 55, FISI-BET 36,
FISI-SYS 27). Nach Runde 1 (+30, `FISI-PROJ` neu): 199. Nach Runde 2 (+24,
`FISI-SYS` vertieft): **223**. Es fehlen noch grob 777, um die
~1000er-Zielgröße zu erreichen.

Vorschlag für die nächsten Runden (jeweils eigener Brief):
1. ~~`FISI-SYS` vertiefen~~ — erledigt (siehe Runde 2 oben).
2. `FISI-NET`/`FISI-SEC` vertiefen (aktuell 51/55, aber Zielgröße ~1000
   Fragen gesamt macht das trotzdem nötig).
3. Danach: DPA (Datenanalyse) und DVK (Digitale Vernetzung) nach demselben
   Muster – erst Curriculum-Recherche zu den jeweils spezifischen
   Lernfeldern (LF10c-12c bzw. LF10d-12d), dann Lücken-Analyse, dann
   Fragen-Batches.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 30 `FISI-PROJ`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
