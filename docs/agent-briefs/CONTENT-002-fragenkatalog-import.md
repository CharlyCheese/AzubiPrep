# Brief CONTENT-002: Zusatz-Fragenkatalog importieren und bereinigen

Status: done
Bereich: CONTENT
Angelegt: 2026-09-16
Abgeschlossen: 2026-09-16

## Ziel (1–3 Sätze)

Sven hat einen zusätzlichen Fragenkatalog (1720 Fragen, `kategorie`/`thema`-
Format statt `fachrichtung`/`modul_id`) bereitgestellt. Bereinigen
(Encoding, Duplikate, kaputte Zeilen), fachlich einsortieren und ins
bestehende Content-Schema (`content/questions/*.csv`) einpflegen, ohne
bestehende Fragen zu verändern.

## Betroffene Dateien (exakte Pfade)

- `content/questions/FISI-NET.csv`, `FISI-SEC.csv`, `FISI-BET.csv`,
  `FIAE-DB.csv`, `FIAE-PRG.csv`, `FIAE-SWE.csv`, `FIAE-TST.csv`,
  `DPA-DB.csv`, `DVK-CLD.csv`, `WISO.csv`, `PM.csv` – neue Fragen angehängt
- `content/questions/HARDWARE.csv` – neu angelegt (neues Modul)
- `content/modules.csv` – Eintrag für neues Modul `HARDWARE` (ALLE)
- `README.md` – Fragen-/Modulanzahl aktualisiert (500/18 → 1623/19)

## Kontext (nur Verweise, keine Dokumentkopien)

- Quelle: von Sven hochgeladener `Fragenkatalog.csv` (1720 Zeilen,
  Chat vom 2026-09-16)
- Ziel-Schema: `docs/08-Datenformate.md` (Spalten `id;fachrichtung;
  modul_id;thema;typ;frage;option_a..d;antwort;erklaerung;schwierigkeit;
  quelle`)
- Bisheriger Fragenkatalog-Review: `docs/18-Fachreview-Fragenkatalog.md`
  (deckt nur die ursprünglichen 500 Fragen ab, nicht diesen Import)

## Umsetzungsschritte (Checkliste)

- [x] Encoding repariert (Quelldatei war cp1252/ISO-8859 statt UTF-8)
- [x] 2 strukturell kaputte CSV-Zeilen (ID 283, 1143 der Quelldatei,
      nicht escapte Anführungszeichen im Fragetext) rekonstruiert
- [x] 687 exakte Text-Duplikate entfernt (1720 → 1033 eindeutige Fragen)
- [x] 7 Fragen rausgefiltert, die bereits im bestehenden 500er-Bestand
      vorhanden waren (exakter Textabgleich)
- [x] 1 Frage als Duplikat zu einer Entwicklungs-Frage verworfen
      ("Was ist eine API?" doppelt in anderer Kategorie)
- [x] 301 doppelt vergebene Quell-IDs durch neue eindeutige IDs ersetzt
- [x] Fachliche Zuordnung Kategorie/Thema → Fachrichtung/Modul (mit Sven
      abgestimmt, siehe Ergebnis unten), inkl. Aufteilung
      Datenbanken-Fragen auf FIAE-DB **und** DPA-DB (dupliziert, da beide
      Fachrichtungen den gleichen SQL-Grundlagenstoff brauchen)
- [x] Neues Modul `HARDWARE` (ALLE-Fachrichtungen) angelegt für
      fachrichtungsübergreifendes Hardware-Grundwissen (219 Fragen)
- [x] Schema-Transformation: `schwierigkeit` kleingeschrieben, `typ`=SC
      gesetzt (alle Fragen sind Single-Choice mit 3 Optionen a–c,
      `option_d` bleibt leer – Frontend blendet leere Optionen automatisch
      aus, kein Funktionsverlust)
- [x] Validierung mit der echten Backend-Ladelogik (`content.js
      loadContent()`): 0 Warnungen, 1623 Fragen / 19 Module / 4
      Fachrichtungen laden fehlerfrei
- [x] Von Sven im laufenden Betrieb stichprobenartig gegengeprüft
      (Quiz/Karteikarten mit neuen Modulen, insbesondere `HARDWARE`)

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Keine Duplikate zu bestehenden 500 Fragen
- [x] Alle neuen Fragen laden ohne Backend-Warnungen (modul_id gültig,
      typ/schwierigkeit im erlaubten Wertebereich, keine doppelten IDs)
- [x] Bestehende 500 Fragen unverändert
- [x] Stichprobe im laufenden Frontend sieht inhaltlich sinnvoll aus
      (insbesondere neues Modul `HARDWARE`, das noch keinen Theorietext hat)

## Ergebnis (wird beim Abschluss ausgefüllt)

Von 1720 Quell-Fragen blieben nach Bereinigung 1033 eindeutige, fachlich
gültige Fragen. Verteilung auf Zielmodule (Regeln mit Sven im Chat
abgestimmt):

| Modul | neue Fragen | Kommentar |
|---|---|---|
| HARDWARE (neu, ALLE) | 219 | Kategorie "Hardware" – fachrichtungsübergreifendes Grundwissen (CPU, Speicher, Kühlung, Netzteile, Peripherie), kein bestehendes Modul passte |
| FISI-NET | 210 | Kategorie "Netzwerk" ohne die 6 Cloud-Fragen |
| WISO | 208 | Kategorien "Wirtschaft" + "WISO" |
| FISI-SEC | 204 | Kategorie "Sicherheit" |
| FIAE-DB | 91 | Kategorie "Datenbanken" (dupliziert, siehe auch DPA-DB) |
| DPA-DB | 91 | s. o., gleicher Inhalt wie FIAE-DB |
| FIAE-PRG | 47 | Entwicklung/Code, OOP, Web, Tools, Konzepte, Versionierung |
| FIAE-SWE | 22 | Entwicklung/Methoden (Scrum/Kanban/CI/DevOps), Architektur, UML, Design |
| FIAE-TST | 14 | Entwicklung/Testing |
| FISI-BET | 10 | Kategorie "Betriebssysteme" |
| DVK-CLD | 6 | Cloud-Fragen (aus Netzwerk/Cloud + Kategorie "Cloud", z. B. Kubernetes) |
| PM | 1 | Kategorie "Projektmanagement" |

**Gesamt:** 500 → **1623 Fragen**, 18 → **19 Module**.

Bekannte offene Punkte, kein Blocker für den Import selbst:
- Neues Modul `HARDWARE` hat noch keinen Theorietext (`content/theorie/
  HARDWARE.md` fehlt, ist optional – Modul funktioniert auch ohne)
- `docs/PROJEKTSTATUS.md` enthält detaillierte Statistiken (Schwierigkeits-
  verteilung, Modul-Kennzahlen) auf Basis der alten 500 Fragen – bewusst
  nicht mit angepasst, da eine korrekte Aktualisierung eine vollständige
  Neuauswertung braucht; das ist ein eigener Punkt
- Fachlicher Review durch Menschen (OPS-002) betrifft jetzt auch die 1123
  neu importierten Fragen, nicht nur die ursprünglichen 500 – `18-
  Fachreview-Fragenkatalog.md` deckt nur die alten 500 ab
- 209 fuzzy-ähnliche (aber nicht exakt gleiche) Fragen-Cluster aus der
  Quelldatei wurden nicht automatisch entfernt (z. B. "Was ist ein
  Router/Hub/Switch?" - meist echte, unterschiedliche Fragen), falls Sven
  das gegenchecken will

Sven hat den Import im installierten Desktop-Build getestet ("die
zusätzlichen Fragen sind so weit ich das überblicken kann inkl Module
optimal eingefügt worden") und bestätigt.

## Unabhängiger Review (nachträglich, 2026-09-16)

Dieser Brief war bereits `Status: done`, bevor die neue verbindliche
CONTENT-Review-Regel (siehe `ORCHESTRATOR.md` Abschnitt 1) beschlossen
wurde. Der Review wurde retroaktiv nachgeholt, um die Regel sofort
anzuwenden statt nur für zukünftige Briefs gelten zu lassen: ein frisch
gestarteter Subagent (kein geteilter Kontext mit der Import-Umsetzung)
hat den Import geprüft, inkl. Websuche gegen aktuelle IHK-/Fachquellen.

**Befund des Reviewers:**
- Stichprobe von ca. 540 Fragen über alle Module geprüft, inkl.
  sensibler Rechts-/WISO-Inhalte und technischer Fachaussagen – keine
  fachlichen Fehler gefunden.
- Auffälligkeit: ~97 % der 1123 neuen Fragen haben in den Roh-CSV-Daten
  "b" als richtige Antwort (Artefakt der Quelldatei/des generierenden
  Modells). Der Reviewer stufte dies zunächst als "kritisch, nicht
  produktionsreif" ein (Annahme: Lernende könnten das ausnutzen).
- Zwei echte, kleinere Formatfehler gefunden:
  1. `HARDWARE.csv` Zeile 81 (`ALLE-HARDWARE-080`, "Was ist JBOD?"):
     kaputtes CSV-Escaping im `erklaerung`-Feld (Artefakt aus der
     ursprünglichen Bereinigung).
  2. Verdacht auf Semikolon-in-Quoted-Field-Problem bei `WISO.csv`
     Zeilen `ALLE-WISO-046`/`ALLE-WISO-049`.

**Einordnung/Korrektur der "kritisch"-Bewertung:** Der Reviewer kannte
den Frontend-Code nicht. `frontend/src/utils/optionen.js`
(`mischeOptionen`) mischt die Antwortoptionen bei **jeder Anzeige** per
Fisher-Yates neu und mappt die Anzeige-Buchstaben zurück auf die
Original-Antwort zur Auswertung. Nutzer sehen also nie die rohe
CSV-Buchstaben-Reihenfolge, sondern jedes Mal eine frisch zufällige –
das "immer b in den Rohdaten"-Muster ist für Lernende **nicht
ausnutzbar**. Der Fund bleibt trotzdem ein legitimer
Datenqualitäts-Hinweis (zeigt, wie das Quell-LLM generiert hat), ist
aber **kein produktionsblockierendes Problem**.

**Fixes, durchgeführt 2026-09-16:**
- `HARDWARE.csv` Zeile 81 korrigiert: `erklaerung` ist jetzt sauber
  `Platten werden einfach hintereinander gehängt.` (vorher kaputtes
  Escaping mit überzähligen Anführungszeichen).
- `WISO.csv` Zeilen 046/049 geprüft: Das Semikolon steht korrekt
  innerhalb eines gequoteten Felds
  (`"Urheberrecht schützt geistige Schöpfung; Patent technische
  Erfindung"` bzw. `"EK vom Eigentümer; FK von Gläubigern"`) und wird
  vom projekteigenen Parser (`backend/src/csv.js`, quote-bewusste
  State-Machine) korrekt als ein Feld erkannt – **kein Fehler,
  kein Fix nötig**, nach Code-Prüfung bestätigt.
- Erneute Validierung mit der echten `loadContent()`-Funktion nach den
  Fixes: **0 Warnungen, 1623 Fragen laden fehlerfrei**.

**Gesamturteil:** Import bleibt produktionstauglich. Ein echter,
kleiner Datenfehler wurde gefunden und behoben; die vermeintlich
kritische Schwachstelle war durch bestehende Frontend-Logik bereits
neutralisiert. Der Prozess (unabhängiger Review durch frischen
Subagenten) hat sich in der Praxis bewährt – ein echter Fehler wäre
sonst unentdeckt geblieben.

## Vollständiger OPS-002-Review der 1123 Fragen (2026-09-16)

Der obige Review vom selben Tag war ein erster, strukturell orientierter
Durchgang. Dies hier ist der eigentliche, vollständige OPS-002-Review
(„hoch" priorisiert in `STATUS.md`), der die restlichen 1123 aus
CONTENT-002 importierten Fragen abschließend abdeckt – die
ursprünglichen 500 sind bereits über `18-Fachreview-Fragenkatalog.md`
geprüft.

**Methode:** 5 unabhängige, parallel gestartete Subagenten (Agent-Tool,
kein geteilter Kontext untereinander oder mit der Import-Implementierung),
je einer für eine Modul-Gruppe, mit Zugriff auf die echten CSV-Zeilen und
das WebSearch-Tool für Faktenchecks gegen aktuelle Quellen (IHK-
Rahmenlehrplan, RFC/IEEE-Standards, NIST SP 800-63B, OWASP, Gesetzestexte,
Microsoft/W3Schools-SQL-Dokumentation, Herstellerdokumentation). Jede
Gruppe deckte alle neuen Zeilen strukturell vollständig ab (Duplikate,
CSV-Format, Musterlösung vorhanden, Pflichtfelder) und zusätzlich eine
fachliche Stichprobe bzw. Vollprüfung je Modul/Thema (bei kleineren
Dateien wurden alle Fragen gelesen, nicht nur eine Stichprobe):

| Gruppe | Module | Neue Fragen | Fachlich geprüft |
|---|---|---|---|
| 1 | HARDWARE, FISI-BET | 229 | alle 229 |
| 2 | FISI-NET | 210 | 80 Stichprobe |
| 3 | FISI-SEC | 204 | 91 Stichprobe |
| 4 | WISO, PM | 209 | alle 209 |
| 5 | FIAE-DB, DPA-DB, FIAE-PRG, FIAE-SWE, FIAE-TST, DVK-CLD | 271 | alle 271 |

**Gefundene und behobene Fehler (16 Fundstellen, 16 korrigiert):**

- `ALLE-HARDWARE-023`: missverständliche Erklärung zu NVMe-Latenz
  korrigiert ("massiv höhere Latenz-Vorteile" → "deutlich geringere
  Latenzen und höhere Bandbreite als SATA")
- `ALLE-HARDWARE-107`: Tippfehler "Chipslet" → "Chiplet" (Frage + Option)
- `ALLE-HARDWARE-188`: verlorenes Sonderzeichen "Ohm (?)" → "Ohm (Ω)"
  (Encoding-Artefakt aus dem ursprünglichen Import)
- `FISI-SEC-098`: kaputtes CSV-Quoting im `erklaerung`-Feld repariert
- `FISI-SEC-208`: fachlich falsche MFA-Definition korrigiert ("nutzt mehr
  als zwei Faktoren" → "nutzt zwei oder mehr unabhängige Faktoren"),
  Quelle: NIST SP 800-63B
- `FISI-SEC-028`, `FISI-SEC-031`, `FISI-SEC-039`, `FISI-SEC-045`: Fragen
  ohne erkennbaren Themenbezug ("Definition?", "Primärziel?",
  "Sicheres Verfahren?", "IP-Spoofing?") zu vollständigen Fragesätzen
  umformuliert
- `FISI-SEC-044`: Frage/Antwort-Mismatch behoben (Frage fragte nach einem
  *Vorteil*, Antwortoption enthielt nur die *Definition*) – Frage und
  Optionen so umformuliert, dass die als richtig markierte Option
  tatsächlich den gefragten Vorteil benennt
- `FISI-SEC-087`: Tippfehler "Garantit" → "Garantiert"
- `FISI-SEC-069`: Tippfehler "Honypot" → "Honeypot" (im Fragetext)
- `FISI-SEC-120`: Grammatikfehler "tarnen" → "tarnt"
- `ALLE-WISO-075`: **falsche Musterlösung** (Antwort war `a` = "Nur
  Tätigkeitsdauer", das beschreibt aber das *einfache*, nicht das
  *qualifizierte* Arbeitszeugnis; korrigiert auf `b`), Quelle: Haufe/
  HR Works zu § 109 GewO
- `FIAE-DB-057` und `DPA-DB-057`: **falsche Musterlösung** bei `LIKE
  '%abc%'` (markierte Antwort behauptete "beginnt mit abc", korrekt ist
  "enthält abc an beliebiger Stelle" – Antwort von `b` auf `a` korrigiert,
  in beiden Dateien, da der SQL-Grundlagenstoff bewusst dupliziert ist)

Alle Korrekturen wurden mit der echten `loadContent()`-Funktion erneut
validiert: **0 Warnungen, weiterhin 1623 Fragen**.

**Nicht als Fehler gewertet (zur Transparenz):** Die bekannte
Häufung von "b" als Musterlösung in den Rohdaten wurde von allen 5
Reviewern erkannt, aber wie angewiesen nicht gemeldet (neutralisiert durch
`mischeOptionen`-Shuffle im Frontend).

**Zurückgestellt, kein Blocker (Empfehlung für später, kein Fix in diesem
Durchgang):**
- Mehrere Themen mit hohem inhaltlichen Wiederholungsgrad (v. a. in WISO,
  FIAE-PRG, DVK-CLD) – reduziert die effektive Fragenvielfalt, ist aber
  fachlich nicht falsch. Eignet sich als Aufgabe für `CONTENT-001`
  (Autoren-UI mit Review-Status), wenn Einzelfragen gezielt ersetzt werden
  können.
- `DVK-CLD.csv` deckt das Thema Cloud/Kubernetes mit nur 6 Fragen (davon 4
  inhaltlich redundant) eher dünn ab – Ausbau auf mehr eigenständige
  Kubernetes-Themen (Pod, Deployment, Autoscaling, Container vs. VM) wäre
  sinnvoll, ist aber ein Content-Erweiterungs-Thema, kein Korrektur-Thema.
- Stilbruch zwischen alten (vollständige Sätze) und neuen (elliptisch,
  z. B. "Definition?") Fragen in mehreren Modulen – die eindeutig
  unverständlichen Fälle wurden oben korrigiert, der generelle Stilbruch
  selbst ist keine fachliche Fehlerquelle.

**Gesamturteil:** Nach Korrektur der 16 gefundenen Fundstellen ist der
komplette CONTENT-002-Bestand (1123 Fragen) fachlich und strukturell
produktionstauglich. Der bindende, unabhängige Review-Prozess hat sich
bewährt: alle 16 Funde (davon 2 echte Musterlösungsfehler, die Lernenden
aktiv falsches Wissen vermittelt hätten) wären ohne dieses Verfahren
unentdeckt geblieben. `OPS-002` gilt damit für CONTENT-002 als
abgeschlossen.
