# Lernreise – Unternehmensziele und Zielkonflikte

Stand: 2026-11-11 · FE-071 · Beginn von R4 im
[FIAE-Lernreiseplan](61-Lernreise-FIAE-Planung.md)

## Umfang

Das zweite LF1-Thema verbindet wirtschaftliche, ökologische und soziale
Unternehmensziele mit einfachen Zielkonflikten im IT-Alltag. Es baut auf
„Unternehmen, Kunden und die eigene Rolle“ auf. Beide geplanten Lernziele
bleiben unverändert. Der Abschnitt enthält vier Theorieblöcke, sechs Quizfragen,
drei Reflexionsimpulse, sechs Karten und acht getrennte Mini-Test-Fragen.

Die Aufgabe folgt immer auf die dafür nötige Theorie. Jede Frage, Karte und
Reflexion verweist auf passende Blöcke und Lernziele. Erklärungen und fiktive
Fälle sind eigenständig aus öffentlichen Fachgrundlagen verfasst. Private
Unterlagen wurden für diesen öffentlichen Inhalt nicht gelesen oder verwendet.

Zwei von 84 geplanten Themen sind verfügbar; 82 bleiben offen. Zwei bestandene
Themen sind weder ein vollständiges LF1 noch eine abgeschlossene FIAE-Ausbildung.
Nächster geplanter Abschnitt: „Kunden, Lieferanten und Wettbewerb“.

## Fortsetzung und Bewertung

Die Lernreiseübersicht zeigt die verfügbaren Themen in Reihenfolge mit ihrem
gespeicherten Status. „Lernreise fortsetzen“ führt zum ersten noch nicht
bestandenen zugänglichen Thema. Ein bestandener erster Mini-Test schaltet das
zweite Thema frei; ein direkter Link prüft dieselbe Voraussetzung. Aus der
ersten Auswertung führt „Nächstes Thema“ unmittelbar dorthin. Bereits bearbeitete
Themen bleiben über die Übersicht erreichbar.

Der bisherige beste bestandene Versuch gilt auch nach einem schwächeren
Wiederholungsversuch weiter. Wird die lokale Voraussetzung ersetzt/entfernt,
bleibt der zweite Stand erhalten, bis die Voraussetzung wieder vorliegt.
Die Führung ist eine lokale Lernhilfe, kein manipulationssicheres Zertifikat.

Der zweite Mini-Test verwendet acht gleich gewichtete Fragen und 80 Prozent
als Schwelle, also mindestens sieben richtige Antworten. Die Auswertung zeigt
die zwei Lernziele gesondert. Wiederholungen nutzen denselben Aufgabenpool.
Optionale Theoriehilfe und KI-Fachgespräch übernehmen den Kontext des gewählten
Themas über die bestehende R3-Anbindung. KI-Antworten bewerten keinen Fortschritt.
Die Trennung privater lokaler Kontexte von Cloudanfragen bleibt unverändert.

## Erhalt bestehender Daten

Die Freigabe ist eine additive Ergänzung des vorhandenen Plans. Schema und
Planversion 1.0.0 sowie die Version des ersten Themas bleiben unverändert.
Es gibt keine automatische Migration oder Neuschreibung des ersten Lernstands.

| Thema | Webschlüssel | Desktopdatei im App-Profil unter `lernreise-v1/` |
|---|---|---|
| Eigene Rolle | `azubiprep.journey.fiae.v1` | `journey.json` |
| Unternehmensziele | `azubiprep.journey.fiae.common-lf1-goals.v1` | `common-lf1-goals.json` |

Sperren, Revisionen und bestätigter Ersatz gelten pro Thema. Desktopdateien
werden atomar geschrieben; der Aufrufer darf nur bekannte Themen auswählen,
keine Dateipfade. Thema und gespeicherte Zustandskennung müssen übereinstimmen.
Beschädigte und unbekannte Stände bleiben für bewusste Sicherung erhalten.

Sicherungen werden pro Themenabschnitt exportiert und dort wieder eingelesen.
Ein Import für das falsche Thema wird abgewiesen. Ein bestätigter Ersatz ändert
den anderen Themenstand nicht. Je Thema gelten 128 KiB, zehn jüngste
Testzusammenfassungen und der beste Versuch. Kein neuer Kontosync, keine XP-
oder Leitner-Übernahme; der bisherige 7.000-Fragen-Katalog bleibt unverändert.

## Prüfstand

Automatische Prüfungen und unabhängige Reviews werden im
[Arbeitsbrief](agent-briefs/FE-071-lernreise-lf1-ziele.md) festgehalten.
Abgeschlossen: 92 Inhaltstests, 17 Zustandstests, 333 Backendtests,
39 Desktoptests und 34 E2E-Tests; keine offenen Findings aus Fach- und
Technikreview. Der zweite Abschnitt wurde komplett mit 8/8 Testantworten
durchlaufen, seine Fortsetzung und beide Stände nach Desktopneustart geprüft.
Die mobile Übersicht wurde zusätzlich visuell kontrolliert. Frontendbuild
erfolgreich; die bekannte Warnung großer Bundles bleibt bestehen.
Neue Web-/Desktop-Verteilungspakete gehören nicht zu diesem Schritt.
