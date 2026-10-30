# Brief CONTENT-216: FISI-NET – iproute2-Diagnose

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-NET-431 bis -454 ergänzen; Modul 244 → 268.
Dokumentierte Linux-Netzwerkverträge zu Routing, Namespaces und Bridge-VLANs anwenden.

## Betroffene Dateien

- `content/questions/FISI-NET.csv`
- `docs/agent-briefs/CONTENT-216-fisi-net-iproute2-diagnose.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 244 Altstämme gelesen, globale gezielte Nachbarsuche.
Vorhandene iproute2-Fragen 383–406, ss 333–334 und IPv6-Grundlagen
nicht wiederholen. Acht frisch gelesene Projekt-Manpages auf man7.org:
ip-route, ip-rule, ip-netns, ip-neighbour, ip-address, ip-link, ss und bridge.
15 Felder mit LF11b. Globale FISI-NET-ID war 430, nicht Modulanzahl 244.
Altpräfix 130139 Byte SHA256:
29332832670fa9482345ce93102ac89abccecba394e455856ff8489f7cdc9285.
Keine Netzwerkbefehle, Paketmitschnitte oder Geräteverbindungen ausführen;
keine Installationen, Builds, DB/.env, Commits oder Pushes.

## Abnahmekriterien

- [x] 24 neue SC-Zeilen, globale IDs eindeutig, Altbytes und LF11b erhalten.
- [x] Eindeutige Lösungen, genaue Geltungsbereiche und plausible Distraktoren.
- [x] Keine globalen Lernzielduplikate oder Antwort-Tells.
- [x] Unabhängiger Vollreview mit eigener frischer Quellenrecherche bestanden.
- [x] App-Parser, Validator, Diff- und Archivcheck grün.

## Ergebnis

FISI-NET 244 → 268; global nach diesem Batch 6657 Fragen. Reviewer
content216_review hat alle 24 Stämme, 96 Optionen und 24 Erklärungen, 244 Altstämme
und globale Nachbarn geprüft und acht Projekt-Manpages frisch recherchiert.
Falschexklusive Signalwortmuster „ausschließlich“, „sämtliche“ und „jede(r)“
aufgelöst. Einige fachliche Distraktoren präzisiert. Der zunächst vermutete
systematische Längentell wurde vom Reviewer nach Messung zurückgezogen.
Vollständiger Endread der tatsächlichen Endfassung: Freigabe ohne offene Findings.
Abgrenzung zu 383–406/333–334 und IPv6-Grundlagen bestätigt. App-Parser:
268 Modulfragen, 15 Felder mit LF11b, globale IDs eindeutig, Altpräfix unverändert.
Content-Validator, Diff- und Archivcheck grün. Keine Netzwerkbefehle ausgeführt.
