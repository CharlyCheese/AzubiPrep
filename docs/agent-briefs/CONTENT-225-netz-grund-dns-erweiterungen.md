# Brief CONTENT-225: NETZ-GRUND – DNS-Erweiterungen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-NETZ-GRUND-073 bis -096 ergänzen; Modul 258 → 282.
Transport-, Discovery- und Diagnoseverträge der Namensauflösung unterscheiden.

## Betroffene Dateien

- `content/questions/NETZ-GRUND.csv`
- `docs/agent-briefs/CONTENT-225-netz-grund-dns-erweiterungen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 258 Altstämme gelesen; vorhandene DNS-/HTTP-/curl-Fragen beachten.
Frische globale Suche zu DoH, DoT, mDNS, DNS-SD, LLMNR, RDNSS und EDE
ohne entsprechende bestehende Fragen. RFC 8484, 7858, 6762, 6763, 4795,
8106, 8914 und 9460 vor Erstellung frisch prüfen.
15 Felder mit LF9. Historische FISI-NET-IDs bleiben unverändert.
Altpräfix 95625 Byte SHA256:
eeaa3c1b3dd1b7c887c968dbfef2b21a56636fcf654e4873efbd41952a859e30.
Keine DNS-, Mitschnitt- oder Netzwerkaktionen tatsächlich ausführen;
keine Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Zeilen, eindeutige globale IDs und Altbytes erhalten.
- [x] Präzise RFC-Verträge mit eindeutigen Lösungen und Quellen.
- [x] Plausible Distraktoren ohne Antwort-Tells oder Lernzielduplikate.
- [x] Unabhängiger Vollreview mit eigener frischer Recherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

24 Fragen ergänzt; NETZ-GRUND 282, Gesamtkatalog 6873. App-Parser prüft
15 Felder und LF9; Altpräfix und globale IDs unverändert/eindeutig.
Content-Validator und Diffprüfung bestanden. Frischer Reviewer
content225_review recherchierte alle acht RFCs unabhängig und las alle
24 Endfassungen erneut. Distraktorstruktur in -089 und die Erklärung zur
LLMNR-Eindeutigkeitsprüfung in -086 korrigiert; anschließend Freigabe ohne
verbleibende Findings. Archivcheck nach Eintragung ausführen.
