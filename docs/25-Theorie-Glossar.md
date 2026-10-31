# Theorie, Glossar und lokale Wissenssuche

Stand: 31.10.2026, OPS-027. Praktischer Theorieeinstieg im aktuellen Web-/
Desktop-Quellstand. Vorhandene Installer wurden nicht neu gebaut.

## Lernen und nachschlagen

Unter **Theorie & Glossar** einen Lernfeldeinstieg, Lernbereich oder Begriff
auswählen. Fachrichtung, Lernfeld und Modul lassen sich filtern; das Glossar
ist nach Fragenthemen durchsuchbar. Große Listen zeigen 24 Einträge je Seite.
Die Modulansichten enthalten statt der bisherigen offenen Kurztexte einen
direkten Theoriezugang. Auf kleinen Bildschirmen ist dieser auch über den
Lernbereich erreichbar; bestehende fünf mobile Hauptzugänge bleiben erhalten.

**Thema erklären** fordert von Qwen eine Begriffs-/Zusammenhangerklärung,
ein kleines Praxisbeispiel und einen Merksatz an. Dafür ist kein vorheriges
Quiz nötig. Die optionale Frage kann ein Thema eingrenzen oder eine einfachere
Erklärung verlangen. Rückfragen verwenden das aktuelle Thema und neu gefundene
Quellen, ohne einen gespeicherten Chatverlauf mitzuschicken. Für eindeutige
Bezüge den Begriff erneut nennen. Eine vorhandene passende Frage lässt sich
anschließend direkt üben; Erklärung und Quellenlesen ändern keinen Lernstand.

Die **Suche** behält die bisherige Fragensuche und ergänzt eine aufklappbare
Wissenssuche für natürliche Ausbildungsfragen, etwa „Was unterscheidet RAM und
SSD?“. Die Quellensuche ist weiterhin lexikalisch. Qwen formuliert die Erklärung;
es gibt keine zusätzliche semantische Suche, Webrecherche oder Modellinstallation.

## Lernquellen und Quellenlesemodus

**App-Lerninhalte** sind vorhandene öffentliche Frageerklärungen/Kurztexte.
**Eigene lokale Unterlagen** müssen für die Anfrage ausdrücklich ausgewählt
werden. Private Suche hat keinen stillen Fallback auf App-Texte oder allgemeines
Modellwissen. Ohne passende Abschnitte wird die Lücke benannt.

**Fundstellen lesen** liefert begrenzte Originalauszüge ohne Modellanfrage,
auch wenn Qwen nicht läuft oder die KI am Server ausgeschaltet ist. Höchstens
drei Auszüge mit je 800 Zeichen; die Erläuterung ist klar vom Original getrennt.
Bei KI-Erklärungen stehen kürzere Auszüge bis je 220 Zeichen daneben.
Private Quellen nennen neutrale Unterlagenkennungen und physische PDF-Seiten.
Der Quellenlesemodus dient zum gezielten Nachschlagen. Er enthält derzeit keine
vollständige Seitenansicht oder PDF-Downloadfunktion.

Die Auswahl eines Lernfelds sagt nicht zu, dass das gesamte Lernfeld in den
jeweiligen Quellen enthalten ist. Gemeinsame Einstiege LF1–9 orientieren sich am
KMK-Rahmenlehrplan; Fachrichtungen behalten ihre vorhandenen Lernfeldkennungen.
LF1 behandelt Unternehmen/eigene Rolle, LF2 die Ausstattung von Arbeitsplätzen.
Begriffe aus dem Fragenkatalog bilden ein Themenverzeichnis, keinen redaktionell
vollständig geprüften Lehrgang. Öffentliche App-Kurztexte wurden durch diese
Technik nicht neu fachlich oder rechtlich geprüft. Unterlagen und Modell können
Fehler enthalten; Berufsschulunterricht und eigene fachliche Prüfung ergänzen
diesen Theorieeinstieg. Beispiele sind didaktische Erklärungen, keine weiteren
Originalzitate oder automatisch nachgewiesenen neuen Tatsachen.

## Datenschutz und technische Grenzen

Keine private Gliederung, Titel, Dateilisten oder Auszüge fließen in den
öffentlichen Katalog ein. Er entsteht ausschließlich aus öffentlichen Modulen,
Fragenthemen und neutralen Lernfeldeinstiegen; IDs bleiben über Neustarts stabil.
Die öffentliche API `/api/theorie` liefert ausschließlich diesen begrenzten
Katalog, Filterwerte, Fragenzahlen und passende Übungsverweise.

Die zusätzliche Theorieanfrage verwendet die bestehende geschützte lokale
KI-API (`context.kind=theory`, servergeprüfte `topicId`, `intent=explain/read`).
Ein Client kann keine eigenen Systemanweisungen, Dateien oder freien Lesepfade
als Theoriekontext einschleusen. Quellenwahl, Loopback-/Origin-/Marker-Prüfung,
`no-store`, kein Service-Worker-KI-Cache und [lokale RAG-Grenzen](24-Lokales-RAG.md)
bleiben bestehen. Fundstellen gelangen nur auf ausdrückliche lokale Anfrage
in den flüchtigen UI-Zustand; kein Export, Sync, Chat-/Antwortspeicher.

Antworttext und Zitate erscheinen als reiner Text. Modellinhalt, HTML oder
Quellenanweisungen werden nicht ausgeführt. Gültige Quellen-IDs müssen den
tatsächlich übergebenen Abschnitten entsprechen. Das prüft die Zuordnung,
keine semantische Wahrheit oder vollständige Theorieabdeckung.

Private Materialänderungen invalidieren sichtbare/laufende Antworten auch dann,
wenn bei mehreren Unterlagen der Gesamtstatus weiterhin „bereit“ bleibt.
Kontext-/Quellen-/Modellwechsel und Abbruch verwerfen verspätete Antworten.
Für Theorie bis 1100 Ausgabetokens und 450 Wörter; die bisherigen engeren
Kurs-/Quizlimits bleiben bestehen. Bei fehlenden Fundstellen oder Dienstfehlern
bleiben Katalog und Quiz nutzbar; Originalauszüge können separat gelesen werden.

## Nachweise

Synthetische Backend-/API-Fälle prüfen Katalog, Lernfelder, Pagination,
Fachrichtungs-/Modulfilter einschließlich passend gefilterter Übungsfrage,
serverseitige Kontextauflösung, Quellenwahl und Lesen ohne Modelldienst.
Browser-/Electronfälle prüfen Modulwechsel, Glossarfilter, Erklärungen ohne
Quiz, Originaltext gegenüber inertem Modelltext, Quellenzustimmung, einzelne
veränderte Unterlagen bei weiterhin bereitem Gesamtstatus, Abbruch und echte
öffentliche Quellenabfrage bei `AI_ENABLED=false`. Darstellung bei Desktop-
und 390-Pixel-Breite mit ausschließlich synthetischen Inhalten geprüft.
Eine echte lokale Qwen-Probe mit selbst geschriebenem RAM/SSD-Lerntext lieferte
Erklärung, Beispiel, Merksatz und gültige Quellen. Keine realen privaten Inhalte
oder Modellantworten in Testartefakte, Chat oder Dokumentation übernommen.

Abschluss: 123 Backendtests/Lint, 12 Desktop-/Webruntimeprüfungen und 42
unterschiedliche Browser-/Electronfälle grün. Frischer unabhängiger Nachreview
ohne offene bestätigte Findings; dessen eigener Nachlauf: 40/40 Tests.
Eine reale lokale Quellenleseprobe bestätigte begrenzte Auszüge, Seitenbezug
und fehlenden Modellaufruf ausschließlich durch neutrale Prüfflags.

Quelle für Lernfeldtitel und -zuordnung:
[KMK-Rahmenlehrplan,13.12.2019](https://www.kmk.org/service/servicebereich-berufliche-schulen/downloadbereich-rahmenlehrplaene?tx_fedownloads_single%5Baction%5D=forceDownload&tx_fedownloads_single%5Bcontroller%5D=Downloads&tx_fedownloads_single%5Bdownload%5D=45009&type=150).
