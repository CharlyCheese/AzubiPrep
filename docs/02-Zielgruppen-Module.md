# Zielgruppen & Modulstruktur

## Fachrichtungen
| Code | Name | Kernkompetenzen |
|---|---|---|
| **FIAE** | Anwendungsentwicklung | Programmierung, Datenbanken, Softwareentwicklung, Testen |
| **FISI** | Systemintegration | Netzwerke, IT-Sicherheit, Betriebssysteme, Server/Cloud |
| **DPA** | Daten- und Prozessanalyse | SQL/Data Warehousing, Data Science, Statistik, Prozesse |
| **DVK** | Digitale Vernetzung | IoT, industrielle Netze, Automatisierung, Cloud/Edge |

Fragen mit `fachrichtung = ALLE` (WiSo, Projektmanagement) gelten
fachrichtungsübergreifend und werden in jeder Fachrichtungs-Sicht mitgeführt.

## Modulkatalog (MVP-Stand)
| Modul-ID | Fachrichtung | Titel |
|---|---|---|
| WISO | ALLE | Wirtschafts- und Sozialkunde |
| PM | ALLE | Projektmanagement |
| FIAE-PRG | FIAE | Programmierung und OOP |
| FIAE-DB | FIAE | Datenbanken und SQL |
| FIAE-SWE | FIAE | Softwareentwicklung und Vorgehensmodelle |
| FIAE-TST | FIAE | Softwarequalität und Testen |
| FISI-NET | FISI | Netzwerktechnik |
| FISI-SEC | FISI | IT-Sicherheit |
| FISI-BET | FISI | Betriebssysteme und Server |
| FISI-SYS | FISI | Hardware, Virtualisierung und Cloud |
| DPA-DB | DPA | Datenbanken und SQL |
| DPA-DS | DPA | Data Science und KI-Grundlagen |
| DPA-ANA | DPA | Datenanalyse und Statistik |
| DPA-PRO | DPA | Prozessmodellierung und -optimierung |
| DVK-IOT | DVK | IoT und eingebettete Systeme |
| DVK-NET | DVK | Vernetzung und Kommunikation |
| DVK-AUT | DVK | Automatisierung und Industrie 4.0 |
| DVK-CLD | DVK | Cloud- und Edge-Computing |

## Erweiterbarkeit
Neue Module sind **reine Datenänderung**:
1. Zeile in `content/modules.csv` ergänzen,
2. `content/questions/<Modul>.csv` anlegen,
3. optional `content/theorie/<Modul>.md` hinterlegen,
4. Backend neu laden (`POST /api/admin/reload` oder Neustart).

Der Code bleibt unverändert. Neue Fachrichtungen ergänzt man analog über
`content/fachrichtungen.csv`.
