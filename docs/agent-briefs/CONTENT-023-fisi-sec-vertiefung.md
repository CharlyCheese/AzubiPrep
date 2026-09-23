# Brief CONTENT-023: FISI-SEC vertiefen (Runde 5, Abschluss erste FISI-Vertiefungsrunde)

Status: done
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

## Zweite Teilrunde (17 Fragen, FISI-SEC-240–256) – nach Kontingent-Reset

Themen bewusst außerhalb der bereits stark abgedeckten Grundlagen gewählt
(gegen `FISI-SEC.csv` UND `IT-SEC-GRUND.csv` auf Dopplungen geprüft): CSRF,
Zero Trust, EDR, PAM, Netzwerksegmentierung/VLAN, Incident-Response-Phasen,
DLP, MDM, WPA3 vs. WPA2, Supply-Chain-Angriff, Insider-Bedrohung, Privilege
Escalation, Cyber Kill Chain, Certificate Pinning, OCSP, Passkeys/FIDO2,
Security Hardening.

**Subagent-Review, 1. Durchlauf**: fachlich/inhaltlich BESTEHT (alle 17
Fragen korrekt, eindeutig, curricular passend, per Websuche gegen BSI/NIST/
OWASP u. a. verifiziert), aber **NICHT BESTANDEN** wegen systematischem
Längen-Bias bei 13 von 17 Fragen (korrekte Antwort durchgängig die
längste/ausführlichste Option – Rateindikator, bleibt auch nach dem
Frontend-Mischen bestehen). Betroffene IDs: 240, 241, 242, 243, 244, 246,
249, 250, 251, 253, 254, 255, 256.

**Korrektur**: Distraktoren bei allen 13 IDs inhaltlich ausgebaut/verlängert
(nicht die korrekte Antwort gekürzt, um keine fachliche Substanz zu
verlieren), dabei auch einige Absolutheits-Formulierungen ("zuverlässig
verhindert", "rein kosmetisch ohne Sicherheitsrelevanz") entschärft.

**Subagent-Review, 2. Durchlauf (frischer Subagent)**: **BESTEHT**. Bei
keiner der 13 Fragen ist die korrekte Antwort mehr auffällig länger als die
Distraktoren, keine neuen fachlichen Fehler oder Ambiguitäten durch die
Umformulierung. Einziger optionaler Hinweis (kein Pflicht-Finding):
FISI-SEC-250 hat in allen drei Distraktoren Absolutheits-Wörter ("immer",
"nur", "jeder"/"zuverlässig"), während die korrekte Antwort keines enthält –
bei Gelegenheit könnte das noch abgeschwächt werden.

`validate-content.mjs` nach Abschluss beider Teilrunden: 2086 Fragen, 26
Dateien, 0 Fehler, keine Duplikate.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

FISI-Gesamtstand nach `CONTENT-023`: `FISI-BET` 61, `FISI-PROJ` 55,
`FISI-NET` 76, `FISI-SYS` 76, `FISI-SEC` 80. Damit ist die **erste
FISI-Vertiefungsrunde über alle fünf FISI-Module abgeschlossen**
(`CONTENT-019`–`CONTENT-023`). Nächster Schritt laut Plan aus
`CONTENT-022`: zweite Vertiefungsrunde für die sechs DVK-Module reihum.

## Verbleibender Hinweis für künftige Runden

`FISI-SEC-nnn` teilt sich weiterhin den ID-Namensraum mit
`IT-SEC-GRUND.csv` (aktuell höchste ID: `FISI-SEC-256`) – vor jeder neuen
Runde beide Dateien auf höchste ID und Themenüberschneidung prüfen.
Optionaler Nachbesserungspunkt aus dieser Runde: FISI-SEC-250 Distraktoren
etwas neutraler formulieren (siehe oben), nicht dringend.

Svens stichprobenartige fachliche Gegenlese steht wie bei den Vorrunden
noch aus (kein Blocker für die Archivierung, siehe Vorgehen bei
`CONTENT-022`/`CONTENT-023`, Ergebnis-Abschnitt).

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

`FISI-SEC` von 55 auf 80 Fragen erweitert (2 Teilrunden, 8 + 17 Fragen).
Beide Teilrunden über frische Subagent-Reviews mit Websuche geprüft; die
zweite Runde brauchte eine Korrekturiteration wegen Längen-Bias, danach
bestanden. `validate-content.mjs`: 2086 Fragen, 0 Fehler. Damit ist die
erste FISI-Vertiefungsrunde (alle fünf FISI-Module) abgeschlossen. Svens
stichprobenartige fachliche Gegenlese steht noch aus (kein Abschluss-
Blocker, siehe `AGENTS.md`/`ORCHESTRATOR.md`-Regeln zu `CONTENT`-Briefs).
