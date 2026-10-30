# Brief CONTENT-140: DVK-CLD – Helm-Charts und Releases

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DVK-CLD-172 bis -195 ergänzen, Modul171 →195.
Helm4: Chart-/Release-Metadaten, Values, Abhängigkeiten und konkrete
Installations-/Upgrade-/Hook-/CRD-Semantik.

## Betroffene Dateien

- `content/questions/DVK-CLD.csv`
- `docs/agent-briefs/CONTENT-140-dvk-cld-helm-charts.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle171 Altstämme gelesen. Globale Suche über26CSV ohne Helm-Altfragen.
Kubernetes-Ressourcen, Terraform und Docker nicht unter Helm-Etikett
wiederholen. Aktuelle offizielle Helm-Dokumentation; Helm4 bei neuen
CLI-Flags und verändertem Verhalten ausdrücklich als Version nennen.
Keine Helm-Installation, Cluster-/Registry-/Releaseaktion, kein Build,
kein DB-Zugriff. Nur Lehrfragen und eigene statische Beispiele.
Altpräfix101518 Byte SHA256:
029cb8f020148c0b0c5d96b712e2493c6c3331c6c6fc5658559e65e103d38550.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Helm-Version und dokumentierte Semantik samt Lösungen eindeutig.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul195, Gesamtkatalog4833. App-Parser195/14Felder,
globaleIDs eindeutig, AltpräfixSHA256 exakt bestätigt. Content-Validator
und git diff --check erfolgreich. Kein DB-Zugriff, Build, Commit oder Push.
Frischer Reviewer content140_review las alle24 gespeicherten Endzeilen,
alle171Altstämme und führte globale semantische Suche über26CSV durch.
Eigene aktuelle offizielle Helm-Recherche bestätigt alle24 Lösungen,
insbesondere Helm4 --rollback-on-failure mit watcher-Default. Keine
Findings zu Fachlichkeit, Duplikaten, Distraktoren oder sprachlichen Tells.

Primärquellen unter https://helm.sh/docs/:
topics/charts/, topics/library_charts/, topics/charts_hooks/,
chart_template_guide/values_files/, subcharts_and_globals/ und
named_templates/ (letztere beide ebenfalls chart_template_guide/),
helm/helm_upgrade/, helm/helm_dependency_build/, helm/helm_rollback/,
chart_best_practices/custom_resource_definitions/.
