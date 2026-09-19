# Brief CONTENT-017: DVK-SEC vertiefen (Runde 6, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der Vertiefungsphase nach `CONTENT-016` (DVK-CLD): fünftes
DVK-Modul vertiefen, `DVK-SEC` (IT-Sicherheit für cyber-physische Systeme /
OT-Security), von 24 auf 49 Fragen erweitert. Diese Runde bestätigt erneut
die aus `CONTENT-014`/`-015`/`-016` gewonnene Lehre, dass kein fester
Signalwort-Filter ausreicht – diesmal tauchte die Wortfamilie
"nur"/"jährlich"/"einmal(ig)"/"ohne" auf, wieder anders als in allen
vorherigen Runden.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-SEC.csv` – von 24 auf 49 Fragen erweitert (neue
  IDs `DVK-SEC-025` bis `-049`).

## Neue Themen (25 Fragen)

Kryptografie-Grundlagen (4, symmetrisch/asymmetrisch, X.509-Zertifikate,
Hashwerte für Firmware-Integrität, TLS-Herausforderungen in OT),
Angriffsvektoren auf CPS (4, Replay-Angriff, Man-in-the-Middle, unsignierte
Firmware, Social Engineering), IEC 62443 vertieft (4, Security Levels SL
0–4, Zonen & Conduits, Defense in Depth, Sicherheits-Lebenszyklus),
Schwachstellenmanagement & Pentests (3, Patch-Management in OT,
Scan-Risiken für Feldgeräte, Umgang mit neu entdeckten Lücken), Incident
Response für OT/CPS (4, Zweck eines IR-Plans, OT-Forensik-Herausforderungen,
sichere Wiederinbetriebnahme, gesetzliche Meldepflichten), Physische
Sicherheit (3, Zutrittskontrolle, USB-Schnittstellen-Risiko, Tamper
Detection), Security by Design (3, Grundprinzip, minimale Angriffsfläche,
sichere Standardkonfiguration/Secure Defaults).

## QA-Ablauf – zwei Subagent-Review-Durchläufe nötig

Vor dem ersten Review wurde erstmals ein zusätzlicher, eigener
Zwischenschritt eingebaut: nach dem Entwurf der 25 Fragen zeigte die eigene
quantitative Selbstprüfung (Regex-basierte Trigger-Wort-Suche nur in
Distraktoren, Wortgrenzen-genau, plus Längenrichtungs-Zählung) bereits 43
Treffer der bekannten Füllwortliste und eine Längenrichtung von 22/25
(88 %) – deutlich über dem Zufallsniveau. Eine erste eigene Korrekturrunde
(konkrete Detailformulierungen statt Wort-Ersetzung, mehrere Iterationen)
senkte dies vor dem ersten Review auf 0 Treffer der bekannten Liste und
eine Längenrichtung von 20 % (5/25).

1. **Erster Review**: keine fachlichen Fehler, Längenrichtung unauffällig
   (6/25 ≈ 24 %) – aber eine **neue, bis dahin unentdeckte Wortfamilie**:
   "nur" (12 von 13 Vorkommen ausschließlich in falschen Antworten),
   "jährlich"/"halbjährlich" (4/4 nur falsch), "einmal"/"einmalig" (3/3 nur
   falsch), "ohne" (4/4 nur falsch) – derselbe Fehlertyp wie in
   `CONTENT-014`/`-015`/`-016`, nur mit anderem Vokabular. Zusätzlich zwei
   inhaltliche Unschärfen: `DVK-SEC-037` (Distraktoren b/c waren ebenfalls
   real zutreffende, verteidigbare Gründe für erschwertes Patch-Management
   in OT, wodurch die Frage mehrdeutig wurde) und `DVK-SEC-041`
   (Distraktor b war inhaltlich zu nah an der korrekten Antwort a, beides
   im Kern "begrenzte Logs").
2. **Korrektur**: 24 betroffene Distraktoren mit konkreten Detailformu-
   lierungen neu geschrieben (kein reines Wort-Tauschen); bei
   `DVK-SEC-037` wurden Distraktor b und c durch klar falsche, aber
   plausible Aussagen ersetzt (Update ohne Neustart möglich / kompletter
   Hardware-Tausch einfacher als Software-Update); bei `DVK-SEC-041` wurde
   Distraktor b durch eine inhaltlich klar andere, falsche Aussage ersetzt
   (angeblich offenes Standardformat statt proprietärer Logs). Bewusst
   wurde "ohne" auch in eine korrekte Antwort eingebaut (`DVK-SEC-044`),
   damit das Wort nicht mehr exklusiv mit "falsch" korreliert – gemäß der
   in `CONTENT-016` dokumentierten Strategie.
3. **Zweiter, bestätigender Review** (mit explizitem Auftrag, `DVK-SEC-037`
   und `DVK-SEC-041` gezielt erneut zu prüfen): **BESTEHT**. Alle 25
   korrekten Antworten fachlich bestätigt, `DVK-SEC-037` nicht mehr
   mehrdeutig, `DVK-SEC-041` deutlich verbessert (ein Reviewer-Hinweis
   verblieb als geringfügige, nicht ausschlaggebende Beobachtung zu
   Distraktor c – siehe unten). Füllwort-Vorkommen jetzt gleichmäßig auf
   richtige und falsche Antworten verteilt, keine Wortfamilie mehr
   exklusiv in Distraktoren. Längenrichtung: korrekte Antwort in 5/25
   (20 %) die längste Option, in 5/25 (20 %) die kürzeste – beides nahe
   am Zufallsniveau, kein Muster in beide Richtungen.
4. `validate-content.mjs` nach jeder Korrekturrunde erneut ausgeführt:
   durchgehend 0 Fehler, zuletzt 1936 Fragen gesamt (26 Dateien, 26 Module,
   4 Fachrichtungen), keine Duplikate. Eigener Python-Check: 14 Felder pro
   Zeile, eindeutige IDs, beides bestätigt.

**Restbefund (nicht ausschlaggebend, für künftige Runden vermerkt)**:
Beim zweiten Review wurde Distraktor c von `DVK-SEC-041`
("Forensische Untersuchungen benötigen in OT-Umgebungen vorab eine
Abstimmung mit dem Anlagenbauer") als inhaltlich etwas "weich" bewertet –
in der Praxis ist eine Abstimmung mit dem Anlagenbauer tatsächlich häufig
nötig, auch wenn dies nicht die im Erklärungstext beschriebene
Kernursache ist. Kein harter Fehler, aber ein Kandidat für eine spätere
Politur (z. B. Umformulierung in Richtung Budget/Terminplanung statt
eines echten forensischen Hindernisses).

**Lehre für künftige Runden (weitere Bestätigung von
`CONTENT-014`/`-015`/`-016`)**: Auch in der fünften vertieften DVK-Runde
trat wieder eine neue, vorher nicht beobachtete Signalwort-Familie auf
("nur"/"jährlich"/"einmal(ig)"/"ohne"). Die Kombination aus (a) konkreten
Detailformulierungen statt Wort-Ersetzung und (b) gezieltem, gelegentlichem
Wiederverwenden potenziell auffälliger Wörter auch in korrekten Antworten
bleibt der zuverlässigste Ansatz. Neu in dieser Runde: die eigene
Selbstprüfung nutzt jetzt Wortgrenzen-genaues Regex-Matching
(`\bwort\b`) statt reiner Teilstring-Suche, da reine Teilstring-Suche
False Positives erzeugt (z. B. "alle" als Teilstring von "Intervalle").
Dieses Detail sollte in künftigen Selbstprüfungsskripten beibehalten
werden.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-016`): 268 DVK-Fragen. Nach dieser Runde (+25
`DVK-SEC`): **293**. Es fehlen noch grob 707, um die ~1000er-Zielgröße zu
erreichen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review, plus quantitativer Selbstprüfung
mit wortgrenzengenauer Regex-Suche vor jedem Review):
1. `DVK-PROJ` vertiefen (aktuell 27, letztes noch nicht in dieser
   Vertiefungsrunde behandeltes DVK-Modul), danach zweite
   Vertiefungsrunde für alle sechs DVK-Module reihum, bis ~1000 erreicht.
2. Danach FISI vertiefen (`FISI-BET` 36 kleinstes FISI-Modul, dann
   `FISI-PROJ` 30, `FISI-NET`/`FISI-SYS` 51, `FISI-SEC` 55).
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `DVK-SEC`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
