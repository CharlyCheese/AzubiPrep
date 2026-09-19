# Brief CONTENT-015: DVK-IOT vertiefen (Runde 4, Vertiefungsphase)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-19

## Ziel (1–3 Sätze)

Fortsetzung der Vertiefungsphase nach `CONTENT-014` (DVK-NET): drittes
DVK-Modul vertiefen, `DVK-IOT` (IoT-Grundlagen für Digitale Vernetzung),
von 27 auf 52 Fragen erweitert. Diese Runde wendet die aus `CONTENT-014`
gewonnene Lehre (quantitative Selbstprüfung vor dem Review) von Anfang an
an und zeigt zugleich, dass auch eine Selbstprüfung falsch kalibriert
sein kann, wenn sie die falsche Kennzahl misst.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-IOT.csv` – von 27 auf 52 Fragen erweitert (neue
  IDs `DVK-IOT-028` bis `-052`).

## Neue Themen (25 Fragen)

Echtzeitbetriebssysteme/RTOS (4, FreeRTOS, Task-Scheduling nach Fristen,
Watchdog-Timer), Cloud-IoT-Plattformen (4, AWS IoT Core/Azure IoT Hub,
Device Twin, MQTT vs. HTTP, Geräte-Zertifikate/X.509), Digitaler Zwilling
(3, Simulation/Überwachung, Datenbasis, vorausschauende Wartung), sichere
Firmware-Updates (4, Secure Boot, Code Signing, Rollback-Risiko,
A/B-Partitionierung), Energy Harvesting (3, Definition, piezoelektrische
Wandlung, Energiespeicher-Kombination), Interoperabilität & Standards (4,
Matter, Thread/IEEE 802.15.4, praktischer Nutzen, Zigbee 3.0), Geräte-
provisionierung & Device Management (3, Provisioning, zentrale
Geräteverwaltung, Isolierung kompromittierter Geräte).

## QA-Ablauf – Selbstprüfung vor Review, ein Korrekturzyklus nötig

Ein technischer Zwischenfall beim ersten Schreibversuch ist dokumentiert,
weil er für künftige Runden relevant ist: Ein Python-Build-Skript öffnete
die Zieldatei im Schreibmodus, bevor alle neuen Zeilen validiert waren,
und ein einzelnes, ungewöhnliches Feld (eine bereits vorher bestehende,
korrekt gequotete Zeile mit einem Semikolon im Erklärungstext,
`DVK-IOT-013`) löste eine zu strenge Prüfung aus – die Datei wurde dabei
auf 12 Zeilen abgeschnitten. Behoben durch Wiederherstellung der
Originaldatei von Svens Rechner (dort noch unverändert, da vor diesem
Vorfall nichts ausgeliefert worden war) und Umstellung des Build-Skripts
auf: (a) alle Zeilen vor dem Schreiben vollständig validieren, (b) in
eine temporäre Datei schreiben und erst bei Erfolg per `os.replace` an
den Zielpfad verschieben, (c) Semikolons in Feldern nicht mehr als Fehler
behandeln, da `csv.writer` sie automatisch korrekt quotet und der
App-Parser (`backend/src/csv.js`) quote-bewusst ist.

Inhaltlich:

1. **Eigene quantitative Selbstprüfung vor dem ersten Review** (Lehre aus
   `CONTENT-014`): Skript prüfte Signalwörter in Distraktoren und die
   *durchschnittliche* Längendifferenz zwischen korrekter Antwort und
   Distraktoren – Ergebnis unauffällig (Ø +6,8 Zeichen), Batch wurde zum
   Review freigegeben.
2. **Erster Review**: keine fachlichen Fehler, aber **die
   Selbstprüfung hatte die falsche Kennzahl gemessen** – der Reviewer
   stellte richtig fest, dass nicht der Durchschnittswert zählt, sondern
   die *Richtung*: die korrekte Antwort war in 24 von 25 Fragen länger
   als der Distraktor-Durchschnitt, was bei kleiner mittlerer Differenz
   trotzdem eine ~96%ige Rate-Strategie ("wähle immer die längste
   Option") ermöglicht. Zusätzlich hatte die Selbstprüfung neue
   Absolutheits-Signalwörter ("sämtlich", "komplett", "einzig", "jede")
   übersehen, die beim Verlängern der Distraktoren unbeabsichtigt
   eingeführt wurden – derselbe Fehlertyp wie beim ersten,
   gescheiterten Fixversuch in `CONTENT-014`.
3. **Korrektur**: alle betroffenen Distraktoren mit konkreten, neutralen
   Detailergänzungen (keine Absolutheits-Wörter) verlängert oder gekürzt,
   bis die Richtung über den Batch ausgeglichen war (14 länger / 10
   kürzer / 1 gleich lang, statt vorher 24/1/0), alle Absolutheits-
   Signalwörter aus den Distraktoren entfernt oder umformuliert.
   Eigene Nachmessung: Ø-Differenz −0,08 Zeichen, maximale Differenz nur
   noch 6,7 Zeichen.
4. **Zweiter, bestätigender Review**: **BESTEHT** – die korrekte Antwort
   ist nur noch in 4 von 25 Fragen (16 %) die längste Option, unter dem
   Zufallsniveau von 25 % bei vier Optionen. Keine der geprüften
   Signalwörter kommt noch in den Distraktoren vor. Fachlich weiterhin
   keine Fehler.
5. `validate-content.mjs` nach jeder Korrekturrunde erneut ausgeführt:
   durchgehend 0 Fehler, zuletzt 1886 Fragen gesamt (26 Dateien, 26
   Module, 4 Fachrichtungen), keine Duplikate.

**Lehre für künftige Runden (Ergänzung zu `CONTENT-014`)**: Die
Selbstprüfung vor dem Review muss die *Richtung* des Längenmusters messen
(wie viele Fragen haben die korrekte Antwort als längste Option?), nicht
nur die durchschnittliche Zeichendifferenz – ein kleiner Mittelwert kann
trotzdem eine fast durchgängig positive Richtung verstecken, die als
Rate-Heuristik genauso ausnutzbar ist. Außerdem: Beim Verlängern von
Distraktoren zum Längenausgleich müssen die bekannten Signalwörter aktiv
vermieden werden (Verlängerung nur mit konkreten, inhaltlichen Details –
Ort, Gerät, Zeitangabe –, nie mit Absolutheits-Adjektiven).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu 1000 DVK-Fragen – Stand & nächste Schritte

Vorher (nach `CONTENT-014`): 218 DVK-Fragen. Nach dieser Runde (+25
`DVK-IOT`): **243**. Es fehlen noch grob 757, um die ~1000er-Zielgröße zu
erreichen.

Vorschlag für die Fortsetzung (gemäß Svens Freigabe, jeweils eigener
Brief, konsequent mit Subagent-Review, plus quantitativer
Selbstprüfung mit Richtungs-Kennzahl vor jedem Review):
1. `DVK-CLD` vertiefen (aktuell 37, letztes DVK-Modul dieser ersten
   Vertiefungsrunde), dann `DVK-PROJ`/`DVK-SEC` (27/24, aus
   `CONTENT-012`).
2. Danach FISI vertiefen (`FISI-BET` 36 kleinstes FISI-Modul, dann
   `FISI-PROJ` 30, `FISI-NET`/`FISI-SYS` 51, `FISI-SEC` 55).
3. Danach DPA vertiefen (`DPA-ANA`/`DPA-DS`/`DPA-PRO`/`DPA-PROJ` je
   ~26–27, `DPA-DB` mit 118 bereits vergleichsweise stark).
4. Danach FIAE vertiefen (`FIAE-SWE` 49, `FIAE-TST` 40, `FIAE-UX` 52,
   `FIAE-PRG` 74, `FIAE-DB` 118).
5. Iterativ weiter in Runden von je ca. 25–30 Fragen pro Modul, bis alle
   vier Fachrichtungen bei ~1000 Fragen liegen.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `DVK-IOT`-Fragen fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` + `npm test` von Sven zur
      Bestätigung.
- [ ] Bei DB-Betrieb: `migrate-content-to-db.mjs` mit
      `INITIAL_REVIEW_STATUS=ungeprueft` für die neuen Fragen ausführen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Sven hat die erzeugten Fragen stichprobenartig gegengelesen (2026-09-19) und keine Beanstandungen gefunden. Task als abgeschlossen markiert.
