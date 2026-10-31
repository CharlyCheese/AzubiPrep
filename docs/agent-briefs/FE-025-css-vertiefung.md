# Brief FE-025: Kapitel 7 – CSS verstehen und Konflikte untersuchen

Status: done
Bereich: FE
Angelegt: 2026-10-31

## Ziel

Den freigegebenen Kursausbau nach Kapitel 1–6 um fünf aufeinander aufbauende
Lektionen ergänzen: Selektoren, Reihenfolge, Spezifität, Vererbung und eine
angewandte Fehlersuche an der Informationswebsite. Keine Layout-/JS-Vorgriffe.

## Betroffene Dateien (Allowlist)

- `frontend/src/pilot/course.js`
- `frontend/src/pilot/css-checks.js`
- `frontend/src/pilot/validator.js`
- `frontend/src/pages/FrontendKurs.jsx`
- `frontend/src/components/PilotPreview.jsx`
- `frontend/public/sw.js`
- `backend/src/ai.js`
- `backend/test/ai.test.js`
- `e2e/tests/frontendpilot.spec.js`
- `e2e/tests/desktoppilot.spec.js`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/22-Frontendpilot-Technik.md`
- `docs/agent-briefs/FE-025-css-vertiefung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext

Plan Kapitel 7: `docs/20-Frontendkurs-Qwen-Planung.md`; bisherige Abnahme:
`docs/21-Frontendpilot-Abnahme.md`. Bestehende Praxistests einschließlich
alternativer HTML-Antworten gelten weiter. Private Ablagen werden nicht gelesen.

## Abnahme

- [x] Fünf erreichbare Lektionen erklären Voraussetzungen, Beispiele, kleine
  Aufgaben, gestufte Hilfen, Lösungen und Selbstprüfung; regelmäßige Anwendung.
- [x] Selektorlisten, Nachfahren/direkte Kinder, gleiche Spezifität/Reihenfolge,
  ID/Klasse/Typ und vererbte gegenüber direkt gesetzten Werten korrekt erklärt.
- [x] Pflichtprüfung kontrolliert Technik und tatsächliche Browserdarstellung;
  überschriebene Regeln reichen nicht. Eigene Texte und gleichwertige Lösungen
  bleiben erlaubt; Prüfgrenzen verständlich. Vorschau bleibt abgeschottet.
- [x] Bestehende Entwürfe und historische Ergebnisse bleiben erhalten; neue
  Lektionen werden ergänzt. Keine pauschale Entwertung alter Aufgaben.
- [x] KI unterstützt die neuen IDs und nur bis dahin eingeführte Themen;
  Privatmaterial-/Cloudsperren bleiben unverändert, KI vergibt keine Bewertung.
- [x] Musterlösungen, Alternativen, typische Fehler, reale Vorschau, Wiederladen
  und Prompt-Grenzen getestet; Frontendbuild und Backendchecks erfolgreich.
- [x] Frischer unabhängiger Review, Nachweise und Archivcheck abgeschlossen.

## Ergebnis

16 Lektionen im Entwicklungsstand: fünf neue Schritte mit Übungen,
Vorhersage, Inspektor und Reparaturprojekt. Neue Lektionen `css-7.1`, bestehende
Kurs-/Speicher-/Prüferversionen unverändert. ID und em erscheinen erst bei ihrer
Einführung. KI-Kontext führt die Themen entsprechend schrittweise ein.

Die feste Prüfung nutzt bereinigte, skriptlose Vorschaukopien für reale
Browserwerte. Testfarben belegen die Wirkung der geforderten Selektoren;
im Spezifitätskonflikt muss nach Entfernen der ID-Farbe die Klassenfarbe greifen.
ID-Eindeutigkeit wird je Projektseite geprüft. Direktdeklarationen am Absatz
erfüllen das Vererbungslernziel auch bei identischem Endwert nicht.

Nachweise: 194 Backendtests/21 Suiten und Backend-Lint grün, Frontendbuild
erfolgreich; 24 Werkstatt-Browserfälle inklusive aller 16 Lösungen/Alternativen,
fünf offener Starter, 18 konkreter CSS-Fehler-/Umgehungsfälle, sicherem
Prüfkontext und Übernahme eines alten Kursstandes. Separate Electron-Probe
bestätigt feste Prüfung und Browserwerte beider Seiten im frischen Profil.
Nach letzten Anpassungen betroffene drei Browser-/Electronfälle erneut grün.

Frischer unabhängiger Review `fe025_review`: Wirkungsnachweise und ID-Kontrolle
nachgeschärft, Gegenprüfung aller Korrekturen und didaktischen Reihenfolge
ohne offene Findings; abschließender Dokumentationsreview freigegeben.
Lokaler Dienst auf Port 3002 mit aktuellem Stand neu gestartet.
Keine privaten Ablagen gelesen, keine neuen Abhängigkeiten, kein Paketbau,
keine neue manuelle Nutzerabnahme. Dokumentation/Archiv aktualisiert.
