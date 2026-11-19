# Lernreise – Optionale KI-Gespräche und Theoriehilfe

Stand: 2026-11-10 · FE-070 · R3 aus dem
[Lernreiseplan](61-Lernreise-FIAE-Planung.md)

## Umfang und Bedienung

Der erste LF1-Abschnitt erhält zwei aufklappbare Ergänzungen:

- **Optional: Erklärung mit KI** unter jedem Theorieblock. Die Erklärung bleibt
  auf dessen Inhalte und Lernziele begrenzt; eigene Rückfragen sind möglich.
- **Optional: KI-Fachgespräch** bei jeder der drei festen Reflexionsfragen.
  Die Runde beginnt mit der geprüften Frage. Die KI bespricht eigene Antworten,
  berücksichtigt gleichwertige Formulierungen und stellt passende Rückfragen.

Die Auswahl ohne KI / lokales Qwen / eigenes ChatGPT-Konto stammt aus den
bestehenden Einstellungen. Aufklappen allein startet keine Modellanfrage.
„KI-Gespräch beginnen“ eröffnet eine begrenzte Sitzung, „Antwort senden“
fordert ausdrücklich eine Rückmeldung an. Bei ChatGPT wird zusätzlich die
Freigabe des öffentlichen Lernkontexts und der eingegebenen Antworten verlangt.
„Gesendeten Lernkontext ansehen“ zeigt die zugeordneten Lernziele und den
gemeinsamen Fall. Für die Theoriehilfe kommt der jeweilige Theorieblock hinzu;
für die Reflexion ausschließlich die feste Frage, Kernpunkte und gleichwertige
Formulierungsvarianten. Frühere KI-Bewertungen werden bei der Reflexion nicht
erneut als Kontext eingespeist. Folgeantworten beziehen sich auf die zuletzt
gestellte Rückfrage, statt erneut alle Punkte der Einstiegsfrage zu verlangen.

Vier Beiträge mit jeweils höchstens 2.000 Zeichen sind pro Sitzung möglich.
Eine Modellantwort enthält bis zu 4.000 Zeichen Rückmeldung und 500 Zeichen
Rückfrage. Die Sitzung läuft nach 20 Minuten ab. Abbrechen, Gespräch verwerfen
und ohne KI weiterlernen bleiben erreichbar. Bei einem Verbindungsfehler bleibt
die aktuelle Eingabe bis zum Schließen für einen erneuten Versuch erhalten.

Die feste Selbstreflexion bleibt der Abschlussweg: schriftlich, gedanklich oder
nach dem freiwilligen Gespräch mit den geprüften Kernpunkten vergleichen, dann
bewusst „Verglichen – weiter“ wählen. Eine KI-Rückmeldung verändert weder den
Lernstand noch das Testergebnis. Das Gespräch verwendet keine Mini-Test-Aufgaben
oder -Lösungen. Während eines laufenden Mini-Tests wird keine KI-Erklärung in
der Theorie-Nachlese angeboten.

## Getrennte Kontexte und lokale Unterlagen

Öffentliche Sitzungen verwenden ausschließlich den serverseitig geladenen,
freigegebenen Teil des LF1-Inhalts und die ausdrücklich eingegebenen Beiträge.
Gespeicherte Reflexionsnotizen, Quizantworten, andere Lernbereiche und Kontodaten
werden nicht als Lernkontext mitgesendet.

Eigene Unterlagen sind eine zusätzliche freiwillige Quelle für **lokales Qwen**.
Die gesamte Sitzung einschließlich Rückfragen und abgeleiteter Rückmeldungen
bleibt dann lokal. Ein privater Kontext kann nicht nachträglich zu ChatGPT
umgeschaltet werden. Bei fehlenden Fundstellen oder nicht erreichbarem Modell
erfolgt kein stiller Wechsel zu öffentlichen Quellen oder einem Cloudanbieter.

Die Quelle wird serverseitig an die Sitzung gebunden; Folgeanfragen können keine
andere Herkunft oder einen anderen Anbieter behaupten. Der lokale Materialstand
wird vor und nach Modellantworten geprüft. Änderungen verwerfen den privaten
Gesprächskontext, auch bei wiederholten Anfragen mit zuvor erzeugter Antwort.
Die Oberfläche verwirft bei Anbieter-, Modell-, Konto-, Lernschritt- oder
Quellenwechsel Gespräch und Eingabe. Änderungen des lokalen Materials werden
zusätzlich über Ereignisse und begrenzte Statusabfragen erkannt.

Im neuen Antwortvertrag fehlen private Quellentitel, Dateinamen, Seiten,
Originalauszüge und sonstige Quellenmetadaten. Der Modellauftrag verlangt eigene
Erklärungen; eine zusätzliche konservative Prüfung weist längere direkte
Textübernahmen und erkennbare übergebene Quellenmetadaten zurück. Das ist keine
Garantie, dass jede mögliche Wiedererkennung oder sprachliche Nähe erkannt wird.
Solche privaten Antworten bleiben unabhängig davon ausschließlich lokal und
werden nicht zu öffentlichen App-Inhalten.

Gespräche sind flüchtig: im Arbeitsspeicher des lokalen Anwendungsdienstes und
der geöffneten Ansicht. Sie werden weder in den Journey-Store, normale
Reisesicherungen, Kontosync noch Projektdateien geschrieben. Schließen und
Neuladen verwerfen sie. Bereits vorhandene gespeicherte Reflexionsnotizen bleiben
ein eigener Bereich; KI-Text wird dort niemals automatisch eingefügt.
Manuell eingegebene fremde private Texte können nicht zuverlässig automatisch
erkannt werden und gehören nicht in Cloudfragen oder allgemeine Sicherungen.

## Schnittstelle und technische Grenzen

Alle neuen Routen liegen hinter der bestehenden lokalen KI-Zugangsprüfung:
Loopback-Verbindung, erlaubter Host/Ursprung, eigener Anfrageheader, kein
Cross-Site-Aufruf und `Cache-Control: no-store`. Der Service Worker speichert
KI-Anfragen nicht. Netzwerkfreigaben werden nicht erweitert; auf einem über
eine Rechner-IP geöffneten Gerät bleibt der feste Lernweg nutzbar, die neue
KI-Hilfe ist dort nicht verfügbar.

| Route unter `/api/ai/journey` | Vertrag |
|---|---|
| `POST /start` | Thema, Inhaltsversion, Art, Block-/Frage-ID, Anbieter, Modell und Quellenwahl; liefert eine zufällige Sitzungskennung und den festen Einstieg, noch ohne Modellaufruf |
| `POST /turn` | Nur Sitzungskennung, eindeutige Anfragekennung und eigene Eingabe; Anbieter und Herkunft kommen aus der gebundenen Sitzung |
| `POST /end` | Beendet die Sitzung, bricht laufende Arbeit ab und verwirft ihren Kontext |

Höchstens 20 Sitzungen und vier erfolgreiche Beiträge je Sitzung; maximal zwölf
unterschiedliche Anfragekennungen begrenzen Fehlerwiederholungen. Ablauf-Timer
geben Sitzungen auch ohne weitere Anfrage frei. Doppelte Anfragen mit derselben
Kennung und Eingabe erzeugen keinen weiteren Beitrag. Eine andere Eingabe unter
derselben Kennung wird zurückgewiesen. Nach einem fehlgeschlagenen Auftrag kann
die unveränderte Eingabe unter ihrer ursprünglichen Kennung erneut versucht werden.

Der Modellvertrag akzeptiert ausschließlich `text`, `followUp` und bekannte
`objectiveIds` des ausgewählten Lernziels. Zusätzliche Felder, fremde Ziele,
unpassende Formate und Ausgabelängen werden abgewiesen. Die Oberfläche rendert
Antworten als Text. Modelltexte führen keine Befehle aus und erhalten keine
Schreibschnittstelle für Lernfortschritte oder Prüfungen.

Die bestehenden Qwen- und ChatGPT-Transporte werden gemeinsam genutzt: geprüfter
lokaler Qwen-Dienst und lokal installiertes Modell; bei ChatGPT eigene bestehende
Kontoverbindung. Private Sitzungen werden bereits vor einem Cloudtransport
zurückgewiesen. Kontoaktionen beenden bestehende Gespräche. Nach jedem
asynchronen Arbeitsschritt werden Abbruch und Sitzungszustand erneut geprüft.

Für neue Journey-Anfragen nutzt ein lokal geprüftes Qwen3-Modell seinen
Denkmodus mit begrenztem Budget von 4.096 Tokens. Modellname und gemeldete Familie
müssen beide Qwen3 bestätigen. Andere Qwen-Familien erhalten keinen erzwungenen
Denkmodus; die bisherige allgemeine Lernhilfe und ChatGPT behalten ihren
vorhandenen Transport. Nur die abgeschlossene strukturierte Antwort wird
ausgegeben, niemals zusätzliche Denkfelder. Laufzeit-, Antwortgrößen- und
Abbruchgrenzen bleiben erhalten. Kleine lokale Modelle können dadurch mehr
Zeit benötigen. Abgeschnittene Antworten oder reine Wiederholungen der Eingabe
beziehungsweise Lernfrage werden als ungeeignete Rückmeldung zurückgewiesen,
ohne einen Gesprächsbeitrag zu zählen. Das ist keine fachliche Benotung.

## Prüfstand

| Prüfung | Nachweis |
|---|---|
| Backend | 301/301 Tests grün, darunter 28 neue Sitzungs-/API-Fälle; gesamte normale Suite ohne Datenbank |
| Browser und Electron | 29/29 Fälle grün: 14 neue Gesprächsfälle, zehn bestehende Journey- und fünf Anbieterregressionen |
| Bedienung | Schmale Ansicht, Tastatur, Abbruch, private Quellenwechsel, Wiederholungen und verspätete Antworten; synthetische mobile Ansicht visuell geprüft |
| Desktop | Isoliertes App-Profil: freiwillige Gespräche verändern den nativen Reisestand nicht und verschwinden nach Neuladen |
| Frontend | Produktions-Build grün; bestehender Hinweis auf große Codepakete bleibt |

Automatische Prüfungen verwenden ausschließlich öffentliche Inhalte, synthetische
private Marker und kontrollierte Anbieterantworten. Es werden keine privaten
Originalunterlagen oder persönlichen Konten für Testartefakte verwendet. Bei
Backendtests wird der Zugriff auf reale `.env`-Inhalte zusätzlich abgeschirmt.

Zwei frische unabhängige Reviews prüfen Oberfläche sowie Backend/Datengrenzen.
Gefundene Randfälle sind korrigiert: Wiederholung gescheiterter Anfragen,
Materialrevision auch bei zwischengespeicherten Antworten, aktiver Ablauf,
UUID-Typen, kurze direkte private Textübernahmen und Bereinigung verspäteter
Sitzungen. Zusätzliche Gegenproben decken diese Fälle ab.

Die fachliche Modellprobe verwendet ausschließlich den öffentlichen LF1-Fall
mit lokalem Qwen3:4b. Sie ist ein begrenzter Stichprobennachweis, keine Garantie
für jede spätere Antwort. Die Reflexionsgrundlage wurde dabei verkürzt, damit
zusätzliche Theorieanforderungen und frühere KI-Kritik eine gleichwertige Antwort
nicht überlagern. In der abschließenden App-Probe wurden korrekte Antworten,
eine gleichwertige Umformulierung und eine Rollenbeschreibung anerkannt, eine
Verwechslung von Leistung/Nutzen korrigiert und eine fachfremde Frage zum
Lernstoff zurückgeführt. Die Antworten benötigten dabei 22–43 Sekunden.
Eine längere Antwort zur Zuständigkeit erreichte die Ausgabelänge und wurde
nach 50 Sekunden als unvollständig zurückgewiesen: kein Teiltext, keine
Bewertung und kein verbrauchter Gesprächsbeitrag. Dieser Rückfall bleibt eine
reale Grenze kleiner lokaler Modelle. Eine anschließende knappere Formulierung
zur Zuständigkeit wurde nach 42 Sekunden passend anerkannt und mit einer
Dokumentations-Rückfrage ergänzt. Rückfragen können sich wiederholen;
eine ideale Gesprächsführung wird nicht zugesagt.

ChatGPT wurde in diesem Schritt ausschließlich mit
kontrolliertem Transport geprüft, ohne echte Cloudanfrage oder Nutzung eines
persönlichen Kontingents. Die privaten Schutzprüfungen verwenden synthetische
Quellen, keine Originalunterlagen. Unverbindliche KI-Rückmeldungen ersetzen
weiterhin nicht die festen Kernpunkte oder die deterministische Mini-Prüfung.

R3 erweitert nur den vorhandenen ersten LF1-Abschnitt. Weitere allgemeine Themen
folgen als eigene Inhaltsarbeit mit Review. Installationspakete wurden in diesem
Schritt nicht neu gebaut.
