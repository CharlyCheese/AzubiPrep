# Brief CONTENT-019: FISI-BET vertiefen (Runde 1, FISI-Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Beginn der Vertiefungsphase für die Fachrichtung FISI (Fachinformatiker
Systemintegration), im Anschluss an die abgeschlossene erste
DVK-Vertiefungsrunde (`CONTENT-013` bis `-018`): erstes und kleinstes
FISI-Modul, `FISI-BET` (Betriebssysteme/IT-Betrieb), von 36 auf 61 Fragen
erweitert. Diese Runde zeigt erneut, wie hoch der Aufwand für
Längenrichtungs- und Füllwort-Ausbalancierung bei einem frisch entworfenen
Batch ist (Ausgangswert 100 % Längen-Bias, 38 Füllwort-Treffer), bestand
aber nach der Korrektur den ersten Subagent-Review ohne weiteren Zyklus.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-BET.csv` – von 36 auf 61 Fragen erweitert (neue
  IDs `FISI-BET-037` bis `-061`).

## Neue Themen (25 Fragen)

Windows-Server-Administration vertieft (4, Dienste/services.msc, Registry,
Ereignisanzeige, Server-Manager), Linux-Prozess- & Berechtigungsverwaltung
vertieft (4, nice-Wert, systemd-Units, SUID-Bit, Cronjobs), Virtualisierung
vertieft (4, Typ-1 vs. Typ-2-Hypervisor, Snapshot, Live-Migration,
Overcommitment), Container-Technologie (4, Container vs. VM, Docker-Image
vs. Container, Docker-Volumes, Orchestrierung/Kubernetes), Backup- &
Recovery-Strategien vertieft (3, inkrementell vs. differenziell,
3-2-1-Regel, RTO), Patch- & Update-Management (3, Zweck, Testumgebung vor
Rollout, Wartungsfenster), Active Directory vertieft (3, Gruppenrichtlinien/
GPOs, Organisationseinheiten/OUs, Vertrauensstellungen/Trusts).

## QA-Ablauf – ein Subagent-Review-Durchlauf nach umfangreicher
Vorab-Korrektur

Der Erstentwurf wurde diesmal bewusst zügig geschrieben, um die eigene
Selbstprüfung als Korrektiv zu testen – mit entsprechend deutlichem
Ausgangsbefund: 38 Füllwort-Treffer (wortgrenzengenau) und eine
Längenrichtung von 25/25 (100 %) – die korrekte Antwort war in JEDER
Frage die längste Option, da beim Entwerfen die Distraktoren durchgängig
kürzer gehalten wurden. Zwei Korrekturiterationen waren nötig:

1. **Erste Iteration**: umfassende Neuformulierung praktisch aller 75
   Distraktor-Texte (nicht nur der mit Füllwörtern markierten) mit
   konkreten Detailergänzungen, um sowohl die Füllwörter zu entfernen als
   auch die Längen an die jeweils korrekte Antwort anzugleichen. Ergebnis:
   Füllwort-Treffer von 38 auf 2 gesenkt, Längenrichtung von 100 % auf
   60 % (15/25).
2. **Zweite Iteration**: die verbliebenen 2 Füllwort-Treffer behoben,
   anschließend die 8 Fragen mit der größten Längendifferenz gezielt
   durch Verlängerung des jeweils kürzesten Distraktors ausgeglichen
   (Detailergänzungen, keine neuen Absolutheits-Wörter). Ergebnis vor dem
   Review: 0 Füllwort-Treffer, Längenrichtung 32 % (8/25, nahe
   Zufallsniveau von 25 %).
3. **Erster Subagent-Review**: **BESTEHT** direkt beim ersten Durchlauf.
   Alle 25 korrekten Antworten fachlich bestätigt (u. a. nice-Wert-Bereich
   -20 bis 19, SUID-Bit-Beispiel `passwd`, Overcommitment-Definition,
   inkrementell/differenziell-Abgrenzung, 3-2-1-Regel, RTO-Definition mit
   Abgrenzung zu RPO). Kein Distraktor als ebenfalls vertretbar bewertet.
   Füllwort-Scan (auch mit zusätzlich vom Reviewer ergänzten Kandidaten
   wie "immer"/"nie"/"niemals"/"unwiderruflich"/"lediglich"): Vorkommen
   nahezu ausgeglichen zwischen richtigen (16 %) und falschen Antworten
   (13,3 %) – kein ausnutzbares Muster. Längen-Bias: 8/25 (32 %) längste
   Option korrekt, vom Reviewer als statistisch nicht auffällig bei
   n = 25 bewertet (z ≈ 0,8).
4. `validate-content.mjs` nach der Korrektur ausgeführt: 0 Fehler, 1986
   Fragen gesamt (26 Dateien, 26 Module, 4 Fachrichtungen), keine
   Duplikate.

**Lehre für künftige Runden**: Ein zügig geschriebener Erstentwurf ohne
längen-/füllwortbewusste Formulierung von Anfang an erzeugt einen deutlich
höheren Korrekturaufwand (hier: 100 % Ausgangs-Längen-Bias) als ein von
Beginn an sorgfältig ausbalancierter Entwurf (vgl. `CONTENT-018`, dort
ebenfalls hoher Ausgangswert von 88 %, aber mit gezielterer Erstformulierung
niedrigerer Füllwort-Anteil). Für künftige Module bleibt die Kombination
aus (a) von Anfang an längenbewusster Formulierung und (b) sofortiger
eigener Selbstprüfung vor dem ersten Review der effizienteste Weg – ein
"schnell entwerfen, danach alles reparieren"-Ansatz funktioniert zwar
(dieser Batch bestand am Ende ohne zweiten Review-Zyklus), kostet aber
deutlich mehr Korrekturiterationen als ein von Anfang an sorgfältiger
Entwurf.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

FISI-Gesamtstand vor dieser Runde: unbekannt (nicht gesondert erfasst),
nach dieser Runde `FISI-BET` bei 61 Fragen. Dies ist die erste
FISI-Vertiefungsrunde nach Abschluss der ersten DVK-Vertiefungsrunde
(318 DVK-Fragen, siehe `CONTENT-018`).

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review):
1. `FISI-PROJ` vertiefen (aktuell 30, nächstkleinstes FISI-Modul), danach
   `FISI-NET`/`FISI-SYS` (je 51), danach `FISI-SEC` (55).
2. Danach zweite Vertiefungsrunde für die sechs DVK-Module reihum, bis
   sich DVK der ~1000er-Zielgröße nähert (oder parallel zu FISI, je nach
   Svens Präferenz).
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `FISI-BET`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
