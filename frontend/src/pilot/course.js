import { CSS_LESSONS, cssCourseFiles } from './css-course.js';
import { FORM_LESSONS, formCourseFiles } from './form-course.js';
import { JS_LESSONS, jsCourseFiles } from './js-course.js';
import { JS15_LESSONS, js15CourseFiles } from './js15-course.js';
import { JS16_LESSONS, js16CourseFiles } from './js16-course.js';
import { JS17_LESSONS, js17CourseFiles } from './js17-course.js';

export const COURSE_VERSION = 'pilot-1.0';
export const VALIDATOR_VERSION = 'pilot-rules-1.0.1';
export const BLUE_IMAGE = { kind: 'image', content: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAIAAAD8GO2jAAAAKklEQVR4nGPQyNtCU8QwasGoBaMWjFowasGoBaMWjFowasGoBaMWDBULADD+KEyfbA9oAAAAAElFTkSuQmCC' };
const text = (content) => ({ kind: 'text', content });
export const htmlPage = (body, head = '') => `<!doctype html>\n<html lang="de">\n<head>\n  <meta charset="utf-8">\n  <title>Meine Lernseite</title>\n${head}</head>\n<body>\n${body}\n</body>\n</html>\n`;
const heading = '<h1>Meine Lernseite</h1>\n<p>Hier lerne ich Webseiten zu bauen.</p>';
const list = `${heading}\n<ul>\n  <li>HTML verstehen</li>\n  <li>Eigene Seiten bauen</li>\n</ul>`;
const pageLink = '<a href="ueber-uns.html">Über uns</a>';
const image = '<img src="bilder/beispiel.png" alt="Blaues quadratisches Zeichen unserer Lerngruppe">';
const sheet = '<link rel="stylesheet" href="css/style.css">\n';
const css = 'h1 { color: navy; }\np { font-family: sans-serif; }\n';
const selectorCss = 'h1, h2 { color: navy; }\nmain p { color: navy; }\nfooter p { color: maroon; }\nmain > p { background-color: lightyellow; }\n';
const inheritCss = 'h1, h2 { color: navy; }\nmain { color: navy; font-family: serif; background-color: lightyellow; }\nmain > p { background-color: lightyellow; }\nmain em { color: maroon; }\nfooter p { color: maroon; }\n';
function solution(stage) {
  const files = { 'index.html': text(htmlPage(heading)) };
  if (stage >= 3) files['index.html'] = text(htmlPage(list));
  if (stage >= 4) {
    files['index.html'] = text(htmlPage(`${list}\n${pageLink}`));
    files['ueber-uns.html'] = text(htmlPage('<h1>Über unsere Lerngruppe</h1>\n<p>Wir lernen gemeinsam.</p>\n<a href="index.html">Startseite</a>'));
  }
  if (stage >= 5) {
    files['bilder/beispiel.png'] = { ...BLUE_IMAGE };
    files['index.html'].content = htmlPage(`${list}\n${pageLink}\n${image}`);
  }
  if (stage >= 6) files['index.html'].content = htmlPage(`<header><h1>Meine Lernseite</h1></header>\n<nav>${pageLink}</nav>\n<main><h2>Unser Lernziel</h2><p>Wir lernen gemeinsam.</p><ul><li>HTML</li><li>CSS</li></ul>${image}</main>\n<footer>Unsere Lerngruppe</footer>`);
  if (stage >= 7) {
    files['css/style.css'] = text(css);
    for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('</head>', `${sheet}</head>`);
  }
  if (stage >= 8) {
    files['index.html'].content = files['index.html'].content.replace('<p>', '<p class="hinweis">');
    files['css/style.css'].content += '.hinweis { background-color: lightyellow; }\n';
  }
  if (stage >= 11) files['ueber-uns.html'].content = htmlPage(`<header><h1>Über uns</h1></header><nav><a href="index.html">Zur Startseite</a></nav><main><p class="hinweis">Gemeinsam lernen macht Freude.</p>${image}</main><footer>Unsere Gruppe</footer>`, sheet);
  if (stage >= 13) {
    for (const name of ['index.html', 'ueber-uns.html']) {
      files[name].content = files[name].content.replace('</main>', '<section class="vertiefung"><h2>Mehr erfahren</h2><p>Wir üben gemeinsam weiter.</p></section></main>')
        .replace(/<footer>.*?<\/footer>/, '<footer><p>Unsere Lerngruppe</p></footer>');
    }
    files['css/style.css'].content = css + selectorCss;
  }
  if (stage >= 14) files['css/style.css'].content += '.hinweis { color: maroon; }\n.hinweis { color: navy; }\n';
  if (stage >= 15) {
    for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('<p class="hinweis">', '<p id="einstieg" class="hinweis">');
    files['css/style.css'].content += '#einstieg { color: navy; }\n.hinweis { color: maroon; }\n';
  }
  if (stage >= 16) {
    for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('</p>', ' <em>Schritt für Schritt.</em></p>');
    files['css/style.css'].content = inheritCss;
  }
  return files;
}
const refs = {
  html: 'https://wiki.selfhtml.org/wiki/HTML/Tutorials/Einstieg',
  structure: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Basic_HTML_syntax',
  links: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/Creating_links',
  images: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Structuring_content/HTML_images',
  css: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Getting_started',
  selectors: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Selectors/Selectors_and_combinators',
  cascade: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction',
  specificity: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Specificity',
  inheritance: 'https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Inheritance',
};
function lesson(id, chapter, title, prerequisite, explain, example, task, rules, hints, stage, reference = refs.html) {
  return { id, chapter, title, prerequisite, explain, example, task, rules, hints, stage, reference, checked: '2026-10-30', version: COURSE_VERSION };
}
export const LESSONS = [
  lesson('erste-seite', 1, 'Deine erste sichtbare Seite', 'Keine Vorkenntnisse.', [
    'Links steht die Aufgabe. Unter „Schreiben“ bearbeitest du Dateien; unter „Vorschau“ siehst du die Darstellung. HTML beschreibt Inhalte, CSS gestaltet sie. JavaScript macht Seiten interaktiv und kommt erst später.',
    'Ein Element besteht häufig aus Start-Tag, Inhalt und End-Tag. <h1> ist die wichtigste Überschrift; <p> kennzeichnet einen Absatz. Beim End-Tag steht vor dem Namen ein Schrägstrich. Die vorbereitete Dokumenthülle erklären wir in der nächsten Lektion.',
  ], '<h1>Hallo Welt</h1>\n<p>Das ist mein erster Absatz.</p>', 'Übe die beiden eingeführten Elemente: Schreibe eine eigene Hauptüberschrift mit <h1> und einen Textabsatz mit <p>. Deine Texte sind frei wählbar. Schau danach in die Vorschau.', ['heading', 'paragraph'], ['Nutze h1 für die Hauptüberschrift und p für den Absatz.', 'Schreibe beispielsweise <h1>Mein Thema</h1> und darunter <p>Mein erster Text.</p>.'], 1),
  lesson('dokument', 2, 'Das HTML-Dokument verstehen', 'Überschrift, Absatz und Vorschau.', [
    '<!doctype html> kennzeichnet den modernen HTML-Dokumenttyp. Das html-Element umschließt die Seite. Das Attribut lang="de" benennt die Sprache. Attribute ergänzen ein Start-Tag und besitzen hier einen Namen und einen Wert in Anführungszeichen.',
    'Im head stehen Informationen zur Seite: meta charset="utf-8" sorgt für die Zeichencodierung, title benennt den Browser-Tab. Die sichtbaren Inhalte stehen im body. Elemente werden ineinander verschachtelt und in umgekehrter Reihenfolge geschlossen. Die Einrückung hilft beim Lesen.',
  ], htmlPage('<h1>Mein Thema</h1>\n<p>Mein Text.</p>'), 'Vervollständige die Dokumenthülle, einschließlich Sprache, Titel, UTF-8 und sichtbarer Überschrift mit Absatz.', ['document', 'heading', 'paragraph'], ['Vergleiche die Bereiche head und body mit dem Beispiel.', 'Setze oben <!doctype html>, verwende <html lang="de"> und im head <meta charset="utf-8"> sowie <title>Dein Titel</title>.'], 2, refs.structure),
  lesson('listen', 3, 'Zusammengehörige Inhalte als Liste', 'Dokumenthülle, Elemente und Attribute.', [
    'Eine ungeordnete Liste beginnt mit ul. Jeder Eintrag steht in einem li-Element innerhalb der Liste. ol erzeugt stattdessen eine geordnete, nummerierte Liste. Das sind zusammengehörige Inhalte, keine von Hand geschriebenen Aufzählungszeichen.',
    'Wiederholung: Die Hauptüberschrift bleibt ein h1-Element und die Einleitung ein p-Element. Ergänze die Liste innerhalb des body, ohne die Dokumenthülle zu entfernen.',
  ], '<ul>\n  <li>HTML üben</li>\n  <li>Eine eigene Seite bauen</li>\n</ul>', 'Erstelle eine Liste mit mindestens zwei eigenen Lernzielen. Behalte Hauptüberschrift und Einleitung.', ['document', 'heading', 'paragraph', 'list'], ['ul oder ol enthält mehrere li-Elemente.', 'Schreibe <ul><li>Erstes Ziel</li><li>Zweites Ziel</li></ul>.'], 3),
  lesson('zweite-seite', 3, 'Links und die zweite Datei', 'Attribute, Liste und Dokumenthülle.', [
    'Ein Link ist ein a-Element. Das Attribut href benennt sein Ziel. <a href="ueber-uns.html">Über uns</a> verweist auf eine zweite Datei im gleichen Ordner. Der sichtbare Linktext erklärt das Ziel. Bei Webseiten unterscheidet man den Dateinamen vom Inhalt.',
    'Ab jetzt kannst du extern arbeiten: Speichere die Dateien beispielsweise in Notepad++ oder VS Code als UTF-8. Erstelle einen Projektordner und darin beide HTML-Dateien. Wähle anschließend „Ordner einlesen“. Ein eingetippter Pfad genügt nicht. Prüfe den Dateibaum und klicke in der Vorschau auf beide Links. Beim externen Ändern musst du neu einlesen; deine Originale verändert die App nicht.',
  ], `${pageLink}\n<!-- In ueber-uns.html: -->\n<a href="index.html">Zurück zur Startseite</a>`, 'Erstelle eine zweite HTML-Seite. Verlinke beide Seiten gegenseitig. Behalte Überschrift, Absatz und Liste auf deiner Startseite.', ['document', 'heading', 'paragraph', 'list', 'links'], ['Mit „Datei anlegen“ kannst du ueber-uns.html erstellen. Alternativ wähle deinen Projektordner.', 'index.html braucht einen Link zu ueber-uns.html; ueber-uns.html braucht einen Link zurück zu index.html. Beide Dateien enthalten eine vollständige Dokumenthülle.'], 4, refs.links),
  lesson('bilder', 3, 'Bilder und Ordnerpfade', 'Zwei Seiten, href und Dateinamen.', [
    'Ein img-Element bindet ein Bild ein. Es besitzt kein End-Tag. src benennt die Bilddatei. alt beschreibt ihren Inhalt, wenn sie nicht gesehen werden kann. Für rein dekorative Bilder ist alt="" möglich; in dieser Übung zeigt das Bild ein bedeutungsvolles Gruppenzeichen und braucht eine Beschreibung.',
    'bilder/beispiel.png bedeutet: Öffne vom Ordner der HTML-Datei aus den Unterordner bilder und dort die Datei beispiel.png. ../ führt einen Ordner nach oben. Es darf nicht aus dem Projekt hinausführen. Namen und Groß-/Kleinschreibung müssen zum Dateibaum passen. Das blaue Beispielbild kannst du über „Beispielbild ergänzen“ übernehmen oder ein eigenes Rasterbild einlesen.',
  ], image, 'Binde auf der Startseite ein Bild aus einem Unterordner mit passendem Alternativtext ein. Prüfe Darstellung und Pfad.', ['document', 'heading', 'links', 'image'], ['Prüfe den exakten Bildpfad im Dateibaum.', 'Verwende beispielsweise <img src="bilder/beispiel.png" alt="Blaues Zeichen unserer Lerngruppe">.'], 5, refs.images),
  lesson('struktur', 4, 'Inhalte mit Bedeutung gliedern', 'Links, Bilder, Listen und Attribute.', [
    'header kennzeichnet den Kopfbereich, nav die Navigation, main den Hauptinhalt und footer den Abschluss. Diese Elemente beschreiben Aufgaben von Inhalten. Sie ersetzen keine Überschrift. h2 ist eine Unterüberschrift unterhalb von h1.',
    'Im Modus „Element untersuchen“ zeigt ein Klick den ausgewählten HTML-Ausschnitt. Ordne deine vorhandenen Inhalte passenden Bereichen zu. Das Aussehen muss dabei noch nicht verändert werden.',
  ], '<header><h1>Unsere Gruppe</h1></header>\n<nav><a href="ueber-uns.html">Über uns</a></nav>\n<main><h2>Unser Ziel</h2><p>Gemeinsam lernen.</p></main>\n<footer>Unsere Gruppe</footer>', 'Gliedere die Startseite mit header, nav, main und footer. Verwende im Hauptinhalt eine Unterüberschrift, Absatz und dein Bild.', ['document', 'heading', 'links', 'image', 'semantic'], ['Verschiebe vorhandene Inhalte in passende Bereiche; lege nicht alles neu an.', 'Setze die Hauptüberschrift in header, den Seitenlink in nav, die eigentlichen Inhalte in main und einen Abschlusstext in footer.'], 6),
  lesson('stylesheet', 5, 'Eine CSS-Datei für beide Seiten', 'Semantische HTML-Seite und relative Pfade.', [
    'CSS steht für Cascading Style Sheets. Eine Regel besteht aus Selektor und Deklarationen: h1 { color: navy; }. h1 wählt die Überschriften aus, color ist die Eigenschaft und navy ihr Wert. Der Doppelpunkt trennt Eigenschaft und Wert; ein Semikolon beendet die Deklaration.',
    'Lege css/style.css an. Ein link-Element im head verbindet HTML und CSS. rel="stylesheet" beschreibt die Beziehung und href den Dateipfad. Beide HTML-Seiten können dieselbe Datei verwenden. Schrift legst du beispielsweise mit font-family: sans-serif fest. In dieser Einführung verwenden wir benannte Farben; ihre weiteren Schreibweisen kommen später.',
  ], `${sheet}\n/* In css/style.css: */\nh1 { color: navy; }\np { font-family: sans-serif; }`, 'Binde dieselbe externe CSS-Datei auf beiden Seiten ein. Gestalte die h1-Farbe und die Schrift der Absätze.', ['document', 'heading', 'links', 'image', 'semantic', 'css'], ['link gehört in den head; die CSS-Regeln gehören in eine Datei mit Endung .css.', 'Füge auf beiden Seiten <link rel="stylesheet" href="css/style.css"> ein. Schreibe h1 { color: navy; } und p { font-family: sans-serif; } in die CSS-Datei.'], 7, refs.css),
  lesson('klassen', 5, 'Gezielt mit Klassen gestalten', 'Selektor, CSS-Regel, externe Stylesheets.', [
    'Das class-Attribut ordnet einem HTML-Element eine Klasse zu. In CSS wählt ein Punkt vor dem Klassennamen die Klasse aus: .hinweis. So kann eine Regel mehrere ausgewählte Elemente gestalten, ohne alle Absätze zu verändern.',
    'background-color färbt den Hintergrund. Wiederholung: color färbt dagegen den Text. Untersuche einen Absatz und vergleiche passende Regeln mit der berechneten Darstellung. Der Inspektor zeigt auch Abstände; deren genaue Gestaltung folgt in späteren Kapiteln.',
  ], '<p class="hinweis">Diesen Hinweis beachten.</p>\n/* CSS: */\n.hinweis { background-color: lightyellow; }', 'Gib einem Absatz die Klasse hinweis und gestalte diese Klasse mit einer Hintergrundfarbe.', ['document', 'heading', 'links', 'image', 'semantic', 'css', 'class'], ['class="hinweis" steht im Start-Tag des Absatzes, .hinweis ist der CSS-Selektor.', 'Ergänze .hinweis { background-color: lightyellow; } in deiner CSS-Datei.'], 8, refs.css),
  lesson('wiederholung', 5, 'Wiederholung: einen Pfadfehler finden', 'Alle bisherigen HTML-/CSS-Themen.', [
    'Eine Seite kann korrektes HTML enthalten und trotzdem ein Bild nicht anzeigen: Häufig stimmt der Dateipfad nicht. Lies zuerst die Rückmeldung, vergleiche dann Dateibaum und src. Ändere nur die Ursache.',
    'Vorhersage: Welche Datei sucht src="bild/beispiel.png", wenn dein Ordner bilder heißt? Erkläre dir selbst den Unterschied. Hinweise und Musterlösung dürfen helfen; ein späterer Transfer zeigt dein eigenes Verständnis.',
  ], '<!-- Ordner: bilder/ -->\n<img src="bild/beispiel.png" alt="Unser Gruppenzeichen">', 'Behebe den vorbereiteten Bildpfadfehler. Verändere die anderen bereits funktionierenden Inhalte nicht.', ['document', 'heading', 'links', 'image', 'semantic', 'css', 'class'], ['Vergleiche bild/ und bilder/.', 'Korrigiere src auf bilder/beispiel.png.'], 9, refs.images),
  lesson('transfer', 6, 'Transfer: die Lerngruppe vorstellen', 'Pfadfehler selbst eingrenzen, Klassen und HTML-Struktur.', [
    'Übertrage deine Kenntnisse auf eine andere Aufgabenstellung: Die zweite Seite soll eure Lerngruppe vorstellen. Plane zuerst Überschrift, Navigation, Hauptinhalt und Abschlusstext. Verwende dieselbe CSS-Datei weiter.',
    'Arbeite zunächst ohne Musterlösung. Prüfe danach beide Seiten mit Tastatur und Vorschau. Das Ändern eines bekannten Beispiels ist eine Vorbereitung; selbstständiges Anwenden auf neue Inhalte ist der Kompetenznachweis.',
  ], '<!-- Skizziere die Bereiche zuerst in eigenen Worten. -->', 'Ergänze auch auf der zweiten Seite semantische Bereiche, einen beschreibenden Absatz und das Gruppenbild. Beide Seiten sollen zur jeweils anderen führen.', ['document', 'heading', 'links', 'image', 'semantic', 'css', 'class', 'project'], ['Verwende auf der zweiten Seite die bekannten Bereiche header, nav, main und footer.', 'Das Bild kann auf beiden Seiten denselben Pfad verwenden, wenn beide HTML-Dateien im Hauptordner liegen.'], 11),
  lesson('informationswebsite', 6, 'Projekt: unsere Informationswebsite', 'Abgeschlossene Lernstrecke bis zum Transfer.', [
    'Erstelle eine kleine Informationswebsite zu einem selbst gewählten Thema. Pflicht: zwei vollständige HTML-Seiten, gegenseitige Navigation, sinnvolle Überschriften/Absätze, semantische Bereiche, eine h2-Unterüberschrift im Hauptinhalt der Startseite, eine gemeinsame CSS-Datei und ein bedeutungsvolles Bild aus einem Unterordner auf beiden Seiten.',
    'Verlangte Techniken: relative Links, externer Stylesheet-Link, Textfarbe/Schrift und eine mit class zugeordnete Hintergrundfarbe. Frei bleiben Thema, Texte, Dateinamen, benannte Farben und genaue Gestaltung. Empfehlungen: verständliche Linktexte, gut lesbare Farben und kurze klare Absätze. Eine pixelgenaue Musteransicht gibt es nicht.',
    'Selbstprüfung: Navigiere mit Tab und Enter durch beide Seiten. Passt der Alternativtext zum Bild? Sind die Inhalte verständlich gegliedert? Erkläre dir die Pfade und eine CSS-Regel. Automatische Tests beurteilen weder die Textqualität noch vollständige Barrierefreiheit.',
  ], '<!-- Verwende die bereits gelernten Techniken und deine eigenen Inhalte. -->', 'Setze den Projektauftrag um, prüfe ihn, korrigiere Fehler und exportiere anschließend dein Projekt.', ['document', 'heading', 'links', 'image', 'semantic', 'css', 'class', 'project'], ['Arbeite zuerst die HTML-Struktur ab, danach Pfade und schließlich die gemeinsame Gestaltung.', 'Prüfe auf beiden Seiten head/link, nav/a, main/p und img. Die Klasse hinweis ist nur ein Beispiel; jede passend verwendete Klasse ist erlaubt.'], 12),
];

const cssBase = ['document', 'heading', 'links', 'image', 'semantic', 'css', 'project'];
const chapter7 = (id, title, prerequisite, explain, example, task, rule, hints, stage, reference) => ({
  ...lesson(id, 7, title, prerequisite, explain, example, task, [...cssBase, rule], hints, stage, reference),
  version: 'css-7.1', checked: '2026-10-31',
});
LESSONS.push(
  chapter7('selektoren', 'Selektoren: gemeinsam und gezielt', 'Informationswebsite mit zwei Seiten und gemeinsamem Stylesheet.', [
    'Du arbeitest an der bekannten Website weiter. Jede Aufgabe hat einen eigenen Entwurf. Die vorbereitete Fortsetzung enthält zusätzlich einen Abschnitt section mit einem Absatz. section bündelt thematisch zusammengehörige Inhalte mit einer Überschrift. Eigene Projekte kannst du über die vorhandene Sicherung oder den Ordnerimport übernehmen; ergänze dann die verlangten Übungsinhalte.',
    'h1, h2 ist eine Selektorliste: Beide Überschriftentypen erhalten dieselben Deklarationen. main p wählt alle Absätze innerhalb von main, auch in tieferen Ebenen. main > p wählt dagegen nur direkte Absatzkinder von main. Das Zeichen > bezeichnet eine Beziehung; es erhöht nicht selbst die Spezifität. Die genaue Gewichtung folgt gleich. Für die Pflichtprüfungen in Kapitel 7 stehen alle CSS-Regeln in den eingebundenen externen Dateien, ohne style-Attribute, style-Blöcke oder !important.',
    'Vorhersage: Trifft main > p auch den Absatz innerhalb von section? Prüfe danach beide Absätze in der Vorschau und mit „Element untersuchen“. Der Inspektor zeigt passende Regeln und berechnete Werte; die gewinnende Regel musst du daraus noch selbst erschließen.',
  ], 'h1, h2 { color: navy; }\nmain p { color: navy; }\nmain > p { background-color: lightyellow; }\nfooter p { color: maroon; }',
  'Behalte beide Projektseiten. Gestalte auf der Startseite h1 und h2 gemeinsam mit einer Selektorliste in navy. Färbe alle Absätze in main über einen Nachfahrenselektor navy und die Fußzeilenabsätze maroon. Gib direkten Absatzkindern von main über > den Hintergrund lightyellow; der Absatz in section bleibt ohne eigenen Hintergrund. Behalte mindestens einen direkten und einen in section verschachtelten Absatz. Diese festen Farben dienen hier dem Vergleich.',
  'css-selectors', ['Vergleiche main p mit main > p am verschachtelten Absatz.', 'Verwende eine gemeinsame Regel h1, h2 und die Regeln aus dem Beispiel in deiner externen CSS-Datei.'], 13, refs.selectors),
  chapter7('reihenfolge', 'Kaskade: bei Gleichstand zählt die Reihenfolge', 'Selektorlisten, Nachfahren und direkte Kinder.', [
    'Die Kaskade bestimmt für jede Eigenschaft, welche passende Deklaration gewinnt. Wir betrachten normale Regeln aus unseren eigenen Stylesheets, ohne !important, Inline-Stile, Ebenen oder Animationen. Innerhalb dieses Rahmens entscheidet zuerst die Spezifität; bei gleicher Spezifität gilt die später stehende Deklaration. „Die letzte Regel gewinnt immer“ wäre deshalb falsch.',
    'Zwei Regeln mit demselben Selektor .hinweis haben gleiche Spezifität. Ihre Reihenfolge entscheidet über color. Andere Eigenschaften wie background-color werden unabhängig davon ermittelt. Sage erst voraus, welcher Wert gewinnt; ändere dann nur die Reihenfolge und vergleiche die Vorschau.',
  ], '.hinweis { color: maroon; }\n.hinweis { color: navy; }',
  'Der Hinweisabsatz auf der Startseite soll navy sein. Behalte zwei normale .hinweis-Regeln mit unterschiedlichen color-Werten navy und maroon und ordne sie passend an. Verwende keine ID-Farbregel, Inline-Stile oder !important. Erkläre dir beim Untersuchen, warum die spätere dieser gleich gewichteten Regeln gewinnt.',
  'css-order', ['Prüfe beide .hinweis-Regeln in der CSS-Datei von oben nach unten.', 'Die Regel .hinweis { color: navy; } gehört hinter die gleich gewichtete maroon-Regel.'], 14, refs.cascade),
  chapter7('spezifitaet', 'Spezifität: ID, Klasse und Typ', 'Kaskade und Reihenfolge bei gleichem Gewicht.', [
    'id="einstieg" benennt ein Element eindeutig innerhalb einer HTML-Seite. Dieselbe ID darf in einer anderen Seite wieder vorkommen. #einstieg wählt diese ID aus. Klassen können viele Elemente gemeinsam tragen. Nutze für wiederverwendbare Gestaltung meist Klassen; eine ID ist hier ein bewusstes Lernbeispiel für einen Konflikt.',
    'Für unsere einfachen Selektoren vergleichen wir drei Spalten: IDs, Klassen, Typen. #einstieg hat (1,0,0), .hinweis (0,1,0), main p (0,0,2). Verglichen wird von links nach rechts, nicht als Dezimalpunktzahl. Viele Typen überholen keine Klasse, viele Klassen keine ID. Leerzeichen, > und * erhöhen das Gewicht nicht. Eine Selektorliste wird pro passendem Teil betrachtet.',
    'Die frühere ID-Regel kann eine später stehende Klassenregel überstimmen. !important ist keine höhere Spezifität, sondern greift an einer früheren Stelle der Kaskade ein. Wir lösen diesen Konflikt durch verständliche Selektoren und Werte, ohne !important oder weitere IDs hinzuzufügen.',
  ], '#einstieg { color: navy; }\n.hinweis { color: maroon; }',
  'Der direkte Hauptinhalt-Absatz hat id="einstieg" und class="hinweis". Er soll navy sein, obwohl die spätere Klassenregel maroon vorgibt. Behalte die beiden gegensätzlichen normalen Farbregeln; korrigiere den Wert der ID-Regel. Die ID einstieg darf auf jeder Seite nur einmal vorkommen. Erkläre, weshalb hier die Reihenfolge allein nicht hilft.',
  'css-specificity', ['Vergleiche zuerst die ID-Spalte, dann erst Klasse und Typ.', 'Setze #einstieg { color: navy; } vor .hinweis { color: maroon; }.'], 15, refs.specificity),
  chapter7('vererbung', 'Vererbung: Werte vom Elternelement', 'Spezifität und direkt passende Regeln.', [
    'color und font-family werden normalerweise vererbt: Ohne eigene Festlegung erhält ein Element den berechneten Wert seines Elternelements. Ein direkt am Kind gesetzter Wert ersetzt diesen geerbten Wert, auch wenn der Selektor am Elternteil eine höhere Spezifität besitzt. Vererbung ist kein Wettstreit zwischen Eltern- und Kindselektor.',
    'background-color wird dagegen nicht vererbt. Ein transparenter Kindhintergrund lässt den Hintergrund dahinter durchscheinen; das ist keine Vererbung der Hintergrundfarbe. em hebt einen Text sprachlich hervor und wird üblicherweise kursiv dargestellt. Hier verwenden wir es zusätzlich, um eine direkte Farbausnahme am Kind zu untersuchen.',
    'Nutze zunächst nur main für die Grundschrift und Grundfarbe. Eine vorhandene p-Regel für font-family verhindert, dass ein Absatz diese Schrift erbt. Entferne solche widersprechenden Direktregeln. Vergleiche main, seinen direkten Absatz und das enthaltene em im Inspektor.',
  ], 'main { color: navy; font-family: serif; background-color: lightyellow; }\nmain em { color: maroon; }',
  'Setze am main der Startseite color: navy, font-family: serif und background-color: lightyellow. Sein direkter Absatz soll Farbe und Schrift erben: Entferne dafür alle direkt am Absatz passenden color-/font-family-Deklarationen. Ein em mit eigenem Text in diesem Absatz erhält direkt maroon. Es bekommt keine eigene Hintergrundfarbe. Behalte die übrigen Projektinhalte.',
  'css-inheritance', ['Eine direkt passende p- oder .hinweis-Farb-/Schriftregel verhindert die geforderte Vererbung.', 'Entferne die p-Schrift und die Absatz-Farbregeln. Setze die Grundwerte an main, die Ausnahme an main em.'], 16, refs.inheritance),
  chapter7('css-diagnose', 'Mini-Projekt: eine widersprüchliche Gestaltung reparieren', 'Alle vier CSS-Übungen dieses Kapitels.', [
    'Übertrage die Fehlersuche auf beide Seiten deiner Informationswebsite. Lies zuerst den Auftrag, sage die Darstellung voraus und untersuche passende Regeln. Korrigiere anschließend die Ursache. Du darfst unnötige Konfliktregeln entfernen oder gezielt ändern. Deine Texte, Dateinamen und Klassen bleiben frei wählbar.',
    'Arbeite zuerst ohne Musterlösung. Prüfe danach beide Seiten in der Vorschau. Selbstprüfung: Erkläre eine Selektorbeziehung, einen Gleichstand, einen Spezifitätskonflikt und den Unterschied zwischen Vererbung und durchsichtigem Hintergrund. Die feste Prüfung kontrolliert Technik und Darstellung, nicht deine mündliche Erklärung. Exportiere das Ergebnis für deinen externen Editor.',
  ], '/* Erst untersuchen: Welche Regel trifft den Absatz direkt? */\nmain { color: navy; font-family: serif; }\np { color: maroon; font-family: sans-serif; }',
  'Repariere beide Seiten: Jedes main erhält navy als Textfarbe, serif als Schrift und lightyellow als Hintergrund. Mindestens ein direkter Absatz pro main erbt Farbe und Schrift, enthält ein direkt maroon gefärbtes em und dieses em bleibt ohne eigenen Hintergrund. Behalte zwei vollständige, gegenseitig verlinkte Seiten mit semantischen Bereichen und Bildern. Entferne die störenden Absatzregeln. Vergleiche, begründe und exportiere deine Website.',
  'css-transfer', ['Untersuche einen Absatz auf jeder Seite: Welche Werte kommen von main, welche direkt vom Absatz?', 'Die Musterregel main setzt die Grundwerte. Entferne direkt passende Absatz-Farb-/Schriftregeln; main em darf die Farbe direkt ändern.'], 17, refs.inheritance),
);

LESSONS.push(...CSS_LESSONS);
LESSONS.push(...FORM_LESSONS);
LESSONS.push(...JS_LESSONS);
LESSONS.push(...JS15_LESSONS);
LESSONS.push(...JS16_LESSONS);
LESSONS.push(...JS17_LESSONS);

export function solutionFor(lesson) {
  if (lesson.chapter === 17 && lesson.jsStep) return js17CourseFiles(lesson);
  if (lesson.chapter === 16 && lesson.jsStep) return js16CourseFiles(lesson);
  if (lesson.chapter === 15 && lesson.jsStep) return js15CourseFiles(lesson);
  if (lesson.jsStep) return jsCourseFiles(lesson);
  if (lesson.formStep !== undefined) return formCourseFiles(lesson, cssCourseFiles(CSS_LESSONS.at(-1), solution(17)));
  return lesson.cssStep !== undefined ? cssCourseFiles(lesson, solution(17)) : structuredClone(solution(lesson.stage));
}
export function starterFor(lesson) {
  if (lesson.chapter === 17 && lesson.jsStep) return js17CourseFiles(lesson, true);
  if (lesson.chapter === 16 && lesson.jsStep) return js16CourseFiles(lesson, true);
  if (lesson.chapter === 15 && lesson.jsStep) return js15CourseFiles(lesson, true);
  if (lesson.jsStep) return jsCourseFiles(lesson, true);
  if (lesson.formStep !== undefined) return formCourseFiles(lesson, cssCourseFiles(CSS_LESSONS.at(-1), solution(17)), true);
  if (lesson.cssStep !== undefined) return cssCourseFiles(lesson, solution(17), true);
  if (lesson.stage === 1) return { 'index.html': text(htmlPage('<!-- Schreibe hier deine Überschrift und deinen Absatz. -->')) };
  if (lesson.stage === 2) return { 'index.html': text('<h1>Meine Lernseite</h1>\n<p>Meine Einleitung.</p>') };
  const files = solution(Math.max(1, lesson.stage - 1));
  if (lesson.stage === 13) {
    const prepared = solution(13);
    prepared['css/style.css'].content = css;
    return prepared;
  }
  if (lesson.stage === 14) files['css/style.css'].content += '.hinweis { color: navy; }\n.hinweis { color: maroon; }\n';
  if (lesson.stage === 15) {
    for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('<p class="hinweis">', '<p id="einstieg" class="hinweis">');
    files['css/style.css'].content += '#einstieg { color: maroon; }\n.hinweis { color: maroon; }\n';
  }
  if (lesson.stage === 16) {
    for (const name of ['index.html', 'ueber-uns.html']) files[name].content = files[name].content.replace('</p>', ' <em>Schritt für Schritt.</em></p>');
    files['css/style.css'].content += 'main { color: navy; font-family: serif; background-color: lightyellow; }\nmain em { color: maroon; }\n';
  }
  if (lesson.stage === 17) files['css/style.css'].content += 'p { color: maroon; font-family: sans-serif; }\n';
  if (lesson.stage === 9) files['index.html'].content = files['index.html'].content.replace('src="bilder/', 'src="bild/');
  return files;
}
