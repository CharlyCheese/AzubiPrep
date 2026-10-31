# Freiwillige KI-Anbieter in der lokalen App

## Auswahl und Einrichtung

Unter **Einstellungen → KI und Lernmaterial → KI-Anbieter**:

| Auswahl | Voraussetzung | Verwendung |
|---|---|---|
| Ohne KI | Keine | Quiz, Werkstatt, feste Prüfungen und lokale Fundstellen |
| Lokales Qwen über Ollama | Separat installiertes lokales Modell | Lernhilfe auch mit ausdrücklich gewählten privaten Unterlagen |
| Eigenes ChatGPT-Abo | Internet, berechtigtes Konto und freigegebene Abo-Nutzung | Öffentliche App-Lerninhalte, eigene Rückfrage und freiwillig ausgewählter Code |

Neue Installationen beginnen ohne KI. Bestehende freigegebene Qwen-Einstellungen
werden als lokale Auswahl übernommen; daraus entsteht keine Cloudzustimmung.
Modellwahlen bleiben je Anbieter getrennt. Ein Wechsel verwirft laufende und
angezeigte Antworten sowie bisherige Frage-/Codefreigaben. Es gibt keinen
automatischen Anbieterwechsel oder Cloudfallback.

Für ChatGPT **Continue with ChatGPT** wählen und die Anmeldung im Systembrowser
abschließen. Falls das Fenster blockiert wird, den zusätzlichen Anmeldelink
öffnen. Danach **ChatGPT-Verbindung prüfen** und ein vom Konto angebotenes
Modell wählen. Es wird kein API-Schlüssel benötigt. Vorhandene Konten können
ausgewählt oder erneut angemeldet werden; weitere Konten erhalten eigene
Registrierungen. Gleiche E-Mail-Adressen bleiben durch stabile Kontobezeichnungen
unterscheidbar. Die OAuth-Anmeldung verleiht keinen Zugriff auf frühere Chats.

**ChatGPT-Nutzung verwalten** öffnet die Abo-Nutzungsverwaltung. Es gelten
Kontingent und Zugriffsrechte des jeweiligen Kontos. Bei fehlendem Internet,
fehlender Freigabe oder erreichtem Limit funktionieren die lokalen Lernfunktionen
weiter. ChatGPT ist keine Voraussetzung für die App. Kontoverbindung und
Cloudanfragen stehen nur in der lokal gestarteten Web-/Electron-App zur
Verfügung; die Abofunktion ist nicht ohne Weiteres für bezahlte oder entfernt
gehostete Angebote übertragbar. Verfügbarkeit und Anbietervorgaben können sich
ändern; keine unbegrenzte Nutzung zugesagt.

## Private Unterlagen

Private PDFs, Originalauszüge, Indizes, Definitionen/Suchableitungen und
Materialmetadaten werden nicht an ChatGPT gegeben. Der Server weist
`provider=chatgpt` mit `useMaterial=true` vor Authentifizierung, Retrieval und
Modelltransport zurück. Die ChatGPT-Schicht bekommt ausschließlich den neu
aufgebauten öffentlichen Lernkontext. Alte Antworten sind nie Folgeprompts.

Die private Quellenwahl im Theoriebereich bleibt zum **Fundstellen lesen**
verfügbar: diese Anfrage verwendet `provider=none` und bleibt lokal.
KI-Erklärungen privater Quellen benötigen ausdrücklich ausgewähltes lokales
Qwen. Der Wechsel privat → öffentlich leert auch das Fragefeld, damit keine
private Suchfrage unbemerkt in eine Cloudanfrage übernommen wird. Codefreigaben
müssen nach Anbieter-/Kontowechsel erneut erteilt werden.

Freitext kann absichtlich eingefügte private Inhalte nicht zuverlässig erkennen.
Deshalb keine Buchauszüge, Zugangsdaten oder andere private Unterlagen in
Cloud-Rückfragen oder freigegebene Codefelder kopieren. Keine Rechtseinschätzung
zu fremden Materialien und keine automatische Freigabe zum Übertragen.

## Anmeldung und Zugangsschutz

Direkter offizieller OAuth-Fluss ohne zusätzliche Bibliotheken: temporärer
`127.0.0.1`-Callback, frischer State/Nonce/PKCE, dynamische Registrierung,
ausgegebene Client-ID beim Tokenaustausch, JWKS-Signatur-/Issuer-/Audience-/
Ablauf-/Nonce-/Identitätsprüfung und Prüfung der tatsächlich gewährten Scopes.
Keine Anmeldung oder Anfragen allein durch Auswahl ohne Nutzeraktion.
Gespeicherte Registrierungen werden wiederverwendet. Auf `id_token_hint` in
Anmelde-URLs wird bewusst verzichtet; erneute Kontowahl kann nötig sein.

Zugangsdaten liegen im privaten KI-Profil, getrennt von Lernmaterial:
Entwicklung standardmäßig `local-ai/`, konfigurierbar über `AZUBIPREP_AI_DIR`;
installierte Web-/Desktoppakete verwenden ihr jeweiliges App-Profil. Nicht
in Git oder Paketressourcen, keine Tokens in Browser-Speichern, UI-Antworten,
URLs oder Logs. Windows schützt den Dateiinhalt zusätzlich mit DPAPI für den
angemeldeten Benutzer. Andere Systeme verwenden Dateien mit Besitzerrechten
(`0600`), keine zugesagte Verschlüsselung. Diese Plattformen sind noch nicht
praktisch abgenommen. Pfad-/Verknüpfungsschutz und Größenbegrenzungen verhindern
eine Ablage in öffentlichen Bereichen oder in den privaten Lernmaterialien.

Dateien werden atomar ersetzt. Eine prozessübergreifende lokale Sperre
serialisiert Token-Erneuerung. Persistierte Sitzungsrevisionen verhindern
Kontowechsel während Modelllistenabruf/Generierung und Reaktivierung alter
Anmeldevorgänge. Modellliste und Antwortanfrage verwenden denselben
Konto-/Token-Schnappschuss. Abmeldung löscht lokale Tokens, erhält die neutrale
Kontoregistrierung und versucht einen serverseitigen Widerruf. Kann dieser nicht
bestätigt werden, wird das ausdrücklich gemeldet; zusätzlich in ChatGPT trennen.

## Transport und Grenzen

Cloudverbindungen verwenden ausschließlich offizielle HTTPS-Hosts, ohne
Weiterleitungen oder Umgebungs-Proxys. Modellliste wird aus dem angemeldeten
Konto geladen; es wird kein allgemeines Modell vorausgesetzt. Responses setzt
`store=false` und `stream=true`, übergibt Lernregeln als `instructions` und
verwendet keine Tools, Datei-Uploads, Cloudsuche oder Gesprächsspeicher.
Die Quelle wird weiterhin in der App ermittelt. Fehlerhafte Quellenkennungen
werden für beide Anbieter gleich abgewiesen. Das ist eine Zuordnungsprüfung,
keine Garantie fachlicher Wahrheit.

Die Abo-Schnittstelle unterstützt derzeit unter anderem kein `max_output_tokens`
und keine Temperaturvorgabe. Daher bleiben Wortvorgaben im Prompt und lokale
Schutzgrenzen maßgeblich:18000Antwortzeichen,512000Transportbytes und ein
Timeout gemäß `AI_TIMEOUT_MS`. Keine automatische Werkzeugausführung.
OPS-034 trennt die Transportquoten: ausschließlich der nicht streamende
GET-Abruf von `https://api.openai.com/v1/models` ohne Query erhält8MiB für
den umfangreichen Modellkatalog. An die Oberfläche gelangen weiterhin höchstens
30Modellnamen/-anzeigenamen, keine übrigen Metadaten. Auth-Metadaten und
Inferenz/SSE behalten512000Bytes; dies erhöht keine Lernantwortgrenze.
Eine Antwort gilt erst nach gültigem `response.completed` als abgeschlossen.
Ungültige Ereignisse, Abbruch, Timeout, Kontowechsel oder unvollständiger Stream
liefern keine teilweise Lernantwort. KI-API bleibt durch lokalen Host/Origin/
Marker geschützt und `no-store`; der Service Worker speichert sie nicht.

`store=false` bedeutet keine ausschließlich lokale Verarbeitung und keine
allgemeine Zusage, dass der Anbieter keinerlei Daten vorhält. Für öffentliche
Cloudanfragen gelten die Bedingungen des Anbieters und des Kontos. Für private
Unterlagen gilt weiterhin ausschließlich lokale Verarbeitung.

## Nachweise und Nutzerabnahme

Synthetische Tests prüfen Anmeldestart/Abbruch, PKCE/State, Tokenvalidierung,
Scopes, Refresh, Abmeldung, prozessübergreifende Sitzungswechsel, Datenablage,
SSE/Fehler-/Größen-/Kontingent-/Timeoutfälle und den gesperrten Privatweg.
Browserfälle prüfen die Auswahl ohne Ollama, Cloudhinweise, öffentliche Kontexte,
privates Lesen ohne KI und das Leeren privater Suchfragen beim Quellenwechsel.
Electron prüft Präferenzen über wechselnde Ports; native Laufzeitprüfungen
prüfen getrennte Profilpfade. Synthetischer DPAPI-Rundlauf im normalen
Windows-Benutzerkontext bestätigt Verschlüsselung/Entschlüsselung.

Eine echte Anmeldung mit einem berechtigten Konto und ChatGPT-Erklärungen
wurden im lokalen Webstand durch den Anwender erfolgreich bestätigt. Die
Rückmeldung bestätigt auch die gewünschte Erklärungsqualität; daraus folgt
keine allgemeine fachliche Wahrheitsgarantie. Weder echte Tokens noch private
Unterlagen wurden für die automatisierten Prüfungen verwendet. Bestehende
Installer werden durch diese Quelländerung nicht erneuert.

OPS-033-Abschluss:184Backendtests/Lint,24unterschiedliche Browser-/Electronfälle
und13Desktop-/Webruntimeprüfungen grün, Frontendbuild grün. Unabhängiger
Sicherheits-/Code-/Dokureview ohne offene konkrete Findings. Erweiterter
Electronlauf prüft beide Anbieterpräferenzen über Neustart/Portwechsel.

OPS-034-Abschluss:191Backendtests/Lint und unabhängiger Nachreview grün.
Reale Statusgegenprobe bestätigt erfolgreichen Modellkatalogabruf (bereit,
acht Modelle), ausschließlich neutrale Flags ausgegeben. Dieser Nachweis
bestätigt Verbindung/Modellliste, noch keine reale generierte Lernantwort.

OPS-035 ergänzt die bestätigte praktische Nutzerabnahme der Erklärungen und
prüft die Weitergabegrenze: Quellcode und erzeugte Pakete enthalten keine
lokale Kontoverbindung. Neue Profile beginnen ohne Konto/Token und verlangen
eigene Anmeldung samt Freigabe. Die Anbieter-Modellkennung in der Auswahl ist
kein Zugangsschlüssel und überträgt kein Abokontingent. Es existiert kein
gemeinsamer API-Schlüssel oder Rückfall auf ein Entwicklerkonto.

Beide Paketvarianten schließen local-ai/local-rag und bekannte lokale
Credential-Dateinamen ausdrücklich aus. Der Build prüft Ressourcenwurzeln,
Dateifreigaben und private Ausschlüsse vor dem Paketieren; breite Wurzeln
(gesamtes Projekt, lokale Profile) oder fehlende Sperrfilter brechen den Build
ab. Git ignoriert das Zugangsdatenverzeichnis. Die neutrale Programmlogik wird
weitergegeben, die Anmeldung bleibt im lokalen Benutzerprofil.

Das gilt für Git und die vorgesehenen Installations-/Webpakete. Ein komplettes
bereits angemeldetes Benutzerprofil ist kein Weitergabepaket. Wer dasselbe
Windows-Profil oder denselben laufenden lokalen App-Dienst verwendet, nutzt
dessen Anmeldung bis zur Abmeldung. Eine zusätzliche Mehrbenutzer-Anmeldesperre
innerhalb eines solchen gemeinsam benutzten Dienstes ist nicht implementiert.
Die Prüfung liest oder verändert keine vorhandenen Kontodaten.

OPS-035-Nachweis:193Backendtests,15Desktop-/Webruntimeprüfungen und fünf
Anbieter-Browserfälle grün; unabhängiger Nachreview ohne offene Findings.
70synthetische private Pfade mit dem tatsächlichen Paketfilter ausgeschlossen.
Dropdowns erhalten feste Vorder-/Hintergrundfarben in beiden Designs;
Options-/Select-Kontrast ohne Hover in Einstellungen und Theorie geprüft.

Offizielle Primärquellen (geprüft31.10.2026):
[Anmeldung](https://developers.openai.com/siwc/token-sharing-open-source/sign-in),
[Modelle/Responses](https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference),
[Konten/Sitzungen](https://developers.openai.com/siwc/token-sharing-open-source/profiles-and-sessions),
[aktuelle Einschränkungen](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations).
