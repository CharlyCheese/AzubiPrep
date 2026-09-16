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
