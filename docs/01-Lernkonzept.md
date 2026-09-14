# Lernkonzept

## 1. Modulbasiertes Lernen
Jedes Fachgebiet ist ein **Modul** (z. B. `FIAE-PRG` Programmierung).
Ein Modul enthält:
- **Theorie** (Markdown-Datei unter `content/theorie/<modul_id>.md`)
- **Fragen** (CSV unter `content/questions/`)
- Fortschritts- und Erfolgsquoten je Frage/Modul

Lernempfehlung je Modul: Theorie lesen → Quiz → Karteikarten → wiederholen.

## 2. Lernpfade
- **Anfänger-Pfad**: Start mit gemeinsamen Grundlagenmodulen (WiSo,
  Projektmanagement) und Basismodulen der Fachrichtung → leichte Fragen.
- **Fortgeschrittene**: Schwerpunkte auf Schwächen, schwere Fragen,
  Prüfungssimulation unter Zeitdruck.
- Die App zeigt im Dashboard die nächsten sinnvollen Schritte
  (fällige Karteikarten, schwache Module, geplante Wiederholung).

## 3. Fragetypen
| Typ | Erklärung | Auswertung |
|---|---|---|
| **SC** Single Choice | genau eine richtige Antwort | Buchstabenvergleich |
| **MC** Multiple Choice | mehrere richtige Antworten | Mengenvergleich |
| **FT** Freitext | Antwort als Text | Schlüsselworte im Text |

## 4. Lernmodi
- **Theorie**: kompakte Markdown-Blöcke je Modul.
- **Quizmodus**: Fragen nacheinander mit Sofort-Feedback & Erklärung.
- **Karteikartenmodus**: Vorder-/Rückseite, Bewertung schwer/mittel/leicht.
- **Prüfungssimulation**: kompletter Durchlauf mit Zeitlimit & Auswertung.

## 5. Spaced Repetition (Karteikarten)
Leitner-Boxen 1–5 mit wachsenden Intervallen (1/3/7/14/30 Tage):

| Bewertung | Wirkung |
|---|---|
| **schwer** | Box −1 (frühere Wiederholung) |
| **mittel** | Box bleibt |
| **leicht** | Box +1 (spätere Wiederholung) |

Fällige Karten erscheinen im Dashboard und im Lernkalender als
„Wiederholung fällig".

## 6. Schwächenanalyse & Empfehlungen
Aus dem Lernfortschritt werden je Modul Erfolgsquoten berechnet:
- Quote ≥ 60 % → **Stärke**
- Quote < 60 % → **Schwäche** (Empfehlung: Modul erneut üben)

Nach jeder Prüfungssimulation wird dieselbe Analyse für den Prüfungsdurchlauf
angezeigt. Langfristig fließen diese Daten in die Lernpfad-Empfehlung ein.

## 7. Optionale Schwierigkeits-Anpassung

Lernende können den Schwierigkeitsgrad optional steuern:

| Modus | Auswahl | Wirkung |
|---|---|---|
| Quiz | leicht / mittel / schwer / alle | filtert den Fragenpool des Moduls |
| Prüfungssimulation | leicht / mittel / schwer / alle | filtert den Prüfungspool der Fachrichtung |

Standard ist „alle". Gibt es für eine Auswahl keine Fragen, zeigt das Quiz
einen Hinweis mit Schnellwechsel zu „alle".

