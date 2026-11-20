# OPS-045 – Aktuelle Screenshots und README

Status: done
Bereich: OPS
Angelegt: 2026-11-20

## Auftrag

Die 14 vorhandenen Ansichten unter ihren bestehenden Dateinamen aus dem aktuellen Webfrontend neu aufnehmen. Willkommensseite und bereichsübergreifende Suche in der Galerie ergänzen. Die README erklärt den Einstieg und beschreibt die tatsächlich gezeigten Ansichten.

## Umfang

- `README.md`, `screenshots/*.png`
- `e2e/scripts/update-screenshots.mjs`
- Dieser Brief und `docs/agent-briefs/DONE.md`

## Abnahme

- Alle dokumentierten Bilder lassen sich aus einer frischen lokalen Sitzung mit öffentlichen Inhalten und einem fiktiven Profil erstellen. Konten, private Unterlagen, Suchindizes und persönliche Pfade bleiben außerhalb der Aufnahmen.
- Desktop- und Mobilansichten zeigen fertig geladene, lesbare Inhalte. Die Galerie enthält beide Farbschemata und verlinkt auf vorhandene Dateien.
- Bildgrößen, Sichtprüfung, README-Verweise sowie unabhängiges Review und Briefprüfung sind abgeschlossen.

## Ergebnis

Die Galerie enthält 16 echte Ansichten aus dem aktuellen Produktionsbuild. 14 Dateien ersetzen die bisherigen Bilder am gleichen Pfad. Die neuen Bilder zeigen den Einstieg ohne Konto und die Suche nach DNS. Zwei Aufnahmen zeigen das helle mobile Layout bei 390 × 844 Pixeln. Der Ausschnitt zur Theorie zeigt die Beispielfrage und alle drei öffentlichen Fundstellen zusammen.

Die README zeigt vier Ansichten direkt und gruppiert die übrigen zwölf in aufklappbaren Abschnitten. Alle 58 relativen Dateiverweise sind gültig. Die Aufnahme lief mit separatem lokalem Backend, neuer Browsersitzung, fiktiven Lerndaten und temporären leeren Ablagen für Konten und Unterlagen. Die 16 PNG-Dateien enthalten keine Text- oder EXIF-Metadaten.

Der unabhängige Sichtvergleich fand bei den Karteikarten eine Aufnahme vor der Aktualisierung der Stapelgröße. Das Skript wartet nun auf die angezeigten zehn Karten. Das endgültige Bild zeigt den Zehnerstapel mit zwei leichten, sechs mittleren und zwei schweren Karten. Bildausschnitte, Bildtexte und Verweise wurden freigegeben.
