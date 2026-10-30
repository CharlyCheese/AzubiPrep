# Brief CONTENT-110: FISI-SYS – systemd-Dienstbetrieb

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-SYS-149 bis -172 ergänzen, Modul 148 → 172.
Dienstabhängigkeiten, Aktivierungsverhalten, Ausführungsumgebung,
Ressourcenbegrenzung und Socket-/Timer-Aktivierung unter systemd.

## Betroffene Dateien

- `content/questions/FISI-SYS.csv`
- `docs/agent-briefs/CONTENT-110-fisi-sys-systemd-dienstbetrieb.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 148 Modulaltstämme gelesen,
globale semantische Suche über 26 CSV. Nachbarn FISI-BET-021/042/071–073,
103–109/133 nicht erneut abfragen: systemd-Grundidee, Unit, enable/start,
daemon-reload, Journalabfrage, Restart=on-failure bei Exit0, Startlimit,
Persistent-Timer, bereits aktives Timerziel, mask und PrivateTmp.
Primärquellen: https://www.freedesktop.org/software/systemd/man/latest/
systemd.{unit,service,exec,resource-control,socket,timer}.html.
Keine realen Dienste verändern, keine Linux-Laufzeit behaupten.
Alter Byte-Präfix 93244 Byte, SHA256:
a820c15dabf7a0db84852be24a4974e087ca00ae09e489889a25cbccb843c483.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, eindeutige IDs, 14 Felder und Altbytes erhalten.
- [x] Prämissen und Musterlösungen eindeutig primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 172, Katalog 4113 zum Batchabschluss.
App-Parser: 172 Records/eindeutige IDs, durchgehend 14 Felder.
93244 Altbytes mit obigem SHA256 unverändert. Validator und Diff grün.

Frischer Reviewer `content110_review`: alle 24 gespeicherten Neufragen,
alle 148 Altstämme und semantischer Abgleich über 26 CSV. Eigene Webprüfung
der einschlägigen Direktiven aller sechs im Kontext genannten Manpages.
149 war mit FISI-BET-102 doppelt und wurde durch BindsTo-Lebenszyklus
ersetzt. 150/152/158/159/160/166/168/171 sprachlich gekürzt/angeglichen,
164/172 fachferne Distraktoren durch benachbarte Dienstmodelle ersetzt.
Die vollständige gespeicherte Endfassung aller 24 Zeilen wurde erneut
gelesen und ohne offene Findings freigegeben. Keine verbleibenden
Lernzielduplikate, Längen-, Füllwort- oder strukturellen Antwort-Tells.
Keine realen Dienste geändert, keine Linux-Ausführung behauptet.
