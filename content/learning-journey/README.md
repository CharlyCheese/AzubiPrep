# Redaktionelle Inhalte der geführten Lernreise

Dieser Ordner enthält die **Inhaltsgrundlage** für den geführten FIAE-Pfad.
Alle 94 Themen aus LF1, WISO, PM, LF2 bis LF9 und LF10a bis LF12a werden über die eigenen Lernreise-Endpunkte
in der App genutzt. Die vorhandenen 7.000 Fragen unter
`content/questions/` und ihre Datenbankspiegelung bleiben unverändert.

## Inhalt und Zustände

- `fiae.v1.json`: 94 ausgearbeitete Themen mit 248 Lernzielen und ihren Voraussetzungen. Allgemeine LF1–9 und zusätzliche WISO-/PM-Stationen stehen
  vor LF10a–12a. `sequence` legt die empfohlene Reihenfolge fest; `prerequisites`
  beschreibt fachliche Voraussetzungen, nicht bloß die vorherige Bildschirmseite.
- `topics/common-lf1-role.v1.json`: drei Lernziele, ein fiktiver Fall, vier
  Theorieblöcke, drei Fachgesprächsimpulse und sechs Karten. Jede Aufgabe verweist
  auf erklärende Blöcke und Lernziele.
- `questions/common-lf1-role.v1.csv`: sechs Übungs- und acht separate Mini-Test-
  Fragen. Das CSV-Grundformat entspricht dem bestehenden Fragenformat inklusive
  `lernfeld`. `LJ-`-IDs bilden einen eigenen Namensraum.
- `topics/common-lf1-goals.v1.json` und zugehörige Fragen-CSV: zweites Thema
  „Unternehmensziele und Zielkonflikte“, zwei Lernziele, ebenfalls vier Blöcke,
  sechs Quizfragen, acht Testfragen, drei Gesprächsimpulse und sechs Karten.
- `common-lf1-market`, `common-lf1-value-chain`, `common-lf1-organization` und
  `common-lf1-presentation`: vier weitere Themen mit demselben Mengengerüst.
  Zusammen decken die sechs Themen die 15 LF1-Lernziele ab, mit 84 eigenen Fragen.
  Das letzte Thema enthält zusätzlich den veröffentlichten Lernfeldrückblick
  (`fieldReview`) und die selbst bestätigte Präsentationsaufgabe (`practice`).
- `common-wiso-training` bis `common-wiso-europe`: zehn Themen mit 29 Zielen,
  40 Blöcken, 140 Fragen, 30 Reflexionen und 60 Karten. Das letzte Thema
  enthält den WISO-Rückblick; es gibt keine zusätzliche Präsentationspflicht.
  WISO trägt in CSV weiterhin `lernfeld=KEIN_LF`, im Lernweg `fieldId=WISO`.
- `common-pm-project` bis `common-pm-closure`: zehn Themen mit 30 Zielen,
  40 Blöcken, 140 Fragen, 30 Reflexionen und 60 Karten. Der letzte Block enthält
  den Rückblick auf alle zehn Themen. Drei passende lokale Rechentabellen
  ergänzen Kosten, Preisbildung und Wirtschaftlichkeit als optionale Lernhilfe.
  PM trägt in CSV `lernfeld=KEIN_LF`, im Lernweg `fieldId=PM`.
- `common-lf2-requirements` bis `common-lf2-handover`: sieben Themen mit 17 Zielen,
  28 Blöcken, 98 Fragen, 21 Reflexionen und 42 Karten. Der letzte Block und die
  Abschlussfragen wiederholen alle sieben Themen. Eine begrenzte Modellübung
  ergänzt die zweite Reflexion zur Einrichtung und Übergabe eines Büroplatzes.
  LF2 trägt in CSV `modul=HARDWARE` und `lernfeld=LF2`, im Lernweg `fieldId=LF2`.
- `common-lf3-physical` bis `common-lf3-diagnosis`: sechs Themen mit zwölf Zielen,
  24 Blöcken, 84 Fragen, 18 Reflexionen und 36 Karten. Diagnose enthält den
  Rückblick aller sechs Themen und eine Modellpraxis in Reflexion 2: drei
  Clientstörungen untersuchen, korrigieren und nachprüfen. CSV: `NETZ-GRUND/LF3`.
- `common-lf4-goals` bis `common-lf4-measures`: fünf Themen, 14 Ziele und 70 Fragen;
  begründete Schutzbedarfsanalyse mit Schadenskriterien und Wirksamkeitsprüfungen.
- `common-lf5-requirements` bis `common-lf5-testing`: acht Themen, 19 Ziele und
  112 Fragen; lokale Bestandsverwaltung mit geführten SQL-Operationen und eigener
  JavaScript-Bestandsfunktion, die in der vorhandenen QuickJS-Laufzeit geprüft wird.
- `common-lf6-intake` bis `common-lf6-closure`: fünf Themen, 13 Ziele und 70 Fragen;
  durchgängiger Servicefall mit erfundener SLA, Diagnose, Änderung und Abschluss.
  Alle drei Abschlussabschnitte enthalten Rückblick und bestätigte Praxis. Die CSV-
  Kategorien `LF5-GRUND` und `SERVICE-GRUND` gehören nur zur Lernreise.
- `stageOrder` ordnet LF1 → WISO → PM → LF2… ein. `plannedStages` ist leer,
  da PM jetzt eine ausgearbeitete logische Etappe in `fields` besitzt.
  Es wird damit kein zusätzliches offizielles Lernfeld erfunden.

`planned` bedeutet: Thema und Ziele sind vorgesehen, benötigte Inhalte fehlen
noch. `content-ready` bedeutet: Inhalt liegt vor und sein unabhängiger Review
ist abgeschlossen. Es bedeutet **nicht**, dass die Station technisch verfügbar
oder das gesamte Lernfeld fertig ist. `publicationStatus: content-only` grenzt
den redaktionellen Bestand von technischer Freigabe und Nutzerfortschritt ab.
Die App gibt nur ausdrücklich unterstützte geprüfte Themen frei. Sie führt
den Lernstand getrennt pro Thema; optional ist die bestehende KI-Lernhilfe
nutzbar. Punkte und Kontosync sind nicht angeschlossen.

## Verbindlicher Inhaltsvertrag

Themen- und Lernziel-IDs bleiben bei einer bloßen Umbenennung erhalten. Änderungen
an Bedeutung, Aufgaben oder Bewertung erfordern eine neue Inhaltsversion und
später eine Fortschrittsmigration. `schemaVersion` beschreibt das Datenformat,
`version` die jeweilige Inhaltsfassung. Das Suffix `.v1` benennt die erste
Hauptfassung und wird nicht aus dem sichtbaren Titel erzeugt.

Die IDs in `questionLinks` verbinden jede Frage genau mit ihrer Phase, ihren
Lernzielen und den erklärenden Theorieblöcken. Die Oberfläche bildet daraus
lesbare Rücksprunglinks. Technische IDs gehören nicht in den Lerntext.
Quiz- und Prüfungspool sind disjunkt. Karten, Interviewkernpunkte und beide
Fragenpools decken alle Lernziele ihres Themas ab. Weitere Fragen dürfen nicht aus einem
ganzen Modul ergänzt werden, um einen zu kleinen Themenpool zu kaschieren.

Antworten für Single/Multiple Choice folgen der bestehenden Buchstabenabbildung.
Die Anzeige mischt die Optionen mit Rückabbildung und speichert ihre Reihenfolge;
die gespeicherte Position ist kein Lernhinweis. Der Mini-Test hat acht gleich
gewichtete Aufgaben und die interne Schwelle 80 %: mindestens sieben richtige
Antworten. Gesprächskernpunkte und `acceptableAlternatives` sind Hilfen für
Rückmeldung und Selbstreflexion, keine automatische Stichwortbenotung.

Die Dateien enthalten auch Musterlösungen und den Prüfungspool. Sie sind ein
Autorenbestand, keine ungefilterte öffentliche API-Antwort. Die Lernreise-API
liefert gefilterte Ansichten und Antwortdaten und zeigt Lösungen erst nach
der vorgesehenen Abgabe. Es handelt sich um Lernkontrollen,
nicht um technisch geheim gehaltene Zertifizierungsprüfungen.

## Quellen und Herkunft

Alle Inhalte dieses Ordners wurden aus öffentlichen curricularen Anforderungen
eigenständig formuliert. Namen, Unternehmen und Fälle sind erfunden. Die Quellen
mit URL, Prüfdatum und begrenztem Bezug stehen in den JSON-Dateien. Sie belegen
Fachbezug und Lernziele, nicht die Existenz der fiktiven Beispielunternehmen.

Keine privaten Unterlagen, Auszüge, lokalen Suchdaten oder PDF-gestützten
Zwischenstände wurden hierfür gelesen oder in diesen Ordner übernommen.
Spätere private Lernkontexte gehören weiterhin ausschließlich in die dafür
geschützten lokalen Ablagen; dieser Ordner ist für öffentliche App-Inhalte.

## Prüfen und Weiterarbeiten

Vom Projektverzeichnis aus:

```powershell
node scripts/validate-learning-journey.mjs
node --test scripts/test/learning-journey-content.test.mjs
```

Der Prüfer liest nur diesen Inhaltsordner und lädt weder App-Konfiguration noch
Datenbank oder private Quellen. Er kontrolliert Struktur, Referenzen,
Voraussetzungen, Versions-/Statusangaben und Themenabdeckung. Er kann nicht
beweisen, dass eine Erklärung fachlich richtig oder eine Frage verständlich ist:
Dafür bleibt der unabhängige Inhaltsreview verbindlich. Prüfungen mit absichtlich
veränderten Daten sichern die wesentlichen Fehlerfälle ab.

R2 und R3 sind eingebunden. R4 hat LF1 einschließlich Rückblick ergänzt und
führt mit weiteren allgemeinen Themen gemäß
[Lernreiseplan](../../docs/61-Lernreise-FIAE-Planung.md), jeweils mit neuem
Inhaltsbrief, Fachreview und technischem Abgleich fort. FE-074 ergänzt alle zehn
PM-Themen, FE-075 die sieben LF2-, FE-076 die sechs LF3- und FE-077 die 18 LF4–LF6-Themen.
FE-078 ergänzt 17 Themen aus LF7, LF8 und LF9 mit drei lokalen Lernlaboren.
FE-079 vervollständigt die 20 Spezialisierungsthemen aus LF10a, LF11a und LF12a.
Jedes schließt mit einem eigenen Mini-Test ab. Die jeweils letzte Lektion enthält
den Projektauftrag mit Checkliste und den Rückblick auf das ganze Lernfeld.
Insgesamt liegen 248 Lernziele, 376 Blöcke, 1.316 eigene Lernreisefragen, 282 Reflexionen
und 564 Karten vor. Die Praxisstände bleiben ausschließlich lokal;
Prüfcode und Modellstände werden nicht in KI-Kontexte übernommen.
Die additive Freigabe weiterer Themen ändert die bestehenden Lernziele,
Aufgaben und Speicherverträge nicht; Planversion 1.0.0 bleibt kompatibel.
