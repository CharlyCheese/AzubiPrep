# Brief CONTENT-016: DVK-CLD vertiefen (Runde 5, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der Vertiefungsphase nach `CONTENT-015` (DVK-IOT): viertes und
letztes DVK-Modul dieser ersten Vertiefungsrunde, `DVK-CLD` (Cloud-Themen
für Digitale Vernetzung), von 37 auf 62 Fragen erweitert. Diese Runde
zeigt besonders deutlich, wie hartnäckig das Muster totalisierender
Signalwörter in Distraktoren ist – drei Review-Durchläufe waren nötig, da
jede Korrektur eine neue, bis dahin unentdeckte Wortfamilie freilegte.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-CLD.csv` – von 37 auf 62 Fragen erweitert (neue
  IDs `DVK-CLD-038` bis `-062`).

## Neue Themen (25 Fragen)

Multi-Cloud & Hybrid-Cloud-Strategien (4, Vendor-Lock-in-Vermeidung,
Komplexitätsrisiko, Cloud-Bursting), Cloud-Sicherheit & IAM (4, Least
Privilege, Multi-Faktor-Authentifizierung, VPC/VNet-Isolation, Shared
Responsibility Model), Serverless & FaaS (4, AWS Lambda/Azure Functions,
Ausführungsdauer-Limits, ereignisgetriebene Skalierung, Cold Start),
Cloud-Migration (3, Lift and Shift, Refactoring/Re-Architecting, Risiken
überstürzter Migration), Monitoring & Observability (4, Observability vs.
klassisches Monitoring, Distributed Tracing, SLI/SLO/SLA-Abgrenzung,
Log-Aggregation), CI/CD in Cloud-nativen Umgebungen (3, Pipeline-Ziel,
Canary Deployment, Infrastructure as Code), Cloud-Kostenoptimierung (3,
Reserved Instances, Spot Instances, Rightsizing).

## QA-Ablauf – **drei** Subagent-Review-Durchläufe nötig

1. **Vorab-Selbstprüfung** (Lehre aus `CONTENT-015`, diesmal von Anfang
   an in der Autoring-Phase angewendet, nicht erst nachträglich): Fragen
   wurden mit bewusst längenbalancierten Optionen geschrieben (Ziel:
   korrekte Antwort ist nur in ~20 % der Fragen die längste Option, nahe
   am Zufallsniveau von 25 % bei vier Optionen) und vor dem ersten Review
   gegen die bekannte Füllwortliste geprüft (unauffällig).
2. **Erster Review**: kein Längen-Bias (5/25 längste = korrekt, unter
   Zufallsniveau) und keine der bekannten Füllwörter gefunden – aber ein
   **neues Wortmuster**: die Wörter "alle", "garantiert", "dauerhaft" und
   "unabhängig" kamen in 4 bis 7 Fällen praktisch ausschließlich in
   falschen Optionen vor. Zusätzlich eine kleine fachliche Unschärfe in
   der SLI/SLO-Erklärung (Frage 055) bemängelt.
3. **Erste Korrektur**: betroffene Distraktoren umformuliert, SLI/SLO/SLA
   sauber gegeneinander abgegrenzt.
4. **Zweiter Review**: Das ursprüngliche Muster war behoben, aber eine
   **bis dahin unentdeckte Wortfamilie** ("alle/aller/allein", "gesamt-",
   "endgültig", "unbegrenzt") kam in 9 von 25 Fragen (36 %) exklusiv in
   Distraktoren vor – derselbe Fehlertyp wie zuvor, nur mit anderem
   Vokabular, ähnlich der Erfahrung aus `CONTENT-014` (DVK-NET).
5. **Zweite Korrektur**: alle 15 betroffenen Vorkommen der zweiten
   Wortfamilie in den Distraktoren identifiziert und durch konkrete,
   neutrale Detailformulierungen ersetzt (keine neuen Absolutheits-Wörter
   eingeführt).
6. **Dritter, bestätigender Review** (mit explizitem Auftrag, besonders
   gründlich auf JEDE Form absolutistischer/totalisierender Sprache zu
   achten, nicht nur die bereits gefundenen Einzelwörter): **BESTEHT**.
   Kein Wortmuster tritt mehr wiederholt und exklusiv in Distraktoren auf;
   Wörter wie "unabhängig", "dauerhaft" und "jeder" kommen inzwischen auch
   in korrekten Antworten vor, wodurch die frühere Eins-zu-eins-Korrelation
   aufgebrochen ist. Zwei geringfügige Restbefunde (alle drei Distraktoren
   einer einzelnen Frage – `DVK-CLD-042` – mit absolutistischem Ton;
   konkrete Zahlenangaben in 4/25 Fragen nur in Distraktoren) wurden vom
   Reviewer als nicht ausschlaggebend bewertet, aber für künftige Runden
   als Beobachtungspunkte notiert.
7. `validate-content.mjs` nach jeder Korrekturrunde erneut ausgeführt:
   durchgehend 0 Fehler, zuletzt 1911 Fragen gesamt (26 Dateien, 26
   Module, 4 Fachrichtungen), keine Duplikate.

**Lehre für künftige Runden (weitere Ergänzung zu `CONTENT-014`/
`CONTENT-015`)**: Das Auffinden und Entfernen EINER Wortfamilie
totalisierender Signalwörter garantiert nicht, dass keine weitere,
strukturell identische Wortfamilie im selben Batch übersehen wurde – auch
scheinbar harmlose, inhaltlich sinnvolle Wörter wie "alle", "gesamt" oder
"endgültig" können sich zu einem lernbaren Muster verdichten, wenn sie
nur in Distraktoren auftauchen. Die robusteste Gegenmaßnahme ist nicht
eine feste, im Voraus definierte Verbotsliste, sondern zwei
Vorgehensweisen kombiniert: (a) beim Verlängern/Formulieren von
Distraktoren aktiv auf konkrete, spezifische Details statt auf
absolutistische Adjektive/Pronomen zurückgreifen, und (b) gelegentlich
bewusst auch in korrekten Antworten Wörter wie "alle", "jeder" oder
"unabhängig" verwenden, wo es fachlich passt, damit kein Wort exklusiv
mit "falsch" korreliert. Für neue Beobachtungspunkte (z. B. konkrete
Zahlenangaben nur in Distraktoren) lohnt sich ein Vermerk im Brief, auch
wenn der aktuelle Review sie nicht als ausschlaggebend bewertet hat.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-015`): 243 DVK-Fragen. Nach dieser Runde (+25
`DVK-CLD`): **268**. Es fehlen noch grob 732, um die ~1000er-Zielgröße zu
erreichen. Damit ist die erste Vertiefungsrunde durch alle vier
DVK-Module (`DVK-AUT`, `DVK-NET`, `DVK-IOT`, `DVK-CLD`) abgeschlossen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review):
1. `DVK-PROJ`/`DVK-SEC` vertiefen (27/24, aus `CONTENT-012`, bisher noch
   nicht in der Vertiefungsrunde behandelt), danach zweite
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

- [ ] Sven liest die 25 neuen `DVK-CLD`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
