# FE-082 – Desktop, lokale Webversion und PWA auf gemeinsamem Stand

Status: done

Die bestehenden Windows-Weitergabepakete und die installierbare Weboberfläche aus dem Arbeitsstand einschließlich FE-080 und FE-081 bereitstellen. Die Windows-Paketversion wird gemeinsam auf 0.1.6 erhöht. Beide Installer und die portable Web-EXE mit den vorhandenen lokalen Buildwegen erzeugen, Paketgrenzen und Identität der ausgelieferten App-Ressourcen prüfen. PWA-Start und Aktualisierung sowie die aktuelle Suche in isolierten Profilen ausprobieren. Eigenes Lernmaterial, Anmelde- und Modelldaten, lokale Konfiguration und Profile gehören nicht in die Pakete.

Umfang: desktop/package{,-lock}.json, Paket-/Buildprüfungen unter desktop/scripts und desktop/test, betroffene e2e-Pakettests, frontend/public/sw.js und zugehörige PWA-Startlogik falls für die Auslieferung erforderlich, frontend/dist, Installer und Installer-Web. Aktuelle Paketangaben in README.md sowie den aktiven Status-/Betriebsdokumenten und im Briefregister pflegen. Bestehende Lernstände und frühere versionierte Installer erhalten. Kein externes Release, keine neuen Abhängigkeiten.

Für die nachgewiesene Lücke beim ersten PWA-Start ohne Verbindung gehören auch frontend/pwa-shell.mjs, die Vite-Buildkonfiguration, die Startprüfung in backend/scripts/start-web.mjs, die PWA-Prüfungen und docs/11-PWA-Konzept.md zum Umfang. Die Paketfilter in desktop/web-builder.json und desktop/package.json schließen PDF-Dateien unabhängig von der Großschreibung der Endung aus.

Nach der Paketprüfung soll das Desktop-Setup auch eine bestehende Windows-Benutzerinstallation von 0.1.1 auf 0.1.6 aktualisieren. Den bisherigen Installationspfad, die registrierte Produktversion und die Identität der installierten Programmdateien mit dem geprüften Paket bestätigen.

## Abnahme

- Desktop-Setup, Web-Setup und portable Webversion verwenden dieselben 44 Backend-Quelldateien, 236 öffentlichen Inhaltsdateien und 23 ausgelieferten Frontend-Dateien. Der unabhängige Vergleich hat auch die 3.895 Dateien der mitgelieferten Backendbibliotheken in beiden Varianten abgeglichen.
- Die Paketlaufzeit von Desktop und Web wurde mit frischen Gastprofilen geprüft. Beide erreichen von der Willkommensseite das Dashboard und über „Gewinnkalkulation“ den richtigen Lernreiseabschnitt bzw. über „Flexbox“ die richtige Werkstattlektion. Der Rückweg erhält den jeweiligen Suchbegriff. Beide enthalten 7.000 durchsuchbare Fragen, 26 Module, 94 Lernreisethemen mit 248 Lernzielen und 167 Werkstattlektionen. Die React- und TypeScript-Debuggerproben bestanden in beiden Laufzeiten.
- Der PWA-Build ermittelt Prüfsummen für alle neun Startdateien. Erst wenn sie vollständig gespeichert sind, übernimmt der neue Service Worker. Geprüft wurden der erste Offline-Start, ein direkter Offline-Einstieg, der Erhalt einer offenen Eingabe beim Update und der Weiterbetrieb mit der vorherigen Version bei einer unvollständigen Auslieferung. Am laufenden Webdienst bestätigte Chromium im leeren Profil die Installierbarkeit und den Offline-Start mit sichtbarer Willkommensseite.
- Die 50 Paket- und Laufzeittests sowie die neun Tests des Webstarts bestanden. Für die Releaseabnahme kamen ausschließlich öffentliche Inhalte und isolierte Testprofile zum Einsatz.
- Das geprüfte Desktop-Setup hat eine bestehende Benutzerinstallation am bisherigen Pfad von 0.1.1 auf 0.1.6 aktualisiert. Windows-Registrierung und EXE melden den neuen Stand. Alle 4.274 ausgelieferten Programmdateien der Installation stimmen per SHA-256 mit dem geprüften Paket überein.
- Alle drei fertigen EXE-Dateien wurden entpackt und ihre Nutzdaten geprüft. Das Desktop-Setup enthält 4.274 Programmdateien. Web-Setup und portable Webversion enthalten jeweils dieselben 4.272 Programmdateien. Die Prüfung auf private Dateiklassen bestand in allen Paketen. Der unabhängige Review hat auch die vor dem Build erhobenen Prüfsummen der 21 früheren EXE- und Blockmap-Dateien bestätigt.
