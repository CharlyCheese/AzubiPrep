# Brief CONTENT-185: DPA-DS – PyTorch-Schichtkontrakte

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-DS-220 bis -243 ergänzen, Modul 219 → 243.
Schichtformen, Parameter und Trainingszustände neuronaler Modelle.

## Betroffene Dateien

- `content/questions/DPA-DS.csv`
- `docs/agent-briefs/CONTENT-185-dpa-ds-pytorch-schichtkontrakte.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 219 Altstämme gelesen, globale 26 CSV semantisch abgleichen.
Vorhandene PyTorch-Fragen 124–147 nicht wiederholen. Schwerpunkt auf
CNN-/RNN-/Attention-/Normalisierungsschichten und weiteren Zustandsregeln.
Eigene frische Primärrecherche in offizieller PyTorch-2.9-Dokumentation;
Versionsbezug der Aufgaben ausdrücklich nennen.
Statische kleine Beispiele; keine Installation, Downloads, Trainingsläufe,
Dienste, Builds, DB/.env, Commits oder Pushes.
Altpräfix 120241 Byte SHA256:
7d439aca95f7b70c92a25d387d353e6c9b853a0540730b24a5a5a12a5223d26f.

## Abnahmekriterien

- [x] 24 SC-Fragen, globale IDs eindeutig, Altbytes erhalten.
- [x] Aktuelle Primärbelege und eindeutige fachnahe Optionen.
- [x] Keine globalen Lernzielduplikate oder bindenden Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Modul 219 → 243, Gesamtkatalog 5889 → 5913.
Frischer unabhängiger Reviewer content185_review hat sämtliche gespeicherten
24 Fragen, 96 Optionen und Erklärungen geprüft; eigene Recherche auf allen
acht offiziellen PyTorch-2.9-Seiten, ohne notwendige Korrekturen bestanden.
Alle 219 Altstämme und globale 26 CSV auf semantische Nachbarn geprüft.
DS238 prüft Referenzsemantik von state_dict statt Zustandsinhalt/Laderegeln
DS140/141/144; DS235–237 Embedding-Training statt Ausgabeform DS147.
Allgemeine Kopierfragen PRG075/076 und Helm219 behandeln andere Verträge.
Keine bindenden Antwort-Tells; tatsächliche Endfassung vollständig geprüft.
Altpräfix unverändert, globale IDs eindeutig, 14 Felder pro neuer Zeile.
Statische Form-/Gruppen-/Kopfberechnungen unabhängig bestätigt; keine
PyTorch-Installation oder Trainingsausführung. App-Parser, Content-Validator
(5913 Fragen/26 CSV), Diff- und Archivierungscheck erfolgreich.

Primärquellen (Autor und Reviewer frisch geprüft):
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.Conv2d.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.MaxPool2d.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.LSTM.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.LayerNorm.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.MultiheadAttention.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.Embedding.html
- https://docs.pytorch.org/docs/2.9/generated/torch.nn.Module.html
- https://docs.pytorch.org/docs/2.9/optim.html
