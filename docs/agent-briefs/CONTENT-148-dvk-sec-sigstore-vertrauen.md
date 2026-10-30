# Brief CONTENT-148: DVK-SEC – Sigstore-Verifikation und Buildnachweise

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-SEC-171 bis -194 ergänzen, Modul170 →194.
Sigstore/Cosign: Identität, Transparenz, kurzlebige Signaturen,
Bundles, Artefaktbindung und überprüfbare Buildnachweise.

## Betroffene Dateien

- `content/questions/DVK-SEC.csv`
- `docs/agent-briefs/CONTENT-148-dvk-sec-sigstore-vertrauen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle170 Altstämme lesen; globale26CSV Lernziele abgleichen. Keine
einschlägigen Sigstore/Cosign/Fulcio/Rekor-Altfragen gefunden. TUF147–170
und generische Hash-/Signatur-/SBOM-Prinzipien nicht wiederholen.
Eigene aktuelle offizielle Sigstore- und gegebenenfalls SLSA-/in-toto-
Primärrecherche. Neue Cosign3-Bundle-/Rekor2-Semantik versionieren.
Nur Lehrfragen und gedachte Fälle; keine Installation, Authentifizierung,
Schlüsselgenerierung, Signier-/Verifikationswerkzeuge, Registry, Logs oder
Cloud-Zugänge ausführen/verbinden. Kein DB-Zugriff, .env, Build, Commit, Push.
Altpräfix126627 Byte SHA256:
22cd76d8df0bf556843644e930c0f32f8aebf3060be5047dd2cb151d35463b5e.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Versions-/Werkzeugsemantik und Musterlösungen frisch eindeutig belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, DVK-SEC170 →194, global5025 eindeutige Fragen.
Content-Validator und Diffcheck bestanden. Reviewer content148_review las
alle24 Endfragen und170 Altstämme, verglich globale26 CSV und belegte
sämtliche Lernziele durch eigene aktuelle Primärrecherche. Drei bindende
Eröffnungsmuster in178/180/187 angeglichen. 171 vorsorglich von allgemeiner
Zertifikatsbindung auf Fulcios konkrete sub-Challenge umgestellt. Erneuter
gespeicherter Vollreview bestanden, keine offenen Findings. App-Parser:
194 Modulfragen,24 neueSC/14Felder,5025 globale eindeutige IDs. Altpräfix
unverändert; Enddatei-SHA256:
281d25569b932127d0a20bcafa1c777819451c983365c02b79d3bdfff8447d2f.

Primärquellen:
- https://docs.sigstore.dev/certificate_authority/certificate-issuing-overview/
- https://docs.sigstore.dev/about/security/
- https://docs.sigstore.dev/about/bundle/
- https://docs.sigstore.dev/quickstart/quickstart-cosign/
- https://docs.sigstore.dev/cosign/verifying/verify/
- https://docs.sigstore.dev/cosign/verifying/timestamps/
- https://docs.sigstore.dev/cosign/signing/signing_with_containers/
- https://docs.github.com/en/actions/how-tos/secure-your-work/use-artifact-attestations/verify-attestations-offline
- https://slsa.dev/spec/v1.2/build-provenance
- https://slsa.dev/spec/v1.2/verifying-artifacts
