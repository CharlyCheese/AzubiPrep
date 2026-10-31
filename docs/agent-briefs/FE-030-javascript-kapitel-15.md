# FE-030 – JavaScript-Kapitel 15

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Zehn aufbauende Lektionen gemäß Kapitelplan: Strings, Vorlagen, Textmethoden,
Vergleiche, if/else, else if, logische Operatoren, Typumwandlung, Eingabeprüfung
und Tarifrechner-Projekt. Kapitel 16/Funktionen nicht vorwegnehmen.

## Allowlist

- `frontend/src/pilot/js15-course.js`, `frontend/src/pilot/js15-exercises.js`
- `frontend/src/pilot/course.js`, `frontend/src/pilot/js-exercises.js`
- `frontend/src/pilot/js-runner.worker.js`, `frontend/src/components/JsCourseConsole.jsx`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/public/sw.js`
- `frontend/src/api/ai.js`
- `backend/src/ai.js`, `backend/test/ai.test.js`
- `e2e/tests/js15-course.spec.js`, `e2e/tests/js-course.spec.js`, `e2e/tests/frontendpilot.spec.js`, `e2e/tests/css-course.spec.js`, `e2e/tests/forms.spec.js`, `e2e/tests/js-playground.spec.js`, `e2e/tests/js-sandbox.spec.js`
- `docs/32-JavaScript-Kapitel-15.md`, `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/31-JavaScript-Kapitel-14.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Zehn Lektionen mit Voraussetzungen, eigenen Erklärungen/Beispielen, konkreten
   Aufgaben, offenen Startern, zwei Hilfen und Lösungen. Regelmäßige Anwendung,
   Schlussprojekt Tarifrechner. Keine eigenen Funktionen/Schleifen/DOM nötig.
2. Textverkettung, Länge, Vorlagen, trim/toLowerCase/includes, strikte Vergleiche,
   Grenzen bei if/else/else if, &&/||/!, Number/String/Boolean und endliche ganze
   Zahlen schrittweise eingeführt. Leerer Text, "false", NaN und Grenzfälle korrekt.
3. Feste Typ-/Bindungs-/Ergebnisprüfungen in bestehendem Interpreter mit mehreren
   Datensätzen: Alternativen bestehen, Starter/typische Fehler scheitern.
4. Text-/Boolean-Testdaten korrekt als Literale erzeugen und anzeigen; keine neue
   Host-/Browser-/Datei-/Netzwerkfunktion oder frei übergebenen Prüfprogramme.
5. Insgesamt 61 Lektionen; alte 51 Projekte/Prüfstände, freie Konsole, externe
   Dateibearbeitung/-sicherung und optionale Vorschauanzeige erhalten.
6. KI-Themen pro Lektion erweitern, spätere Techniken weiterhin sperren. Keine
   echten Konten oder privaten Unterlagen für Test/Fachabgleich verwenden.
7. Reale Browser-/Electronfälle, Grenz-/Fehlerdaten und Sicherheitsregressionen,
   Backendtests/Lint, Build, frischer Fach-/Sicherheitsreview und Archivcheck grün.

## Ergebnis

Zehn Lektionen in die gemeinsame Auswahl integriert, insgesamt 61: Strings und
length, Vorlagen, Textmethoden, Vergleiche, if/else, Tarifstufen mit else if,
logische Operatoren/verschachtelte Entscheidungen, Umwandlung, Eingabeprüfung
und Tarifrechner. Jede Lektion hat Voraussetzungen, eigene Erklärung/Beispiel,
konkrete Aufgabe, zwei Hilfen, offenen Starter und mögliche Lösung. Keine
eigenen Funktionen/Schleifen/DOM nötig; Kapitel16 bleibt der nächste Schritt.

58 feste Lösungs-/Datenkombinationen in der bestehenden begrenzten Laufzeit.
Text-/Boolean-Testwerte werden durch JSON.stringify korrekt als Literale
erzeugt und angezeigt, keine neuen Host-/Browser-/Datei-/Netzwerkrechte.
Alte 51 Projekte, Prüfergebnisse, freie JS-Fläche und optionale Textspiegelung
bleiben erhalten. Ältere Lektions-/Validatorversionen nicht verändert.

Fachabgleich mit öffentlichen MDN-Primärquellen: strikte Vergleiche und Grenzen,
String-Unveränderlichkeit, UTF-16-Länge, truthy String "false", NaN/Leertext,
endliche ganze Zahlen und explizite Wertebereiche. Keine privaten Unterlagen
oder echten Konten dafür gelesen. Kursdaten/Preise sind synthetisch.

KI-Themenfolge pro Lektion ergänzt; if erst ab Entscheidungslektion, eigene
Funktionen/Schleifen/DOM bleiben gesperrt. Eigener Folgebefund bei mehr als acht
Prüfkriterien behoben: Kontextbuilder priorisiert fehlerhafte Kriterien, damit
auch späte Datensatzfehler übermittelt werden. Die Acht-/Zeichenlimits und der
Altstand-/Codefreigabeschutz bleiben, gespeicherte Reihenfolge unverändert.

Nachweise: 113 Fälle im vollständigen Werkstattlauf grün. Nach Review-/Kontext-
Ergänzung 24 Kapitel15-/KI-Fälle grün (15 neue Kapitel-/Kontextfälle und neun
bestehende KI-Fälle). Alle Starter offen, Lösungen/Alternativen bestanden;
gezielte Fehler bei Texten, Gleichheit, Grenzen, Logik, Leertext, parseInt und
Rabatt erkannt. Kontrollierte String-/Boolean-Eingaben, Vorschau, alte JS-
Ergebnisse, JSON/Reload und echter Desktop-Neustart geprüft. 205 Backendtests/
22 Suiten, Backend-Lint und Produktionsbuild grün; bestehender Größenhinweis.
Tariflektion per Screenshot visuell geprüft. Lokaler Server mit neuem
Lernbegleitungsstand gestartet. Desktop-/Paket-Runtime unverändert; kein
neuer Installer, keine neue Bibliothek oder Veröffentlichung.

Frischer unabhängiger Review `fe030_review`: ein P2 fehlender negativer Alters-
Datenfall im Projekt gefunden und behoben. Fall ergänzt, Mutationen für fehlende
Untergrenze und Leertextprüfung scheitern nun. Nachreview prüft zusätzlich den
Kontextbuilder, Altstände und alle 58 Lösungs-/Datenkombinationen unabhängig;
Freigabe ohne offene Findings. Doku20/31/32/STATUS konsistent.
