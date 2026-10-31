# FE-034 – JavaScript-Kapitel 17

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Elf schrittweise Lektionen zu Arrays, Schleifen und Objekten. Index/length,
Ändern/push/pop, for, for...of, while, break/continue, Zahlenprojekt, Objektwerte,
Referenz/flache Kopie, Produktlisten und abschließende Aufgabenübersicht.
Keine Callbacks/Arraymethoden map/filter/reduce, DOM oder neue Hostfähigkeit.

## Allowlist

- `frontend/src/pilot/js17-course.js`, `frontend/src/pilot/js17-exercises.js`
- `frontend/src/pilot/course.js`, `frontend/src/pilot/js-exercises.js`, `frontend/src/pilot/js-runner.worker.js`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/public/sw.js`
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `e2e/tests/js17-course.spec.js`, `e2e/tests/js16-course.spec.js`, `e2e/tests/js15-course.spec.js`, `e2e/tests/js-course.spec.js`, `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`, `e2e/tests/js-playground.spec.js`, `e2e/tests/js-sandbox.spec.js`
- `docs/34-JavaScript-Kapitel-17.md`, `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/33-JavaScript-Kapitel-16.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Elf Lektionen mit Voraussetzungen, Erklärungen, anderen Beispielen, konkreten
   Aufgaben, zwei Hilfen, offenen Startern und Lösungen. Regelmäßige Anwendung,
   Zwischenprojekt Zahlenliste und Schlussprojekt Aufgabenübersicht.
2. Nullbasierter Index, Arraygrenzen/leere Listen, const gegenüber Mutation,
   Schleifenfortschritt/Grenzen, break/continue, Objekte/Referenzen/flache Kopie
   korrekt erklären. Typisch verwendete Felder einzeln protokollieren; Arrays/
   Objekte werden im Host weiterhin nicht beliebig serialisiert.
3. Feste VM-Probes mit direkten Funktionsaufrufen und mehreren Datenfällen;
   strukturierte Eingaben gegen eine unabhängige VM-Datenkopie vergleichen, damit
   Mutation die erwarteten Werte nicht mitverändert. Leere/all-erledigte Listen,
   Reihenfolge, Nullwerte und unbeabsichtigte Mutation prüfen.
4. Insgesamt 82 Lektionen, alte 71 Stände/Versionen/Prüfungen erhalten. Aufklappbare
   Werkzeuge, Export, freie Konsole und optionale Vorschau unverändert. Nur feste
   öffentliche Kursdaten innerhalb QuickJS; keine neue Host-/Browser-/Datei-/
   Netzwerkfunktion oder frei angelieferten Probes/Testdaten.
5. KI-Themenfolge je Lektion; Schleifen/Objekte erst nach Einführung, fortgeschrittene
   Arraymethoden/Callbacks/Pfeilfunktionen/DOM bleiben späteren Kapiteln vorbehalten.
6. Lösungen/Alternativen bestehen, Starter und typische Fehler bleiben offen;
   echte Browser-/Electronfälle, Host-/Ressourcen-/Abbruchregressionen, alte
   Ergebnisse/JSON/Reload sowie Backup eines strukturierten Projekts prüfen.
7. Öffentliche Primärquellen, keine privaten Unterlagen/Konten verwenden;
   Backendtests/Lint, Build, frischer Fach-/Sicherheitsreview und Archivcheck grün.

## Ergebnis

Elf gestufte Lektionen integriert, insgesamt 82: Arrayliteral/Index/length,
Änderungen/push/pop, for, for...of, while, break/continue, neue positive Zahlenliste,
Objektfelder, Referenz/flache Kopie, Produktliste und Aufgabenübersicht. Mit
Voraussetzungen, eigenen Erklärungen/Beispielen, Aufgaben, je zwei Hilfen,
offenen Startern und Lösungen. Zahlenprojekt und Produktliste bereiten den
abschließenden Transfer vor. Fortgeschrittene Arraymethoden/Callbacks/DOM nicht nötig.

33 oberste Datenfälle plus direkte Funktionsaufrufe prüfen leere Listen,
Grenzen/Reihenfolge, 0-Minuten/Bestände und vollständig erledigte Aufgaben.
Ganze Arrays/Objekte bleiben in der Konsole Platzhalter; Eigenschaften/Werte
werden einzeln ausgegeben. Erwartungsdaten werden aus den festen Host-Kurstabellen
als separate VM-Literale aufgebaut und nur als VM-Handle in die Probe gegeben.
Eine Mutation der Eingabe verändert die erwartete Datenkopie nicht mit.
Vergleiche und Serialisierung studentischer Rückgaben laufen im begrenzten Gast,
nie im Host. Snapshot-/Probe-Handles werden per finally freigegeben.

Alte 71 Projekte/Versionen/Prüfstände erhalten, Anzahlgrenze weiterhin dynamisch.
Zusatzwerkzeuge bleiben aufklappbar, Ausgabe-/Exportformate unverändert;
HTML-Vorschau skriptfrei. Keine neue Host-/Datei-/Netzwerk-/Browserfähigkeit,
Bibliothek oder Veröffentlichung. KI-Themen gestuft nach Arrays/Schleifen/
Objektliteralen, fortgeschrittene Methoden/Pfeilfunktionen/Callbacks weiter gesperrt.

Nachweise: alle 165 Browser-/Electron-/Werkstatt-/Kontext-/KI-Fälle im Gesamtlauf
grün, darunter 16 neue Kapitel17-Fälle. Starter offen, Lösungen/Alternativen
bestanden; typische Index-/Zähl-/Stop-/Schlüssel-/Reihenfolgefehler erkannt.
Arraymutation, Aliaskopie und Aufgabenmutation fallen durch; VM-Getter-Timeout,
Korrektur, alte Prüfung, JSON/Reload, optionale Textspiegelung und vollständiger
Desktop-Neustart geprüft. 207 Backendtests/22 Suiten und Lint grün. Produktionsbuild
erfolgreich mit bestehendem Größenhinweis; Projektscreenshot visuell geprüft.
Lokaler Server mit neuer Lernbegleitung gestartet, kein neuer Installer.

Frischer unabhängiger Review `fe034_review` ohne konkrete Findings freigegeben.
Öffentliche MDN-Primärquellen fachlich abgeglichen; 33/33 Lösungen und 0/33
bestandene Starter unabhängig direkt in QuickJS bestätigt. Mutations-/Alias-/
Reihenfolgegenproben geprüft, VM-Datenkopie/Handlefreigabe und Hostgrenze bestätigt.
Keine doppelten IDs, 82 Lektionen/71 vorherige. Plan20/Doku33/34/STATUS aktualisiert.
Keine privaten Unterlagen oder realen Konten gelesen. Kapitel18 ist nächster Schritt.
