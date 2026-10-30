# Fragenkatalog – kompakter Übergabestand

Stand: 2026-10-30. Geprüfter 15-Batch-Checkpoint CONTENT-215 bis -229;
anschließend vollständig geprüfter lokaler Zielbestand 7000, siehe unten.

## Ergebnis und Prüfstatus

Ausgang dieses Abschnitts: 6609 Fragen. 15 Batches mit je 24 Fragen ergeben
+360 und insgesamt 6969 Fragen in 26 Modulen.
CONTENT-215 bis -229 haben den unabhängigen Vollreview einschließlich
erforderlicher Korrekturen bestanden. Der zusätzliche unabhängige Checkpoint-
Abgleich wurde durch checkpoint229_review ohne Findings bestätigt.
Alle Fragen stehen lokal in den CSV.

| Brief | Modul | Vorher | Nachher | Neu |
|---|---|---:|---:|---:|
| CONTENT-215 | FISI-SYS | 244 | 268 | 24 |
| CONTENT-216 | FISI-NET | 244 | 268 | 24 |
| CONTENT-217 | DVK-SEC | 242 | 266 | 24 |
| CONTENT-218 | DVK-NET | 243 | 267 | 24 |
| CONTENT-219 | DPA-DS | 243 | 267 | 24 |
| CONTENT-220 | DPA-DB | 262 | 286 | 24 |
| CONTENT-221 | FISI-BET | 253 | 277 | 24 |
| CONTENT-222 | FISI-PROJ | 247 | 271 | 24 |
| CONTENT-223 | DPA-ANA | 266 | 290 | 24 |
| CONTENT-224 | DVK-PROJ | 243 | 267 | 24 |
| CONTENT-225 | NETZ-GRUND | 258 | 282 | 24 |
| CONTENT-226 | FIAE-UX | 268 | 292 | 24 |
| CONTENT-227 | IT-SEC-GRUND | 248 | 272 | 24 |
| CONTENT-228 | DPA-PROJ | 255 | 279 | 24 |
| CONTENT-229 | FIAE-DB | 262 | 286 | 24 |

Quellen und behobene Review-Befunde stehen in den jeweiligen Briefs.
DONE.md ist das Abschlussregister, STATUS.md enthält laufende Aufgaben.
Frühere uncommittete CONTENT-039 bis -064 mit +612 bleiben erhalten.
Die Fortsetzung seit 3045 enthält +3924 Fragen. Gegenüber Git-HEAD mit
2433 Fragen enthält der Arbeitsstand +4536 Fragen.

## Verifikation

- Content-Validator: 26 Dateien, 6969 Fragen, 26 Module, 4 Fachrichtungen.
- App-Parser, Schema, global eindeutige IDs und gültige Antwortschlüssel.
- Rechnungen unabhängig nachgerechnet, soweit im jeweiligen Brief angegeben.
- Alle 15 in den Briefs 215–229 festgehaltenen Altpräfixe erneut per SHA256
  bestätigt; keine abweichenden Altbytes.
- Alle 26 inhaltlichen Git-HEAD-Präfixe mit normalisierten Zeilenenden
  unverändert geprüft; neue Inhalte wurden angehängt.
  Sechs Dateien unterscheiden sich gegenüber HEAD zusätzlich in LF/CRLF:
  DVK-PROJ, DVK-SEC, FISI-BET, FISI-NET, FISI-PROJ und FISI-SYS.
- Kein Datenbankimport, Build, Commit oder Push durchgeführt.
- Der konfigurierte Datenbankbestand ist älter als die CSV-Erweiterung.
  Ein Import ist kein Bestandteil dieses Auftrags.

Die Git-Präfixprüfung rekonstruiert keine ungesicherten uncommitteten
Zwischenstände. Für DPA-ANA-051 bis -074 und FISI-BET-062 bis -085 ist
diese Beleggrenze in CONTENT-062 beziehungsweise -066 dokumentiert.

## Wiedereinstieg und nächste Batches

Nach diesem Checkpoint ergänzen CONTENT-230 und -231 die letzten 31 Fragen.
Die untenstehenden Zahlen bezeichnen den abgeschlossenen Inhaltsstand bis 229;
spätere Anhänge aus CONTENT-230/231 gehören nicht zu diesem Checkpoint.
Vor jedem Batch aktuelle Modulfragen lesen und global Lernziele abgleichen.

DPA-ANA 290, DPA-DB 286, DPA-DS 267, DPA-PRO 267, DPA-PROJ 279.
DVK-AUT 255, DVK-CLD 267, DVK-IOT 255, DVK-NET 267, DVK-PROJ 267,
DVK-SEC 266. FIAE-DB 286, FIAE-PRG 266, FIAE-SWE 265, FIAE-TST 268,
FIAE-UX 292. FISI-BET 277, FISI-NET 268, FISI-PROJ 271, FISI-SEC 248,
FISI-SYS 268. PM 177, WISO 272, HARDWARE 291, NETZ-GRUND 282,
IT-SEC-GRUND 272. Bis 7000 fehlen 31 Fragen.

Historische FISI-NET-/FISI-SEC-IDs sind dateiübergreifend verteilt.
Globale Höchstwerte: FISI-NET-454, FISI-SEC-424, FISI-PROJ-271.
Neue IDs nie aus der Anzahl einer einzelnen Datei ableiten.
PM verwendet ALLE-PM bis -177. Gemeinsame Module:
HARDWARE ALLE-HARDWARE bis 291, NETZ-GRUND ALLE-NETZ-GRUND bis 096,
IT-SEC-GRUND ALLE-IT-SEC-GRUND bis 096.
CSV-Schemata mit 14 beziehungsweise 15 Feldern erhalten.
FIAE-SWE enthält LF11a, FISI-NET/FISI-SEC enthalten LF11b.

Jeder Batch: Brief vor Änderung, alte Zeilen erhalten, frischer Reviewer
ohne Chatverlauf mit tatsächlichen CSV-Zeilen und eigener Webrecherche,
sämtliche Findings beheben, Brief/DONE/STATUS archivieren, App-Parser,
Content-Validator, git diff --check und check-agent-briefs erfolgreich.
Antwortoptionen werden gemischt. Buchstabenverteilung ist kein Finding;
Längen-/Detaildominanz und sprachliche Distraktor-Schablonen sind es.
Distraktoren müssen fachnah und plausibel sein, keine Fantasiefunktionen.
Details und erforderlicher Review-Prompt stehen in AGENTS.md.

## Auftrag und Dokumentationsregel

Der Auftrag umfasst den fortlaufenden Ausbau auf 7000 Fragen.
Die abschließenden 31 Fragen und der Zielstand sind dokumentiert und geprüft.
Dokumentation bleibt sachlich: Auftrag, Entscheidungen, Ergebnisse und Prüfstatus.
Der Chat kann nicht selbst geleert werden; die App verdichtet automatisch.
Zum Wiedereinstieg reichen dieser Stand, AGENTS.md, STATUS.md und der
konkrete nächste Brief. Alte Chatverläufe nicht erneut vollständig laden.

## Zielabschluss nach CONTENT-231

Der lokale Katalog enthält exakt 7000 Fragen in 26 Modulen:
6920 SC, 50 MC und 30 FT mit 7000 global eindeutigen IDs.

| Brief | Modul | Vorher | Nachher | Neu |
|---|---|---:|---:|---:|
| CONTENT-230 | FIAE-PRG | 266 | 290 | 24 |
| CONTENT-231 | PM | 177 | 184 | 7 |

6969 + 24 + 7 = 7000. Alle übrigen Modulzahlen entsprechen der obigen
Checkpointliste. Seit 3045 sind 3955 Fragen ergänzt; gegenüber HEAD
mit 2433 sind es 4567. Die Differenz von 612 bleibt erhalten.
Alle 17 Altpräfixe aus 215–231 und alle 26 normalisierten HEAD-Präfixe
sind bestätigt. Der tatsächliche App-Parser und Content-Validator prüfen
alle 26 CSV-Dateien erfolgreich, ebenso die Diffprüfung.

CONTENT-230 und -231 haben den unabhängigen Vollreview bestanden;
sämtliche erforderlichen Korrekturen wurden in der Endfassung freigegeben.
Der separate frische content231_final_audit bestätigt Zielzahlen, Schemas,
Altpräfixe, Dokumentation und Archivierung ohne Findings.
Keine weiteren Fragen über den beauftragten Zielbestand hinaus ergänzen.
Beim Fragenaufbau bis CONTENT-231 wurde kein Datenbankimport, Build,
Commit oder Push durchgeführt; die anschließende DB-Spiegelung folgt unten.

## Datenbankspiegelung CONTENT-232

Die konfigurierte PostgreSQL-Datenbank enthält jetzt ebenfalls 7000 Fragen,
26 Module und vier Fachrichtungen. Fragespezifische Lernfelder werden
gespeichert, geladen und exportiert; 1335 explizite Zuordnungen bleiben erhalten.
Alle 16 Fragenfelder, sechs Modulfelder und drei Fachrichtungsfelder stimmen
vollständig mit den Original-CSV überein. Tatsächlicher DB-Ladepfad: 7000
Fragen ohne Warnungen, alle effektiven Lernfelder korrekt.

Isolierter Export/Reimport ohne Inhalts- oder Reviewmetadatenverlust.
Original-CSV-Bytes und bestehende Reviewmetadaten/Historie erhalten.
Spätfehler-Rollback und 17 Tests erfolgreich; unabhängiger Code- und
Ergebnisreview content232_review ohne Findings. Details im CONTENT-232-Brief.
Kein Build, Commit oder Push durchgeführt.
