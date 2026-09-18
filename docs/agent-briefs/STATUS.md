# Agent-Status (nur offene Punkte)

> Diese Datei wird bei jeder Sitzung komplett gelesen – bleibt deshalb klein.
> Erledigtes gehört nicht hierher, sondern nach `DONE.md`.
> Format: `- [ID] Kurzbeschreibung (Priorität) → Brief: <ID>-<slug>.md`
> (Brief-Link nur, sobald der Brief tatsächlich angelegt wurde.)

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
- [FE-017] Landing-Page: weiterer Design-Feinschliff (niedrig) — Sven,
  2026-09-17, nach FE-016 (Zwei-Spalten-Breitbild-Layout): "passt erstmal",
  möchte aber zu einem späteren Zeitpunkt nochmal gezielt am Design
  arbeiten. Kein konkreter Auftrag, nur vorgemerkt – Details bei Bedarf im
  Chat klären.
- [OPS-006] Auto-Update für die Desktop-App (electron-updater, Prüfung beim
  Start) (niedrig) — Repo ist öffentlich auf GitHub, damit ist der
  Standardweg (GitHub Releases + `electron-builder --publish always`)
  machbar, überschaubarer Aufwand. Sollte zusammen mit OPS-004 geplant
  werden (Signierung und Auto-Update beißen sich, wenn nicht von Anfang an
  konsistent).
- [BE-008] E-Mail-Versand für Passwort-Reset (niedrig, gekoppelt an echtes
  Hosting) — Vormerkung (Sven, 2026-09-17) aus `BE-007`: Der Passwort-Reset
  läuft aktuell admin-gestützt (Admin erzeugt Link, schickt ihn manuell
  zu), weil keine E-Mail-Infrastruktur existiert. Sobald ein echter
  Online-Server-Host ansteht, entstehen dadurch ohnehin neue Optionen
  (Mail-Provider etc.) – dann lohnt sich ein "richtiger" Self-Service-Reset
  per Mail. Bewusst mit dem Hosting-Thema gekoppelt, kein eigenständiger
  Task davor. Die `BE-007`-Token-Mechanik (Tabelle, Hashing, Ablauf,
  Einmal-Nutzung) müsste dafür nur um den Zustellweg ergänzt werden, nicht
  umgebaut.
- [DB-003] Sync-Konfliktauflösung bei mehreren gleichzeitig aktiven Geräten
  (niedrig) — Fund beim Brief-Audit 2026-09-17: `docs/19-Datenbank-Login.md`
  nennt das seit `DB-001` als bekannte Einschränkung (aktuell reines
  Last-Write-Wins beim manuellen Hochladen/Herunterladen), nie im Backlog
  erfasst. Kein akuter Schmerzpunkt (Sync ist ohnehin manuell/bewusst),
  aber bei mehreren parallel genutzten Geräten theoretisch Datenverlust
  möglich.
