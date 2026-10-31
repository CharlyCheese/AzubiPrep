# FE-029 – Kursausgabe in HTML-Vorschau anzeigen

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Ausgaben der JS-Übungen zusätzlich direkt in der HTML-Vorschau sichtbar machen.
Als App-Lernhilfe eindeutig kennzeichnen, damit console.log nicht als normale
HTML-Ausgabe gelehrt wird. Keine Freigabe aktiver Skripte/DOM-/Browserzugriffe.

## Allowlist

- `frontend/src/components/JsCourseConsole.jsx`, `frontend/src/components/PilotPreview.jsx`
- `frontend/src/pages/FrontendKurs.jsx`, `frontend/src/pilot/preview.js`
- `frontend/src/pilot/js-course.js`, `frontend/public/sw.js`
- `e2e/tests/js-course.spec.js`
- `docs/20-Frontendkurs-Qwen-Planung.md`, `docs/31-JavaScript-Kapitel-14.md`
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. Nach bewusstem Kursstart erscheinen dieselben begrenzten Ausgaben in Konsole
   und Vorschau. App-Herkunft und Unterschied zu normalem console.log sind klar.
   Vorschauanzeige ist optional zuschaltbar und standardmäßig ausgeschaltet.
2. Ausgabe ausschließlich als escaped Text, niemals als ausführbares HTML.
   iframe-Berechtigungen und CSP unverändert, keine neue Gast- oder Host-API.
3. Neuer Start, Datei-/Startseiten-/Lektionswechsel entfernen alte Ausgaben;
   keine Mischung alter und neuer Läufe. Keine automatische Ausführung.
4. Zusatzanzeige nur zur Laufzeit, nicht in Dateien/JSON/ZIP/Kursspeicher/KI-
   Kontext; Prüfungen arbeiten weiter mit Originaldateien, alte Kapitel unverändert.
5. Echte Browser-/Electronprüfungen für Ausgabe, HTML-Injektion, Neustart/Wechsel,
   Export und Schutzregression; Build, unabhängiger Review und Archivcheck grün.

## Ergebnis

Optionale, standardmäßig ausgeschaltete Spiegelung der Kurskonsole in die
HTML-Vorschau umgesetzt. Kennzeichnung als App-Lernhilfe im Schalter, Ausgabeblock
und Lektionstext; normale Bedeutung von console.log ausdrücklich erhalten.

Nur begrenzte primitive Strings, vor Einfügen escaped und erneut gegen
80 Zeilen/1000 Zeichen je Zeile/32000 Nutzzeichen validiert. Keine Änderung an
Worker, CSP oder iframe-Berechtigungen. Vorschau ohne Zusatzparameter bleibt
identisch; keine Ausführung beim Einschalten der Anzeige.

Ausgaben bleiben in flüchtigem separatem React-Zustand und sind an Dateien,
Startseite und Lektion gebunden. Neues Programm und Komponenten-Cleanup leeren
sie; Generationen verwerfen alte Workerereignisse. JS-Vorschau wird bei neuem
Dateistand/anderer Lektion frisch aufgebaut. Originale, gespeicherter Kursstand,
JSON/ZIP, Prüfabgaben und KI-Kontext erhalten die Anzeige nicht.

Nachweise: alle 99 Browser-/Electronfälle grün, darunter 17 JS-Kursfälle mit
optionalem Spiegeln, Sonderzeichen/HTML-Angriffstext, Ein-/Ausschalten, Export,
Neustart und Übungswechsel; echte Desktop-Spiegelung geprüft. Produktionsbuild
grün mit bestehendem Größenhinweis. Backend/Worker/Packaging unverändert,
kein neuer Backendtestlauf oder Installer erforderlich. Keine privaten Ablagen
oder realen Kontodaten gelesen.

Frischer unabhängiger Review `fe029_review`: zusätzlich
im eigenen Chromium-Profil aktive Ausgabe bis 32000 Nutzzeichen, Startseiten-
wechsel, tatsächliche Previewfunktion mit ungültigen Typen/Größen sowie
identische klassische Vorschau ohne Parameter geprüft. HTML-artige Strings
bleiben Text; lokale Anzeige bleibt standardmäßig aus. Doku20/31/STATUS konsistent.

Im letzten Randfallcheck gefundenes P2 (führende LF direkt nach pre wird vom
HTML-Parser entfernt) behoben: innerer span bewahrt führende Leerzeilen, CR
wird als Zeichenreferenz erhalten. Expliziter textContent-Vergleich für
Leerzeilen/CR sowie Textsicherheit/Export/Wechsel/Electron danach 3/3 grün.
Nachreview bestätigt LF/CR/CRLF und HTML-artige Texte unabhängig in Chromium;
abschließende Freigabe ohne offene Befunde. UI-Screenshot geprüft. Archivcheck:
298 erledigte Tasks, 10 offen, konsistent.
