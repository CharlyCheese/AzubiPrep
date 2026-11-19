# Lernreise – LF3: Clients in Netzwerke einbinden

Stand: 2026-11-11 · FE-076 · R4 des [FIAE-Plans](61-Lernreise-FIAE-Planung.md)

## Themen und Ablauf

Die sechs LF3-Themen folgen auf alle 33 bisherigen LF1-, WISO-, PM- und
LF2-Abschlüsse. Fachliche Voraussetzungen und die empfohlene Reihenfolge bleiben
verbindlich:

1. Netzwerkkomponenten und Übertragungswege
2. Schichten und Protokolle
3. IP-Adressen und Teilnetze
4. Clientkonfiguration mit DHCP und DNS
5. Netzwerkzugang sicher einrichten
6. Eine Clientverbindung systematisch prüfen

Jedes Thema besitzt vier Theorieblöcke, sechs Quizfragen, drei Reflexionen,
sechs Karten und acht separate Mini-Test-Fragen. LF3 ergänzt zwölf Lernziele,
24 Blöcke, 84 Fragen, 18 Reflexionen und 36 Karten. Der gesamte ausgearbeitete
Bestand umfasst damit 39 von 94 Themen, 103 Lernziele und 546 Lernreisefragen;
55 Themen bleiben geplant. Die vorhandenen 7.000 Modulfragen bleiben unverändert.

Netzpläne, Geräte und Sicherheitsvorgaben sind ausdrücklich beschriebene Lernfälle.
Adress- und Übertragungsrechnungen erklären ihre Annahmen. IPv4-Präfixe, IPv6,
Bit/Byte sowie SI-/IEC-Einheiten werden schrittweise eingeführt. DHCP-Konfiguration,
DNS-Namensauflösung und Routing werden getrennt behandelt. Eine erfolgreiche
IP-Erreichbarkeitsprobe beweist keine funktionierende Anwendung.

Der vierte Block des Diagnosethemas wiederholt alle sechs Themen. Dessen letzte
Reflexion und alle acht Testfragen beziehen sich auf diesen Rückblick. Sieben
richtige Antworten bestehen einen Mini-Test. Sechs gültige Themenabschlüsse samt
Rückblick ergeben den LF3-Abschluss; danach ist LF4 als nächste geplante Etappe
sichtbar. Die gesamte FIAE-Lernreise ist damit noch nicht abgeschlossen.

## Netzwerklabor

Die zweite Reflexion des Diagnosethemas enthält drei aufeinanderfolgende
Modellstörungen: unterbrochene Verbindung, Client im falschen Netz und falscher
DNS-Dienst. Erst die Ausgangsprobe abrufen, dann den Befund einordnen, passende
Werte setzen und erneut prüfen. Eine funktionierende Konfiguration allein reicht
nicht: Auch die Einordnung des ursprünglichen Fehlers muss stimmen.

Der feste Plan nutzt ausschließlich Dokumentationsadressen: Clientnetz 192.0.2.0/24,
Gateway 192.0.2.1 und DNS 192.0.2.53; ein anderer Client belegt .10. Freie Hostadressen
.2 bis .254 außer .10 und .53 sind gültige Alternativen. Netzadresse .0,
Broadcastadresse .255 und der bereits belegte Router .1 sind keine passende
Clientwahl. Das Modellportal liegt unter `portal.example.test` bei 198.51.100.20
in einem anderen Netz. Server, Router und Firewall funktionieren gemäß der
offengelegten Modellannahme.

Jede Änderung verwirft den alten Prüfstatus. Ein Fall wird erst nach erneuter
erfolgreicher Probe und passender Einordnung abgeschlossen. Bereits erledigte
Fälle bleiben unveränderlich; der nächste Fall öffnet erst danach. Das Protokoll
enthält Ausgangskonfiguration, Befund, Einordnung, endgültige Konfiguration und
erneute IP-, Namens- und Anwendungsprobe. Nach allen drei Fällen ist zusätzlich
die bewusste Bestätigung der praktischen Aufgabe erforderlich.

Die Simulation führt keine Shellbefehle aus, sendet keine Netzwerkpakete und
ändert keine echten Systemeinstellungen. Es gibt keinen Beleg echter
Netzwerkadministration und kein manipulationssicheres Zertifikat. Reale Übungen
gehören in eine freigegebene Ausbildungsumgebung unter Anleitung.

## Lokale Speicherung und Grenzen

Sechs neue feste Ablagen ergänzen die bisherigen 33 im Browser beziehungsweise
Desktopprofil. Der Laborstand gehört ausschließlich zum Diagnosethema und dessen
Sicherung; vorhandene Themenstände, PM-Tabellen und LF2-Einrichtungsübung bleiben
kompatibel. Planversion und alte Inhaltsfassungen werden nicht geändert.

Nur feste Felder, begrenzte Adresstexte, Auswahlwerte und Wahrheitswerte sind
zulässig. Unbekannte Felder und ungültige Schrittfolgen werden zurückgewiesen.
Auch ein Sicherungsimport darf kein begonnenes Labor vor der ersten abgeschlossenen
Reflexion einschleusen. Ein bestätigter Praxisabschnitt benötigt alle drei
abgeschlossenen Fälle. Eingaben werden lokal gespeichert; Prüf- und Fortschritts-
aktionen warten auf bestätigte Speicherung. Kontosync übernimmt den Laborstand
nicht, ebenso wenig der automatisch zusammengestellte KI-Kontext.

Lehrtexte beruhen auf öffentlichen Primärquellen und eigenständig formulierten
Beispielen. Private Unterlagen und abgeleitete Suchdaten werden dafür nicht
gelesen. Die bisherige freiwillige private KI-Ergänzung bleibt ausschließlich
beim lokalen Anbieter. Tests verwenden getrennte Profile und synthetische Daten.

## Prüfstand

Zwei unabhängige Fachreviews haben alle 84 Fragen samt 336 Antwortoptionen und
alle zugehörigen Lehrinhalte vollständig geprüft. Der frische technische Review
einschließlich der korrigierten Importgrenze und der mobilen Ansicht ist ohne
offene Befunde abgeschlossen.

409 Inhalts-/Zustands-/Rechen-/Modellfälle, 726 Backendfälle, 45 Desktopfälle und
alle 90 Browser-/Electronfälle sind grün. Darunter sind die sechs vollständigen
LF3-Abläufe, alle drei Laborstörungen, alternative freie Adressen, fehlerhafte
Präfixe/belegte Adressen, Sicherung und Neuladen sowie ein vollständiger
Electron-Neustart mit allen 39 Themenständen. Bei 390 px wurden Seitenbreite,
Tab-Reihenfolge und Prüfung per Enter getestet; das Mobilbild wurde unabhängig
angesehen. Die bisherigen Etappen und PM-/LF2-Übungen bleiben grün.

Der Frontendbuild ist erfolgreich; die bekannte Warnung zu großen bestehenden
Bündeln bleibt. Die aktualisierte Web-App bestätigt 39/94 Themen, LF2 → LF3,
den vollständigen Rückblick mit sechs Themen und Service Worker v65. Die bestehende
Datenbank liefert weiterhin 7.000 Modulfragen; Login/Sync bleiben aktiv.
Weitere Einzelheiten stehen im [Arbeitsbrief](agent-briefs/FE-076-lernreise-lf3.md).
Neue Installationspakete, Commit und Push gehören nicht zu diesem Auftrag.
