# Lernfortschritt & Statistik

## Lokale Datenhaltung (MVP)
Ohne Login/User-ID liegt **aller Fortschritt lokal** in `localStorage`
(`frontend/src/store/localStore.js`). Gespeichert werden:

| Bereich | Key | Struktur |
|---|---|---|
| Profil/Einstellungen | `azubiprep.profil` | fachrichtung, name, prüfungstermin |
| Lernfortschritt | `azubiprep.fortschritt` | je frageId: richtig/falsch/letztesErgebnis/modulId |
| Prüfungsverlauf | `azubiprep.pruefungen` | Liste mit Score, Modul-Stats, Zeitpunkt |
| Notizen | `azubiprep.notizen` | Liste mit Titel, Inhalt, Modul |
| Karteikarten | `azubiprep.karten` | je frageId: box, fälligAm, wiederholungen |
| Lernaktivität | `azubiprep.aktivitaet` | Datum → Anzahl Lernereignisse |

## Fortschrittsanzeigen
- **Dashboard**: beantwortete Fragen, zuletzt richtig, fällige Karten,
  Lerntage gesamt; Balken je Kennzahl.
- **Modul-Detail**: Anzahl Fragen, Verteilung nach Typ & Schwierigkeit.
- **Statistik**: Erfolgsquote je Modul (Balken), Karteikarten-Boxverteilung,
  Verlauf der Prüfungssimulationen.

## Erfolgsquoten & Empfehlungen
- Quote = richtig / (richtig + falsch) je Modul.
- Quote ≥ 60 %: Stärke (grün), ≥ 40 %: mittel (gelb), sonst Schwäche (rot).
- Empfehlung: Schwache Module erneut üben; nach Prüfungssimulation direkt zu
  den Karteikarten des schwachen Moduls verlinken.

## Schwächenanalyse
Siehe `03-Pruefungssimulation.md` – nach jeder Simulation werden Stärken und
Schwächen je Modul berechnet und angezeigt.

## Notizen
Notizen werden lokal gespeichert und können einem Modul zugeordnet werden
(frei wählbar). Sie unterstützen den nachhaltigen Wissensaufbau durch eigene
Formulierungen (aktives Lernen).
