# Brief CONTENT-083: DVK-SEC – OAuth und tokenbasierter Gerätezugang

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DVK-SEC-099 bis -122 ergänzen, Modul 98 → 122.
Konkrete OAuth-/OIDC-/Gerätefluss- und Tokenbindungsfälle für vernetzte
Systeme. Vorhandene JWT-Signatur-/Algorithmus-/Audience-/Ablauffragen
nicht wiederholen. Keine reale Systemkonfiguration verändern.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-083-dvk-sec-oauth-geraetezugang.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md. Alle 98 Bestandsfragen gelesen, globaler
Token-Themenabgleich identifiziert IT-SEC-GRUND-001 bis -004 als bestehend.
IETF-RFCs und OpenID-Foundation-Spezifikation als Primärquellen.
Alter Byte-Präfix SHA256:
83034065fb6a14924b4f05cb9724041d28bbfd524d8fc293bf842415add2448a.

## Abnahmekriterien

- [x] Genau 24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Protokollrollen, Voraussetzungen und Lösungen primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DVK-SEC 98 → 122, Gesamtstand 3465 Fragen. 24 konkrete OAuth-/OIDC-
und Gerätezugangsfälle, einschließlich PKCE, Redirect-/Sitzungsbindung,
Scope, Tokenrollen, Widerruf, Schlüsselrotation, DPoP und mTLS.

Frischer unabhängiger Vollreview content083_review und tatsächliche
Endstands-Nachprüfung: BESTANDEN. Zwei Findings vollständig behoben:
Die ursprüngliche114 wiederholte JWS-Vertraulichkeit aus
ALLE-IT-SEC-GRUND-005; ersetzt durch „Access Token muss kein JWT sein“.
Das gesamte gemeinsame ALLE-IT-SEC-GRUND-001 bis -024 daraufhin zusätzlich
gelesen. Mehrere korrekte Antworten waren deutlich länger/detailreicher.
Zehn Optionssätze gekürzt beziehungsweise bei116/118 nahe Distraktoren
vergleichbar ausgearbeitet. Im Endstand neun von24 korrekten Optionen
strikt am längsten, überwiegend nur knapp; keine systematische Dominanz.
Keine offenen fachlichen, Duplikat- oder Tell-Findings.

Alle24 Fragen unabhängig mit eigener Webrecherche geprüft. Primärquellen:
RFC6749,6750,7636,9700,7662,7009,7519,9449,8705 und OpenID Connect
Core1.0 einschließlich Errata2. Direkte Abschnittslinks je CSV-Zeile.
https://www.rfc-editor.org/rfc/rfc9700.html
https://openid.net/specs/openid-connect-core-1_0.html

Besonders abgegrenzt: opake Tokens, Issuer, JWKS-Rotation und jti-
Prüfmechanismus sind andere Lernziele als Signatur, Algorithmus, Audience,
Ablauf und JWS-Vertraulichkeit im gemeinsamen Modul. Device-slow_down:
5 Sekunden bisheriges Intervall plus5 ergeben10 Sekunden für weitere
Versuche. Keine tatsächlichen Authentifizierungs-/Systemänderungen.

App-Parser:26CSV,3465eindeutige IDs, DVK-SEC122 mit14Feldern.
Alter Byte-Präfix aus99physischen Zeilen exakt gemäß SHA256 erhalten.
Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Imports, Builds, Installationen, Commits oder Pushes.
