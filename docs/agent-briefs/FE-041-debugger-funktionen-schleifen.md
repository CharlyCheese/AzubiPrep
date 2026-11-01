# FE-041 – Debugger: Funktionen, Schleifen und Aufrufschritte

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Den D0/D1-Piloten schrittweise um benannte synchrone Funktionen auf Programmebene,
einfache Parameter/return, Rekursion, for/for...of/while/do, break/continue und
Arrayliterale für Iterationen erweitern. Echte Aufrufkette mit auswählbarem Frame,
Hineinschritt, Überspringen und Verlassen; explizite Haltepunkte haben Vorrang.
Keine Closures/Callbacks, Objektinspektion, freien Propertyzugriffe, DOM, Async,
Module oder neuen Bibliotheken. Dies ist ein Teil des D2-Grundlagenpiloten,
keine vollständige D2-/DB01–DB23-Abnahme.

## Allowlist

- `frontend/src/pilot/debugger-core.js`, `debugger-compiler.js`, `debugger.worker.js`, `debugger.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/src/styles/pilot.css`, `frontend/public/sw.js`
- `e2e/tests/debugger.spec.js`, neue `e2e/tests/debugger-functions.spec.js`
- `docs/39-Debugger-Technikpilot.md`, `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Geschlossene Syntax-/Bindungsprüfung: nur direkt aufgelöste deklarierte
   Funktionen aufrufbar; Shadowing, Alias-/constructor-/Helferwege bleiben gesperrt.
   Nicht unterstützte gültige Sprache wird vor Ausführung erklärt.
2. Funktionen/Parameter/return, vorzeitige Rückgabe und rekursive Aufrufe stimmen
   mit normalem QuickJS überein. Rückgabeausdrücke laufen genau einmal.
3. Schleifen erhalten Bedingungen, Inkremente, Iterationsbindungen und
   break/continue. Leerer und dreielementiger Arrayfall sowie Endlosschleifen
   geprüft. Kontrollpunkte auf Anweisungsebene ehrlich erklärt.
4. Aufrufketten und ausgewählte Scopes korrekt, inklusive Shadowing/TDZ;
   passive Erfassung ohne Objekthooks, keine zweite VM-Evaluation in Pause.
   Höchstens 32 aktive Frames, sonst kontrollierter Abbruch; Budgets kumulativ.
5. Hinein/Über/Aus verwenden dieselbe Ausführung und tatsächliche Aufruftiefe;
   Haltepunkte gewinnen auch in übersprungenen Aufrufen. Keine doppelten Ausgaben.
6. Alte Protokoll-/Abbruch-/Datenschutzgrenzen bleiben erhalten. Worker nach
   Stop/Änderung/Fehler/Ende vollständig beendet; keine Frames in Sicherung/KI.
7. Differential-/Angriffs-/Grenzfälle, Browser/Mobil/Tastatur und echtes
   Windows-Electron sowie bestehende Regressionen grün. Frischer unabhängiger
   Review und Archivcheck vor Abschluss; praktische Nutzerabnahme separat.

## Ergebnis

Implementiert: deklarierte synchrone Funktionen auf Programmebene, einfache
Parameter, frühe/implizite Rückgaben und Rekursion. Aufrufkette mit getrennten
Aufrufkennungen, passiver Frameauswahl und aktuellen lexikalischen Scopes.
Einzelschritt betritt eigene Aufrufe; Über/Aus verwenden reale Aufruftiefe und
setzen dieselbe Ausführung fort. Explizite Haltepunkte gewinnen.

for/for...of/while/do, unbeschriftetes break/continue und Arrayliterale für
Iteration ergänzt. Rumpfbeginn ist auch bei leerem Rumpf ein Kontrollpunkt;
Headerbedingungen/Inkremente werden nicht als eigene Haltepunkte beworben.
Funktionswerte bleiben opaque und können nicht als Quelle introspektiert,
aliassiert aufgerufen oder überschrieben werden. Keine neuen Bibliotheken,
Hostrechte, KI-Kontexte oder dauerhaften Debugdaten.

Unabhängiger frischer Reviewer `fe041_debug_review` fand zwei Fehler:
Caller-Scopes bei Aufrufen in Schleifenheadern enthielten alte Rumpfwerte;
doppelte globale Funktionsdeklarationen wurden irrtümlich Syntaxfehler genannt.
Beides behoben. Vertrauenswürdige Callsite-Metadaten mit frischen Leseclosures
aktualisieren den Caller nach Argumentauswertung direkt vor dem Aufruf; diese
Positionen sind keine BP-/Pausenziele. Doppelte Funktionen sind als gültige,
noch nicht unterstützte Sprache markiert. Gegenreview: zwölf unabhängige
Semantik-/Scopefälle und vier Abweisungsfälle bestanden, keine offenen Findings,
begrenzte Freigabe für FE-041. Keine Dateien geändert oder private Daten gelesen.

27 gezielte Browser-/Electronfälle grün. Erster Lauf: 24/25 grün, ein Fehler im
neuen Differential-Testharness (Mock-console.log gab Array.push-Rückgabewert
zurück); Mock korrigiert. Zusätzliche Gegenproben für Callsite-Scopes in echter
VM, Funktionswertkonvertierung, Headerbindungen, verschachtelte Aufrufe und
Laufzeitfehler ergänzt. Vollständige Regression 340/340 ohne Wiederholungen
grün (Chromium 153.0.8010.12, Windows, Electron 45.2.0; 5,3 Minuten), davon
27 Debuggerfälle einschließlich elf neuer Funktions-/Schleifenfälle. Zusätzlich
Framecap unter/auf/über benötigter Aufruftiefe und fehlerhafte Snapshot-IDs/
Funktionszuordnung/Scopes geprüft. Build und Diff-Whitespaceprüfung grün.
Mobile Aufnahme bei 390 Pixeln einschließlich 128 Zeichen langem Funktionsnamen
visuell geprüft: umbrechende Aufrufauswahl/Schaltflächen, lesbare Parameter,
keine horizontale Seitenüberbreite. Tastatur-Aus-Schritt geprüft.

Lokaler Entwicklungsstand unter 127.0.0.1:3002 erreichbar; neuer Service Worker
v30 über HTTP bestätigt. Kein Backendwechsel erforderlich. D2-Gesamtabnahme,
Objekt-/Propertyumfang und praktische Nutzer-/Zoomabnahme bleiben offen.
Kein Installer, Commit/Push; keine privaten Materialien verarbeitet.
