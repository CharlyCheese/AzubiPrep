import { chapter, refs, taskData } from './shared.js';

export const reportSolution = `function report(tasks, limit) {
  const selected = tasks.filter(task => !task.done && task.minutes <= limit);
  return {
    titles: selected.map(task => task.title),
    count: selected.length,
    minutes: selected.reduce((sum, task) => sum + task.minutes, 0)
  };
}`;

export default chapter(19, 'Projekt 3: JavaScript-Datenwerkstatt', 'Kapitel 18: Callbacks, Arraymethoden und Fehlersuche.', 'Reine Datenverarbeitung; Konsolenausgabe ohne DOM.', refs.arrays, [
  {
    title: 'Den Auftrag in Beispiele übersetzen', goal: 'Aus einem Text eine überprüfbare Spezifikation entwickeln.',
    explain: ['Baue eine Auswertung für eine Lerngruppe. Jede Aufgabe besitzt eine eindeutige numerische id, einen title, positive ganzzahlige minutes und einen Boolean done. Die Daten sind in diesem Projekt vorab gültig. Später behandeln wir unbekannte Eingaben an der Systemgrenze.', 'report(tasks, limit) soll offene Aufgaben mit minutes <= limit auswählen. Das Ergebnis enthält titles in Eingabereihenfolge, count und die Minutensumme. Die Grenze gilt pro Aufgabe, nicht für ein Gesamtbudget. Schreibe Erwartungen auf, bevor du implementierst.'],
    example: taskData,
    task: 'Lege daten.js mit den Beispieldaten an. Notiere die erwarteten Ergebnisse für limit 20, 10 und 5 sowie für []. Plane die drei Teilaufgaben Auswahl, Titel und Summe.',
    hints: ['Bei 20 passen HTML wiederholen und JS lesen, CSS ist erledigt.', '20: count 2, minutes 30; 10: count 1, minutes 10; 5: count 0, minutes 0.'],
    solution: '// Erwartung für die Beispieldaten:\n// limit 20: { titles: ["HTML wiederholen", "JS lesen"], count: 2, minutes: 30 }\n// limit 10: { titles: ["JS lesen"], count: 1, minutes: 10 }\n// limit 5 und leere Liste: { titles: [], count: 0, minutes: 0 }\n// Plan: filter -> map und reduce -> Ergebnisobjekt.',
    criteria: ['Grenze pro Eintrag und inklusive Gleichheit festgehalten.', 'Leere und vollständig erledigte Liste ergeben leeren Bericht.'],
  },
  {
    title: 'Auswertung in kleinen Bausteinen bauen', goal: 'Bekannte Methoden zu einer reinen Funktion verbinden.',
    explain: ['Rein bedeutet hier: Die Funktion hängt nur von den Argumenten ab, verändert sie nicht und greift nicht auf Oberfläche oder Speicherung zu. So kannst du sie später in Konsole, DOM und React wiederverwenden.', 'Implementiere erst die Auswahl und kontrolliere einzelne Titel. Ergänze dann Anzahl und Summe. Kopiere keine vorgegebenen Ergebnisse in Bedingungen; unbekannte neue Listen sollen nach derselben Regel funktionieren.'],
    example: 'const selected = tasks.filter(task => !task.done && task.minutes <= 20);\nconsole.log(selected.length);',
    task: 'Implementiere report(tasks, limit) nach dem Vertrag. Gib die Ergebnisfelder einzeln aus; in der begrenzten Konsole erscheinen ganze Objekte nur als Platzhalter. Benutze keine globale tasks-Liste innerhalb der Funktion.',
    hints: ['Arbeite innerhalb der Funktion mit dem Parameter; die gefilterte Liste braucht einen eigenen Namen.', 'titles mit map, minutes mit reduce und Startwert 0 berechnen.'],
    solution: reportSolution,
    criteria: ['Alle vier vorbereiteten Datenfälle stimmen.', 'Neue Eingabe [{id:9,title:"Neu",minutes:7,done:false}] mit 7 ergibt count 1 und minutes 7.'],
  },
  {
    title: 'Grenzfälle und Mutation untersuchen', goal: 'Die Implementierung mit Gegenbeispielen prüfen.',
    explain: ['Ein Projekt ist nicht nach einem gelungenen Beispiel fertig. Wähle Fälle, die typische Fehler sichtbar machen: genau an der Grenze, knapp darüber, gleiche Titel mit verschiedenen IDs und gemischte Zustände. Gleiche Titel sind erlaubt; sie dürfen nicht unbeabsichtigt zusammenfallen.', 'Für diesen einfachen JSON-kompatiblen Datensatz kannst du JSON später zum Vergleichen verwenden. Hier reicht eine schriftliche Kopie der Werte und Reihenfolge vor und nach dem Aufruf. Wiederholte Aufrufe müssen dasselbe Resultat ergeben.'],
    example: 'const probe = [\n  { id: 1, title: "A", minutes: 10, done: true },\n  { id: 2, title: "A", minutes: 10, done: false },\n  { id: 3, title: "B", minutes: 11, done: false }\n];',
    task: 'Teste probe mit limit 10. Baue absichtlich den Fehler < statt <= ein und weise nach, dass dein Grenztest ihn entdeckt. Stelle die korrekte Fassung wieder her und dokumentiere Originalwerte nach zwei Aufrufen.',
    hints: ['Nur ID 2 gehört in den Bericht.', 'Die fehlerhafte Variante liefert count 0; die korrekte count 1, minutes 10, titles ["A"].'],
    solution: '// Testmatrix:\n// [] / 10 -> [],0,0\n// probe / 10 -> ["A"],1,10\n// alles done:true -> [],0,0\n// zwei offene gleiche Titel -> beide bleiben erhalten\n// zweimaliger Aufruf -> gleiche Ergebnisse, Eingabe unverändert\n' + reportSolution,
    criteria: ['Mindestens fünf dokumentierte Fälle samt Ist-/Sollwert.', 'Absichtlicher Grenzfehler erkannt; keine sort-/splice-Mutation am Original.'],
  },
  {
    title: 'Selbstständiger Transfer und Projektabgabe', goal: 'Die gleiche Denkweise auf neue Daten übertragen.',
    explain: ['Übertrage die Auswertung auf Lagerartikel mit title, stock und cents. Der Bericht soll nur vorrätige Artikel bis zu einem Einzelpreislimit berücksichtigen. Der Lagerwert ist stock * cents, nicht bloß die Summe der Einzelpreise. Geld bleibt hier eine ganze Zahl in Cent.', 'Die Unterstützung wird reduziert: Schreibe zuerst deinen Vertrag und Beispiele, dann die Funktion. Vergleiche die Referenz erst nach deinem Versuch. Eine funktionierende Kopie allein ist kein Kompetenznachweis.'],
    example: 'const items = [{ title: "Stift", stock: 3, cents: 100 }, { title: "Heft", stock: 0, cents: 200 }];\n// Limit 100 -> titles ["Stift"], valueCents 300',
    task: 'Entwickle lagerBericht(items, maxCents) mit titles und valueCents. Gib Quelltext, Testtabelle und eine kurze Erklärung zu Filter, map, reduce und unveränderter Eingabe ab. Dateien extern ordnen; Werkstattabnahme folgt später.',
    hints: ['Der Filter braucht stock > 0 und cents <= maxCents.', 'Die Reduktion addiert item.stock * item.cents, beginnend bei 0.'],
    solution: 'function lagerBericht(items, maxCents) {\n  const selected = items.filter(item => item.stock > 0 && item.cents <= maxCents);\n  return { titles: selected.map(item => item.title),\n    valueCents: selected.reduce((sum, item) => sum + item.stock * item.cents, 0) };\n}',
    criteria: ['Leer, ausverkauft, Preis genau am Limit und oberhalb getestet.', 'Unbekannte neue Daten funktionieren; Entscheidungen ohne Lösung erklären können.'],
  },
]);
