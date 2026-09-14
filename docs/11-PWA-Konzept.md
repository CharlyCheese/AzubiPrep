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

## Offline-Verhalten (MVP)
- Nach einmaligem Besuch (online) ist die App **vollständig offline** nutzbar.
- Fragen/Module/Theorie kommen aus dem API-Cache.
- Fortschritt, Karteikarten und Notizen liegen ohnehin lokal (localStorage).
- Eine Prüfung, die offline gestartet wird, kann lokal beantwortet und –
  sobald online – ausgewertet werden (Auswertung erfolgt serverseitig,
  deshalb wird bei der Abgabe eine Verbindung benötigt; ohne Verbindung wird
  ein Hinweis angezeigt und die Antworten bleiben lokal erhalten).

## Installation
- Desktop (Chrome/Edge): Icon in der Adressleiste bzw. Menü „App installieren".
- Smartphone (Android): „Zum Startbildschirm hinzufügen".
- iOS: „Zum Home-Bildschirm" über das Teilen-Menü (Safari).

## Ausbaustufen (nicht im MVP)
1. **Push-Benachrichtigungen** (Web-Push): Erinnerung an fällige
   Karteikarten & Lernserien – erfordert Backend-Push-Dienst.
2. **Background-Sync**: automatische Nachreichung von Prüfungsantworten nach
   Wiederherstellung der Verbindung.
3. **App-Update-Hinweis**: neue Service-Worker-Version aktiv anzeigen.
4. Geräteübergreifende Synchronisation (setzt Login/Backend voraus).
