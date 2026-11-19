# Lernreise – Inhaltsgrundlage und erster LF1-Abschnitt

Stand: 2026-11-10 · CONTENT-233 · R1 aus dem
[Lernreiseplan](61-Lernreise-FIAE-Planung.md)

## Ergebnis und Abgrenzung

Der neue Themenplan beschreibt **84 Themen mit 218 Lernzielen**. Davon gehören
64 zu allgemeinen Grundlagen einschließlich zehn ausdrücklich geführter
WISO-Stationen, anschließend folgen 20 FIAE-Themen. Ein Thema ist ausgearbeitet:
**„Unternehmen, Kunden und die eigene Rolle“**. Die übrigen 83 Themen enthalten
konkrete Lernziele und sichtbare Inhaltslücken, noch keine fertigen Lektionen.

Dieser Schritt liefert geprüfte Inhalte und ihren technischen Datenvertrag.
**Integrationsstand 10.11.2026:** FE-069 bindet diesen Inhalt als R2-Pilot mit
Beginnen/Fortsetzen, festem Ablauf, lokalem Fortschritt und Sicherung in die App
ein. Die technische Abnahme ist abgeschlossen; Umfang und Nachweise stehen in der
[R2-App-Dokumentation](63-Lernreise-LF1-App.md). R3 ergänzt später die
KI-Lernbegleitung. R1 änderte keine bestehenden Fragen, Kontostände,
Datenbankinhalte oder Installationspakete.

## Der erste Abschnitt

Ein erfundener IT-Dienstleister unterstützt einen erfundenen Fahrradladen bei
einer gemeinsamen Übersicht über Reparaturstände. Das Beispiel benötigt keine
Programmierkenntnisse und trennt drei Lernziele:

1. Leistung und Kundennutzen unterscheiden.
2. Beteiligte und ihre Rollen erklären.
3. Die eigene Aufgabe sorgfältig ausführen und Unklarheiten gezielt klären.

Vier Theorieblöcke bauen aufeinander auf:

| Block | Inhalt | Beispiel / Abgrenzung |
|---|---|---|
| Was leistet das Unternehmen? | Produkte/Dienstleistungen, Leistung und erhoffter Nutzen | Statusseite einrichten ist eine Leistung; weniger suchen müssen ist der gewünschte Nutzen |
| Vom Kundenwunsch zu einer prüfbaren Aufgabe | Problem erfragen, Anforderung konkretisieren, Erwartung vergleichen | Ein vorgegebener Eintrag soll einen bestimmten Status anzeigen; „irgendwie moderner“ reicht als Prüfmerkmal nicht |
| Wer übernimmt welche Rolle? | Auftraggeber, Nutzer, Koordination und eigene Teilaufgabe | Rollen können getrennt oder bei derselben Person liegen; Ergebnisse nachvollziehbar übergeben |
| Selbstständig arbeiten und gezielt nachfragen | Geklärte Schritte selbst ausführen, fehlende Angaben klären, Grenzen beachten | Übungen mit vereinbarten Beispieldaten durchführen; zusätzliche Änderungen vorher abstimmen |

Jeder Block enthält Erklärung, Beispiel, typisches Missverständnis mit Korrektur
und einen Merksatz. Die vollständigen Texte stehen zusammen mit Karten und
Gesprächsimpulsen in der [Themenfassung](../content/learning-journey/topics/common-lf1-role.v1.json).

## Aufgaben passen zum vorher Erklärten

Der Pilot enthält sechs Übungsfragen und acht davon getrennte Testfragen.
Alle sind Single Choice mit vier Optionen und einer begründeten Lösung.
Neue Anwendungssituationen ändern den Kontext, verlangen aber keine neuen
Fachbegriffe. Der Mini-Test greift auf dieselben erklärten Lernziele zurück.

| Lernziel | Übungsfragen | Testfragen | Erklärende Blöcke |
|---|---|---|---|
| Leistung / Nutzen | Q01, Q02 | E01, E02, E08 | Unternehmen; Kundenwunsch und prüfbare Aufgabe |
| Rollen | Q03, Q04 | E03, E04 | Zusammenarbeit und Rollen |
| Eigene Zuständigkeit / Rückfragen | Q05, Q06 | E05, E06, E07 | Selbstständiges Arbeiten und Klären |

Die verkürzten Kennungen tragen in der Datei den gemeinsamen Vorsatz
`LJ-LF1-ROLE-`. Die [Fragen-CSV](../content/learning-journey/questions/common-lf1-role.v1.csv)
ist von den 7.000 bisherigen Quizfragen getrennt. `questionLinks` enthält die
genauen Theorieverweise; die R2-Oberfläche zeigt sie als lesbare Blocktitel an.

Je Lernziel gibt es außerdem einen Gesprächsimpuls mit Kernpunkten, zulässigen
Alternativen, typischen Missverständnissen, Beispielantwort und einer möglichen
Nachfrage. Diese Angaben funktionieren auch für Selbstreflexion ohne KI.
Sechs Karten wiederholen jeweils zwei Kernideen pro Lernziel.

Der in R2 verwendete Testmaßstab bleibt transparent: acht gleich gewichtete Fragen,
mindestens sieben richtig für die interne 80-%-Schwelle. Die Inhalte selbst
verbuchen noch keine Abschlüsse, Ergebnisse oder Belohnungen.

## Themenplan und sichtbare Lücken

| Bereich | Themen | Ausgearbeiteter Themeninhalt |
|---|---:|---:|
| LF1 | 6 | 1 |
| Zusätzliche WISO | 10 | 0 |
| LF2 | 7 | 0 |
| LF3 | 6 | 0 |
| LF4 | 5 | 0 |
| LF5 | 8 | 0 |
| LF6 | 5 | 0 |
| LF7 | 5 | 0 |
| LF8 | 6 | 0 |
| LF9 | 6 | 0 |
| LF10a | 6 | 0 |
| LF11a | 7 | 0 |
| LF12a | 7 | 0 |

Die [FIAE-Themenfolge](../content/learning-journey/fiae.v1.json) enthält 129
Voraussetzungsbeziehungen. Sie verweisen auf existierende frühere Themen und
bilden keine Zyklen. Programmiergrundlagen beginnen in LF5; Projektmanagement
wird mit Auftragsplanung, Qualitätssicherung und späterem Kundenprojekt vertieft.
WISO ist ein eigener zusätzlicher Bereich, kein erfundenes Lernfeld 13.

`content-ready` bezeichnet nur den überprüften Inhalt dieses ersten Themas.
Die Felder `gaps` halten bei allen anderen Themen fehlende Theorie, Aufgaben
und Prüfung fest. Praxisaufgaben, Lernfeldrückblicke und die spätere umfassende
Abdeckungsprüfung bleiben offen. Die Themenanzahl ist weder eine amtliche
Vorgabe noch der Nachweis eines bereits vollständigen Lehrgangs.

## Quellen und Prüfgrenzen

Eigenständige Erklärungstexte und fiktive Beispiele. Öffentlich geprüft:

- [KMK-Rahmenlehrplan 2019](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf): Lernfeldbezug und Aufbau.
- [FIAusbV, Ausbildungsrahmenplan](https://www.gesetze-im-internet.de/fiausbv/anlage.html): Zusammenarbeit, Kundenbedarf, Zielvergleich und Auftragsabschluss.
- [BBiG § 13](https://www.gesetze-im-internet.de/bbig_2005/__13.html): sorgfältige Aufgabenbearbeitung während der Ausbildung; keine umfassende Rechtslektion.
- [KMK-Qualifikationsprofil WISO 2021](https://www.kmk.org/fileadmin/Dateien/veroeffentlichungen_beschluesse/2021/2021_06_17-Berufsschule-Unterricht-Wirtschafts-Sozialkunde.pdf): zusätzliche WISO-Themen im Plan.

Private Unterlagen und persönliche Konten wurden nicht gelesen. Die Inhalte
benötigen keine private Lernquelle und keinen KI-Zugang. Quellenmetadaten
benennen den fachlichen Bezug; die fiktiven Ereignisse sind eigene Beispiele.

Der neue Validator kontrolliert IDs, Zustände, Voraussetzungen, Pooltrennung,
Antwortformate und die Lernziel-/Theorieverweise. Er ersetzt keinen Fachreview.
Negative Prüfbeispiele testen unter anderem unbekannte Fragen, überlappende
Pools, unpassende Theoriezuordnungen, fehlende Lernziele, Zyklen und unzulässige
Dateiverweise. Die technischen Ablaufprüfungen werden gesondert in R2/R3
dokumentiert.

Abschlussprüfung am 10.11.2026: Validator grün, **72/72 Inhalts-/Vertragstests**
bestanden. Unabhängiger Fachreview aller 14 Fragen, Gesprächsimpulse, Karten
und des Themenplans freigegeben. Dabei wurden drei sprachliche Antwortmuster
korrigiert sowie Unternehmenspräsentation und Skalierbarkeit als Lernziele
präzisiert. Frischer technischer Review ebenfalls ohne offene relevante
Findings; zusätzlich 19.232 speicherinterne Mutationen fehlerhafter Daten ohne
Absturz geprüft. Diese Nachweise betreffen R1 und ersetzen keine Bedienabnahme
des R2-App-Ablaufs.

## Technische Integration und nächster Schritt

R2 verbindet den FIAE-Einstieg mit den vier Theorieblöcken, sechs Quizfragen,
drei festen Selbstreflexionen, sechs Karten und acht Mini-Test-Fragen dieses
Themas. Fortsetzung, Theorie-Rücksprünge, Lernziel-Auswertung, Wiederholung
und lokale Reisesicherung sind in FE-069 umgesetzt; technische Prüfungen und
unabhängige Reviews sind abgeschlossen. Details und Grenzen stehen in
[Lernreise – Geführter LF1-Pilot in der App](63-Lernreise-LF1-App.md).

Die Inhaltsnachweise oben beziehen sich weiterhin ausschließlich auf R1.
Sie ersetzen keine technische Bedienabnahme. Die optionale KI-Lernbegleitung
bleibt R3; eine offene Mini-Prüfung darf durch keine KI-Antwort als bestanden
gelten. Weitere Themen werden erst nach eigenem Inhaltsausbau und Review
freigegeben.
