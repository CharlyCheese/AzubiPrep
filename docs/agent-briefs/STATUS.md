# Agent-Status (nur offene Punkte)

> Diese Datei wird bei jeder Sitzung komplett gelesen – bleibt deshalb klein.
> Erledigtes gehört nicht hierher, sondern nach `DONE.md`.
> Format: `- [ID] Kurzbeschreibung (Priorität) → Brief: <ID>-<slug>.md`
> (Brief-Link nur, sobald der Brief tatsächlich angelegt wurde.)

- [BE-001] Push-Benachrichtigungen (Web-Push) – Backend-Persistenz ist seit `DB-001` vorhanden (mittel)
- [BE-003] In-App-Feedback-Kanal ("Frage melden") für falsche/unklare Fragen – Ergänzung zu OPS-002, kein Ersatz für Review; kann jetzt direkt `review_status = 'gemeldet'` auf der Frage in der Content-DB (`DB-002`, seit 2026-09-16 umgesetzt) setzen (niedrig)
- [OPS-003] KI-Integration prüfen: lokal vs. über Internet (niedrig) —
  Idee (Sven, 2026-09-15): lokales Modell direkt in der App bündeln, z. B.
  Qwen 3B + RAG, gemeinsam mit dem Installer herunterladbar, lauffähig auf
  einem Laptop mit 8 GB RAM. Vor Umsetzung klären: Installer-Größe (ggf. Modell erst
  beim ersten Start nachladen statt fest bündeln, siehe auch OPS-004) und
  Modelllizenz kurz gegenchecken. Details bei Bearbeitung erneut besprechen.
  Freitext-Bewertung/Interview-Retrieval kann jetzt auf derselben
  `questions`-Tabelle aus `DB-002` aufsetzen (Embedding-Spalte als
  nicht-brechende Erweiterung, kein zweiter Content-Store nötig).
  Ergänzung (Sven, 2026-09-16, aus `CONTENT-001`-Klärung): zusätzliche
  Idee für später – Änderungen an Fragen über die Autoren-UI automatisch
  von der KI gegenprüfen lassen, mit Hinweis, falls eine vorher korrekte
  Antwort durch die Bearbeitung möglicherweise falsch geworden ist, und
  ggf. weitere Recherche empfehlen. Grundlage dafür (`questions_verlauf`
  mit Vorher/Nachher-Stand) wird bereits in `CONTENT-001` gelegt.
- [OPS-004] Windows-Installer digital signieren (aktuell unsigniert, SmartScreen-Warnung) (niedrig) —
  Recherche 2026-09-16: SignPath Foundation (kostenlos für OSS, aber
  manuelle Freigabe pro Release, Zertifikat läuft auf den Foundation-Namen)
  oder Azure Trusted Signing (~10 $/Monat, jetzt auch für Einzelentwickler
  in EU/UK/US/CA offen) sind die realistischen Optionen – klassische
  günstige OV-Zertifikate bringen seit 2023/2024 keinen SmartScreen-Vorteil
  mehr. Hängt mit OPS-006 (Auto-Update) zusammen: Update-Prüfung verlangt
  bei signierten Apps, dass auch Updates signiert sind.
- [OPS-006] Auto-Update für die Desktop-App (electron-updater, Prüfung beim
  Start) (niedrig) — Repo ist öffentlich auf GitHub, damit ist der
  Standardweg (GitHub Releases + `electron-builder --publish always`)
  machbar, überschaubarer Aufwand. Sollte zusammen mit OPS-004 geplant
  werden (Signierung und Auto-Update beißen sich, wenn nicht von Anfang an
  konsistent).
