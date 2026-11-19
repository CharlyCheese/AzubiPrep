# Lernreise – Geführter LF1-Pilot in der App

Stand: 2026-11-10 · FE-069 · R2 aus dem
[Lernreiseplan](61-Lernreise-FIAE-Planung.md)

Fortschreibung 2026-11-11: [FE-071](65-Lernreise-LF1-Ziele.md) ergänzt das zweite
LF1-Thema mit derselben Phasenfolge und getrenntem Speicher. Jetzt sind zwei
von 84 Themen verfügbar. Der folgende Prüfstand beschreibt den ursprünglichen
R2-Pilot; neue Übergangs-/Mehrthemenprüfungen stehen in der Fortschreibung.
FE-072 erweitert auf [alle sechs LF1-Themen mit Rückblick](66-Lernreise-LF1-Abschluss.md).
Auch die praktische Präsentation wird angeleitet und bewusst selbst bestätigt.
Der bisherige erste Webschlüssel und die Desktopdatei `journey.json` bleiben
unverändert. Für das zweite Thema wird separat gespeichert. Sicherungen und
bestätigter Ersatz gelten jeweils nur für den geöffneten Themenabschnitt.

## Ergebnis und Umfang

Der FIAE-Einstieg führt über **„Lernreise beginnen“** beziehungsweise
**„Lernreise fortsetzen“** zum ersten Themenabschnitt
**„Unternehmen, Kunden und die eigene Rolle“**. Grundlage ist der unabhängig
geprüfte öffentliche Inhalt aus
[CONTENT-233](62-Lernreise-LF1-Inhaltsgrundlage.md). R2 ergänzt den App-Ablauf
und die lokale Speicherung; der öffentliche Inhaltsbestand wird nicht erweitert.

Von 84 geplanten Themen ist genau dieses eine verfügbar. Der Abschluss gilt
für den ersten Themenabschnitt, weder für das gesamte LF1 noch für FIAE.
Die übrigen 83 Themen bleiben in Vorbereitung. Andere Fachrichtungen und
das bisherige freie Lernen über Module bleiben erreichbar.

Der Pilot funktioniert ohne KI und ohne Konto. Die spätere optionale
[KI-Gesprächserweiterung R3](64-Lernreise-KI-Gespraech.md) ist separat dokumentiert;
die folgenden Nachweise beziehen sich auf den festen R2-Ablauf.
Es gibt keine neuen XP, keine Übernahme in den bestehenden
Leitner-Kartenstand und keinen Kontosync der Lernreise. Es wurde kein Installer
erstellt; die technische Integration ersetzt keine neue Paketfreigabe.

## Durchgängiger Lernablauf

| Schritt | Umfang und Verhalten |
|---|---|
| Einstieg | Drei Lernziele und ein fiktiver beruflicher Fall; gespeicherten Schritt fortsetzen |
| Theorie | Vier Blöcke mit Erklärung, Beispiel, aufklappbarem Missverständnis und Merksatz; bewusstes „Gelesen – weiter“ |
| Themenquiz | Sechs fest zugeordnete Single-Choice-Fragen; Rückmeldung nach jeder abgegebenen Antwort |
| Selbstreflexion | Drei feste Impulse mit eigener Notiz, aufdeckbaren Kernpunkten, zulässigen Alternativen, Musterantwort und Nachfrage |
| Kartenrunde | Sechs Karten; Antwort erst aufdecken, dann „Gewusst“ oder „Noch üben“ markieren |
| Mini-Test | Acht separate Single-Choice-Fragen ohne Zeitlimit; Abgabe erst mit vollständigen Antworten |
| Auswertung | Gesamtergebnis, Ergebnisse je Lernziel, Begründungen und Rücksprünge zu passenden Theorieblöcken |
| Wiederholung | Theorie gezielt nachlesen oder den Mini-Test bewusst erneut beginnen; frühere Erfolge bleiben erkennbar |

Die Selbstreflexion ist ein eigener Vergleich mit festen Hilfen. Sie erzeugt
kein automatisches fachliches oder KI-basiertes Erfolgsurteil. Die Notizen sind
auf 2.000 Zeichen je Impuls begrenzt. Kartenfälligkeiten blockieren den Ablauf
nicht; der Pilot führt keine neue Leitner-Terminierung ein.

Ein Theorie-Rücksprung erhält den laufenden Lernschritt und Testversuch.
Die Antwortoptionen werden beim Anlegen des Reisestands gemischt; ihre
gespeicherte Reihenfolge bleibt beim Fortsetzen erhalten. Ausgewertete Antworten
beziehen sich auf die ursprünglichen Antwortbuchstaben.

Alle acht Testfragen zählen gleich. Die interne Schwelle beträgt 80 %:
**6/8 = 75 % und nicht bestanden; 7/8 = 87,5 % und bestanden.**
Wiederholungen verwenden denselben kleinen geprüften Fragenpool. Sie sind
keine unabhängige neue Prüfungsform und kein Nachweis vollständiger Prüfungsreife.

## Inhalts- und Auswertungsvertrag

Der Backend-Loader liest ausschließlich die feste erste Plan-, Themen- und
Fragenfassung unter dem konfigurierten öffentlichen `contentDir`. Er importiert
keine App-Konfiguration oder Prüfscripts und benötigt weder Datenbank noch KI.
Die Referenzpfade, Inhalte, Poolgrößen, Lernziele und Theorieverbindungen werden
vor Freigabe geprüft. Unzulässige Dateiverweise und Verknüpfungen werden
abgewiesen. Fehlende oder fehlerhafte Pilotinhalte führen zu einem neutralen
Journey-Fehler; das übrige Modullernen bleibt startbar.

| Route | Zweck |
|---|---|
| `GET /api/journey/fiae` | Planversion, 84 geplante Themen, verfügbarer Pilot und Umfang je Lernfeld |
| `GET /api/journey/fiae/topics/common-lf1-role` | Öffentliche Lerninhalte mit sechs Quiz- und acht Testfragen |
| `POST /api/journey/fiae/topics/common-lf1-role/check` | Eine Quizantwort gegen die genaue Inhaltsversion prüfen |
| `POST /api/journey/fiae/topics/common-lf1-role/evaluate` | Vollständigen Testversuch mit Versuch-ID deterministisch auswerten |

Die anfänglichen Fragenobjekte enthalten Frage und Antwortoptionen, keine
richtige Antwort oder Erklärung. Feste Reflexionshilfen und Kartenrückseiten
sind absichtlich Teil des Lerninhalts; die Oberfläche zeigt sie erst nach
Aufklappen. Öffentliche Antworten werden über ausdrückliche Feldlisten erstellt.

Eine Auswertung verlangt genau acht eindeutige Fragen des Testpools und jeweils
einen unveränderten Antwortbuchstaben `a` bis `d`. Fremde, doppelte oder fehlende
IDs, zusätzliche unbekannte Eingabefelder und ungültige Antworten werden vor
jeder Wertung abgelehnt. Ergebnisse folgen immer der Inhaltsreihenfolge.
Identische Wiederholungsanfragen liefern identische Ergebnisse und speichern
serverseitig nichts.

Ungültige Eingaben liefern 400, eine abweichende Inhaltsversion 409,
unverfügbare Themen 404 und nicht verfügbare Pilotinhalte 503. Fehlermeldungen
geben keine lokalen Pfade aus. Die Journey-Antworten tragen `Cache-Control:
no-store`; der Service Worker nimmt diese Routen vom API-Cache aus.

## Lokaler Fortschritt und Fortsetzung

Der Reisestand ist unabhängig von den bisherigen Quiz-, Karten- und
Prüfungsstores. Er enthält Format-, Plan- und Themenversion, Speicherrevision,
Phase und Position, bestätigte Schritte, Antworten, Reflexionsnotizen,
Kartenbewertungen, Optionsreihenfolge und den aktuellen Testversuch. Bis zu
zehn Testzusammenfassungen sowie die beste Zusammenfassung bleiben erhalten.
Ein später schlechterer Versuch entfernt einen früheren Erfolg nicht.

Im Browser liegt der Stand unter `azubiprep.journey.fiae.v1` im lokalen Speicher
des jeweiligen Browserprofils und Ursprungs. Schreibvorgänge verwenden Web Locks
und einen Revisionsvergleich gegen parallele Tabs. Fehlt diese Sperrfunktion,
wird eine sichtbare Speichermeldung ausgegeben; Fortschritt wird nicht bestätigt.
Reisestand und Sicherungsdatei sind jeweils auf 128 KiB begrenzt.

Electron nutzt dieselbe fachliche Prüfung, speichert aber über eine begrenzte
Schnittstelle im App-Profil unter `lernreise-v1/journey.json`. Der Speicher ist
vom wechselnden lokalen Serverport unabhängig. Vorgänge eines Profils werden
nacheinander ausgeführt und prüfen den erwarteten Originalstand. Eine neue
Datei ersetzt den bisherigen Stand erst nach vollständigem Schreiben.
Eine profilbezogene Electron-Instanzsperre verhindert einen zweiten schreibenden
App-Prozess; ein weiterer Start aktiviert das vorhandene Fenster. Verschiedene
Profile dürfen parallel laufen. Auch mehrere Speicherobjekte desselben Prozesses
teilen eine Warteschlange für den aufgelösten Profilordner.

Fortschrittsmeldungen und Schrittwechsel erfolgen erst nach bestätigter
Speicherung. Aktuelle Eingaben bleiben währenddessen sichtbar. Insbesondere
kann in einer Reflexionsnotiz während ausstehender Speichervorgänge weitergetippt
werden; die Schreibfolge erhält den jüngsten Entwurf. Während der bestätigten
Sicherungsübernahme und anderer ersetzender Speicheraktionen ist die Bearbeitung
gesperrt.

Bei Speicherfehlern bleibt der bisher bestätigte Stand erhalten und die
aktuelle Eingabe in der Ansicht verfügbar. Die Oberfläche bietet erneutes
Speichern, Sicherung oder bewusstes Laden des gespeicherten Stands an.
Letzteres verwirft ungesicherte Änderungen erst nach dem ausdrücklichen
Bedienhinweis. Änderungen aus einem anderen Tab werden als Konflikt angezeigt,
nicht still überschrieben.

## Sicherung, Import und Versionskonflikte

„Lernreise sichern“ exportiert einen geprüften, begrenzten JSON-Reisestand.
Beim Import werden Format, Versionen, Feldlisten, erlaubte IDs, Reihenfolge,
Antworten und Ergebniszusammenhänge geprüft. Eine Vorschau nennt Abschnitt,
Phase und Zahl gespeicherter Testversuche. Erst **„Diesen Reisestand ersetzen“**
übernimmt die Sicherung; zuvor erfolgt kein Ersatz.

Die Bestätigung ersetzt den Reisestand dieses Profils. Eine erneute Prüfung
des Originalstands verhindert, dass zwischen Vorschau und Übernahme erfolgte
Änderungen eines anderen Fensters verloren gehen. Andere Lernbereiche werden
nicht in diese Sicherung aufgenommen.

Ein beschädigter oder neuerer Altstand wird beim Laden nicht gelöscht oder
automatisch zurückgesetzt. Soweit lesbar, lässt sich sein unveränderter
Originaltext separat sichern. Ein neuer Stand kann vorbereitet werden und
benötigt denselben bestätigten Ersatz. Unbekannte Inhaltsversionen werden nicht
stillschweigend migriert; R2 enthält noch keine allgemeine Inhaltsmigration.

## Verbindungs- und Herkunftsgrenzen

Ohne Konto nutzbar bedeutet nicht ohne erreichbaren App-Dienst. Quizprüfung
und Testauswertung benötigen eine Verbindung zum Backend. Die Desktop-App
stellt diesen Dienst lokal bereit. Für die Web-App gibt es keine Offline-
Auswertung und keinen Rückgriff auf veraltete Journey-API-Antworten. Bei einem
Verbindungsfehler bleiben Antworten erhalten; erneute Abgabe verwendet dieselbe
Versuch-ID. Der Fehler erzeugt keinen erfolgreichen Abschluss.

Der Pilot verwendet ausschließlich die öffentlichen Inhalte aus CONTENT-233.
Private Unterlagen, lokale RAG-Bestände und persönliche Kontodaten werden weder
als Quelle gelesen noch in den Reisestand übernommen. Es gibt keine KI-Aufrufe
und keinen Versand von Reflexionsnotizen an Kontosync oder Modellanbieter.
Die Sicherung enthält die eigenen lokalen Reflexionsnotizen als Teil des
Reisestands.

## Prüfstand und Grenzen der Abnahme

Geprüft unter Windows mit Chromium und echter Electron-Laufzeit, mit isolierten
Testprofilen und öffentlichen Pilotdaten:

| Prüfung | Nachweis |
|---|---|
| Backend | 273 Tests grün, davon 62 Journey-Fälle: öffentliche DTOs, Pools, Versionen, vollständige Auswertung, Lernziele, Wiederholbarkeit und fehlerhafte Inhalte |
| Reisestand/Inhalte | 14 Zustands- und Speichertests plus 72 bestehende Inhaltsvertragstests grün |
| Desktop | 33 Tests grün: Profilablage, Zugriffsschutz, atomare Speicherung, zwei Speicherobjekte, Quellenhosts und echte profilbezogene Mehrprozesssperre |
| Playwright | Zehn Journey-Fälle: vollständiger Ablauf, 6/8 und 7/8, Speicherausfall, Konflikte, Sicherungsübernahme, Versionsfehler, Verbindungsfehler, doppelte Abgabe, Bedienung und echter Desktop-Neustart |
| Bestehender Modulfortschritt | Fünf Regressionen grün; freie Module, Quiz- und Prüfungsfortschritt bleiben nutzbar |
| Frontend | Produktions-Build grün; bestehender Hinweis auf große Codepakete bleibt |

Die automatisierten Backend-/Reisestandprüfungen verwenden den öffentlichen
Pilot und isolierte Testdaten. Private Quellen oder produktive Konten sind
keine Testvoraussetzung. Der Desktop wurde vollständig beendet und mit demselben
Profil erneut gestartet; der gespeicherte Schritt blieb erhalten. Eine separate
Probe mit vier echten Electron-Prozessen bestätigt die Sperre desselben Profils,
parallel nutzbare andere Profile und erneute Freigabe nach Beenden.

Die Bedienprobe umfasst 390 Pixel Ansichtsbreite, Tastaturaktivierung mit
anschließendem Überschriftenfokus und 200 % CSS-Darstellungszoom bei 1.280 Pixeln.
Es trat kein horizontaler Überlauf auf; die Weiter-Aktion blieb erreichbar.
Die erzeugten Ansichten wurden visuell geprüft. CSS-Darstellungszoom ist kein
Nachweis für jeden nativen Browserzoom, Bildschirmleser oder jedes Mobilgerät.

Zwei frische unabhängige Reviews prüften Oberfläche/Zustand sowie
Backend/Desktop-Grenzen. Gefundene Randfälle sind behoben: Fortschritt erst nach
Speicherbestätigung, Eingabesperre bei Sicherungsübernahme, behandelbare leere
Altstände, Desktop-Quellenhosts und profilweiter Schreibschutz. Gegenproben
decken diese Korrekturen ab. Es wurde keine vollständige erneute Debugger-
Gesamtabnahme und kein neuer Installerbau durchgeführt.

Die optionale Lernbegleitung ergänzt R3 in [FE-070](64-Lernreise-KI-Gespraech.md);
R4 folgt mit weiteren geprüften allgemeinen Themen. Weder der kleine Pilot noch sein
technischer Testumfang belegt bereits eine vollständige FIAE-Lernreise.
