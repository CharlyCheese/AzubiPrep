# OPS-038 – Browser- und Windows-Desktopprüfungen korrekt zuordnen

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel

CI-Lauf 41243289970: 174 Browserfälle bestanden, 17 übersprungen, fünf neue
Windows-Electronfälle fehlgeschlagen, weil der Browserjob auf Ubuntu läuft.
Plattformschutz ergänzen und Desktopfälle in einem eigenen Windowsjob wirklich
ausführen. Keine fachlichen Prüfungen abschwächen oder App-Logik verändern.

## Allowlist

- `.github/workflows/ci.yml`, `e2e/playwright.config.js`
- `e2e/tests/js-course.spec.js`, `e2e/tests/js-playground.spec.js`
- `e2e/tests/js15-course.spec.js`, `e2e/tests/js16-course.spec.js`, `e2e/tests/js17-course.spec.js`
- `e2e/tests/js-sandbox.spec.js`, `e2e/tests/desktoppilot.spec.js`
- `e2e/tests/ki.spec.js`, `e2e/tests/rag.spec.js`, `e2e/tests/theorie.spec.js`
- dieser Brief, `docs/agent-briefs/DONE.md`

## Abnahme

1. Alle Tests, die Windows-Electron/NTFS benötigen, auf anderen Plattformen
   begründet überspringen; browserbasierte Fälle weiterhin plattformübergreifend.
2. Einheitliche @desktop-Markierung für die gesamte Windowsmatrix. Eigener
   Windows-CI-Job installiert Backend-/Frontend-/Desktop-/Testabhängigkeiten,
   Chromium und führt diese Matrix tatsächlich aus. Keine neuen Abhängigkeiten.
3. Im CI ein HTML-Fehlerreport passend zum vorhandenen Uploadpfad erzeugen;
   Desktopreport hat eigenen Artefaktnamen. Ausschließlich synthetische Profile.
4. Vollständige lokale Regression sowie unabhängiger frischer Review und
   Archivcheck grün. Neuer GitHub-Erfolg erst nach erneutem Push/Lauf behaupten.

## Ergebnis

Ursache anhand GitHub-Jobstatus und der bereitgestellten Fehlersammlung bestätigt:
fünf Windows-Electronfälle liefen ohne Plattformschutz im Ubuntu-Browserjob.
Diese fünf Fälle überspringen jetzt begründet andere Plattformen. Alle 22
nativen/Windowsfälle in zehn Dateien sind mit @desktop markiert; der separate
windows-latest-Job installiert die bereits vorhandenen Abhängigkeiten samt
Windows-Electron/Chromium und führt genau diese Matrix seriell aus. Auch die
bisherigen KI-/Material-/Theorie-Desktopfälle sind enthalten; keine Tests entfernt
oder fachlichen Assertions abgeschwächt.

CI erzeugt nun neben der Konsolenausgabe einen HTML-Bericht am bestehenden
Artefaktpfad. Windowsbericht erhält einen eigenen Namen. Keine Paket-/Appänderung,
keine privaten Profile oder Materialien, keine Veröffentlichungsaktion.

Nachweise: vollständiger lokaler CI-Lauf mit 196/196 Fällen bestanden (2,2 min),
anschließend exakt der neue Windowsbefehl mit 22/22 Fällen bestanden (56,2 s).
Build eingeschlossen; HTML-Bericht erzeugt, Auswahl 22 Fälle/zehn Dateien und
Workflow-YAML syntaktisch mit vorhandener js-yaml-Bibliothek geprüft. Kein
zusätzliches Paket installiert. Bekannte vorhandene Chunkgrößenwarnung.

Frischer unabhängiger Review ops038_review nach Ergänzung der vier zunächst
nicht markierten KI-/Material-/Theoriefälle freigegeben, keine offenen Findings.
GitHub selbst wurde noch nicht erneut gestartet: Der entfernte Erfolg steht
erst nach Commit/Push und neuem Actions-Lauf fest. Kein Commit/Push ausgeführt.
