# FE-081 – Willkommen beim Öffnen und Suche in der ganzen App

Status: done

Beim normalen Öffnen der App soll die Willkommen-Seite auch für bestehende Profile sichtbar sein. Nach dem Einstieg führt die App zum Dashboard. Direkte Links, Reloads von Unterseiten und die Orientierung innerhalb der App bleiben nutzbar.

Die allgemeine Suche erschließt öffentliche Inhalte, Lernreise, Werkstatt, Theorie und Glossar sowie Funktionen und Ansichten der App. Treffer öffnen das passende Ziel. Persönliche Notizen dürfen nur im aktuellen Profil lokal durchsucht werden. Kontodaten, Prüfungsabgaben, fremde Nutzer und private Unterlagen gehören nicht in den allgemeinen Suchindex. Die bestehende gesonderte lokale Materialsuche bleibt verfügbar.

Umfang: betroffene Routen, Navigation und Seiten in frontend/src, die lokalen Such- und Zielhilfen, Navigationstests und gezielte Backend-/Frontend-Prüfungen, öffentliche Suchlogik, Metadaten und API in backend/src bzw. geteilte öffentliche Kursdaten. Bei Bedarf öffentliche Paket-/Startskripte, damit Web und Electron dieselben Inhalte finden. Cache-Version in frontend/public/sw.js, dieser Brief und DONE.md. Vorarbeiten FE-080 erhalten. Keine neuen Abhängigkeiten und keine realen Kontodaten, privaten Lernunterlagen oder .env für Tests.

Betroffene Verträge: der Frontend-Build erzeugt öffentliche Suchmetadaten aus den vorhandenen Werkstatt- und Lernreiseübungen. Der lokale Notizenspeicher trennt Konten und Gastprofil. Bisherige Notizen ohne Kontozuordnung bleiben im Gastprofil. Aktualisierte Nutzungs- und API-Beschreibungen stehen in README.md und docs/09-API-Referenz.md.

Abnahme: Neu- und Wiederstart, Direktlink, Zurück, konkrete Suchbegriffe aus unterschiedlichen Bereichen, richtige Detailziele, Filter und Seitennavigation, Treffer aus 7.000 Fragen jenseits des bisherigen Limits, keine Datenübertragung aus lokalen Notizen, produktionsnaher Build, frischer Review und Archivprüfung.

## Umsetzung und Prüfung

- `/` und `/willkommen` sind Einstiegspunkte für Gäste und angemeldete Konten. Das Dashboard hat die feste Adresse `/dashboard`. Browser-Zurück, direkte Lernlinks und die freiwillige Führung wurden mit neuen und bestehenden Profilen geprüft.
- Die öffentliche Suche indiziert alle 7.000 Fragen, Erklärungen, Module, Theorie- und Glossarthemen, 94 geführte Lernreiseabschnitte, die öffentlichen Praxismodelle und 167 Werkstattlektionen. Sie verwendet die gemeinsame IT-Begriffsliste. Gesamtzahl und Seitennavigation reichen über das frühere 100-Fragen-Fenster hinaus. Die bisherige Fragen-/Modul-API bleibt verfügbar.
- Die allgemeine Suche berücksichtigt App-Funktionen und die Berechtigungen des aktuellen Profils. Persönliche Notizen werden auf dem Gerät durchsucht. Beim Suchbereich „Eigene Notizen“ verlässt auch die Eingabe den Browser nicht. Alte lokale Notizen bleiben dem Gastprofil zugeordnet. Suchergebnis und Rückweg wurden auch nach Kontowechsel in einem zweiten Tab geprüft.
- Der unabhängige Browserreview erreichte aus der Suche unter anderem Glossardetails, Werkstattlektionen, freie und gesperrte Lernreisethemen sowie die letzte Frage auf Trefferseite 1.167. Ein Wechsel zwischen den Prüfnutzerkonten legte keine Notizen des vorherigen Kontos offen. Für die gesonderte Materialsuche wurde eine simulierte Antwort verwendet.
- 1.074 Backendtests bestanden im Gesamtlauf. Die gezielten Prüfungen für Suchindex und Theorie wurden nach den letzten Ergänzungen wiederholt. 56 bestehende Browserabläufe bestanden beim ersten Produktionsbuild. Am abschließenden Build bestanden alle 36 ausgewählten Browser- und Electron-Fälle einschließlich des regulären Desktopstarts. Beide beim Build erzeugten öffentlichen Kataloge wurden mit den Quelldaten verglichen.
- Nach dem Neustart des lokalen Webdienstes blieben Frage-/Modulanzahl und die Verfügbarkeit von Konto- und Push-Funktionen erhalten. Im laufenden System wurde in Hell und Dunkel der Weg Willkommen → Dashboard → Suche → „Verkaufspreis, Gewinn und Marge“ → Suchergebnisse durchgespielt.
