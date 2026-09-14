# Fachlicher Review des Fragenkatalogs (2026-09-14)

## Hinweis zur Aussagekraft

Dieser Review wurde von Claude (KI) durchgeführt, nicht von einem
zertifizierten IHK-Prüfer oder einer Fachkraft mit Berufspraxis in den
jeweiligen Fachrichtungen. Er ersetzt keinen Review durch Menschen mit
echter fachlicher/beruflicher Erfahrung, insbesondere nicht für
Prüfungsrelevanz, aktuelle IHK-Prüfungsschwerpunkte oder regionale
Besonderheiten. Er ist als zusätzliche, gründliche technische
Qualitätssicherung zu verstehen, die über den bisherigen rein
formalen Check (`validate-content.mjs`: Spaltenzahl, Pflichtfelder,
Antwortformat) hinausgeht.

## Vorgehen

Alle 500 Fragen in den 18 CSV-Dateien unter `content/questions/`
wurden gelesen und geprüft:

- Ist die als `antwort` hinterlegte Lösung fachlich korrekt?
- Ist die `erklaerung` sachlich richtig und stimmig zur Frage?
- Sind Frage und Antwortoptionen eindeutig, nicht mehrdeutig oder
  veraltet?

Geprüft wurden alle vier Fachrichtungen (FIAE, FISI, DPA, DVK) sowie
die gemeinsamen Module PM und WISO.

## Ergebnis

**Kein einziger Fall wurde gefunden, in dem die hinterlegte Lösung
fachlich falsch war.** Der Fragenkatalog ist inhaltlich solide:
Fachbegriffe, Normen (z. B. IEC 61131-3, RFC 1918, DIN 69901, BBiG)
und technische Zusammenhänge sind korrekt wiedergegeben.

Zwei Fragen wurden wegen unpräziser Formulierung überarbeitet
(Lösung war jeweils weiterhin richtig, nur die Formulierung wurde
geschärft):

### 1. `ALLE-PM-006` (PM.csv) – Planning Poker

**Problem:** Die Frage beschrieb Planning Poker als Schätztechnik mit
"anonymen" Schätzrunden. Das ist fachlich ungenau: Bei Planning Poker
legen Teammitglieder Karten **verdeckt**, aber nicht anonym (jede
Karte ist einer Person zuordenbar); echte Anonymität kennzeichnet
eher die Breitband-Delphi-Methode. Die Lösung (Planning Poker) blieb
unter den vier Antwortoptionen weiterhin klar die richtige, da Delphi
nicht als Option angeboten wurde – nur die Formulierung war
unscharf.

**Korrektur:** Frage und Erklärung auf "verdeckte, gleichzeitig
aufgedeckte" Schätzrunden präzisiert.

### 2. `ALLE-WISO-006` (WISO.csv) – Kündigungsschutz im
Berufsausbildungsverhältnis

**Problem:** Antwortoption b sprach von einer "ordentlichen
Kündigung ... nur mit Begründung" nach der Probezeit. Das ist
rechtlich ungenau: Nach § 22 BBiG kann der Ausbildungsbetrieb ein
Berufsausbildungsverhältnis nach der Probezeit **gar nicht mehr
ordentlich** kündigen – es bleibt nur die **außerordentliche
Kündigung aus wichtigem Grund** (mit zweiwöchiger Auslauffrist). Die
als richtig markierte Antwort war in der Sache weiterhin vertretbar,
die Begrifflichkeit "ordentliche Kündigung" aber missverständlich.

**Korrektur:** Frage auf das Berufsausbildungsverhältnis präzisiert,
Antwortoption und Erklärung auf "außerordentlich, mit wichtigem
Grund" korrigiert, Quellenangabe um die konkreten Paragrafen (§ 22
BBiG, § 102 BetrVG) ergänzt.

## Bewertung je Fachrichtung

| Fachrichtung/Modul | Fragen | Fachliche Fehler | Präzisierungen |
|---|---|---|---|
| FIAE (DB, PRG, SWE, TST) | 110 | 0 | 0 |
| FISI (BET, NET, SEC, SYS) | 110 | 0 | 0 |
| DPA (ANA, DB, DS, PRO) | 106 | 0 | 0 |
| DVK (AUT, CLD, IOT, NET) | 106 | 0 | 0 |
| PM (gemeinsam) | 32 | 0 | 1 |
| WISO (gemeinsam) | 40 | 0 | 1 |
| **Summe** | **~500** | **0** | **2** |

## Einordnung für den Backlog

Dieser Review ersetzt nicht den in `PROJEKTSTATUS.md` weiterhin als
offen geführten Punkt "Inhalts-Review durch Fachkundige je
Fachrichtung" – er reduziert aber das Risiko grober fachlicher
Fehler erheblich und kann als solide Zwischenstufe gelten, bis ein
Review durch Personen mit einschlägiger Berufserfahrung (z. B.
Ausbilder, IHK-Prüfer) erfolgt.
