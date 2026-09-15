# Brief FE-008: Design-System-Grundlage (Farben/Typografie/Radius) nach Stitch-Vorlage

Status: done
Bereich: FE
Angelegt: 2026-09-15
Abgeschlossen: 2026-09-15

## Ziel (1–3 Sätze)

Die App soll moderner wirken und den "1-Prompt-KI-Look" verlieren. Sven hat
mit Stitch AI mehrere Referenz-Designs (Dashboard, Karteikarten, Farbpalette
Dark/Light) erstellt und als Grundlage geschickt. Da die App bereits
komplett über CSS-Variablen (`global.css`, `data-theme` an `<html>`)
gestylt ist, wird das neue Farb-/Typografie-/Radius-System zentral an einer
Stelle eingezogen und wirkt dadurch sofort auf die gesamte App (alle Karten,
Buttons, Badges, Sidebar, Flashcards, Kalender, Toasts, …), ohne jede Seite
einzeln anfassen zu müssen. Das ist Phase 1 einer größeren Redesign-Aktion;
seitenspezifische Layout-Anpassungen (z. B. Karteikarten-Seitenleiste,
Dashboard-KPI-Grid wie in Svens Referenzbildern) folgen als eigene,
kleinere Briefs.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/styles/global.css` (Farb-/Radius-/Font-Tokens in `:root`
  und `html[data-theme='dark']`, Sidebar-Aktiv-Zustand, Logo-Badge-Gradient,
  Fortschrittsbalken-Gradient)
- `frontend/src/context/ThemeContext.jsx` (theme-color Meta-Tag Werte)
- `frontend/public/theme-init.js` (theme-color Meta-Tag Werte, Pre-Paint)
- `frontend/public/manifest.webmanifest` (background_color/theme_color)
- `frontend/index.html` (Google-Fonts-Einbindung: Plus Jakarta Sans, Inter,
  JetBrains Mono; Standard-theme-color)

## Kontext (nur Verweise, keine Dokumentkopien)

- Von Sven per Stitch AI gelieferte Referenzen (Dashboard, Karteikarten,
  Farbpalette Dark/Light + Design-System-Blaupause): Basis für die neuen
  Farbwerte (Teal `#0D9488`/`#14B8A6` als Fokusfarbe statt Blau, warmes
  Graphit `#0B0F17`/`#111827`/`#161F30` statt reinem Schwarz im Dark Mode,
  warmes Off-White `#F8FAFC` statt reinem Weiß im Light Mode, Amber
  `#F59E0B` für Streaks/XP unverändert als Warnfarbe/Akzent für
  Gamification erhalten)

## Umsetzungsschritte (Checkliste)

- [x] Neue Farbpalette (Primary/Success/Danger/Warning/Accent + Soft-/Ink-
      Varianten) für Light und Dark Mode in `global.css` eingetragen
- [x] `--radius` von 12px auf 14px erhöht (weicheres, moderneres
      Kartenbild), neue `--radius-sm` (10px) für Buttons/Inputs ergänzt
- [x] Neue Schriftart „Plus Jakarta Sans" (Headlines/UI) + „Inter" und
      „JetBrains Mono" (für spätere Zahlen-/Code-Anzeigen) über Google
      Fonts eingebunden, mit Systemschrift-Fallback (funktioniert auch
      offline, fällt dann automatisch auf Segoe UI/system-ui zurück)
- [x] Sidebar-Aktiv-Zustand von vollflächigem Blau auf sanfte Teal-Pill
      umgestellt (passend zur Stitch-Referenz)
- [x] Logo-Badge-Gradient und Fortschrittsbalken-Gradient an neue
      Primärfarbe angepasst
- [x] theme-color Meta-Tag (App-Titelleiste/PWA) an allen drei Stellen
      (`index.html`, `theme-init.js`, `ThemeContext.jsx`) synchron
      aktualisiert
- [x] `manifest.webmanifest` Hintergrund-/Themefarbe aktualisiert

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] App wirkt in Light und Dark Mode sichtbar moderner/wärmer (Teal statt
      Blau, kein reines Schwarz/Weiß mehr)
- [x] Alle bisherigen Seiten funktionieren weiterhin unverändert (keine
      Layout-Brüche durch die Token-Änderung)
- [x] Schrift wirkt erkennbar anders (Plus Jakarta Sans) – auch offline
      funktionsfähig (Fallback ohne Internet)
- [x] Theme-Umschalter (Light/Dark) funktioniert weiterhin fehlerfrei

## Ergebnis (wird beim Abschluss ausgefüllt)

Von Sven bestätigt: "sieht gut aus von den Farben her". Phase 1
(Farb-/Typografie-Foundation) damit abgeschlossen. Seitenspezifische
Layout-Anpassungen aus den Stitch-Referenzen (Karteikarten-Seitenleiste mit
Session-Metriken, Dashboard-KPI-Grid, Prüfungssimulation-Timer etc.) folgen
als eigene, kleinere Folge-Briefs (FE-009, …).
