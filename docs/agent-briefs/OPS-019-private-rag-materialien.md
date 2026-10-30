# Brief OPS-019: Private RAG Materialien vorbereiten

Status: done
Bereich: OPS
Angelegt: 2026-10-30

## Ziel

Lokalen Ordner für eigene PDF-Ausbildungsunterlagen erstellen und vor
Git-Veröffentlichung schützen. RAG-Ablauf, Ausschluss privater abgeleiteter
Daten aus Distributionen und den späteren Einrichtungshinweis dokumentieren.
Noch keine RAG-Pipeline oder App-Oberfläche implementieren.

## Betroffene Dateien

- `.gitignore`
- `local-rag/README.md`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`
- `docs/agent-briefs/OPS-019-private-rag-materialien.md`

## Schritte und Abnahme

- [x] Lokaler Materialordner vorhanden, nur neutrale Anleitung versionierbar.
- [x] Beliebige Materialien, Unterordner, Textauszüge, Index/Embeddings und Metadaten werden ignoriert.
- [x] Aktuelle Web-/Desktop-Buildkonfiguration nimmt den privaten Ordner nicht auf; keine bereits versionierten Dateien darin.
- [x] RAG mit eigenen PDFs und späterer Anwenderführung dokumentiert; vorhandene Funktionen und Planung getrennt.
- [x] Unabhängiger Review, Diff- und Archivprüfung bestanden.

## Ergebnis

`local-rag/material/` angelegt. `.gitignore` schließt den gesamten privaten
Bestand aus; einzige Ausnahme ist die neutrale `local-rag/README.md` mit
Ablageanleitung und Hinweis auf die noch nicht implementierte Verarbeitung.
Plan und offene Vormerkung um PDF-RAG, lokale Verarbeitung, Quellen-/Seitenbezug,
Statuswerte und spätere Einrichtung ergänzt. Private Materialien und alle
abgeleiteten Daten bleiben außerhalb von Git und Distributionen; bei künftigen
Exporten, Sync und Supportausgaben ist dies ebenfalls zu berücksichtigen.

Geprüft: sechs repräsentative private Pfade mit `git check-ignore -q`
ignoriert, README ausdrücklich nicht ignoriert, `git ls-files -- local-rag`
leer, Materialverzeichnis vorhanden, lokale Dokumentationslinks erreichbar.
Statische Prüfung beider Builder-Konfigurationen: private Ablage außerhalb aller
Ressourcenpfade, App-Dateien explizit begrenzt. Bestehende Paketdateien und
Programmlogik unverändert; kein PDF-Import, kein RAG-Index, kein neuer Build.
Frischer unabhängiger Read-only-Review durch `ops019_rag_review`: Freigabe ohne
Findings; zusätzlich tiefe README-Dateien unterhalb privater Unterordner sowie
Buildskripte geprüft. Dokumentations-/Vorbereitungsaufgabe archiviert; RAG und
App-Oberfläche bleiben offen. Abschlussprüfungen: `git diff --check` und
`node scripts/check-agent-briefs.mjs` bestanden.
