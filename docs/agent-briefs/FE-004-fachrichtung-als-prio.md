# Brief FE-004: Fachrichtung als Prio statt Zugriffsbeschränkung

Status: in Testung
Bereich: FE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Die Fachrichtung schränkt den Zugriff auf Module/Fachbereiche nicht mehr ein
(„Lernende:r weiß, dass er/sie FIAE ist – darf Prios selbst setzen"). Der
Lernbereich zeigt alle vier Fachrichtungen gleichberechtigt, mit den
gemeinsamen Modulen (WISO, PM) sichtbar oben zentral statt in einer
Fachrichtung versteckt. Die Fachrichtung bleibt als reiner Vorauswahl-/
Prio-Wert erhalten (Default für Prüfungssimulation/Lernreise), wird aber
jetzt primär bei der Registrierung gesetzt und aus dem Konto (SQL,
`users.fachrichtung`) übernommen, statt nur lokal geraten zu werden.

## Betroffene Dateien (exakte Pfade)

- `frontend/src/pages/Lernen.jsx` (komplett neu strukturiert)
- `frontend/src/pages/Einstellungen.jsx` (Registrierung übernimmt Fachrichtung
  aus dem Konto nach Login/Registrierung; Hinweistext ergänzt)

## Kontext (nur Verweise, keine Dokumentkopien)

- `backend/src/content.js` (`moduleFuerFachrichtung`/`fragenFuerFachrichtung`
  filtern serverseitig nur, wenn explizit ein `fachrichtung`-Query-Param
  mitgeschickt wird – das Backend war nie die Ursache der Einschränkung)
- `docs/agent-briefs/FE-001-login-sync-ui.md` (Login/Registrierung, Grundlage)
- Bug nebenbei gefunden und mitgefixt: Die Fachrichtung-Buttons in
  `Lernen.jsx` verlinkten fälschlich auf `/lernen/<code>` (Modul-Route statt
  Fachrichtungswechsel) – funktionslos/irreführend, entfernt.

## Umsetzungsschritte (Checkliste)

- [x] `Lernen.jsx`: `/module` liefert ohnehin alle Module (kein
      serverseitiger Filter mehr nötig) – Anzeige jetzt in Blöcken:
      „Allgemein" (ALLE) zuerst, danach alle vier Fachrichtungen, eigene
      Fachrichtung optisch hervorgehoben (Badge „deine Fachrichtung"),
      nichts gesperrt
- [x] Kaputte Fachrichtung-Buttons durch Anker-Sprungmarken zu den Blöcken
      ersetzt (kein funktionsloser Link mehr auf eine ungültige Modul-Route)
- [x] `Einstellungen.jsx`: nach erfolgreichem Login/Register wird
      `user.fachrichtung` (aus der DB) in den lokalen `profileStore`
      übernommen, falls vorhanden – Konto ist jetzt die bevorzugte Quelle
- [x] Hinweistext bei Fachrichtung im Lernprofil ergänzt: dient nur als
      Vorauswahl/Priorität, schränkt nichts ein

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Lernbereich zeigt alle Module aller 4 Fachrichtungen + Allgemein,
      unabhängig von der eingestellten Fachrichtung
- [ ] Keine kaputten Links mehr (alte `/lernen/<fachrichtungscode>`-Buttons)
- [ ] Registrierung mit gewählter Fachrichtung → nach Login zeigt
      Einstellungen die aus der DB geladene Fachrichtung korrekt an

## Ergebnis (wird beim Abschluss ausgefüllt)

<wird nach Umsetzung/Test ausgefüllt>
