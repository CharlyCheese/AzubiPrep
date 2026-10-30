# Brief CONTENT-193: NETZ-GRUND – curl-HTTP-Verträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-NETZ-GRUND-049 bis -072 ergänzen, Modul 234 → 258.
Konkrete curl-Regeln für Anfragekörper, Redirects, Retries und TLS/Cookies.

## Betroffene Dateien

- `content/questions/NETZ-GRUND.csv`
- `docs/agent-briefs/CONTENT-193-netz-grund-curl-http-vertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 234 Altstämme gelesen, globale curl-Suche geprüft.
Historische FISI-NET-IDs und ALLE-NETZ-GRUND001–048 unverändert erhalten;
neue IDs an 048 anschließen, nicht aus Modulanzahl ableiten. 15 Felder mit LF9.
025–048 behandeln bereits grundlegende curl-Optionen. Deren Auswahlfragen
nicht wiederholen; neue konkrete Semantik und Optionen abgrenzen.
Frische Primärrecherche in everything curl und Original-curl-Optionsdokumenten.
Keine echten Transfers/Verbindungen, Installationen, Builds, Dienste,
DB/.env, Commits oder Pushes.
Altpräfix 79953 Byte SHA256:
79b2099841d3aefd150054161c1bc686e30de8329756d44247d14cae1621de62.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes und LF9 erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen, fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, NETZ-GRUND 258, Gesamtkatalog 6105 Fragen.
Unabhängiger Reviewer content193_review prüfte alle 24 Fragen, 96 Optionen,
24 Erklärungen, 234 Altstämme und globale semantische Nachbarn in 26 CSV.
Alle 18 in der CSV verlinkten Primärquellen eigenständig frisch gelesen:
Original-curl-Dokumente json, post302, location-trusted, retry, retry-delay,
retry-max-time, form, form-string, pinnedpubkey, cookie, request,
request-target und parallel-max sowie everything curl zu Redirects,
Headern, Serverprüfung, Clientzertifikaten und neuen Cookiesitzungen.
Zwei Antwort-Tells korrigiert: 056 durchgehend numerische Dreierfolgen;
066 durchgehend gleicher Artikelanfang. Danach gespeicherter Endread
aller 24 Fragen bestanden, keine verbleibenden Findings.
App-Parser: 258 Records, 15 Felder, LF9, Altpräfix-SHA unverändert.
Content-Validator: 6105 Fragen in 26 Dateien ohne Probleme. Diffcheck grün.
Keine tatsächlichen curl-Transfers ausgeführt.
