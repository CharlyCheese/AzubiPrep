# CONTENT-233 – Lernreise: FIAE-Inhaltsgrundlage und erster LF1-Abschnitt

Status: done
Bereich: CONTENT
Angelegt: 2026-11-10

## Ziel

R1 aus dem Lernreiseplan umsetzen: ein versionierter Themen-/Lernzielplan für
FIAE mit sichtbaren Lücken und ein vollständig ausgearbeiteter erster LF1-
Abschnitt. Theorie und Aufgaben werden unabhängig geprüft, bevor R2 sie in
einen geführten App-Ablauf einbindet. Dieser Brief liefert veröffentlichbare
eigene Inhalte aus öffentlichen Quellen, ohne private Unterlagen zu lesen.

## Allowlist

- content/learning-journey/README.md (neu)
- content/learning-journey/fiae.v1.json (neu)
- content/learning-journey/topics/common-lf1-role.v1.json (neu)
- content/learning-journey/questions/common-lf1-role.v1.csv (neu)
- scripts/validate-learning-journey.mjs (neu)
- scripts/test/learning-journey-content.test.mjs (neu)
- docs/62-Lernreise-LF1-Inhaltsgrundlage.md (neu)
- docs/61-Lernreise-FIAE-Planung.md (nur Fortschrittsverweis)
- dieser Brief, docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

## Kontext und Grenzen

- docs/61-Lernreise-FIAE-Planung.md, besonders R1, erster Pilot und LR02/03/12.
- Allgemeine LF1–9 vor FIAE LF10a–12a; zusätzliche WISO-Themen explizit führen.
- Datenformat vorbereitet für spätere harte Themenpools, unverwechselbare IDs,
  Quellen-/Lernzielzuordnung und Inhaltsversionen. Keine API/UI-Anbindung in R1.
- Bestehende 7.000 Quizfragen, Datenbank, Konten und Fortschritt unverändert.
  Neue Reiseaufgaben bleiben als eigener Inhaltsbestand abgegrenzt.
- Keine private PDF/.env/local-rag/local-ai/Kontodaten lesen oder verarbeiten;
  keine neuen Bibliotheken, kein Build, Commit, Push oder Veröffentlichung.

## Abnahme

1. Versionierter FIAE-Themenplan enthält alle zwölf vorgesehenen Lernfelder,
   zusätzliche WISO-Stationen, stabile IDs, konkrete Lernziele und gültige
   Voraussetzungen. Fehlende Inhalte sind explizit offen; keine Vollabdeckung.
2. Erster LF1-Abschnitt enthält drei Lernziele, vier verständliche Theorieblöcke,
   einen eigenen durchgängigen Fall und sechs passende Karten.
3. Sechs Übungsfragen und acht getrennte Mini-Test-Fragen sind eindeutig,
   fachlich korrekt und vollständig aus der vorherigen Theorie beantwortbar.
   Alle drei Lernziele werden in beiden Pools berücksichtigt. Transferfälle
   verlangen kein neues Fachwissen. Erklärungen verweisen auf passende Blöcke.
4. Drei Gesprächsimpulse besitzen konkrete Kernpunkte, akzeptierte alternative
   Formulierungen, typische Missverständnisse und Beispielantworten für
   Selbstreflexion ohne KI; keine starre Freitextbenotung.
5. Öffentliche Primärquellen fachlich geprüft; eigener Wortlaut und Beispiele.
   Keine privaten Quellen oder Rückschlüsse darauf in Inhalt/Artefakten.
6. Automatische Validierung prüft Referenzen, IDs, Voraussetzungen/Zyklen,
   Pooltrennung, Antwortformate, Theorie-/Lernzielabdeckung und ehrlichen Status.
   Aussagekräftige Negativproben für verletzte Inhaltsverträge bestehen.
7. Frischer unabhängiger Fach-/Qualitätsreview aller 14 Fragen einschließlich
   Theorieabgleich und Distraktorqualität; Archivcheck grün. Dokumentation
   trennt fertige Inhalte von noch nicht vorhandener App-Anbindung.

## Ergebnis

- R1-Inhaltsbestand erstellt: 84 Themen, 218 konkrete Lernziele und 129 gültige
  Voraussetzungen. 64 gemeinsame Themen inklusive zehn WISO-Stationen vor
  20 FIAE-Themen; 83 Themen ausdrücklich noch geplant/unvollständig.
- Erstes LF1-Thema: drei Lernziele, eigener fiktiver IT-Auftrag, vier vollständige
  Theorieblöcke mit Beispiel/Irrtum/Merksatz, sechs Übungsfragen, acht separate
  Mini-Test-Fragen, drei Gesprächsimpulse samt Alternativen und sechs Karten.
- Theoriezuordnung jeder Frage/Karte/Gesprächsfrage maschinenlesbar. Neue
  Reiseaufgaben separat; bestehender Katalog weiterhin exakt 7.000 Fragen.
- CLI-Validator und 72 aussagekräftige positive/negative Tests ergänzt. Keine
  zusätzlichen Bibliotheken, keine App-/Umgebungs-/DB-Abhängigkeit. Feste
  lokale Pfadwurzel, Referenz-/Pool-/Voraussetzungs- und Reviewkontrollen.
- Öffentliche KMK-/BIBB-/FIAusbV-/BBiG-Grundlagen geprüft. Keine privaten
  Quellen gelesen oder verwendet; sämtliche Beispiele eigenständig erstellt.
- Frischer unabhängiger Fachreview aller 14 Fragen und Theoriebezüge: drei
  Distraktor-Schablonen behoben, Lernziele für tatsächliche Präsentation und
  Skalierbarkeit ergänzt. Anschließend Freigabe ohne offene Inhaltsfindings.
- Separater frischer technischer Review freigegeben; 19.232 speicherinterne
  Malformed-Mutationen ohne Absturz. Nach Fachfreigabe review.status reviewed.
- Finale lokale Prüfung: Validator grün, 72/72 Tests grün. Vorherige erwartete
  Zwischenfehler betrafen ausschließlich die noch ausstehende Reviewmarkierung.
- Inhaltsvertrag, Grenzen und R2-Fortsetzung dokumentiert; neue Links und
  Diff-/Archivcheck geprüft. Keine UI/API, Datenbank-, Konto-, Paket- oder
  Abhängigkeitsänderung; kein Commit/Push. Sichtbarer geführter Ablauf folgt R2.
