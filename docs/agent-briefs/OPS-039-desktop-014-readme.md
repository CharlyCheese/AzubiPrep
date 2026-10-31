# OPS-039 – README aktualisieren und Desktop 0.1.4 bauen

Status: done
Bereich: OPS
Angelegt: 2026-10-31

## Ziel

README auf aktuellen Stand bringen und aktuellen Electron-Installer als 0.1.4
mit 7.000 Fragen, KI/Theorie, 82 Übungen und 85 vorbereiteten Kurslektionen bauen.
Keine ungeprüften Aussagen über die offene technische Integration 18–31.
Private Unterlagen, abgeleitete Daten, Konten und .env bleiben ausgeschlossen.

## Allowlist

- `README.md`
- `desktop/package.json`, `desktop/package-lock.json`
- `desktop/test/desktop-package.test.cjs`
- `desktop/scripts/verify-desktop-release.cjs`
- `e2e/tests/desktoppilot.spec.js`
- erzeugte Dateien in `frontend/dist/` und `Installer/` (Git-ignoriert)
- dieser Brief, `docs/agent-briefs/STATUS.md`, `docs/agent-briefs/DONE.md`

## Abnahme

1. README erklärt 82 integrierte Übungen 1–17 und 85 zusätzliche Inhaltslektionen
   18–31 einschließlich offener Laufzeit-/Praxisabnahme. Aktueller Desktop enthält
   KI/Theorie und eigene Anmeldemöglichkeit, keine Modelle/Unterlagen/Konten.
   Vorhandene Webpakete 0.1.2 ausdrücklich davon unterscheiden.
2. Desktopversion/Lockdatei/Pakettest stimmen auf 0.1.4 überein, App-ID/Datenformat
   bleiben erhalten. Installer neu bauen ohne Veröffentlichung oder Installation
   über das vorhandene persönliche App-Profil.
3. Tatsächlichen Paketinhalt (ASAR und Ressourcen) auf private Dateiklassen prüfen,
   Fragezahl/Frontendstand/Version prüfen. Keine privaten Originalablagen lesen.
4. Paket-/Runtimeprüfungen und echte gebaute EXE auf frischem Testprofil prüfen:
   alte Desktopmatrix, neue Inhaltsfassung, KI-Auswahl ohne Konto, 7.000 Fragen.
   Unabhängiger frischer Review und Archivcheck vor Abschluss.

## Ergebnis

README auf 82 integrierte Übungen 1–17 und 85 Inhaltslektionen 18–31 mit offenem
Integrations-/Praxisstatus aktualisiert. Desktop 0.1.4 enthält aktuellen Kurs,
KI-Auswahl, lokale Wissenssuche und Theorie; alte Webpakete 0.1.2 klar abgegrenzt.
Eigene Konten/Modelle/Unterlagen erforderlich, keine Zugangsdaten mitgeliefert.
Desktopversion und beide Lockmetadaten sowie Pakettest auf 0.1.4; App-ID und
Datenformate unverändert. Kein installiertes persönliches Profil überschrieben.

Installer `Installer/AzubiPrep Setup 0.1.4.exe` mit Blockmap neu erzeugt,
154.215.892 Bytes. Kein Publish, kein Signaturzertifikat, keine neue Bibliothek.
Paketprüfung erfasst 4.067 Dateien und sieben ASAR-Einträge, 102 öffentliche
Quell-/Inhaltsdateien identisch. Ausschlüsse gegen .env, lokale Materialien,
PDFs und Kontodateien im tatsächlichen Paket geprüft. Zusätzlich NSIS-Payload
ohne Installerstart temporär entpackt: Dateiliste und sämtliche Dateihashes
identisch zum geprüften win-unpacked; abgesicherte temporäre Bereinigung.
Installer/Frontendbuild bleiben Git-ignoriert; private Originalablagen nie gelesen.

Nachweise: 13 Paket-/Runtimefälle bestanden; sieben bestehende Desktopfälle
gegen die tatsächlich gebaute EXE bestanden. Neuer Releasefall nach Korrektur
seiner Testbedienung ebenfalls gegen gebaute EXE sowie Entwicklungsstart grün:
7.000 Fragen, 82 Übungen, echte js17-Prüfung/Konsolenausgabe, 14 vorbereitete
Kapitel/85 Lektionen, drei KI-Optionen, HTTP-200-Kontostatus ohne verbundene Konten
und Version 0.1.4. Alle Profile isoliert, KI-/RAG-Verzeichnisse ausdrücklich
im temporären Profil; Bereinigung prüft Parent, Prefix und Verknüpfungen.

Frischer unabhängiger Review ops039_review einschließlich Nachreview von NSIS-
Vergleich und endgültigem Smoke freigegeben, keine offenen Findings.
Bekannte bestehende Build-Chunkgrößenwarnung. Inhaltliche Integrationsgrenzen
18–31 unverändert; keine neuen Webpakete, keine Installation/Commits/Pushes.
