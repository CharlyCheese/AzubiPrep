# Brief BE-002: Passwort-Komplexitätsanforderungen

Status: in Testung
Bereich: BE
Angelegt: 2026-09-15

## Ziel (1–3 Sätze)

Registrierung verlangt jetzt ein Passwort mit Groß-/Kleinbuchstaben, Ziffer
und Sonderzeichen (nicht nur Mindestlänge 8) – auf Wunsch von Sven direkt
mit eingeführt, damit dieser Sicherheitsstandard nicht später nachgezogen
werden muss. Bestehende Logins sind nicht betroffen (Login prüft weiterhin
nur, ob überhaupt ein Passwort gesendet wurde, nicht die Komplexität – sonst
würden sich Bestandsnutzer mit altem, einfacherem Passwort aussperren).

## Betroffene Dateien (exakte Pfade)

- `backend/src/auth.js` (`passwortGueltig`)
- `backend/src/routes/auth.routes.js` (Fehlertext bei Registrierung)
- `frontend/src/pages/Einstellungen.jsx` (Hinweistext bei Registrierung)
- `docs/19-Datenbank-Login.md` (Datenmodell-/Regel-Dokumentation)

## Kontext (nur Verweise, keine Dokumentkopien)

- `docs/agent-briefs/FE-001-login-sync-ui.md` (Login/Registrierung-UI, gerade
  fertiggestellt – diese Regel ergänzt sie direkt im Anschluss)

## Umsetzungsschritte (Checkliste)

- [x] `passwortGueltig()`: Länge 8–200 UND je mind. ein Klein-, ein
      Großbuchstabe, eine Ziffer, ein Sonderzeichen
- [x] Fehlermeldung bei `/auth/register` entsprechend präzisiert
- [x] Login-Route bewusst unverändert gelassen (keine Aussperrung von
      Bestandsnutzern mit altem, einfacherem Passwort)
- [x] Hinweistext im Registrierungsformular ergänzt, damit der Nutzer die
      Anforderung vor dem Absenden kennt
- [x] Kurzer Hinweis in `docs/19-Datenbank-Login.md` ergänzt

## Abnahme-Kriterien (Reviewer prüft genau diese)

- [ ] Registrierung mit reinem Kleinbuchstaben-Passwort (z. B.
      `nurklein123`) wird abgelehnt mit klarer Fehlermeldung
- [ ] Registrierung mit vollständigem Passwort (z. B. `Azubi2026!`) klappt
- [ ] Login mit einem vor dieser Änderung angelegten (einfacheren) Konto
      funktioniert weiterhin unverändert

## Ergebnis (wird beim Abschluss ausgefüllt)

Umgesetzt wie geplant. `passwortGueltig()` prüft jetzt vier Zeichenklassen
per Regex (`[a-z]`, `[A-Z]`, `[0-9]`, alles außerhalb `[A-Za-z0-9]` als
Sonderzeichen) zusätzlich zur bestehenden Längenprüfung. Login bleibt
absichtlich unverändert (`typeof passwort === 'string'`), damit bestehende
Konten nicht ausgesperrt werden.

Verifikation: Backend-Syntax mit `node --check` geprüft. Funktionaler Test
(zu schwaches vs. gültiges Passwort bei der Registrierung, Login mit
Bestandskonto) steht noch durch Sven aus – daher `Status: in Testung`.
