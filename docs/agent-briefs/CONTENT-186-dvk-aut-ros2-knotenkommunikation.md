# Brief CONTENT-186: DVK-AUT – ROS-2-Knotenkommunikation

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-AUT-208 bis -231 ergänzen, Modul 207 → 231.
ROS-2-Jazzy-Kommunikation, Konfiguration und Ausführung in Robotiksystemen.

## Betroffene Dateien

- `content/questions/DVK-AUT.csv`
- `docs/agent-briefs/CONTENT-186-dvk-aut-ros2-knotenkommunikation.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

207 Altstämme vollständig gelesen; globale Suche ohne ROS-2-Lernzieltreffer.
Frische Primärrecherche im offiziellen ros2/ros2_documentation-Repository,
Branch jazzy. docs.ros.org blockiert den Abruf; die offiziellen RST-Quellen
sind unmittelbar abrufbar. Schwerpunkt auf konkreten Schnittstellenregeln.
Keine Installation, Builds, Dienste, DB/.env, Commits oder Pushes.
Altpräfix 117327 Byte SHA256:
72a63e3911067cb77c74162ae69060163513998ec39c295a4e8ad9c7f2c17133.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Frische Primärbelege, eindeutige Lösungen und fachnahe Distraktoren.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 207 → 231, Gesamtkatalog 5913 → 5937.
Frischer unabhängiger content186_review prüfte alle 24 gespeicherten Fragen,
96 Optionen, Erklärungen, alle 207 Altstämme und globale 26 CSV.
Eigene frische Primärrecherche auf acht offiziellen Jazzy-RST-Quellseiten.
Finding: falsch-exklusive Allquantoren in acht Fragen sowie verstärkende
Formulierungen. Zehn Distraktoren in 210/211/212/213/215/223/227/231
fachlich variiert. Anschließend sämtliche 24 tatsächlichen Endzeilen erneut
vollständig geprüft und ohne offene Findings freigegeben.
Keine Lernzielduplikate zu MQTT, FreeRTOS-Callbacks, Java-Executors oder
Datenbankatomarität: konkrete ROS-2-Verträge unterscheiden sich.
Altpräfix unverändert, 14 Felder, globale IDs eindeutig. App-Parser,
Content-Validator (5937 Fragen/26 CSV), Diff- und Archivierungscheck grün.

Primärquellen: offizielles Repository ros2/ros2_documentation, Branch jazzy,
https://raw.githubusercontent.com/ros2/ros2_documentation/jazzy/source/Concepts/
- Basic/About-Nodes.rst
- Basic/About-Topics.rst
- Basic/About-Services.rst
- Basic/About-Actions.rst
- Basic/About-Parameters.rst
- Intermediate/About-Quality-of-Service-Settings.rst
- Intermediate/About-Executors.rst
- Intermediate/About-Tf2.rst
