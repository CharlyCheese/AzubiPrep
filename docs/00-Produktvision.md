# Produktvision

## Mission
AzubiPrep macht die IHK-Prüfungsvorbereitung für Fachinformatiker effizient,
ortsunabhängig und nachhaltig: **kurze Theorieeinheiten, prüfungsnahe Fragen,
Karteikarten mit Spaced Repetition und realistische Prüfungssimulation** – als
installierbare PWA, die auch offline funktioniert.

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
- **Flexibel**: Offline nutzbar, Dark Mode, Desktop & Smartphone.
- **Datenhoheit**: Fortschritt liegt lokal auf dem Gerät (MVP), kein Login nötig.

## Alleinstellungsmerkmale (MVP)
1. **Fachrichtungs-tiefe Modulstruktur** inkl. der neuen Berufe DPA und DVK.
2. **Stateless Backend ohne Datenbank**: Inhalte kommen aus Excel/CSV →
   extrem einfache Pflege & Hosting.
3. **Repository-Schicht im Frontend**: spätere Anbindung von Backend-DB,
   Login und Multi-Device-Sync ohne Umbau der UI.
4. **KI-/Agenten-freundliche Architektur**: Inhalte, Logik und UI strikt
   getrennt – einzelne Bereiche sind isoliert weiterentwickelbar.

## Nicht-Ziele (MVP)
- Kein Multi-User-/Login-System, keine Cloud-Synchronisation.
- Keine eigene Autoren-Oberfläche im Web (Pflege über Excel/CSV).
- Keine Bewertung von Freitexten durch KI (Schlüsselwortvergleich).
- Keine offiziellen Original-IHK-Prüfungsfragen (Lizenz), nur eigenentwickelte,
  am Rahmenlehrplan orientierte Aufgaben.
