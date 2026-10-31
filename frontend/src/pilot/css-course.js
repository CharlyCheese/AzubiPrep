const CSS_REFS = {
  colors: 'https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html',
  type: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals',
  units: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units',
  box: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model',
  overflow: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow',
  flow: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Flow_layout',
  display: 'https://developer.mozilla.org/en-US/docs/Web/CSS/display',
  flex: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Basic_concepts',
  wrap: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Mastering_wrapping_of_flex_items',
  grid: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts',
  areas: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout/Grid_template_areas',
  position: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position',
  media: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media',
  responsive: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design',
  focus: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible',
  motion: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion',
};
const CSS_STYLES = [
  '.karte { color: #17324d; background-color: rgb(245, 247, 250); }',
  '.karte p { font-family: sans-serif; font-size: 18px; line-height: 1.6; }',
  'main { font-size: 1rem; width: 90%; max-width: 60rem; margin-left: auto; margin-right: auto; }\n.karte { padding: 1em; }',
  '.karte { box-sizing: border-box; width: 100%; border: 2px solid #17324d; margin-bottom: 1rem; }',
  '.karte { min-width: 0; }\n.langtext { overflow-wrap: anywhere; }\n.code { max-width: 100%; overflow-x: auto; white-space: pre; }',
  '.fluss { display: block; }\n.fluss em { display: inline; }',
  '.fluss em { display: inline-block; padding: .5em; border: 1px solid navy; }',
  '.karten { display: flex; flex-direction: row; justify-content: space-between; align-items: stretch; gap: 1rem; }\n.karte { flex: 0 1 30%; width: auto; }',
  '.karten { flex-wrap: wrap; }\n.karte { flex: 1 1 16rem; }',
  'nav { display: flex; flex-wrap: wrap; gap: .75rem; }\nnav a { display: inline-block; padding: .5em 1em; }',
  '.karten { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; }',
  'main { display: grid; grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); grid-template-areas: "titel titel" "hinweis hinweis" "inhalt info"; gap: 1rem; }\nmain > h2 { grid-area: titel; }\n.fluss { grid-area: hinweis; }\n.karten { grid-area: inhalt; min-width: 0; }\n.merkkasten { grid-area: info; min-width: 0; }',
  '.karte { position: relative; padding-top: 3rem; }\n.marke { position: absolute; top: .5rem; right: .5rem; padding: .25rem; background-color: lightyellow; }',
  '/* Übersicht: bestehende Regeln gemeinsam anwenden. */',
  'main { grid-template-columns: minmax(0, 1fr); grid-template-areas: "titel" "hinweis" "inhalt" "info"; }\n.karten { grid-template-columns: minmax(0, 1fr); }\n@media (min-width: 60rem) { main { grid-template-columns: minmax(0, 2fr) minmax(0, 1fr); grid-template-areas: "titel titel" "hinweis hinweis" "inhalt info"; } .karten { grid-template-columns: repeat(3, minmax(0, 1fr)); } }',
  '.gruppenbild { width: 100%; max-width: 20rem; height: auto; aspect-ratio: 1; object-fit: contain; }',
  'nav a:focus-visible { outline: 3px solid navy; outline-offset: 3px; }\nnav a:hover { text-decoration: underline; }',
  '.marke { transition: transform .3s ease; }\n.karte:hover .marke { transform: translateY(-2px); }\n@media (prefers-reduced-motion: reduce) { .karte:hover .marke, .marke { transition: none; transform: none; } }',
  '/* Transfer: beide Seiten bei mehreren Breiten prüfen. */',
  '/* Projekt 2: neues Thema, bekannte Techniken. */',
  '/* Abgabe: responsive Website, Tastatur und reduzierte Bewegung. */',
];
const CSS_BROKEN = [
  '.karte { color: #eeeeee; background-color: #ffffff; }',
  '.karte p { font-size: 10px; line-height: 1; }',
  'main { max-width: none; width: 1100px; }',
  '.karte { box-sizing: content-box; }',
  '.langtext { overflow-wrap: normal; } .code { overflow-x: visible; }',
  '.fluss { display: none; }',
  '.fluss em { display: inline; padding: 0; }',
  '.karten { display: block; }',
  '.karten { flex-wrap: nowrap; }',
  'nav { display: block; }',
  '.karten { display: flex; }',
  '.merkkasten { grid-area: auto; }',
  '.marke { position: static; }',
  '.karten { display: block; } .marke { position: static; }',
  '@media (max-width: 59rem) { .karten { grid-template-columns: repeat(3, 1fr); } }',
  '.gruppenbild { width: 900px; max-width: none; height: 120px; }',
  'nav a:focus-visible, nav a:focus { outline: none; }',
  '@media (prefers-reduced-motion: reduce) { .karte:hover .marke, .marke { transition: transform .3s; transform: translateY(-2px); } }',
  '@media (max-width: 59rem) { main { width: 1000px; } }',
  '.karte { color: #eeeeee; background-color: white; }',
  '.karten { display: block; } nav a:focus-visible, nav a:focus { outline: none; }',
];
function cssLesson(id, chapter, title, prerequisite, explain, example, task, hints, reference) {
  return { id, chapter, title, prerequisite, explain, example, task, hints, reference: CSS_REFS[reference],
    rules: ['document', 'heading', 'links', 'image', 'semantic', 'css', 'project', 'css-layout'],
    version: 'css-8-12.1', checked: '2026-10-31' };
}
export const CSS_LESSONS = [
  cssLesson('farben-kontrast', 8, 'Farben bewusst und lesbar wählen', 'Kapitel 7: Selektoren, Kaskade und Vererbung.', [
    'Du gestaltest die bekannte Informationswebsite als Lernangebotsseite weiter. div gruppiert hier mehrere Karten ohne eigene semantische Bedeutung; jede Karte ist ein section-Abschnitt mit Überschrift. Die Klassen karten, karte und kartentext markieren zunächst unsere Übungsbereiche. Texte darfst du verändern. Jeder Aufgabenentwurf ist getrennt; eigene Zwischenstände kannst du exportieren und in der nächsten Aufgabe einlesen.',
    'Bisher kennst du Farbnamen. #17324d ist eine hexadezimale RGB-Farbe: Je zwei Zeichen beschreiben Rot, Grün und Blau (00 bis ff). rgb(245, 247, 250) benennt dieselben drei Kanäle dezimal von 0 bis 255. rgba ergänzt Transparenz. Für lesbaren normalen Text verlangen wir hier einen Kontrast von mindestens 4,5:1 zwischen deckender Text- und Hintergrundfarbe. Farbe allein sollte keine Information tragen; „Neu“ benötigt beispielsweise auch ein Wort.',
    'Vergleiche helle Schrift auf Weiß mit dunkler Schrift auf hellem Hintergrund. Die vereinfachte Prüfung gilt für die deckenden Kartenfarben, nicht als vollständige Barrierefreiheitsprüfung einer Website.',
  ], '.karte { color: #17324d; background-color: rgb(245, 247, 250); }',
  'Gestalte alle drei Karten der Startseite mit eigenen deckenden Text- und Hintergrundfarben. Verwende mindestens eine Hex- oder RGB-Schreibweise; erreiche mindestens 4,5:1 Kontrast. Behalte zwei vollständige Seiten und deren gemeinsame CSS-Datei.',
  ['Untersuche color und background-color einer Karte. Transparente Flächen sind in dieser Vergleichsaufgabe nicht gemeint.', 'Eine dunkle Farbe wie #17324d auf rgb(245, 247, 250) erfüllt den Auftrag.'], 'colors'),
  cssLesson('typografie', 8, 'Text gut lesbar setzen', 'Deckende Farben und Kontrast.', [
    'font-family benennt eine Schriftfamilie und kann Ersatzschriften enthalten: Arial, sans-serif. Wir verwenden lokale Systemschriften; externe Webfonts werden nicht geladen. font-size bestimmt die Schriftgröße. Ein CSS-Pixel ist eine logische Größe und nicht immer ein einzelner Bildschirmpixel.',
    'line-height: 1.6 ist ein einheitenloser Faktor zur jeweiligen Schriftgröße. Bei 18px Schrift ergibt das 28,8px Zeilenhöhe. font-weight verändert die Strichstärke; text-align ordnet Text innerhalb seiner Zeile an. Lange Fließtexte bleiben meist linksbündig leichter lesbar. Die Übung verlangt mindestens 16px und den Faktor 1,5; das sind unsere Lernkriterien, keine pauschale WCAG-Schriftgrößenvorschrift.',
  ], '.karte p { font-family: Arial, sans-serif; font-size: 18px; line-height: 1.6; }',
  'Gestalte alle Kartenabsätze mit einer lokalen Schriftfamilie, mindestens 16px berechneter Schriftgröße und einer Zeilenhöhe von mindestens dem 1,5-Fachen. Behalte den lesbaren Kontrast. Vergleiche einen mehrzeiligen Absatz vor und nach der Änderung.',
  ['line-height ohne Einheit multipliziert die Schriftgröße.', 'Versuche font-size: 18px; line-height: 1.6; font-family: sans-serif.'], 'type'),
  cssLesson('relative-einheiten', 8, 'rem, em und Prozent unterscheiden', 'Schriftgröße, Zeilenhöhe und Pixel.', [
    'rem bezieht sich auf die Schriftgröße des Wurzelelements html. em hängt vom Kontext ab: Bei font-size bezieht es sich auf die Elternschrift, bei padding auf die Schrift des Elements selbst. Prozentwerte beziehen sich je nach Eigenschaft auf unterschiedliche Bezugsgrößen; bei width hier auf die Breite des umgebenden Inhaltsbereichs.',
    'width: 90% lässt den Hauptinhalt mit seinem Elternbereich mitwachsen. max-width: 60rem begrenzt lange Zeilen auf großen Ansichten. margin-left/right: auto verteilt freien horizontalen Platz bei begrenzter Breite. padding: 1em ergänzt Innenabstand; das Boxmodell betrachten wir als Nächstes. Verändere testweise die Wurzelschrift im Inspektor: Eine rem-Grenze wächst mit, eine px-Grenze nicht.',
  ], 'main { width: 90%; max-width: 60rem; margin-left: auto; margin-right: auto; }\n.karte { padding: 1em; }',
  'Begrenze main mit einer wirksamen max-width in rem, zentriere es und verwende eine flexible Breite. Gib den Karten Innenabstand in em. Bei 360px muss main in die Ansicht passen; bei 1280px bleibt beidseitig Platz. Die Prüfung vergrößert zusätzlich die Wurzelschrift.',
  ['max-width ist eine Obergrenze; width kann darunter kleiner sein.', 'Nutze 90%, max-width: 60rem und automatische Seitenränder. padding: 1em skaliert mit der Kartenschrift.'], 'units'),
  cssLesson('boxmodell', 8, 'Inhalt, Innenabstand, Rahmen und Außenabstand', 'Relative Einheiten und flexible Breite.', [
    'Von innen nach außen: Inhalt, padding, border, margin. Im Standardmodell content-box bezeichnet width nur die Inhaltsbreite; Innenabstand und Rahmen kommen dazu. Bei border-box enthält width bereits Inhalt, padding und border. margin bleibt außerhalb beider Modelle.',
    'Eine Karte mit width: 100%, padding und Rahmen wird mit content-box breiter als ihr Elterninhalt. box-sizing: border-box verhindert das in diesem Fall. Die Kurzform border: 2px solid navy nennt Breite, Stil und Farbe. margin-bottom trennt die Karten. Sage die Außenbreite vorher voraus und prüfe sie danach im Boxmodell des Inspektors.',
  ], '.karte { box-sizing: border-box; width: 100%; padding: 1em; border: 2px solid navy; margin-bottom: 1rem; }',
  'Alle Karten erhalten border-box, Breite 100%, positiven Innenabstand, sichtbaren Rahmen und Außenabstand nach unten. Ihre Außenbreite soll innerhalb des Kartencontainers bleiben. Behalte Kontrast und Schriftgestaltung.',
  ['Vergleiche die berechnete width mit der sichtbaren Außenbreite.', 'Setze box-sizing: border-box an die Karten; padding und border werden dann in width eingerechnet.'], 'box'),
  cssLesson('ueberlauf-karten', 8, 'Mini-Projekt: lange Inhalte beherrschen', 'Boxmodell und Textgestaltung.', [
    'Ein langes untrennbares Wort kann aus einer schmalen Box herausragen. overflow-wrap: anywhere erlaubt bei Bedarf zusätzliche Umbruchstellen. Eine feste Höhe und overflow: hidden würden Text verbergen; behebe zuerst die Ursache und halte Inhalte lesbar.',
    'pre erhält Leerzeichen und Zeilenumbrüche für vorformatierten Text. Bei einer bewusst langen Zeile ist ein lokal horizontal scrollbarerer Bereich sinnvoll: overflow-x: auto. Die Seite selbst soll nicht horizontal scrollen. Vergleiche den umbrechenden Text und die absichtlich ungebrochene Dateiliste. min-width: 0 erlaubt später auch Flex-/Grid-Kindern, unter ihre automatische Mindestbreite zu schrumpfen.',
  ], '.langtext { overflow-wrap: anywhere; }\n.code { max-width: 100%; overflow-x: auto; white-space: pre; }',
  'Baue eine lesbare Kartenansicht bei 360px: Der lange Begriff im Absatz muss umbrechen; die vorformatierte Dateizeile in pre bleibt über overflow-x: auto lokal erreichbar. Kein Abschneiden, kein Verstecken und kein horizontaler Überlauf der ganzen Seite. Exportiere deine Kartenansicht.',
  ['Behandle Fließtext und vorformatierten Inhalt unterschiedlich.', 'Nutze overflow-wrap: anywhere für .langtext und overflow-x: auto für .code.'], 'overflow'),
  cssLesson('dokumentfluss', 9, 'Wie Inhalte ohne Layoutsystem fließen', 'Abgeschlossene Kartenansicht aus Kapitel 8.', [
    'Blockboxen wie ein normaler Absatz stehen im üblichen Dokumentfluss untereinander; Inline-Inhalte wie em laufen innerhalb einer Zeile mit. display: none entfernt ein Element aus der Darstellung und auch aus dem Platzbedarf. Ein Element ist dadurch nicht bloß unsichtbar übermalt.',
    'Die neue Zeile .fluss enthält ein em zwischen zwei Textteilen. Stelle den Absatz wieder als Block und em als Inline-Inhalt dar. Vertikale Ränder normaler Blockboxen können zusammenfallen: Zwei benachbarte positive margins addieren sich dann nicht, sondern der größere bestimmt den Abstand. Das gilt nicht pauschal für jede Layoutsituation, etwa Flex-/Grid-Abstände.',
  ], '.fluss { display: block; }\n.fluss em { display: inline; }',
  'Mache den vorbereiteten Flussabsatz wieder sichtbar: display block am Absatz, inline am enthaltenen em. Die drei Karten bleiben im normalen Fluss untereinander. Erkläre, was beim Entfernen einer display:none-Regel wieder Platz beansprucht.',
  ['Untersuche den Absatz selbst, nicht nur die Schriftfarbe.', 'Entferne display:none oder ersetze es durch display:block; em bleibt display:inline.'], 'flow'),
  cssLesson('display-boxen', 9, 'Inline, Block und Inline-Block vergleichen', 'Block-/Inline-Fluss und display:none.', [
    'display: inline-block lässt eine Box im Zeilenfluss stehen, gibt ihr aber ein eigenes Boxverhalten. Anders als bei einer gewöhnlichen Inline-Box lassen sich Breite und Höhe gezielt setzen; Innenabstand und Rahmen umschließen die Box. Ein normaler Textumbruch bleibt möglich.',
    'Verwandle das em im Flussabsatz in ein kleines eingerahmtes Etikett. em bleibt inhaltlich eine Betonung; CSS verändert seine Darstellung. Prüfe, dass die umgebenden Wörter sichtbar bleiben. Verwechsle display mit semantischer Bedeutung nicht: Ein div wird durch display:inline nicht zu einer Textbetonung.',
  ], '.fluss em { display: inline-block; padding: .5em; border: 1px solid navy; }',
  'Gestalte das em im Flussabsatz als inline-block mit positivem padding und sichtbarem Rahmen. Der Absatz und die benachbarten Wörter bleiben im normalen Fluss sichtbar.',
  ['Der Selektor .fluss em trifft die Betonung innerhalb des Absatzes.', 'Gib diesem em display:inline-block, padding:.5em und border:1px solid navy.'], 'display'),
  cssLesson('flex-achsen', 9, 'Flexbox: Haupt- und Querachse', 'Fluss und Display-Boxen.', [
    'display:flex macht die direkten Kinder zu Flexelementen. Bei flex-direction:row läuft die Hauptachse in der hier verwendeten Schreibrichtung waagerecht; column dreht sie nach unten. justify-content verteilt Platz entlang der Hauptachse, align-items richtet entlang der Querachse aus. gap hält Abstand zwischen Elementen.',
    'flex: 0 1 30% bedeutet: nicht wachsen, bei Bedarf schrumpfen, mit 30% Ausgangsgröße beginnen. Flexbox ist ein eindimensionales Layoutverfahren. Prüfe drei Karten bei 1280px nebeneinander und ändere probeweise row zu column. Die zugängliche Lesereihenfolge soll der HTML-Reihenfolge entsprechen; nutze Umordnen nicht als Reparatur falscher Inhalte.',
  ], '.karten { display:flex; flex-direction:row; justify-content:space-between; align-items:stretch; gap:1rem; }\n.karte { flex:0 1 30%; width:auto; }',
  'Ordne die drei Karten bei 1280px mit Flexbox in einer Zeile an: row, positiver gap und justify-content: space-between. Die Karten müssen sichtbar getrennt bleiben. Probiere auch die Querachse aus und stelle zum Schluss wieder row her.',
  ['Das Layout gehört an den Elterncontainer .karten, die Ausgangsgrößen an .karte.', 'Verwende die beiden Regeln des Beispiels; entferne eine störende display:block-Regel am Container.'], 'flex'),
  cssLesson('flex-umbruch', 9, 'Flexible Karten dürfen umbrechen', 'Flexachsen und flex-Kurzform.', [
    'Ohne flex-wrap bleibt eine Flexzeile zusammen und Elemente schrumpfen oder laufen über. flex-wrap:wrap erlaubt weitere Zeilen. flex:1 1 16rem lässt Karten wachsen, schrumpfen und mit 16rem Ausgangsbreite planen. Einzelne Zeilen verteilen ihren freien Platz unabhängig voneinander.',
    'Teste breit und schmal: Bei 1280px passen hier drei Karten in eine Zeile, bei 360px sollen sie untereinander stehen. Ein Umbruch ist keine Media Query; er ergibt sich bereits aus dem verfügbaren Platz. Lange Wörter dürfen den vorher gelernten Umbruch behalten.',
  ], '.karten { flex-wrap:wrap; }\n.karte { flex:1 1 16rem; }',
  'Ergänze flex-wrap:wrap und geeignete flexible Ausgangsgrößen. Bei 1280px stehen drei Karten nebeneinander, bei 360px untereinander. Kein Seitenüberlauf und keine abgeschnittenen Karten.',
  ['wrap und flex-basis wirken zusammen; drei sehr kleine Ausgangsgrößen würden schmal nebeneinander bleiben.', 'Nutze flex:1 1 16rem für die Karten und flex-wrap:wrap für ihren Container.'], 'wrap'),
  cssLesson('flex-navigation', 9, 'Mini-Projekt: eine flexible Navigation', 'Flexbox mit Umbruch und Kartenansicht.', [
    'Die Navigation enthält jetzt drei Links: Start, Über uns und Angebote. Dieselbe CSS-Regel kann alle Links als gut erreichbare Flächen gestalten. padding vergrößert die Linkbox, gap trennt die direkten Flexkinder. Bei schmaler Breite dürfen Links in eine neue Zeile wechseln.',
    'Wiederhole die bisherige Arbeit: Karten umbrechen lassen, lange Begriffe prüfen und beide Seiten gegenseitig erreichen. Lass Linktexte lesbar und bestätige mit Tab und Enter die Reihenfolge. Hover allein ist kein Ersatz für Tastaturbedienung; sichtbaren Fokus ergänzen wir in Kapitel 11.',
  ], 'nav { display:flex; flex-wrap:wrap; gap:.75rem; }\nnav a { display:inline-block; padding:.5em 1em; }',
  'Baue auf beiden Seiten eine Flexnavigation mit mindestens drei beschrifteten Links, Umbruch, positivem gap und gepolsterten Linkflächen. Behalte die flexiblen Karten. Prüfe 360px und 1280px, Links mit Tab/Enter und exportiere das Projekt.',
  ['nav ist der Flexcontainer, seine a-Elemente sind die direkten Kinder.', 'Nutze wrap am nav und padding an nav a; behalte die wechselseitigen Seitenlinks.'], 'flex'),
  cssLesson('grid-spalten', 10, 'Grid: Zeilen und Spalten gemeinsam planen', 'Flexbox, Umbruch und Navigation.', [
    'display:grid aktiviert ein zweidimensionales Raster. grid-template-columns legt Spalten fest. 1fr erhält einen Anteil des verfügbaren freien Platzes. repeat(3, ...) wiederholt ein Muster dreimal. minmax(0,1fr) erlaubt einer Spalte, auch unter die automatische Mindestgröße ihres Inhalts zu schrumpfen; Textumbruch bleibt trotzdem nötig.',
    'Grid passt hier für gleich ausgerichtete Karten. Flexbox bleibt für die Navigation geeignet. Es geht um das passende Werkzeug, nicht darum, ein vorhandenes System überall zu ersetzen. Ein Raster mit drei festen Spalten wird noch nicht automatisch mobilfreundlich; diesen Wechsel bearbeiten wir in Kapitel 11.',
  ], '.karten { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:1rem; }',
  'Stelle den Kartencontainer auf Grid mit drei gleich breiten Spalten und positivem gap um. Bei 1280px stehen alle drei Karten in einer Zeile ohne Überschneidung. Die Navigation bleibt Flexbox.',
  ['Ändere display am Kartencontainer; flex-Eigenschaften wirken nicht als Grid-Spaltendefinition.', 'Nutze repeat(3,minmax(0,1fr)) in grid-template-columns.'], 'grid'),
  cssLesson('grid-bereiche', 10, 'Benannte Rasterbereiche zuordnen', 'Gridspalten und gleichmäßige Karten.', [
    'grid-template-areas benennt Zellen als rechteckige Bereiche. Gleiche Namen verbinden benachbarte Zellen; ein Punkt wäre eine leere Zelle. grid-area ordnet ein direktes Gridkind einem Bereich zu. Alle Zeilen der Vorlage brauchen dieselbe Zellenanzahl.',
    'Neu ist aside: ein ergänzender Bereich, der zum Hauptinhalt passt, aber separat verständlich ist. Plane oben den Titel, darunter den Flusshinweis und danach Karten neben dem Merkkasten. Die HTML-Reihenfolge bleibt Titel, Hinweis, Karten, Ergänzung; auch ohne CSS ist sie sinnvoll.',
  ], 'main { display:grid; grid-template-columns:minmax(0,2fr) minmax(0,1fr); grid-template-areas:"titel titel" "hinweis hinweis" "inhalt info"; gap:1rem; }\n.karten { grid-area:inhalt; }\n.merkkasten { grid-area:info; }',
  'Ordne Titel, Flusshinweis, Karten und aside den vier benannten Bereichen zu. Bei 1280px steht der Merkkasten rechts neben den Karten; Titel und Hinweis stehen darüber. Weise auch main > h2 den Bereich titel und .fluss den Bereich hinweis zu.',
  ['Rasterbereiche wirken nur bei direkten Gridkindern.', 'Verwende die Vorlage im Beispiel und die passenden grid-area-Zuweisungen für alle vier Kinder.'], 'areas'),
  cssLesson('positionierung', 10, 'Positionierung sparsam einsetzen', 'Gridbereiche und normaler Fluss.', [
    'position:relative behält den Platz im Fluss und kann einen Bezug für absolut positionierte Nachfahren schaffen. position:absolute nimmt ein Element aus dem normalen Fluss. top und right platzieren das Etikett hier relativ zur positionierten Karte. span ist ein neutraler Inline-Behälter; das Wort „Neu“ bleibt echter Text.',
    'fixed bezieht sich häufig auf den Viewport, sticky bleibt zunächst im Fluss und haftet innerhalb seiner Scrollgrenzen; beide brauchen einen passenden Zweck und können Inhalte verdecken. z-index beeinflusst Überlagerungen innerhalb von Stapelkontexten, ist keine globale Rangnummer für alle Elemente. Für normale Seitenaufteilung bleiben Grid/Flexbox geeigneter.',
  ], '.karte { position:relative; padding-top:3rem; }\n.marke { position:absolute; top:.5rem; right:.5rem; }',
  'Positioniere das Neu-Etikett innerhalb der ersten Karte oben rechts: Karte relative, Etikett absolute mit Abstand zu beiden Kanten. Reserviere genug oberen Innenabstand, damit es die Überschrift nicht überdeckt. Die Karten selbst bleiben im Gridfluss.',
  ['Ohne positionierten Vorfahren kann absolute einen anderen Bezug erhalten.', 'Nutze die Regeln im Beispiel und prüfe die Grenzen von Etikett und Überschrift im Inspektor.'], 'position'),
  cssLesson('grid-uebersicht', 10, 'Mini-Projekt: eine geordnete Übersicht', 'Gridspalten, Rasterbereiche und Positionierung.', [
    'Verbinde die Techniken auf beiden Seiten: Flexnavigation, Gridkarten, Merkkasten und das kleine Etikett. Untersuche einen vorbereiteten Layoutfehler zuerst am Elterncontainer und dann am betroffenen Kind. Ändere die Ursache, statt jedes Element einzeln an feste Bildschirmkoordinaten zu setzen.',
    'Prüfe diese Zwischenabgabe bei 1280px. Erkläre, weshalb die Navigation Flexbox und die Übersicht Grid nutzt. Schmale Ansichten werden im nächsten Kapitel systematisch ergänzt. Exportiere den überprüften Stand für die Weiterarbeit.',
  ], '/* Prüfreihenfolge: display → Spalten → Bereich → Positionierungsbezug */',
  'Repariere die Übersicht auf beiden Seiten: drei Gridkarten in einer Zeile, Merkkasten rechts daneben, Titel/Hinweis darüber und Etikett innerhalb der ersten Karte ohne Textüberdeckung. Behalte lesbare Inhalte und Navigation.',
  ['Vergleiche .karten und .merkkasten mit den beiden vorigen Lektionen.', 'Stelle display:grid am Kartencontainer und position:absolute am Etikett wieder her; behalte die Bereiche.'], 'grid'),
  cssLesson('media-queries', 11, 'Mobil beginnen und gezielt erweitern', 'Geordnete Desktopübersicht aus Kapitel 10.', [
    'meta name="viewport" mit content="width=device-width, initial-scale=1" gehört in den head jeder Seite. Es hilft mobilen Browsern, den Layoutviewport an die Gerätebreite anzupassen; es erzeugt allein noch kein responsives Layout. Zoomen darf möglich bleiben.',
    'Beim mobilen Ausgangslayout stehen die Bereiche und Karten untereinander. @media (min-width:60rem) ergänzt erst bei genügend Breite das mehrspaltige Layout. Wähle Umbruchpunkte anhand der Inhalte. Bei Medienbreiten beziehen sich rem/em auf die ursprüngliche Schriftgröße, nicht auf eine im Dokument geänderte html-Schrift. Unsere Vorschau unterstützt min-/max-width und die Einstellung für reduzierte Bewegung.',
  ], '<meta name="viewport" content="width=device-width, initial-scale=1">\n/* CSS: */\n.karten { grid-template-columns:minmax(0,1fr); }\n@media (min-width:60rem) { .karten { grid-template-columns:repeat(3,minmax(0,1fr)); } }',
  'Ergänze den Viewport auf beiden Seiten. Nutze ein einspaltiges Ausgangslayout für main und Karten. Ab 60rem dürfen Merkkasten und Karten wieder nebeneinander stehen. Bei 360px/768px eine Kartenspalte, bei 960px/1280px drei; kein horizontaler Seitenüberlauf.',
  ['Eine neue Medienregel allein hilft nicht, wenn die Grundregel schon drei Spalten erzwingt.', 'Übernimm das einspaltige Grundlayout und lege die bekannte Desktopvorlage in @media (min-width:60rem).'], 'media'),
  cssLesson('flexible-inhalte', 11, 'Bilder und Inhalte passen sich an', 'Mobile Grundregeln und Medienabfragen.', [
    'Ein Bild mit starrer Breite kann trotz gutem Raster überlaufen. width:100% mit max-width begrenzt es am Container; height:auto bewahrt bei normalen Bildern das Seitenverhältnis. width/height-Attribute im HTML können das intrinsische Verhältnis vor dem Laden beschreiben. aspect-ratio gibt alternativ ein CSS-Verhältnis vor, object-fit:contain verhindert bei vorgegebenen Boxen das Abschneiden des Bildinhalts.',
    'Das quadratische Übungsbild darf hier höchstens 20rem breit werden und muss auch in die schmale Karte passen. Eine geringe Bildauflösung wird durch Vergrößern nicht schärfer. Teste außerdem lange Wörter und die lokale Dateizeile erneut. Responsivität betrifft Inhalte ebenso wie Spalten.',
  ], '.gruppenbild { width:100%; max-width:20rem; height:auto; aspect-ratio:1; object-fit:contain; }',
  'Repariere das Gruppenbild auf beiden Seiten: Es bleibt quadratisch, passt in seinen Karteninhalt und wird höchstens 20rem breit. Nutze flexible Breite und automatische Höhe. Erhalte den Alternativtext, Wortumbruch und lokal scrollbareren pre-Bereich. Prüfe 360px, 768px und 1280px.',
  ['Eine feste Höhe zusammen mit flexibler Breite verzerrt das Quadrat.', 'Entferne width:900px und height:120px; verwende das Beispiel.'], 'responsive'),
  cssLesson('tastaturfokus', 11, 'Fokus sichtbar machen', 'Responsive Inhalte und funktionierende Links.', [
    'Mit Tab erreicht man Links, mit Enter aktiviert man sie. :focus trifft ein fokussiertes Element. :focus-visible berücksichtigt zusätzlich Browserheuristiken, etwa Tastatureingabe. :hover beschreibt den Zeigerzustand und ersetzt Fokus nicht. :focus-within kann einen Bereich markieren, solange er selbst oder ein Nachfahre Fokus besitzt.',
    'outline zeichnet einen Rahmen ohne Platz im Boxmodell zu beanspruchen; outline-offset schafft Abstand. Entferne den Browserfokus nicht ohne gleichwertigen sichtbaren Ersatz. Unsere Übung verlangt eine mindestens 2px starke, kontrastreiche Outline. Teste praktisch mit Tab; die feste Prüfung simuliert den Fokuszustand für reproduzierbare CSS-Werte.',
  ], 'nav a:focus-visible { outline:3px solid navy; outline-offset:3px; }',
  'Gib allen Navigationslinks einen deutlich sichtbaren Tastaturfokus mit mindestens 2px Outline und Abstand. Die Outline hebt sich mit mindestens 3:1 vom Hintergrund ab. Nutze :focus-visible oder :focus, nicht nur :hover. Prüfe anschließend selbst die vollständige Tab-/Enter-Navigation.',
  ['Eine spätere outline:none-Regel kann deinen Ersatz wieder aufheben.', 'Setze outline:3px solid navy und outline-offset:3px an nav a:focus-visible; entferne störende spätere Regeln.'], 'focus'),
  cssLesson('reduzierte-bewegung', 11, 'Bewegung freiwillig und zurückhaltend', 'Pseudozustände und sichtbarer Fokus.', [
    'transition:transform .3s ease interpoliert eine Änderung der Eigenschaft transform über 0,3 Sekunden. translateY(-2px) verschiebt die Darstellung um zwei Pixel nach oben, ohne den ursprünglichen Platz im Layout zu verschieben. Hier bewegt sich nur das kleine Etikett beim Überfahren einer Karte; Inhalte benötigen diese Bewegung nicht.',
    'prefers-reduced-motion:reduce zeigt den Wunsch nach weniger Bewegung an. Dann entfernen wir den nicht notwendigen Übergang und die Verschiebung. Die Medienbedingung erhöht keine Spezifität: Auch die Hoverregel muss zuverlässig überschrieben werden. Die feste Prüfung stellt beide Medieneinstellungen im isolierten Prüfkontext nach; teste die reale Betriebssystem-/Browseroption zusätzlich selbst.',
  ], '.marke { transition:transform .3s ease; }\n.karte:hover .marke { transform:translateY(-2px); }\n@media (prefers-reduced-motion:reduce) { .karte:hover .marke, .marke { transition:none; transform:none; } }',
  'Behalte den transform-Übergang des Etiketts von 0,1 bis 0,5 Sekunden bei normaler Einstellung. Der Hoverzustand muss seine Position tatsächlich ändern. Bei reduzierter Bewegung müssen Übergangsdauer und Verschiebung entfallen, auch im Hoverzustand. Fokus und Inhalte bleiben erhalten.',
  ['Die Medienregel muss auch die spezifischere Hoverregel überstimmen.', 'Setze transition:none und transform:none für .karte:hover .marke, .marke innerhalb von prefers-reduced-motion:reduce.'], 'motion'),
  cssLesson('responsiv-transfer', 11, 'Transfer: beide Seiten responsiv prüfen', 'Medienregeln, flexible Inhalte, Fokus und reduzierte Bewegung.', [
    'Verbinde die Einzelschritte ohne neue Technik: beide Seiten, mehrere Breiten und unterschiedliche Eingabe-/Bewegungseinstellungen. Ein bei 1280px passendes Layout kann bei 768px noch zu eng sein. Suche zuerst die breiteste verursachende Box; overflow:hidden an der ganzen Seite wäre keine Reparatur.',
    'Selbstprüfung: Tab/Enter, 200% Zoom, längere eigene Überschriften, Zeilenumbruch, Alternativtexte und reduzierte Bewegung. Die automatisierte Prüfung verwendet 360px, 768px und 1280px. Sie ersetzt keine Prüfung mit echten Hilfsmitteln und beurteilt nicht die Qualität deiner Texte.',
  ], '/* Breiteste Box suchen; danach Inhalt, Spalten und Zustände vergleichen. */',
  'Repariere den vorbereiteten Fehler auf beiden Seiten. Bei 360px und 768px eine Kartenspalte, bei 1280px drei, Merkkasten passend darunter oder daneben. Keine verdeckten Inhalte, sichtbarer Fokus, passende Bilder und reduzierte Bewegung. Exportiere den geprüften Stand.',
  ['Untersuche die Breite von main innerhalb der schmalen Medienregel.', 'Entferne die feste 1000px-Breite. Prüfe danach Navigation, Bild und Karten erneut.'], 'responsive'),
  cssLesson('projekt-2-entwurf', 12, 'Projekt 2: einen eigenen Entwurf planen', 'Kapitel 8–11 selbstständig anwenden.', [
    'Wähle ein neues Thema, etwa einen Verein, ein kleines Angebot oder eine Lerngruppe. Notiere Zielgruppe, zwei Seiten, Inhalte, Navigation und Verhalten bei schmaler/breiter Ansicht zunächst in eigenen Worten. Du kannst dafür Kommentare im HTML oder ein eigenes Dokument außerhalb der App nutzen. Die App bewertet diese Planung nicht automatisch.',
    'Erstelle dann einen ersten lesbaren Inhaltsstand: zwei semantische Seiten, gegenseitige Navigation, drei inhaltliche Kartenabschnitte mit Überschriften/Absätzen und ein ergänzendes aside je Seite. Jede Seite enthält ein bedeutungsvolles Bild mit Alternativtext. Die Musterlösung zeigt nur einen möglichen Entwurf; eigene Klassen und Texte sind ausdrücklich erlaubt.',
  ], '<!-- Zielgruppe, Seiten, Inhalte und Prüfplan zuerst selbst notieren. -->',
  'Erstelle den beschriebenen Inhaltsentwurf auf beiden Seiten mit gemeinsamer CSS-Datei. Karten brauchen lesbaren Kontrast, mindestens 16px Absatzschrift und 1,5-fache Zeilenhöhe. Prüfe deinen Plan selbst. Exportiere den Entwurf, um ihn in die nächste Aufgabe zu übernehmen.',
  ['Beginne mit den Inhalten und ihren semantischen Bereichen; Layout kommt in der Abgabe.', 'Drei section- oder article-Karten mit h2/p sowie ein ergänzendes aside pro Seite genügen als Inhaltsstruktur.'], 'responsive'),
  cssLesson('responsive-website', 12, 'Projekt 2: die responsive Website abgeben', 'Geplanter und lesbarer eigener Inhaltsentwurf.', [
    'Lies deinen exportierten Entwurf ein oder starte mit der vorbereiteten Inhaltsstruktur. Setze die Anforderungen mit den bekannten CSS-Techniken um. Es gibt keine pixelgenaue Vorlage. Du darfst Klassen, Texte, Seitennamen und Farben frei wählen. Eine einzige gemeinsame CSS-Datei reicht; zusätzliche Bibliotheken oder JavaScript sind nicht nötig.',
    'Abgabe: drei Karten je Seite, Grid für deren Raster, Flexnavigation mit mindestens drei Links, ergänzender Bereich, sinnvolle Überschriften und Bildbeschreibungen. Bei 360px/768px eine Kartenspalte, bei 1280px drei. Keine globale horizontale Bildlaufleiste, keine ausgeblendeten Pflichtinhalte, lesbarer Kontrast/Schrift und sichtbarer Tastaturfokus. Falls du nicht notwendige Übergänge einsetzt, schalte sie bei reduzierter Bewegung ab; eine Website ganz ohne Bewegung ist ebenfalls richtig.',
    'Selbstprüfung: neues Thema verständlich? Links mit Tab/Enter bedienbar? Bleibt bei 200% Zoom alles lesbar? Stimmen Quellen und Bildrechte? Begründe Flex/Grid und einen Umbruchpunkt. Exportiere das fertige Projekt. Die feste Prüfung bestätigt nur die genannten technischen Kriterien; vollständige Barrierefreiheit, Textqualität und tatsächliche Selbstständigkeit brauchen menschliche Prüfung. Vor JavaScript planen wir Ausführung und Sicherheitsgrenzen separat.',
  ], '/* Eigener Entwurf: bekannte Techniken nach Anforderungen kombinieren. */',
  'Setze den Abgabeauftrag auf beiden Seiten um. Übernimm deinen Entwurf bewusst per Import. Prüfe, korrigiere und exportiere anschließend deine eigene responsive Website. Nutze die Selbstprüfung für alles, was sich nicht zuverlässig automatisch beurteilen lässt.',
  ['Prüfe erst Inhalte und Pfade, dann mobile Grundgestaltung, danach große Ansichten und Fokus.', 'Verwende Grid für drei Karten, einen einspaltigen Grundzustand und eine min-width-Medienregel für die breite Ansicht; lass die Navigation umbrechen.'], 'responsive'),
].map((item, cssStep) => ({ ...item, cssStep, stage: 100 + cssStep }));

function cssMarkup(step) {
  const long = 'Donaudampfschifffahrtsgesellschaftskapitaensanwaerter'.repeat(4);
  const card = (title, index) => `<section class="karte">${step >= 12 && index === 0 ? '<span class="marke">Neu</span>' : ''}<h2>${title}</h2><p class="kartentext">Wir lernen in kleinen Schritten und erproben das Gelernte mit eigenen Inhalten.</p>${step >= 4 && index === 0 ? `<p class="langtext">${long}</p><pre class="code">Dateiliste: ${'beispieldatei.txt  '.repeat(18)}</pre>` : ''}${index === 2 ? `<img class="gruppenbild" src="bilder/beispiel.png" ${step >= 15 ? 'width="32" height="32" ' : ''}alt="Blaues quadratisches Gruppenzeichen">` : ''}</section>`;
  return `<main id="angebote"><h2>Unsere Lernangebote</h2>${step >= 5 ? '<p class="fluss">Wir üben <em>gemeinsam</em> und helfen einander.</p>' : ''}<div class="karten">${['HTML verstehen', 'CSS anwenden', 'Eigene Projekte'].map(card).join('\n')}</div>${step >= 11 ? '<aside class="merkkasten"><h2>Gut zu wissen</h2><p>Wiederholen und ausprobieren gehören zum Lernen.</p></aside>' : ''}</main>`;
}
export function cssCourseFiles(lesson, base, starter = false) {
  const step = lesson.cssStep;
  const files = structuredClone(base);
  for (const name of ['index.html', 'ueber-uns.html']) {
    files[name].content = files[name].content.replace(/<main\b[\s\S]*?<\/main>/, cssMarkup(step));
    if (step >= 9) files[name].content = files[name].content.replace(/<nav>[\s\S]*?<\/nav>/, '<nav><a href="index.html">Startseite</a><a href="ueber-uns.html">Über uns</a><a href="#angebote">Angebote</a></nav>');
    if (step >= 14) files[name].content = files[name].content.replace('</head>', '<meta name="viewport" content="width=device-width, initial-scale=1">\n</head>');
    if (step >= 19) files[name].content = files[name].content.replaceAll('Meine Lernseite', 'Unser Stadtgarten').replaceAll('Unsere Lernangebote', 'Gemeinsam im Stadtgarten').replaceAll('HTML verstehen', 'Pflanzen kennenlernen').replaceAll('CSS anwenden', 'Beete pflegen').replaceAll('Eigene Projekte', 'Ernte teilen');
  }
  files['css/style.css'].content = 'h1 { color:navy; }\nmain { font-family:sans-serif; }\n' + CSS_STYLES.slice(0, step + 1).join('\n');
  if (starter) {
    // Neues Thema wird eingeführt, bisheriger Stand bleibt als Gerüst verfügbar.
    // Die jeweilige Fehlregel gehört zum aktuellen, gerade erklärten Lernziel.
    if (step === 20) files['css/style.css'].content = 'h1 {color:navy;} main {font-family:sans-serif;}\n' + CSS_STYLES.slice(0, 5).join('\n');
    else files['css/style.css'].content += `\n${CSS_BROKEN[step]}`;
  }
  return files;
}
