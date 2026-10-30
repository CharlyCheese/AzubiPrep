# Brief CONTENT-075: DPA-PROJ – Annotationsqualität und Bewertungsgrundlage

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

12 gezielte SC-Fragen DPA-PROJ-076 bis -087 anhängen, Modul 75 → 87.
Eigene Datenprojektfälle zu Labeldefinition, unabhängiger Annotation,
Schlichtung, Bewertung und fachlichen Entscheidungskosten.
Bewusst fachlich abgegrenzter 12er-Batch statt thematischer Auffüllfragen.

## Betroffene Dateien

- `content/questions/DPA-PROJ.csv`
- `docs/agent-briefs/CONTENT-075-dpa-proj-annotationsqualitaet.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Primärquellen

AGENTS.md, ORCHESTRATOR.md. Google Machine Learning zu menschlichen Labels,
scikit-learn Cohen-Kappa, Datasheets for Datasets, AWS Ground Truth und
eigene vollständig definierte Kosten-/Kapazitätsmodelle.
Alter Byte-Präfix vor Änderung: SHA256
38db5cb20d7b2480a4a29a2d085aeb095498477efb705290482bfe96cafdf6b0.

## Abnahmekriterien

- [x] Genau 12 SC-Fragen, altes Schema/alte Bytes erhalten, IDs global eindeutig.
- [x] Eindeutige Lösungen/Erklärungen, Rechnungen unabhängig geprüft.
- [x] Keine globalen Inhaltsduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit Primärquellenrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff-Prüfung und Archivierungscheck erfolgreich.

## Ergebnis

12 Fragen DPA-PROJ-076 bis -087 angehängt, Modul 75 → 87.
Unabhängiger Vollreview aller zwölf Fragen und 48 Optionen durch
content075_review mit tatsächlicher Primärquellenrecherche BESTANDEN,
keine Findings. 082/084 Sprachform und 087 nahe Distraktoren vorab verbessert.

Unabhängig nachgerechnet: Fehlerkosten A50/B40 Euro, Prüfkapazität144
Fälle/Tag mit bester zulässiger Variante B, 1200 Annotationsminuten =20h,
Cohen-Kappa0,6. Globale Lernzielprüfung ohne Inhaltsduplikate, konkrete
Kostenrechnung gegenüber allgemeinen Kostenhinweisen in DPA-DS abgegrenzt.

Quellenzuordnung: 076–078 explizite eigene Kosten-/Kapazitätsmodelle,
079 Google Labels/Kriterien, 080 eigene Unabhängigkeitsbedingung und Google
Human Raters, 081 expliziter Schlichtungs-/Auditauftrag, 082 Google Human
Raters/Fehler trotz Übereinstimmung, 083 scikit-learn Cohen-Kappa,
084 scikit-learn Multilabel, 085 Google Labels plus expliziter Definitionswechsel,
086 AWS Label Verification/Adjustment als konzeptioneller Vergleich,
087 Datasheets for Datasets einschließlich unabhängig gelesenem Volltext:
https://arxiv.org/html/1803.09010v8
Direkte Quellen außerdem je CSV-Zeile, keine AWS-Neukundenempfehlung.

App-Parser bestätigt 87 Datensätze mit je14 Feldern; IDs global eindeutig.
Alter dokumentierter Byte-Präfix unverändert. Content-Validator,
git diff --check und Archivierungscheck erfolgreich.
Keine Datenbankimporte, Builds, Commits oder Pushes.
