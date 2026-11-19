# FE-076 – LF3: Clients in Netzwerke einbinden

Status: done
Bereich: CONTENT / FE / BE
Angelegt: 2026-11-11

## Auftrag

Alle sechs geplanten LF3-Themen nach LF2 vollständig ausarbeiten und einbinden.
Öffentliche eigene Inhalte; private Dateien, PDF, Suchdaten und Zugangsdaten
nicht lesen oder verwenden. Keine neuen Bibliotheken, kein Commit/Push/Installer.
Bestehende Änderungen und Lernstände erhalten; laufende Web-App zuletzt aktualisieren.

## Allowlist

- README.md
- content/learning-journey/fiae.v1.json
- content/learning-journey/README.md
- content/learning-journey/topics/common-lf3-physical.v1.json
- content/learning-journey/questions/common-lf3-physical.v1.csv
- content/learning-journey/topics/common-lf3-protocols.v1.json
- content/learning-journey/questions/common-lf3-protocols.v1.csv
- content/learning-journey/topics/common-lf3-addressing.v1.json
- content/learning-journey/questions/common-lf3-addressing.v1.csv
- content/learning-journey/topics/common-lf3-services.v1.json
- content/learning-journey/questions/common-lf3-services.v1.csv
- content/learning-journey/topics/common-lf3-access.v1.json
- content/learning-journey/questions/common-lf3-access.v1.csv
- content/learning-journey/topics/common-lf3-diagnosis.v1.json
- content/learning-journey/questions/common-lf3-diagnosis.v1.csv
- backend/src/journey.js
- backend/test/journey.test.js
- backend/test/journey-ai.test.js
- scripts/validate-learning-journey.mjs
- scripts/test/learning-journey-content.test.mjs
- scripts/test/journey-state.test.mjs
- scripts/test/journey-network.test.mjs
- frontend/src/utils/journeyNetwork.js
- frontend/src/components/JourneyNetwork.jsx
- frontend/src/components/JourneyEntry.jsx
- frontend/src/pages/LernreiseAbschnitt.jsx
- frontend/src/store/journeyStore.js
- frontend/src/styles/journey.css
- frontend/public/sw.js
- desktop/journey-storage.cjs
- desktop/main.js
- desktop/test/journey-storage.test.cjs
- e2e/tests/journey-next.spec.js
- e2e/tests/journey-lf2.spec.js
- e2e/tests/journey-lf3.spec.js
- docs/61-Lernreise-FIAE-Planung.md
- docs/70-Lernreise-LF3.md
- docs/agent-briefs/FE-076-lernreise-lf3.md
- docs/agent-briefs/STATUS.md
- docs/agent-briefs/DONE.md

## Inhaltsvertrag

94 Themen / 248 Planziele, bestehende IDs, Titel, Ziele, Voraussetzungen und
Version 1.0.0 unverändert. Sechs LF3-Themen mit zwölf Zielen erweitern 33 auf
39 Freigaben (55 geplant). Je vier Blöcke, sechs Quizfragen, acht getrennte
Mini-Test-Fragen, drei Reflexionen, sechs Karten: 24 Blöcke, 84 Fragen,
18 Reflexionen, 36 Karten. Insgesamt 103 Ziele / 156 Blöcke / 546 Fragen /
117 Reflexionen / 234 Karten. SC/ALLE/NETZ-GRUND/LF3, eigene CSVs mit
LJ-LF3-<SUFFIX>-Q01…Q06 und E01…E08. Prüfungspools disjunkt; alle Ziele in
beiden Fragephasen, Reflexionen und Karten, geprüfte Kenntnisse zuvor erklärt.
Öffentliche Primärquellen aktuell prüfen. Eigene fiktive Fälle; Dokumentationsnetze,
keine realen Zugangsdaten. IPv4-Rechnungen, IPv6-Kürzung, Einheiten und Sicherheits-
aussagen genau abgrenzen. Geführte Grundlagen, keine vorweggenommene Netzwerkadmin-
Vollausbildung. Keine Aussage, ping beweise eine funktionierende Anwendung.
Optionen werden gemischt: Rohpositionen kein Finding. Längenbias, exklusiv falsche
wiederkehrende Phrasen (3+ Fragen) und dreifach gleiche Distraktoreinstiege sind
Findings; generische Fachwörter allein nicht. Vollständiger frischer Fachreview
aller 84 Fragen und zugehöriger Inhalte vor reviewed/checkedAt/content-ready.

### common-lf3-physical – Netzwerkkomponenten und Übertragungswege
Voraussetzungen: common-lf2-hardware
- common-lf3-physical-path: Den Verbindungsweg eines Clients über Netzwerkkomponenten in einem einfachen Netzplan verfolgen.
- common-lf3-physical-medium: Kabelgebundene und drahtlose Anbindung nach Reichweite, Störanfälligkeit und Bedarf vergleichen.

### common-lf3-protocols – Schichten und Protokolle
Voraussetzungen: common-lf3-physical
- common-lf3-protocols-layers: Die Aufgaben von Ethernet, IP, TCP beziehungsweise UDP und Anwendungsprotokollen im Datenweg unterscheiden.
- common-lf3-protocols-units: Datenmengen und Übertragungsraten korrekt zuordnen und eine ideale Übertragungszeit berechnen.

### common-lf3-addressing – IP-Adressen und Teilnetze
Voraussetzungen: common-lf3-protocols
- common-lf3-addressing-ipv4: Für ein einfaches IPv4-Netz mit vorgegebenem Präfix Netzzugehörigkeit, Hostbereich und Gateway prüfen.
- common-lf3-addressing-ipv6: Eine IPv6-Adresse lesen und grundlegende Unterschiede zur IPv4-Adressierung erläutern.

### common-lf3-services – Clientkonfiguration mit DHCP und DNS
Voraussetzungen: common-lf3-addressing
- common-lf3-services-configure: IP-Adresse, Präfix, Gateway und DNS-Einstellung eines Clients passend zum Netzplan setzen.
- common-lf3-services-explain: Adressvergabe durch DHCP und Namensauflösung durch DNS an einer Clientanfrage unterscheiden.

### common-lf3-access – Netzwerkzugang sicher einrichten
Voraussetzungen: common-lf3-services
- common-lf3-access-identity: Authentifizierung und Zugriffsberechtigung bei der Netzanmeldung unterscheiden.
- common-lf3-access-connection: Für einen Client passende WLAN-Sicherheits- und Zugangsregeln aus einer Vorgabe anwenden.

### common-lf3-diagnosis – Eine Clientverbindung systematisch prüfen
Voraussetzungen: common-lf3-access
- common-lf3-diagnosis-isolate: Mit vorgegebenen Diagnoseausgaben Fehler bei Verbindung, IP-Konfiguration und Namensauflösung unterscheiden.
- common-lf3-diagnosis-record: Prüfschritte, Ergebnisse und Änderungen so protokollieren, dass ein anderes Teammitglied sie nachvollziehen kann.

## Integration

Alle 33 LF1-/WISO-/PM-/LF2-Themen als Zugangsvoraussetzungen für LF3; danach
fachliche Voraussetzungen plus vorheriges verfügbares Thema. LF2 führt zu LF3,
LF3 zu geplantem LF4. Alte Manifestfassungen und 1/2/6/16/26/33 Freigaben bleiben
lesbar. Sechs feste neue Web-/Desktopablagen, alte 33 einschließlich PM-Tabellen
und LF2-Modell unverändert. Kein neuer Kontosync, kein Modellzustand im KI-DTO.
Diagnose-Thema: fieldReview aller sechs Themen in Reihenfolge, Block 4,
Reflexion 3 und alle acht Testfragen. Testfragen daraus lösbar. Reflexion 2
enthält practice im bisherigen task/checklist/confirmation-Format.

## Begrenztes Netzwerklabor

Nur Diagnose-Thema, lokale Simulation ohne echten Netzwerk-, Shell-, Datei-
oder Systemzugriff. Drei aufeinanderfolgende Störungen: Verbindung unterbrochen,
falsches Clientnetz, falscher DNS. Fester Plan 192.0.2.0/24, Gateway 192.0.2.1,
DNS 192.0.2.53, bereits belegter anderer Client 192.0.2.10. Portalname
portal.example.test, Server in anderem Netz 198.51.100.20. Modellannahmen
explizit: Server/Router/Firewall funktionieren, Proben sind synthetisch.
Ausgangsclient .20; freie Hostadressen .2–.254 außer .10/.53 erlaubt, .1 ist Gateway.
Lernende rufen erst Diagnoseausgaben ab, ordnen die Fehlerart zu, ändern
Verbindung/IP/Präfix/Gateway/DNS und prüfen erneut. Kein bloßes Matching einer
vorgegebenen einzigen Clientadresse. Diagnose unterscheidet Link, Adresse,
Gateway, DNS und Anwendung. Prüfausgaben sind ausdrücklich Modellausgaben.

Strikter optionaler network-Zustand nur hier: index 0..2 und drei Fälle mit
linked, ip, prefix, gateway, dns, diagnosis, observed, checked, done. Nur feste
Enums, begrenzte IPv4-Eingabetexte und Booleans. Unbeobachtete Fälle unverändert;
Bearbeitung erst nach erster Probe; spätere Fälle bis Abschluss des Vorgängers
gesperrt. Änderungen verwerfen Prüfung. Fallabschluss erst bei passender Diagnose
und funktionierender Konfiguration; alle drei vor bewusster Reflexionsbestätigung.
Abgeschlossene Fälle sind readonly. Protokoll hält Ausgangsbefund, Einordnung,
Änderungen und erneute Probe im Modell fest; danach bleibt es lesbar.
Sicherung/Neuladen/Desktop-Neustart erhalten alle Fälle. Keine Zertifizierungs-
oder Echthardwarekompetenzbehauptung. Private KI bleibt lokal und optional.

## Abnahme

Vollständige unabhängige Inhaltsreviews; frischer Technikreview. Alle sechs
Lernabläufe, Rückblick/Gates, Laborkorrektur/mehrere gültige Adressen/Fehladressen,
Reihenfolge, Sicherung, alter Fortschritt, readonly und vollständiger Electron-
Neustart mit 39 Themen prüfen. Reine Modelltests, Zustands-/Inhalts-/Backend-/
Desktop-/Browsermatrix, Mobil/Tastatur/Build und öffentliche App-API grün.
Dokumentation sachlich, Archivcheck zwingend; keine echten privaten Testdaten.

## Review und Umsetzung

- Frischer Grundlagenreview: alle 42 Fragen/168 Optionen der ersten drei Themen,
  zwölf Blöcke, neun Reflexionen, 18 Karten und sechs Lernziele vollständig
  geprüft; Quellen aktuell online abgeglichen. Eine ausgeschriebene IPv6-Adresse
  auf acht Gruppen korrigiert. Fremdnetzbeispiele einschließlich des Labors
  konsequent auf Dokumentationsnetze umgestellt; falsche Clientkonfiguration
  lautet im Labor jetzt 198.51.100.25/24. Korrekturen unabhängig nachgeprüft,
  keine offenen Befunde.
- Frischer Dienst-/Zugangs-/Diagnosereview: alle weiteren 42 Fragen/168 Optionen,
  zwölf Blöcke, neun Reflexionen, 18 Karten und sechs Ziele vollständig geprüft.
  DHCP/DNS/Gateway, A/AAAA, Lease/TTL, Identität/Berechtigung und konkrete
  WLAN-Vorgaben abgegrenzt. Rückblick aller sechs Themen und Modellpraxis mit
  Implementierung verglichen, Adresskorrektur nachgeprüft. Keine offenen Befunde.
  Insgesamt 127 Quellen-IDs im Manifest, alle LF3-Referenzen konfliktfrei.
- Frischer Technikreview: drei Modellfälle, freie Hostadressen, strenge Zustände,
  Reihenfolge, readonly, lokale Speicherung, Legacy-Verträge, DTO-/KI-Abgrenzung,
  Testabdeckung und Dokumentation geprüft. Eine Importlücke korrigiert: Ein
  begonnener oder abgeschlossener Laborstand verlangt auch im Sicherungsimport
  die vorherige erste Selbstreflexion. Reproduktion und Korrektur unabhängig
  bestätigt; Regression für Validator und Sicherung hinzugefügt.
- 409 Inhalts-/Zustands-/Kalkulations-/Modellfälle einschließlich aller 256
  letzten IPv4-Oktette und 45 Desktopfälle grün. Backend-Code und geänderte Tests
  mit den tatsächlichen Node-Globals geprüft. Alle 726 Backendfälle grün,
  ohne echte Datenbank oder KI-Anfragen und mit gesperrtem Lesen privater
  Konfigurationsinhalte.
- Alle 90 Browser-/Electronfälle im Gesamtlauf grün, darunter sechs vollständige
  LF3-Themen, drei Fehlerfälle, alternative Hostadressen, falsche Einordnung,
  Präfix/Adressfehler, Sicherung, Fortsetzung, unveränderte Nachbarstände und
  acht echte Electron-Szenarien. Der vollständige Neustart erhält 39 Themen
  einschließlich der drei geprüften Netzwerkfälle.
- Mobile Ansicht bei 390 px ohne Seitenüberbreite; DNS-Eingabe, Tab-Reihenfolge
  zu Präfix/Diagnose/Prüfen und Enter mit bestätigter Speicherung getestet.
  Mobilbild unabhängig geprüft, keine offenen visuellen oder technischen Befunde.
- Frontendbuild erfolgreich (bekannte Warnung zu großen bestehenden Bündeln).
  Laufende normale Web-App kontrolliert aktualisiert: 39/94 Themen, LF2 → LF3,
  sechs Themen im Rückblick und nächstes LF4 geplant. Service Worker v65;
  bestehende Datenbank unverändert mit 7.000 Fragen/26 Modulen, Login/Sync aktiv.
- README, Inhaltsübersicht, Gesamtplan, LF3-Dokumentation und Folgearbeit
  aktualisiert. Keine neuen Pakete, kein Commit/Push. Abschließende Archiv-
  und Diffprüfung erfolgreich.
