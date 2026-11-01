# OPS-042 – CI-Abbrüche bei Debuggergrenzen und mobiler Lesefassung

Status: done
Bereich: OPS
Angelegt: 2026-11-01

## Befund und Ziel

Geliefertes Linux-CI-Protokoll: 440 Fälle, davon 401 bestanden,
37 plattformbedingt übersprungen, 2 fehlgeschlagen (auch nach Retry).
Debugger-Abnahme erwartet bei 63/64/65 Bindungen done, erhält error; eigentliche
Abbruchursache bisher nicht ausgegeben. Mobile Lesefassung hat nach Tastatur-
Navigation horizontale Überbreite. Beide Ursachen mit Messungen reproduzieren,
gezielt beheben und Aussagekraft der Grenz-/Layouttests erhalten.

## Allowlist

- frontend/src/pilot/debugger-core.js, debugger.worker.js, debugger-compiler.js
  nur soweit ein belegter Laufzeit-/Snapshot-Befund eine Korrektur benötigt
- frontend/src/components/PreparedCourse.jsx, frontend/src/styles/pilot.css
- e2e/tests/debugger-acceptance.spec.js, prepared-course.spec.js
- e2e/playwright.config.js, .github/workflows/ci.yml nur für belegte Prüfdiagnostik
- frontend/public/sw.js bei Produktänderung
- README.md bei notwendiger Korrektur von Prüfnachweisen
- dieser Brief, docs/agent-briefs/STATUS.md,DONE.md
- ignorierte synthetische Diagnose-/Prüfdateien e2e/test-results/

## Abnahme

1. Debuggerfehlergrund sichtbar, tatsächliche Ursache durch Gegenprobe belegt.
   Keine hochgesetzten Produktionsgrenzen, pauschalen Retries/Skips oder
   Akzeptanz beliebiger error-Ergebnisse anstelle korrekter Werte/Trunkierung.
2. Mobile Lesefassung ohne horizontales Scrollen auch bei abweichenden Schriften;
   lange Inhalte/Bedienelemente lesbar, Tastatur und Navigation erhalten.
3. Passende Regressionen/Build grün; Linux-/Belastungssimulation klar von echter
   GitHub-CI unterscheiden, kein unbelegter Remote-Erfolgsbericht.
4. Frischer unabhängiger Review und sachgerechte Archivierung; check-agent-briefs
   und Diffprüfung grün. Keine neuen Bibliotheken, privaten Ablagen, Pakete,
   Commits oder Veröffentlichung.

## Ergebnis

Beide Fehler anhand des beigefügten Protokolls getrennt untersucht. Auf diesem
Windows-Rechner kein nutzbares Linux-Subsystem oder gh-CLI vorhanden; keine
Systeminstallation vorgenommen. Kein tatsächlicher GitHub-Linux-Nachlauf
behauptet. Bestehende Windows-Tests allein hatten die beiden Unterschiede nicht
aufgedeckt; zusätzliche gezielte Gegenproben ergänzt.

Debugger: checkpoint serialisierte nach jedem Wert den gesamten wachsenden
Zustand erneut. Bei 63/64/65 separaten Deklarationen lokal 524–620ms aktive Zeit,
unter Faktor 4/8 der virtuellen performance.now-Uhr Abbruch „Aktive Zeitgrenze
erreicht.“ bei unveränderten 1000ms. Dies reproduziert den Fehlerpfad als
Belastungssimulation; das gelieferte CI-Protokoll enthielt den eigentlichen
error-Text nicht. Betroffene Assertion nennt nun Count und Terminalnachricht.
Keine pauschalen Timeouts/Skips/Retryerhöhungen oder angehobenen Produktionscaps.

Snapshotgrößen inkrementell aus der exakten JSON-Repräsentation jedes privaten
Eintrags ermittelt. Komma, doppelte Abbildung oberster Scopes und false→true-
Längenänderung berücksichtigt. Lesereihenfolge, globaler Bindungszähler auch beim
verworfenen Eintrag, passive Darstellung und abschließende UTF8-Prüfung erhalten.
Keine Objektinspektion/zusätzliche Sourceaufrufe oder neuen Rechte. Nachher lokal
60–66ms; alle neun Gegenproben inklusive Faktor 4/8 done und 63/64/64 Werte korrekt.
Weitere Messung während Regression 76–84ms, ebenfalls ohne Abbruch unter Faktor 8.

Mobile Lesefassung: langer ungetrennter Datentoken in Kriterium der zweiten
Lektion überschritt bei abweichenden Schriftmaßen die Inhaltsbreite. Bei 390 px
Viewport bis 440 px mit Monospace 16 px, 485 px mit 18 px. overflow-wrap:anywhere im
Lesefassungsbereich und begrenzte umbrechende Buttons ergänzen den bisherigen
Schutz für pre/summary/select, ohne Texte abzuschneiden oder Inhalte zu ändern.
Nachher alle sechs Fontvarianten bei 390 px ohne Überstand. Neue Prüfmatrix
320/390px mit Arial/Tahoma/Monospace bei 18 px inklusive offenem Downloadbereich.

Drei neue Tests: linearer Serialisierungsaufwand über die tatsächlich erzeugte
JSON-Zeichenmenge statt flüchtiger Wallclock-Frist; mehrere Frames mit Escapes/
Unicode unter/auf/über exakter Codeunit-Grenze; verschärfte Font-/Layoutmatrix.
24/24 gezielte Abnahme-/Lesefassungsfälle ohne Wiederholung grün. Bestehende
Produktionsgrenzen und Assertions erhalten, keine Änderungen an CI-Konfiguration.

Frischer Reviewer ops042_ci_review bestätigte die Snapshotsemantik zusätzlich
in 300 differentiellen Szenarien gegen HEAD: 1/2/3 Frames, 1/2 Scopes, 0/1/8/32/65 Werte,
128/350/700/1500/8192 Units, 1/64 Bindings, TDZ, Quotes/Backslash/Newline/Tab/Unicode.
Alle Snapshots/Fehler gleich. Code, Tests, Messungen und mobile 320/390 px-Bilder
ohne Findings freigegeben. Globale Navbar bei künstlich 18 px-Monospace außerhalb
dieses Lesefassung-Fixumfangs; Bilder belegen den geforderten Tokenumbruch.

Synthetische Messungen/Probe/Bilder unter ignoriertem
e2e/test-results/ops042-diagnose, Vorher- und Nachherdateien getrennt erhalten.
Keine Nutzerentwürfe/privaten Unterlagen oder Kontodaten gelesen/geändert.
Vollständige Regression 443/443 Browser-/Windows-Electronfälle ohne Wiederholung
grün (Chromium 153.0.8010.12, 6,3 Minuten). Produktionsbuild bestanden, bestehender
Bundlegrößenhinweis unverändert. Der tatsächliche neue GitHub-Linux-Lauf steht
bis zum nächsten Push aus; keine automatische Veröffentlichung ausgeführt.
SW v45 für die Produktkorrektur. Kein Paketbuild/Commit/Push, keine neue Bibliothek.


Archiv-/Diffprüfung grün: 328 erledigte Tasks archiviert, 10 offen.
