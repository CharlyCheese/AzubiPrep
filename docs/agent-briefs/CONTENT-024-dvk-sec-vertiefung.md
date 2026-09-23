# Brief CONTENT-024: DVK-SEC vertiefen (Start zweite Vertiefungsrunde, DVK-Module)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Start der zweiten Vertiefungsrunde (nach Abschluss der ersten FISI-Runde in
`CONTENT-019`–`CONTENT-023`) für die sechs DVK-Module, reihum beginnend mit
dem kleinsten Modul: `DVK-SEC` (IT-Sicherheit für cyber-physische Systeme/
OT), von 49 auf 74 Fragen erweitert.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-SEC.csv` – von 49 auf 74 Fragen erweitert (neue
  IDs `DVK-SEC-050` bis `-074`). Diese Datei hat **kein** `lernfeld`-Feld
  (anders als die FISI-SEC-Dateien), 14 Standardspalten. Stil der Datei ist
  deutlich ausführlicher/szenariobasierter als bei den FISI-Modulen (CPS/
  OT-Kontext, meist 15-20 Wörter je Frage-Stamm).

## Neue Themen (25 Fragen)

Secure Boot/Firmware-Integrität, Purdue-Modell (Netzwerkarchitektur),
Security-Awareness-Schulung für Produktionspersonal, Fail-Safe vs.
Fail-Secure, Redundanz/Hochverfügbarkeit, WLAN/Bluetooth-Risiken in OT,
Edge Computing vs. Cloud-Verarbeitung, unternehmensinterne PKI,
Backup-Strategie für SPS-Programme, Lieferketten-/Fremdkomponenten-Risiko,
Verschlüsselung ruhender Daten auf Edge-Geräten, OT-spezifisches
Intrusion-Detection (Anomalieerkennung), VPN für Fernwartungszugänge,
Asset-Management/Inventarisierung, RBAC, Disaster Recovery vs. Business
Continuity, Secure SDLC für eingebettete Systeme, zentrales Logging in
OT-Netzen, Threat Modeling, Legacy-Systeme ohne moderne Sicherheits-
funktionen, OTA-Firmware-Updates, Produktzertifizierung nach IEC 62443,
Container-/Virtualisierungs-Isolation auf Edge-Geräten, DoS gegen
Feldbus-Kommunikation, Schatten-IT im Produktionsnetzwerk.

Alle 25 Themen wurden vor dem Schreiben gegen die bestehenden 49 Fragen
abgeglichen, um Dopplungen zu vermeiden (u. a. mit bereits vorhandenen
Themen wie IEC-62443-Grundlagen, Security by Design, physische Sicherheit).

## QA-Ablauf – vier Subagent-Review-Durchläufe

Anders als bei den FISI-Vertiefungsrunden brauchte dieser Batch **vier**
Durchläufe statt ein bis zwei, weil der erste Entwurf trotz bewusster
Vorab-Beachtung der AGENTS.md-Lehre zu Längen-Bias/Füllwörtern erneut
systematisch dagegen verstieß:

1. **Erster Review**: fachlich/inhaltlich BESTEHT (alle 25 Fragen korrekt,
   u. a. Purdue-Modell, Fail-Safe/-Secure, IEC-62443-Zertifizierung per
   Websuche gegen SentinelOne/Palo Alto/Fortinet/Claroty/Allegion/exida
   u. a. verifiziert), aber **NICHT BESTANDEN**: Längen-Bias bei 76 % der
   Fragen (19/25) und Absolutheits-Signalwörter (auch über die vier in
   AGENTS.md genannten Beispiele hinaus – u. a. "vollständig", "jede(r)",
   "nie", "sämtliche", "überhaupt") bei ca. 72 % der Fragen. Zusätzlich
   inhaltliche Nähe zwischen DVK-SEC-063 (Asset-Management) und -074
   (Schatten-IT) angemerkt.
2. **Erste Korrektur**: alle 25 Distraktoren wortzahlmäßig an die korrekte
   Antwort angeglichen, Absolutheits-Wörter durch neutralere Formulierungen
   ersetzt ("in der Praxis", "meist", "im Regelfall" etc.), DVK-SEC-074
   inhaltlich auf "Umgehung von Freigabeprozessen" geschärft (statt reiner
   Unbekanntheit wie bei 063).
3. **Zweiter Review**: Längen-Bias von 76 % auf 32 % (8/25 Fragen) reduziert,
   Signalwörter weitgehend behoben, 063/074-Abgrenzung als gelungen
   bestätigt – aber weiterhin **NICHT BESTANDEN** wegen der verbliebenen
   8 Fragen (052, 054, 055, 058, 059, 067, 069, 070).
4. **Zweite Korrektur**: gezielte Nachbesserung dieser 8 Fragen.
5. **Dritter Review**: 6 von 8 Fragen jetzt im Toleranzkorridor, aber
   DVK-SEC-059 und -070 weiterhin außerhalb (~30-36 % länger) und in -070
   ein neues Signalwort ("jede") durch die Korrektur selbst eingeführt –
   **NICHT BESTANDEN**.
6. **Dritte Korrektur**: gezielt nur noch diese 2 Fragen nachgebessert.
7. **Vierter Review**: beide Fragen jetzt bei max. 3 Wörtern Differenz
   (Zielkorridor ±2-3 Wörter), keine Absolutheits-Signalwörter mehr –
   **BESTEHT**.

`validate-content.mjs` nach jeder Änderung ausgeführt: durchgehend 0
Fehler, 2111 Fragen final (26 Dateien, 26 Module, 4 Fachrichtungen).

**Lehre für künftige Runden**: Die in `AGENTS.md` dokumentierte Regel zu
Längen-Bias/Füllwörtern *vorab* zu beachten reicht allein nicht aus, wenn
die korrekte Antwort naturgemäß eine vollständige, präzise Erklärung
braucht (typisch für den ausführlicheren DVK-SEC-Stil) und Distraktoren
dagegen "spontan kürzer" formuliert werden. Wirksamer war die **explizite
Wortzahl-Gegenprobe pro Frage** (alle vier Optionen zählen, Zielkorridor
±2-3 Wörter) statt nur "gefühlt vergleichbar" zu formulieren. Außerdem:
Absolutheits-Wörter sind nicht auf die vier in AGENTS.md genannten
Beispiele beschränkt – bei der Korrektur selbst können neue hinzukommen
("jede" wurde in einer Korrekturrunde versehentlich neu eingefügt), das
braucht denselben kritischen Blick wie der Erstentwurf.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

DVK-Gesamtstand nach dieser Runde: `DVK-AUT` 51, `DVK-CLD` 62, `DVK-IOT` 52,
`DVK-NET` 52, `DVK-PROJ` 52, `DVK-SEC` jetzt 74. Nächster Schritt gemäß
Fortsetzungsplan aus `CONTENT-022`/`-023`: weitere DVK-Module reihum
vertiefen (z. B. `DVK-AUT`, `DVK-IOT`, `DVK-NET`, `DVK-PROJ`, dann `DPA`
und `FIAE`).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 25 neuen `DVK-SEC`-Fragen fachlich gegen (stichprobenartig).
- [ ] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-SEC` von 49 auf 74 Fragen erweitert. Vier Subagent-Review-Durchläufe
nötig (Längen-Bias + Absolutheits-Signalwörter in den ersten drei Runden
gefunden, in der vierten Runde bestätigt behoben). `validate-content.mjs`:
2111 Fragen, 0 Fehler. Svens stichprobenartige fachliche Gegenlese steht
noch aus (kein Abschluss-Blocker, siehe `AGENTS.md`-Regel zu
`CONTENT`-Briefs).
