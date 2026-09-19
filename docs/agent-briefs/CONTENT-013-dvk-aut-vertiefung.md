# Brief CONTENT-013: DVK-AUT vertiefen (Runde 2, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Erster Schritt der systematischen Vertiefungsphase Richtung ~1000 Fragen je
Fachrichtung, nachdem mit `CONTENT-012` alle Lernfeld-Lücken bei DVK
geschlossen wurden. Sven hat die Fortsetzung in diesem Turnus bis zum
Erreichen der Zielzahlen ausdrücklich freigegeben, mit der klaren
Bedingung, dass der unabhängige Subagent-Review konsequent eingehalten
wird ("wichtig ist wie gesagt das der review konsequent seitens des
Agent bzw. der Agent eingehalten wird").

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-AUT.csv` – von 26 auf 51 Fragen erweitert (neue
  IDs `DVK-AUT-027` bis `-051`).

## Warum `DVK-AUT` zuerst?

DVK war nach `CONTENT-012` mit 168 Fragen (4 Module: IOT 27, NET 27,
AUT 26, CLD 37) die am weitesten von der ~1000er-Zielgröße entfernte
Fachrichtung. `DVK-AUT` war mit 26 Fragen das kleinste Modul und damit
der naheliegendste Startpunkt für die Vertiefungsphase.

## Neue Themen (25 Fragen)

Ergänzt um bisher nicht abgedeckte Unterthemen des Moduls
"Automatisierung und Industrie 4.0": Feldbusse & Kommunikation (5,
PROFINET/PROFIBUS/EtherCAT/IO-Link/Echtzeitfähigkeit), SPS-Programmierung
vertieft (4, FB vs. FC nach IEC 61131-3, Merker, Zykluszeit, Watchdog),
Sicherheitstechnik (4, Stopp-Kategorien 0/1, Performance Level nach
ISO 13849, Sicherheitslichtschranke, Zweihandschaltung),
Robotik-Grundlagen (4, Freiheitsgrade, Greifer, Teach-In, Cobots),
Antriebstechnik (3, Frequenzumrichter, Servo- vs. Schrittmotor,
Drehmoment), Industrie-4.0-Vertiefung (5, OEE, vertikale Integration,
MES, Edge Computing, Condition Monitoring vs. Predictive Maintenance).

## QA-Ablauf – **zwei** Subagent-Review-Durchläufe in dieser Runde

Diese Runde ist ein wichtiges Beispiel dafür, warum der Subagent-Review
konsequent nötig ist, nicht nur pro forma:

1. **Erster Review** (frischer Subagent, mit Hinweis auf das
   Anzeige-Mischen): keine fachlichen Fehler, aber ein **neuer,
   batch-weiter Fundtyp**, der bereits bei `DVK-SEC` (`CONTENT-012`)
   aufgetreten war und den ich trotz der dort gewonnenen Lehre erneut
   reproduziert habe – die korrekte Antwort war in praktisch allen 25
   Fragen deutlich länger/detaillierter formuliert als die Distraktoren.
   Zusätzlich ein wiederkehrendes Füllwort-Muster ("ausschließlich",
   "grundsätzlich", "automatisch", vereinzelt "gesetzlich").
2. **Korrektur**: alle 25 Fragen mit längen-/detailgradmäßig
   angeglichenen Distraktoren neu formuliert (Antwort/Erklärung inhaltlich
   unverändert korrekt).
3. **Zweiter, bestätigender Review** (erneut frischer Subagent): Das
   Längenproblem war behoben. Das Füllwort-Muster war aber **nur
   teilweise** behoben – "ausschließlich"/"grundsätzlich" tauchten noch in
   12 von 25 Fragen ausschließlich in Distraktoren auf, ein weiterhin
   lernbares Ausschlusskriterium.
4. **Zweite Korrektur**: alle 12 betroffenen Distraktoren gezielt
   umformuliert (Füllwörter entfernt bzw. durch neutralere Formulierungen
   ersetzt), verbleibende Stellen per `grep` gegengeprüft – die einzige
   verbliebene Fundstelle liegt in einer bereits vor dieser Runde
   bestehenden Frage (`DVK-AUT-011`, "Wie arbeitet eine SPS
   grundsätzlich?" – Teil der Frage selbst, kein Distraktor-Muster, nicht
   Teil dieser Runde).
5. `validate-content.mjs` nach jeder Korrekturrunde erneut ausgeführt:
   durchgehend 0 Fehler, 1836 Fragen gesamt, keine Duplikate (per Skript
   geprüft), keine verschobenen Spalten.

**Lehre für künftige Runden**: Der Antwortlängen-/Detailgrad-Fund aus
`CONTENT-012` (`DVK-SEC`) war kein Einzelfall, sondern ein wiederkehrendes
Muster in meiner eigenen Fragen-Erstellung. Ich sollte künftig von Anfang
an auf vergleichbare Länge/Detailgrad zwischen korrekter Antwort und
Distraktoren achten, statt es dem Review zu überlassen, es im Nachhinein
zu finden – das spart eine Korrekturschleife. Ebenso beim
Füllwort-Muster: "ausschließlich"/"grundsätzlich"/"automatisch" als
Signalwort für "diese Option ist falsch" möglichst von vornherein
vermeiden.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-012`): 168 DVK-Fragen. Nach dieser Runde (+25
`DVK-AUT`): **193**. Es fehlen noch grob 807, um die ~1000er-Zielgröße zu
erreichen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review):
1. `DVK-IOT`/`DVK-NET` vertiefen (aktuell je 27), dann `DVK-CLD` (37),
   `DVK-PROJ`/`DVK-SEC` (27/24, aus `CONTENT-012`).
2. Danach FISI vertiefen (`FISI-BET` 36 ist aktuell das kleinste
   FISI-Modul, dann `FISI-PROJ` 30, `FISI-NET`/`FISI-SYS` 51,
   `FISI-SEC` 55).
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `DVK-AUT`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
