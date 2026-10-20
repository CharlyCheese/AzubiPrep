# Brief CONTENT-036: FIAE-UX mit konkreten Bedienfällen vertiefen

Status: done
Bereich: CONTENT
Angelegt: 2026-10-20

## Ziel

FIAE-UX von 52 auf 76 Fragen erweitern: 24 konkrete Aufgaben zu barrierefreien
Formularen, Tastaturbedienung, Semantik, Statusmeldungen und Usability-Tests.
Neue Anwendungssituationen statt erneuter Definitionen aus CONTENT-008.

## Betroffene Dateien

- `content/questions/FIAE-UX.csv`
- `docs/agent-briefs/CONTENT-036-fiae-ux-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md, CONTENT-008. LF10a bleibt Modulzuordnung,
14 Spalten ohne lernfeld-Spalte. Eigene Lernaufgaben, Abruf 2026-10-20.

- [KMK-Rahmenlehrplan, LF10a](https://www.kmk.org/fileadmin/Dateien/pdf/Bildung/BeruflicheBildung/rlp/Fachinformatiker_19-12-13_EL.pdf).
- [W3C Understanding WCAG 2.2](https://www.w3.org/WAI/WCAG22/Understanding/).
- [WAI ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/).
- [WAI Forms Tutorial](https://www.w3.org/WAI/tutorials/forms/).

Zusätzliche Quellen/Zuordnung:

- 053–056: WAI Forms Tutorial, [Labels](https://www.w3.org/WAI/tutorials/forms/labels/), [Gruppierung](https://www.w3.org/WAI/tutorials/forms/grouping/), [Rückmeldung](https://www.w3.org/WAI/tutorials/forms/notifications/).
- 057–058: WCAG [Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) und [Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).
- 059–061: APG [Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [Akkordeon](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/), [Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/).
- 062–066: [Dekorative Bilder](https://www.w3.org/WAI/tutorials/images/decorative/), [Status](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html), [Sprache](https://www.w3.org/WAI/WCAG22/Understanding/language-of-page.html), [Link Purpose](https://www.w3.org/WAI/WCAG22/Understanding/link-purpose-link-only.html), [Überschriften](https://www.w3.org/WAI/tutorials/page-structure/headings/).
- 067: [Focus Not Obscured Minimum](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), 2.4.11 AA.
- 068: [Target Size Minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), 2.5.8 AA, 24 × 24 CSS-Pixel ohne Ausnahme.
- 069–070: [Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), 320 CSS-Pixel, und [Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html), 200 %, jeweils AA.
- 071: [MDN prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion), keine pauschale WCAG-Stufenbehauptung.
- 072–074: [Accessible Authentication Minimum](https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum.html), 3.3.8 AA; [Dragging Movements](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html), 2.5.7 AA; [Redundant Entry](https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry.html), 3.3.7 A.
- 075–076: [NN/g Testaufgaben](https://www.nngroup.com/articles/better-usability-tasks/), eigene Prozentaufgabe 8/10 = 80 %.

Keine pauschalen Aussagen über gesetzliche Pflichten.

## Umsetzung und Abnahme

- [x] 24 neue SC-Fragen FIAE-UX-053 bis -076, vier unterschiedliche Optionen je Frage.
- [x] Bestehende 52 Zeilen unverändert, keine IDs oder Texte doppelt.
- [x] Fachlich richtige, eindeutig lösbare Aufgaben mit LF10a-Bezug.
- [x] WCAG-Anforderungen inkl. Stufe und Ausnahmen bei Zahlenfragen korrekt eingegrenzt.
- [x] Plausible Distraktoren, kein Längen-Bias oder verräterische Satzmuster.
- [x] Vollständiger frischer Fachreview mit Primärquellen ohne offene Findings.
- [x] Content-Validierung und Archivierungscheck grün.

## Ergebnis

24 neue SC-Fragen, FIAE-UX jetzt 76. Vollständiger unabhängiger Fachreview
am 2026-10-20: **BESTANDEN**, keine Findings. Alle 24 Fragen mit 96 Optionen,
Lösungen, Erklärungen und Schwierigkeitsangaben gegen Primärquellen geprüft.
WCAG-Stufen, Grenzwerte und Ausnahmen ausdrücklich bestätigt.

Neue Fragen sind konkrete Anwendungssituationen statt bloßer Wiederholungen
der Begriffe im Bestand. Alte 52 Zeilen unverändert, 14 Spalten und eindeutige
IDs/Texte. Kein systematischer Längen-/Detailgrad- oder Meta-Tell. Quote
unabhängig nachgerechnet: 80 %. Fünf leichte und 19 mittlere neue Fragen.

Gesamt nach CONTENT-033 bis -036: 2385 Fragen. Validator ohne Fehler,
Archivierung in DONE.md und check-agent-briefs grün. Keine DB-/Installer-
Aktualisierung, kein Commit oder persönliche Freigabe vorweggenommen.
Vorherige lokale Änderungen bleiben bestehen.
