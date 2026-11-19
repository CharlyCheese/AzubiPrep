# FE-070 – Optionale Lernbegleitung im LF1-Pilot

Status: done
Bereich: FE
Angelegt: 2026-11-10

## Ziel

R3 aus dem Lernreiseplan: begrenztes Fachgespräch zu den drei festen LF1-
Reflexionsfragen sowie zusätzliche Erklärungen zu den vier Theorieblöcken.
Vorhandene Anbieterauswahl ohne KI / lokales Qwen / eigenes ChatGPT verwenden.
Die feste Selbstreflexion bleibt vollständig nutzbar, die Mini-Prüfung unverändert.

## Allowlist

- backend/src/journey-ai.js (neu)
- backend/src/ai.js (gemeinsam genutzter begrenzter Anbietertransport)
- backend/src/routes/ai.routes.js (geschützte Journey-Sitzungen)
- backend/test/journey-ai.test.js (neu)
- backend/test/api.journey-ai.test.js (neu)
- frontend/src/api/ai.js (Sitzungsaufrufe)
- frontend/src/components/JourneyTutor.jsx (neu)
- frontend/src/pages/LernreiseAbschnitt.jsx (Einbindung)
- frontend/src/styles/journey.css (Bedienung)
- frontend/public/sw.js (Versionswechsel)
- e2e/tests/journey-ai.spec.js (neu)
- docs/64-Lernreise-KI-Gespraech.md (neu)
- docs/61-Lernreise-FIAE-Planung.md (Fortschrittsverweis)
- docs/63-Lernreise-LF1-App.md (R3-Verweis)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Vertrag und Grenzen

Nur unter der vorhandenen lokalen /api/ai-Zugangsprüfung. Start:
POST /journey/start mit {topicId,version,kind:reflection|theory,targetId,
provider,model,useMaterial}; Antwort enthält sessionId, privacy:public|local-private,
opening, maxTurns und objectiveIds. Noch kein Modellaufruf beim Start.
POST /journey/turn mit {sessionId,requestId,answer}; Antwort enthält sessionId,
requestId,text,followUp,objectiveIds,turn,remainingTurns,privacy.
POST /journey/end mit {sessionId}; beendet Sitzung und laufenden Auftrag.
Optional beschreibende Metadaten nur nach gemeinsamem festem Vertrag.

Serverseitige flüchtige Sitzungen binden Anbieter, Modell, Thema, Quellenart und
Verlauf. Maximal vier Antworten pro Sitzung, begrenzte Anzahl/Lebenszeit und
Eingabe-/Ausgabelängen; wiederholte requestId erzeugt keinen zweiten Turn.
Nur öffentliche, serverseitig geladene Theorie und passende Gesprächskernpunkte
im Kontext, keine Mini-Test-Fragen/-Lösungen. Keine clientgelieferten Lernpläne.

Private RAG-Ergänzungen nur ausdrücklich und nur mit lokalem Qwen; keine
automatische Cloudalternative. Private Sitzungen bleiben über alle Folgefragen
privat. Keine Quellentitel, Dateinamen, Seiten, Originalzitate oder Auszüge im
neuen Antwortvertrag. Quellen- und Anbieterwechsel verwirft Dialog und Entwurf.
Keine privaten Inhalte, KI-Dialoge oder daraus erzeugten Bewertungen in
Reisestand, normale Sicherung, Kontosync oder öffentliche Inhalte übernehmen.
Modellausgabe ist unverbindlicher Text, kein HTML, Code oder Prüfungsurteil.

Keine neuen Abhängigkeiten, keine Originalunterlagen/.env/Kontodaten manuell lesen,
keine echten Cloudanfragen in automatischen Tests, keine Installer/Commits/Pushes.
Normale lokale App-Konfiguration bleibt bestehen. Tests mit synthetischen Quellen
und Anbieterantworten; keine privaten Testartefakte. Bestehende Änderungen erhalten.

## Abnahme

1. Fachgespräch und Theoriehilfe passend zum aktuellen LF1-Ziel; ausdrücklicher
   Start/Senden, Kontextvorschau, klare Begrenzung und Abbruch. Ohne KI unverändert.
2. Rückmeldung für korrekte, falsche, gleichwertige alternative Antworten und
   fachfremde Fragen anhand geprüfter Kernpunkte vorbereitet und getestet;
   kein starrer Stichwort-Benotungsautomat, keine Prüfungs-/Fortschrittswrites.
3. Beide bestehenden Anbieter über ihre bewährten Transport-/Zugangsgrenzen.
   Lokale Herkunft wird serverseitig gebunden, nie privat nach Cloud umgedeutet.
4. Strikte bekannte Themen-/Ziel-IDs, Modellantwortfelder und Grenzen; Ablaufzeit,
   Doppelklick, Abbruch, verspätete Antworten und Anbieter-/Quellenwechsel geprüft.
5. Synthetische private Marker weder im Cloudtransport noch im Reisestand/Export;
   private Metadaten und Rohtexte bleiben aus Antwort-DTOs und Fehlermeldungen.
6. Verständliche Fehler mit Rückweg zur festen Theorie/Selbstreflexion; Tastatur,
   schmale Ansicht und Desktopintegration. Vorhandene Reise-Regressionen grün.
7. Unabhängiger frischer Review, sachliche Dokumentation mit Modelltestgrenzen,
   Build und abschließender Archivcheck grün.

## Ergebnis

Abgeschlossen am 2026-11-10 im dokumentierten Pilotumfang.

Aufklappbares KI-Fachgespräch bei den drei Reflexionsfragen und zusätzliche
Erklärung unter den vier Theorieblöcken. Bestehende Anbieterauswahl wird genutzt;
ChatGPT verlangt eine ausdrückliche öffentliche Kontextfreigabe. Kein Modell
schließt Schritte ab oder verändert die feste Mini-Prüfung. Selbstreflexion und
Kernpunkte bleiben nutzbar, Gesprächseingaben bleiben getrennt vom Reisestand.

Geschützte Start/Turn/End-Routen mit flüchtigen, serverseitig gebundenen Sitzungen,
vier Beiträgen, 20-Minuten-Ablauf und Begrenzung auf 20 Sitzungen. Wiederholbare
Anfragekennungen, aktive Abbrüche, sichere Quellen-/Konto-/Anbieterwechsel und
strikte Ausgabeprüfung. Private Herkunft gilt für den gesamten Dialog, lokale
Materialrevisionen werden auch vor Cacheantworten geprüft. Keine privaten
Metadaten/Originalauszüge, Dialoge oder Bewertungen in allgemeine Sicherungen,
Kontosync, Cloudtransport oder öffentliche Inhalte übernommen.

Frische getrennte Reviews für Oberfläche und Backend/Datenschutz freigegeben.
Review- und Gegenprobenkorrekturen umfassen Retry nach Fehler, private Revisionen,
aktiven TTL-Ablauf, UUID-Stringtypen, private Originaltext-/Kennungssperren,
Startbereinigung und Echo-Rückmeldungen. Lokales geprüftes Qwen3 nutzt für diese
neuen Anfragen einen begrenzten Denkmodus; bestehende Hilfe und Cloudtransport
bleiben unverändert. Denkfelder und unvollständige Antworten gelangen nicht in
den Dialog.

Nachweise:
- 301/301 Backendtests, davon 28 neue Sitzungs-/API-Fälle; ESLint grün.
- 29/29 Browser-/Electronfälle: 14 neue Gesprächstests, zehn bestehende
  Journey-Fälle, fünf Anbieterregressionen; kein Retry erforderlich.
- Produktions-Build und schmale Tastatur-/Bildprobe grün; vorhandener
  Größenhinweis für Codepakete bleibt.
- Öffentliche Liveprobe mit vorhandenem Qwen3:4b: korrekte und alternative
  Antworten sowie Rollenbeschreibung anerkannt, fachliches Missverständnis
  korrigiert, fachfremde Frage zurückgeführt. Eine umfangreichere Antwort zur
  Zuständigkeit wurde am Ausgabelimit sicher zurückgewiesen; eine knappere
  Formulierung anschließend passend anerkannt. Kein stiller
  Erfolgsnachweis; Modellqualität bleibt stichprobenhaft und unverbindlich.
- Private Schutzproben ausschließlich synthetisch, Cloudtransport injiziert;
  keine echten Cloudanfragen oder Originalunterlagen für Tests.

Details und Grenzen: [KI-Gespräche](../64-Lernreise-KI-Gespraech.md).
Keine zusätzlichen Abhängigkeiten, Installer, Commits oder Pushes. Weitere
allgemeine Themen folgen als R4 mit eigenen Inhaltsbriefen und Reviews.
