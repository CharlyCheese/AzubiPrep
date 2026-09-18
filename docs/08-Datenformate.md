# Datenformate & Excel-Pflegeworkflow

Dieses Dokument ist die **Pflichtreferenz für Content-Agenten** und alle, die
Inhalte in Excel pflegen.

## Grundregeln
- Trennzeichen in allen CSV-Dateien: **Semikolon `;`**
- Zeichenkodierung: **UTF-8** (optional mit BOM) – Excel DE nutzt beim Öffnen
  automatisch Spalten; beim Speichern als „CSV UTF-8" abspeichern.
- Erste Zeile = Kopfzeile mit Spaltennamen.
- Werte, die `;`, `"` oder Zeilenumbrüche enthalten, in doppelte
  Anführungszeichen setzen.
- Leere Zeilen und Zeilen mit führendem `#` werden ignoriert (Kommentare).

## Dateien im Überblick
```
content/
├── fachrichtungen.csv   Fachrichtungen
├── modules.csv          Modul-Stammdaten
├── questions/<Fachrichtung oder Modul>.csv   Fragen
└── theorie/<modul_id>.md   Theorietext je Modul
```

## Schema: fachrichtungen.csv
```
code;name;beschreibung
FIAE;Fachinformatiker Anwendungsentwicklung;…
```

## Schema: modules.csv
```
modul_id;fachrichtung;code;titel;beschreibung;lernfeld
FIAE-PRG;FIAE;PRG;Programmierung und OOP;…;LF11a
```
`fachrichtung = ALLE` kennzeichnet gemeinsame Module (z. B. WiSo, PM,
Netzwerktechnik-Grundlagen, IT-Sicherheit-Grundlagen).

`lernfeld` (seit `CONTENT-007`) ordnet ein Modul der offiziellen
KMK-Lernfeldstruktur zu: `LF1`–`LF9` für die neun gemeinsamen Lernfelder
(Jahr 1/2, alle Fachrichtungen), `LF10a`–`LF12a`/`…b`/`…c`/`…d` für die drei
fachrichtungsspezifischen Lernfelder im 3. Jahr (Suffix = Fachrichtung:
a=FIAE, b=FISI, c=DPA, d=DVK). WiSo und Projektmanagement sind offiziell
**keine** Lernfelder, sondern eigene Prüfungsbereiche/Querschnittskompetenzen
– bekommen den Wert `KEIN_LF`. Details und die vollständige Mapping-Tabelle:
`docs/agent-briefs/CONTENT-007-lernfeld-taxonomie.md`.

## Schema: Fragen-CSV
Spalten (Reihenfolge ist verbindlich):
```
id;fachrichtung;modul_id;thema;typ;frage;option_a;option_b;option_c;option_d;antwort;erklaerung;schwierigkeit;quelle
```
Eine optionale 15. Spalte `lernfeld` ist erlaubt (aktuell genutzt von
`NETZ-GRUND.csv`, `FISI-NET.csv`, `IT-SEC-GRUND.csv`, `FISI-SEC.csv`) für
Module, die auf Fragen-Ebene zwischen gemeinsamem Grundlagen-Lernfeld und
fachrichtungsspezifischer Vertiefung unterscheiden (siehe `CONTENT-007`).
Fehlt die Spalte, übernimmt die Frage automatisch das `lernfeld` ihres
Moduls aus `modules.csv` – die meisten Fragen-Dateien brauchen die Spalte
also **nicht**.

| Spalte | Bedeutung |
|---|---|
| id | eindeutige ID, z. B. `FIAE-PRG-001` |
| fachrichtung | FIAE/FISI/DPA/DVK/ALLE (optional, wird sonst aus Modul abgeleitet) |
| modul_id | muss in modules.csv existieren |
| thema | Themenblock innerhalb des Moduls (z. B. „OOP-Grundlagen") |
| typ | `SC`, `MC` oder `FT` |
| frage | Fragetext |
| option_a … option_d | Antwortoptionen (bei `FT` leer lassen!) |
| antwort | Musterlösung, Format abhängig vom Typ (s. u.) |
| erklaerung | Erklärung/Lösungshinweis (wird nach Beantwortung angezeigt) |
| schwierigkeit | `leicht`, `mittel` oder `schwer` |
| quelle | Quellenangabe (z. B. „Rahmenlehrplan FIAE", „Scrum Guide") |
| lernfeld | optional, s. o. – überschreibt das Modul-Lernfeld für diese eine Frage |

### Antwortformate
| Typ | antwort | Beispiel |
|---|---|---|
| `SC` | einzelner Buchstabe `a`–`d` | `b` |
| `MC` | Buchstaben, kommasepariert | `a,c` |
| `FT` | **Synonyme**, durch `\|` getrennt | `Subnetting\|Subnetzberechnung` |

FT-Auswertung: Der Freitext gilt als richtig, wenn **mindestens ein Synonym**
im (normalisierten) Antworttext enthalten ist.

### Wichtige Stolperfalle (FT)
Bei `FT` müssen die vier Optionsspalten **leer** bleiben, da sie sonst die
Spalten `antwort`/`erklaerung`/… verrutschen. Die Fragezeile hat dann diese
Form:
```
ID;FIAE;FIAE-PRG;Grundlagen;FT;Wie …?;;;;Lösungswort;Erklärung;mittel;Quelle
```

## Theorie (Markdown)
Je Modul optional eine Datei `content/theorie/<modul_id>.md`. Unterstützte
Syntax: Überschriften (`#`, `##`, `###`), Listen (`-`/`1.`), `code` und
`**fett**`.

## Validierung nach Pflege
```bash
cd backend
node scripts/validate-content.mjs     # prüft alle Fragen & Module
node scripts/repair-ft-rows.mjs       # repariert bekannte FT-Spaltenfehler
```
Danach Inhalt neu laden: `POST /api/admin/reload` oder Backend neu starten.

## Excel-Tipps
- Spaltenbreite und Farben sind für Excel irrelevant (nur Werte zählen).
- „Daten → Text in Spalten" ist **nicht** nötig, wenn als `;`-CSV geöffnet wird.
- Beim Speichern unbedingt **CSV UTF-8** wählen (Datei → Speichern unter →
  Typ „CSV UTF-8 (Kommagetrennt)" → ggf. Trennzeichen auf `;` stellen), damit
  Umlaute erhalten bleiben.

## Notizen-Format (Export/Import)

Notizen lassen sich als Textdatei exportieren, extern (z. B. in Windows
Notepad) bearbeiten und wieder importieren. Format je Notiz:

```
===NOTE===
Titel: Subnetting-Merkregel
Modul: FISI-NET
Inhalt:
/24 = 255.255.255.0
254 nutzbare Hosts
```

- Blöcke beginnen mit der Zeile `===NOTE===`.
- Felder `Titel:` und `Modul:` sind optional; `Modul:` entspricht einer
  `modul_id` aus `modules.csv` (leer = Allgemein).
- Auf `Inhalt:` folgt der mehrzeilige Freitext bis zum nächsten `===NOTE===`.
- Beim Import werden Notizen **ergänzt** (bestehende bleiben erhalten).
- Zeilen vor dem ersten Block (z. B. Kopfkommentare mit `#`) werden ignoriert.

