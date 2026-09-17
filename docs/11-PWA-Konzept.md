# PWA-Konzept

## Was ist die AzubiPrep-PWA?
Eine **installierbare Web-App**: Nutzer können AzubiPrep auf Smartphone oder
Desktop „installieren" und erhalten eine app-ähnliche Oberfläche mit eigenem
Fenster/Icon. Grundlage sind Manifest + Service Worker.

## Manifest (`frontend/public/manifest.webmanifest`)
- `name/short_name`, `start_url: /`, `display: standalone`
- Theme- und Hintergrundfarbe passend zum Dark Mode
- Icons: PNG 192/512 + maskbares SVG (Erzeugung: `frontend/scripts/gen-icons.mjs`)
- Sprache `de`

## Service Worker (`frontend/public/sw.js`)
| Strategie | Anwendung |
|---|---|
| **Cache-first** | App-Shell (HTML, CSS, JS, Icons) → sofortiges Laden offline |
| **Network-first, Cache-Fallback** | `GET /api/*` → Inhalte bleiben offline nutzbar, nachdem sie einmal geladen wurden |
| Kein Caching | alle Nicht-GET-Requests |

Der Service Worker wird nur im **Produktions-Build** registriert
(`import.meta.env.PROD`), im Dev-Modus bleibt er deaktiviert (kein
Cache-Konflikt während der Entwicklung).

## Offline-Verhalten (Stand 2026-09-17, nach DB-001/BE-001/BE-003/CONTENT-001)

> Korrektur: Dieser Abschnitt beschrieb ursprünglich den reinen MVP-Stand
> (vor Login/Sync/Push/Melden/Autoren-Pflege) und wurde bei deren Einführung
> nicht mitgepflegt. "Vollständig offline nutzbar" stimmte seither nicht
> mehr; außerdem beschrieb ein Absatz eine Offline-Zwischenspeicherung für
> Prüfungsantworten, die nie implementiert wurde (siehe `PruefungLauf.jsx`
> – dort gibt es keine Offline-Erkennung, ein fehlgeschlagenes `POST
> /pruefung/auswerten` zeigt nur die rohe Fehlermeldung, die Antworten sind
> danach verloren). Nachfolgend der tatsächliche, geprüfte Stand.

- Die **App-Shell** (HTML/CSS/JS/Icons) lädt dank Cache-first-Strategie
  auch offline sofort.
- Bereits einmal geladene `GET /api/*`-Antworten (z. B. Fragen/Module/
  Theorie) bleiben dank Cache-Fallback offline sichtbar – der Stand kann
  aber veraltet sein, es gibt keine Kennzeichnung "zuletzt aktualisiert am".
- Fortschritt, Karteikarten und Notizen liegen ohnehin lokal
  (`localStorage`) und sind unabhängig vom Server verfügbar.
- **Alles, was einen Server-Request auslöst, funktioniert offline nicht**:
  Login/Registrierung/Konto-Sync (DB-001), Frage melden (BE-003), Als-
  geprüft-Markieren/Autoren-Pflege (CONTENT-001), Push-Benachrichtigungen
  und die Benachrichtigungs-Historie (BE-001/BE-005/BE-006), sowie die
  **Auswertung** einer Prüfungssimulation. Ohne Verbindung erscheint dabei
  aktuell nur die generische Fehlermeldung des fehlgeschlagenen Requests –
  keine spezielle Offline-Behandlung, keine lokale Zwischenspeicherung.

## Installation
- Desktop (Chrome/Edge): Icon in der Adressleiste bzw. Menü „App installieren".
- Smartphone (Android): „Zum Startbildschirm hinzufügen".
- iOS: „Zum Home-Bildschirm" über das Teilen-Menü (Safari).

## Ausbaustufen (offen)

> Punkte 1 und 4 waren hier ursprünglich als "nicht im MVP" gelistet, sind
> inzwischen aber umgesetzt (BE-001 bzw. DB-001) – unten entsprechend
> aktualisiert, nur noch tatsächlich offene Punkte.

1. **Background-Sync**: automatische Nachreichung von Prüfungsantworten nach
   Wiederherstellung der Verbindung (bisher nicht umgesetzt, siehe
   Offline-Verhalten oben).
2. **App-Update-Hinweis**: neue Service-Worker-Version aktiv anzeigen.
