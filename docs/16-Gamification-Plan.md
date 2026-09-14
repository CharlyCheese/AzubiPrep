# Gamification-Plan (AzubiPrep)

> **Status:** Phasen 1–5 umgesetzt (vollstaendig) · **Bezug:** PROJEKTSTATUS.md, 10-Architektur.md
> **Randbedingung:** Frontend-only, Persistenz in localStorage (kein Backend).

## 1. Zentraler Gamification-Kern

| Baustein | Datei | Zweck |
|---|---|---|
| XP-Regeln und Level | frontend/src/utils/gamification.js | Daten: XP-Werte, Level-Stufen, Titel |
| XP-Store | frontend/src/store/gamificationStore.js | XP + Ereignis-Log (Idempotenz) |
| Belohnungs-Hinweise | frontend/src/store/toastStore.js, frontend/src/components/ToastHost.jsx | Toast-Anzeige |

Zentrale Funktion: gamificationStore.addXp(key, menge) vergibt XP **idempotent**
(verhindert Doppelvergabe beim erneuten Anzeigen von Ergebnis-Seiten).

## 2. Finale Entscheidungen

| Thema | Entscheidung |
|---|---|
| XP-Basis | nur erstmalig richtige Antwort: 5 XP |
| Bonus schwere Frage | +3 XP |
| Bonus Fehler spaeter richtig | +5 XP |
| Quiz abgeschlossen | +25 XP |
| Pruefung abgeschlossen | +50 XP |
| Tagesziel | 10 Fragen (Standard) |
| Wochenziel | 3 aktive Tage |
| Modul als beherrscht | ab 80 Prozent Erfolgsquote |
| Level-Start | 75 XP, danach exponentiell (Faktor 2) |
| Level-Titel | Lehrling, Novize, Adept, Magier, Archmagier, Grossmeister, Pruefungsweiser, Legende |

## 3. Empfohlene Reihenfolge

1. Kern: XP-System + Punkte + Belohnungs-Toast (umgesetzt)
2. Level-Anzeige + Tages-/Wochenziele
3. Badges + Modul-Abschluss
4. Missionen und Lernaufgaben
5. Virtuelle Lernreise

## 4. Datenmodell (localStorage Schluessel azubiprep.game)

- xp: Gesamt-XP (Zahl)
- eventLog: { actionKey: true } fuer idempotente Vergabe
- badges: { badgeId: ISO-Zeitstempel } (Phase 3)
- modulStatus: { modulId: { bearbeitet, beherrscht } } (Phase 3)
- ziele: { tag: 10, woche: 3 } (Phase 2)
- missionen: { tag: { key, zaehler, erledigt }, woche: { … } } (Phase 4)

## 5. Umsetzungsstand Phase 1

- XP-Regeln und Level-Konfiguration (Start 75 XP, exponentiell)
- XP-Store mit idempotenter Vergabe (eventLog)
- Toast-Komponente (ToastHost) in das Layout eingebunden
- XP-Vergabe im Quiz (erstmalig richtig, Boni) und bei Pruefungsabschluss
- Dashboard-Karte mit Level, Titel, XP und Fortschritt zum naechsten Level
- Phase 2: Level/XP in der Statistik, Tagesziel (10 Fragen, +30 XP) und Wochenziel (3 aktive Tage), Fortschrittskarten im Dashboard
- Barrierefreiheit: Animationen respektieren prefers-reduced-motion
- Phase 3: Abzeichen (Konfiguration + Pruefung in addXp), Modul-Status bearbeitet/beherrscht ab 80 Prozent
- Phase 3 Ergaenzung: zentrale Belohnungsmeldung (utils/belohnung.js) fuer XP, Level-Up, Abzeichen und Modul-Status
- Phase 4: 8 Missionen (3 taeglich, 5 woechentlich), Perioden-Key Tag/Woche, Zaehler in game.missionen
- Phase 4 Belohnung: XP je Mission ueber addXp-Schluessel mission:<periodenKey>:<missionId> (idempotent)
- Phase 5: Lernreise unter /lernreise (Stationen je Fachrichtung + gemeinsame Module) mit Karten- und Listenansicht
- Phase 5 Barrierefreiheit: Tabelle mit identischen Angaben, aria-pressed-Umschalter, Status als Text, .sr-only-Nummern
- Verifikation: Frontend-Build 72 Module; Tests GAMIFICATION-LEVEL OK, ZIELE OK, MODUL-STATUS OK, MISSIONEN OK, LERNREISE OK, OPTIONEN OK

## 6. Naechste Phasen (Skizze)

- Phase 2 (umgesetzt): Level-Anzeige in der Statistik, Tages-/Wochenziele (auf activityStore), Belohnungsanimationen
- Phase 3 (umgesetzt): Badges, Modul-Status bearbeitet/beherrscht ab 80 Prozent
- Phase 4 (umgesetzt): Missionen (Perioden-Key Tag/Woche, statische Konfiguration)
- Phase 5 (umgesetzt): Lernreise (barrierefreie Alternative, 4 Fachrichtungen + gemeinsame Module)
