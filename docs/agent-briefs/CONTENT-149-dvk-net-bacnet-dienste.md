# Brief CONTENT-149: DVK-NET – BACnet-Dienste und Objektmodell

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-NET-172 bis -195 ergänzen, Modul171 →195.
BACnet: Objekt-/Propertyadressierung, Discovery, COV, Prioritäten und
BACnet/IP-Broadcastvermittlung. Vorhandene CANopen-, OPC-UA-, Modbus-
und allgemeine Netzwerklernziele nicht wiederholen.

## Betroffene Dateien

- `content/questions/DVK-NET.csv`
- `docs/agent-briefs/CONTENT-149-dvk-net-bacnet-dienste.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle171 Altstämme gelesen, globale26CSV semantisch abgleichen. Eigene
aktuelle Primärrecherche BACnet/Beckhoff und gegebenenfalls veröffentlichte
Implementierungsdokumentation des jeweiligen Herstellers. Versions- und
Transportgrenzen ausdrücklich nennen. Keine Geräteverbindung, Dienste,
Mitschnitte, Installationen, Netzwerkpakete, DB/.env, Build, Commit, Push.
Altpräfix97588 Byte SHA256:
1475ce1f6a6be4876ef370e7a962d085fb534c1ddfb2c966601dffa1778604d5.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Dienst-/Objektsemantik und Musterlösungen frisch primär belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, DVK-NET171 →195, global5049 eindeutige Fragen.
Content-Validator und Diffcheck bestanden. Reviewer content149_review las
alle24 Endfragen und171 Altstämme, prüfte globale26 CSV semantisch und
recherchierte die Primärbelege selbst. Ein Subscription-Ablaufduplikat in186
durch konkrete SubscribeCOV-Abmeldeparameter ersetzt; zwei unplausible
Distraktoren189d/194d durch fachnahe Verwechslungen ersetzt. Tatsächlich
gespeicherte Endfassungen erneut geprüft: Freigabe ohne offene Findings
und ohne bindende Antwort-Tells. App-Parser bestätigt24SC/14Felder,
195 Modulfragen,5049 globale eindeutige IDs; Altpräfixhash unverändert.

Primärquellen:
- https://infosys.beckhoff.com/content/1033/tf8020_bacnetrev14/12319076107.html
- https://infosys.beckhoff.com/content/1033/tcbacnet/12748583691.html
- https://bacnet.org/wp-content/uploads/sites/4/2022/06/BACnet-A-standard-communication-infrastructure-for-intelligent-buildings-1.pdf
- https://bacpypes3.readthedocs.io/en/stable/gettingstarted/running.html
- https://bacnet.org/conformance-pics/
- https://infosys.beckhoff.com/content/1033/tf8020_bacnetrev14/12319323787.html
- https://infosys.beckhoff.com/content/1033/tcbacnet/12748695179.html
- https://download.beckhoff.com/download/Document/automation/twincat3/TF8020_TC3_BACnet_EN.pdf
- https://infosys.beckhoff.com/content/1033/tf8020_bacnetrev14/12319403659.html
- https://content.helpme-codesys.com/en/CODESYS%20BACnet/_bacnet_service_indication_hooks_default_actions.html
- https://infosys.beckhoff.com/content/1033/tcbacnet/12748435211.html
- https://infosys.beckhoff.com/content/1033/tcbacnet/12748445963.html
- https://bacnetinternational.org/bacnetsc/
- https://docs.johnsoncontrols.com/airdistribution/api/khub/documents/Y28_Zxyrk1ejK1eu0OhqwQ/content
