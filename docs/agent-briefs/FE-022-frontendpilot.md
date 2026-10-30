# Brief FE-022: HTML und CSS Frontendpilot

Status: done
Bereich: FE
Angelegt: 2026-10-30

## Ziel

Pilot der Kapitel 1–6 nach docs/20 und docs/21 implementieren: geführte
HTML/CSS-Lernstrecke, Mehrdateien ab zweiter Datei, externe Projekte,
sichere Vorschau, faire Prüfung und wiederherstellbare Entwürfe.
Keine KI, kein aktives Lern-JavaScript, keine neuen Bibliotheken.

## Betroffene Dateien

- `frontend/src/App.jsx`
- `frontend/src/components/Layout.jsx`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/PilotPreview.jsx`
- `frontend/src/pilot/project.js`
- `frontend/src/pilot/storage.js`
- `frontend/src/pilot/course.js`
- `frontend/src/pilot/validator.js`
- `frontend/src/pilot/preview.js`
- `frontend/src/styles/pilot.css`
- `frontend/public/sw.js`
- `frontend/test/pilot-project.test.js`
- `e2e/tests/frontendpilot.spec.js`
- `backend/src/sicherheit.js`
- `docs/22-Frontendpilot-Technik.md`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/21-Frontendpilot-Abnahme.md`
- `docs/00-Start.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/FE-022-frontendpilot.md`

## Entscheidungen vor Umsetzung

Native Browserfunktionen statt neuer Editor-/Parserbibliotheken: zugängliche
Textarea mit Dateibaum, inertes HTML-Template, CSSOM und positive Freigabelisten.
Vorschau im iframe nur allow-same-origin, niemals allow-scripts; HTML wird neu
aufgebaut, Navigation vom vertrauenswürdigen Elternfenster vermittelt.
CSP zusätzlich default-src none, keine aktiven Inhalte oder externen Ressourcen.
Rasterbilder als geprüfte data-URLs, keine SVG/HTML-Bilder.

OPFS speichert versionierte Projektstände getrennt von localStorage. Ein
abgeschlossener neuer Stand wird vor Wechsel des zuletzt-gespeichert-Verweises
geschrieben; fehlgeschlagene Sicherung erhält den vorigen Stand. Keine Migration
bisheriger Lernstände. Unterstützt: aktuelle Chromium-/Firefox-Browser mit OPFS,
localhost oder HTTPS. Desktopunterstützung/Release separat nach tatsächlich
erfolgten Prüfungen ausweisen, keine pauschale Freigabe alter Installer.

Import per Browser-Ordner-/Dateidialog, keine Dateisystem-API im Lerncode.
Grenzen: 50 Dateien, 2 MiB je Datei, 10 MiB gesamt, 8 Ordnerstufen;
Text höchstens 128 KiB je Datei. HTML/CSS/PNG/JPEG/WebP; Archivexport als
versioniertes JSON-Projekt mit allen Dateien, ohne private App-Daten.
Ordnerimport nach Bestätigung ersetzt nur den aktuellen Aufgabenstand.

## Abnahme

Die 30 Kriterien in docs/21 sind maßgeblich. Inhalte mit Quellen prüfen;
Node-/Browserregressionen einschließlich Alternativlösungen, Importgrenzen,
Ausbruchversuchen, Wiederherstellung, Schreibfehler und Desktopgrenzen.
Frischer unabhängiger Inhalts-/Sicherheitsreview bindend. Tatsächlich nicht
prüfbare Kriterien (insbesondere externe Testperson) bleiben ausdrücklich offen;
keine vollständige Pilotfreigabe ohne deren Nachweis. Archivierung/Checkskript
vor Abschluss der abgegrenzten Implementierungsarbeit.

## Ergebnis

Erster lokaler Webprototyp unter `/frontendkurs` implementiert: elf fachlich
geprüfte Lektionen der Kapitel 1–6, frühe Mehrdateien und externer Modus,
HTML/CSS-Vorschau mit positiven Freigabelisten, Inspektor per Maus/Tastatur,
aufgabenbezogener Validator, gestufte Hilfen, Musterlösung/Transferstatus,
standbezogene Bewertungsmeldung und OPFS-Entwurfssicherung. JSON-Sicherung und
erneuter JSON-Import erhalten relative Pfade und Projektstartseite. ZIP erhält
den Dateibaum für den eigenen Editor; bei Ordnerimport ist die Startseite neu
zu wählen. Keine
Originalüberschreibung, keine neue Bibliothek, kein DB-/Fragenkatalogeingriff.

13 Node- und 19 Browserfälle bestanden (20 Pilotfälle, zwölf bestehende
Regressionen). Aktueller Build index-Dr7DjykK.js. ZIP unabhängig geprüft;
Desktop-/Kompaktansicht visuell kontrolliert. Frischer unabhängiger Review
`fe022_review` mit Quellenabgleich aller elf Lektionen: neun Findings behoben,
final keine weiteren blockierenden Code-Findings. Prüfungen und Grenzen siehe
docs/22; 23/30 Kriterien im Web-Prüfumfang nachgewiesen.

Dies ist ein abgeschlossener Web-Implementierungsschritt, keine Gesamtfreigabe.
Offen: P2.4, P4.3, P4.6 und P5.1–P5.4 (Desktop-/Plattform-/Windows-Linkprüfung,
echter Zoom/manueller Tastaturablauf/unabhängige Testperson). Bestehende
Electron-Installer unverändert; zufälliger Desktopport/persistenter Speicher
und Runtimeaktualisierung sind vor Desktopfreigabe zu lösen. Restabnahme im
STATUS erhalten. Abschließender unabhängiger Doku-/Grenzencheck bestätigt
23 nachgewiesene und sieben offene Kriterien; Pfaddekodierung separat geprüft.
Dokumentationspräzisierung zum ZIP-Export eingearbeitet. Webstand lokal zum
Test bereitgestellt. Abschluss: DONE-Eintrag ergänzt; `git diff --check` und
`node scripts/check-agent-briefs.mjs` bestanden.
