# Brief CONTENT-035: FIAE-SWE praxisorientiert vertiefen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

FIAE-SWE von 49 auf 73 Fragen erweitern. 24 zusätzliche Aufgaben zu
Anforderungen, agiler Zusammenarbeit, Softwareentwurf und Versionsverwaltung.
Jede neue Frage behält die bereits etablierte individuelle Zuordnung zu
LF11a (technische Realisierung) oder LF12a (Projekt/Vorgehen).

## Betroffene Dateien

- `content/questions/FIAE-SWE.csv`
- `docs/agent-briefs/CONTENT-035-fiae-swe-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md und CONTENT-008 einschließlich der freigegebenen
LF11a/LF12a-Zuordnung. Eigene Lernaufgaben, Quellenabruf 2026-10-20.

- [KMK-Rahmenlehrplan](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf), LF11a/12a.
- [Scrum Guide 2020](https://scrumguides.org/scrum-guide.html).
- [Pro Git](https://git-scm.com/book/en/v2): Git-Grundlagen und Zusammenarbeit.
- [Semantic Versioning 2.0.0](https://semver.org/).
- [OMG UML 2.5.1](https://www.omg.org/spec/UML/2.5.1).

Weitere Primärquellen, vom unabhängigen Reviewer recherchiert:

- [Agile Alliance](https://agilealliance.org/glossary/incremental-development/): 056–057.
- [Microsoft ADR](https://learn.microsoft.com/en-us/azure/well-architected/architect-role/architecture-decision-record): 058.
- [Microsoft Dependency Injection](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection/overview) und [Architektur](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures): 059–061.
- [Microsoft Adapter-Schicht](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer), [Strategy](https://learn.microsoft.com/en-us/shows/visual-studio-toolbox/design-patterns-strategy), [Observer](https://learn.microsoft.com/en-us/dotnet/standard/events/observer-design-pattern): 062–064.
- Git-Befehlsdokumentation [fetch](https://git-scm.com/docs/git-fetch), [revert](https://git-scm.com/docs/git-revert), [gitignore](https://git-scm.com/docs/gitignore) und Pro Git [Rebase](https://git-scm.com/book/en/v2/Git-Branching-Rebasing), [Merge](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging): 065–069.
- Semver: 070–071; Scrum Guide: 050–055; UML: 072–073.

Das UML-2.5.1-PDF überschritt die Webwerkzeug-Größengrenze. Die zwei
Aussagen wurden ergänzend in lesbaren offiziellen älteren OMG-Normtexten
[Infrastruktur](https://www.omg.org/spec/UML/ISO/19505-1/PDF) und
[Superstruktur](https://www.omg.org/spec/UML/ISO/19505-2/PDF) belegt,
außerdem anhand indexierter IBM-Originaldokumentation zu
[Komposition](https://www.ibm.com/docs/en/dma?topic=diagrams-composition-association-relationships)
und [alt-Fragmenten](https://www.ibm.com/docs/en/radfws/10.0.0?topic=diagrams-combined-fragments-in-sequence).
Direkte IBM-Aufrufe waren mit 403 blockiert. Kein vollständiger Abruf der
UML-2.5.1-Norm behauptet.

## Umsetzung und Abnahme

- [x] 24 SC-Fragen FIAE-SWE-050 bis -073 mit 15 Spalten einschließlich lernfeld.
- [x] Bestehende 49 Zeilen unverändert, vier eindeutige Optionen je Frage.
- [x] Fachlich richtige, eindeutig lösbare Anwendungsfragen ohne Textduplikate.
- [x] Plausible Distraktoren und ausgeglichener Stil, kein systematischer Längen-/Meta-Tell.
- [x] Vollständiger unabhängiger Review mit Primärquellen ohne offene Findings.
- [x] Content-Validierung und Archivierungscheck erfolgreich.

## Ergebnis

24 Fragen ergänzt, FIAE-SWE jetzt 73. 050–057 sind LF12a (8), 058–073
LF11a (16). Bestehende 49 Zeilen unverändert, 15 Spalten und eindeutige
IDs/Optionen bestätigt. Gesamt nach CONTENT-033/034/035: 2361 Fragen.

Vollständiger unabhängiger Fachreview aller Fragen und 96 Optionen am
2026-10-20. Kein fachlicher Musterlösungsfehler oder Definitionsduplikat,
kein systematischer Längenbias. Findings zu Distraktorschablonen in
053/056/057 und unplausiblen Alternativen in 058/062/063/067/068 wurden
behoben. Aktuelle Zeilen vom Reviewer erneut gelesen, zuletzt 062 und
070 (zusätzliche Sprachpräzisierung): **BESTANDEN**, keine offenen Findings.

Content-Validierung ohne Fehler, Archivierung in DONE.md und
check-agent-briefs erfolgreich. Keine DB-/Installer-Aktualisierung, kein
Commit, keine vorweggenommene persönliche Freigabe. Vorherige Änderungen erhalten.
