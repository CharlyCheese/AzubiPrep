# Brief CONTENT-146: FIAE-PRG – Rust-Speicher- und Fehlermodell

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-PRG-195 bis -218 ergänzen, Modul194 →218.
Rust: Ownership, Borrowing, Lebenszeiten, Option/Result und weitere
konkrete typsichere Standardbibliotheksoperationen.

## Betroffene Dateien

- `content/questions/FIAE-PRG.csv`
- `docs/agent-briefs/CONTENT-146-fiae-prg-rust-speicher.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle194 Altstämme lesen und globale26CSV semantisch vergleichen.
Keine Rust-Altfragen gefunden. Generische Definitionen und vergleichbare
Python-/Java-Aufgaben nicht unter anderem Sprachnamen wiederholen.
Eigene frische Primärrecherche Rust Book und offizielle Standardbibliothek.
Keine Installation, Abhängigkeitserweiterung, Netzwerkdienste oder ProjektDB.
Lehrbeispiele ohne Produktcodeänderung; vorhandener Compiler nur bei
Verfügbarkeit für isolierte Beispiele, sonst dokumentierter Quellenabgleich.
Altpräfix82758 Byte SHA256:
b3a13a6f70c40b8d194d46b2ae4f1147d4b35bca5f41aa5177433b5907df597f.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Rust-spezifische Lösungen mit vollständigen Prämissen frisch belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul218, Gesamt4977. App-Parser218/14, globaleIDs
eindeutig und Altpräfix-SHA256 exakt bestätigt. Content-Validator und
git diff --check grün. Frischer Reviewer content146_review las alle24
Endzeilen, alle194Altstämme und globale semantische Kandidaten über26CSV.
Alle24 Lösungen mit eigener aktueller offizieller Recherche bestätigt.
Kein rustc im PATH: Beispiele statisch abgeglichen, nicht kompiliert oder
ausgeführt. Keine Installation oder Erweiterung der Projektabhängigkeiten.
Schablonen in201/205/206 und false-only Kopiephrase195d/202c/216c
aufgebrochen; fachfernen201d ersetzt. Dessen neue mehrdeutige Fassung
auf eindeutige Ownership-Fehlannahme über println geändert. Tatsächliche
Endfassung anschließend freigegeben. Keine offenen Duplikat-/Tellfindings.

Primärquellen unter https://doc.rust-lang.org/:
book/ch04-01-what-is-ownership.html,
book/ch04-02-references-and-borrowing.html,
book/ch10-03-lifetime-syntax.html, book/ch08-02-strings.html,
book/ch08-01-vectors.html, std/option/enum.Option.html,
std/result/enum.Result.html,
book/ch09-02-recoverable-errors-with-result.html,
book/ch13-02-iterators.html, book/ch15-01-box.html,
book/ch15-04-rc.html, book/ch15-05-interior-mutability.html,
book/ch16-04-extensible-concurrency-sync-and-send.html.
Kein DB-Zugriff, Server, Build, Commit oder Push.
