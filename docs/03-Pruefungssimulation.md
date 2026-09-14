# Prüfungssimulation

## Zweck
Eine realistische Simulation der IHK-Abschlussprüfung: Zufallsfragen aus dem
Lernbestand, begrenzte Zeit, anschließende vollständige Auswertung.

## Parameter (Frontend-Auswahl)
| Parameter | Werte (MVP) | Hinweis |
|---|---|---|
| Fachrichtung | FIAE, FISI, DPA, DVK | gemeinsame ALLE-Fragen werden automatisch ergänzt |
| Anzahl Fragen | 10–60 | Standard 30 |
| Zeitlimit | 15–120 min | Standard 60 min |

## Ablauf
1. **Generierung** (`POST /api/pruefung/generieren`): zieht zufällige Fragen
   mit Themengewichtung aus allen Modulen der Fachrichtung.
   Antworten werden nicht an den Client ausgeliefert.
2. **Durchführung** im Browser: Timer läuft rückwärts, automatische Abgabe bei
   Zeitablauf, Zwischenstand (beantwortet/gesamt).
3. **Auswertung** (`POST /api/pruefung/auswerten`): Vergleich aller Antworten
   serverseitig.

## Auswertung
| Element | Beschreibung |
|---|---|
| Score | Anteil richtiger Antworten in Prozent |
| Bestehensgrenze | **50 %** (konfigurierbar, IHK-orientierter Richtwert) |
| Je Modul | richtig/gesamt + Quote |
| Je Fragetyp | richtig/gesamt (SC/MC/FT) |
| Stärken/Schwächen | Quote ≥ 60 % Stärke, sonst Schwäche |
| Detailliste | je Frage: richtig/falsch, erwartete Antwort, Erklärung |

## Implementierung (Backend, stateless)
- `backend/src/exam.js`:
  - `generierePruefung(pool, anzahl, gewichtung)` – gewichtete Zufallsziehung
  - `wertePruefungAus(fragen, antworten)` – Auswertung inkl. Modul-/Typ-Stats
  - `filterFragen(pool, filter)` – Filterung nach Fachrichtung/Modul/Typ/…
- `backend/src/answer.js`: `pruefeAntwort(frage, antwort)` für SC/MC/FT.
