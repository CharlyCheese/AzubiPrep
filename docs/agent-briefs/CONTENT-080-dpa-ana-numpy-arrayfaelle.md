# Brief CONTENT-080: DPA-ANA – NumPy-Arrayfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DPA-ANA-099 bis -122 ergänzen, Modul 98 → 122.
Konkrete Datenanalyse mit NumPy-Arrays: Form, Achsen, Auswahl,
Speicherbezug und Transformationen. Dokumentierte NumPy-2.3-Semantik.
Keine neue Projektabhängigkeit und keine Installation.

## Betroffene Dateien

- `content/questions/DPA-ANA.csv`
- `docs/agent-briefs/CONTENT-080-dpa-ana-numpy-arrayfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md und offizielle NumPy-2.3-Dokumentation.
Alle bisherigen98Modulfragen gelesen. Globale NumPy-Suche: bisher keine
konkreten Arrayfälle, DPA-DS-008 fragt lediglich die Bibliothek pandas ab.
Alter Byte-Präfix vor Änderung SHA256:
153453e980585e32c65367ac98db784fbb396a34208e2a367eec1e2990e5a150.

## Abnahmekriterien

- [x] Genau24 neue SC-Fragen, altes Schema/alte Bytes erhalten, IDs eindeutig.
- [x] API-Ergebnisse/Formen/Achsen und Mutationen eindeutig und quellenbelegt.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Primärquellenrecherche.
- [x] App-Parser, Content-Validator, Diff- und Archivierungsprüfung grün.

## Ergebnis

DPA-ANA 98 → 122, Gesamtstand nach diesem Batch 3393 Fragen.
24 konkrete Fälle zu Arrayform, Reshape, C-Reihenfolge, Reduktion,
Transposition, Broadcasting, Sicht/Kopie, Masken und Transformationen.

Eigene Tell-Prüfung präzisierte 121a vor Review, damit drei falsche
Optionen nicht allein „Das“ als Eröffnung teilen. Frischer unabhängiger
Vollreview content080_review: BESTANDEN ohne Findings im Endstand.
Alle 24 Zeilen einzeln anhand selbst abgerufener NumPy-2.3-Primärquellen
und unabhängiger Berechnung geprüft. Keine NumPy-Installation und keine
NumPy-Ausführung; Semantikprüfung anhand Dokumentation, nicht als
Laufzeittest dargestellt. Keine zusätzlichen Projektabhängigkeiten.

Primärquellen: offizielle NumPy-2.3-Dokumentation. Quickstart, Indexing,
Broadcasting sowie die einzelnen API-Seiten für reshape/ravel/sum/
transpose/where/concatenate/stack/nanmean/argmax/argsort/unique/diff/
cumsum/ndarray.astype/clip/dot und ndarray-Wahrheitswert. Die jeweilige
direkte URL steht in der CSV. Einstieg:
https://numpy.org/doc/2.3/user/quickstart.html
https://numpy.org/doc/2.3/user/basics.indexing.html
https://numpy.org/doc/2.3/user/basics.broadcasting.html

Globale Abgrenzungen: Python-Listenslice FIAE-PRG-099 ist keine
NumPy-Speichersichtmutation; SQL-Fensterrahmen DPA-DB-127 ist ein anderes
API-Lernziel als cumsum. nanmean ist weder Imputation noch NaN-Gleichheit
oder SQL-AVG. Innerhalb des Batches prüfen 102/104 Werte versus Form,
107/108 Sicht versus Kopie, 111/112 vorhandene versus neue Achse.
Keine globalen Lernzielduplikate, keine systematischen Antwort-Tells.

App-Parser: 122 Datensätze mit 14 Feldern, global eindeutige IDs.
Alter Byte-Präfix exakt gemäß vorher gesichertem SHA256 erhalten.
Content-Validator, Diff- und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
