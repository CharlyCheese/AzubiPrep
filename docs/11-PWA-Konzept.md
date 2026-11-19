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
| Gemeinsame Installation | Beim Bauen ermittelt Vite die zur Startseite gehörenden Skripte, Styles und Icons. Der Browser prüft ihre SHA-256-Werte, bevor er den neuen Stand aktiviert. |
| Navigation mit Offline-Startseite | Online lädt die App die aktuelle Seite vom lokalen Webdienst. Ist er unerreichbar, können auch direkte Lernlinks die gespeicherte Oberfläche öffnen. |
| Zwischenspeicher für öffentliche Inhalte | Bereits geladene Katalogdaten, Module, Fragen und Theoriethemen können aus dem Cache der jeweiligen Version gelesen werden. |
| Nur Netzwerk | Konten, eigene Materialien, KI-Anfragen, die allgemeine Inhaltssuche, schreibende Operationen und Anfragen mit Anmeldetoken. |

Der Service Worker wird nur im **Produktions-Build** registriert
(`import.meta.env.PROD`), im Dev-Modus bleibt er deaktiviert (kein
Cache-Konflikt während der Entwicklung).

## Aktualisierung und Offline-Betrieb

Für ein Update muss die installierte PWA ihren bisherigen Webdienst unter derselben Adresse erreichen. Beim Wechsel von einer älteren PWA kann zunächst noch die alte Seite erscheinen. Speichere deine Arbeit und öffne die App erneut. Eine unterbrochene Installation lässt die zuletzt vollständig gespeicherte Version verfügbar.

- Nach erfolgreicher Erstinstallation startet die Oberfläche auch ohne Netzverbindung. Für noch nicht geladene Lektionen, Inhalte oder zusätzliche Programmteile kann der Webdienst erforderlich sein.
- Bereits zwischengespeicherte öffentliche Katalogdaten können vom aktuellen Serverstand abweichen.
- Fortschritt, Karteikarten und Notizen liegen ohnehin lokal
  (`localStorage`) und sind unabhängig vom Server verfügbar.
- Anmeldung, Kontosynchronisation, Autorenpflege, Benachrichtigungen, allgemeine Inhaltssuche und Prüfungsauswertung benötigen den laufenden Webdienst. Eine Prüfungsabgabe muss bei bestehender Verbindung erfolgen.

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
