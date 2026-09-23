# Brief CONTENT-026: DVK-IOT vertiefen (zweite Vertiefungsrunde, Fortsetzung DVK-Module)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Fortsetzung der zweiten Vertiefungsrunde nach `CONTENT-025` (DVK-AUT):
`DVK-IOT` (Internet of Things/Embedded Systems) von 52 auf 75 Fragen
erweitert, wieder mit expliziter Wortzahl-Gegenprobe beim Erstentwurf.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-IOT.csv` – von 52 auf 75 Fragen erweitert (neue
  IDs `DVK-IOT-053` bis `-075`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (23 Fragen)

LPWAN-Grundlagen, LoRaWAN (Chirp-Spread-Spectrum), NB-IoT vs. LoRaWAN,
Bluetooth Low Energy, Mesh-Netzwerke (Zigbee), Edge Computing im IoT, Fog
Computing als Zwischenschicht, IoT-Gateway-Funktion, Privacy by Design,
DSGVO-Relevanz bei Sensordaten, UART, PWM/Tastgrad, Entprellung
(Debouncing), Sensorfusion, Sensorkalibrierung, TinyML/Edge AI,
Deep-Sleep-Modus, Bootloader-Funktion, Staged Rollout bei Firmware-
Updates, Mirai-Botnet als Fallbeispiel, Zeitsynchronisation (NTP),
Abtasttheorem/Sampling Rate, redundante Sensoren.

Alle Themen vorab gegen die bestehenden 52 Fragen abgeglichen.

## QA-Ablauf – ein Subagent-Review-Durchlauf, danach leichte Nachschärfung

Wie schon bei `CONTENT-025` (DVK-AUT) BESTAND der Batch bereits im
**ersten** Durchlauf:

- Fachliche Korrektheit bestätigt (u. a. LPWAN/LoRaWAN/NB-IoT-Abgrenzung,
  Mesh-Netzwerk, Fog vs. Edge Computing, TinyML, Mirai-Botnet-Fakten 2016,
  PWM-Tastgrad, Abtasttheorem/Nyquist).
- Keine Ambiguität.
- **Längen-Bias: kein systematisches Muster** – die Wortzahl-Gegenprobe
  beim Erstentwurf funktioniert jetzt zuverlässig über zwei Module hinweg.
- Absolutheits-Signalwörter: vereinzelt in 5 von 23 Fragen ("in jedem
  Fall", "stets", "dauerhaft", "nie" x2, "alle") – als Findung gemeldet,
  im Anschluss nachgeschärft (053c, 054c, 057c, 062c, 068b/d), ohne
  erneuten vollständigen Review (reine Wortkorrekturen, kein Wechsel der
  korrekten Antwort oder des Fachinhalts).
- Redundanz: keine echten Dopplungen; leichte inhaltliche Nähe zwischen
  072 (Mirai-Botnet) und der bestehenden Frage 009 (Standardpasswort-
  Risiko) angemerkt (gleicher Kernlernpunkt, aber mit historischem
  Fallbeispiel als didaktischem Mehrwert) – vom Reviewer als vertretbar,
  kein Bestehens-Hindernis eingestuft, bewusst unverändert gelassen.

`validate-content.mjs`: 2158 Fragen, 26 Dateien, 0 Fehler.

**Lehre bestätigt (aus `CONTENT-024`/`-025`)**: Die explizite Wortzahl-
Gegenprobe beim Erstentwurf verhindert zuverlässig den systematischen
Längen-Bias – das Restrisiko liegt inzwischen fast ausschließlich bei
einzelnen, verstreuten Absolutheits-Wörtern, die auch bei sorgfältigem
Schreiben gelegentlich durchrutschen und gezielt gegengelesen werden
müssen (nicht nur die vier AGENTS.md-Beispielwörter).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

DVK-Gesamtstand nach dieser Runde: `DVK-CLD` 62, `DVK-NET` 52, `DVK-PROJ`
52, `DVK-SEC` 74, `DVK-AUT` 75, `DVK-IOT` jetzt 75. Nächster Schritt:
`DVK-NET` oder `DVK-PROJ` (beide noch bei 52).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 23 neuen `DVK-IOT`-Fragen stichprobenartig fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-IOT` von 52 auf 75 Fragen erweitert. Ein Subagent-Review-Durchlauf,
direkt bestanden (kein Längen-Bias mehr), fünf einzelne Signalwörter im
Anschluss nachgeschärft. `validate-content.mjs`: 2158 Fragen, 0 Fehler.
Svens stichprobenartige fachliche Gegenlese steht noch aus (kein
Abschluss-Blocker).
