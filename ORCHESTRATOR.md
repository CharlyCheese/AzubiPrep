# AzubiPrep – Orchestrator- & Archivierungs-Workflow

Dieses Dokument steuert, wie an `AzubiPrep` gearbeitet wird: token-sparend
(schlanker Kontext pro Sitzung), nachvollziehbar (jede erledigte Änderung ist
rekonstruierbar, auch ohne Git-Verlauf) und mit einem **erzwungenen**, nicht
nur empfohlenen Archivierungsschritt.

## 0. Warum dieses Dokument existiert

Die erste Version dieses Workflows (siehe Git-Historie) sah `docs/agent-briefs/`
bereits vor – der Ordner wurde aber nie tatsächlich angelegt und der Prozess
nie durchgesetzt. Als das komplette Backend verloren ging (kein Git, defekte
USB-Übertragung), musste es mühsam aus Fließtext-Dokumentation rekonstruiert
werden. Die Doku hat den Schaden begrenzt, aber der eigentliche Fehler war:
ein Plan, der nur auf dem Papier existierte.

Deshalb gilt ab jetzt: **kein Schritt ist "erledigt", bevor die Archivierung
mechanisch geprüft wurde.** Nicht als guter Vorsatz, sondern als Skript, das
scheitert, wenn der Schritt fehlt (siehe Abschnitt 4).

## 1. Rollen (realistische Fassung)

In der Praxis arbeitet meist **ein** Claude-Agent direkt am Projekt (kein
Schwarm getrennter Spezial-Agenten mit eigenen Kontexten). Die Rollentrennung
aus der ursprünglichen Fassung bleibt trotzdem sinnvoll – nur anders technisch
umgesetzt:

| Rolle | Wer übernimmt sie | Wie |
|---|---|---|
| **Orchestrator** | Der aktiv arbeitende Claude-Agent | Plant, setzt um, schreibt Brief + Archiv |
| **Reviewer** | Ein **frisch gestarteter Subagent** (Agent-Tool, kein geteilter Kontext) | Bekommt NUR den Brief + das Diff/Ergebnis, keine Vorgeschichte des Gesprächs, prüft gegen die Abnahme-Kriterien |
| **Fachbereich** (Frontend/Backend/Content/Doku) | Derselbe Claude-Agent, aber jeweils nur mit den im Brief genannten Dateien im Blick | – |

> **Kernregel bleibt:** Wer etwas umgesetzt hat, reviewt es nicht mit
> demselben Gesprächskontext. Der Reviewer-Schritt läuft über einen frischen
> Subagent, der wirklich nur Brief + Ergebnis sieht – genau wie im
> ursprünglichen Plan, nur technisch über das Agent-Tool statt über einen
> zweiten Chat.

Diese Review-Stufe ist **optional pro Task** (Aufwand vs. Nutzen abwägen –
bei einer kleinen Textkorrektur unnötig, bei sicherheits- oder
datenrelevanten Änderungen empfohlen). **Nicht optional** ist dagegen die
Archivierung (Abschnitt 3+4) – die läuft bei jedem als "erledigt" markierten
Task.

## 2. Ablauf eines Arbeitsschritts

```
1. Backlog-Item auswählen (aus docs/agent-briefs/STATUS.md oder
   docs/PROJEKTSTATUS.md Abschnitt 9)
2. Brief erstellen: docs/agent-briefs/<ID>-<slug>.md (Vorlage: _TEMPLATE.md)
3. Umsetzen – nur die im Brief genannten Dateien anfassen
4. (optional, empfohlen bei größeren/riskanten Änderungen)
   Frischen Reviewer-Subagenten mit Brief + Diff beauftragen
5. Archivierung – NICHT optional, siehe Abschnitt 3:
   a) Brief-Datei mit Ergebnis/Status vervollständigen
   b) Zeile in docs/agent-briefs/DONE.md ergänzen
   c) Zeile aus docs/agent-briefs/STATUS.md entfernen (falls dort vorhanden)
6. Check-Skript laufen lassen: node scripts/check-agent-briefs.mjs
   -> schlägt fehl, wenn Schritt 5 unvollständig ist
7. Erst wenn das Skript grün ist, gilt der Task als abgeschlossen und wird
   dem Nutzer als "fertig" gemeldet
```

## 3. Die drei Dateien in `docs/agent-briefs/`

Aktenschrank-Prinzip: `STATUS.md` ist der Schreibtisch (bleibt klein),
`DONE.md` ist das Archiv-Register (wächst, aber wird nie komplett gelesen –
nur gezielt über Anker angesteuert), jede `<ID>-<slug>.md` ist die einzelne
Akte mit den Details.

- **`STATUS.md`** – nur offene/laufende Punkte. Wird bei jeder Sitzung
  komplett gelesen (ist klein, bleibt klein).
- **`DONE.md`** – Archiv-Log, ein Einzeiler pro erledigtem Task mit Link zur
  Brief-Datei. Wird **nie von oben nach unten gelesen**, nur per Suche/Anker
  nach ID.
- **`<ID>-<slug>.md`** – die volle Akte: Ziel, betroffene Dateien, Umsetzung,
  Ergebnis, Testschritte. Wird nur gezielt geöffnet, wenn jemand (Mensch oder
  KI) genau diesen Task nachvollziehen muss – z. B. nach Datenverlust.

## 4. Der bindende Check

`scripts/check-agent-briefs.mjs` prüft rein mechanisch (kein Ermessen, keine
KI-Interpretation nötig):

1. Jede ID in `DONE.md` hat eine passende Datei `docs/agent-briefs/<ID>-*.md`.
2. Keine ID steht gleichzeitig in `STATUS.md` (offen) und `DONE.md` (fertig).
3. Jede Brief-Datei mit `Status: done` im Kopf hat einen Eintrag in `DONE.md`.

Aufruf: `node scripts/check-agent-briefs.mjs` (Exit-Code 0 = sauber, 1 = es
fehlt etwas – mit genauer Auflistung, was). Vor jeder "Task fertig"-Meldung
an den Nutzer wird dieser Check ausgeführt.

## 5. ID-Konvention

`<BEREICH>-<NNN>`, fortlaufend je Bereich, nicht global:

| Kürzel | Bereich |
|---|---|
| `DB` | Datenbank/Login/Sync |
| `FE` | Frontend (Komponenten, Seiten, Styling) |
| `BE` | Backend (Routen, Logik, ohne DB) |
| `CONTENT` | Fragen/Module/CSV-Inhalte |
| `DESK` | Desktop/Electron |
| `OPS` | Betrieb, Build, CI, Doku, Sicherheit |

## 6. Task-Brief-Vorlage

Siehe `docs/agent-briefs/_TEMPLATE.md`. Kurzfassung:

```markdown
# Brief <ID>: <Kurztitel>
Status: <offen | inArbeit | review | done>
## Ziel (1–3 Sätze)
## Betroffene Dateien (exakte Pfade)
## Kontext (nur Verweise, keine Dokumentkopien)
## Umsetzungsschritte (Checkliste)
## Abnahme-Kriterien (Reviewer prüft genau diese)
## Ergebnis (wird beim Abschluss ausgefüllt)
```

## 7. Verhältnis zu `docs/PROJEKTSTATUS.md`

`PROJEKTSTATUS.md` bleibt der **menschenlesbare** Gesamtüberblick (Sprints,
Funktionsumfang, Roadmap) – für dich, Sven, zum Lesen. `docs/agent-briefs/`
ist der **maschinell prüfbare** Arbeitsnachweis dahinter. Ein größerer
Meilenstein (wie ein ganzer Sprint) bekommt weiterhin einen Eintrag in
`PROJEKTSTATUS.md`; jeder einzelne Task, der dazu beigetragen hat, bekommt
zusätzlich seine eigene Akte unter `docs/agent-briefs/`.
