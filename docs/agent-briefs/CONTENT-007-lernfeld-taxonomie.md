# Brief CONTENT-007: Fragenkatalog auf offizielle Lernfeld-Struktur (LF1–LF12) umstellen

Status: done
Bereich: CONTENT
Angelegt: 2026-09-18
Abgeschlossen: 2026-09-18

## Ziel (1–3 Sätze)

Erster Schritt des mit Sven besprochenen Ausbaus (Ziel: ~1000
fachrichtungsspezifische Fragen je Fachrichtung plus proportional
wachsender gemeinsamer Pool, Navigation künftig als Burger/Akkordion,
Lernreise chronologisch). Bevor der Fragenkatalog massiv wächst, sollen
die bestehenden Module/Fragen auf die **offizielle KMK-Lernfeldstruktur**
abgebildet werden – sonst müsste diese Zuordnung später bei einem
Vielfachen der aktuellen Fragenzahl nachträglich gemacht werden, was
deutlich aufwendiger wäre.

## Betroffene Dateien (exakte Pfade)

- `content/modules.csv` (neues Feld `lernfeld`, zwei neue Module
  `NETZ-GRUND`/`IT-SEC-GRUND`)
- `content/questions/FISI-NET.csv`, `FISI-SEC.csv` (nur noch
  Vertiefungs-Fragen, neues Feld `lernfeld`)
- `content/questions/NETZ-GRUND.csv`, `IT-SEC-GRUND.csv` (neu – Grundlagen-
  Fragen aus FISI-NET/FISI-SEC, `fachrichtung=ALLE`)
- `backend/src/content.js` (Header-Validierung tolerant für optionale
  `lernfeld`-Spalte, `lernfeld` in Modul-/Frage-Objekten, Fallback
  Frage→Modul)
- `backend/scripts/validate-content.mjs` (nutzt jetzt dieselbe
  Header-Prüfung wie `content.js`, statt einer eigenen Kopie)
- `docs/08-Datenformate.md` (Schema-Referenz um `lernfeld` ergänzt)

## Kontext (nur Verweise, keine Dokumentkopien)

- KMK-Rahmenlehrplan Fachinformatiker (recherchiert 2026-09-18,
  `kmk.org/.../Fachinformatiker_19-12-13_EL.pdf`): 9 gemeinsame
  Lernfelder LF1–LF9 (Jahr 1: LF1–5, Jahr 2: LF6–9), danach 3
  fachrichtungsspezifische Lernfelder im 3. Jahr je Fachrichtung
  (LF10a–12a Anwendungsentwicklung, LF10b–12b Systemintegration,
  LF10c–12c Daten-/Prozessanalyse, LF10d–12d Digitale Vernetzung).
  WiSo und Projektmanagement sind **keine** Lernfelder, sondern eigene
  Prüfungsbereiche/Querschnittskompetenzen – bleiben eigene Kategorien
  neben der LF-Struktur, werden nicht in LF1–12 gepresst.
- Aktuelle Modul-Struktur (`content/modules.csv`) ist rein
  technik-thematisch (z. B. `FIAE-PRG`, `FIAE-DB`), entspricht nicht der
  LF-Gliederung – die Umstellung ist also eine echte inhaltliche
  Neuzuordnung, keine reine Umbenennung.
- Chat-Verlauf 2026-09-18: Sven bestätigt das Vorgehen ("so find ich das
  solide"), Reihenfolge: (1) dieser Brief – Struktur/Mapping, (2) FE-Brief
  für Akkordion-Navigation + Lernreise-Reihenfolge aufbauend auf dem
  neuen LF-Feld, (3) mehrere CONTENT-Briefs für den eigentlichen
  Fragen-Ausbau, geplant mit fester Fragenanzahl je Etappe (z. B. "+100
  Fragen LF10a"), Start voraussichtlich bei FIAE/LF10a–12a (Svens eigene
  Fachrichtung).
- **Fund (2026-09-18):** LF3 ("Clients in Netzwerke einbinden"), LF4
  ("Schutzbedarfsanalyse") und LF9 ("Netzwerke und Dienste bereitstellen")
  sind laut Rahmenlehrplan gemeinsame Lernfelder für **alle vier
  Fachrichtungen**, nicht nur Systemintegration. Netzwerk-/Security-Wissen
  existiert bei euch aber ausschließlich als FISI-exklusive Module
  (`FISI-NET`, `FISI-SEC`) – FIAE/DPA/DVK-Nutzer bekommen davon aktuell
  nichts angezeigt (strikte Fachrichtungs-/`ALLE`-Filterung).
  Sven bestätigt 2026-09-18 den vorgeschlagenen Lösungsweg: Grundlagen-Teile
  (OSI-Modell, IP-Grundlagen, grundlegende Bedrohungen/Schutzmaßnahmen)
  werden als gemeinsame LF3/4/9-Fragen für alle vier Fachrichtungen
  freigegeben; vertiefende Themen (komplexes Routing, Firewall-Konfiguration,
  Active Directory) bleiben FISI-exklusiv (LF10b/11b). Das ist eine
  inhaltliche Entscheidung mit echtem Effekt auf angezeigte Inhalte, kein
  reines Umbenennen.
- **Fund #2 (2026-09-18, bei der Umsetzung):** Module haben selbst ein
  `fachrichtung`-Feld, das steuert, ob das Modul in der Modul-Übersicht
  (Quiz/Karteikarten-Auswahl) für andere Fachrichtungen sichtbar ist –
  unabhängig vom Fragen-Filter. Nur die Fragen auf `ALLE` umzustellen hätte
  bedeutet: die neuen Grundlagen-Fragen tauchen in der Prüfungssimulation
  auf, aber `FISI-NET` bliebe als Modul für FIAE/DPA/DVK im Quiz/Karteikarten
  unsichtbar. Sven entscheidet sich für die saubere Lösung: **Module
  aufteilen** – zwei neue gemeinsame Module `NETZ-GRUND`/`IT-SEC-GRUND`
  (`fachrichtung=ALLE`) übernehmen die 362 Grundlagen-Fragen, `FISI-NET`/
  `FISI-SEC` behalten nur noch die 106 Vertiefungs-Fragen.

## Umsetzungsschritte (Checkliste)

- [x] Klären: Zuordnung auf Modul-Ebene oder Fragen-Ebene nötig? **Ergebnis:**
      gemischt. Die meisten Module bekommen ein `lernfeld`-Feld auf
      Modul-Ebene (`modules.csv`). `FISI-NET`/`FISI-SEC` brauchen
      Fragen-Ebene (`content/questions/FISI-NET.csv`/`FISI-SEC.csv`), weil
      sie gemeinsame Grundlagen (LF3/4/9) und FISI-Vertiefung (LF10b/11b)
      mischen (siehe Fund oben).
- [x] Mapping-Tabelle bestehende Module → LF1–12 erstellt (siehe
      Ergebnis-Abschnitt).
- [x] `FISI-NET`/`FISI-SEC` auf Fragen-Ebene klassifiziert (Einzelfragen-
      Review, nicht nur Themen-Ebene – siehe Ergebnis-Abschnitt für die
      vollständige Liste). Sven hat den ersten Themen-Ebene-Vorschlag
      stichprobenartig gegengeprüft und um Einzelfragen-Review für die
      unklaren Gruppen gebeten.
- [x] `modules.csv` um `lernfeld`-Feld erweitert (Werte gemäß Mapping-Tabelle
      unten), WiSo/PM explizit als `KEIN_LF` gekennzeichnet, zwei neue Module
      `NETZ-GRUND`/`IT-SEC-GRUND` (`fachrichtung=ALLE`) angelegt.
- [x] `FISI-NET.csv`/`FISI-SEC.csv` per Skript aufgeteilt: Grundlagen-Fragen
      (362) nach `NETZ-GRUND.csv`/`IT-SEC-GRUND.csv` verschoben
      (`modul_id`+`fachrichtung` angepasst), Vertiefungs-Fragen (106) bleiben
      in `FISI-NET.csv`/`FISI-SEC.csv`. Alle vier Dateien haben jetzt das
      `lernfeld`-Feld. **Wichtig:** die `id`-Werte der Fragen wurden bewusst
      **nicht** geändert (bleiben z. B. `FISI-NET-001`), damit bestehender
      Lernfortschritt in Svens `localStorage` (Karteikarten-Box,
      Quiz-Statistik) nicht verwaist.
- [x] `backend/src/content.js`: Header-Validierung akzeptiert jetzt die
      optionale 15. Spalte `lernfeld` (exportierte Funktion
      `pruefeFragenHeader`, auch von `validate-content.mjs` genutzt statt
      einer eigenen Kopie – sonst hätte das Validierungsskript die neuen
      Dateien fälschlich als Schema-Fehler gemeldet). Modul- und
      Frage-Objekte führen `lernfeld`, Frage-Wert hat Vorrang, sonst Fallback
      auf Modul-Wert. DB-Ladepfad bekommt dieselbe Form (Wert bleibt vorerst
      leer, da keine Schema-Migration in diesem Brief – siehe Ergebnis).
      Bestehende Filterlogik (`fragenFuerFachrichtung`,
      `moduleFuerFachrichtung`) musste **nicht geändert** werden – die neuen
      `ALLE`-Module/Fragen laufen durch den bereits vorhandenen,
      getesteten `ALLE`-Mechanismus.
- [x] Konsistenz-Check: alle 21 Module und alle 1627 Fragen haben ein
      gültiges `lernfeld` bzw. `KEIN_LF` – verifiziert (siehe Ergebnis).

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [x] Jedes bestehende Modul ist eindeutig einem LF oder einer
      Nicht-LF-Kategorie (WiSo/PM) zugeordnet. Geprüft: alle 21 Module
      (inkl. der 2 neuen) haben ein gültiges `lernfeld`.
- [x] Bestehende API-Antworten (`/api/module`, `/api/fragen`) funktionieren
      unverändert weiter (rein additive Änderung, keine Regression). Geprüft
      per direktem `loadContent()`-Aufruf (s. Ergebnis) – 0 Warnungen,
      `gesamtFragen` unverändert bei 1627, keine doppelten/verlorenen IDs.
      **Noch nicht geprüft:** echter Serverstart + Frontend-Klicktest auf
      Svens Maschine (ich kann `npm` in meiner Sandbox nicht nutzen,
      Registry-Zugriff blockiert) – siehe offener Punkt unten.
- [x] Die Zuordnung ist im Ergebnis-Abschnitt dieses Briefs nachvollziehbar
      dokumentiert (Mapping-Tabelle), damit der folgende FE-Brief direkt
      darauf aufbauen kann.

## Ergebnis (wird beim Abschluss ausgefüllt)

**Mapping-Tabelle (Stand 2026-09-18, Primär-LF je Modul, Zwischenstand –
Brief bleibt offen bis Fragen-Ebene-Klassifizierung FISI-NET/SEC und
Code-Umsetzung erfolgt sind):**

| Modul | Primär-LF | Anmerkung |
|---|---|---|
| WISO | kein LF | eigener Prüfungsbereich |
| PM | kein LF | Querschnittskompetenz, spielt in alle 12a–d-Projekt-LF rein |
| HARDWARE | LF2 | Arbeitsplätze nach Kundenwunsch ausstatten |
| FIAE-PRG | LF11a | Funktionalität in Anwendungen realisieren |
| FIAE-SWE | LF11a | Vorgehensmodelle/UML explizit dort genannt |
| FIAE-TST | LF11a | Testfälle/automatisierte Tests explizit dort genannt |
| FIAE-DB | LF5 | gemeinsames LF Jahr 1, vertieft in LF10b/12a |
| DPA-DB | LF5 | analog FIAE-DB |
| DPA-DS | LF10c | Werkzeuge des maschinellen Lernens |
| DPA-ANA | LF10c/11c | Grenzfall, Tendenz LF11c (Prozessanalyse) |
| DPA-PRO | LF11c | Prozesse analysieren und gestalten |
| DVK-IOT | LF10d | Cyber-physische Systeme entwickeln |
| DVK-AUT | LF10d | analog DVK-IOT |
| DVK-CLD | LF10d | Cloud-Anteil auch bei LF10b relevant (Grenzfall) |
| DVK-NET | LF9 | gemeinsames LF, DVK-spezifische Funktechnik/LPWAN als Vertiefung |
| FISI-BET | LF10b | Serverdienste/Administrationsaufgaben |
| FISI-SYS | LF10b | Hardware/Virtualisierung/Cloud, Server-Kontext |
| FISI-NET | **gemischt** | Grundlagen → LF3/9 (alle Fachrichtungen), Vertiefung → LF10b/11b (FISI) – Klassifizierung je Frage steht noch aus |
| FISI-SEC | **gemischt** | Grundlagen → LF4 (alle Fachrichtungen), Vertiefung → LF11b (FISI) – Klassifizierung je Frage steht noch aus |

Offene Grenzfälle (DPA-ANA, DVK-CLD) werden bei der Code-Umsetzung nicht
blockierend behandelt – Primär-LF reicht für den Start, kann später
präzisiert werden, wenn mehr Fragen dazu kommen und sich ein Schwerpunkt
deutlicher zeigt.

Nächster Schritt: Fragen-Ebene-Klassifizierung `FISI-NET`/`FISI-SEC`
(Grundlage vs. Vertiefung), danach Code-Umsetzung (`modules.csv`-Feld,
Fragen-CSV-Feld, `content.js`-Anpassung für die neu freigegebenen
Grundlagen-Fragen).

### Fragen-Ebene-Klassifizierung FISI-NET/FISI-SEC (final, 2026-09-18)

Erster Durchgang war Themen-Ebene (s. Historie unten). Sven hat gegen sein
aktuelles Berufsschulwissen stichprobenartig gegengeprüft und um
Einzelfragen-Review für die unklaren Gruppen gebeten – das wurde jetzt
nachgeholt: alle vormals "prüfen"-markierten Themen-Gruppen wurden
Frage für Frage durchgegangen. Dabei sind zusätzlich zwei Themen-Gruppen
aufgefallen, die im ersten Durchgang versehentlich in keiner der beiden
Tabellen auftauchten (`Methoden`, 25 Fragen, und `Hardware` bei FISI-SEC,
3 Fragen) – wurden hier nachträglich mit geprüft.

**Statt 468 Einzelfragen aufzulisten, folgt die Kurzfassung: alles ist
„Grundlage" (für alle vier Fachrichtungen freigegeben), außer die unten
explizit als „Vertiefung" (bleibt FISI-exklusiv) aufgeführten Fragen-IDs.**

**FISI-NET – finale Bilanz: 186 Grundlage / 51 Vertiefung (von 237):**

Vertiefung (FISI-exklusiv, LF10b/11b) bleiben die klar administrations-/
konfigurationslastigen Themen `Routing, VLAN, Monitoring,
Virtualisierung, VPN, Infrastruktur` (21 Fragen, wie im ersten Durchgang)
sowie aus den geprüften Gruppen:

- **Dienste** (27, davon 10 Vertiefung): `FISI-NET-048, 054, 067, 109,
  117, 150, 177, 198, 218, 230` (DHCP-Relay, Load Balancer, SNMP, Reverse
  Proxy, LDAP, Mail-Relay, MTA, Root-Nameserver – Administrationstiefe)
- **Protokolle** (29, davon 5 Vertiefung): `FISI-NET-145, 161, 185, 197,
  228` (DHCP-Relay, SNMP ×2, BGP, LDAP)
- **Hardware** (36, davon 15 Vertiefung): `FISI-NET-076, 088, 090, 098,
  103, 105, 156, 179, 187, 201, 208, 210, 212, 227, 237` (SFP/Transceiver,
  Layer-3-Switch, Managed/Core-Switch, SDN, Load Balancer, LWL-Spleißgerät,
  Bypass-Switch – Datacenter-/Admin-Hardware)

Alle übrigen Fragen in diesen Gruppen (inkl. der zuvor klar eingestuften
Themen OSI-Modell/IP/DNS/Kabel/Internet/WLAN, 124 Fragen) sind Grundlage.

**FISI-SEC – finale Bilanz: 176 Grundlage / 55 Vertiefung (von 231):**

Vertiefung bleiben `Netzwerk, Netzwerksicherheit, Netzsicherheit,
Firewall, VPN` (16 Fragen, wie im ersten Durchgang) sowie aus den
geprüften Gruppen:

- **Krypto/Verschlüsselung/Kryptographie/Hashing** (44, davon 9
  Vertiefung): `FISI-SEC-083, 105, 112, 132, 139, 172, 177, 206, 229`
  (S/MIME, Session Key, Diffie-Hellman, Perfect Forward Secrecy,
  Blockgröße, HSM, Hash-Kollision, Replay-Angriff, Rainbow Table)
- **Protokolle/Zertifikate/TLS** (20, davon 9 Vertiefung):
  `FISI-SEC-085, 100, 117, 141, 147, 184, 198, 220, 227` (Kerberos, CSR,
  DNSSEC, IPsec ×2, RADIUS, LDAPS, WPA2-Enterprise)
- **System/Management/Technik/Absicherung/Web** (32, davon 14
  Vertiefung): `FISI-SEC-088, 130, 160, 164, 169, 181, 187, 188, 193,
  197, 199, 204, 211, 226` (IDS, DMZ, ISMS, IT-Grundschutz-Kompendium,
  SOC, NGFW, Patch-Management, IT-Risikomanagement, VPN-Killswitch,
  Schwachstellenanalyse, SIEM, Signaturprüfung, Application Whitelisting,
  Endpoint Security)
- **Methoden** (25, davon 5 Vertiefung, nachträglich ergänzt):
  `FISI-SEC-076, 084, 136, 171, 179` (Audit, Risikoanalyse,
  Sicherheitsaudit, SIEM-System, DMZ)
- **Hardware** (3, davon 2 Vertiefung, nachträglich ergänzt):
  `FISI-SEC-091, 163` (TPM ×2 – Security-Token bleibt Grundlage)

Alle übrigen Fragen (inkl. der zuvor klar eingestuften Themen
Grundlagen/Schutzziele/Bedrohungen/Authentifizierung/Backup/Recht,
91 Fragen) sind Grundlage.

**Zusammen: 362 von 468 Fragen werden als Grundlage für alle vier
Fachrichtungen freigegeben, 106 bleiben FISI-exklusiv.** Diese Liste ist
die Arbeitsgrundlage für das `lernfeld`-Feld in den CSV-Dateien im
nächsten Schritt.

### Code-/CSV-Umsetzung (2026-09-18) – Ergebnis

**Modul-Aufteilung:** zwei neue Module angelegt (`fachrichtung=ALLE`):

| Modul | Titel | Lernfeld | Fragen |
|---|---|---|---|
| `NETZ-GRUND` | Netzwerktechnik-Grundlagen | LF3 (117) / LF9 (69) | 186 |
| `IT-SEC-GRUND` | IT-Sicherheit-Grundlagen | LF4 | 176 |
| `FISI-NET` (verkleinert) | Netzwerktechnik (Vertiefung) | LF11b | 51 (vorher 237) |
| `FISI-SEC` (verkleinert) | IT-Sicherheit (Vertiefung) | LF11b | 55 (vorher 231) |

Bei `NETZ-GRUND` wurden die Grundlagen-Themen zusätzlich zwischen LF3
("Clients in Netzwerke einbinden", client-/hardwarenahe Themen wie
OSI-Modell, IP-Adressierung, Kabel, WLAN) und LF9 ("Netzwerke und Dienste
bereitstellen", Dienste/Protokolle wie DNS, DHCP, HTTP) unterschieden –
eine zusätzliche Verfeinerung über die reine Grundlage/Vertiefung-Trennung
hinaus, pragmatisch nach Thema entschieden, kein Einzelfragen-Abgleich mit
dem Rahmenlehrplan-Wortlaut.

**Wichtig – bewusste Vereinfachung:** Vertiefungs-Fragen wurden pauschal
`LF11b` zugeordnet (statt fein zwischen LF10b/LF11b zu unterscheiden). Das
ist eine Näherung, keine Fehlklassifizierung – reicht für den aktuellen
Zweck (Navigation/Struktur), kann bei Bedarf später verfeinert werden.

**Validierung (in dieser Sitzung durchgeführt, da `npm`/Frontend hier nicht
lauffähig – Registry-Zugriff blockiert):**
- `node backend/scripts/validate-content.mjs` (mit gestubbten `pg`/`dotenv`-
  Paketen lokal nachgestellt, echte Ausführung mit Svens `node_modules`
  steht noch aus): **0 Fehler**, „21 Fragen-Dateien, 1627 Fragen, 21 Module,
  4 Fachrichtungen" – Gesamtzahl unverändert, nur umgruppiert.
- Direkter Aufruf von `content.js#loadContent()`: **0 Warnungen**.
  `fragenFuerFachrichtung()` liefert jetzt FIAE 1143 (vorher 781), FISI 1031
  (unverändert), DPA 1060 (vorher 698), DVK 979 (vorher 617) – jeweils genau
  +362, wie erwartet. `moduleFuerFachrichtung('FIAE')` enthält jetzt auch
  `NETZ-GRUND`/`IT-SEC-GRUND`.
- `node backend/scripts/content-statistik.mjs`: Fragen je Fachrichtung
  (nur `ALLE`) jetzt 862 (vorher 500 = WISO 248 + PM 33 + HARDWARE 219,
  plus neue 362) – rechnerisch stimmig.
- Keine doppelten oder verlorenen Fragen-IDs (Sanity-Check über alle vier
  betroffenen Dateien).

**Bestätigt auf Svens Maschine (2026-09-18, echte `node_modules`):**
```
npm run validate  → „21 Fragen-Dateien, 1627 Fragen, 21 Module,
                      4 Fachrichtungen" – ✓ VALIDIERUNG OK
npm test           → 4 Testdateien, 61 Tests, alle grün
                      (answer.test.js, exam.test.js, auth.test.js,
                      api.content-exam.test.js)
```
Bestätigt damit unabhängig von der hier simulierten Prüfung (Punkt 1
unten), dass die Umstellung mit den echten Projekt-Abhängigkeiten
funktioniert und keine bestehenden Tests gebrochen hat.

**Abschluss (2026-09-18):**
1. ~~`npm run validate`/`npm test` auf Svens Maschine~~ **erledigt** – 61
   von 61 Tests grün, `validate` sauber (siehe oben).
2. ~~Klicktest Quiz/Karteikarten-Modulauswahl~~ **erledigt** – Sven hat in
   der App nachgeschaut, die neuen Module „Netzwerktechnik-Grundlagen"/
   „IT-Sicherheit-Grundlagen" sind da und das Mapping sieht für ihn
   fachlich gut aus ("das sieht schon gut aus").
3. Bekannte Lücke, bewusst kein Blocker für „done": der DB-Ladepfad
   (`DB-002`, aktuell nicht aktiv) bekommt `lernfeld` erst nach einer
   eigenen Schema-Migration – betrifft Sven aktuell nicht, da er ohne
   `DATABASE_URL` läuft. Bei Aktivierung von `DB-002` erneut aufgreifen.
4. Bekannte Lücke, bewusst kein Blocker: `content/theorie/NETZ-GRUND.md`/
   `IT-SEC-GRUND.md` existieren noch nicht (Route liefert dann einfach
   leeren Theorietext, kein Fehler) – als eigener Content-Punkt bei
   Bedarf nachziehen.

Brief wird jetzt als `done` archiviert. Nächster Schritt laut Plan: FE-Brief
für die Akkordion-Navigation (baut auf dem `lernfeld`-Feld auf), danach
gestaffelte CONTENT-Briefs für den eigentlichen Fragen-Ausbau.
