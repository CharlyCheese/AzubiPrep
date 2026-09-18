# Prüfungssimulation

## Zweck
Eine realistische Simulation der IHK-Abschlussprüfung: Zufallsfragen aus dem
Lernbestand, begrenzte Zeit, anschließende vollständige Auswertung.

## Parameter (Frontend-Auswahl)
| Parameter | Werte (MVP) | Hinweis |
|---|---|---|
| Fachrichtung | FIAE, FISI, DPA, DVK | gemeinsame ALLE-Fragen werden automatisch ergänzt |
| Anzahl Fragen | 10/15/20/30/40/60 | Standard 30 |
| Zeitlimit | 15/30/45/60/90/120 min | Standard 60 min |
| Schwierigkeit | alle/leicht/mittel/schwer | Standard „alle" |

## Ablauf
1. **Generierung** (`POST /api/pruefung/generieren`): zieht zufällige Fragen
   aus allen Modulen der Fachrichtung (Fisher-Yates, gewichtet nach Thema,
   optional gefiltert nach Schwierigkeit). Antworten werden nicht an den
   Client ausgeliefert.
   > **Themengewichtung nach Schwäche (`FE-018`):** Das Frontend
   > (`Pruefung.jsx`) berechnet vor jedem Start eine `gewichtung`-Map aus
   > `progressStore` – Themen mit mindestens 3 bisherigen Versuchen und
   > einer Erfolgsquote unter 60 % (dieselbe Schwelle wie bei
   > Stärken/Schwächen unten) bekommen Gewicht 3, alle anderen bleiben bei
   > Gewicht 1. `generierePruefung()` zieht diese Themen dadurch im
   > Schnitt dreimal häufiger unter die ersten N gezogenen Fragen (siehe
   > `exam.js#mischen`). Ohne jeden Fortschritt (z. B. erste Nutzung) ist
   > die Map leer und die Ziehung bleibt gleichverteilt zufällig.
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
  - `generierePruefung(content, { fachrichtung, anzahl, gewichtung, schwierigkeit })`
    – Fisher-Yates-Ziehung (optional gewichtet, s. o.), Schwierigkeitsfilter
    inline, Anzahl auf 1–200 begrenzt.
  - `auswertePruefung(content, { fragen })` – Auswertung inkl. Modul-/Typ-Stats,
    Stärken/Schwächen (Schwellwert 60 %).
- `backend/src/answer.js`: `pruefeAntwort(frage, antwort)` für SC/MC/FT.
- `backend/test/exam.test.js` deckt beide Funktionen ab (`OPS-010`, Stufe 2).
