# Lernreise – LF4 bis LF6

Stand: 2026-11-16 · FE-077 · R4 des [FIAE-Plans](61-Lernreise-FIAE-Planung.md)

## Umfang und Reihenfolge

Die Lernreise führt von LF1 über WISO, Projektmanagement, LF2 und LF3 zu den
drei neuen Lernfeldern. Alle bisherigen Etappen und die fachlichen Voraussetzungen
bleiben Zugangsvoraussetzung. Die 18 neuen Themen ergänzen 46 Ziele, 72 Blöcke,
252 Fragen, 54 Reflexionen und 108 Karten. Insgesamt sind 57 von 94 geplanten
Themen verfügbar: 149 Ziele, 228 Blöcke, 798 Lernreisefragen, 171 Reflexionen,
342 Karten. 37 Themen bleiben geplant; die nächste Etappe ist LF7.
Die bestehenden 7.000 Modulfragen und ihre Datenbankspiegelung bleiben unverändert.

| Lernfeld | Themen in Reihenfolge | Abschlussübung |
| --- | --- | --- |
| LF4 | Schutzziele; Schutzobjekte/Bedrohungen/Schäden; personenbezogene Daten; Schutzbedarf; Maßnahmen | Schutzbedarfsanalyse eines fiktiven Servicearbeitsplatzes |
| LF5 | Anforderungen; Typen/Ausdrücke; Bedingungen/Schleifen; Funktionen; Objekte; Datenspeicherung; SQL; Testen | Bestandsverwaltung und eigene JavaScript-Funktion |
| LF6 | Anfrageaufnahme; Vereinbarungen/Priorität; Diagnose; Lösung; Abschluss | Durchgängiger Servicefall |

Jedes Thema enthält vier Theorieblöcke, sechs Quizfragen, drei Reflexionen,
sechs Karten und acht davon getrennte Mini-Test-Fragen. Sieben richtige Antworten
bestehen den Mini-Test. Der vierte Block des letzten Themas wiederholt das
gesamte Lernfeld; die dritte Reflexion und alle acht Abschlussfragen beziehen
sich darauf. Theorie und Prüfungen verwenden dieselben Lernziele und erklären
benötigte Kenntnisse vor der jeweiligen Aufgabe.

## LF4: Schutzbedarf begründen

Der fiktive Servicearbeitsplatz verarbeitet Ticketdaten. Lernende erfassen
Schutzobjekte und Abhängigkeiten, wählen für jedes Schutzziel eine Einstufung
und einen konkreten Schadensgrund. Die vorgegebenen Kriterien führen im Fall
zu hoch/hoch/normal: Offenlegung und manipulierte Freigaben verursachen
erheblichen Schaden; der angenommene zweistündige Ausfall wird durch einen
dokumentierten vierstündigen Papierersatz überbrückt.

Diese Einstufungen sind Fallvorgaben, keine allgemeingültige Bewertung von
Ticketsystemen. Wahrscheinlichkeit und Schutzbedarf bleiben getrennt.
Maßnahmen werden mit beobachtbaren Wirksamkeitsprüfungen und zuständigen Rollen
verbunden. Die Übung ändert keine tatsächlichen Berechtigungen oder Systeme.

## LF5: Daten lesen, ändern und prüfen

Die lokale Tabelle `stocks(id, name, quantity)` beginnt mit Kabel/8, Maus/2 und
Adapter/0. Ein geführter Baukasten zeigt die SQL-Anweisung und führt genau die
vorgegebenen Operationen auf diesem synthetischen Bestand aus:

1. Artikel mit weniger als drei Stück nach Namen sortiert lesen.
2. Tastatur mit neuer ID 4 und fünf Stück hinzufügen.
3. Maus mit ID 2 auf sechs Stück ändern.
4. Ausgelisteten Adapter mit ID 3 entfernen.

Vor jeder Ausführung werden die betroffenen Zeilen angesehen. Fehlende Eingaben,
doppelte Schlüssel und eine zu breite Auswahl werden sichtbar. Falsche Versuche
ändern den Bestand für Folgeschritte nicht; erst ein erfolgreich geprüfter
Schritt wird übernommen. SELECT liefert eine gefilterte, sortierte Ergebnismenge.
Die Anzeige trennt Abfrageergebnis und Tabellenbestand. Der Baukasten ist kein
allgemeiner SQL-Parser und verbindet sich mit keiner echten Datenbank.

Danach wird die kleine Funktion `available(quantity, requested)` bearbeitet.
Für zwei ganze Zahlen von 0 bis 1000 liefert sie `requested <= quantity`,
für ungültige Eingaben `null`. `false` bedeutet zu wenig Bestand; `null` bedeutet
ungültige Eingaben. Eigener Code wird ausschließlich in der bereits vorhandenen
QuickJS-Laufzeit ausgeführt. 18 feste Normal-, Grenz- und Fehlerfälle prüfen
Rückgabewert und Typ. Gleichwertige Implementierungen sind erlaubt.

Code ist auf 4096 Zeichen begrenzt. Die vorhandene Laufzeit begrenzt Zeit,
Speicher, Stack, Ausgabe und nachlaufende Aufgaben. Sie bietet keinen Host-,
Datei-, Netzwerk- oder Datenbankzugriff. Die Prüfung kann gestoppt werden.
Codeänderungen verwerfen das Resultat; `testedCode` bindet eine gespeicherte
Prüfung an den tatsächlich geprüften Quelltext. Es gibt keine Signatur und
keinen Anspruch auf manipulationssichere Zertifizierung.

## LF6: Servicefall vom Eingang bis zum Abschluss

Vier Personen können Versandaufträge nicht senden, Lesen funktioniert. Die
ausdrücklich erfundene Übungsvereinbarung legt Auswirkung, Dringlichkeit,
Priorität und Reaktionsfrist fest. Montag bis Freitag von 08–17 Uhr sind
Servicezeiten; bei P1 sind 15 Serviceminuten für die erste qualifizierte Reaktion
zugesagt, keine garantierte Reparaturzeit.

Der Fall führt über Beobachtung und Hypothese zu einer kontrollierten Änderung
der veralteten Konfiguration. Zuständigkeit, Freigabe, verständliche deutsche
und englische Kommunikation, Rückfallstand und gemeinsame Funktionsprüfung
gehören dazu. Ein Rückfall begrenzt neue Nebenwirkungen; er behebt nicht
automatisch das ursprüngliche Problem. Abschlussprotokoll und Verbesserung
beziehen sich auf nachgewiesene Ergebnisse. Keine realen Tickets, Aufträge oder
Nachrichten werden erstellt oder versendet.

## Speicherung, Grenzen und Datenschutz

Die Praxis findet in der zweiten Reflexion des jeweiligen Abschlussthemas statt,
nach der ersten abgeschlossenen Reflexion. Jeder Schritt wird geprüft, bevor
der nächste beginnt. Nach der erfolgreichen Praxis ist zusätzlich die bewusste
Bestätigung erforderlich. Das abgeschlossene Protokoll bleibt lesbar und ist
innerhalb des Lernablaufs unveränderlich.

18 neue feste Ablagen ergänzen die bisherigen 39. Bestehende Lernstände,
Rechentabellen, Einrichtungs- und Netzwerkübungen bleiben kompatibel.
Sicherung und Wiederherstellung enthalten auch die neuen Modellstände; falsche
Themen, unbekannte Felder, zu große Eingaben und übersprungene Phasen werden
abgewiesen. Jeder Themenstand bleibt auf 128 KiB begrenzt. Kontosync übernimmt
diese Ablagen weiterhin nicht. Lernstände sind lokale Lernhilfen und kein
Nachweis tatsächlicher Arbeit an produktiven Systemen.

Alle Lehrtexte beruhen auf öffentlichen Primärquellen und eigenen Beispielen.
Private Unterlagen, daraus abgeleitete Daten und Zugangsdaten wurden für diese
Inhalte nicht gelesen oder verwendet. Automatisch zusammengestellte KI-Kontexte
enthalten weder Übungszustände noch eigenen Prüfcode oder Prüfungslösungen.
Die Lernreise bleibt ohne KI nutzbar. Tests verwenden isolierte Profile und
synthetische Daten ohne echte Datenbank- oder Modellaufrufe.

## Prüfstand

Drei frische Fachreviews haben sämtliche 252 Fragen mit 1008 Optionen sowie
alle Begleitmaterialien vollständig geprüft. Erkannte Formulierungs-, Syntax-
und Verknüpfungsfehler wurden korrigiert und erneut geprüft. 34 neue öffentliche
Quellen ergänzen den Bestand auf 161 Quellen-IDs.

Ein frischer Technikreview prüfte lokale Ausführung, Zustandsgrenzen, Import,
geprüften Code, SQL-Ergebnisse und Navigation. Festgestellte Anleitungs- und
Darstellungsfehler sind korrigiert; keine offenen P1/P2-Befunde. Grüne Gesamtmatrix:
473 Inhalts-/Zustands-/Modelltests (davon 414 Inhaltsverträge), 861 Backendtests,
46 native Desktoptests und 113 Browser-/Electronfälle. Alle 18 neuen Lernabläufe,
die drei Praxisabschlüsse, Fehlerkorrektur, Sicherung, alte Lernstände und ein
vollständiger Electron-Neustart mit 57 Themen sind geprüft. Bei 390 px passen
Tabelle, Editor und Schaltflächen ohne Seitenüberbreite; echter Tab-/Enter-Ablauf
und unabhängiger Bildreview abgeschlossen. Frontendbuild erfolgreich, bekannte
Warnung zu großen bestehenden Bündeln. Die normale Web-App liefert alle neuen
Themen und Service Worker v66 aus.

Neue Weitergabepakete sind nicht Bestandteil dieser Änderung. Der Entwicklungs-
und Webstand wird aktualisiert; vorhandene Installationspakete werden dadurch
nicht neu gebaut.
