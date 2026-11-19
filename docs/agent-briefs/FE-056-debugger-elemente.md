# FE-056 – Elemente erzeugen und entfernen im Debugger

Status: done
Bereich: FE
Angelegt: 2026-11-02

## Ziel und Schritte

D4 nach FE-055: createElement, append/appendChild, replaceChildren und
remove/removeChild mit echten Halten derselben VM. Zuerst getrenntes Erzeugen
und Gestalten, dann Einfügen/Verschieben und schließlich Entfernen/Wiedereinfügen.
Bewusst ladbare Aufgabenliste verbindet Formular, Closures und neue Elemente.
Die Kapitel20/21 verwenden append/replaceChildren; deshalb diese APIs einbeziehen.
Keine neue Bibliothek. Bestehende uncommittete FE-055-Arbeit bewahren.

## Allowlist

- frontend/src/pilot/debugger-dom.js
- frontend/src/pilot/debugger.worker.js (vertrauenswürdige Tagliste an VM-Modell)
- frontend/src/components/DebugDOMPreview.jsx, JsDebuggerPilot.jsx
- frontend/src/styles/pilot.css, frontend/public/sw.js
- neue e2e/tests/debugger-elements.spec.js
- docs/38-Quellcode-Debugger-Planung.md,46-Debugger-DOM-Klicks.md,
  48-Debugger-Formulare.md; neue docs/49-Debugger-Elemente.md
- dieser Brief, docs/agent-briefs/STATUS.md,DONE.md
- ignorierte synthetische Artefakte unter e2e/test-results/

## Abnahme

1. Nur bekannte sichere HTML-Tags erzeugbar, ohne body/Namespaces/Optionen/
   Custom-Elements. Stabile private VM-Handles, appendChild/removeChild liefern
   identischen Handle zurück; append/replaceChildren/remove liefern undefined.
   append/replaceChildren unterstützen primitive Texte und mehrere Elemente.
   Bestehende Knoten werden verschoben, nicht kopiert; Mehrfachargumente,
   Nachkommen, Reihenfolge, Text und Listener bleiben nativ vergleichbar.
2. parentNode/isConnected lesbar; body ist die feste Modellwurzel mit parentNode
   null und kann nicht entfernt/verschoben werden. Text-/Void-Controls nehmen
   keine Elementkinder auf. Kein innerHTML/outerHTML/insertAdjacentHTML, freie
   Attribute, URLs, DOM-Reflexion oder Hostrechte. button.type kann sicher auf
   button/submit gesetzt werden. Grenzen/ungültige Hierarchie beenden endgültig.
3. Kein Budgetanstieg: 128 gehaltene Knoten einschließlich Text und abgetrennter
   Teilbäume, Tiefe16,2048 Zeichen/Feld,16KiB Text auch abgetrennt,32KiB sichtbarer
   Snapshot; andere Limits unverändert. Elemente erhalten nie wiederverwendete
   IDs bis128; Entfernen gibt ihre ID/Handle-/Listenerressourcen nicht frei.
   Wiederholtes Erzeugen/Entfernen darf kein Limit umgehen. Textblätter ohne
   öffentliche Handles zählen nur solange sie von einem gehaltenen Element
   referenziert werden. Unter/auf/über Produktionsgrenzen prüfen.
4. Dynamische IDs werden vom bestehenden Ereignisschema sicher angenommen;
   nur aktuelle Baumziele klickbar, alte/abgetrennte Ziele abweisen, kein Replay
   während Pause. Abgetrennte Handles/Listener bleiben nutzbar und nach
   Wiedereinfügen identisch. Bereits begonnene Ereignisse behalten ihren Pfad;
   Entfernen/Umhängen im Handler bleibt deterministisch.
5. CSS-/Strukturvorschau zeigt Einfügen/Entfernen exakt nach der Anweisung,
   keine browserseitige Quellcodeausführung/Navigation/Ressourcen. Dynamische
   Textcontrols verlieren keine fremden Entwürfe oder übernehmen alte Entwürfe
   abgetrennter Ziele. Kein persistierter Live-DOM, keine KI-/RAG-/Kontoanbindung.
6. Aufgabenliste: Leerprüfung, Eintrag erzeugen/stylen/einfügen, einzelnes
   Entfernen per Closure; Haltepunkte und Parameter verständlich. Original-
   export/Reload/Seitenwechsel/Electron-Neustart passiv und kompatibel.
7. Native Referenz-/Negativ-/Grenz-/Worker-/Browser-/Electronprüfungen, passende
   Gesamtregression/Build, eigene Mobil-/Tastatur-/Bildprobe, frischer Review und
   grüne Archivprüfung vor Fertigmeldung. Keine Installer/Commits/Pushes.

## Ergebnis

createElement mit vertrauenswürdiger Tagliste an das in QuickJS serialisierte
Modell angebunden. Nur freigegebene HTML-Tags ohne body/Optionen/Namespaces.
append/appendChild/replaceChildren und remove/removeChild erhalten Identität,
Reihenfolge und Listener; primitive Textargumente werden ohne Objekt-/Funktions-
konvertierung behandelt. parentNode/isConnected sowie enges type-Setzen ergänzt.
Zyklen, Wurzelverschiebung, unzulässige Kinder/Handles und Grenzen beenden den
Lauf endgültig. Keine neuen VM-/Browser-/Datei-/Netzwerkrechte.

Element-IDs werden monoton bis128 vergeben, nie wiederverwendet. checkForest
zählt alle von der internen Map gehaltenen Elemente und ihre aktuellen
Textblätter, auch abgetrennte Teilbäume. Diese teilen128 Knoten/16KiB Text und
Tiefe16; sichtbarer Snapshot32KiB, Feld2048 sowie vorhandene Schreib-/Zeit-/
Listener-/Ereignis-/Protokollgrenzen unverändert. Erzeugen zählt als Schreib-
operation. Argumente werden vor replaceChildren aus ihren ursprünglichen
Eltern gelöst; wiederholte Handles behalten nur die letzte Argumentposition.

Renderer bereinigt Entwürfe entfernter/gesperrter Textcontrols und filtert sie
zusätzlich vor jeder Übergabe. Dieselbe private Eventbrücke unterstützt neue
Modell-IDs. Begonnene Ereignisse behalten ihren ursprünglichen Pfad; neue
Klicks auf entfernte Ziele werden abgewiesen. Entfernen/Wiedereinfügen ändert
keine Handles oder Listener. Keine Livewerte im Originalexport/OPFS/KI.

Bewusst ladbare Aufgabenliste mit Leerprüfung, abgetrennter Elementkonstruktion,
CSS, Einfügen an main.js25:3 und Closure-Entfernen an main.js20:5. Neun neue
Tests: echte UI-Halte vor/nach Einfügen/Entfernen, native Identitäts-/Text-/
Mehrfachargumentreferenzen, dynamische IDs/Events, Bubblingpfad nach Umhängen,
exakte Ressourcen-/Negativgrenzen inklusive Catch-Gegenprobe, dynamische
Textcontrols, Mobil/Tastatur/Originalexport/Reload und Windows-Electron-Neustart.
Alle43 Zieltests (Elemente/Formulare/DOM/CSS) ohne Wiederholung bestanden,
Produktionsbuild grün. Vollständige Regression464/464 Browser-/Windows-Electron-
fälle ohne Wiederholung bestanden (Chromium153.0.8010.12,6,6Minuten).

Frischer unabhängiger Reviewer fe056_elements_review hat Code/Abnahmekriterien
ohne Findings geprüft. Zusätzliche800 deterministische append/replaceChildren-
Szenarien erzeugt, davon313 nativ gültige vollständig verglichen: keine
Abweichung. Vier native Klick-Defaultfälle nach Entfernen/Umhängen ebenfalls
identisch. Synthetische Artefakte unter ignoriertem e2e/test-results/fe056-review.

Eigene siebenstufige Bedienprobe im isolierten Chromiumprofil am laufenden
Webstand bestanden: Initialpause, abgetrenntes Erzeugen unsichtbar, append-
Schritt macht Eintrag sichtbar, Closure entfernt passenden von zwei Einträgen,
Doppelklick ohne Replay/Leerprüfung, Originalexport/Workerende/passive Rückkehr
und390px-Dunkelansicht mit Tastatur-Entfernen/Stop. Bildsicht zeigte zwei
unnötige Warnungen aus list-style-Kurzform; nur Beispieldaten auf die erlaubte
Langform list-style-type umgestellt, Filter unverändert. Neue Assertion verlangt
null CSS-Hinweise im mitgelieferten Beispiel. Nach dieser ausschließlichen
Beispieldatenbereinigung Produktionsbuild und alle43 betroffenen Zieltests
nochmals ohne Wiederholung grün. SWv47. Finale sieben Bediengruppen erneut
bestanden; drei kontrollierte Bilder unter e2e/test-results/fe056-bedienung
(vor-einfuegen.png,nach-einfuegen.png,mobil.png) ohne Filterhinweise. Frischer
Reviewer prüfte auch Skript, Ergebnis und alle drei Bilder selbst; Code-,
Dokument- und Bildreview ohne offene Findings. STATUS/DONE aktualisiert.
Keine neuen Bibliotheken, privaten Ablagen, Installer, Commits oder Pushes.
Archivcheck grün:330 erledigte Tasks,10 offen; git diff --check ohne Fehler.
