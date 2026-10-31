# Eigene lokale Lernunterlagen für RAG

Dieser Ordner ist für eigene PDF-Ausbildungsunterlagen vorgesehen. Nach dem
Ablegen unter „Einstellungen → KI und Lernmaterial“ ausdrücklich „Material
aufbereiten / neu einlesen“ starten. Ablegen allein startet keine Extraktion.
Bedienung, Schutzgrenzen und Konfiguration: [Lokales RAG](../docs/24-Lokales-RAG.md).

## Materialien ablegen

Im Entwicklungsprojekt eigene PDFs in `local-rag/material/` ablegen.
Die Materialverwaltung legt fehlende Unterordner automatisch an. Alternativ
„PDF hinzufügen“ verwenden; dadurch wird eine lokale Arbeitskopie importiert.
Keine eigenen Buchinhalte oder Dateilisten in diese README schreiben.

Nur diese neutrale Anleitung ist zur Veröffentlichung vorgesehen. Alle
anderen Dateien und Unterordner unter `local-rag/` sind durch `.gitignore`
ausgeschlossen, einschließlich PDFs, extrahierter Texte, Index/Embeddings,
Metadaten und Zwischenspeicher. Der Ordner liegt außerhalb der aktuell von
Web- und Desktop-Builds übernommenen Ressourcen. Er darf später auch nicht
in Installer, Exportarchive, Supportprotokolle oder App-Synchronisation gelangen.

Die Regel schützt ausschließlich Dateien innerhalb dieses Ordners und
keine bereits versionierten Dateien. PDFs nicht in `content/`, `docs/`,
`frontend/public/` oder andere veröffentlichte Projektbereiche kopieren.
Nicht mit erzwungenem Hinzufügen (`git add -f`) umgehen. Git-Ausschluss ist
keine Verschlüsselung und verhindert keine lokalen Backups anderer Programme.

## Für Anwender der fertigen App

Das private Buch und der private Suchindex werden nicht mitgeliefert.
Jeder Anwender fügt eigenes Material selbst hinzu. Implementiert sind unter
„Einstellungen → KI und Lernmaterial“ die Aktionen „PDF hinzufügen“,
„Materialordner öffnen“ und „Material aufbereiten“ sowie eine Statusanzeige.
Der tatsächliche beschreibbare Speicherort wird angezeigt und liegt
bei installierten Paketen außerhalb des Installationsverzeichnisses.
Diese Funktionen sind im aktuellen Quellstand verfügbar; bestehende Installer
wurden dafür noch nicht neu gebaut. Im Kurs/Quiz die Verwendung eigener
Unterlagen pro Lernanfrage ausdrücklich auswählen. Die erste Suche arbeitet
lexikalisch, ohne Embedding-Modell; Quellen nennen neutrale IDs und PDF-Seiten.

„Unterlage entfernen“ löscht Such-/Zwischendaten und importierte Arbeitskopien.
Zuvor selbst im Materialordner abgelegte Originale bleiben erhalten und werden
anschließend nicht erneut entdeckt. Erneutes Hinzufügen erfolgt dann ausdrücklich
über „PDF hinzufügen“.

Ohne eigenes Material bleiben Kurs und feste Aufgabenprüfungen verwendbar.
Die KI darf fehlendes eigenes Quellenmaterial nicht als eingelesenes Wissen ausgeben.
