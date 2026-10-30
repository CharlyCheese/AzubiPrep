# Brief CONTENT-061: IT-SEC-GRUND – Webschutz, kryptografische Verfahren und Tokenprüfung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

IT-SEC-GRUND von 176 auf 200 Fragen erweitern.
24 neue SC-Anwendungsfragen ALLE-IT-SEC-GRUND-001 bis
ALLE-IT-SEC-GRUND-024 anfügen. Fachrichtung ALLE, Lernfeld LF4.
Bisherige Datensätze und IDs unverändert erhalten.
Neue gemeinsame IDs erhalten einen eigenen ALLE-Namensraum, weil vorhandene
FISI-IDs über gemeinsame und spezifische Module verteilt sind.

## Betroffene Dateien

- `content/questions/IT-SEC-GRUND.csv`
- `docs/agent-briefs/CONTENT-061-it-sec-grund-web-krypto.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md und ORCHESTRATOR.md. Eigene Aufgaben, keine IHK-Kopien.
Technische Versionen/Annahmen klar nennen, nur Lernmodelle behandeln.
Keine Geräteänderungen oder Netzwerkbefehle der Aufgaben ausführen.
Primärquellen tatsächlich recherchieren und zuordnen.

- https://cheatsheetseries.owasp.org/
- https://www.rfc-editor.org/rfc/rfc8725
- https://csrc.nist.gov/pubs/sp/800/38/d/final

## Abnahmekriterien

- [x] Genau 24 neue SC-Fragen, Schema und alter Bestand unverändert.
- [x] Global eindeutige IDs, Modul-/Fachrichtungs-/Lernfeldzuordnung passend.
- [x] Lösungen und Erklärungen eindeutig, Rechnungen unabhängig bestätigt.
- [x] Keine Inhaltsduplikate; plausible nahe Distraktoren ohne systematische Tells.
- [x] Unabhängiger Vollreview mit tatsächlich recherchierten Primärquellen bestanden.
- [x] Content-Validierung, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen ALLE-IT-SEC-GRUND-001 bis -024 angehängt, Modul 176 → 200, ALLE/LF4.
Unabhängiger Vollreview durch content061_review mit Webrecherche und Nachprüfung BESTANDEN. Distraktoren in 015/018 verbessert, richtige Antwort 021 gekürzt. Rehash beim Login in 014 anhand OWASP bestätigt. Keine offenen fachlichen, sprachlichen oder Duplikat-Findings.
Quellenzuordnung: 001–003 RFC 8725; 004 RFC 7519; 005 RFC 7515; 006 RFC 2104; 007 NIST FIPS 186-5; 008–010 NIST SP 800-38D; 011 OWASP Cryptographic Storage; 012–014 OWASP Password Storage; 015/016 OWASP SQL Injection; 017–019 OWASP XSS; 020 OWASP CSRF; 021/022 RFC 6265; 023 OWASP REST Security; 024 OWASP SSRF.
Direkte Primärquellen: https://www.rfc-editor.org/rfc/rfc8725 ; https://csrc.nist.gov/pubs/sp/800/38/d/final ; https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html ; https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html ; https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html ; https://www.rfc-editor.org/rfc/rfc6265
Eigener ALLE-Namensraum, global eindeutige IDs, Altbestand erhalten. Keine Datenbankimporte, Builds, Commits oder Pushes. Content-Validierung, git diff --check und Archivierungscheck erfolgreich.
