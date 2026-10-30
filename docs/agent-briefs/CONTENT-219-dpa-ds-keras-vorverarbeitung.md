# Brief CONTENT-219: DPA-DS – Keras-Vorverarbeitung

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-DS-244 bis -267 ergänzen; Modul 243 → 267.
Verträge der Keras-3-Vorverarbeitung für Text, Kategorien und Zahlen anwenden.

## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-219-dpa-ds-keras-vorverarbeitung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 243 Altstämme gelesen; globale Keras-/TensorFlow-Suche ohne Treffer.
Keras-Herausgeberseiten für TextVectorization, StringLookup, Normalization,
Discretization, CategoryEncoding, Hashing, Rescaling und CenterCrop prüfen.
Vorhandene allgemeine ML- und PyTorch-Lernziele nicht wiederholen.
14 Felder. Altpräfix 132280 Byte SHA256:
99a1339995dccf5cf7dffd6de668da943d2f8f826c48cc1f3cb3257b2699080b.
Keine Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Zeilen, eindeutige globale IDs und unveränderte Altbytes.
- [x] Eindeutige Lösungen, genaue API-Voraussetzungen und Primärbelege.
- [x] Plausible Distraktoren ohne Antwort-Tells oder Lernzielduplikate.
- [x] Unabhängiger Vollreview mit eigener frischer Recherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivcheck grün.

## Ergebnis

DPA-DS 243 → 267; global nach diesem Batch 6729 Fragen.
Reviewer content219_review prüfte alle 24 Fragen, 243 Altstämme und globale
Nachbarn sowie acht frisch gelesene Keras-Primärseiten. Das Antwortmuster
in 263 entfernt; die gewichtete Summenrechnung in 257 wegen Überschneidung
mit 178 durch den eigenständigen Vertrag zur Verwendung von count_weights
ersetzt. Erneuter vollständiger Endread aller 24: Freigabe ohne offene Findings.
App-Parser bestätigt 267 Modulfragen und 14 Felder; Altpräfix-Hash unverändert,
globale IDs eindeutig, Content-Validator, Diff- und Archivcheck grün.
