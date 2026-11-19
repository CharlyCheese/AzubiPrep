# Elemente erzeugen und entfernen im Debugger

## Schrittweise Aufgabenliste

Werkstatt → Debugger → „HTML und Ereignisse“ → „Aufgabenlisten-Beispiel laden“.
Nach der Ersetzungsbestätigung enthält das Projekt ein Formular, eine leere ul
und einen submit-Handler. Starten hält vor der ersten Anweisung; mit „Weiter“
die Listener einrichten. Einen Titel eingeben und „Aufgabe hinzufügen“ anklicken.
Offene Textentwürfe werden nach der bestehenden Formularregel übernommen.

Im Handler entsteht zuerst ein abgetrenntes li. textContent/className und ein
Entfernen-Button werden eingerichtet, bevor liste.append(eintrag) den fertigen
Eintrag sichtbar macht. Ein Haltepunkt in main.js25:3 zeigt genau diesen Übergang.
Der Entfernen-Handler besitzt über seine Closure weiterhin den passenden Eintrag
und Titel; main.js20:5 hält vor eintrag.remove(). Ein Schritt entfernt ihn aus der
Vorschau. Die anderen Einträge bleiben erhalten. Einen leeren Titel abfangen,
mehrere Einträge hinzufügen und unterschiedliche Entfernen-Buttons verfolgen.

## Unterstützte APIs

- document.createElement(tag): eines der bereits freigegebenen HTML-Elemente,
  Groß-/Kleinschreibung wird normalisiert. Das Element ist zunächst abgetrennt,
  hat keine Kinder und keine Listener. body, eigene Elemente, SVG, Namespaces,
  zusätzliche Optionen und Ressourcen-/Skripttags bleiben gesperrt.
- appendChild(element) hängt genau ein eigenes Modellelement an und gibt
  denselben Handle zurück. Ein bereits eingefügtes Element wird verschoben.
- append(...elementeOderTexte) hängt eigene Elemente oder primitive Texte an;
  replaceChildren(...elementeOderTexte) ersetzt die bisherigen Kinder. Ohne
  Argumente leert replaceChildren den Container. Beide liefern undefined.
  Wiederholte Handles stehen am Ende nur an ihrer letzten Argumentposition.
- element.remove() trennt ein Element ab und liefert undefined. Ohne Elternteil
  bleibt es unverändert. parent.removeChild(element) verlangt ein direktes Kind
  und gibt dieses identische Element zurück.
- parentNode und isConnected sind passive Lesezugriffe. Die feste body-Wurzel
  hat im Modell parentNode=null und bleibt verbunden; ihr tatsächlicher Browser-
  Vorfahr außerhalb des modellierten Bodyausschnitts wird nicht freigegeben.
- button.type kann auf button oder submit gesetzt werden; input.type bleibt
  auf text begrenzt. Andere Attribute weiterhin nur über die schon vorhandenen
  freigegebenen Felder. querySelectorAll liefert wie bisher eine statische Array-
  Momentaufnahme, keine automatisch aktualisierte HTMLCollection.

Entfernen zerstört kein Element. Vorhandene Variablen, Textwerte, Kinder und
Listener bleiben an demselben Handle. Abgetrennte Teilbäume können intern weiter
bearbeitet, durchsucht und später eingefügt werden; document-Suchen und die
Vorschau finden ausschließlich mit der Modellwurzel verbundene Elemente.
Ein begonnenes Ereignis behält seinen ursprünglichen Bubblingpfad, auch wenn
sein Ziel unterwegs entfernt oder verschoben wird. Neue Vorschauklicks benötigen
ein aktuelles verbundenes Ziel und werden während einer Pause nicht angenommen.

Primitive Texte werden als Textknoten modelliert und in React als Text gerendert.
Spitze Klammern oder vermeintliche HTML-/Skriptfragmente werden nicht ausgeführt.
Objekt-/Funktions-/Symbolkonvertierungen sind nicht freigegeben. appendChild und
removeChild akzeptieren ausschließlich private eigene Elementhandles.

Void-Elemente und Textcontrols nehmen in diesem Umfang keine eingefügten Kinder
auf. Keine Textknotenhandles, DocumentFragments, insertBefore/replaceChild,
Klonierung, freien Attribute oder HTML-Injektion. Ungültige Modellhierarchie und
Grenzüberschreitungen beenden den Lauf endgültig mit Erklärung; sie sind keine
vollständige Nachbildung aller nativen DOMException-/HTML-Inhaltsmodellregeln.

## Ressourcen, Vorschau und Speicherung

Die bisherigen Grenzen steigen nicht. 128 gehaltene Knoten zählen nun auch
abgetrennte Elemente und deren Textblätter, nicht nur den sichtbaren Baum.
Jede Element-ID ist in einer Sitzung eindeutig und wird nicht wiederverwendet.
Entfernen gibt die gehaltene Elementidentität samt Listenern nicht frei. Bei
vielen Probeaufbauten kann deshalb ein frischer Debugstart erforderlich werden.
Textblätter besitzen keine öffentlichen Handles; ersetzte, von keinem Element
mehr gehaltene Blätter werden nicht dauerhaft gezählt.

Alle gehaltenen Teilbäume unterliegen Tiefe16,2048UTF-16-Codeeinheiten je Feld
und gemeinsam16KiB UTF-8-Text. Der sichtbare Snapshot bleibt auf32KiB begrenzt.
Auch Erzeugen zählt als Modellschreiboperation, maximal2048 pro Sitzung. Weitere
Listener-/Ereignis-/Protokoll-/Speicher-/Zeitgrenzen bleiben unverändert.

Kein echtes Browser-DOM wird an Lerncode ausgegeben. Die VM veröffentlicht nur
geprüfte primitive Baumdaten; Parent und Worker kontrollieren weiterhin IDs,
Revision, Reihenfolge, Größe und Zustand. CSS bleibt im skriptlosen Frame mit
unveränderter CSP/Sandbox. Quelltext wird weder in srcDoc interpoliert noch im
Browser ausgeführt. Feldentwürfe abgetrennter oder gesperrter Controls werden
verworfen. Ein neues Element kann keine alte ID und damit keinen fremden Entwurf
übernehmen.

Gespeichert/exportiert werden Original-HTML/CSS/JavaScript. Erzeugte Elemente,
Listener, laufende Aufgabenliste, Feldentwürfe und Debugzustände bleiben flüchtig.
Neuladen, Seitenwechsel und Electron-Neustart beginnen passiv mit den Quellen.
Keine Verbindung zu KI, privaten Unterlagen, Konten oder Netzwerk-/Dateirechten.

## Nachweise und Referenzen

Automatisierte Fälle: e2e/tests/debugger-elements.spec.js; Endbefunde zu Tests,
Bedienung und unabhängigem Review im [FE-056-Brief](agent-briefs/FE-056-debugger-elemente.md).
464 gesamte Browser-/Windows-Electronfälle ohne Wiederholung bestanden; nach
reiner CSS-Beispielbereinigung alle43 betroffenen Fälle erneut grün. Sieben
Bediengruppen bestätigt. Unabhängiger Code-Review einschließlich313 nativ
gültiger Mehrfachargumentfälle und vier Klick-Defaultfälle ohne Abweichungen.

Referenzen: [DOM-Standard](https://dom.spec.whatwg.org/),
[createElement](https://developer.mozilla.org/en-US/docs/Web/API/Document/createElement),
[appendChild](https://developer.mozilla.org/en-US/docs/Web/API/Node/appendChild),
[append](https://developer.mozilla.org/en-US/docs/Web/API/Element/append).

FE-057 ergänzt darauf aufbauend [Speichern/Lesen/Löschen im Übungsspeicher](50-Debugger-Uebungsspeicher.md).
Dieser erste Speicher ist ausschließlich sitzungsgebunden; Originalquellen
bleiben von laufender Liste und Speicherwerten getrennt.
