# Brief CONTENT-021: FISI-NET vertiefen (Runde 3, FISI-Vertiefungsphase)

Status: in Arbeit
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der FISI-Vertiefungsphase nach `CONTENT-020` (FISI-PROJ): drittes
FISI-Modul, `FISI-NET` (Netzwerktechnik), von 51 auf 76 Fragen erweitert.
Erster Subagent-Review direkt bestanden, allerdings erst nach einer
deutlich aufwendigeren Selbstprüfungsphase als in den Vorrunden, da der
Erstentwurf erneut mit extremem Längen-Bias (100 %) und vielen
Füllwort-Treffern startete.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-NET.csv` – von 51 auf 76 Fragen erweitert (neue
  IDs `FISI-NET-238` bis `-262`). Diese Datei hat als eine von zwei
  FISI-Dateien (neben `FISI-SEC`) seit `CONTENT-007` eine zusätzliche,
  optionale Spalte `lernfeld` – die neuen Zeilen sind konsequent mit
  `lernfeld=LF11b` befüllt, damit die Datei strukturell einheitlich bleibt.

## Neue Themen (25 Fragen)

VPN vertieft (4, Site-to-Site vs. Client-to-Site, IPsec vs. SSL/TLS-VPN,
Tunneling-Protokoll-Funktion, Authentifizierung der Endpunkte),
Netzwerkvirtualisierung (4, Software-Defined Networking, VXLAN, Netzwerk-
vs. Servervirtualisierung, virtueller Switch), Infrastruktur vertieft (4,
Spanning Tree Protocol, Hochverfügbarkeit durch Redundanz, Load Balancing,
strukturierte Verkabelung nach EN 50173), Monitoring vertieft (4, SNMP,
Syslog, Traffic-Analyse/NetFlow, Schwellenwerte für Warnmeldungen), VLAN
vertieft (3, 802.1Q-Trunking, Inter-VLAN-Routing, Sicherheitsvorteil der
VLAN-Segmentierung), Routing vertieft (3, Metrik, Distanzvektor vs.
Link-State, Default-Route), Protokolle vertieft (3, DHCP-Ablauf DORA,
rekursive DNS-Auflösung, NTP).

## QA-Ablauf – ein Subagent-Review-Durchlauf, aufwendige Selbstprüfung

Der Erstentwurf zeigte in der eigenen quantitativen Selbstprüfung einen der
bisher extremsten Ausgangsbefunde: 47 wortgrenzengenaue Füllwort-Treffer
und eine Längenrichtung von 100 % (25/25) – die korrekte Antwort war in
jeder einzelnen der 25 Fragen die mit Abstand längste Option, da beim
Formulieren durchgängig ausführlichere, technisch präzisere Sätze für die
korrekte Antwort und kürzere Kurzsätze für die Distraktoren verwendet
wurden.

1. **Erste Korrekturiteration**: umfassende Neuformulierung praktisch aller
   75 Distraktor-Texte mit zusätzlichen plausiblen Detailergänzungen, um
   sowohl Füllwörter zu entfernen als auch die Längen an die jeweils
   korrekte Antwort anzugleichen. Ergebnis: Füllwort-Treffer von 47 auf 4
   gesenkt, Längenrichtung von 100 % auf 68 % (17/25).
2. **Zweite Korrekturiteration**: die verbliebenen 4 Füllwort-Treffer
   behoben (u. a. neue Vorkommen, die durch die erste Verlängerungsrunde
   selbst entstanden waren), anschließend gezielt sieben weitere Fragen mit
   noch zu großer Längendifferenz durch Verlängerung des jeweils kürzesten
   Distraktors nachbearbeitet. Ergebnis vor dem Review: 0 Füllwort-Treffer,
   Längenrichtung 40 % (10/25).
3. **Subagent-Review**: **BESTEHT** direkt beim ersten Durchlauf. Alle 25
   korrekten Antworten fachlich bestätigt, inkl. gezielter Prüfung
   mehrerer nahliegender Verwechslungsfallen (u. a. `FISI-NET-258`s
   Behauptung, Link-State benötige *weniger* Konfigurationsaufwand als
   Distanzvektor, und `FISI-NET-255`s Behauptung, VLANs unterstützten keine
   IP-Adressierung – beide programmatisch als tatsächlich falsch
   bestätigt, nicht nur ungeschickt formuliert). Keine wiederverwendeten
   oder themenfremden Distraktor-Texte gefunden (explizit auf Duplikate
   über den gesamten 25er-Batch geprüft). Füllwort-Rate praktisch
   identisch zwischen korrekten Antworten (0,32 je Option) und
   Distraktoren (0,307 je Option) – kein ausnutzbares Muster. Längen-Bias
   40 % (10/25), unterhalb der vom Reviewer selbst gesetzten
   Auffälligkeitsschwelle von ca. 55–60 %.
4. **Ein nicht blockierender Hinweis des Reviewers**: einige Distraktoren
   (`FISI-NET-239a` Bluetooth-Verwechslung, `FISI-NET-240d`
   Kabelverlegung, `FISI-NET-242b` drahtlose Racks) sind eher offensichtlich
   falsch statt plausibel nahliegend, was diese einzelnen Fragen etwas
   leichter macht als ideal – als reine Schwierigkeitsgrad-Kalibrierung
   vermerkt, kein fachlicher oder struktureller Mangel.
5. `validate-content.mjs` nach der Erweiterung ausgeführt: 0 Fehler, 2036
   Fragen gesamt (26 Dateien, 26 Module, 4 Fachrichtungen), keine
   Duplikate.

**Lehre für künftige Runden**: Trotz der in `CONTENT-018`–`-020`
etablierten Praxis, von Anfang an längen- und füllwortbewusst zu
formulieren, ist erneut ein Erstentwurf mit extremem Ausgangs-Bias (100 %,
47 Treffer) entstanden – offenbar reicht die reine Absicht "darauf achten"
nicht zuverlässig aus, ohne die eigene quantitative Selbstprüfung
tatsächlich unmittelbar nach dem Entwurf laufen zu lassen und gezielt auf
die größten Ausreißer zu reagieren (wie in `CONTENT-018` beschrieben). Die
Kombination aus (a) Neuformulierung mit Detailergänzung statt reiner
Wort-Ersetzung und (b) gezielter zweiter Iteration nur für die größten
verbleibenden Längenausreißer bleibt der zuverlässigste Weg, ein Bestehen
im ersten Review-Durchlauf zu erreichen. Zusätzlich bestätigt: Dateien mit
optionaler `lernfeld`-Spalte (aus `CONTENT-007`) brauchen eine eigene
Prüfung der Spaltenanzahl im Build-Skript (hier 15 statt der sonst
üblichen 14 Spalten) – ein einfacher `assert len(r) == 14` hätte sonst
fälschlich abgebrochen; künftige Build-Skripte sollten die Spaltenanzahl
immer aus der bestehenden Kopfzeile der Zieldatei ableiten statt fest zu
kodieren.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

FISI-Gesamtstand: `FISI-BET` 61, `FISI-PROJ` 55, `FISI-NET` jetzt 76.
Katalog gesamt nach dieser Runde: 2036 Fragen (26 Dateien, 26 Module, 4
Fachrichtungen).

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review):
1. `FISI-SYS` vertiefen (aktuell 51), danach `FISI-SEC` (55).
2. Danach zweite Vertiefungsrunde für die sechs DVK-Module reihum.
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `FISI-NET`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Ein Subagent-Review-Durchlauf, direkt bestanden. `validate-content.mjs`
bestätigt 2036 Fragen, 0 Fehler. Wartet auf Svens fachlichen Gegenlese.
