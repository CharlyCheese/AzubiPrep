# FE-043 – Debugger: einfache Arrays und Datenobjekte

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel und Umfang

Nächster begrenzter D2-Teil: gewöhnliche Objektliterale mit Datenfeldern,
Array-/Objekt-/Stringzugriffe auf eigene Datenfelder einschließlich length,
Lese-/Schreibzugriffe und einfache Zuweisungen/Inkremente an diesen Feldern.
Explizite Zugriffe im Programm sind von automatischer Variableninspektion
getrennt: Arrays/Objekte bleiben in Snapshot/Konsole opaque. Keine Methoden,
Getter/Setter im Lerncode, Prototypen, Funktionswerte, dynamischen Aufrufe,
Callbacks, DOM, Async oder neuen Bibliotheken.

## Allowlist

- `frontend/src/pilot/debugger-compiler.js`, `debugger-core.js`
- `frontend/src/components/JsDebuggerPilot.jsx`, `frontend/public/sw.js`
- `frontend/src/styles/pilot.css`, `e2e/tests/debugger-functions.spec.js`
  (aufgedeckte Überbreite langer Aufrufnamen, eindeutiges Warten auf Funktionshalt)
- neue `e2e/tests/debugger-data.spec.js`
- `docs/39-Debugger-Technikpilot.md`, `docs/38-Quellcode-Debugger-Planung.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Positive Syntax-/Bindungsprüfung bleibt geschlossen. Nur Datenliterale
   ohne Methoden/Accessoren/Spread/Prototype-Schlüssel zugelassen. Eigene
   Datenfelder über begrenzte interne VM-Helfer lesen/schreiben; geerbte
   Funktionen, constructor/prototype/__proto__, Serializer- und Helferwege
   dürfen auch über berechnete Schlüssel nicht erreichbar werden.
2. Arrayindex/length, Objektfelder, verschachtelte Daten und Übergabe/Rückgabe
   an eigene Funktionen funktionieren in derselben pausierbaren Ausführung.
   Aktuelle primitive Leseergebnisse und Sideeffects genau einmal.
3. Differentialfälle für Referenzauswertung, Reihenfolge von Basis/Schlüssel/RHS,
   zusammengesetzte Zuweisungen, prefix/postfix, Fehlerfälle, native Arraylänge,
   Kurzschluss und Callerscopes stimmen mit normalem QuickJS überein.
4. Keine automatische Objektinspektion, neuen Hostrechte oder dauerhaften
   Debugdaten. Alle bisherigen Ressourcen-/Abbruchgrenzen gelten weiter.
5. Gezielte Browser-/Windows-Electron-/Angriffs-/Semantikfälle und betroffene
   Regressionen grün; unabhängiger frischer Review, Dokumentation und Archivcheck.
   Vollständige D2-/DB01–DB23- und praktische Nutzerabnahme bleiben separat.

## Ergebnis

Objektliterale mit Datenfeldern/Kurzschreibweise, verschachtelte eigene
Array-/Objekt-/Stringreferenzen, length und Datenfeldzuweisung/-inkremente
implementiert. Private VM-Referenz hält Basis/Schlüssel einmal fest; native
Operatoren erhalten RHS-Reihenfolge, Prefix/Postfix und Rückgabewerte.
Referenzschreibzugriffe berücksichtigen lexikalisch geerbten Strict-Modus.
Nur eigene Datendeskriptoren; geerbte Eigenschaften/Methoden, Accessoren,
Prototyp-/Serializer-/Hilfsschlüssel und Objektschlüssel bleiben ausgeschlossen.
Snapshot/Konsole inspizieren die Datenobjekte weiterhin nicht.

Unabhängiger frischer Review `fe043_data_review` fand dynamisches Object.hasOwn
und interne Error-/TypeError-Aufrufe, die Lerncode gleichen Namens überschattete.
Alle benötigten Intrinsics/Fehlerklassen werden jetzt vor Lerncode privat gebunden.
Vier Repros unabhängig erneut in QuickJS bestanden; weitere zwanzig unabhängige
Referenz-/Operator-/Längen-/Fehler-Differentialfälle ohne Abweichung.
Abschlussreview inklusive Doku/CSS/Testharness: keine offenen Findings,
begrenzte Freigabe für FE-043.

34/34 gezielte Daten-/bisherige Debugger-/Windows-Electronfälle ohne Wiederholung
grün, davon sieben neue Datenfälle. Frontendbuild und Diff-Whitespaceprüfung grün.
Erster gezielter Lauf: 32/34; ein Testharness-Shadowing (String/JSON danach privat
captured) und reale mobile Überbreite sehr langer Funktionsnamen. CSS-Umbruch
für Debugger-p/summary ergänzt und Mobiltest wartet eindeutig auf den aktiven
Funktionsframe. Neuer Mobilnachweis bei 390 Pixeln visuell geprüft. Keine erneute
Gesamtsuite behauptet; die 34 Fälle decken die betroffenen Debuggerpfade ab.

Bestehende Ressourcen-, Stop-, Datenschutz- und lokale Workergrenzen erhalten.
Keine privaten Dateien gelesen, neue Bibliothek/Installer/Commit/Push.
Vollständige D2-/DB01–DB23- und praktische Nutzerabnahme bleiben offen.
