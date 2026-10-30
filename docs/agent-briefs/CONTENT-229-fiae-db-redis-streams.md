# Brief CONTENT-229: FIAE-DB – Redis Streams

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-DB-263 bis -286 ergänzen; Modul 262 → 286.
Stream-IDs, Lesegrenzen und Consumer-Group-Verarbeitung unterscheiden.

## Betroffene Dateien

- `content/questions/FIAE-DB.csv`
- `docs/agent-briefs/CONTENT-229-fiae-db-redis-streams.md`
- `docs/agent-briefs/CONTENT-CHECKPOINT.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 262 Altstämme gelesen; globale Nachbarsuche ohne Stream-Verträge.
Frische redis.io-Originaldokumentation: XADD, XRANGE, XREAD, XGROUP CREATE,
XREADGROUP, XACK, XPENDING und XCLAIM. Bestehende Redis-String-/Set-/Listen-
und Transaktionsfragen nicht wiederholen. 14 Felder.
Altpräfix 108982 Byte SHA256:
0ce92ee480540f1d0a685760fc5e3df8719c9f0045cde4a9e280049f1b8d741d.
Nach Vollreview Checkpoint für 215–229 aktualisieren (6609 → 6969,
15 × 24); gesonderter frischer Checkpoint-Review. Keine tatsächlichen
Redis-Befehle, Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 eindeutige SC-Zeilen, Altpräfix und globale IDs erhalten.
- [x] Eindeutige zusätzliche Lernziele mit frischen Primärbelegen.
- [x] Plausible Distraktoren ohne Antwort-Tells oder Lernzielduplikate.
- [x] Unabhängiger Vollreview mit eigener Recherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.
- [x] Checkpoint aktualisiert und gesondert unabhängig geprüft.

## Ergebnis

24 Fragen ergänzt; FIAE-DB 286, Gesamtkatalog nach diesem Batch 6969.
Frischer Reviewer content229_review prüfte acht Originalquellen,
alle 262 Altstämme und sämtliche 24 Endzeilen. Längenvorsprung in
-281 bis -284/-286 und unplausible Optionen in -285 behoben; vollständige
Endfassung freigegeben. App-Parser: 14 Felder und globale IDs korrekt,
Altpräfix exakt erhalten. Validator, Diff- und Archivprüfung bestanden.
Separater frischer checkpoint229_review bestätigte ohne Findings
alle 15 Batchzahlen/Altpräfixe, 26 HEAD-Präfixe, Schemas, ID-Maxima,
Archivstand und sachliche Dokumentation des Checkpoints 215–229.
