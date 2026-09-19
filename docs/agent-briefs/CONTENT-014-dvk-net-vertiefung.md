# Brief CONTENT-014: DVK-NET vertiefen (Runde 3, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der Vertiefungsphase nach `CONTENT-013` (DVK-AUT): zweites
DVK-Modul vertiefen, `DVK-NET` (Netzwerktechnik für vernetzte/cyber-physische
Systeme), von 27 auf 52 Fragen erweitert. Diese Runde ist ein wichtiges
Beispiel dafür, dass Wort-Ersetzung KEIN verlässlicher Fix für
Distraktor-Muster ist – erst eine vollständige Neuformulierung mit
quantitativer Selbstprüfung hat funktioniert.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-NET.csv` – von 27 auf 52 Fragen erweitert (neue
  IDs `DVK-NET-028` bis `-052`).

## Neue Themen (25 Fragen)

LPWAN-Technologien (4, LoRaWAN/NB-IoT/Sigfox-Abgrenzung, Reichweiten-/
Datenraten-/Latenz-Tradeoffs), Mesh- & Kurzstreckenfunk (4, Zigbee-Mesh,
Bluetooth Low Energy, WLAN-Störanfälligkeit in Produktionsumgebungen,
Z-Wave), IoT-Anwendungsprotokolle (4, MQTT Publish/Subscribe, CoAP, MQTT
vs. HTTP, MQTT-QoS-Level), Netzwerktopologien & Redundanz (4, Linie vs.
Ring, RSTP, Single Point of Failure), Time-Sensitive Networking (3, TSN-
Ziel, NAMUR-Empfehlungen, PTP-Zeitsynchronisation), Edge-Gateways &
Protokollübersetzung (3, Protokoll-Gateway, Edge-Aggregation,
Normalisierung), Auswahlkriterien für Funktechnologien (3, Reichweite/
Energie/Datenrate-Zielkonflikt, Innenraum-Dämpfung, lizenzfreie Bänder).

## QA-Ablauf – **vier** Subagent-Review-Durchläufe in dieser Runde

Diese Runde hat deutlich mehr Korrekturschleifen gebraucht als
`CONTENT-013` und liefert eine wichtige methodische Lehre:

1. **Erster Review** (frischer Subagent): keine fachlichen Fehler, aber
   massives Füllwort-Templating – 12 von 25 Fragen hatten alle 3
   Distraktoren mit Absolutheits-Signalwörtern markiert
   ("ausschließlich"/"grundsätzlich"/"automatisch"/"zwingend"/
   "vollständig"/"stets"/"gesetzlich"/"in jedem Fall"), 7 weitere Fragen
   2 von 3. Zusätzlich Längenprobleme bei zwei Einzelfragen.
2. **Erster Korrekturversuch (gescheitert)**: gezielte
   Wort-Ersetzung der bekannten Signalwörter durch vermeintlich neutrale
   Alternativen.
3. **Zweiter Review**: lehnte den Fix ab – die Ersetzung hatte die alten
   Signalwörter lediglich durch ein neues, ebenso lernbares Füllwort-Paar
   ersetzt ("dabei"/"dafür", in ~20 von 75 Distraktoren, 11 von 25 Fragen
   erneut mit allen 3 Distraktoren markiert), und zwei alte Signalwörter
   waren sogar zurückgekehrt. Wörtliches Fazit des Reviewers: *"das
   Grundproblem ist nur umbenannt, nicht behoben"*.
4. **Zweiter Korrekturansatz**: kompletter Neuentwurf aller 75
   Distraktor-Texte (nicht mehr Wort-Ersetzung, sondern freies
   Neuformulieren jeder falschen Option als eigenständiger, plausibler
   Satz). Eigene quantitative Selbstprüfung eingeführt (Python-Skript):
   Zählung von Trigger-Wort-Treffern ausschließlich in Distraktoren sowie
   Längenvergleich (Zeichen/Wörter) korrekte Antwort vs.
   Distraktor-Durchschnitt je Frage.
5. **Dritter Review**: Füllwort-Problem vollständig behoben (0 Treffer),
   aber ein neuer, subtilerer Rateindikator gefunden: die korrekte
   Antwort war in 24 von 25 Fragen länger/ausführlicher als der
   Distraktor-Durchschnitt (Ø +30 Zeichen / +3,6 Wörter) – verursacht
   durch erklärende Nebensätze ("wodurch…", "während…", "was…") in den
   korrekten Antworten, die in den neu geschriebenen Distraktoren fehlten.
6. **Dritter Korrekturansatz**: alle 25 Fragen auf kompakte,
   einheitliche Hauptsatz-Optionen umgestellt (Detailerklärungen wandern
   in die `erklaerung`-Spalte statt in die Optionstexte selbst), größte
   Längenausreißer gezielt nachjustiert. Eigene Nachmessung vor dem
   nächsten Review: Ø-Differenz auf +1,76 Zeichen / +0,11 Wörter
   reduziert, kein Fall mit 2+ Signalwort-markierten Distraktoren mehr.
7. **Vierter, bestätigender Review**: **BESTEHT** – fachlich korrekt,
   Distraktoren plausibel, Längenmuster nicht mehr erkennbar (korrekte
   Antwort nur noch in 7 von 25 Fällen die längste Option, nahe am
   Zufallswert von 25 % bei vier Optionen). Einziger Restbefund: das Wort
   "nur" kommt in 8 von 25 Fragen ausschließlich in einem Distraktor vor
   – vom Reviewer explizit als schwach und nicht ausschlaggebend
   bewertet, aber als Beobachtungspunkt für künftige Runden notiert.
8. `validate-content.mjs` nach jeder Korrekturrunde erneut ausgeführt:
   durchgehend 0 Fehler, zuletzt 1861 Fragen gesamt (26 Dateien, 26
   Module, 4 Fachrichtungen), keine Duplikate, keine verschobenen Spalten
   (eigener Python-Check: 14 Felder pro Zeile, eindeutige IDs).

**Lehre für künftige Runden (wichtig – Ergänzung zu `CONTENT-013`)**:
Wort-Ersetzung ("ausschließlich" → "dabei") behebt ein
Füllwort-Templating-Problem NICHT, sie verschiebt es nur auf ein neues
Wort – das bestätigende Review hat das in dieser Runde explizit
nachgewiesen. Der einzige zuverlässige Fix ist eine vollständige,
unabhängige Neuformulierung jeder betroffenen Option. Zusätzlich hat
sich eine **quantitative Selbstprüfung vor dem Review** bewährt: ein
kurzes Python-Skript, das (a) Trigger-Wörter zählt, die ausschließlich in
Distraktoren auftauchen, und (b) die Zeichen-/Wortlänge der korrekten
Antwort mit dem Distraktor-Durchschnitt je Frage vergleicht, deckt beide
Fundtypen aus `CONTENT-012`/`-013`/`-014` zuverlässig auf, bevor eine
weitere Review-Runde nötig wird, und spart dadurch Zeit.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-013`): 193 DVK-Fragen. Nach dieser Runde (+25
`DVK-NET`): **218**. Es fehlen noch grob 782, um die ~1000er-Zielgröße zu
erreichen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review, plus der neuen
Selbstprüfungs-Routine vor jedem Review-Durchlauf):
1. `DVK-IOT` vertiefen (aktuell 27, letztes noch nicht vertieftes kleines
   DVK-Modul), dann `DVK-CLD` (37), `DVK-PROJ`/`DVK-SEC` (27/24, aus
   `CONTENT-012`).
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

- [ ] Sven liest die 25 neuen `DVK-NET`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
