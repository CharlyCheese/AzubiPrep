# Recherche echter Ausbildungsinhalte

## Orientierung an Rahmenlehrplänen
Die Inhalte des MVP sind **eigenentwickelte, prüfungsnahe Fragen**, die sich
an den **aktuellen IHK-Rahmenlehrplänen** der vier Fachrichtungen orientieren
sowie an allgemein gültigen Fachstandards (ISTQB, Scrum Guide, DIN 69901,
BPMN, IEC 61131, IEEE 1588, ACID u. a.). Sie ersetzen keine offiziellen
Original-Prüfungsaufgaben und sind bewusst als **Lernmaterial** formuliert.

## Quellenverwaltung
Jede Frage führt eine **Quellenangabe** in der Spalte `quelle`:
- Rahmenlehrpläne je Fachrichtung (z. B. „Rahmenlehrplan FIAE")
- Gesetze/Normen (BBiG, BetrVG, SGB V, DIN 69901)
- Fachstandards (ISTQB, Scrum Guide, IEC 61131-3, IEEE 1588)
- Fachliteratur-Kurzbezüge (SOLID-Prinzipien, GoF-Muster)

Bei der Pflege gilt: **Quelle immer pflegen** – eine Frage ohne Quelle ist
nicht freigabefähig.

## Strukturierung je Fachrichtung
| Fachrichtung | Schwerpunkte im Seed |
|---|---|
| FIAE | Programmierung/OOP, SQL, Softwareentwicklung/UML, Testen |
| FISI | Netzwerktechnik, IT-Sicherheit, Betriebssysteme, Server/Cloud |
| DPA | SQL/Data Warehousing, Data Science, Statistik, Prozessmodellierung |
| DVK | IoT/Embedded, industrielle Netze, Automatisierung, Cloud/Edge |
| ALLE | WiSo (Recht, Sozialversicherung), Projektmanagement/Scrum |

## Qualitätssicherung Fragensammlung
- **Vier-Augen-Prinzip**: Jeder neue Fragenblock wird von einem zweiten
  Review (Person oder frischer Agent) geprüft.
- **Automatische Validierung**: `backend/scripts/validate-content.mjs` prüft
  Pflichtfelder, Antwortformate, Modul-Referenzen, IDs und Fachrichtungs-Bestand.
- **Schwierigkeitsgrad-Kalibrierung**: jede Frage ist als leicht/mittel/schwer
  markiert; pro Modul wird eine Mischung angestrebt.
- **Rechtliches**: keine Übernahme urheberrechtlich geschützter
  Original-Prüfungsfragen; eigene Formulierungen.

## Pflegeprozess (Vorgehen)
1. Themenbereich wählen und fachlich recherchieren (Rahmenlehrplan, Fachbuch).
2. Fragen in der Excel-Vorlage (CSV) formulieren – pro Zeile eine Frage.
3. Musterlösung + Erklärung + Quelle + Schwierigkeit ergänzen.
4. Validierung ausführen, Review, Freigabe, Reload.
