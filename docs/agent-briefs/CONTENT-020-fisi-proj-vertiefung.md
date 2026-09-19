# Brief CONTENT-020: FISI-PROJ vertiefen (Runde 2, FISI-Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der FISI-Vertiefungsphase nach `CONTENT-019` (FISI-BET): zweites
FISI-Modul, `FISI-PROJ` (Projektmanagement aus FISI-Perspektive), von 30 auf
55 Fragen erweitert. Diese Runde benötigte – anders als die drei Vorrunden –
**zwei** Subagent-Review-Zyklen, weil der erste Review mehrere konkrete
inhaltliche Mängel fand, die die rein quantitative Selbstprüfung
(Füllwörter, Längenrichtung) nicht erkennen kann.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-PROJ.csv` – von 30 auf 55 Fragen erweitert (neue
  IDs `FISI-PROJ-031` bis `-055`).

## Neue Themen (25 Fragen)

Projektorganisation & Rollen (4, Projektleiter-Aufgaben, technischer
Projektkoordinator, RACI-Matrix), Risikomanagement im Projekt (4,
Risikoidentifikation als erster Schritt, Risikostrategien, Frühwarn-
indikatoren), Agiles vs. klassisches Projektmanagement (3, Wasserfallmodell,
Product-Owner-Rolle, Eignung klassischer Ansätze), Stakeholder-Management
(3, Stakeholder-Analyse, Umgang mit Stakeholder-Konflikten), Ressourcen- &
Terminplanung (4, kritischer Pfad, Ressourcenkonflikte, Meilensteine),
Änderungsmanagement/Change Requests (3, Dokumentationspflicht genehmigter
Änderungen), Projektabschluss & Evaluation (4, Abschlussbericht,
Lessons-Learned, Bewertung des Projekterfolgs).

## QA-Ablauf – zwei Subagent-Review-Durchläufe

Nach dem Erstentwurf (Build-Skript analog zu `CONTENT-018`) zeigte die
eigene quantitative Selbstprüfung nach drei Korrekturiterationen einen
sauberen Endstand: 0 Füllwort-Treffer (wortgrenzengenau), Längenrichtung
24 % (6/25, nahe Zufallsniveau). `validate-content.mjs` bestätigte 2011
Fragen gesamt, 0 Fehler.

1. **Erster Subagent-Review: FAIL.** Trotz sauberer quantitativer Werte
   fand der Reviewer mehrere inhaltliche Probleme, die kein automatisiertes
   Wort-/Längen-Scanning erkennen kann:
   - **Kritisch**: `FISI-PROJ-052`s als korrekt markierte Antwort (b) war
     fachlich falsch und widersprach der eigenen `erklaerung` (die von
     einem Plan-Ist-Vergleich sprach, die Antwortoption aber eine
     technische Server-Beschreibung war). Ursache: eine gezielte
     `(qid, letter)`-Korrekturpatch aus einer vorherigen Selbstprüfungs-
     Iteration hatte versehentlich die falsche Zelle überschrieben (siehe
     Lehre unten).
   - **Themenfremde/grammatisch unpassende Distraktoren** (Text aus
     anderen Fragen wiederverwendet, ohne an die neue Frage angepasst zu
     werden): `FISI-PROJ-038c`, `-040a`, `-042a` (inkl. falschem Pronomen
     "Er" bei feminin-passendem Fragesubjekt "die Stakeholder-Analyse"),
     `-045b`, `-053a`.
   - **Nahezu identische Distraktoren innerhalb derselben Frage**:
     `FISI-PROJ-033` (a/b beide über Zeitablauf-Dokumentation), `-034`
     (b/c beide über Buchhaltung/Rechnungsstellung), `-035` (b/c beide
     über Versicherung).
   - **Wiederholtes identisches Satzmuster in allen drei Distraktoren
     einer Frage**: `FISI-PROJ-054` – alle drei falschen Antworten endeten
     auf dieselbe Formel ("... – das fachliche Ergebnis wird hierbei nicht
     berücksichtigt" / "... spielt hierbei keine Rolle" / sinngemäß
     gleich), wodurch die korrekte Antwort (d, ohne diese Formel) rein am
     Muster erkennbar war – unabhängig vom Inhalt.
2. **Korrektur**: gezielte `(qid, letter)`-Patches für alle oben genannten
   Zellen – `FISI-PROJ-052b` fachlich neu formuliert (Plan-Ist-Vergleich
   passend zur `erklaerung`), die fünf themenfremden Distraktoren neu und
   passend zur jeweiligen Frage geschrieben, die drei Dopplungs-Paare
   inhaltlich differenziert, `FISI-PROJ-054`s drei Distraktoren mit
   unterschiedlicher Satzstruktur (Kausal-, Konzessiv-, Relativsatz statt
   dreimal derselben Formel) neu formuliert. Erste Korrekturpatches führten
   dabei selbst vier neue Füllwort-Treffer ein ("jede", "ohne",
   "überhaupt", "aller") – im wortgrenzengenauen Re-Scan gefunden und in
   einem zweiten Korrekturdurchgang behoben. `validate-content.mjs`
   danach erneut ausgeführt: weiterhin 2011 Fragen, 0 Fehler.
3. **Zweiter Subagent-Review: BESTEHT.** Alle 25 Antworten erneut fachlich
   bestätigt, `FISI-PROJ-052` explizit als jetzt in sich konsistent
   verifiziert. Alle sechs zuvor gemeldeten Fragen (038/040/042/045/053
   sowie die drei Dopplungs-Paare 033/034/035 und 054) einzeln
   gegengeprüft und als behoben bestätigt. Längen-Bias 28 % (7/25), nahe
   Zufallsniveau. Zwei nicht blockierende Detailhinweise für eine künftige
   Politur: leichte inhaltliche Überschneidung zwischen `FISI-PROJ-038b`
   und `-038c` (beide "nach Projektabschluss"-Rahmung, aber weiterhin
   eindeutig falsch und unterscheidbar), sowie eine etwas unbeholfen
   formulierte, aber eindeutig falsche Option in `FISI-PROJ-051b`.

**Lehre für künftige Runden (zwei neue Erkenntnisse dieser Runde):**

1. **Quantitative Selbstprüfung (Füllwörter + Längenrichtung) ist
   notwendig, aber nicht hinreichend.** Sie kann nicht erkennen: fachlich
   falsche, aber formal unauffällige korrekte Antworten; themenfremd
   wiederverwendete Distraktor-Texte; inhaltliche Fast-Duplikate innerhalb
   einer Frage; oder ein einzelnes wiederholtes rhetorisches Muster über
   alle Distraktoren einer Frage hinweg. Nach jedem patch-basierten
   Korrekturdurchlauf (im Gegensatz zu einer kompletten Neuformulierung)
   ist zusätzlich ein inhaltlicher, fragenweiser Lesedurchgang nötig – der
   Subagent-Review deckt genau das ab und bleibt deshalb zwingender
   Bestandteil des Ablaufs, auch wenn die automatisierten Werte bereits
   sauber aussehen.
2. **Rotationsfalle im `build()`-Helper**: Das gemeinsame Python-Build-
   Skript verteilt die korrekte Antwort per `rot = i % 4` auf wechselnde
   Buchstaben (a/b/c/d), sodass die Reihenfolge der Distraktoren in der
   ursprünglichen `items`-Liste NICHT 1:1 der späteren CSV-Spalte
   entspricht. Eine gezielte `(qid, letter)`-Korrekturpatch, die von der
   angenommenen (statt der tatsächlich aktuellen) Zellenzuordnung ausgeht,
   kann dadurch versehentlich die falsche Zelle überschreiben – genau das
   ist in dieser Runde passiert und hat `FISI-PROJ-052`s korrekte Antwort
   korrumpiert. **Regel für alle künftigen Runden**: vor jeder gezielten
   `(qid, letter)`-Patch immer zuerst den tatsächlichen aktuellen
   Zelleninhalt aus der CSV neu einlesen und ausgeben, nie von der
   ursprünglichen Entwurfsreihenfolge ausgehen.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

FISI-Gesamtstand: `FISI-BET` 61, `FISI-PROJ` jetzt 55. Katalog gesamt nach
dieser Runde: 2011 Fragen (26 Dateien, 26 Module, 4 Fachrichtungen).

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener Brief,
konsequent mit Subagent-Review):
1. `FISI-NET`/`FISI-SYS` vertiefen (je aktuell 51), danach `FISI-SEC` (55).
2. Danach zweite Vertiefungsrunde für die sechs DVK-Module reihum.
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `FISI-PROJ`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Zwei Subagent-Review-Zyklen durchlaufen (Runde 1: FAIL mit konkreten
Korrekturpunkten inkl. eines kritischen Korrektheitsfehlers in
`FISI-PROJ-052`; Runde 2 nach Korrektur: PASS). `validate-content.mjs`
bestätigt 2011 Fragen, 0 Fehler. Sven hat die erzeugten Fragen
stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen
gefunden. Task als abgeschlossen markiert.
