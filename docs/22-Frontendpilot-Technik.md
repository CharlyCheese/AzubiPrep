# Technische Festlegungen des Frontendpiloten

Stand: 30.10.2026, erster Webprototyp in FE-022 implementiert. Nach OPS-023
sind 30/30 Kriterien innerhalb der dokumentierten Windows-/Chromium-/Electron-
Matrix abgenommen. Desktop 0.1.3 ist gebaut und geprüft; Grenzen siehe unten.

## Einstieg und implementierter Umfang

Navigation „Frontend-Werkstatt“, Route `/frontendkurs`. Elf Lektionen über die
Kapitel 1–6 führen von HTML-Grundlagen über zweite Seite/Bild/semantische Struktur
zu externer CSS, Klassen, Wiederholung, Transfer und Informationswebsite.
Dateireiter, Dateianlage/-entfernung, bewusster Ordner-/Dateiimport, Startseitenwahl,
Vorschau, Inspektor mit Tastaturauswahl, Validator, Hilfen, Musterlösungen und
standbezogene Bewertungsmeldungen sind im lokalen Webstand vorhanden.
Export als JSON-Dateisicherung und unkomprimiertes ZIP für den eigenen Editor.
Keine neuen Bibliotheken, kein Lern-JavaScript, kein Qwen/PDF-Import.

## Speicher und Import

Projekttexte und Bilder werden im Origin Private File System (OPFS) der
jeweiligen Browserherkunft abgelegt, niemals in localStorage. Browserdaten-
Löschung entfernt auch diese Entwürfe; deshalb ist Projektexport vorgesehen.
Private Browserprofile oder fehlendes OPFS erhalten eine sichtbare Fehlermeldung
und können im Arbeitsspeicher weiterarbeiten/exportieren. Als Ausgangsmatrix
gelten moderne Chromium-/Firefox-Versionen mit OPFS unter localhost/HTTPS.
Nur tatsächlich getestete Versionen werden später als verifiziert geführt.

Schema 1 enthält Aufgaben-/Kursversion, Dateien, Abgabestand, Hilfen,
Musterlösungsaufrufe, Prüfergebnisse und offene Bewertungsmeldungen.
Zuerst neuen Snapshot vollständig schreiben, danach den HEAD-Verweis wechseln;
der vorige Snapshot bleibt zur Wiederherstellung erhalten. Schreibzugriffe
werden serialisiert. Fremde/neue Schemaversionen werden nicht überschrieben.
Eine Aktualisierung der Kursversion migriert keine bestehenden Leistungswerte
still, sondern erhält deren historischen Bezug. Speichergrenzen pro Projekt:
50 Dateien, 2 MiB je Datei, 10 MiB gesamt, Tiefe höchstens 8 Verzeichnisse;
HTML/CSS-Text höchstens 128 KiB pro Datei. Bilder höchstens 4096 Pixel je Seite
und 16 Millionen Pixel insgesamt pro Projekt, vor Darstellung anhand der
Formatköpfe geprüft. Zusätzlich gilt für den gesamten serialisierten Kursstand
eine Grenze von 32 MiB einschließlich zuletzt geprüfter Abgaben. Diese Grenze
ist in der Oberfläche ausgewiesen; mehrere große Bildprojekte können sie trotz
Einhaltung der Einzelprojektgrenzen erreichen. Der Speichervorgang schlägt dann
sichtbar fehl, erhält den vorigen Stand und lässt den Dateiexport zu. Vor breitem
Kursausbau ist eine Aufteilung großer Projekte/Medien erforderlich.
Bis zu zwei lokale Snapshots zuzüglich temporärer Schreibdatei; Browserquoten
bleiben zusätzlich wirksam. JSON-Sicherungen enthalten Dateien und gewählte
Startseite; Bewertungsmeldungen exportieren den tatsächlich geprüften Dateistand.

Import ist explizit, liest nur vom Benutzer ausgewählte Dateien und erhält
relative Pfade. Kein rekursives Lesen beliebiger Betriebssystempfade, keine
Projekt-Skripte und keine Entpackung fremder Archive. JSON-Projektimporte werden
genauso validiert wie Dateiimporte. Erlaubt: HTML, CSS, PNG, JPEG, WebP; Bilder
mit passender Signatur und Größenbegrenzung. `.git`, `.env*`, node_modules und
local-rag werden ausgeschlossen. Absolute Pfade, Backslashes, Traversal,
doppelte Pfade und Ordner außerhalb der Freigabe werden abgewiesen.
Browserauswahl liefert Datei-Snapshots statt Pfade mit Leserechten; eine
native rekursive Desktop-Importbrücke ist nicht Bestandteil dieses Ansatzes.

## Vorschau und Prüfung

Lerntexte werden in einem inerten Template analysiert und über positive
Tag-/Attributlisten neu aufgebaut. Keine direkte HTML-Übernahme in die App.
CSSOM liest Styles ohne Anhängen fremder Stylesheets; nur freigegebene
Deklarationen ohne Ressourcenbezüge werden verwendet. Knoten-/Regel-/Textlimits
begrenzen die Vorschau. Der iframe erlaubt Herkunftszugriff ausschließlich für
den vertrauenswürdigen Inspektor, keine Skripte/Forms/Pop-ups/Downloads.
Zusätzliche Vorschau-CSP verweigert Skripte, Netzwerk und Frames. Linkziele
werden als Daten behandelt und nur zu eingereichten HTML-Seiten vermittelt.
Nicht unterstützte Techniken werden gemeldet, statt still als korrekt bewertet.

Validatoren prüfen Aufgabenanforderungen am Originaltext/inerten DOM und
eindeutigen relativen Pfaden. Ergebnisse nennen Regel-, Aufgaben- und Abgabestand.
Keine vollständige HTML-/CSS-Standardvalidierung und kein Zertifizierungsanspruch.
Style-/Elementinspektor liest nur den rekonstruierten Vorschauinhalt.

## Desktop und Freigabe

Die vorhandenen Installer 0.1.2 enthalten diesen Pilot noch nicht. Electron-
Version, Vorschauwerkzeuge, nativer Dialog und persistente Herkunft sind vor
Desktopfreigabe gesondert zu prüfen. Insbesondere nutzt die bisherige
Desktophülle einen zufälligen Backendport: OPFS ist herkunftsgebunden, deshalb
ist eine verlässliche Desktop-Wiederherstellung ohne zusätzliche Architektur-
entscheidung nicht zugesagt. Vorhandene Lernstände werden nicht auf einen
anderen Ursprung verschoben. Der erste Implementierungsschritt wird zunächst
auf der lokalen Webversion mit stabiler Herkunft geprüft. Offene Kriterien
verhindern die vollständige Web-/Desktop-Pilotfreigabe.

## Nachweise des Webstands

Stand: `pilot-1.0`, `pilot-rules-1.0`, gebaute App `index-Dr7DjykK.js`.
Verifiziert: Windows, Playwright Chromium 153.0.8010.12, localhost/127.0.0.1
mit stabiler Herkunft und isolierten Testprofilen. Kein Firefox-/Safari-/Edge-
oder Desktop-Release-Nachweis. Projektdateien werden nur lokal gelesen;
Tests verwenden keine realen Lernstände, privaten PDFs oder Datenbankänderungen.

- Frontend-Build erfolgreich; Service-Worker-App-Shell auf v4 aktualisiert.
- `node --test frontend/test/pilot-project.test.js frontend/test/modulStatus.test.js`:
  13 bestanden, davon sechs Pilotprüfungen und sieben bestehende Fortschrittsprüfungen.
- `npx --no-install playwright test tests/frontendpilot.spec.js --workers=1`
  in `e2e`: 14 bestanden. Zusätzlicher gezielter Nachlauf der erweiterten
  Groß-/Kleinschreibungsprüfung bestanden.
- Bestehende fünf Browser-Fortschrittsregressionen ebenfalls bestanden;
  insgesamt 20 Pilotfälle und zwölf bestehende Regressionen grün.
- Alle elf Musterlösungen und gültige Alternativen bestehen, zwei typische
  fehlerhafte Varianten je Lektion werden erkannt. Zusätzliche Nachweise für
  unquotierte HTML-Attribute, Schriftvererbung, echte Klassenselektoren, freie
  Startseiten, falsche Pfade und tatsächliche Fehlerdateien.
- Echter Ordnerimport mit verschachtelten Dateien; Quelltextvergleich bestätigt
  unveränderte Originale und Ausschluss der Test-.env. ZIP durch unabhängigen
  Python-ZIP-Leser einschließlich CRC, UTF-8-Pfaden und Dateiinhalten geprüft.
- Browserneustart mit persistentem isoliertem Profil erhält den letzten
  gesicherten Entwurf. Simulierter Schreibfehler, 32-MiB-Kursgrenze und fremde
  Speicherversion erhalten den vorigen Stand beziehungsweise verhindern
  Überschreiben; Export bleibt möglich.
- Vorschauversuche mit Skripten, Ereignisattributen, Meta-Weiterleitung, Frames,
  externen Bildern/CSS und Fremdlinks erzeugen weder Skriptausführung noch freie
  Netzwerkanfragen oder neue Fenster. Überkomplexität wird abgefangen; der
  Entwurf bleibt bearbeitbar und die Vorschau nach Korrektur benutzbar.
- Oberfläche bei 1366×768 und 683×384 aufgenommen und visuell kontrolliert.
  Dies ersetzt keinen tatsächlichen 200%-Browserzoom oder vollständigen
  manuellen Tastatur-/Verständlichkeitsdurchlauf.
- Frischer unabhängiger Inhalts-/Code-/Sicherheitsreview durch `fe022_review`:
  neun konkrete Findings korrigiert, Nachreview ohne weitere blockierende
  Code-Findings. Quellenabgleich sämtlicher elf Lektionen gegen SELFHTML/MDN
  am 30.10.2026 bestätigt. Kein allgemeiner Ausbruchbeweis.

Offen bleiben P2.4, P4.3, P4.6 und P5.1–P5.4 in der
[Pilotabnahme](21-Frontendpilot-Abnahme.md): vollständige Plattform-/Desktop-
Matrix, Windows-Dateiverknüpfungen, Desktop-Sicherheit/persistenter Speicher,
echter Zoom, manuelle Tastaturbedienung und unabhängiger praktischer Durchlauf.
Bestehende Installer wurden nicht neu gebaut und enthalten die Werkstatt nicht.

## Korrekturen nach erstem praktischen Feedback

FE-023, 30.10.2026, Webbuild `index-Bzhwj9i2.js`, App-Shell v5:

- „Dateien auswählen“ ergänzt oder aktualisiert einzelne Dateien. Andere
  Dateien bleiben erhalten; gleiche Pfade werden nur nach Bestätigung ersetzt.
  CSS/Bilder dürfen separat ohne eigene HTML-Datei eingelesen werden. Das
  zusammengeführte Projekt wird vor jeder Änderung vollständig validiert;
  Überschreitung oder Abbruch erhalten den bisherigen Stand.
- Ordner-/JSON-Übernahme ersetzt weiterhin ausdrücklich nach Bestätigung den
  ganzen Aufgabenentwurf. Ein Hinweis erklärt, dass der native Ordnerdialog
  nur Ordner anzeigt; nach Bestätigung erscheinen Dateien im App-Dateibaum.
  Übernommene und übersprungene Dateien werden gezählt.
- Private und nicht unterstützte Dateitypen werden vor dem Lesen übersprungen,
  private Auswahlwurzeln ebenfalls vor Entfernen ihres Namens. Höchstens 5000
  ausgewählte Einträge werden betrachtet, davon höchstens 50 unterstützte Dateien
  übernommen; bestehende Projektgrößen- und Inhaltsschranken bleiben wirksam.
- Ordner-, Datei- und Sicherungsauswahl verwenden das App-Buttondesign mit
  mindestens 44 Pixel Höhe und sichtbarem Tastaturfokus. Native Auswahldialoge
  bleiben erhalten, Originaldateien werden nicht verändert.
- Die Einführung enthält die Werkstatt als vierten von fünf Schritten mit
  Route `/frontendkurs`. „Einstellungen → Kurze Tour erneut anzeigen“ startet
  sie erneut. Bereits gesehene Touren werden nicht automatisch zurückgesetzt.
  Direkteinstieg ohne früheren Landing-Besuch bricht die Tour nicht mehr ab.

Nachweise: sieben Node-Projekttests, 17 Playwright-Pilotfälle, Frontendbuild,
visuelle Kontrolle der Auswahlknöpfe einschließlich Fokus. Ein zusätzlich im
frischen Review gefundener Privatwurzelfall wurde korrigiert und abgesichert.
Nachreview `fe023_review` ohne offene Findings. Kein neuer Installer.
Der praktische Nutzerdurchlauf ist begonnen; eine vollständige Bestätigung
der offenen Abnahmekriterien nach erneuter Nutzung steht weiterhin aus.

## Präzisierte Lernzielrückmeldung für p und pre

FE-024, 30.10.2026, Webbuild `index-CglBi8Pu.js`, Prüfer
`pilot-rules-1.0.1`: Erste Aufgabe verlangt ausdrücklich h1 und p.
Ein pre-Element ist weiterhin in der Vorschau zulässig; vorformatierte Verse
behalten Zeilenumbrüche/Leerzeichen. Fehlt p, erklärt die Rückmeldung den
Unterschied und bezeichnet ausschließlich das Absatzlernziel als offen.
Sie behauptet keinen allgemeinen Syntaxfehler oder eine vollständige
HTML-Validierung. p und pre können zusammen verwendet werden.

Erfüllte Regeln zeigen nun Erfolgstexte; zuvor wurde auch bei Erfolg der
zugehörige Fehlersatz angezeigt. Die Prüferversion wurde als Rückmeldungspatch
erhöht. Historische Ergebnisse bleiben erhalten und werden nicht still
umgeschrieben; für aktuelle Rückmeldungen neu prüfen. Die Absatzanforderung
selbst wurde nicht verändert.

Drei gezielte Browserprüfungen bestanden: sämtliche elf Musterlösungen mit
Alternativen/Fehlerfällen, bestehende freie HTML-/CSS-Varianten und neuer
Versfall einschließlich exakter Leerzeichen, Vorschau und erfolgreichem p+pre.
Frischer unabhängiger Fach-/Codereview `fe024_review` freigegeben. Referenzen:
[MDN p](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/p)
und [MDN pre](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre),
geprüft 30.10.2026. Restabnahme und Desktopfreigabe unverändert offen.

## Bestätigte praktische Webprüfung

OPS-022, 30.10.2026: Der Anwender bestätigt ausdrücklich alle vier angefragten
Praxisprüfungen als funktionierend: 200-Prozent-Browserzoom mit erreichbaren
Bedienelementen, Tastatur/Fokus/Ausstieg aus dem Editor, Wiederherstellung nach
vollständigem Browserneustart und Mehrdatei-Sicherungsrundlauf einschließlich
Seitenwechsel/Darstellung. Dies ist ein berichteter Anwendernachweis; genaue
Browser-, Build- und Hardwaredaten wurden dabei nicht separat angegeben.

Ergänzend wurde ein neuer zusammenhängender Playwright-Fall mit frischem
persistentem Chromium-Profil ausgeführt: Erklärung, zweite Datei im Editor,
externer Projektimport, fehlerhafter Link, verständliche Prüfmeldung, Korrektur,
erfolgreiche erneute Prüfung, bestätigte Sicherung, vollständiger Browserneustart
und Export beider Dateien. Der Fall ist bestanden, Modellanfragen wurden nicht
ausgelöst. Verwendeter Webbuild index-CglBi8Pu.js, Prüfer pilot-rules-1.0.1.
Programmlogik und bestehende Entwürfe wurden in OPS-022 nicht verändert.

Damit sind P5.1–P5.4 im dokumentierten Webumfang nachgewiesen; insgesamt 27/30.
Offen bleiben P2.4, P4.3 und P4.6: zusätzliche Plattform-/Browsermatrix,
Windows-Dateiverknüpfungen und native Desktop-Sicherheits-/Speicherfreigabe.
Historische offene Angaben in den vorherigen Prüfständen werden durch diesen
Nachtrag für die vier Web-Praxiskriterien fortgeschrieben. Keine Desktopfreigabe,
keine allgemeine Barrierefreiheitszertifizierung und keine Abnahme des späteren
vollständigen Kurses.

## Desktopabschluss OPS-023

OPS-023 ergänzt die historischen Prüfstände oben: P2.4, P4.3 und P4.6 sind
innerhalb der folgenden Matrix abgeschlossen. Der Kurs bleibt bei elf
HTML-/CSS-Lektionen der Kapitel 1–6; Lern-JavaScript, Qwen und PDF-Verarbeitung
sind weiterhin nicht implementiert.

| Oberfläche | Geprüfter Stand | Geltungsbereich |
|---|---|---|
| Lokale Webversion | Frontend index-MLie1uVL.js, Chromium 153.0.8010.12 | Windows 10.0.19045 x64, OPFS, Datei-/Ordnerimport |
| Desktop Entwicklung und gepackte App | 0.1.3, Electron 45.2.0, Chromium 156.0.8078.49, Node 24.22.1 | Derselbe Windowsrechner, jeweils isolierte Testprofile |

### Native Auswahl und Speicherung

`preload.cjs` stellt nur versionierte Methoden für Kursstand laden/sichern,
Projekt auswählen und Vorschau untersuchen bereit. IPC nimmt ausschließlich
Hauptfenster, Hauptframe und aktuelle App-Herkunft an. Ein Renderer kann keine
Dateisystempfade zum Lesen/Speichern angeben: Erst der native Dialog gibt die
ausgewählten Dateien frei. Ein eingegebener relativer Pfad ordnet lediglich
bereits eingelesene Dateiinhalte im Projekt zu.

Der native Import prüft auch die ursprüngliche Auswahl einschließlich ihrer
Vorfahren, private Pfadsegmente, lstat/realpath, gemeinsame Wurzel, Dateityp,
Größe, Anzahl und Tiefe. Symlinks/Junctions werden abgewiesen. Dateilesevorgänge
sind begrenzt; geöffnetes Dateiobjekt und kanonischer Pfad werden erneut geprüft.
Private `.env*`, `.git`, `node_modules` und `local-rag` werden ausgeschlossen.
Text höchstens 128 KiB, Bilddatei höchstens 2 MiB, Projekt höchstens 50 Dateien/
10 MiB, acht Unterordnerebenen und höchstens 5000 untersuchte Einträge.
Bildsignaturen und Pixelgrenzen validiert zusätzlich dieselbe Frontendlogik.
Import schreibt nicht in externe Projektdateien. Einzeldateien ergänzen;
Kollisionen und vollständiger Ordnerersatz werden bestätigt.

Nur Desktop-Kursprojekte verwenden `<App-Profil>/frontendpilot-v1` mit
a/b-Snapshots, atomarem HEAD-Wechsel und 32-MiB-Grenze. Die interne Backendadresse
darf weiter wechseln. Browser bleibt OPFS; bestehender Quizspeicher wird nicht
migriert. Bei unbekannten oder beschädigten Daten wird automatisches Überschreiben
verhindert; Export bleibt möglich. Injektion eines Fehlers beim HEAD-Rename
weist nach: der zuvor bestätigte Snapshot ist auch aus neuer Speicherinstanz
unverändert lesbar. Überschrittene Speichergrenze und unbekanntes Schema werden
ebenfalls ohne Überschreiben zurückgewiesen.

### F12 und Abschirmung

Die Hauptanwendung verwendet Sandbox, Context Isolation und Web Security,
ohne Node Integration und ohne allgemeine DevTools. F12/Ctrl+Shift+I und die
Schaltfläche in der Vorschau öffnen eine gesonderte Vorschaukopie. Diese
verwendet eine eigene flüchtige Session und `azubi-preview://project/`, ohne
Preload, Speicherbrücke oder Node. CSP sowohl im Dokument als auch im
Protokollheader sperrt Skripte, Verbindungen, Frames, Formulare und externe
Ressourcen; eine zusätzliche Session-Sperre verhindert Netzwerkanfragen.
Popups, Downloads und Navigation sind gesperrt; Berechtigungen werden abgelehnt.
Nur die Entwicklerwerkzeuge dieser Kopie öffnen sich. Änderungen darin ändern
keine Projektdateien. Beim erneuten Öffnen wird die vorige Vorschau geschlossen;
beim Schließen wird ihr HTML-bindender Protokollhandler entfernt. Der vorhandene
eingebaute Elementinspektor bleibt nutzbar.

Der Bilddatenumfang einer erzeugten Vorschauseite wird auf 15 MiB begrenzt,
damit viele Referenzen auf dasselbe Bild keinen unbegrenzten HTML-Text erzeugen.
Die IPC-Vorschauannahme ist zusätzlich auf 20 MiB begrenzt.
Browser-F12 gehört dagegen dem Browser und untersucht dessen gewählten Kontext.
Diese Maßnahmen sind keine absolute Ausbruchsgarantie und geben keinen späteren
aktiven JavaScript-Unterricht frei.

### Prüfungen und Nachweisgrenzen

- 8 native/Pakettests: echte NTFS-Junction einschließlich Auswahl eines
  Unterordners darunter, Dateisymlink-Abweisung, private Wurzel/Namen,
  Größen, Speicher/Fehler/Schema, IPC-Absender und Paketmetadaten.
- 3 vorhandene Webpakettests weiterhin bestanden; 7 gemeinsame Projektmodultests
  bestanden. 19 bestehende Webregressionen und ein neuer Bildbudgettest bestanden.
- 4 Electron-/Junction-End-to-End-Fälle bestanden: native Auswahlbrücke mit
  Mehrdateien/Bild/CSS/Leerzeichen/Abbruch/Ergänzen/Kollisionen; vollständiger
  Neustart mit anderer Herkunft und erhaltenen Dateien; reale ausbrechende
  Windows-Junction/Übergröße ohne Entwurfsersatz; isoliertes F12 sowie
  Chromium-Ordnerimport. Die Entwicklungsversion und die gepackte App wurden
  ausgeführt. Am endgültigen Paket zusätzlich aktueller HTML-/CSS-Entwurf,
  entfernte Skripte und dreimaliges Inspect mit geändertem drittem Stand geprüft.
- Im gepackten Hauptfenster scheitert auch ein ausdrücklicher DevTools-Aufruf;
  in der Vorschau sind `require`, `process` und `azubiDesktop` nicht vorhanden.
  Ollama-/Netzwerkanfrage, Skriptausführung, Datei-/Fremdnavigation und Popups
  scheitern. Eine zusätzliche reale Berechtigungsabfrage meldet Geolocation
  `denied`. App-Inhalt und native committed URL bleiben erhalten; Chromium/CDP
  kann nach verhinderter Navigation vorübergehend eine leere Debugger-URL melden.
- **OS-Dialogantwort automatisiert ersetzt:** Die Electron-Tests ersetzen nur
  `dialog.showOpenDialog`-Antworten. Echter IPC, Dateilesen, Validierung, UI und
  Profil sind aktiv. Dies belegt Aufruf/Modus/Weiterverarbeitung, nicht manuelle
  Windows-Dialogbedienung. Computer Use konnte wegen
  `failed to write kernel assets … os error 3` nicht starten.
- **Dateisymlink-Nachweis begrenzt:** Das Testkonto darf echte Dateisymlinks nicht
  erzeugen (EPERM). Deren lstat-Erkennung ist ausdrücklich gemockt. Dagegen sind
  NTFS-Junctions tatsächlich angelegt: native Abweisung, direkte Auswahl und
  Unterordner darunter geprüft; Chromium 153 lässt deren ausbrechende Dateien
  bei Ordnerauswahl weg. Keine Übertragung dieses Browserverhaltens auf andere
  Browser oder auf eine absichtliche separate Freigabe der Zieldatei.
- Andere Betriebssysteme/Browser/Windowsversionen, eine frische Windowsinstallation
  und manuelle NSIS-Installation sind nicht mit diesem Lauf abgenommen.
  Die bisherigen berichteten Web-Praxisprüfungen bleiben getrennte Nachweise.

### Paket und Review

Desktop-Installer: `Installer/AzubiPrep Setup 0.1.3.exe` (136619556 Bytes).
SHA256: `FECB767261F1118EDF7C0FB3E4B34D4D137D9DCBB7F301543E6252DAD74DC9D3`.
Runtime ist tatsächlich gepackt (`isPackaged=true`); Health bestätigt 7000
Fragen, 26 Module, vier Fachrichtungen und null Inhaltswarnungen. Ressourcen
einschließlich Backend-Bibliotheken und app.asar geprüft: keine `.env*`- oder
`local-rag`-Pfade; die vier nativen Quelldateien stimmen byteweise überein.
Der Installer bleibt unsigniert; Webpakete 0.1.2 wurden nicht neu gebaut.

Electron wurde auf 45.2.0 und der bestehende Paketbauer auf 26.18.0 aktualisiert,
ohne neue Bibliothek einzuführen. `npm audit` für desktop meldet danach null
bekannte Schwachstellen (kein pauschaler Auditnachweis für alle Projektbereiche).
Builder 26 überspringt `node_modules` als Unterordner einer Ressourcenwurzel;
deshalb hat `backend/node_modules` eine eigene, ebenfalls .env-gefilterte
Kopierwurzel. Der erste fehlerhafte Paketstart wurde damit korrigiert und die
tatsächliche gepackte App erneut erfolgreich geprüft.

Offizielle Grundlage: [Electron Stable Releases](https://releases.electronjs.org/?channel=stable),
[Sicherheitsleitfaden](https://www.electronjs.org/docs/latest/tutorial/security),
[WebContents](https://www.electronjs.org/docs/latest/api/web-contents).
Version zusätzlich über npm und gestartete Runtime verifiziert, 30.10.2026.
Frischer unabhängiger Review `ops023_review`: native Grenzen, HEAD-Schreibfehler,
IPC-/Fenster-/Session-Isolation und Paketkopierkorrektur geprüft; keine
blockierenden Findings. Die automatisierten Nachweisgrenzen bleiben Bestandteil
der Freigabe. Historische 23/30- und 27/30-Angaben oben beschreiben frühere Stände.
