# Brief CONTENT-188: FIAE-TST – Rust-Testverträge

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-TST-221 bis -244 ergänzen, Modul 220 → 244.
Rust-Testfunktionen, libtest/Cargo-Auswahl und Dokumentationstests.

## Betroffene Dateien

- `content/questions/FIAE-TST.csv`
- `docs/agent-briefs/CONTENT-188-fiae-tst-rust-testvertraege.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 220 Altstämme gelesen; globaler Rust-Testabgleich erforderlich.
Konkrete Rust-/Cargo-/rustdoc-Regeln statt abstrakter Testdefinitionen;
andere Framework-APIs nicht bloß als neue Bezeichnung wiederholen.
Frische Primärrecherche in offiziellen Rust-Dokumentationen.
Keine Installation, Builds, Dienste, DB/.env, Commits oder Pushes.
Altpräfix 122086 Byte SHA256:
25a57626397e5c1dd923b0f687808ff760fcee482e5c7b8365c149f5131681ac.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen, fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 220 → 244, Gesamtkatalog 5961 → 5985.
Frischer unabhängiger content188_review prüfte alle 24 gespeicherten Fragen,
96 Optionen, Erklärungen, alle 220 Altstämme und globale 26 CSV.
Eigene frische Recherche auf zehn offiziellen Rust-Primärseiten.
Reviewhinweis: entbehrliche Verstärker in 235a/236b; beide Formulierungen
konkret ersetzt. Anschließend alle 24 tatsächlichen Endzeilen vollständig
erneut gelesen und ohne offene Findings freigegeben.
Keine Lernzielduplikate zu anderen Frameworks: Rust-Teilzeichenfolgenvertrag
bei Panic-Text, libtest-Result-Auswertung, cfg-Kompilierung, Crate-/Dateiregeln
und Cargo-Verhalten zwischen Testbinaries sind eigenständige Verträge.
Altpräfix unverändert, globale IDs eindeutig, 244 Modulrecords/24 neue SC,
14 Felder. Namensfilter statisch bestätigt. Kein Rust-Build/Testlauf.
App-Parser, Content-Validator (5985 Fragen/26 CSV), Diff- und Archivcheck grün.

Primärquellen unter https://doc.rust-lang.org/:
- book/ch11-01-writing-tests.html
- book/ch11-02-running-tests.html
- book/ch11-03-test-organization.html
- rust-by-example/testing/unit_testing.html
- rust-by-example/testing/integration_testing.html
- rust-by-example/testing/doc_testing.html
- rustdoc/write-documentation/documentation-tests.html
- rustc/tests/index.html
- cargo/commands/cargo-test.html
- std/macro.assert_eq.html
