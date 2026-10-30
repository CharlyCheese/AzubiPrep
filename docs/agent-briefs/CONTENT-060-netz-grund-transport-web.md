# Brief CONTENT-060: NETZ-GRUND – Transportprotokolle, DNS und HTTP-Betriebsfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

NETZ-GRUND von 186 auf 210 Fragen erweitern.
24 neue SC-Anwendungsfragen ALLE-NETZ-GRUND-001 bis
ALLE-NETZ-GRUND-024 anfügen. Fachrichtung ALLE, Lernfeld LF9.
Bisherige Datensätze und IDs unverändert erhalten.
Neue gemeinsame IDs erhalten einen eigenen ALLE-Namensraum, weil vorhandene
FISI-IDs über gemeinsame und spezifische Module verteilt sind.

## Betroffene Dateien

- `content/questions/NETZ-GRUND.csv`
- `docs/agent-briefs/CONTENT-060-netz-grund-transport-web.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Technische Versionen/Annahmen klar nennen, nur Lernmodelle behandeln.
Keine Geräteänderungen oder Netzwerkbefehle der Aufgaben ausführen.
Primärquellen tatsächlich recherchieren und zuordnen.

- https://www.rfc-editor.org/rfc/rfc9293
- https://www.rfc-editor.org/rfc/rfc9110
- https://www.rfc-editor.org/rfc/rfc9111

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Global eindeutige IDs, Modul-/Fachrichtungs-/Lernfeldzuordnung passend.
- [x] Lösungen und Erklärungen eindeutig, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate; plausible nahe Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen ALLE-NETZ-GRUND-001 bis -024 angehängt, Modul 186 → 210, ALLE/LF9.
Unabhängiger Vollreview durch content060_review mit Webrecherche und Nachprüfungen BESTANDEN. Nahe HTTP-Status-Distraktoren in 019, Formulierung in 013 und fünf falsche Signalwort-Verwendungen korrigiert. Rechenwerte 1472 Byte und 420 ms bestätigt.
Quellenzuordnung: 001–003 RFC 9293; 004/005 RFC 768 plus genannte IPv4-Headerannahme; 006 eigene Latenzrechnung; 007 RFC 1035; 008/011 RFC 2308; 009 RFC 9499; 010 RFC 2782; 012–016/019–021 RFC 9110; 016–018 RFC 9111; 022 RFC 9113; 023 RFC 9114; 024 RFC 7239.
Direkte Primärquellen: https://www.rfc-editor.org/rfc/rfc9293 ; https://www.rfc-editor.org/rfc/rfc9110.txt ; https://www.rfc-editor.org/rfc/rfc9111 ; https://www.rfc-editor.org/rfc/rfc2308 ; https://www.rfc-editor.org/rfc/rfc9114
Eigener ALLE-Namensraum verhindert Kollisionen mit alten FISI-NET-IDs. Altbestand erhalten. Keine Datenbankimporte, Builds, Commits oder Pushes. Content-Validierung, git diff --check und Archivierungscheck erfolgreich.
