# BE-001: Push-Benachrichtigungen – Ideen & Entscheidungspunkte

Status: in Klärung (noch kein finaler Brief, keine Umsetzung)
Bereich: BE
Angelegt: 2026-09-16

Dies ist noch **kein** ausführbarer Brief, sondern eine Vorbereitung für das
gemeinsame Durchgehen der Entscheidungspunkte im Chat (wie bei CONTENT-001).
Ziel: du kannst dir das in Ruhe durchlesen, dir eine Meinung bilden, und wir
klären die offenen Punkte dann Schritt für Schritt.

## Was ist Web-Push technisch?

Drei Bausteine, die zusammenspielen:

1. **Service Worker** (im Frontend, für die PWA bereits vorhanden) – läuft
   im Hintergrund, auch wenn die App-Seite nicht geöffnet ist, und zeigt die
   eingehende Nachricht als System-Benachrichtigung an.
2. **VAPID-Schlüsselpaar** (einmalig serverseitig erzeugt) – identifiziert
   den Server gegenüber den Push-Diensten der Browser-Hersteller (Google,
   Mozilla, Apple …), ohne dass ein Drittanbieter-Dienst nötig ist.
3. **Subscription** – wenn ein Gerät der Benachrichtigung zustimmt (Browser
   fragt aktiv nach Erlaubnis), bekommt es eine eindeutige Push-Adresse vom
   Browser-Hersteller. Diese Adresse muss serverseitig gespeichert werden,
   damit das Backend später gezielt an dieses Gerät senden kann.

Das heißt: technisch ist eine neue kleine Tabelle nötig (z. B.
`push_subscriptions`), ein neuer Endpunkt zum Registrieren/Abmelden, und
eine Sende-Funktion im Backend (Standard-Library: `web-push` npm-Paket).

## Was könnte die App damit tun? (Ausbaustufen)

**Stufe 1 – ereignisgesteuert, einfach**
Eine Benachrichtigung wird direkt als Reaktion auf eine Aktion verschickt,
kein Zeitplan nötig:
- Eine gemeldete Frage (BE-003) wurde von einer Autor:in bearbeitet → der/die
  Melder:in bekommt eine Push-Nachricht "Deine Meldung wurde bearbeitet".
- Für Autor:innen/Admins: neue Meldung eingegangen → Push statt manuell in
  der Fragenpflege nachschauen zu müssen.

**Stufe 2 – zeitgesteuert, braucht einen Scheduler**
Der Server muss selbstständig zu bestimmten Zeiten aktiv werden (z. B. via
`node-cron` oder einem täglichen Timer im Backend-Prozess):
- Tägliche Erinnerung ans Lernziel ("Du hast heute noch nicht gelernt –
  3 Fragen reichen für deine Serie").
- Erinnerung an fällige Karteikarten (Leitner-System: Karten aus Box 1
  sind heute wieder dran).
- Erinnerung an eine bevorstehende/gebuchte Prüfungssimulation.

Stufe 2 ist deutlich mehr Aufwand als Stufe 1 – nicht nur wegen des
Schedulers, sondern weil der Server dafür wissen muss, wessen Lernstand wie
aussieht (aktuell liegt der Lernstand primär im Browser/`localStorage`,
serverseitig nur bei Konto-Nutzern über `user_state`, siehe DB-001).

## Wichtiger Design-Konflikt: passt das zur MVP-Philosophie?

Die App ist bewusst so gebaut, dass sie **ohne Konto und ohne Datenbank**
vollständig funktioniert (siehe README, Abschnitt "Über das Projekt").
Push-Benachrichtigungen brauchen aber zwingend eine serverseitige
Subscription-Speicherung – die Frage ist nur, woran diese Subscription
hängt:

- **Variante A – an ein Konto gebunden** (einfacher, konsistent mit
  BE-003/CONTENT-001, die auch beide eine DB voraussetzen): Push nur
  verfügbar, wenn `DATABASE_URL` gesetzt ist und man eingeloggt ist. Wer
  offline/ohne Konto lernt, bekommt schlicht keine Push-Option angeboten
  (genau wie aktuell bei "Frage melden").
- **Variante B – pro Gerät, ganz ohne Konto**: Subscription wird an eine
  zufällige, lokal im Browser erzeugte Geräte-ID gehängt, unabhängig vom
  Login. Würde näher an der "kein Pflicht-Login"-Philosophie bleiben,
  braucht aber trotzdem zwingend eine Datenbank zum Speichern der
  Subscriptions (ein zustandsloser Server kann nicht "merken", wem er wann
  etwas schicken soll) – die App liefe dann in einem Zwischenzustand: kein
  Login nötig, aber DB trotzdown Pflicht für dieses eine Feature.

Meine Einschätzung: Variante A passt besser zum bisherigen Muster (Login/
Sync/Autoren-Bereich/Melden sind alle schon konsequent an "DB vorhanden +
eingeloggt" gekoppelt) und ist deutlich weniger Aufwand.

## Plattform-Einschränkungen (wichtig für Erwartungsmanagement)

- **Android/Desktop-Chrome/Firefox/Edge**: Web-Push funktioniert gut und
  zuverlässig, auch ohne dass die App offen ist.
- **iOS/iPadOS (Safari)**: Web-Push funktioniert nur, wenn die PWA vorher
  explizit "Zum Home-Bildschirm hinzufügen" wurde (reines Surfen im Safari-
  Tab reicht nicht) – das ist eine Apple-Einschränkung, kein Bug bei uns.
  Für Azubis, die die App nur im normalen Browser-Tab nutzen, kommt auf dem
  iPhone dann schlicht nichts an.
- **Windows-Desktop-App (Electron)**: braucht eigentlich gar kein Web-Push –
  Electron hat eine eigene, viel simplere native `Notification`-API direkt
  im Prozess. Zeitgesteuerte lokale Erinnerungen (Stufe 2) wären hier sogar
  einfacher umzusetzen als über den Umweg Web-Push, brauchen aber einen
  eigenen (kleinen) Code-Pfad zusätzlich zur PWA-Variante.

## Aufwandseinschätzung (grob)

| Teil | Aufwand |
|---|---|
| Backend: VAPID-Setup, `push_subscriptions`-Tabelle, Registrieren/Abmelden-Endpunkt, Sende-Funktion | mittel |
| Frontend: Berechtigungs-Dialog, Service-Worker-Erweiterung (Push-Event empfangen/anzeigen) | mittel |
| Stufe 1 (ereignisgesteuert, z. B. "Meldung bearbeitet") | klein, sobald die Grundinfrastruktur steht |
| Stufe 2 (zeitgesteuert, z. B. Tagesziel-Erinnerung) | zusätzlich mittel (Scheduler + serverseitige Auswertung des Lernstands) |
| Electron-native Notifications (optional, separat) | klein bis mittel, eigener Code-Pfad |

Realistischer erster Schritt wäre also: Grundinfrastruktur + **eine**
Stufe-1-Benachrichtigung (z. B. "Meldung bearbeitet", weil das direkt an
BE-003 anknüpft und keinen Scheduler braucht), alles Weitere als
eigenständige Folge-Briefs.

## Offene Entscheidungspunkte (klären wir im Chat)

1. **Variante A oder B** (Konto-gebunden vs. pro Gerät ohne Konto)? Meine
   Empfehlung: A.
2. **Welcher erste Trigger?** Kandidaten: "Meldung bearbeitet" (Stufe 1,
   knüpft an BE-003 an), Tagesziel-Erinnerung (Stufe 2, mehr Aufwand aber
   vermutlich der Trigger mit dem größten Lern-Effekt).
3. **iOS-Einschränkung**: reicht dir ein Hinweistext in den Einstellungen
   ("Für Benachrichtigungen auf dem iPhone: App zum Home-Bildschirm
   hinzufügen"), oder soll das Feature komplett zurückgestellt werden, bis
   das für alle Plattformen gleich gut funktioniert?
4. **Electron-native Notifications**: gleich mitdenken oder erstmal nur
   PWA/Web-Push, Desktop-App bekommt das später als eigenen Punkt?
5. **Opt-in/Opt-out**: eigener Schalter in den Einstellungen zusätzlich zur
   Browser-Berechtigung (damit man Push innerhalb der App auch wieder
   abschalten kann, ohne über die Browser-Einstellungen zu müssen) – gehe
   ich davon aus, dass das gewünscht ist, sag aber gern, falls nicht nötig.

Kein Code wurde für BE-001 verändert – das hier ist reine Vorbereitung für
die Entscheidungsrunde.
