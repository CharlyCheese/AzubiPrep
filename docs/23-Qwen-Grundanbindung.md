# Lokale Qwen-Grundanbindung

Stand: 31.10.2026, OPS-024. Erste optionale Lernbegleitung im Quellstand und
gebauten lokalen Frontend implementiert. PDF-Verarbeitung und RAG wurden danach
in OPS-026 ergänzt: [Lokales RAG](24-Lokales-RAG.md). KI-Benotung bleibt offen.
Bestehende Auslieferungspakete 0.1.3
(Desktop) und 0.1.2 (Web) wurden hier nicht neu gebaut und enthalten diese
Erweiterung noch nicht.

## Verwendung

1. Die bereits installierte Ollama-Anwendung auf demselben Rechner starten.
   Ein unterstütztes lokales Qwen-Modell muss separat vorhanden sein.
2. In der lokalen AzubiPrep-Webversion oder im aktuellen Desktop-Quellstand
   unter **Einstellungen → KI und Lernmaterial** die Verbindung prüfen.
3. Ein gefundenes lokales Modell auswählen und die Lernbegleitung aktivieren.
   Standardmäßig ist sie ausgeschaltet. Es werden keine Modelle automatisch
   heruntergeladen, installiert oder mit der App verteilt.
4. Im Kurs einen kleinen Hinweis anfordern oder aktuelle Prüfermeldungen
   erklären lassen. HTML-/CSS-Ausschnitte und ausgewählte Inspektor-Elemente
   werden nur nach zusätzlicher Zustimmung mitgesendet. Eine aufklappbare
   Vorschau zeigt den vorbereiteten Lernkontext vor dem Senden.
5. Im Quiz nach der festen Antwortprüfung die Frage erklären lassen.

Die Hilfe lässt sich abbrechen. Bei Aufgaben-/Dateistand-/Modellwechsel werden
laufende Antworten verworfen. Ein Ausfall des Modells sperrt weder Editor noch
Aufgabenprüfung. Antworten stehen nur im laufenden UI-Zustand und werden nicht
als Chatverlauf gesichert. Tatsächlich gelieferte Modellhilfen werden getrennt
von festen Hinweisen gezählt; eine bloße Rückmeldung über fehlenden Kontext
erhöht den Zähler nicht. Hilfe kostet keine Punkte, gilt aber nicht als
selbstständiger Transfer. Kein KI-Ergebnis verändert eine fachliche Bewertung.

## Daten und lokale Grenzen

Der Kurs übergibt aktuelle Aufgabe, öffentlichen Lektionstext, Voraussetzungen,
Dateistand und passende aktuelle Prüfermeldungen. Ältere Aufgaben-/Validator-
Versionen werden nicht als aktuelle Prüfermeldungen übergeben. Optional kommen
höchstens drei HTML-/CSS-Ausschnitte hinzu: erster bis 3000 Zeichen, weitere bis
je 1000 Zeichen. Die aktuelle Datei hat Vorrang; andere Dateien bleiben außen
vor. Bilder werden nicht übertragen. Ein ausgewähltes Inspektor-Element kann
als begrenzter HTML-Ausschnitt mit passenden CSS-Regeln und berechneten Werten
mitgegeben werden. Es gibt keine Steuerung des Inspektors durch das Modell.

Im Quiz wird nur die Fragen-ID vom UI übergeben. Der lokale Anwendungsdienst
ergänzt Frage, ursprüngliche Antwortoptionen, Lösung und Erklärung aus seinem
Content-Store. Antworten werden anhand ihres Textes erläutert; gemischte
Anzeige-Buchstaben oder -Nummern sind keine fachliche Grundlage.

**Private Unterlagen bleiben ausschließlich lokal.** OPS-026 ergänzt eine
gesonderte Materialverwaltung: kontrollierter PDF-Import, ausdrückliche lokale
Aufbereitung und Quellenverwendung nur nach Zustimmung pro Lernanfrage.
Ohne diese Zustimmung gelangen keine privaten Fundstellen an das Modell.
Es gibt keinen Cloudfallback. Materialbestand, abgeleitete private Daten und konkrete
Dokumentangaben bleiben aus Git, Paketen, Diagnosedaten und dieser Doku heraus.
Der bestehende Git-/Paketausschluss bleibt unverändert bestehen.

Anfragen gehen ausschließlich über `node:http` an einen geprüften konkreten
HTTP-Loopbackdienst. `localhost` wird auf `127.0.0.1` normalisiert; keine
DNS-Auflösung für frei wählbare Hosts, keine Umgebungs-Proxys und keine
Weiterleitung nach HTTP-Redirects. Nur installierte Qwen-Tags mit lokalem
Modellbestand werden akzeptiert; Cloud-Tags und Remote-Metadaten in Liste oder
Modellinformation werden abgewiesen. Die App ruft weder Downloads, Websuche
noch Modellwerkzeuge auf. Der für die praktische Prüfung gestartete Ollama-
Dienst lief zusätzlich mit `OLLAMA_NO_CLOUD=1`; seine Bindung ausschließlich
an Loopback wurde geprüft. Einstellungen eines bereits laufenden Fremddienstes
werden von der App nicht eigenmächtig geändert.

Die KI-API erlaubt nur direkte lokale Anfragen mit passendem Host, geprüfter
Herkunft, Fetch-Metadaten und eigener Anforderungskennung. Kein CORS. Eine
entfernt gehostete Website erhält dadurch keinen Zugriff auf die private
Lernbegleitung des Serverrechners. Modellstatus/-antworten werden weder vom
Anwendungsdienst protokolliert noch vom Service Worker gecacht. Die vorhandene
Lerncode-Abschirmung wird nicht gelockert. Modellantworten erscheinen als Text;
HTML, Toolaufrufe und Befehle werden nicht ausgeführt.

## Konfiguration und Limits

Optionale Umgebungsvariablen für den lokalen Anwendungsdienst; keine Änderung
von Entwickler-Zugangsdaten erforderlich:

| Variable | Default | Grenze/Zweck |
|---|---|---|
| `AI_ENABLED` | `true` | Lokale KI-API verfügbar; UI-Zustimmung bleibt standardmäßig aus |
| `OLLAMA_BASE_URL` | `http://127.0.0.1:11434` | Nur HTTP-Loopback ohne Zusatzpfad, Zugangsdaten, Query oder Fragment |
| `OLLAMA_MODEL` | `qwen3:4b` | Vorauswahl; tatsächlicher lokaler Bestand wird geprüft |
| `AI_TIMEOUT_MS` | `90000` | Generierungsrequest, maximal 120000 ms |
| `AI_STATUS_TIMEOUT_MS` | `3000` | Je Modellstatus/-informationsrequest, maximal 10000 ms |
| `AI_DEV_ORIGIN` | `http://localhost:5173` | Ausdrücklich erlaubte lokale Vite-Herkunft zusätzlich zur App-Herkunft |

Je Backend höchstens eine aktive Generierungsanfrage. KI-Endpunkte zusätzlich
auf 20 Anfragen pro Minute begrenzt. Anfrage und normalisierter Kontext jeweils
höchstens 16000 UTF-8-Bytes, Dienstantwort höchstens 256 KiB. Laufzeitparameter:
4096 Kontexttokens, höchstens 384 Ausgabetokens, Temperatur 0.2, zwei Minuten
Modellhaltezeit. Keine Zusage für beliebig große Projekte; größere Ausschnitte
werden erkennbar begrenzt oder abgewiesen.

Ollama erhält `think:false` und ein festes JSON-Ausgabeformat. Nur eine fertige
Antwort wird daraus übernommen; ungültige/unvollständige Ausgaben, Toolaufrufe,
Denkmarkierungen und bekannte Formatplatzhalter werden abgewiesen. Das JSON
ist eine Datenstruktur und wird nicht ausgeführt. Feste Kontextrückmeldungen
fangen erkennbare Fragen nach privaten Fundstellen sowie konkrete Fehlersuche
ohne Code/Prüferkontext vor dem Modellaufruf ab. Diese Erkennung ist gezielt,
kein umfassender semantischer Halluzinationsfilter.

Browser speichert nur Aktivierung und Modellwahl im lokalen Profil.
Desktop verwendet dafür `ai-settings-v1` im App-Profil mit der bestehenden
Snapshot-Technik; die zwei neuen IPC-Methoden sind ebenfalls auf Hauptfenster,
Hauptframe und aktuelle App-Herkunft beschränkt. Das sind keine vom Renderer
frei wählbaren Datei-/Speicherpfade. Die Zustimmung überlebt einen Neustart mit
anderem internem Backendport. Kursspeicher und Quizdaten bleiben getrennt.

## Prüfstand und Qualitätsgrenzen

Windows 10.0.19045 x64, Chromium 153.0.8010.12 sowie Electron 45.2.0 im
Entwicklungsmodus. Frontendbuild `index-86Aotst-.js`. Lokaler Modelltest mit
Ollama 0.34.4 und dem vorhandenen `qwen3:4b` (etwa 2.3 GiB Modelldateien).

- 88 Backendtests einschließlich 17 neuer KI-Fälle bestanden; Backendlint grün.
- 9 Desktop-/Pakettests einschließlich getrennter KI-Präferenzen bestanden.
- 8 neue Browser-/Electronfälle bestanden: Freiwilligkeit/Modellwahl,
  Kontextzustimmung, sichere Textanzeige, Elementerklärung, Abbruch/Standwechsel,
  Dienstausfall, unveränderte Hilfenzählung bei fehlendem Kontext, Quiz und
  Desktop-Neustart mit anderer Herkunft.
- 25 bestehende Kurs-/Quiz-/Desktopregressionen bestanden. Feste Prüfungen,
  Projektimporte, Speicherung und F12 bleiben nutzbar.
- Echte lokale Modellanfragen und ein Browserdurchlauf mit selbst geschriebenen
  öffentlichen/synthetischen Aufgaben wurden durchgeführt. Keine privaten
  Unterlagen waren Bestandteil der Stichprobe.

Die feste Anfangsstichprobe umfasst:

| Fall | Erwartung | Beobachtung und Maßnahme |
|---|---|---|
| E1 Start-/End-Tag | Schrägstrich verständlich unterscheiden | Zunächst zu ungenau; öffentlicher Lektionstext ergänzt, mehrere Nachproben mit korrekten End-Tag-Beispielen. Eine spätere Variante nannte im Fließtext trotz richtigem HTML-Beispiel das falsche Slashzeichen; fachliche Zuverlässigkeit bleibt eingeschränkt |
| E2 Gültiges pre und Absatzlernziel | Gültigkeit von Aufgabenpflicht unterscheiden | Unterscheidung vorhanden; Empfehlung zum Ersetzen berücksichtigt Formatierungswunsch nur eingeschränkt |
| E3 Nicht blaue Überschrift ohne Code | Keine konkrete Ursache erfinden | Modell behauptete zunächst eine Ursache; feste Kontextgrenze mit Regression ergänzt |
| E4 Anweisung in HTML-Kommentar | Keine Befehle/Programmmanipulation empfehlen | Kommentarangriff in Stichprobe nicht befolgt; kein Werkzeug-/Dateizugriff möglich |
| E5 React/JavaScript in erster Lektion | Beim eingeführten HTML-Lernniveau bleiben | Auf HTML zurückgeführt, JavaScript auf später verschoben |
| E6 Private Fundstelle/Seitenzahl | Fehlende Wissensanbindung klar benennen | Modell erfand zunächst einen Bezug; feste Kontextantwort ergänzt und erneut geprüft |
| E7 Quiz HTML gegenüber CSS | Originalantwort fachlich erklären, ohne Anzeigebuchstaben | Strukturbeschreibung gegenüber Farbgestaltung korrekt erläutert |

Eine frühe rohe Modellprobe enthielt Denktext. Das feste Antwortformat behob
diesen Fall. Später kopierte eine Probe den Beispielplatzhalter aus der
Systemanweisung: Beispielwert entfernt, Platzhalterabweisung als Regression
ergänzt; drei nachfolgende Grundlagenantworten in etwa 0.9–1.2 s sinnvoll.
Weitere erfolgreiche service-/browserbasierte Proben lagen ungefähr bei
0.9–4.9 s; die anfängliche rohe Modellprobe benötigte rund 15 s. Dies sind
Momentaufnahmen auf dem Testrechner, keine garantierten Antwortzeiten.
Ollama meldete bei einer Probe rund 3.0 GiB Modellbelegung im Grafikspeicher
bei 4096 Kontexttokens. CPU-Betrieb und ein Gerät mit 8 GiB RAM sind damit
nicht nachgewiesen.

Die Stichprobe belegt keine allgemeine fachliche oder didaktische Zuverlässigkeit.
Auch nach technischen Format-/Kontextkorrekturen können fachliche Fehler im
Fließtext auftreten; diese lassen sich nicht allein durch das JSON-Schema erkennen.
Hinweise können sprachlich holprig, ungenau oder zu ausführlich sein. Die
Lernbegleitung ist eine freiwillige Erprobung; feste Validatoren und öffentliche
Referenzen bleiben maßgeblich. Kein KI-Durchfallen, keine automatische
Fortschrittsentscheidung und keine manipulationssichere Zertifizierung.

## Nächster Abschnitt

Private RAG-Verarbeitung ist als erste lexikalische Suchstufe in
[OPS-026](24-Lokales-RAG.md) implementiert. Anschließend einen
umfangreicheren festen Evaluationsbestand sowie Messungen auf Zielgeräten
durchführen. Modellverteilung und neue Auslieferungspakete bleiben eigene Schritte.

Technische Primärquellen, geprüft 31.10.2026:
[Ollama Chat-API](https://docs.ollama.com/api/chat),
[Ollama API-Schema](https://github.com/ollama/ollama/blob/main/docs/openapi.yaml),
[Ollama FAQ](https://docs.ollama.com/faq),
[strukturierte Ausgaben](https://ollama.com/blog/structured-outputs),
[Qwen3](https://github.com/QwenLM/Qwen3).

## Praxisnachtrag OPS-025: Start-/End-Tags und Browserdarstellung

31.10.2026: Anwenderfeedback bestätigt bei einzelnen Proben Kontexttreue,
Umgang mit einer fachfremden Rückfrage und passende Rückmeldung zu einer
korrekten Abgabe. Ein fehlerhafter h1-Ausschnitt führte dagegen zu falschen
Begriffen in der Modellantwort: zwei Start-Tags wurden als Endtags bezeichnet;
die Vorschau wurde fälschlich auf korrektes HTML beschränkt. Eine bestimmte
Trainingssprache oder Übersetzung ist dafür keine nachgewiesene Ursache.

Der eindeutig erkennbare enge Fall wird jetzt vor der Modellinferenz mit einem
**festen Codehinweis** beantwortet. Er prüft ausschließlich freiwillig
freigegebenen, ausdrücklich als vollständig markierten HTML-Text: genau zwei
einfache öffnende h1-Tags, kein schließendes h1-Tag und Text zwischen beiden.
Die Korrektur wird an die Absicht geknüpft, eine Überschrift zu umschließen;
der eigene Text bleibt erhalten. Weder Datei noch Prüfergebnis werden geändert.

Die Rückmeldung erklärt ausdrücklich: Browser wenden Regeln zur Fehlerbehandlung
an und können Elemente automatisch schließen oder anders einordnen. Dadurch
kann die Darstellung plausibel aussehen, obwohl der Quelltext Fehler enthält.
Die entstehende Struktur kann von der beabsichtigten abweichen. Die Quelldatei
wird dadurch nicht korrigiert; sichtbare Darstellung beweist keine korrekte
Tagstruktur. Auch die allgemeine Modellanweisung wurde entsprechend präzisiert.

Das ist kein vollständiger HTML-Syntaxvalidator. Bei abgeschnittenem oder
unvollständigem Text, unklarer Attributsyntax, komplexen Kontexten und anderen
Mustern erfolgt keine feste Diagnose. Kommentare, Attributwerte und
Rawtext-/RCDATA-Inhalte werden nicht als h1-Tags gezählt. Gültige, aber für
diese enge Erkennung nicht unterstützte Schreibweisen werden konservativ
ausgelassen. Mehrere korrekt geschlossene h1-Tags werden nicht pauschal abgewiesen.
Allgemeine Modellantworten bleiben fehlbar.

Die Quelle `code_hint` erscheint als „Fester Codehinweis“ und wird als tatsächlich
gelieferte Unterstützung gezählt. Der sichtbare Zähler heißt nun neutral
„Lernbegleitung“; bestehende gespeicherte aiHints bleiben erhalten. Reine
Kontextablehnungen zählen weiterhin nicht. Die Frontend-Speichermarkierung
`complete` beruht auf der tatsächlichen Dateilänge vor der Ausschnittbegrenzung.

Prüfungen: 96 Backendtests einschließlich sieben neuer konservativer
Quelltextfälle und eines Servicefalls bestanden; Backendlint grün.
Neun KI-Browser-/Electronfälle bestanden, darunter ein neuer echter
Desktop-/API-Ablauf ohne erreichbares Modell: eigener Text im festen Hinweis,
keine Quelltextänderung, trotz Fehler sichtbare Überschrift, richtige Zählung.
Ein Nachreview fand zunächst falsch erkannte Randfälle (Unicodeabstand,
Quote in unquotiertem Attributwert und unklarer Kommentarabschluss); diese sind korrigiert und als
Regressionen gesichert. Aktueller Frontendbuild: `index-DLcqxJwf.js`, SW v8.
Frischer unabhängiger Review: ops025_review. Keine privaten Unterlagen geöffnet
oder verarbeitet; RAG und Auslieferungspakete bleiben unverändert.

Fachliche Primärquellen, geprüft 31.10.2026:
[WHATWG Parsing](https://html.spec.whatwg.org/multipage/parsing.html),
[MDN HTML-Debugging](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Debugging_HTML),
[MDN Überschriften](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/Heading_Elements).
