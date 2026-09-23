# Brief CONTENT-029: DVK-CLD vertiefen (Abschluss zweite DVK-Vertiefungsrunde)

Status: done
Bereich: CONTENT
Angelegt: 2026-09-23

## Ziel (1–3 Sätze)

Abschluss der zweiten DVK-Vertiefungsrunde nach `CONTENT-028` (DVK-PROJ):
`DVK-CLD` (Cloud Computing) von 62 auf 75 Fragen erweitert – letztes DVK-
Modul dieser Runde, damit liegen nun alle sechs DVK-Module bei 74/75
Fragen.

## Betroffene Dateien (exakte Pfade)

- `content/questions/DVK-CLD.csv` – von 62 auf 75 Fragen erweitert (neue
  IDs `DVK-CLD-063` bis `-075`). Kein `lernfeld`-Feld, 14 Standardspalten.

## Neue Themen (13 Fragen)

Kubernetes Service-Objekt, ConfigMap vs. Secret, Rolling Update,
Blue-Green Deployment, Disaster Recovery (RPO vs. RTO), Content Delivery
Network (CDN), API-Gateway in Microservices, Message Queue/ereignis-
getriebene Architektur, Availability Zone vs. Region, Object Storage vs.
Block Storage, Data Lake vs. Data Warehouse, Idempotenz bei Cloud-APIs,
Vertical Pod Autoscaler (VPA) vs. Horizontal Pod Autoscaler.

Alle Themen vorab gegen die bestehenden 62 Fragen abgeglichen (u. a.
Kubernetes Pod/Deployment/HPA/Namespace, Multi-Cloud/Hybrid-Cloud,
Cloud-Sicherheit/IAM, Serverless/FaaS, Cloud-Migration, Monitoring/
Observability, CI/CD-Grundlagen/Canary/IaC, Kostenoptimierung bereits
vorhanden) – keine Dopplungen, bewusst mehrere Distraktoren so gewählt,
dass sie verwandte, bereits vorhandene Konzepte querabgrenzen (z. B.
Blue-Green-Frage mit Canary-Distraktor, RPO-Frage mit RTO-Distraktor,
VPA-Frage mit HPA-Distraktor).

## QA-Ablauf – ein Subagent-Review-Durchlauf, drei gezielte Wortkorrekturen

Der Batch bestand im ersten Durchlauf mit einem Finding:

- Fachliche Korrektheit bestätigt (Kubernetes-Konzepte, Deployment-
  Strategien, RPO/RTO-Abgrenzung, CDN, API-Gateway, Message-Queue-
  Entkopplung, Availability Zone vs. Region, Object- vs. Block-Storage,
  Data Lake vs. Data Warehouse, Idempotenz).
- Keine Ambiguität, keine Redundanz zu Bestandsfragen.
- **Längen-Bias**: kein Fund – in keiner der 13 Zeilen war Option a ≥2
  Wörter länger als jeder Distraktor (die erste sorgfältige Wortzahl-
  Gegenprobe beim Erstentwurf über alle vier Optionen hinweg, wie seit
  `CONTENT-027` angewendet, hat hier sofort funktioniert).
- **Signalwörter**: "zwingend" tauchte als wiederkehrendes Füllwort in
  drei aufeinanderfolgenden Distraktoren auf (`DVK-CLD-072`, `-073`,
  `-074`) – nicht auf der AGENTS.md-Beispielliste, aber funktional
  identisch als Verrater-Muster, weil es dreimal hintereinander erkennbar
  wurde. Zusätzlich "rein" einmal in `DVK-CLD-064` als kleinere
  Randbeobachtung. Alle vier Stellen durch neutralere Formulierungen
  ersetzt.

Reine Wortkorrekturen ohne Wechsel der korrekten Antwort oder des
Fachinhalts – kein erneuter vollständiger Review-Durchlauf nötig (gleiches
Vorgehen wie bei `CONTENT-025`/`-026`/`-028`).

`validate-content.mjs`: 2217 Fragen, 26 Dateien, 0 Fehler. Während des
Erstentwurfs wurden außerdem zwei versehentlich eingefügte Strichpunkte
innerhalb von `erklaerung`-Texten (Zeilen 066/067) durch die Validierung
sofort abgefangen und vor dem Review korrigiert (Spaltenverschiebung durch
das CSV-Trennzeichen `;` im Fließtext).

**Was ich NICHT prüfen kann**: siehe `CONTENT-008`.

## Weg zu ~1000 Fragen je Fachrichtung – Stand nach dieser Runde

DVK-Gesamtstand, zweite Vertiefungsrunde abgeschlossen: `DVK-CLD` jetzt 75,
`DVK-NET` 75, `DVK-PROJ` 75, `DVK-SEC` 74, `DVK-AUT` 75, `DVK-IOT` 75.
Nächster Schritt laut Fortsetzungsplan: DPA- oder FIAE-Fachrichtung als
nächste Vertiefungsrunde.

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Sven liest die 13 neuen `DVK-CLD`-Fragen stichprobenartig fachlich gegen.
- [x] Nach Freigabe: `npm run validate` von Sven zur Bestätigung.

## Ergebnis (wird beim Abschluss ausgefüllt)

`DVK-CLD` von 62 auf 75 Fragen erweitert. Ein Subagent-Review-Durchlauf,
vier kleine Nachschärfungen (wiederkehrendes Signalwort "zwingend" in drei
Zeilen, "rein" in einer weiteren), ohne erneuten vollständigen Review
behoben. `validate-content.mjs`: 2217 Fragen, 0 Fehler. Damit ist die
zweite DVK-Vertiefungsrunde für alle sechs Module abgeschlossen. Sven hat
die neuen Fragen stichprobenartig fachlich gegengelesen und freigegeben
(2026-09-24).
