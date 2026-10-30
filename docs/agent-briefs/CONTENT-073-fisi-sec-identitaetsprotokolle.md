# Brief CONTENT-073: FISI-SEC – Identitäts- und Netzwerkprotokolle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen FISI-SEC-281 bis -304 anhängen, Modul 104 → 128.
Konkrete neue Fälle zu Zertifikaten, TLS, SSH, Kerberos und Netzzugang.
Globale ID-Verteilung über gemeinsame Module ausdrücklich berücksichtigen.

## Betroffene Dateien

- `content/questions/FISI-SEC.csv`
- `docs/agent-briefs/CONTENT-073-fisi-sec-identitaetsprotokolle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. IETF-RFCs, OpenSSH-, Microsoft- und
autoritative Protokolldokumentation. Eigene Beispiele und explizite
Handshake-/Vertrauens-/Regelannahmen statt pauschaler Sicherheitsgarantien.
Alter Byte-Präfix vor Änderung: SHA256
8b3a0162b1006769e22b504bb095ed7286b1ef9184cdcee37ce83f69b1b4007d.

## Abnahmekriterien

- [x] 24 SC-Fragen, altes Schema und alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige belegte Protokollsemantik und relevante Voraussetzungen.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen FISI-SEC-281 bis -304 angehängt, Modul 104 → 128.
Unabhängiger Vollreview und vollständige Endfassungsnachprüfung durch
content073_review mit tatsächlicher Primärquellenrecherche BESTANDEN.
286/290 Artikel-Tells angeglichen. 303 wegen Nähe zu DVK-SEC-079
komplett durch eine neue ESP-Transportmodus-Kapselungsfrage ersetzt.
Sachfremde Alternativen in 292/293/295 und weiteren betroffenen Fragen
durch nahe Protokollverwechslungen ersetzt. Keine verbleibenden Befunde.

Quellenzuordnung (direkte Quellen je CSV-Zeile):
281/282 RFC9525 Dienstidentität, 283–286 RFC5280 Pfad/Vertrauensanker/EKU/Zeit,
287–289/304 RFC8446 Frühdaten/Forward Secrecy/Transportgrenzen,
290/292 OpenSSH ssh, 291 ssh-keygen, 293 sshd/authorized_keys,
294 Microsoft SPNs, 295 RFC4120 TGS, 296 Microsoft Delegation,
297 Microsoft LDAP Signing, 298 OWASP LDAP Injection Prevention,
299 RFC2866 Accounting, 300 RFC3748 EAP-Rollen, 301 RFC9190 EAP-TLS,
302 explizites First-Match-Modell, 303 RFC4303 Abschnitt3.1.1/IPv4-Diagramm.

App-Parser bestätigt 128 Datensätze, je 15 Felder und LF11b.
IDs 281–304 global jeweils einmal. Alter dokumentierter Byte-Präfix
unabhängig bestätigt. Kein systematischer Detail-/Längenvorteil, keine
globalen Inhaltsduplikate nach Ersatz von 303.
Content-Validator, git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits, Pushes oder Systemänderungen.
