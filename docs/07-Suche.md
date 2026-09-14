# Suche

## Funktionen
Die App bietet eine **Volltextsuche** über alle Lerninhalte:

| Suche | Gegenstand |
|---|---|
| Fragensuche | Fragentext, Erklärung, Thema, Modul-ID, Quelle |
| Modulsuche | Titel, Beschreibung, Modul-ID, Code |
| Fachrichtungs-Filter | optional `fachrichtung` – Filterung der Ergebnisse |

## Umsetzung
- Backend: `GET /api/suche?q=begriff` (`backend/src/routes/search.routes.js`)
  - mehrwortige Suchbegriffe müssen **alle** im Text vorkommen (UND-Verknüpfung)
  - liefert `{ fragen: [], module: [] }`
- Frontend: Seite `/suche` (`frontend/src/pages/Suche.jsx`) mit Suchfeld,
  Trefferlisten und Direktverlinkung zu Modul bzw. Quiz.

## Geplante Erweiterungen
- Schlagwortsystem je Frage (Tags) mit Filterkombination.
- Filter nach Fragetyp & Schwierigkeit in der Suche.
- Suche über den Lernfortschritt („Wo habe ich Fehler gemacht?").
