# Lernreise – vollständiges LF1 im App-Lernweg

Stand: 2026-11-11 · FE-072 · R4 aus dem
[FIAE-Lernreiseplan](61-Lernreise-FIAE-Planung.md)

## Umfang und Reihenfolge

| Thema | Schwerpunkte |
|---|---|
| Unternehmen, Kunden und die eigene Rolle | Leistung/Nutzen, Rollen, eigene Zuständigkeit |
| Unternehmensziele und Zielkonflikte | Wirtschaftliche, ökologische und soziale Ziele; begründete Abwägung |
| Kunden, Lieferanten und Wettbewerb | Beziehungen und vergleichbare Angebote passend zum Kundenbedarf |
| Vom Kundenwunsch zur Wertschöpfung | Auftragsablauf, Beiträge zur nutzbaren Gesamtleistung und Übergaben |
| Organisation und Entscheidungsspielräume | Organigramm, Einzelunternehmen/GmbH, Aufgabe und Befugnis |
| Ein Unternehmen verständlich vorstellen | Zielgruppe, eigene multimediale Darstellung, Vortrag, Verbesserung und LF1-Rückblick |

Alle sechs Themen enthalten je vier Theorieblöcke, sechs Übungsfragen, acht
getrennte Mini-Test-Fragen, drei Reflexionsimpulse und sechs Karten. Das sind
24 Blöcke, 84 eigene Lernfragen, 18 Gesprächsimpulse und 36 Karten für die
15 geplanten LF1-Lernziele. Der bestehende allgemeine Fragenkatalog mit 7.000
Fragen wird dadurch nicht verändert und nicht in die Themenpools gemischt.

Die vier neuen Themen sind eigenständig aus öffentlichen Fachgrundlagen
ausgearbeitet. Für Rechtsform und Befugnisse wurden aktuelle amtliche Quellen
herangezogen. Beispiele, Unternehmen und Zahlen sind fiktiv. Private Unterlagen,
Suchdaten oder KI-Kontoablagen wurden nicht gelesen oder für diese Inhalte genutzt.

## Rückblick und praktische Präsentation

Das letzte Thema enthält einen veröffentlichten Rückblick über alle sechs
Themen: eigener Theorieblock, konkrete Reflexionsaufgaben mit Kernpunkten und
acht dazu passende Prüfungsaufgaben zur Unternehmensdarstellung. Diese Bezüge
sind als `fieldReview` gespeichert und werden vom Validator und Backend geprüft.

Die zweite Reflexion dieses Themas fordert eine eigene kurze Darstellung mit
Text und einer Visualisierung, einen tatsächlichen Vortrag sowie eine Prüfung
und Verbesserung anhand fester Kriterien. Sie kann außerhalb der App und auch
allein durchgeführt werden; ein Dateiupload ist nicht erforderlich. Erst eine
bewusste Bestätigung aktiviert den Abschluss dieses Schritts. Ein angekreuztes,
aber noch nicht abgeschlossenes Formular wird nach Neuladen erneut bestätigt.
Der erfolgreich gespeicherte Reflexionsschritt bleibt anschließend erhalten.

Diese Bestätigung ist eine Selbstauskunft. Weder Multiple Choice noch KI-Lob
beweisen die Qualität eines tatsächlichen Vortrags. Mini-Tests prüfen die festen
fachlichen Kriterien; die praktische Durchführung wird nicht automatisch benotet.
Die optionale KI-Hilfe bleibt beim jeweiligen Thema, ohne Fortschritt zu vergeben.

## Lernfeldabschluss und weitere Reise

Die geführte Navigation berücksichtigt die fachlichen Voraussetzungen und das
vorherige veröffentlichte Thema. Ein Mini-Test gilt ab sieben von acht richtigen
Antworten als bestanden. Vorherige Themen und ihre festen Erklärungen bleiben
zum Nachlesen und Wiederholen erreichbar.

„LF1 in der Lernreise abgeschlossen“ erscheint nur bei sechs gültigen bestandenen
Themenständen und veröffentlichtem Rückblick im letzten Thema. Dazu gehören die
vorangehenden Lernphasen und die selbst bestätigte Präsentation. Die Anzeige wird
aus den aktuellen gespeicherten Ständen berechnet; eine entfernte oder ungültige
Voraussetzung bleibt sichtbar und wird nicht durch eine alte Abschlussmarkierung
verdeckt. Ein schwächerer späterer Test entfernt einen früheren bestandenen Versuch
nicht. Die Einschätzung ist kein manipulationssicherer Leistungsnachweis.

LF1 umfasst sechs von 84 geplanten Themen. 78 Themen bleiben offen, darunter die
zusätzliche Wirtschafts- und Sozialkunde und die FIAE-Spezialisierung. Als Nächstes
folgt gemäß Plan „Ausbildung im dualen System“. Die App behauptet keinen Abschluss
der gesamten FIAE-Lernreise und keine berufliche Qualifikation.

## Bestehender Fortschritt und Datenschutz

Die beiden bestehenden Themen, Lernziele, Inhaltsfassungen, Webschlüssel und
Desktopdateien bleiben unverändert. Vier neue feste Themenablagen kommen hinzu.
Die additive Freigabe benötigt keine Migration; Planversion und Speicherschema
bleiben 1.0.0 beziehungsweise 1. Jeder Abschnitt kann separat gesichert werden.
Sicherungsnamen der neuen Themen enthalten ihre Kennung zur Unterscheidung.

Webschlüssel: `azubiprep.journey.fiae.common-lf1-<thema>.v1`; Ausnahme bleibt der
erste Schlüssel `azubiprep.journey.fiae.v1`. Desktop: je Thema
`lernreise-v1/common-lf1-<thema>.json`, erster Abschnitt unverändert `journey.json`.
Feste Kennungen begrenzen die Auswahl; freie Dateipfade werden nicht angenommen.
Revisionen, atomare Speicherung und Sicherungsersatz wirken nur auf ein Thema.
Je Thema gelten weiterhin 128 KiB und zehn jüngste Testergebnisse plus Bestwert.

Private lokale KI-Kontexte, Cloudfreigaben und Kontentrennung bleiben unverändert.
Prüfungen verwenden synthetische oder öffentliche Daten, keine privaten Bücher
und keine echten Cloudanfragen. Der Lernreisestand wird weiterhin nicht mit einem
Konto synchronisiert; es entstehen keine zusätzlichen XP oder Leitner-Einträge.

## Prüfung und Verteilung

Die Abschlussnachweise stehen im [Arbeitsbrief](agent-briefs/FE-072-lernreise-lf1-abschluss.md).
Bestanden: 121 Inhaltstests, 19 Zustandstests, 373 Backendtests, 40 Desktoptests
und 41 E2E-Tests ohne Retries oder Skips. Alle vier neuen Themen wurden komplett
bis zur Auswertung durchlaufen. Mobile Abschlussübersicht visuell kontrolliert;
Tastatur, Reload und vier echte isolierte Electron-Läufe ebenfalls geprüft.
Zwei unabhängige Fachreviews und ein technischer Review sind abgeschlossen,
ohne offene Findings. Frontendbuild erfolgreich, bestehende Bundlegrößenwarnung.
Web und Electron verwenden dieselben geprüften Inhalte. Neue Installations- oder
Weitergabepakete und ein GitHub-Push sind nicht Bestandteil dieses Schritts.
