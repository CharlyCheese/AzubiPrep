# Brief CONTENT-152: FISI-PROJ – Ansible-Rollen und Inventarkontext

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen FISI-PROJ-176 bis -199 ergänzen, Modul175 →199.
Ansible: Tags, Rollenstruktur, Vault, Controller-Lookups und genaue
Abgrenzung von Inventar-, Host- und Batchvariablen.

## Betroffene Dateien

- `content/questions/FISI-PROJ.csv`
- `docs/agent-briefs/CONTENT-152-fisi-proj-ansible-rollen-inventar.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle175 Altstämme gelesen; globale26CSV semantisch abgleichen. Ansible-
Tasks, Handler, Module, Schleifen, Async, Facts und Terraform nicht erneut
abfragen, sofern bereits dasselbe Lernziel besteht. Eigene aktuelle
Primärrecherche offizielle Ansible-Dokumentation. Nur Lehrfragen, keine
Ansible-Ausführung, Host-/SSH-Verbindungen, Vault-Dateien oder echte
Passwörter, Installationen, DB/.env, Server, Build, Commit oder Push.
Altpräfix114104 Byte SHA256:
dc13399d6c53bdcadf3272486d06be0666e289c81a32cc7490f6b49299821526.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, globale IDs eindeutig, Altbytes erhalten.
- [x] Werkzeugsemantik und Lösungen frisch primär belegt.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 SC-Fragen gespeichert, FISI-PROJ175 →199, global5121 eindeutige Fragen.
Content-Validator und Diffcheck bestanden. Reviewer content152_review las
alle24 Endfragen/96 Optionen/Erklärungen und175 Altstämme, verglich
globale26 CSV und relevante Altlernziele. Eigene aktuelle offizielle
Primärrecherche bestätigt alle Regeln. Freigabe ohne Findings: eindeutige
Schlüssel, fachnahe Distraktoren, keine Duplikate, Längen-/Eröffnungs- oder
Füllwort-Tells; exklusive falsche Zwei- bis Vierwortphrasen zusätzlich
automatisch geprüft. Parser:199 Modulfragen,24SC/14Felder,5121 globale
eindeutige IDs und unveränderter Altpräfixhash. Keine Ansible-Ausführung.

Primärquellen unter https://docs.ansible.com/projects/ansible/latest/:
- playbook_guide/playbooks_tags.html und playbooks_reuse_roles.html
- vault_guide/vault_encrypting_content.html und vault_using_encrypted_content.html
- collections/ansible/builtin/env_lookup.html, file_lookup.html, first_found_lookup.html
- collections/ansible/builtin/ini_inventory.html, host_group_vars_vars.html, ssh_connection.html
- reference_appendices/special_variables.html
- playbook_guide/playbooks_vars_facts.html

Jede CSV-Zeile enthält den vollständigen individuellen Quellenlink.
