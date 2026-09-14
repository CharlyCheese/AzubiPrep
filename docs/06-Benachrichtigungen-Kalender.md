# Benachrichtigungen & Lernkalender

## Konzept (MVP)
Im MVP ohne Backend/Push-Dienst werden Erinnerungen **lokal im Browser**
umgesetzt. Geplante Ausbaustufen sind im PWA-Konzept (siehe `11-PWA-Konzept.md`)
dokumentiert.

## Lernkalender (`/kalender`)
| Funktion | Umsetzung (MVP) |
|---|---|
| Monatsübersicht | Kalenderraster; aktive Lerntage farblich markiert |
| Lernserie (Streak) | Anzahl aufeinanderfolgender aktiver Tage |
| Wiederholungsplan | fällige Karteikarten der nächsten 7 Tage mit Datum |
| Prüfungstermin | Countdown „Tage bis zur Prüfung" + Rückwärtsplanung |

## Erinnerungsarten (Konzept)
1. **Wiederholungserinnerung**: fällige Karteikarten → Hinweis im Dashboard
   („X Karten fällig") und Kalender.
2. **Lernziele**: tägliches Lernziel (z. B. 15 Fragen) – Anzeige des
   Tagesfortschritts im Dashboard.
3. **Prüfungsplanung**: Countdown bis zum eingetragenen Prüfungstermin.
4. **Lernserien**: Motivation über Streak-Anzeige („Lernserie 🔥").

## Technische Einordnung
- Ohne Backend-Persistenz können keine Push-Benachrichtigungen an andere
  Geräte gesendet werden.
- Eine **spätere Server-Anbindung** (Repository-Seam im Frontend) erlaubt:
  Web-Push, E-Mail-Reminder und geräteübergreifenden Kalender.
- Lokale Browser-Notification über die Notification API ist eine
  Zwischenausbaustufe (Berechtigungsdialog erforderlich).

## Tagesplanung (Sprint 1.2)

Über den Kalender können Lernende **einzelne Tage** öffnen und planen:

| Bereich | Funktion | Speicherung |
|---|---|---|
| Eigene Lerninhalte | Lerneinheiten je Tag anlegen, abhaken, löschen | `azubiprep.plan` (`planStore`) |
| Wiederholungen | fällige Karteikarten eines Tages „erledigt" markieren oder auf ein neues Datum verschieben | `azubiprep.karten` (`flashcardStore`) |

Dies ergänzt den automatischen **Wiederholungsplan** (nächste 7 Tage), der aus
den Spaced-Repetition-Terminen abgeleitet wird.

### Anpassung der vorgegebenen Planung
- **Erledigt:** die Karte wird in den nächsten Box-Intervall-Termin gesetzt
  (`flashcardStore.markDone`).
- **Verschieben:** die Karte erhält ein frei gewähltes Fälligkeitsdatum
  (`flashcardStore.reschedule`) – so lässt sich die Planung an den Alltag
  anpassen.

