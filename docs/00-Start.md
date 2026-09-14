# AzubiPrep – Dokumentation

> **AzubiPrep** ist eine Progressive Web App (PWA) zur IHK-Prüfungsvorbereitung
> für Fachinformatiker der Fachrichtungen **FIAE**, **FISI**, **DPA** und
> **DVK**. Dieses Verzeichnis enthält die vollständige Produkt- und
> Entwicklerdokumentation.

## Lese-Einstieg (Reihenfolge)

> **Aktueller Projektstand:** [`PROJEKTSTATUS.md`](PROJEKTSTATUS.md) –
> Kennzahlen, Funktionsumfang, Struktur, verifizierter Stand & offene Punkte.

| # | Dokument | Inhalt | Für wen |
|---|---|---|---|
| 1 | `00-Produktvision.md` | Mission, Zielgruppe, Nutzen, Abgrenzung | alle |
| 2 | `01-Lernkonzept.md` | Lernpfade, Fragetypen, Spaced Repetition | Konzept |
| 3 | `02-Zielgruppen-Module.md` | Fachrichtungen und Modulstruktur | Konzept, Content |
| 4 | `03-Pruefungssimulation.md` | Zeitlimit, Gewichtung, Bestehensgrenze | Konzept, Entwicklung |
| 5 | `04-UI-UX.md` | Oberflächen, Dark Mode, Navigation | UI/UX |
| 6 | `05-Lernfortschritt-Statistik.md` | Fortschritt, Empfehlungen, Notizen | Konzept |
| 7 | `06-Benachrichtigungen-Kalender.md` | Erinnerungen, Serien, Prüfungsplanung | Konzept |
| 8 | `07-Suche.md` | Volltextsuche und Filter | Konzept, Entwicklung |
| 9 | `08-Datenformate.md` | CSV-Schema, JSON, Excel-Workflow | **Content-Agenten** |
| 10 | `09-API-Referenz.md` | REST-Endpunkte | Entwicklung |
| 11 | `10-Architektur.md` | Frontend/Backend, Datenfluss, PWA | Entwicklung |
| 12 | `11-PWA-Konzept.md` | Offline, Installation, Service Worker | Entwicklung |
| 13 | `12-Rollen-Inhaltsmanagement.md` | Rollen, Pflegeworkflow, Versionierung | Betrieb |
| 14 | `13-Scrum-Roadmap.md` | Backlog, MVP, Meilensteine | Projekt |
| 15 | `14-Betrieb-Wartung.md` | Install, Betrieb, Troubleshooting | Betrieb |
| 16 | `15-Recherche-Inhalte.md` | Rahmenlehrpläne, Quellen, QS-Fragenbestand | Content, Redaktion |


## Inhalts-Philosophie

Inhalte sind **Daten, kein Code**: Alle Fragen, Module und Fachrichtungen
liegen als editierbare CSV-Dateien unter `content/` (Excel-kompatibel).
Der Code (Frontend & Backend) ist bewusst **inhaltsunabhängig** aufgebaut –
neue Fragen, Module oder Fachrichtungen erfordern keine Codeänderung.

Siehe [`08-Datenformate.md`](08-Datenformate.md) für das exakte Schema und den
Excel-Pflegeworkflow.
