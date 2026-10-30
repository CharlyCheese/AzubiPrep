# Brief CONTENT-155: DPA-ANA – Statistische Modelle und Zeitreihendiagnostik

Status: done
Bereich: CONTENT
Angelegt: 2026-10-30

## Ziel

24 SC-Fragen DPA-ANA-195 bis -218 ergänzen, Modul 194 → 218.
statsmodels: Regressionsschnittstellen, Modellgewichte, Zeitreihenmodelle,
Stationarität, Diagnostik und empirische Verteilungen.

## Betroffene Dateien

- `content/questions/DPA-ANA.csv`
- `docs/agent-briefs/CONTENT-155-dpa-ana-statistische-modelle.md`
- `docs/agent-briefs/STATUS.md`
- `docs/agent-briefs/DONE.md`

## Kontext und Quellen

Alle 194 Altstämme lesen, globale 26 CSV auf Lernziele abgleichen.
Eigene aktuelle Primärrecherche: https://www.statsmodels.org/stable/.
statsmodels ist lokal nicht installiert: kein Ausführungsnachweis behaupten,
keine Installation. Kleine Zahlenbeispiele separat mit Standardbibliothek
nachrechnen. Keine DB/.env, Builds, Commits oder Pushes.
Altpräfix 100194 Byte SHA256:
127690a56f96f511bb9a362633dccefdbb1266318076900e2e1af6cba8d3f027.

## Abnahmekriterien

- [x] 24 SC-Fragen/14 Felder, eindeutige globale IDs, Altbytes erhalten.
- [x] Primärbelege für alle Lernziele, Rechenbeispiele separat bestätigt.
- [x] Fachnahe eindeutige Optionen ohne globale Dubletten oder Antwort-Tells.
- [x] Frischer unabhängiger Vollreview mit eigener Webrecherche bestanden.
- [x] App-Parser, Content-Validator, Diff- und Archivierungscheck grün.

## Ergebnis

24 Fragen ergänzt, Batch-Endstand 5193 Fragen. Frischer Reviewer
content155_review hat alle Fragen, Optionen, Erklärungen, 194 Altstämme
und globale Nachbarn geprüft: keine Findings. Autor und Reviewer lasen
unabhängig aktuelle statsmodels-0.15.0-Primärdokumentation zu OLS,
add_constant, get_prediction, get_robustcov_results, WLS, Binomial,
ARIMA, adfuller, kpss, acf, acorr_ljungbox, durbin_watson,
seasonal_decompose, STL und ECDF. Quellen sind je Frage direkt verlinkt.

Kleine Rechenbeispiele separat mit Standardbibliothek beziehungsweise
JavaScript bestätigt: inverse Varianzen, Lag-Anzahl, Freiheitsgrade,
Durbin-Watson 8/3, zwei saisonale Zyklen und ECDF 0,75. Keine statsmodels-
oder SciPy-Ausführung behauptet. Altpräfixhash erhalten, App-Parser,
Content-Validator und Diffcheck bestanden.
