# AzubiPrep – Orchestrator & Agenten-Workflow

Dieses Dokument steuert die **Zusammenarbeit mehrerer KI-Agenten** am Projekt
`AzubiPrep` (PWA zur IHK-Prüfungsvorbereitung für Fachinformatiker).
Ziel: **token-sparendes, agiles Arbeiten** mit fokussierten Task-Briefs und
**Pflicht-Review durch einen frischen Agenten** nach jedem elementaren Schritt.

## 1. Rollen

| Rolle | Verantwortung | Erhält nur |
|---|---|---|
| **Orchestrator** | Backlog pflegen, Task-Briefs schreiben, Agenten zuweisen, Reviews auslösen, Ergebnis prüfen | Gesamtplan + Status |
| **Frontend-Agent** | React-Komponenten, Seiten, Styling, PWA | Den jeweiligen Task-Brief |
| **Backend-Agent** | Express-Routen, CSV-Import, Prüfungslogik | Den jeweiligen Task-Brief |
| **Content-Agent** | Excel/CSV-Inhalte (Module, Fragen, Theorie), Quellen | Schema-Doku (docs) |
| **Doku-Agent** | Dokumentation pflegen | Struktur-Konvention |
| **Reviewer-Agent** | Prüft Abnahme-Kriterien nach jedem Schritt – **immer frischer/anderer Kontext** | Nur den Task-Brief + Ergebnis des Schritts |

> **Kernregel:** Ein Agent, der einen Schritt umgesetzt hat, reviewt ihn **nie
> selbst**. Nach jedem abgeschlossenen Task wird ein **neuer Agent** mit dem
> Brief + Review-Checkliste beauftragt.

## 2. Ablauf eines Arbeitsschritts

```
1. Orchestrator wählt Backlog-Item
2. Orchestrator erstellt Task-Brief  (docs/agent-briefs/<ID>-<slug>.md)
3. Fach-Agent setzt um (nur Brief lesen, keine Gesamtkontext-Dateien)
4. Orchestrator startet Review:
   -> Reviewer-Agent prüft gegen Abnahme-Kriterien im Brief
5. Review OK  -> Item done, kurzes Status-Update
   Review NOK -> Nacharbeit an Fach-Agent mit Reviewer-Notizen
6. Fortschritt wird in docs/agent-briefs/STATUS.md dokumentiert
```

## 3. Task-Brief-Vorlage

Jeder Brief liegt unter `docs/agent-briefs/` und enthält **ausschließlich**:

```markdown
# Brief <ID>: <Kurztitel>
Status: <offen | inArbeit | review | done>
## Ziel (1–3 Sätze)
## Betroffene Dateien (exakte Pfade)
## Kontext (nur Verweise, keine Dokumentkopien)
## Umsetzungsschritte (Checkliste)
## Abnahme-Kriterien (Reviewer prüft genau diese)
```

## 4. Review-Checkliste (allgemein)

- [ ] Abnahme-Kriterien des Briefs erfüllt?
- [ ] Keine unerwünschten Nebenwirkungen auf andere Bereiche?
- [ ] Code-Stil & Konventionen aus `AGENTS.md` eingehalten?
- [ ] Keine hart kodierten Pfade/Ports, die woanders genutzt werden?
- [ ] Lauffähigkeit verifiziert (Test-Kommando im Brief angegeben)?

## 5. Aktueller Projektstatus

Wird fortlaufend in `docs/agent-briefs/STATUS.md` geführt (nur Orchestrator
schreibt dort).
