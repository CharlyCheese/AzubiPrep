# Brief CONTENT-131: FIAE-SWE – UML-Detailfälle

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FIAE-SWE-170 bis -193 ergänzen, Modul169 →193.
UML2.5.1: Klassenelemente und Beziehungen, Anwendungsfälle,
Interaktionen und konkrete Zustandsautomaten-Semantik.

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-131-fiae-swe-uml-detailfaelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle169 Altstämme gelesen. Globale semantische Suche über26CSV nach
UML, Beziehungen und Diagrammtypen durchgeführt. Grundlagen der
Diagrammtypen, Multiplizität0..*, Kompositionsrautenposition072 und
alt-Fragment073 nicht wiederholen. Generische BPMN-Parallelisierung
nicht unter UML-Etikett erneut fragen.
Primärquellen: in Sparx Enterprise Architect wörtlich wiedergegebene
OMG-UML2.5.1-Ausschnitte, offizielle Sparx-/PlantUML-Dokumentation und
Eclipse-UML2-Metamodellreferenz sowie IBM-Modeling-Dokumentation zu
qualifizierten Assoziationen. Das18MB-OMG-Gesamt-PDF ist über den
Webparser zu groß; direkter Download mangels Shell-Netzwerk gescheitert.
Keine vollständige direkte PDF-Lektüre behaupten. Das ältere vereinfachte
Sparx-Sequenztutorial beschreibt opt unpräzise als switch; maßgeblich sind
aktuelle Interaction-Operators-Seite und Eclipse-Metamodell (optional).
Keine Toolinstallation, kein Code-/Build-/DB-Eingriff.
Altpräfix91052 Byte SHA256:
9c18d22f6e84aa27a54a44c099659a16c033e116cd80229a62c571b9aa3c8499.

## Abnahmekriterien

- [x] 24 SC-Fragen/15 Felder inklusiveLF11a, IDs global eindeutig,Altbytes erhalten.
- [x] Notation/Semantik samt nötigen Prämissen eindeutig primärquellenbelegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul169 →193, Katalog4593 →4617. Alle169 Altstämme
und globale semantische Kandidaten geprüft. Altpräfix unverändert.
Frischer Reviewer content131_review las alle24 gespeicherten Endfassungen
und recherchierte unabhängig bei Sparx/OMG-Auszügen, IBM, Eclipse und
PlantUML. Ein Finding bei176 behoben: Qualifier hängt am Bibliothek-Ende,
Multiplizität0..1 steht am gegenüberliegenden Exemplar-Ende. Endfassung
erneut gelesen, Gesamtfreigabe ohne offene Findings.
Beleg: https://www.sparxsystems.com/enterprise_architect_user_guide/17.2/modeling_languages/qualifiers.html
und https://www.ibm.com/docs/en/dma?topic=diagrams-qualifiers-association-ends.
Weitere Quellen stehen zeilenbezogen in der CSV. App-Parser193 Datensätze
mit15 Feldern, Content-Validator4617/26CSV und Diffcheck grün.
