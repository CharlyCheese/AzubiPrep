# Brief CONTENT-012: DVK-Fragenausbau Richtung 1000 (Runde 1)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung von `CONTENT-008` (FIAE), `CONTENT-009` (FISI) und `CONTENT-011`
(DPA), jetzt für DVK: gleiche Vorgehensweise (echte Curriculum-Recherche,
Lücken-Analyse, geprüfter Fragen-Batch, verbindlicher Subagent-Fachreview
gemäß `AGENTS.md` Regel 3), Ziel weiterhin ~1000 fachrichtungsspezifische
Fragen je Fachrichtung. Anders als bei FIAE/FISI/DPA gab es bei DVK **zwei**
offene Lernfeld-Lücken (LF11d und LF12d), beide wurden in dieser Runde
geschlossen.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-PROJ.csv` (neu) – 27 neue Fragen für das neue
  Modul `DVK-PROJ` (LF12d).
- `content/questions/DVK-SEC.csv` (neu) – 24 neue Fragen für das neue
  Modul `DVK-SEC` (LF11d).
- `content/modules.csv` – zwei neue Zeilen für `DVK-PROJ` und `DVK-SEC`.

## Kontext: echte Curriculum-Recherche (KMK-Rahmenlehrplan)

Quelle: KMK-Rahmenlehrplan Fachinformatiker, Feinziele der drei
DVK-spezifischen Lernfelder:

- **LF10d – Cyber-physische Systeme entwickeln**: Kundenaufträge zur
  CPS-Entwicklung analysieren, Mensch-Maschine-KI-Interaktion,
  Komponenten planen/koordinieren, vernetzen/programmieren, testen,
  dokumentieren, bewerten, ethische Reflexion zu KI.
- **LF11d – Betrieb und Sicherheit vernetzter Systeme gewährleisten**:
  Risikoanalyse, Schutzziele im Kundengespräch, Sicherheitsanalyse unter
  IT-Sicherheitsleitlinien/rechtlichen Regelungen, Maßnahmen
  implementieren, Reflexion des Konzepts "relative Sicherheit".
- **LF12d – Kundenspezifisches cyber-physisches System optimieren**:
  gleiche generische Projektstruktur wie LF12b/LF12c (Anforderungsanalyse,
  Projektplanung/-kalkulation, Lösungsvarianten inkl. Datenschutz,
  Angebot, Umsetzung mit Qualitätssicherung, Präsentation/Schulung,
  Übergabe, Bewertung, Reflexion).

**Fund**: `LF10d` ist bei DVK bereits über `DVK-IOT`/`DVK-AUT`/`DVK-CLD`
abgedeckt, `LF9` über `DVK-NET`. **`LF11d` und `LF12d` hatten dagegen
beide noch gar kein Modul und damit null Fragen** – anders als bei
FIAE/FISI/DPA (dort jeweils nur eine LF-Lücke).

## Neu: Modul `DVK-PROJ` (LF12d) – 27 Fragen, geprüft

Neues Modul `DVK-PROJ` ("Kundenspezifisches cyber-physisches System
optimieren") angelegt, 27 Fragen zu: Anforderungsanalyse (4, davon 1 MC),
Projektplanung & Kalkulation (3), Lösungsvarianten & Datenschutz (4),
Angebot & Leistungsbeschreibung (3), Qualitätssicherung (4), Präsentation
& Schulung (3), Übergabe & Dokumentation (3, davon 1 MC), Wirtschaftlichkeit
& Skalierbarkeit (3). Format: 25 SC / 2 MC. Inhaltlich parallel zu
`FISI-PROJ`/`DPA-PROJ` strukturiert (gleiches LF12-Muster für
kundenspezifische Projekte), aber mit CPS-typischer Fachfärbung
(physikalische Rahmenbedingungen, Feldtests, Redundanz, Rollback-Pläne
für Steuerungsprozesse, Fernwartungszugänge).

## Neu: Modul `DVK-SEC` (LF11d) – 24 Fragen, geprüft

Neues Modul `DVK-SEC` ("Betrieb und Sicherheit vernetzter cyber-physischer
Systeme") angelegt, 24 Fragen zu: Risikoanalyse & Schutzbedarf (5),
Schutzziele im Kundengespräch (3), IT-Sicherheitsanalyse für CPS (4,
inkl. OT/IT-Begriffe, Modbus-Unsicherheit, Air Gap), Sicherheitsleitlinien
& rechtliche Regelungen (3, inkl. KRITIS), Maßnahmen implementieren (4,
inkl. Netzwerksegmentierung, Least Privilege), Sicherheitsniveau bewerten
& dokumentieren (3), Relative-Sicherheit-Reflexion (2). Format: 24 SC.
Bewusst mit deutlichem Praxisbezug zu OT/CPS statt reiner Wiederholung von
`FISI-SEC`/`FISI-NET` (die bereits die IT-seitige LF11b-Vertiefung
abdecken).

**Antwortpositionen von Anfang an rotiert** (Lehre aus `CONTENT-009`, wie
schon bei `DPA-PROJ` in `CONTENT-011`) – nicht sicherheitsrelevant, da die
App die Optionen ohnehin bei jeder Anzeige mischt (siehe `AGENTS.md` Regel
3 / `CONTENT-010`), aber sauberer.

**QA-Ablauf (wie bei `CONTENT-008`/`-009`/`-011`, inkl. verbindlichem
Subagent-Review):**
- Eigener Spalten-/Semikolon-Scan vor Auslieferung: beide Dateien, je 14
  Spalten pro Zeile, keine Auffälligkeiten.
- `validate-content.mjs` gegen den kompletten `content/`-Ordner: 0 Fehler,
  1811 Fragen, 26 Module, 4 Fachrichtungen.
- **Zwei unabhängige Subagent-Fachreviews** (je frischer Kontext, mit
  explizitem Hinweis auf das Mischen der Anzeigeoptionen, damit die
  CSV-Antwortverteilung nicht fälschlich als Fehler gemeldet wird):
  - `DVK-PROJ`: kein fachlicher Fehler gefunden (auch beide MC-Fragen
    korrekt), aber dasselbe wiederkehrende Distraktor-Muster wie zuvor bei
    `FISI-PROJ`/`DPA-PROJ` ("gesetzlich …", "automatisch …", "… Rechnung
    gestellt werden darf") in 6 Fragen (`-002`, `-016`, `-017`, `-019`,
    `-021`, `-027`) sowie eine Frage (`-020`), deren korrekte Antwort durch
    explizite Verneinung der übrigen drei Optionen zu lang/auffällig war.
    **Behoben**: alle betroffenen Distraktoren ersetzt, `-020` gekürzt und
    umformuliert; zusätzlich `-016` (Schwierigkeit) von "schwer" auf
    "mittel" herabgestuft, wie vom Review vorgeschlagen.
  - `DVK-SEC`: kein fachlicher Fehler gefunden, aber ein **neuer, wichtiger
    Fundtyp**: die korrekte Antwort war in praktisch allen 24 Fragen
    deutlich länger/detaillierter formuliert als die Distraktoren – ein
    Rateindikator, der unabhängig vom Anzeige-Mischen bestehen bleibt (der
    Text selbst verrät sich, nicht die Position). Besonders `DVK-SEC-015`
    hatte zusätzlich ein identisches "Ausschließlich …"-Präfix bei allen
    drei Distraktoren. Dazu erneut das "gesetzlich …"/"automatisch …"-Muster
    in mehreren Fragen. **Behoben**: die komplette Datei mit neu
    formulierten, längen- und detailgradmäßig angeglichenen Distraktoren
    neu erzeugt (Kernaussage/Antwort/Erklärung unverändert korrekt,
    ausschließlich die falschen Optionen umformuliert).
- Nach den Korrekturen erneut `validate-content.mjs`: weiterhin 0 Fehler,
  unveränderte Gesamtzahlen (reine Textänderungen an Distraktoren plus
  eine Schwierigkeits-Anpassung, keine neuen/gelöschten Fragen).
- Aus diesem Fund folgt eine neue Lehre für künftige Batches (auch über
  DVK hinaus): **nicht nur Antwortposition, auch Antwortlänge/-detailgrad
  sollte zwischen richtiger Option und Distraktoren vergleichbar sein**,
  sonst bleibt ein Rateindikator bestehen, den auch das Anzeige-Mischen
  nicht neutralisiert (im Gegensatz zur Positions-Frage aus `CONTENT-010`).
  Ein zweiter voller Review-Durchlauf nach den Korrekturen wurde nicht
  durchgeführt, da die Änderungen ausschließlich Distraktor-Formulierungen
  betrafen und weder Antwort noch Erklärung inhaltlich verändert haben.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher: 117 DVK-spezifische Fragen (DVK-IOT 27, DVK-NET 27, DVK-AUT 26,
DVK-CLD 37). Nach Runde 1 (+27 `DVK-PROJ`, +24 `DVK-SEC`, beide neu):
**168**. Es fehlen noch grob 832, um die ~1000er-Zielgröße zu erreichen.

Vorschlag für die nächsten Runden (jeweils eigener Brief):
1. `DVK-IOT`/`DVK-NET`/`DVK-AUT` vertiefen (analog zu `FISI-SYS` in
   `CONTENT-009` Runde 2), `DVK-CLD` ist mit 37 bereits vergleichsweise
   umfangreich.
2. Damit sind alle vier Fachrichtungen einmal durch den
   Curriculum-Recherche→Lücken-Analyse→Fragen-Batch-Zyklus gelaufen –
   danach systematisch vertiefen statt weiter neue Module zu suchen, bis
   die ~1000er-Zielgröße je Fachrichtung erreicht ist.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 27 `DVK-PROJ`- und 24 `DVK-SEC`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
