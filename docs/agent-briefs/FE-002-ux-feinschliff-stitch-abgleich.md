# Brief FE-002: UX-Feinschliff – Stitch-Leitlinie auf restliche Seiten anwenden

Status: done
Abgeschlossen: 2026-09-15
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Gap-Analyse gegen Svens Stitch-Leitlinie (`docs/04-UI-UX.md`, Abschnitt
„Design-System-Redesign") hat sechs Seiten identifiziert, die die
Farb-/Typografie-Basis (FE-008) zwar automatisch mitbekommen, aber noch
nicht das Layout-Grundmuster (Haupt-/Seitenspalte, fokussierte
Detailansicht, Status-Badges statt Listen) aus FE-009/FE-010. Diese Lücke
schließen, ohne bestehende Funktionen zu verändern.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Statistik.jsx` – KPI-Kacheln + Modul-/Prüfungsstatistik
  aktuell einspaltig gestapelt
- `frontend/src/pages/Modul.jsx` – Theorie, Fragenliste, Lernergebnis-Karte
  gestapelt; Theorie als Hauptspalte, Lernergebnis/Fortschritt als
  Seitenleiste sinnvoll
- `frontend/src/pages/PruefungErgebnis.jsx` – zwei Ergebnis-Karten
  untereinander statt nebeneinander
- `frontend/src/pages/Quiz.jsx` – fokussierte Detailansicht analog
  Karteikarten (FE-009) noch nicht angeglichen
- `frontend/src/pages/PruefungVerlauf.jsx` – Liste abgeschlossener
  Prüfungen, Status-Badge-Ansatz (bestanden/nicht bestanden) statt reiner
  Listenzeilen
- `frontend/src/pages/Notizen.jsx` – Notizliste, Status-/Modul-Badge statt
  reiner Listenzeilen
- `frontend/src/styles/global.css` – Wiederverwendung der bestehenden
  `.dashboard-layout`/`.grid-kpi`-Klassen, ggf. kleine Ergänzungen

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/04-UI-UX.md`, Abschnitt „Design-System-Redesign" (verbindliche
  Leitlinie, insbesondere Layout-Grundmuster und Gruppierung mit
  Status-Badges)
- `docs/agent-briefs/FE-009-dashboard-karteikarten-layout.md` und
  `docs/agent-briefs/FE-010-lernbereich-kalender-pruefung.md` (bisherige
  Umsetzung derselben Leitlinie – gleiches Muster, gleiche Sorgfalt bei
  engen/weiten Fenstern, siehe dortige Nachbesserungen)
- Ursprüngliche Analyse dieses Abgleichs: Chat-Antwort vom 2026-09-15
  (sechs identifizierte Seiten, siehe Umsetzungsschritte unten)

## Umsetzungsschritte (Checkliste)

- [x] Statistik: KPI-Kacheln + Kern-Kennzahlen als Hauptspalte,
      Modul-/Prüfungs-Detailkarten als Seitenleiste (oder umgekehrt, je
      nach Inhaltsgewicht) über `.dashboard-layout`
- [x] Modul: Theorie als Hauptspalte, Lernergebnis-Karte + Fortschritt als
      Seitenleiste
- [x] PruefungErgebnis: die beiden Ergebnis-Karten (`grid grid-2` bereits
      vorhanden für andere Elemente) nebeneinander statt gestapelt, wo
      inhaltlich sinnvoll — **war bereits erfüllt**, keine Änderung nötig
- [x] Quiz: fokussierte Detailansicht analog Karteikarten (klar
      abgegrenzte Antwortoptionen, dezenter Fortschritt) – Konsistenz mit
      FE-009 herstellen, ohne bestehende Logik (Auswertung, Freitext,
      Tastatur) zu verändern
- [x] PruefungVerlauf: Listenzeilen bekommen ein Status-Badge (bestanden/
      nicht bestanden, Datum, Fehleranzahl) statt reinem Fließtext —
      **war bereits erfüllt**, keine Änderung nötig
- [x] Notizen: Listenkarten bekommen ein Modul-Badge statt nur Fließtext-
      Zuordnung — **war bereits erfüllt**, keine Änderung nötig
- [x] Bei jeder Seite: Verhalten bei schmalen Fenstern prüfen (Lehren aus
      FE-009: Breakpoint früh genug, kein Abschneiden von Seitenleisten-
      Inhalten) — von Sven getestet; dabei einen Bug in Karteikarten.jsx
      gefunden und behoben (siehe Ergebnis unten)

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Alle sechs Seiten funktionieren unverändert (keine Regressionen bei
      bestehenden Funktionen) — code-seitig geprüft, Rules-of-Hooks in
      Modul.jsx und Tastatur-Shortcuts in Quiz.jsx explizit verifiziert
- [x] Auf breiten Fenstern zeigen Statistik, Modul und PruefungErgebnis ein
      Haupt-/Seitenspalten-Layout statt reiner Kartenstapel
- [x] Quiz wirkt konsistent zur Karteikarten-Detailansicht
- [x] PruefungVerlauf und Notizen zeigen den Status/die Zuordnung als
      Badge statt nur im Fließtext
- [x] Auf schmalen Fenstern (getestet bis ca. 800px) fällt jede Seite
      sauber auf eine Spalte zurück, ohne abgeschnittene Inhalte —
      von Sven bestätigt

## Ergebnis (wird beim Abschluss ausgefüllt)

Code-Review gegen die
Kriterien (2026-09-15) ergab: 3 von 6 Seiten (PruefungErgebnis,
PruefungVerlauf, Notizen) waren bereits korrekt umgesetzt – Stitchs
Einschätzung „alles schon erledigt" stimmte für diese 3, aber nicht für
Statistik, Modul und Quiz, wo das Haupt-/Seitenspalten-Muster komplett
fehlte.

Für die 3 fehlenden Seiten wurde eine gezielte Anfrage mit vollständigem
Code-Kontext an Stitch geschickt (`stitch-anfrage-fe002-rest.md`). Stitchs
Antwort (als Code, verpackt in einer kaputten three.js-HTML-Datei – Inhalt
aber vollständig nutzbar) wurde geprüft und mit einer Korrektur übernommen:

- **Statistik.jsx**: Hauptspalte = Level/XP-Karte, Modul-Fortschritt,
  Abzeichen; Seitenleiste = KPI-Grid, Karteikarten-Verteilung, letzte
  Prüfungen. 1:1 wie von Stitch vorgeschlagen übernommen.
- **Modul.jsx**: Hauptspalte = Theorie- und Fragen-Akkordeons; Seitenleiste
  = Quiz-Schnellstart + kompakte Modul-Status-Karte (`grid-kpi`). Rules-of-
  Hooks-Reihenfolge (Hooks vor Early-Returns) explizit erhalten. Den von
  Stitch weggelassenen Hinweistext „Noch keine Fragen beantwortet …" beim
  Einbauen wieder ergänzt.
- **Quiz.jsx**: aktive Frage in Hauptspalte + Seitenleiste mit Session-
  Fortschritt/Einstellungen; Ergebnis-Bildschirm mit Fehlerauswertung in
  der Hauptspalte + Scorecard in der Seitenleiste. **Ein Fehler in Stitchs
  Vorschlag korrigiert:** im Fehler-Review nach Quiz-Ende zeigte der
  Code Antwortoptionen wieder als Buchstaben (A/B/C) statt als Ziffern
  (1/2/3) – das hätte die heutige FE-011-Ziffern-Umstellung an dieser
  Stelle rückgängig gemacht. Vor dem Einbauen wieder auf
  `buchstabeZuZiffer` umgestellt.

Keine CSS-Änderungen nötig – Stitch hat ausschließlich bestehende Klassen
(`.dashboard-layout`, `.grid-kpi`, `.card` usw.) verwendet.

Alle 3 Dateien auf Svens PC übertragen (Transfer per Checksum-Vergleich
verifiziert, keine Abweichung). Sven hat die drei Seiten im laufenden
Betrieb getestet, auch bei schmalen Fenstern.

**Nachtrag – Bugfix Karteikarten.jsx (`global.css`):** Beim Testen mit
schmaler Fensterbreite (Lehre aus diesem Brief, siehe Umsetzungsschritt
„schmale Fenster prüfen") fiel auf, dass die Flashcard-Ansicht in
`Karteikarten.jsx` (nicht Teil des ursprünglichen FE-002-Seitenscopes,
aber vom selben Test-Schritt erfasst) bei vielen Antwortoptionen auf
schmalen Bildschirmen überlief und nachfolgende Seitenelemente
("Session-Metriken") überlappte. Ursache: `.flashcard-face` war beidseitig
fix auf `position: absolute; inset: 0` mit `min-height: 260px` gesetzt,
wodurch der Inhalt die Kartenhöhe sprengen konnte, ohne dass der
Container mitwuchs. Fix in `global.css`: die jeweils sichtbare Kartenseite
bekommt `position: relative` (im normalen Textfluss, bestimmt die Höhe),
die verdeckte Seite bleibt `position: absolute; inset: 0` für den
3D-Flip-Effekt, gesteuert über die `.flipped`-Klasse. Von Sven bestätigt
("endlich, so froh das es endlich passt").

Damit ist FE-002 vollständig abgeschlossen: 3 von 6 Seiten waren bereits
konform (PruefungErgebnis, PruefungVerlauf, Notizen), 3 Seiten wurden nach
Stitchs Leitlinie neu gebaut (Statistik, Modul, Quiz), plus der zusätzlich
gefundene und behobene Karteikarten-Mobile-Bug. Alle Punkte von Sven
getestet und bestätigt.
