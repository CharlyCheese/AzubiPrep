# Brief CONTENT-025: DVK-AUT vertiefen (zweite Vertiefungsrunde, Fortsetzung DVK-Module)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Fortsetzung der zweiten Vertiefungsrunde nach `CONTENT-024` (DVK-SEC):
`DVK-AUT` (Automatisierungstechnik/Industrie 4.0) von 51 auf 75 Fragen
erweitert. Diesmal bewusst mit expliziter Wortzahl-Gegenprobe pro Frage
schon beim Erstentwurf geschrieben (Lehre aus `CONTENT-024`), um die dort
nötigen vier Korrekturrunden zu vermeiden.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-AUT.csv` – von 51 auf 75 Fragen erweitert (neue
  IDs `DVK-AUT-052` bis `-075`). Kein `lernfeld`-Feld, 14 Standardspalten.
  Datei enthält auch FT/MC-Fragetypen im Bestand, neue Fragen bewusst
  einheitlich als SC (Single Choice) angelegt, passend zum Gros der
  bestehenden Fragen.

## Neue Themen (24 Fragen)

Ablaufsprache/SFC (IEC 61131-3), analoge vs. digitale E/A-Module, HMI-
Grundlagen, redundante Steuerungen (Hot-Standby), CE-Kennzeichnung,
Maschinenrichtlinie, Risikobeurteilung nach ISO 12100, SIL (IEC 61508) vs.
PL (ISO 13849), Not-Aus vs. Not-Halt, Verriegelung/Interlocking, Linien-
vs. Ringtopologie bei Feldbussen, Online-/Offline-Modus im Engineering-
Tool, Hardware-in-the-Loop-Simulation, Retrofit, 5G-Campusnetze in der
Produktion, additive Fertigung, fahrerlose Transportsysteme (FTS/AGV),
Machine Vision, Energiemanagement nach ISO 50001, Traceability, Losgröße
1/Mass Customization, cyber-physische Systeme (CPS-Definition), stoßfreies
Umschalten (Bumpless Transfer), Kaskadenregelung.

Alle Themen vorab gegen die bestehenden 51 Fragen abgeglichen, keine
echten Dopplungen (zwei thematisch nahe, aber inhaltlich klar verschiedene
Fragen bewusst zugelassen: Not-Aus/Not-Halt-Abgrenzung neben der
bestehenden Not-Halt-Kategorien-0/1-Frage, SIL-vs-PL-Vergleich neben dem
bestehenden PL-Grundbegriff).

## QA-Ablauf – ein Subagent-Review-Durchlauf, danach leichte Nachschärfung

Anders als bei `CONTENT-024` (DVK-SEC, 4 Runden nötig) BESTAND dieser
Batch bereits im **ersten** Review-Durchlauf:

- Fachliche Korrektheit bestätigt (Websuche u. a. für CE-Kennzeichnung/
  Selbstzertifizierung, Not-Aus vs. Not-Halt nach EN ISO 13850, SIL vs. PL).
- Keine Ambiguität, keine Redundanz zu Bestandsfragen.
- Längen-Bias: laut Reviewer "weitgehend behoben" – die explizite
  Wortzahl-Gegenprobe beim Erstentwurf hat sich ausgezahlt, kein
  systematisches Muster mehr über den Batch.
- Absolutheits-Signalwörter: deutlich reduziert gegenüber `CONTENT-024`,
  aber in ca. 10 von 24 Fragen noch vereinzelt vorhanden (v. a. "nur",
  "komplett", "lediglich", "stets") – vom Reviewer als **Qualitäts-
  empfehlung, kein Bestehens-Hindernis** eingestuft, da nicht mehr
  systematisch nur in falschen Optionen geclustert (Gegenbeispiel: eine
  korrekte Antwort enthielt selbst "jedes einzelne").

Die drei konkret empfohlenen Stellen (059c doppeltes "nur", 074b/c
Häufung von "komplett"/"lediglich", 075c "nur"/"reinen") wurden im
Anschluss noch nachgeschärft, ohne erneuten vollständigen Review-Durchlauf
(reine Wortkorrekturen ohne strukturelle Änderung, kein Wechsel der
korrekten Antwort oder des Fachinhalts).

`validate-content.mjs`: 2135 Fragen, 26 Dateien, 0 Fehler.

**Lehre für künftige Runden (bestätigt aus `CONTENT-024`)**: Die explizite
Wortzahl-Gegenprobe beim Erstentwurf (statt "gefühlt gleich lang")
reduziert den Korrekturaufwand erheblich – von 4 Runden bei DVK-SEC auf
1 Runde + Mini-Nachschärfung bei DVK-AUT. Trotzdem bleibt Absolutheits-
Sprache ("nur", "komplett", "lediglich", "stets") ein Punkt, der auch bei
sorgfältigem Erstentwurf noch mal gezielt gegengelesen werden sollte,
nicht nur die vier in `AGENTS.md` genannten Beispielwörter.

**Was ich NICHT prüfen kann**: siehe `CONTENT-008` – auch dieser Batch
ersetzt nicht Svens eigenen Fachreview vor Produktiveinsatz.

## Weg zu ~1000 Fragen je Fachrichtung – Stand & nächste Schritte

DVK-Gesamtstand nach dieser Runde: `DVK-CLD` 62, `DVK-IOT` 52, `DVK-NET`
52, `DVK-PROJ` 52, `DVK-SEC` 74, `DVK-AUT` jetzt 75. Nächster Schritt
gemäß Fortsetzungsplan: eines der verbleibenden DVK-Module (`DVK-IOT`,
`DVK-NET` oder `DVK-PROJ`, alle bei 52).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Sven liest die 24 neuen `DVK-AUT`-Fragen stichprobenartig fachlich gegen.
- [ ] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-AUT` von 51 auf 75 Fragen erweitert. Ein Subagent-Review-Durchlauf,
direkt bestanden (Längen-Bias-Lehre aus `CONTENT-024` erfolgreich
angewendet), drei empfohlene Formulierungen im Anschluss nachgeschärft.
`validate-content.mjs`: 2135 Fragen, 0 Fehler. Svens stichprobenartige
fachliche Gegenlese steht noch aus (kein Abschluss-Blocker).
