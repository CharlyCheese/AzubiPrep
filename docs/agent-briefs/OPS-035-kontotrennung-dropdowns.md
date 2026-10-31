# Brief OPS-035: Eigene Konten bei Weitergabe und lesbare Dropdowns

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Auftrag

Nutzer bestätigt funktionierende ChatGPT-Erklärungen und gewünschte Qualität.
Weitergabe/Download darf keine bestehende Kontoverbindung übernehmen: jeder
Empfänger benötigt eigenes Konto. Zudem Dropdownoptionen global im hellen/
dunklen Design bereits ohne Hover lesbar machen. Keine privaten Identitäten
aus Screenshot oder Dateien übernehmen.

## Betroffene Dateien

- desktop/package.json, desktop/web-builder.json
- desktop/scripts/build-desktop.cjs, desktop/scripts/build-web.cjs
- desktop/scripts/check-distribution.cjs
- desktop/scripts/desktop-build-config.cjs
- desktop/test/desktop-package.test.cjs, desktop/test/web-runtime.test.cjs
- backend/test/ai-vault.test.js, backend/test/chatgpt-auth.test.js
- frontend/src/styles/global.css, frontend/src/styles/ki.css, frontend/public/sw.js
- e2e/tests/ki-anbieter.spec.js
- README.md, docs/26-KI-Anbieter.md
- docs/agent-briefs/OPS-035-kontotrennung-dropdowns.md
- docs/agent-briefs/STATUS.md, docs/agent-briefs/DONE.md

Prüfgrundlagen (nur lesen): .gitignore, backend/src/ai-vault.js,
backend/src/chatgpt-auth.js, backend/src/chatgpt.js, backend/src/config.js,
desktop/main.js, desktop/web-main.cjs, desktop/web-runtime.cjs,
frontend/src/store/aiStore.js, frontend/src/api/sync.js.

## Festlegungen

Quell-/Paketkonfiguration und neue Profile prüfen, keine echten Token-/Profil-
oder Materialdateien lesen. In Git nur neutrale Anleitungen, keine Zugangsdaten.
Kein gemeinsamer API-Schlüssel, zentraler Kontofallback oder geteilter Login.
Zusätzliche Paketfilter gegen lokale KI-/RAG-Profile und bekannte Credential-
Dateinamen sowie Build-Vorprüfung gegen versehentlich breite Ressourcenwurzeln.
Fresh-Profile-Test muss eigene Anmeldung verlangen, ohne Netzwerk/Fallback auf
anderes Profil. Bestehende eigene Anmeldung nicht abmelden oder verändern.

Geltungsbereich ist Weitergabe über Git/erzeugte Pakete und getrennte lokale
Profile. Ein bereits angemeldetes Benutzerprofil ist kein Weitergabepaket;
wer dasselbe Windows-Profil oder denselben laufenden lokalen Dienst benutzt,
teilt dessen Anmeldung bis zur Abmeldung. Keine darüber hinausgehende
Mehrbenutzer-Authentifizierung behaupten.

Globale explizite Vorder-/Hintergrundfarben für select/option/optgroup aus
Designvariablen, keine durchsichtigen KI-Select-Hintergründe. Eindeutige
Kontrastprüfung vor Hover für helle/dunkle Oberfläche, synthetische Inhalte.
Keine neuen Abhängigkeiten/Installer/Commits. Screenshot enthält persönliche
Daten und wird weder gespeichert noch veröffentlicht.

## Abnahme

- [x] Git-/Paketpfade schließen Konten und private Materialien aus; Build-
  Vorprüfung und Paketfilter mit Negativfällen getestet.
- [x] Frisches isoliertes Profil beginnt ohne Konto, kann keine andere
  Verbindung nutzen und verlangt eigene Freigabe; vorhandenes Profil unverändert.
- [x] Dropdownoptionen global mit festen Designfarben/Kontrast ohne Hover
  für hell/dunkel geprüft; Frontend neu gebaut.
- [x] Relevante Tests, frischer unabhängiger Review und Archivcheck grün;
  tatsächliche Nutzerabnahme von ChatGPT-Erklärungen neutral dokumentiert.

## Ergebnis

Die bestehende Trennung bestätigt: Auth verwendet nur die jeweils eigene
geschützte Profilablage. Kein Entwicklerkonto/API-Schlüssel als Rückfall,
keine Konten im Lernstandsync, keine Tokens im Frontendpräferenzspeicher.
Neutrale Git-Prüfung: keine privaten Daten versioniert; local-ai/accounts.json
ausgeschlossen. Keine bestehenden Konto-/Materialdateien gelesen oder verändert.

Beide Paketkonfigurationen um explizite Filter für lokale Profile, private
Unterlagen und Credential-Dateinamen ergänzt. Build-Vorprüfung beschränkt
Ressourcenwurzeln und Dateiliste, verlangt alle Privatausschlüsse und verwirft
spätere Einschlussfilter/doppelte Negationen. Zulässige positive Filter pro
Wurzel ausdrücklich festgelegt. CLI erlaubt nur --dir bzw. --publish never;
Konfigurationsüberschreibungen werden vor jedem Buildprozess abgewiesen.
Desktop nutzt eine explizite erneut geprüfte CJS-Konfiguration mit extends:null,
Web einen absoluten Konfigurationspfad. Der installierte Builder unterstützt CJS;
keine neue Abhängigkeit. Kein neuer Installer gebaut.

193Backendtests grün, darunter echte synthetische DPAPI-Vaults in zwei
getrennten temporären Profilen und Auth-Negativprobe ohne Netz/Fallback.
Frisches Profil bleibt leer, eigene Hostkennung; bestehendes Testprofil
unverändert.15Desktop-/Webruntimeprüfungen grün. Paketnegativfälle decken breite
Wurzeln, fehlende Ausschlüsse, Wiedereinschluss, Vererbung und CLI-Overrides ab.

Dropdownoptionen/Optgroups erhalten global feste Designfarben und Selects
keinen durchsichtigen KI-Hintergrund. Frontend gebaut, ServiceWorker v13.
Fünf Anbieter-Browserfälle grün, darunter Options-/Select-Kontrast in Einstellungen
und Theorie, jeweils hell/dunkel ohne Hover (mindestens4,5:1). Native Auswahl
bleibt erhalten, keine eigenen nachgebauten Dropdowns. Weitere Betriebssysteme
und deren Popupdarstellung nicht pauschal abgenommen.

Frischer unabhängiger Code-/Dokunachreview ohne offene Findings:15Runtimefälle
erneut grün,70synthetische private Pfade mit tatsächlichem Electron-builder-
FileMatcher ausgeschlossen, elf zusätzliche Negativfälle abgewiesen.
Findings zu CLI-Konfigurationsüberschreibung und nachträglichem Wiedereinschluss
behoben. Review nur öffentliche Dateien/synthetische Daten. Nutzerbild mit
persönlichen Angaben nicht gespeichert oder übernommen.

Erfolgreiche reale ChatGPT-Erklärungen und gewünschte Qualität durch Nutzer
bestätigt; README/Anbieterdoku/Status aktualisiert. Geltungsbereich Git/erzeugte
Pakete und getrennte lokale Profile klar beschrieben. Ein angemeldetes Profil
oder gemeinsam benutzter laufender lokaler Dienst bleibt bis Abmeldung mit
diesem Konto verbunden; keine zusätzliche Mehrbenutzer-Sperre behauptet.
Archivcheck291erledigt/10offen grün.
