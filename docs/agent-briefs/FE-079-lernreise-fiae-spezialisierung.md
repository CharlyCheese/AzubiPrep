# FE-079 – FIAE-Spezialisierung und Abschluss der Lernreise

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-19

R5 aus docs/61: Die letzten 20 Themen mit 55 bestehenden Zielen ausarbeiten, je Thema vier Theorieblöcke, sechs Quizfragen, drei Reflexionen, sechs Karten, acht separate Testfragen. Eigene Fälle zu einem internen Reparaturauftragssystem (ohne personenbezogene Echtdaten). LF10a entwirft und bewertet die Eingabemaske, LF11a entwickelt die Fachlogik, LF12a führt das Kundenprojekt bis zur Übergabe und Auswertung. Pro Feld ein praktischer Arbeitsauftrag in Reflexion 2 des Abschlussthemas plus vollständiger fieldReview. Bestehende externe selbst durchgeführte Praxis mit Checkliste und bewusster Bestätigung verwenden. LF12a bündelt Ergebnisse und schließt den FIAE-Pfad nach allen bestandenen Themen ab. Vorhandene Stände und ältere Manifestfassungen berücksichtigen. Quellen öffentlich, keine privaten Daten lesen. Keine neuen Bibliotheken. Keine Paketveröffentlichung.

Allowlist: dieser Brief, docs/agent-briefs/{STATUS,DONE}.md, README.md, docs/61-Lernreise-FIAE-Planung.md, content/learning-journey/{README.md,fiae.v1.json,topics/fiae-lf*.v1.json,questions/fiae-lf*.v1.csv}, backend/src/{journey.js,journey-specialization.js,routes/journey.routes.js}, scripts/validate-learning-journey.mjs, frontend/src/{api/journey.js,components/JourneyEntry.jsx,pages/LernreiseAbschnitt.jsx,store/journeyStore.js}, frontend/public/sw.js, desktop/{main.js,journey-storage.cjs}, backend/test/{journey.test.js,journey-ai.test.js}, scripts/test/{learning-journey-content.test.mjs,journey-labs.test.mjs,journey-state.test.mjs}, e2e/tests/{journey-next.spec.js,journey-lf789.spec.js}.

Abnahme: Manifest 94/94 und 248 Ziele, inhaltlicher Vollreview der 280 Fragen und Begleitinhalte, schrittweise Fachbeispiele, Zuordnung jeder Frage zur vorangehenden Theorie. Prüfung von Navigation, Abschluss, Wiederholung, Web-/Desktop-Speicherung, Sicherung und fachrichtungsgebundener API. Unabhängiger Review und grünes Archivregister.

## Fachliche und technische Abnahme

- LF10a enthält sechs Themen, LF11a und LF12a je sieben. Alle 280 neuen Fragen und ihre 1.120 Antwortoptionen sowie die jeweils zugeordneten Theorieblöcke, Reflexionen und Karten wurden für jedes Feld unabhängig geprüft. Das Manifest enthält 94 freigegebene Themen und 215 öffentliche Quellen.
- In LF10a misst der Nutzertest den Unterschied zwischen einem selbstständigen und einem unterstützten Abschluss. Die Wirtschaftlichkeitsrechnung bezieht den Aufwand erfolgloser Versuche ein. Ein Projektauftrag führt vom eigenen Prototyp über Tastatur- und Fehlertests bis zur Nachkalkulation.
- Die Python-Beispiele in LF11a liefen mit den angegebenen Ergebnissen. Die externe Projektaufgabe wurde mit eigenem Testbestand und lokaler Versionsverwaltung nachvollzogen. Vier Ausgangstests bestanden, die zusätzliche Anforderung deckte einen Grenzfehler auf. Nach der Korrektur bestanden alle sieben Proben.
- Der LF12a-Auftrag umfasst Planung, Ausführung, Abnahmekriterien, Einweisung und Übergabe. Eine selbst durchgespielte Kundenrolle ist als Rollenprobe gekennzeichnet. Praxis und eigene Notizen sind am jeweiligen Abschluss später erneut lesbar.
- Die Lernzielmatrix verknüpft alle 248 Ziele mit Theorie, Quiz, Reflexion, Karten und Mini-Test. Nach allen 94 bestandenen Themen öffnet sich die Ergebnisübersicht. Eine Wiederholung erhält die letzte Lernzielverteilung auch nach Sicherung und Wiederherstellung. Bei alten Sicherungen, die bereits mitten in einer Wiederholung erstellt wurden, stehen die Einzelwerte nach der nächsten Abgabe wieder zur Verfügung.
- Ein unabhängiger Technikreview bestätigte die Übergänge nach 74, 80 und 87 bestandenen Themen, die Prüfung beschädigter Lernstände sowie Web- und Desktop-Wiederherstellung. Der öffentliche Fortschrittskatalog lädt die Strukturen für die Übersicht in einer Anfrage. Die eigentlichen Projektdateien bleiben beim Lernenden.

## Prüfergebnisse

Am 19.11.2026 bestanden 540 Inhalts- und Zustandstests, 1.069 Backendtests,
47 native Desktoptests und 157 Browser-/Electronfälle der Lernreise. Der
Produktionsbuild und die mobile Prüfung der Lernreiseübersicht bei 390 Pixeln
waren erfolgreich. Bei vollständigem Desktop-Neustart waren alle 94 Stände
lesbar. Der 94er-Katalog wurde über die laufende Webanwendung geprüft.
