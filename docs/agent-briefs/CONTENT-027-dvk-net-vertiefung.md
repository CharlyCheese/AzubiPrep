# Brief CONTENT-027: DVK-NET vertiefen (zweite Vertiefungsrunde, Fortsetzung DVK-Module)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Fortsetzung der zweiten Vertiefungsrunde nach `CONTENT-026` (DVK-IOT):
`DVK-NET` (Netzwerktechnik/Vernetzung) von 52 auf 75 Fragen erweitert, mit
expliziter Wortzahl-Gegenprobe beim Erstentwurf.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-NET.csv` – von 52 auf 75 Fragen erweitert (neue
  IDs `DVK-NET-053` bis `-075`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (23 Fragen)

VLAN-Segmentierung, DMZ zwischen IT und OT, Managed vs. unmanaged Switches,
Media Redundancy Protocol (MRP/PROFINET), Power over Ethernet, Wireless
Site Survey, WLAN-Kanalplanung, 6LoWPAN, Thread-Protokoll, WirelessHART,
Jump Host/Fernwartungszugriff, Zero Trust in OT, Patch-Management-Dilemma
in OT, SNMP-Netzwerkmonitoring, Latenz vs. Jitter, Store-and-Forward vs.
Cut-Through-Switching, Bandbreite vs. Durchsatz, Digitaler Zwilling
(Netzwerkanforderung), EtherCAT-Funktionsprinzip ("on the fly"),
Subnetzierung, statische IP vs. DHCP bei Feldgeräten, Cloud-Anbindung via
MQTT-Broker, Antennentypen (Richt- vs. Rundstrahlantenne).

Alle Themen vorab gegen die bestehenden 52 Fragen abgeglichen; keine echten
Dopplungen (DVK-NET-074 zu MQTT-Cloud-Anbindung thematisch nah an der
bestehenden Frage 025/036 zum Publish/Subscribe-Prinzip, aber inhaltlich
klar verschieden – Cloud-Datenpfad statt Broker-Mechanik, vom Reviewer als
vertretbar eingestuft).

## QA-Ablauf – zwei Subagent-Review-Durchläufe

Anders als bei `CONTENT-025`/`CONTENT-026` (je ein Durchlauf) bestand dieser
Batch im **ersten** Durchlauf trotz Wortzahl-Gegenprobe beim Erstentwurf
NICHT:

- Fachliche Korrektheit, Ambiguität, Signalwörter und CSV-Integrität waren
  bereits im ersten Durchlauf einwandfrei.
- **Längen-Bias**: Option a (durchgängig die korrekte Antwort in diesem
  Batch) war in ca. 20 von 23 Fragen die längste oder gleichlange Option –
  ein erneut auftretendes, aber diesmal subtileres Muster als bei
  `CONTENT-024`, da die Wortzahl-Gegenprobe beim Erstentwurf offenbar nicht
  konsequent genug gegen alle drei Distraktoren gleichzeitig, sondern eher
  "gefühlt" pro Distraktor erfolgte.

16 der 23 Zeilen wurden daraufhin gezielt nachgeschärft (Distraktoren um
passende Zusatzdetails verlängert, in einigen Fällen zusätzlich Option a
gekürzt: v. a. `DVK-NET-064`, `-065`, `-067`, `-068`, `-071`). Ein
**zweiter** Subagent-Review-Durchlauf bestätigte danach BESTEHT:

- Längen-Bias behoben – in keiner der 23 Zeilen ist Option a mehr klarer
  Ausreißer (≥2 Wörter länger als jeder Distraktor).
- Keine neuen Signalwörter durch die Nachschärfung eingeschleust (auf die
  vollständige AGENTS.md-Liste geprüft).
- Bedeutung/fachliche Korrektheit in allen 16 bearbeiteten Zeilen erhalten;
  kein nachgeschärfter Distraktor wurde dadurch versehentlich plausibel.
- CSV-Integrität weiterhin einwandfrei.

`validate-content.mjs`: 2181 Fragen, 26 Dateien, 0 Fehler (beide Durchläufe).

**Lehre für künftige Runden**: Eine "gefühlte" Wortzahl-Gegenprobe pro
Distraktor beim Erstentwurf reicht nicht zuverlässig aus – das Risiko ist
ein Muster, bei dem die korrekte Antwort *im Batch-Durchschnitt* trotzdem
am längsten bleibt, auch wenn einzelne Distraktoren im Einzelvergleich nah
dran wirken. Zuverlässiger ist ein expliziter Wortzahl-Vergleich aller vier
Optionen gegeneinander pro Frage (nicht nur "klingt ähnlich lang"), wie er
im zweiten Durchlauf bei der Nachschärfung angewendet wurde.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

DVK-Gesamtstand nach dieser Runde: `DVK-CLD` 62, `DVK-NET` jetzt 75,
`DVK-PROJ` 52, `DVK-SEC` 74, `DVK-AUT` 75, `DVK-IOT` 75. Nächster Schritt:
`DVK-PROJ` (52) oder `DVK-CLD` (62) als letztes verbleibendes DVK-Modul
dieser Runde.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 23 neuen `DVK-NET`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-NET` von 52 auf 75 Fragen erweitert. Zwei Subagent-Review-Durchläufe
nötig (Längen-Bias im ersten Durchlauf gefunden und in 16 Zeilen
nachgeschärft, zweiter Durchlauf bestanden). `validate-content.mjs`: 2181
Fragen, 0 Fehler. Sven hat die neuen Fragen stichprobenartig fachlich
gegengelesen und freigegeben (2026-09-24).
