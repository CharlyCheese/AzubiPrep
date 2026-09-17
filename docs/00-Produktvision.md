# Produktvision

## Mission
AzubiPrep macht die IHK-Prüfungsvorbereitung für Fachinformatiker effizient,
ortsunabhängig und nachhaltig: **kurze Theorieeinheiten, prüfungsnahe Fragen,
Karteikarten mit Spaced Repetition und realistische Prüfungssimulation** – als
installierbare PWA, deren Grundfunktionen (Lernen, Karteikarten, bereits
geladene Inhalte) auch offline funktionieren. Details und Grenzen dazu (was
zwingend eine Serververbindung braucht) siehe
[`11-PWA-Konzept.md`](11-PWA-Konzept.md#offline-verhalten-stand-2026-09-17-nach-db-001be-001be-003content-001).

## Zielgruppe
- Auszubildende **FIAE** (Anwendungsentwicklung)
- Auszubildende **FISI** (Systemintegration)
- Auszubildende **DPA** (Daten- und Prozessanalyse)
- Auszubildende **DVK** (Digitale Vernetzung)
- Ausbilder:innen & Berufsschulen als Begleitmaterial
- Umschüler & Quereinsteiger vor der Externenprüfung

## Nutzen
- **Prüfungsnah lernen**: Fragetypen und Simulation orientieren sich an der
  IHK-Prüfungspraxis (AP Teil 1 & 2).
- **Nachhaltiger Wissensaufbau**: Spaced Repetition plant Wiederholungen genau
  dann, wenn sie gebraucht werden.
- **Schwächen erkennen**: Stärken-/Schwächenanalyse je Modul und Fragetyp.
- **Flexibel**: Grundfunktionen offline nutzbar, Dark Mode, Desktop & Smartphone.
- **Datenhoheit**: Fortschritt liegt standardmäßig lokal auf dem Gerät, kein
  Login nötig – ein Konto ist optional (siehe unten).

## Alleinstellungsmerkmale
1. **Fachrichtungs-tiefe Modulstruktur** inkl. der neuen Berufe DPA und DVK.
2. **CSV bleibt die Grundlage** für Inhalte (Fragen/Module), auch nachdem
   optional eine PostgreSQL-Content-DB dazugekommen ist (DB-002): CSV ist
   dabei weiterhin Fallback + git-versionierter Review-Snapshot, kein reines
   Web-only-Format – einfache Pflege & Hosting bleiben erhalten.
3. **Repository-Schicht im Frontend** hat die spätere Anbindung von
   Backend-DB, Login und Multi-Device-Sync (DB-001) tatsächlich ohne Umbau
   der UI ermöglicht – ursprüngliches Architekturversprechen eingelöst.
4. **KI-/Agenten-freundliche Architektur**: Inhalte, Logik und UI strikt
   getrennt – einzelne Bereiche sind isoliert weiterentwickelbar (u. a.
   Grundlage für den laufenden agentengestützten Entwicklungsprozess, siehe
   `ORCHESTRATOR.md`).

## Nicht-Ziele

> Dieser Abschnitt beschrieb ursprünglich den MVP-Stand vor Login/Sync/
> Autoren-Oberfläche. Die ersten beiden Punkte sind seit DB-001 bzw.
> CONTENT-001 überholt und unten entsprechend korrigiert/gestrichen.

- Kein Konto-**Zwang**: Login/Sync (DB-001) existiert als *optionales*
  Feature, die App funktioniert weiterhin vollständig ohne Konto.
- Keine Bewertung von Freitexten durch KI (Schlüsselwortvergleich).
- Keine offiziellen Original-IHK-Prüfungsfragen (Lizenz), nur eigenentwickelte,
  am Rahmenlehrplan orientierte Aufgaben.
