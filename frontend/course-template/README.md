# Eigenes Frontend-Lernprojekt

Diese öffentliche Vorlage enthält ausschließlich erfundene Beispieldaten.
Entpacke sie in einen **eigenen neuen Übungsordner**, nicht in AzubiPrep.
Benötigt Node ab 22.12 mit npm; die App installiert keine globalen Werkzeuge.

1. Im Terminal diesen Übungsordner öffnen und `node --version` / `npm --version` prüfen.
2. Paketbeschreibung und Skripte ansehen. `npm ci` installiert die fest aufgelösten Pakete.
   Dafür wird beim ersten Mal Internet benötigt; Paketinstallation kann Herstellerskripte ausführen.
3. `npm run dev` starten, die angezeigte lokale Browseradresse öffnen; Strg+C stoppt den Server.
4. `npm run typecheck`, `npm test` und `npm run build` getrennt ausführen und Ergebnisse dokumentieren.
5. `npm run preview` zeigt den gebauten Stand lokal. Das veröffentlicht nichts.

Die Beispieltests prüfen model.js. Ergänze eigene Grenz-, Daten- und Bedienfälle;
ein grüner Beispieltest beweist nicht die Funktion deines gesamten Projekts.
Für React beginnt index.html bei main.tsx, App.tsx exportiert die Komponente.
Für ein reines JS-/TS-Projekt ändere den Einstieg in index.html passend.
Die JSON-Sicherung des Kurses enthält deine Quelldateien; zurück einlesen führt
keine npm-Skripte aus. node_modules, dist, .git und private Dateien bleiben draußen.

Tastatur, Fokus, native Formulare, eigene CSS-Gestaltung, Zoom und schmale Ansicht
im echten Browser prüfen. Übungsspeicher der App und localStorage dieses externen
Projekts sind getrennt. Wichtige Zustände zusätzlich exportieren.

Git: erst status/diff ansehen, gezielt Dateien vormerken, staged diff prüfen,
kleine verständliche Commits. Veröffentlichung bleibt optional und braucht eine
eigene Prüfung von Inhalten, Daten, Hosting und Router-Fallback.
Keine privaten Unterlagen, Konten, Schlüssel oder echten personenbezogenen Daten verwenden.
