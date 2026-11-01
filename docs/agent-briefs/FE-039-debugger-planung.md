# FE-039 – Eigenen Quellcode debuggen: Planung und Abnahmekriterien

Status: done
Bereich: FE
Angelegt: 2026-11-01

## Ziel

Einen technisch begründeten, schrittweisen Plan für echtes Anhalten/Fortsetzen
eigenen Lerncodes ausarbeiten. Der Plan trennt die vorhandene feste Modellspur,
einen noch nachzuweisenden Laufzeitadapter und spätere Kursintegration. Die
bestehende Abschirmung und ausschließlich lokale private Daten bleiben bindend.

## Allowlist

- dieser Brief
- neue `docs/38-Quellcode-Debugger-Planung.md`
- `docs/20-Frontendkurs-Qwen-Planung.md`
- `docs/37-Frontendkurs-Technische-Integration.md`
- `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

Quellcode und lokale Typdefinitionen werden nur gelesen. Keine Laufzeitänderung,
Bibliotheksinstallation, Datenmigration, private Quelle, Paketbuild, Commit oder
Veröffentlichung im Rahmen dieses Planungsauftrags.

## Abnahme

1. Aktuelle QuickJS-Sync-Laufzeit und feste Kapitel-18-Spur korrekt beschrieben;
   belegte Fähigkeiten von Architekturvorschlägen und offenen Nachweisen getrennt.
2. Eine bevorzugte technische Erprobung samt Entscheidungstor benannt. Echter
   Halt und Fortsetzen derselben Ausführung erforderlich; Replay/Neustart nicht
   als freier Debugger ausgeben. Neue Bibliothek nicht stillschweigend genehmigt.
3. Erster Pilot eng abgegrenzt; spätere Funktionen/DOM/Module/Async/TS/React sowie
   verständlicher Umgang mit nicht unterstütztem Code geplant.
4. Haltepunkte, Schritte, Variablen, Gültigkeitsbereiche, Aufrufkette, Quellstand,
   Fehler und Zeit-/Speichergrenzen mit konkreten überprüfbaren Kriterien erfasst.
5. Keine Ausführung im App-Kontext, keine erweiterten Host-/Netz-/Kontorechte,
   keine aktiven Getter-/Proxy-Auswertungen durch Variablenansicht oder Watches;
   Pausen, Abbruch, Worker-Protokoll, Privatsphäre und KI-Verhalten spezifiziert.
6. Stufenweise Browser-/Windows-Electron-, Semantik-/Angriffs-/Regressions- und
   praktische Nutzerabnahme definiert. Bestehende offene Nutzerabnahme bleibt
   offen; keine Behauptung neuer Implementierung oder bereits bestandener Tests.
7. Frischer unabhängiger Review und abschließender Archivcheck grün.

## Ergebnis

Planung in docs/38 dokumentiert: bevorzugter, noch zu beweisender Asyncify-/AST-
Kandidat in eigenem Worker, echte Fortsetzung derselben Ausführung, eng begrenzter
Grundlagenpilot und nachgelagerte Module/DOM/Async/TS/React. 23 verbindliche
Pilotkriterien sowie stufenweise Freigaben D0–D6 festgehalten. Numerische Budgets
werden in D0 verbindlich gewählt; ohne vollständige Tabelle und nachgewiesene
Semantik-/Umgehungssicherheit keine D1-/D2-Freigabe.

Bestehende Worker, installierte öffentliche API-Typen 0.32.0 und Primärquellen
gezielt gelesen. Asyncify-Fähigkeit nicht mit fertiger Debug-API verwechselt.
Passive Variablenansicht, Reentrancy/Ownership, kumulative aktive Zeit statt
Benutzerlesezeit, externe Stop-/Startfristen, Sitzungs-/Quellrevision und ausschließlich
lokale flüchtige Werte spezifiziert. Private Materialien/Abhängigkeiten unangetastet.

Frischer unabhängiger Planreview freigegeben. Zwei Befunde nachgeschärft und
erneut freigegeben: vollständige numerische Budgettabelle als Entscheidungstor
sowie ausdrücklich geprüfte indirekte Codeerzeugung/Helfermanipulation. Verweise
in Planung/Technik/Status aktualisiert. Nur Dokumentation geändert; keine neue
Laufzeit, Bibliothek, Tests als bestanden behauptet, Pakete, Commit oder Push.
Vorhandene praktische Kursabnahme und tatsächliche Debuggerimplementierung bleiben offen.
