# Brief CONTENT-113: DVK-AUT – CODESYS-Standardfunktionen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-AUT-136 bis -159 ergänzen, Modul 135 → 159.
CODESYS-ST-Zeichenketten, Standardzähler und bistabile Bausteine sowie
arithmetische Operationen anhand klarer Simulatorfälle lesen.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-113-dvk-aut-codesys-standardfunktionen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 135 Modulaltstämme gelesen,
globale Lernzielsuche über 26 CSV. Alte 112–135 behandeln ST-Kontrollfluss,
Arrays, Bitoperationen und Auswahloperatoren; diese nicht wiederholen.
Eigene Recherche an content.helpme-codesys.com, Standard-Bibliothek
und CODESYS Development System. Keine reale Steuerung ansprechen.
Keine Laufzeit vorhanden/ausgeführt behaupten oder etwas installieren.
Alter Byte-Präfix 79994 Byte, SHA256:
65c13eb32fe7fd36cd089b9ebaf7fd55508ac09e99cbbbfe4eda6ca43e7061f8.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, eindeutige IDs, 14 Felder und Altbytes erhalten.
- [x] Baustein-/Operatorprämissen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 159, Katalog 4185 zum Batchabschluss.
App-Parser: 159 Records mit 14 Feldern, genau 24 neue IDs136–159.
79994 Altbytes unverändert, SHA256 oben. Validator und Diff grün.
String- und Zahlenfälle zusätzlich mit unabhängigen Python-Rechnungen
nachvollzogen; dies ist ausdrücklich keine CODESYS-Laufzeitausführung.

Frischer Reviewer `content113_review`: alle 24 Vollfragen und135 Altstämme
gelesen, globale Suche über26 CSV. Eigene aktuelle CODESYS-Webprüfung
sämtlicher verwendeter Standardfunktionen, Zähler, RS/SR, F_TRIG,
STRING und arithmetischer Operatoren. Ursprüngliche154 war semantisch
doppelt zu FIAE-PRG093; durch implizite Divisionsprüfung CheckDivInt
ersetzt. Eigene und unabhängige Nachrecherche zu CheckDivInt, CheckBounds,
CheckPointer und CheckRangeSigned, neue gespeicherte154 vollständig
nachgelesen und freigegeben. Übrige23 ohne Befund.
Keine verbleibenden Lernzielduplikate, Fachfehler oder bindenden Antwort-Tells.
Keine Steuerung angesprochen, nichts installiert oder ausgeführt.
