# Brief CONTENT-227: IT-SEC-GRUND – Dateikryptografie

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-IT-SEC-GRUND-073 bis -096 ergänzen; Modul 248 → 272.
Konkrete Bedienverträge von age, age-keygen, Minisign und signify unterscheiden.

## Betroffene Dateien

- `content/questions/IT-SEC-GRUND.csv`
- `docs/agent-briefs/CONTENT-227-it-sec-grund-dateikryptografie.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 248 Altstämme gelesen. Globale Suche ohne age-/Minisign-/signify-Fragen.
Frische Originalhandbücher aus FiloSottile/age, jedisct1.github.io/minisign
und man.openbsd.org/signify. Bestehende abstrakte Kryptografie und
GnuPG-/OpenSSL-Verträge nicht wiederholen. 15 Felder, LF4.
Altpräfix 98737 Byte SHA256:
202b623474dd401770c3f7a66f6326a2e68a429fd91772da9fecc0b4573f4bfe.
Keine tatsächliche Schlüsselerzeugung oder Verschlüsselung. Keine Builds,
Installationen, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 eindeutige SC-Zeilen, Altpräfix und globale IDs erhalten.
- [x] Fachlich eindeutige Lösungen mit frischen Primärbelegen.
- [x] Plausible Distraktoren ohne Antwort-Tells oder Lernzielduplikate.
- [x] Unabhängiger Vollreview mit eigener Recherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

24 Fragen ergänzt; Modul 272, Gesamtkatalog nach diesem Batch 6921.
Frischer Reviewer content227_review las alle 248 Altstämme und 24 Endzeilen,
prüfte vier Originalhandbücher mit eigener Recherche sowie globale Duplikate.
Distraktoren in -084 und -086 plausibler gefasst; vollständige Endfassung
ohne offene Findings freigegeben. App-Parser: durchgängig 15 Felder,
SC/LF4 und globale IDs korrekt; Altpräfix exakt erhalten. Validator und
Diffprüfung bestanden; Archivcheck nach Eintragung ausführen.
