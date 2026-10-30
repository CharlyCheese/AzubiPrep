# Brief CONTENT-209: WiSo – Urheberrecht und Software

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen ALLE-WISO-249 bis -272 ergänzen; WISO 248 → 272.
Konkrete Regeln des deutschen UrhG zu Software, Nutzungsrechten und Schutzfristen anwenden.

## Betroffene Dateien

- `content/questions/WISO.csv`
- `docs/agent-briefs/CONTENT-209-wiso-urheberrecht-software.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 248 Altstämme gelesen; globale Suche nach Urheberrecht und Lizenzfragen.
WISO-046, -082 und -248 betreffen allgemeine Begriffe, nicht die neuen Einzelfälle.
Frische Primärrecherche auf Gesetze im Internet: UrhG §§ 69a–69e, 69g,
31, 34, 29, 13, 64, 69 und 97. Bei Seiten-Timeouts vollständige Normtexte
in aktuellen Suchtreffern des amtlichen Anbieters gelesen.
14 Felder. Altpräfix 70066 Byte SHA256:
643de1f0bb6e7303198a42c5f45ed4886621d67e9f2c6549a5ba987fba7f5bc0.
Keine DB/.env, Installationen, Builds, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 eindeutige SC-Fragen; Altbytes und globale ID-Eindeutigkeit erhalten.
- [x] Gesetzeslage, Voraussetzungen und Ausnahmen präzise; plausible Distraktoren.
- [x] Keine Lernzielduplikate oder Antwort-Tells.
- [x] Frischer unabhängiger Vollreview einschließlich eigener Primärrecherche.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

WISO 248 → 272, global nach diesem Batch 6489 Fragen. Reviewer content209_review
hat alle 24 Stämme, 96 Optionen und 24 Erklärungen, 248 Altstämme und globale
semantische Nachbarn geprüft sowie alle 13 amtlichen Normquellen frisch recherchiert.
Das Dreier-Distraktormuster in 272 und das falschexklusive Signalwort „erst“
wurden entfernt. Zwei beim Überarbeiten mehrdeutig gewordene Alternativen
in 249 und 256 wurden präzisiert. Erneuter vollständiger Endread der tatsächlichen
Endfassung: Freigabe ohne offene Findings, keine Lernzielduplikate.
App-Parser bestätigt 272 WISO-Fragen mit durchgehend 14 Feldern und unverändertem
Altpräfix. Global 6513 eindeutige IDs bei Endprüfung einschließlich CONTENT-210.
Content-Validator, Diff- und Archivcheck grün. Keine Laufzeitänderungen.
