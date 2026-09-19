# Brief CONTENT-018: DVK-PROJ vertiefen (Runde 7, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der Vertiefungsphase nach `CONTENT-017` (DVK-SEC): sechstes und
letztes DVK-Modul dieser ersten Vertiefungsrunde, `DVK-PROJ`
(Projektmanagement für IT-/CPS-Projekte), von 27 auf 52 Fragen erweitert.
Damit sind alle sechs DVK-Module (`AUT`/`NET`/`IOT`/`CLD`/`SEC`/`PROJ`)
einmal vertieft. Diese Runde bestand den ersten Subagent-Review bereits
ohne weiteren Korrekturzyklus – ein Ergebnis der von Anfang an angewandten
Selbstprüfung mit wortgrenzengenauem Regex-Matching.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-PROJ.csv` – von 27 auf 52 Fragen erweitert (neue
  IDs `DVK-PROJ-028` bis `-052`).

## Neue Themen (25 Fragen)

Projektorganisation & Rollen (4, Projektleiter-Aufgaben, Lastenheft vs.
Pflichtenheft, Lenkungsausschuss, RACI-Matrix), Risikomanagement im Projekt
(4, Risikoidentifikation, Risikomatrix, Risikostrategien inkl.
Risikoübertragung, Frühwarnindikatoren), Agiles vs. klassisches
Projektmanagement (4, Wasserfallmodell, Product-Owner-Rolle, Sprint,
Eignung klassischer Ansätze), Stakeholder-Management (3,
Stakeholder-Analyse, Kommunikationsplan, Umgang mit widersprüchlichen
Anforderungen), Ressourcen- & Terminplanung (4, kritischer Pfad,
Pufferzeiten, Ressourcenkonflikte, Meilensteine), Änderungsmanagement/
Change Requests (3, Zweck des Change-Request-Prozesses, Auswirkung auf
den Projektplan, Dokumentationspflicht), Projektabschluss & Evaluation (3,
Abschlussbericht, Lessons Learned, Bewertung des Projekterfolgs).

## QA-Ablauf – ein Subagent-Review-Durchlauf, mehrere Selbstprüfungs-
Iterationen vorab

Nach dem Erstentwurf zeigte die eigene quantitative Selbstprüfung (wort-
grenzengenaues Regex-Matching, Lehre aus `CONTENT-017`) 26 Treffer der
bekannten Füllwortliste und eine Längenrichtung von 22/25 (88 %) – wie in
jeder bisherigen Runde zunächst deutlich über dem Zufallsniveau. Drei
eigene Korrekturiterationen (konkrete Detailformulierungen statt
Wort-Ersetzung, anschließend gezielte Längenanpassung an den Fragen mit
größter Differenz) senkten dies auf 0 Füllwort-Treffer und eine
Längenrichtung von 28 % (7/25), bevor der erste Review angefragt wurde.

1. **Erster Subagent-Review**: **BESTEHT** direkt beim ersten Durchlauf –
   kein weiterer Korrekturzyklus nötig. Alle 25 korrekten Antworten
   fachlich bestätigt (u. a. die häufige Verwechslungsfalle Lastenheft/
   Pflichtenheft in `DVK-PROJ-029` korrekt aufgelöst, die vier
   Risikostrategien in `DVK-PROJ-034` korrekt zugeordnet). Kein Distraktor
   als ebenfalls vertretbar/richtig bewertet. Längen-Bias unauffällig
   (7/25 längste = 28 %, 2/25 kürzeste = 8 %, beide nahe Zufallsniveau).
   Füllwort-Scan: nur 5 schwache, nicht systematische Treffer gefunden
   (3 in Distraktoren, 2 in korrekten Antworten) – kein ausnutzbares
   Muster wie in den Vorrunden.
2. **Zwei Beobachtungspunkte des Reviewers, nicht ausschlaggebend**:
   (a) `DVK-PROJ-039`, Distraktor c ("räumlich verteiltes Team in
   unterschiedlichen Zeitzonen") ist als Grund für klassisches statt
   agiles Vorgehen etwas dünner begründet als die übrigen Distraktoren –
   für eine künftige Politur vermerkt. (b) In 8 der 25 Fragen (u. a.
   `-028`, `-030`, `-031`, `-040`, `-043`, `-046`, `-050`, `-052`) tragen
   Distraktoren durchgängig technische Begriffe ("Programmierung",
   "Quellcode", "Serverhardware", "Rechenzentrum"), während korrekte
   Antworten nie diese Begriffe enthalten – laut Reviewer inhaltlich
   gerechtfertigt, da das Modul gezielt die Abgrenzung
   Projektmanagement-Rolle vs. technische Rolle prüft (z. B. `-028` fragt
   explizit danach), aber als möglicher lernbarer Hinweis für künftige
   Runden vermerkt, falls sich das Muster modulübergreifend verstärkt.
3. `validate-content.mjs` nach der Erweiterung ausgeführt: ein Formatfehler
   im eigenen Build-Skript gefunden und behoben (Spalte `fachrichtung`
   fälschlich klein geschrieben "dvk" statt "DVK", Spalte `schwierigkeit`
   fälschlich numerisch "2"/"3" statt "leicht"/"mittel"/"schwer" – beides
   vor dem Review korrigiert). Danach durchgehend 0 Fehler, zuletzt 1961
   Fragen gesamt (26 Dateien, 26 Module, 4 Fachrichtungen), keine
   Duplikate.

**Lehre für künftige Runden**: Die in `CONTENT-017` eingeführte, wort-
grenzengenaue Selbstprüfung (statt reiner Teilstring-Suche) plus das
gezielte Ausbalancieren der Längenrichtung an den größten Ausreißern
(statt gleichmäßiger kleiner Anpassungen an allen 25 Fragen) hat diese
Runde erstmals beim ersten Review bestehen lassen, ohne weiteren
Korrekturzyklus. Neu als Lehre für künftige Build-Skripte: die festen
Spaltenwerte für `fachrichtung` (Großschreibung, z. B. "DVK") und
`schwierigkeit` (Textwerte "leicht"/"mittel"/"schwer", keine Zahlen)
sollten beim Schreiben neuer Zeilen aus einer bestehenden Zeile derselben
Datei abgeleitet oder zumindest vor dem ersten `validate-content.mjs`-Lauf
gegen eine bestehende Zeile abgeglichen werden, um diesen Fehlertyp künftig
gar nicht erst entstehen zu lassen.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-017`): 293 DVK-Fragen. Nach dieser Runde (+25
`DVK-PROJ`): **318**. Es fehlen noch grob 682, um die ~1000er-Zielgröße zu
erreichen. Damit ist die erste Vertiefungsrunde durch alle sechs
DVK-Module (`DVK-AUT`, `DVK-NET`, `DVK-IOT`, `DVK-CLD`, `DVK-SEC`,
`DVK-PROJ`) abgeschlossen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review):
1. Zweite Vertiefungsrunde für alle sechs DVK-Module reihum (je weitere
   ~25 Fragen pro Modul), bis DVK sich der ~1000er-Zielgröße nähert –
   oder, alternativ, direkt mit FISI beginnen und DVK-Runde 2 später
   fortsetzen (Sven kann die Reihenfolge vorgeben).
2. FISI vertiefen (`FISI-BET` 36 kleinstes FISI-Modul, dann `FISI-PROJ`
   30, `FISI-NET`/`FISI-SYS` 51, `FISI-SEC` 55).
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `DVK-PROJ`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
