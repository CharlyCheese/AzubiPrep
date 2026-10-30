# Brief CONTENT-128: DVK-SEC – sichere Update-Metadaten mit TUF

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-SEC-147 bis -170 ergänzen, Modul146 →170.
The Update Framework: Rollen, signierte Metadaten, Delegierungen und
konkrete Prüfungen beim Firmware-Update eines Edge-Geräts.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-128-dvk-sec-tuf.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle146 Altstämme gelesen. Globale semantische Suche über26CSV nach
TUF/Uptane/Update-Metadaten/Delegierungen/Rollback durchgeführt.
Keine vorhandenen TUF-Lernziele. Allgemeine Paketsignatur, Secure Boot,
Anti-Rollback und bekannte TLS-/OAuth-Grundlagen nicht wiederholen.
Primärquellen offizielle TUF-Dokumentation, Spezifikation1.0.36 sowie
python-tuf-API-Dokumentation. Rein dokumentationsgestützte Fragen;
keine Geräte-/Repository-/Netzwerkkonfiguration oder Installation.
Altpräfix111521 Byte SHA256:
44b3fa6a4094e8f6d579f7546a5c551ca775f5f1146372d6daeebfd8a8cbffc6.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, global eindeutige IDs, Altbytes erhalten.
- [x] Rollen/Versions-/Zeit-/Delegierungsprämissen primärbelegt und eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

DVK-SEC146 →170; Katalog4545. content128_review hat alle24 tatsächlichen
Endfassungen,146 Altstämme und globale semantische Kandidaten unabhängig
geprüft. Vollreview nach zwei Korrekturen bestanden:158 vier parallele
Dateinamen statt Falsch-Schablone.165 ursprüngliches Originalbytes-Lernziel
wegen Überschneidung mit FISI-SEC-316 komplett ersetzt; jetzt Cachebereinigung
nach Timestamp-/Snapshot-Schlüsselrotation für Fast-forward-Erholung.
Kein verbleibendes Duplikat und keine bindenden Antwort-Tells.

Alle Rollen-/Versions-/Schwellen-/Delegierungsfälle sowie python-tuf-
Methodensemantik quellenbelegt. Insbesondere Root-Doppelschwelle/N+1,
unique Key-ID, feste Startzeit, Snapshotreferenz, terminating, append=False,
UnsignedMetadataError, revoke_key und Updater-Ablauf unabhängig bestätigt.
Primärquellen selbst und vom Reviewer frisch gelesen:
- https://theupdateframework.github.io/specification/v1.0.36/ (§§4.3–4.6,5.1–5.7,6.1–6.2)
- https://theupdateframework.io/docs/metadata/
- https://theupdateframework.io/docs/security/
- https://theupdateframework.readthedocs.io/en/stable/api/api-reference.html
- https://theupdateframework.readthedocs.io/en/stable/api/tuf.api.metadata.metadata.html
- https://theupdateframework.readthedocs.io/en/stable/api/tuf.api.metadata.root.html
- https://theupdateframework.readthedocs.io/en/stable/api/tuf.api.metadata.targets.html
- https://theupdateframework.readthedocs.io/en/stable/api/tuf.ngclient.updater.html

App-Parser170/14, global4545 eindeutige IDs. Altpräfixhash unverändert.
Content-Validator und Diff-Check grün, Brief/DONE/STATUS archiviert und
mechanisch geprüft. Keine Installationen, Updater- oder Geräteaufrufe.
