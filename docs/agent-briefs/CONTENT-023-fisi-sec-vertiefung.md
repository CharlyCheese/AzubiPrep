# Brief CONTENT-023: FISI-SEC vertiefen (Runde 5, Abschluss erste FISI-Vertiefungsrunde)

Status: in Arbeit
Bereich: CONTENT
Angelegt: 2026-09-21

## Ziel (1–3 Sätze)

Fortsetzung der FISI-Vertiefungsphase nach `CONTENT-022` (FISI-SYS): fünftes
und letztes Modul der ersten FISI-Runde, `FISI-SEC` (IT-Sicherheit
fachrichtungsspezifisch), von 55 auf Zielgröße ~80 Fragen erweitern.
Bewusst in kleinen, einzeln validierten Häppchen begonnen, da das
wöchentliche Nutzungskontingent bei Start bei 91 % lag – Priorität: Datei
darf zu keinem Zeitpunkt in einem ungültigen Zwischenzustand landen, auch
wenn die Sitzung abbricht.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-SEC.csv` – bisher 55 auf 63 Fragen erweitert
  (erste Teilrunde, neue IDs `FISI-SEC-232` bis `-239`).

## Wichtige Besonderheit dieser Datei: geteilter ID-Raum

Anders als bei `FISI-SYS` (`CONTENT-022`) teilt sich `FISI-SEC.csv` den
ID-Namensraum `FISI-SEC-nnn` mit `content/questions/IT-SEC-GRUND.csv`
(Fachrichtungsübergreifendes Grundlagenmodul, `fachrichtung=ALLE`) – beide
Dateien enthalten historisch verzahnte ID-Bereiche. Vor jeder neuen ID-Vergabe
**beide Dateien** auf die höchste vorhandene Nummer prüfen, nicht nur
`FISI-SEC.csv` selbst (führte in dieser Runde initial zu zwei ID-Kollisionen
mit `IT-SEC-GRUND.csv`, vor dem Validierungslauf korrigiert). Ebenso vorher
grob gegenlesen, ob ein geplantes Thema in `IT-SEC-GRUND.csv` bereits
vorkommt (dort initial 3 von 8 Themen als Dopplung erkannt: 2FA, Penetrations-
test, Brute-Force – durch Sandboxing, WAF und Air Gap ersetzt).

## Erste Teilrunde (8 Fragen) – neue Themen

Authentifizierung/Methoden-Bereich ergänzt um bisher fehlende Konzepte:
Sandboxing, Phishing (Social Engineering, generische Definition), Web
Application Firewall (WAF), Zero-Day-Exploit, Air Gap, DDoS- vs.
DoS-Unterscheidung, PKI/Public-Key-Infrastruktur, Least-Privilege-Prinzip.

`validate-content.mjs` nach dieser Teilrunde: 2069 Fragen, 26 Dateien,
0 Fehler, keine Duplikate.

## Subagent-Review der ersten Teilrunde (8 Fragen, FISI-SEC-232–239)

Frischer Subagent ohne Gesprächskontext, mit den 8 tatsächlichen CSV-Zeilen
(nicht nur Zusammenfassung), WebSearch gegen aktuelle Quellen (BSI, OWASP,
Cloudflare, Fortinet, Radware u. a.). **Ergebnis: BESTEHT**, direkt beim
ersten Durchlauf, keine Korrekturiteration nötig.

- Fachliche Korrektheit aller 8 Fragen inkl. Musterlösung bestätigt.
- Keine Ambiguität (keine zweite plausibel korrekte Option je Frage).
- Kein Füllwort-Muster ("ausschließlich"/"grundsätzlich"/"automatisch"/
  "gesetzlich vorgeschrieben") in den Distraktoren gefunden.
- Kein flächendeckender Längen-Bias: nur bei 2 von 8 Fragen (FISI-SEC-232
  Sandboxing, FISI-SEC-236 Air Gap) ist die korrekte Antwort spürbar länger
  als die Distraktoren – laut Reviewer kein Pflicht-Finding, da nicht "die
  meisten" Fragen betroffen, aber als Beobachtung für künftige Teilrunden
  festgehalten (bei Gelegenheit kürzen).
- Keine inhaltliche Redundanz zwischen den 8 Fragen.

## Noch offen (nächste Teilrunden)

- Weitere ~17 Fragen bis Zielgröße ~80 (nächste ID ab `FISI-SEC-240`,
  wieder gegen `IT-SEC-GRUND.csv` prüfen).
- Diese erste Teilrunde ist inhaltlich/fachlich fertig geprüft, der Brief
  bleibt aber `in Arbeit`, bis das Modul insgesamt seine Zielgröße erreicht
  hat (kein Teil-Abschluss laut Workflow).
- Svens stichprobenartige fachliche Gegenlese steht für die gesamte Runde
  noch aus, sobald alle Teilrunden fertig sind (siehe Vorgehen bei
  `CONTENT-022`).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Alle neuen Fragen fachlich korrekt (inkl. Websuche gegen aktuelle
      Quellen).
- [ ] Kein Längen-Bias/Füllwort-Muster zwischen korrekter Antwort und
      Distraktoren (siehe `AGENTS.md`).
- [ ] Keine inhaltliche Dopplung zu bestehenden Fragen in `FISI-SEC.csv`
      oder `IT-SEC-GRUND.csv`.
- [ ] `validate-content.mjs` fehlerfrei.
- [ ] Sven liest die neuen Fragen stichprobenartig fachlich gegen.

## Ergebnis (wird beim Abschluss ausgefüllt)

Noch offen – erste Teilrunde (8 Fragen) abgeschlossen und validiert, Rest
folgt in weiteren Häppchen.
