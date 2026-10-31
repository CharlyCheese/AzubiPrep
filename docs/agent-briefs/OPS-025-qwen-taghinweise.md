# Brief OPS-025: Präzise Taghinweise in der Lernbegleitung

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel

Praxisfeedback zur lokalen Lernbegleitung: Start- und End-Tags wurden in
einer Modellantwort verwechselt; Browserdarstellung wurde fälschlich als
Syntaxnachweis beschrieben. Einen eindeutig erkennbaren Fall aus zwei
öffnenden h1-Tags ohne schließendes h1 mit festem Codehinweis absichern.
Eigene Texte erhalten, keine ungefragte vollständige Musterlösung.
Keine allgemeine HTML-Validierung oder KI-Benotung zusagen.

## Betroffene Dateien

- `backend/src/ai.js`, `backend/src/ai-html.js`
- `backend/test/ai.test.js`, `backend/test/ai-html.test.js`
- `frontend/src/api/ai.js`, `frontend/src/components/KiHilfe.jsx`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/public/sw.js`
- `e2e/tests/ki.spec.js`
- `docs/23-Qwen-Grundanbindung.md`
- `docs/agent-briefs/OPS-025-qwen-taghinweise.md`
- `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Festlegung

Nur ausdrücklich freigegebene vollständige kurze HTML-Dateiinhalte betrachten.
Kleine konservative lexikalische Erkennung: Kommentare, Attributwerte und
Rawtext-/RCDATA-Kontexte nicht als h1-Elemente zählen. Bei unklaren Kontexten,
abgeschnittenem Code oder anderen Mustern keine feste Diagnose abgeben.
Hinweis benennt Start-/End-Tag und / exakt, korrigiert nur bedingt nach der
erkennbaren Absicht und behält den eigenen Text. Browser kann fehlerhaftes
HTML darstellen; Vorschau ist kein Syntaxnachweis. Keine Dateiänderung.

Feste Codehilfe ausdrücklich von Modellantwort und fehlendem Kontext
unterscheiden. Tatsächliche Codehilfe gilt als Unterstützung für Transfer;
die Datenstruktur aiHints weiterverwenden, sichtbaren Zähler neutral auf
Lernbegleitung beziehen. Keine Kontextablehnung als gelieferte Hilfe zählen.
Auch allgemeine Modellanweisung zu Tags, Vorschau und minimalen Korrekturen
präzisieren. Modell bleibt fehlbar. Private Unterlagen weiterhin nicht öffnen,
lesen, extrahieren oder übertragen; kein RAG/Cloud/Download/Paketbau.

## Abnahme

- [x] Gemeldeter Fall erzeugt reproduzierbar richtigen festen Codehinweis.
- [x] Eigener Text bleibt erhalten; keine Behauptung zweier Endtags oder
  ausschließlich korrekt dargestellter Elemente; keine neue Bewertung.
- [x] Korrekte, mehrere korrekt geschlossene h1, Kommentare, Attributwerte,
  Rawtext, Escape-Text und unvollständige Ausschnitte werden nicht fehldiagnostiziert.
- [x] Hinweisquelle/Unterstützungszählung korrekt; Zustimmung/Datengrenzen erhalten.
- [x] Gezielte Unit-/API-/UI-Regressionen und frischer Review bestanden.
- [x] Sachliche Doku/Archivcheck konsistent; lokale Quellen unangetastet.

## Ergebnis

Implementiert: begrenzte konservative h1-Quelltexterkennung für freigegebene
vollständige HTML-Texte, fester Codehinweis mit erhaltenem eigenen Text,
kleinster bedingter Korrektur und Erklärung der Browser-Fehlerbehandlung.
Keine neue Bewertung, keine Änderungen am Projekt oder externen Dateien.
Quelle code_hint sichtbar getrennt, echte Hilfe im bestehenden aiHints-Feld
gezählt; sichtbarer Zähler neutral „Lernbegleitung“. Kontextablehnungen
zählen unverändert nicht. Allgemeiner Prompt präzisiert, SW v8.

96 Backendtests und Lint grün. Neun KI-Browser-/Electronfälle grün, darunter
echte Desktop-/API-Integration ohne Modell: korrekter fester Hinweis,
unveränderter Quelltext und trotz fehlerhafter Tags sichtbare Überschrift.
Frischer Review ops025_review fand Randfälle (Unicodeabstand,
Anführungszeichen in unquotiertem Wert, unklare Kommentare); konservativ korrigiert und mit
Regressionen abgesichert. Abschließender unabhängiger Code-/Fach-/Dokunachreview
bestanden, keine offenen Findings. Archivierung mit DONE-Eintrag und Skriptprüfung.

Fachtext gegen WHATWG Parsing, MDN Debugging HTML und Heading Elements geprüft;
Quellen und Nachweisgrenzen in docs/23. Keine private PDF geöffnet oder
verarbeitet, keine zusätzlichen Abhängigkeiten oder Pakete.
