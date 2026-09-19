# Agent-Status (nur offene Punkte)

> Diese Datei wird bei jeder Sitzung komplett gelesen – bleibt deshalb klein.
> Erledigtes gehört nicht hierher, sondern nach `DONE.md`.
> Format: `- [ID] Kurzbeschreibung (Priorität) → Brief: <ID>-<slug>.md`
> (Brief-Link nur, sobald der Brief tatsächlich angelegt wurde.)

- [CONTENT-022] FISI-SYS vertiefen, Runde 4 (mittel) — `FISI-SYS` von 51
  auf 76 Fragen erweitert (siehe `CONTENT-021`-Fortsetzungsplan). Erster
  Subagent-Review direkt bestanden nach zwei Selbstprüfungs-Iterationen
  (Ausgangsbefund erneut 100 % Längen-Bias, 59 Füllwort-Treffer). Neue
  Lehre: gezielte Korrektur nur der am leichtesten behebbaren
  Längenausreißer (statt aller) reicht aus, wenn die Gesamtquote danach
  unter der Auffälligkeitsschwelle bleibt. `validate-content.mjs`: 2061
  Fragen, 0 Fehler. Wartet auf Svens fachlichen Gegenlese (Sven prüft
  stichprobenartig und gibt dann per Chat frei, siehe Vorgehen bei
  `CONTENT-017`–`-021`). → Brief:
  CONTENT-022-fisi-sys-vertiefung.md

- [CONTENT-010] Antwortpositions-Verteilung in den CSV-Rohdaten unausgewogen,
  aber ohne Nutzerauswirkung (niedrig) — Beim Subagent-Review von
  `CONTENT-009` Runde 2 fiel auf, dass eine Auszählung über alle 23 Fragen-
  Dateien (1654 Single-Choice-Fragen) ein projektweites Muster zeigt: 1157
  Fragen (70 %) haben "b" als korrekte Antwort in der CSV, nur 480 "a", 15
  "c" und 2 "d". **Korrektur (Sven, 2026-09-19): kein Prüfungsdesign-Fehler.**
  `frontend/src/utils/optionen.js#mischeOptionen()` mischt die
  Antwortoptionen bei jedem Aufruf per Fisher-Yates neu und bildet auf die
  Original-Buchstaben zurück; das läuft in allen echten Abfrage-Ansichten
  (`Quiz.jsx`, `Pruefung.jsx`, `Karteikarten.jsx`, `PruefungLauf.jsx`). Die
  in der CSV gespeicherte Buchstaben-Verteilung ist für Nutzer also nie
  sichtbar und nicht ausnutzbar ("immer b raten" funktioniert nicht, weil
  b in der Anzeige nichts mit der CSV-Spalte zu tun hat). Ursprünglich fälschlich
  als "hoch"/kritisch eingestuft, siehe auch `CONTENT-009`-Korrektur. Bleibt
  nur als niedrigpriorer Hinweis stehen (Datenhygiene/Lesbarkeit in einer
  künftigen Autoren-UI, falls dort mal unausgewählt statt gemischt
  angezeigt würde) – kein aktiver Handlungsbedarf, kein Brief nötig.

- [FE-018] Themengewichtung in der Prüfungssimulation aktivieren (hoch) —
  Fund aus `OPS-011`: `backend/src/exam.js#generierePruefung` unterstützt
  seit jeher einen `gewichtung`-Parameter, den das Frontend nie befüllt
  hat. Sven hat sich für die Aktivierung entschieden (automatisch im
  Hintergrund, ohne neues UI-Element, gekoppelt an die bereits vorhandene
  60%-Schwächenschwelle). Umsetzung erfolgt, Test durch Sven steht noch
  aus (kein npm-Registry-Zugriff in meiner Umgebung). → Brief:
  FE-018-pruefung-themengewichtung-aktivieren.md

- [OPS-011] Lern-Kernflows (Quiz, Karteikarten, Prüfungssimulation):
  kombinierte Doku- und Feature-Abnahme (hoch) — Folgeschritt aus dem
  ChatGPT-Review 2026-09-18 ("weit fortgeschrittener MVP", 8–8,5/10),
  Sven hat sich für Feature-Fokus statt Release-Fokus entschieden. Erster
  von mehreren geplanten Kernbereichs-Durchgängen (weitere folgen für
  Autoren-Workflow, Konto/Sync). Doku-Audit und Feature-Test bewusst
  kombiniert statt nacheinander. → Brief: OPS-011-lern-kernflows-abnahme.md

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
- [FE-019] XP-Ziel und Ränge (Gamification) an wachsenden Fragenkatalog
  anpassen (niedrig) — Vormerkung (Sven, 2026-09-18) im Zuge der
  Fragenkatalog-Ausbau-Planung (`CONTENT-007`): mit deutlich mehr Fragen
  (Zielgröße ~1000 je Fachrichtung) werden aktuelle XP-Schwellen/Ränge
  (`frontend/src/store/gamificationStore.js`, `frontend/src/utils/
  gamification.js`) vermutlich zu schnell erreichbar bzw. nicht mehr
  passend skaliert. Laut Sven unkompliziert anzupassen, kein konkreter
  Auftrag – nur vormerken, bei Bedarf im Zuge des Fragen-Ausbaus erneut
  aufgreifen.
- [DB-003] Sync-Konfliktauflösung bei mehreren gleichzeitig aktiven Geräten
  (niedrig) — Fund beim Brief-Audit 2026-09-17: `docs/19-Datenbank-Login.md`
  nennt das seit `DB-001` als bekannte Einschränkung (aktuell reines
  Last-Write-Wins beim manuellen Hochladen/Herunterladen), nie im Backlog
  erfasst. Kein akuter Schmerzpunkt (Sync ist ohnehin manuell/bewusst),
  aber bei mehreren parallel genutzten Geräten theoretisch Datenverlust
  möglich.
