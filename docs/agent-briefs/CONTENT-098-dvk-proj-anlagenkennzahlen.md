# Brief CONTENT-098: DVK-PROJ – Anlagenleistung und Zuverlässigkeit

Status: done
Bereich: CONTENT
Angelegt: 2026-10-29

## Ziel

24 SC-Fragen DVK-PROJ-100 bis -123 ergänzen, Modul99 → 123.
Konkrete Kapazitäts-, Fähigkeits- und Zuverlässigkeitsfälle mit ausdrücklich
vereinfachten Modellannahmen. Keine Wiederholung der bestehenden
OEE-/Little-/Erstpassquotenfragen oder allgemeinen Redundanzgrundlagen.

## Betroffene Dateien

- `content/questions/DVK-PROJ.csv`
- `docs/agent-briefs/CONTENT-098-dvk-proj-anlagenkennzahlen.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

AGENTS.md, ORCHESTRATOR.md;99 Modulfragen gelesen. Globale Vorprüfung:
DPA-PRO058/060 und DVK-AUT047/090–092 ausdrücklich ausgeschlossen.
Primärquellen: NIST Engineering Statistics Handbook sowie Lean Enterprise
Institute Lexikon für Takt-/Zyklus-/Pitch- und Kapazitätsbegriffe.
Alter Byte-Präfix SHA256:
7f30ba69b5eb47961b57419afd9cced88f712220245c29adbf5c1dc37066f636.

## Abnahmekriterien

- [x] Genau24 SC-Fragen, alte Bytes/Schema erhalten, IDs eindeutig.
- [x] Alle Annahmen und Lösungen primärquellenbelegt, Rechnungen nachgerechnet.
- [x] Keine globalen Lernzielduplikate oder systematischen Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen DVK-PROJ-100–123 ergänzt. Endfassung: Annahmestichproben/
OC-Kurve, EPEI, parallele Kapazität, theoretischer Personalbedarf, Pitch,
Cp/Cpk und Voraussetzungen/Grenzen, Serien-/Parallel-/2-aus-3-Zuverlässigkeit,
Gegenereignis, Exponential-/Weibullmodelle, Rechtszensierung und Hazardrate.

Frischer Reviewer content098_review prüfte alle24 gespeicherten Zeilen,
99 Bestandsfragen und globale Lernzielüberschneidungen über26CSV. Eigene
Primärrecherche in NIST pmc16/pmc22/pmc32, apr122/123/131/161/162/182/183/184
sowie LEI/Lean-Institut-Lexika. Sämtliche Rechnungen unabhängig bestätigt,
unter anderem0,855/0,98/0,972/0,81873075/0,90483742/0,63212056/346,57359.

Drei anfängliche Lernzielduplikate100/101/102 (Kundentakt, anteilige Rüstzeit,
Engpass) ersetzt durch Annahmestichprobenentscheidung, OC-Kurvenachsen und
EPEI. Vier Fragen108–111 enthielten falsche jede(r)-Absolutheitsmuster,
diese neutralisiert. Zahlenleerzeichen und zuletzt Grammatik109d geglättet.
Tatsächliche gespeicherte Endfassung vollständig und zuletzt109d erneut
nachgelesen: bestanden, keine offenen Findings. Keine übrigen Muster(a)/(b)
oder systematischen Längen-/Detail-Tells.105 nutzt das zugängliche primäre
Lean-Institut-Brasil-Lexikon,103/104 die präzisere LEI-Standardized-Work-Quelle.
Exakte Quellen je Frage.

App-Parser123 Datensätze/14Felder,24 neue SC-Fragen. Alter Byte-Präfix SHA256
unverändert wie oben. Content-Validator3825Fragen/26Dateien, Diff- und
Archivierungscheck erfolgreich. Keine Anlagen-/Testsysteme verändert.
