# CSS-Kurs: Kapitel 8–12

Stand: 31.10.2026, FE-026. Der Entwicklungsstand unter `/frontendkurs` enthält
37 Lektionen für Kapitel 1–12. Davon ergänzen 21 Lektionen den CSS-Abschnitt
nach dem praktisch bestätigten Kapitel 7. Formulare (Kapitel 13) und JavaScript
(ab Kapitel 14) sind nicht implementiert. Vor JavaScript bleibt die getrennte
Planung der sicheren Ausführung verbindlich. Es wurden keine Installer gebaut.

## Kursfolge und technische Lernziele

| Kapitel | Lektionen in Reihenfolge | Ergebnis / feste Prüfungen |
|---|---|---|
| 8 | Farben/Kontrast, Typografie, relative Einheiten, Boxmodell, Überlauf | Lesbare Karten; deckende Hex-/RGB-Farben, Textkontrast, Schrift/Zeilenhöhe, wirksame rem-/em-Skalierung, border-box und lokaler statt globaler Überlauf |
| 9 | Dokumentfluss, Display, Flexachsen, Flexumbruch, Navigationsprojekt | Block-/Inline-Unterschied, inline-block, drei getrennte Flexkarten, sinnvoller Umbruch, gepolsterte Flexnavigation auf beiden Seiten |
| 10 | Gridspalten, Rasterbereiche, Positionierung, Übersichtsprojekt | Gleich breite Gridspalten, benannte Bereiche, Merkkasten, oben rechts positioniertes Etikett ohne Überschriftenüberdeckung |
| 11 | Medienregeln, flexible Inhalte, Tastaturfokus, reduzierte Bewegung, responsiver Transfer | Viewport auf beiden Seiten, ein-/dreispaltiger Wechsel, unverzerrtes Beispielbild, sichtbarer Fokus und wirksame Bewegungsreduktion |
| 12 | Eigener Inhaltsentwurf, responsive Website | Neues Thema planen, Inhalte gestalten, Anforderungen kombinieren, prüfen/korrigieren und für den externen Editor exportieren |

Jede Lektion nennt Voraussetzungen, Erklärung, Beispiel, Auftrag, zwei gestufte
Hinweise und eine mögliche Lösung. Vorhersage und Diagnose werden regelmäßig
mit Bauaufgaben verbunden. Kapitel 12 erlaubt eigene Themen, Texte, Klassen,
Dateinamen, gleichwertige Überschriften und eine vollständig bewegungsfreie
Website. Technikmarker in den früheren Vergleichsübungen bleiben dort Teil des
jeweiligen Auftrags. Aufgabenentwürfe sind weiterhin getrennt: eigene Ergebnisse
bewusst exportieren und in der nächsten Aufgabe einlesen.

## Vorschau und Pflichtprüfung

Die Vorschau unterstützt jetzt Flex-/Grid-Eigenschaften, Boxmodell/Überlauf,
Positionierung, Bildverhältnis, Outline und transform-Übergänge. Zulässige
Pseudoklassen: hover, focus, focus-visible, focus-within und root. Medienregeln
sind auf min-/max-width mit px/em/rem und prefers-reduced-motion begrenzt,
auch mit `and`. Maximal 300 Regeln insgesamt und vier Medien-Verschachtelungen.
Kurzformen werden über ihre CSSOM-Langformen erhalten, etwa border, grid-area,
white-space, border-radius und text-decoration. Andere At-Regeln, Verschachtelung
von Selektoren, externe Ressourcen/Schriften und Skripte bleiben gesperrt.
Bildmaße und ein gültiger Viewport werden kontrolliert in die Vorschau übernommen.

Die feste Prüfung baut kurzlebige, außerhalb der Ansicht liegende Kopien der
bereinigten Vorschau auf. Sandbox ohne Skriptfreigabe, CSP und Netzwerkverbote
gelten weiter. Sie wartet auf die lokale Bilddekodierung (höchstens drei Sekunden
je Prüfansicht), bevor sie Geometrie misst. Ergebnisse für zwischenzeitlich
geänderte Entwürfe werden verworfen. Der Inspektor zeigt weitere Layoutwerte
und nur die bei der aktuellen Vorschaugröße aktiven Medienregeln.

Geprüfte responsive Breiten: 360, 768, 960 und 1280 CSS-Pixel; vor responsivem
Layout gelten bewusst die im Auftrag genannten Breiten. Im Referenzentwurf
beginnt die breite Ansicht bei 60rem. Ein zusätzlicher Test mit 20px Wurzelschrift
belegt die Skalierung der rem-Grenze und des em-Innenabstands.

Fokus- und Bewegungszustände werden deterministisch nachgestellt: Im isolierten
Prüf-CSS wird focus-visible für die Messung zu focus normalisiert; Hover wird
mit einer internen Klasse und reduced-motion mit einer gleichwertigen
Medienbedingung aktiviert. Breiten bleiben echte Iframe-Breiten. Übergänge
werden für die Messung an ihren Endzustand geführt. Das verändert weder
Projektdateien noch Systemeinstellungen. Ergänzende Browser-/Electronfälle
prüfen die unveränderte Vorschau mit echter Tastatur und emulierter
Browser-Medieneinstellung, einschließlich Hover bei reduzierter Bewegung.

Feste Kriterien umfassen sichtbare Pflichtinhalte, passende Geometrie,
Kontrast und Unterschiede zwischen Normal-/Fokus-/Hoverzustand. Verstecken,
Abschneiden, negative Auslagerung und eine nur vorhandene, aber überschriebene
Deklaration ersetzen diese Kriterien nicht. Einzelne Lernziele werden gezielt
geprüft; daraus folgt keine Zusage vollständiger HTML-/CSS- oder WCAG-Konformität.
Der Textkontrast der Kartenabsätze beträgt mindestens 4,5:1, der großer
Kartenüberschriften mindestens 3:1. Die Fokusübung verlangt eine kontrastreiche
Outline ab 2px; die Bewegungsübung einen tatsächlich wirksamen Übergang von
0,1–0,5 Sekunden und dessen Abschaltung. Im freien Endprojekt ist Bewegung optional.

## Speicher, KI und Grenzen

Speicherschema und Bewertungen von Kapitel 1–7 bleiben erhalten. Neue Lektionen
tragen `css-8-12.1`; beim Laden werden ihre Entwürfe ergänzt. Die gemeinsame
KI-Begleitung kennt alle 37 IDs und die schrittweise Themenfolge. Flexbox ist
erst ab ihrer Einführungslektion freigegeben, Grid danach; JavaScript und
Frameworks bleiben zurückgestellt. Feste Prüfung/Selbstprüfung vergeben den
Kursstatus; die optionale KI hilft beim Verstehen und benotet nicht.

Private Material-/Kontenablagen wurden für diesen Ausbau weder gelesen noch
verändert. Die bestehenden lokalen RAG-/Cloudgrenzen bleiben unverändert.
Keine zusätzliche Bibliothek, kein Lern-JavaScript und kein neuer Paketbau.

## Nachweise und praktische Abnahme

- 195 Backendtests in 21 Suiten und Backend-Lint erfolgreich, einschließlich
  Themenprogression, Quellen-/Anbietergrenzen und synthetischer Kontentrennung.
- Frontendbuild sowie 54 Browser-/Electronfälle erfolgreich: 24 bisherige
  Werkstattfälle, 24 CSS-Fälle und sechs Desktopfälle einschließlich F12-/IPC-
  Grenzen. Alle 37 Lösungen/Alternativen sind erfasst; die 21 neuen Starter
  bestehen noch nicht. CSS-Fälle enthalten sinnvolle Fehler-/Umgehungsproben,
  H3-Varianten, natürliche Bildmaße ohne HTML-Dimensionen, Speicherübernahme,
  Medienregelgrenzen und echte responsive Vorschauzustände.
- Der frische unabhängige Review `fe026_review` führte zu Nachbesserungen bei
  zweiten Seiten, Sichtbarkeit/Kontrast, Bildladezeit, gleichwertigen Überschriften,
  CSSOM-Kurzformen und präzisen Positionierungs-/Bewegungsnachweisen.

Automatisierte Matrix: vorhandener Windows-/Chromium-/Electron-Entwicklungsstand
mit künstlichen Testprofilen. Keine neue manuelle Installation und kein Nachweis
für weitere Browser/Betriebssysteme. Die praktische Abnahme von Kapitel 7 bleibt
bestätigt; die folgenden Schritte sind für Kapitel 8–12 noch menschlich zu prüfen:

1. Eine Übung pro Kapitel selbst bearbeiten und prüfen, ob die Erklärungen
   verständlich sind und die Rückmeldung beim Korrigieren hilft.
2. Eigenes Thema im Projekt 2 umsetzen; bei Bedarf eigene Dateien/Klassen
   einlesen und die feste Prüfung mit tatsächlich gleichwertigen Lösungen vergleichen.
3. Beide Seiten mit Tab/Enter, 200% Zoom und realer Bewegungspräferenz prüfen;
   Inhalte, Semantik, Alternativtexte, Rechte und Lernverständnis selbst beurteilen.

Diese menschlichen Kriterien werden nicht durch einen grünen Automatentest
ersetzt; sie blockieren den hier freigegebenen technischen Ausbau nicht.

## Fachreferenzen

Je Lektion sind Fachlink und Prüfdatum hinterlegt. Fachabgleich am 31.10.2026:

- [W3C Textkontrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
- [MDN Schriftgestaltung](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Text_styling/Fundamentals),
  [Einheiten](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units),
  [Boxmodell](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Box_model),
  [Überlauf](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Overflow)
- [MDN Fluss](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Display/Flow_layout),
  [Display](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/display),
  [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Basic_concepts),
  [Umbruch](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Flexible_box_layout/Wrapping_items)
- [MDN Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Basic_concepts),
  [Rasterbereiche](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Grid_template_areas),
  [Positionierung](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/position)
- [MDN responsives Design](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/CSS_layout/Responsive_Design),
  [Medienregeln](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media),
  [Fokus](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Selectors/:focus-visible),
  [reduzierte Bewegung](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion)
