# Eigene lokale Lernunterlagen für RAG

Dieser Ordner ist für eigene PDF-Ausbildungsunterlagen vorgesehen. RAG und
PDF-Import sind noch nicht implementiert; das Ablegen allein startet keine
Verarbeitung. Der [Planungsstand](../docs/20-Frontendkurs-Qwen-Planung.md)
beschreibt den vorgesehenen Ablauf und den späteren Einrichtungshinweis.

## Materialien ablegen

Im Entwicklungsprojekt eigene PDFs in `local-rag/material/` ablegen.
Falls der Unterordner nach einem frischen Checkout fehlt, kann er angelegt
werden; die spätere Einrichtung soll das automatisch übernehmen.
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
Jeder Anwender fügt eigenes Material selbst hinzu. Geplant sind unter
„Einstellungen → KI und Lernmaterial“ die Aktionen „PDF hinzufügen“,
„Materialordner öffnen“ und „Material aufbereiten“ sowie eine Statusanzeige.
Der tatsächliche beschreibbare Speicherort soll angezeigt werden und liegt
bei installierten Paketen außerhalb des Installationsverzeichnisses.
Diese Oberfläche und Speicherortwahl sind noch nicht umgesetzt.

Ohne eigenes Material bleiben Kurs und feste Aufgabenprüfungen verwendbar.
Die KI darf fehlendes eigenes Quellenmaterial nicht als eingelesenes Wissen ausgeben.
