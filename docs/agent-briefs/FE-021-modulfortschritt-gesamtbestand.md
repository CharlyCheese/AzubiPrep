# Brief FE-021: Modulfortschritt am Gesamtbestand messen

Status: done
Bereich: FE
Angelegt: 2026-10-30

## Ziel und Freigabe

Offenen Eintrag aus BekannteBugListevonSvenNutzertests.odt bearbeiten.
Die bisherige Sperre ist durch den ausdrücklichen Nutzerauftrag aufgehoben;
nach erfolgreicher Prüfung den Eintrag durchstreichen und Abschluss ergänzen.
20 richtige Antworten aus einer größeren Sammlung dürfen kein ganzes Modul
als beherrscht markieren. Maßstab: mindestens 80 Prozent sämtlicher
Modulfragen mit richtigem letztem Ergebnis, nicht die Quiz-Auswahlgröße.
Erfolgsquote beantworteter Fragen bleibt als eigene Kennzahl erhalten.

## Betroffene Dateien

- `frontend/src/utils/modulStatus.js`
- `frontend/src/utils/gamification.js`
- `frontend/src/utils/lernreise.js`
- `frontend/src/pages/Lernen.jsx`
- `frontend/src/pages/Lernreise.jsx`
- `frontend/src/pages/Statistik.jsx`
- `frontend/src/pages/Modul.jsx`
- `frontend/src/pages/Quiz.jsx`
- `frontend/src/pages/PruefungErgebnis.jsx`
- `frontend/test/modulStatus.test.js`
- `e2e/tests/modulfortschritt.spec.js`
- `desktop/package.json`
- `desktop/package-lock.json`
- `desktop/test/desktop-package.test.cjs`
- `README.md`
- `../BekannteBugListevonSvenNutzertests.odt`
- `docs/agent-briefs/FE-021-modulfortschritt-gesamtbestand.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Umsetzung

Zentrale Berechnung korrigieren, Modulgesamtzahlen in allen Pfaden zuführen,
Rundung darf Schwellen nicht vorzeitig erreichen. Metadatenlücken dürfen
kein Modul beherrscht melden und bekannte andere Modulgesamtzahlen nicht
unnötig verlieren. Bereits gespeicherte falsche Statuswerte neu berechnen.
Lernbereich/Lernreise/Statistik/Modulseite erklären den Gesamtbezug eindeutig.
Lernfortschritt, XP, Antworten und Fragenkatalog erhalten. Nach Prüfung
Web-/Desktoppakete als 0.1.2 neu bauen, damit der Fix auch dort verfügbar ist.

## Abnahmekriterien

- [x] 20/100 richtig: 20 Prozent Abdeckung, nicht beherrscht.
- [x] Ab 80/100 richtig beherrscht; 79/100 und unbekannte Größe nicht.
- [x] Katalogwachstum und Rundung korrekt; keine Mehrfachzählung von Versuchen.
- [x] Lernbereich, Lernreise und Statistik zeigen konsistente Kennzahlen.
- [x] Quiz-/Prüfungsstatus berücksichtigt Modulgröße und Metadatenladezeit.
- [x] Gezielte Logik-/Browserprüfung und unabhängiger Review bestanden.
- [x] Buglisteneintrag nachvollziehbar durchgestrichen, Restdokument erhalten.
- [x] Aktuelle Web-/Desktoppakete erstellt; Diff-/Archivcheck grün.

## Ergebnis

Die gemeinsame Berechnung trennt Erfolgsquote der beantworteten Fragen von
Beherrschung im Gesamtbestand. Teilstatus heißt in der Anzeige „in Bearbeitung“
beziehungsweise „begonnen“. Erst mindestens 80 Prozent des gesamten Moduls mit
richtigem letztem Ergebnis ergeben „beherrscht“. Abdeckung wird abgerundet;
80-/100-Prozent-Schwellen werden nicht vorzeitig erreicht.

Lernreise erhält Modulgesamtzahlen. Quiz nutzt sofort die vollständige rohe
Fragenliste vor jeder Auswahlbegrenzung und berechnet bei nachgeladenen
Metadaten erneut. Prüfungsergebnisse speichern Antworten weiterhin einmalig;
die Statuseinstufung wartet unabhängig davon auf die Modulgesamtzahlen.
Bekannte Größen anderer Module bleiben bei vorübergehenden Metadatenlücken
erhalten. Vorhandene falsche Statuswerte werden bei der Berechnung korrigiert.

Prüfungen:
- `node --test frontend/test/modulStatus.test.js desktop/test/desktop-package.test.cjs desktop/test/web-runtime.test.cjs`: 12 bestanden.
- `npx --no-install playwright test tests/modulfortschritt.spec.js --workers=1` in `e2e`: 5 bestanden; Lernbereich, Lernreise, Statistik sowie verzögerte Metadaten in Quiz und Prüfungsergebnis.
- Die kontrollierten API-Tests deaktivieren Service Worker, damit der PWA-Cache keine simulierten Antworten ersetzt.
- Frischer unabhängiger Review durch `fe021_review`: anfängliches Finding zu verzögerten Quizmetadaten behoben; abschließende Freigabe ohne weitere Findings. Sieben Logiktests vom Reviewer separat bestanden.
- ODT: Bugabsatz durchgestrichen, Abschlussnotiz ergänzt; ZIP und XML gültig. Unabhängig bestätigt: alle ursprünglichen Absatztexte und sämtliche ZIP-Bestandteile außer `content.xml` unverändert. Originaldatei vor Änderung im temporären Sicherungsverzeichnis aufbewahrt.
- Paketversionen/Lockdatei/README auf 0.1.2. Desktop-App mit isoliertem Profil und ohne Node im Suchpfad gestartet: 7000 Fragen, 26 Module, 4 Fachrichtungen, keine Warnungen, HTML/JavaScript verfügbar.
- Eingebettete Weblaufzeit mit eigenem freien Testport geprüft: ebenfalls 7000/26/4 ohne Warnungen. Kein Installationstest auf einem frischen Windows-PC.
- Beide entpackten Distributionen: alle CSV-Dateien und Frontenddateien bytegleich mit dem aktuellen Stand; Version 0.1.2 im Apparchiv, keine `.env`-Dateien in Ressourcen oder Apparchivwurzel.

Fragenkatalog, Datenbank, Antworten und persönliche Lernstände wurden durch
diese Aufgabe nicht verändert; Browsertests verwenden isolierte Testprofile.
Beide Paketbauten erfolgreich: `Installer/AzubiPrep Setup 0.1.2.exe`,
`Installer-Web/AzubiPrep-Web-Setup-0.1.2.exe` und
`Installer-Web/AzubiPrep-Web-0.1.2-portabel.exe`.
Abschluss: DONE-Eintrag ergänzt, STATUS-Zeile entfernt; `git diff --check`
und `node scripts/check-agent-briefs.mjs` bestanden (270 erledigte Tasks,
10 offene Einträge, konsistent).
