# Brief FE-027: HTML-Formularkapitel 13

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Sechs aufeinander aufbauende Formularlektionen nach dem CSS-Abschluss:
Beschriftung, Eingabetypen, Auswahlgruppen, native Validierung, zugängliche
Bedienung und Formularprojekt. Vor JavaScript anhalten und dessen Planung
gemeinsam mit dem Nutzer durchführen. Keine privaten Ablagen verwenden.

## Betroffene Dateien (Allowlist)

- `frontend/src/pilot/form-course.js`
- `frontend/src/pilot/form-checks.js`
- `frontend/src/pilot/layout-checks.js`
- `frontend/src/pilot/course.js`
- `frontend/src/pilot/preview.js`
- `frontend/src/pilot/validator.js`
- `frontend/src/components/PilotPreview.jsx`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/public/sw.js`
- `backend/src/ai.js`
- `backend/test/ai.test.js`
- `e2e/tests/forms.spec.js`
- `e2e/tests/frontendpilot.spec.js`
- `e2e/tests/css-course.spec.js`
- `e2e/tests/desktoppilot.spec.js`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/22-Frontendpilot-Technik.md`
- `docs/28-HTML-Formulare-Abnahme.md`
- `docs/agent-briefs/FE-027-html-formulare.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Abnahme

- [x] Sechs verständliche Lektionen mit Voraussetzungen, Erklärung, Beispiel,
  konkreten Aufgaben, gestuften Hilfen, offenen Startern und passenden Lösungen.
- [x] form/label/id/name, sinnvolle Eingabetypen, textarea, select/options,
  checkbox/radio mit fieldset/legend, required/min/max/step und native Grenzen
  schrittweise eingeführt. Platzhalter ersetzen keine Beschriftung.
- [x] Beschriftungsklick, Tastatureingabe, Auswahl und Browserfehlermeldungen
  funktionieren in der Vorschau. Native Prüfung wird lokal demonstriert;
  weder Formularversand noch Speicherung eingegebener Vorschauwerte.
- [x] Eng begrenzte Formularelemente/Attribute; kein Lern-JavaScript, Upload,
  Fremdformularziel, externes form-Attribut oder neue Sandboxberechtigung.
  Bestehende CSP-/Netzwerk-/IPC-Grenzen erhalten und getestet.
- [x] Feste Prüfung berücksichtigt echte Labelzuordnung, Formzugehörigkeit,
  Gruppierung, Erreichbarkeit und native Validity-Zustände mit synthetischen
  Werten. Keine Bewertung durch KI; gleichwertige IDs/Texte/Strukturen zulässig.
- [x] Formularprojekt in der mehrseitigen Website: klare Hinweise, sichtbarer
  Fokus und Bedienbarkeit auf schmaler/breiter Ansicht. Vollständige
  Barrierefreiheit und Textqualität bleiben menschliche Selbstprüfung.
- [x] Bestehende Entwürfe/Prüfstände erhalten, neue Lektionen ergänzt. Speicher-
  Anzahlgrenze für 43 Lektionen angepasst. KI bleibt auf eingeführte Themen
  begrenzt; JavaScript/Frameworks noch gesperrt.
- [x] Browser-/Electron-Prüfungen, passende Regressionen, Backendtests/Lint,
  Frontendbuild, frischer unabhängiger Review und Archivcheck grün.

## Ergebnis

Sechs Formularlektionen umgesetzt, insgesamt 43 Lektionen bis Kapitel 13.
Die Starter verlangen echte Ergänzungen zum vorherigen HTML-Stand; erste
Aufgabe mit Formgerüst, Abschlussprojekt mit Grundfeldern. Freie IDs/Texte,
umschließende Labels, Formular auf anderer Seite und display:contents zulässig.

Vorschau unterstützt begrenzte Formular-Tags/Attribute mit funktionierenden
Labels, Auswahl und nativer lokaler Prüfung über Button/Enter. Sandbox/CSP
bleiben ohne Formular-/Skriptfreigabe; Ziele/Uploads werden nicht übernommen.
Getippte Vorschauwerte bleiben flüchtig, nicht in Sicherung oder KI-Kontext.
Feste Prüfung mit synthetischen Werten, Sichtbarkeits-/Kontrast-/Fokuschecks
und konsistentem Formularkandidaten bei 360/1280px. Native Prototypzugriffe
sichern DOM-Clobbering auch im Inspektor ab. Alte Ergebnisse erhalten, Anzahl-
grenze für 43 Lektionen angepasst; KI-Themen schrittweise erweitert.

Frontendbuild, 196 Backendtests/21 Suiten und Backend-Lint erfolgreich.
65 Browser-/Electronfälle grün: 24 bisherige Werkstatt-, 24 CSS-, zehn Formular-
und sieben Desktopfälle. Lösungen/Alternativen und offene Starter, echte
Bedienung/Fehlerkorrektur, native Versandversuche/Upload-/Navigationssperren,
Grenzwerte/Label-/Gruppen-/Fokusfehler und Speicher-/Exportverhalten geprüft.
Playwrights eigene Rollenauflösung scheitert am absichtlichen parentElement-
Clobbering; dort nativer Klick, normale Bedienung separat getestet.

Frischer unabhängiger Review fe027_review: Code/Fachfolge freigegeben nach
Inspektor-Korrektur, unterschiedlichen Auswahlwerten und offenen Startern.
Dok28/20/22/STATUS abschließend ohne Befunde abgeglichen. Praktische menschliche
Abnahme bleibt separat; Grenzen und Build-Größenhinweis in Dok28 ausgewiesen.
Aktueller Stand unter Port 3002 bereitgestellt. Kein neuer Installer, keine
neue Bibliothek, keine privaten Unterlagen verwendet. JavaScript bleibt
gesperrt bis zur gemeinsam geplanten Ausführungs-/Sicherheitsarchitektur.
