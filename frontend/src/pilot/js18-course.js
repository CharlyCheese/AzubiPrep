import prepared18 from './prepared/ch18.js';

const ids18 = ['js18-callback', 'js18-filter', 'js18-map', 'js18-pfeile', 'js18-suchen', 'js18-reduce-sort', 'js18-fehler', 'js18-debugspur'];
const output18 = [
  '',
  '\nconst auswahl = offene(aufgaben);\nconsole.log(auswahl.length);\nfor (const task of auswahl) console.log(task.title);',
  '\nconst titel = titelListe(aufgaben);\nconsole.log(titel.length);\nfor (const name of titel) console.log(name);',
  '\nconst quadrate = positiveQuadrate(zahlen);\nconsole.log(quadrate.length);\nfor (const wert of quadrate) console.log(wert);',
  '\nconst erste = ersteOffene(aufgaben);\nif (erste === undefined) console.log("keine");\nelse console.log(erste.title);\nconsole.log(hatOffene(aufgaben));\nconsole.log(fertig(aufgaben));',
  '\nconst minuten = gesamt(aufgaben);\nconst sortiert = nachDauer(aufgaben);\nconsole.log(minuten);\nconsole.log(sortiert.length);\nfor (const task of sortiert) console.log(task.title);',
  '',
  '\nconsole.log(summe(zahlen));',
];
const tasks18 = [
  prepared18.lessons[0].task,
  'Schreibe offene(liste) nach der Erklärung. Speichere offene(aufgaben) in const auswahl. Gib zuerst auswahl.length und danach jeden title einzeln in Eingabereihenfolge aus. Keine Änderung der übergebenen Liste oder Aufgaben.',
  'Schreibe titelListe(liste) nach der Erklärung. Speichere titelListe(aufgaben) in const titel. Gib zuerst titel.length und danach jeden Titel einzeln aus. Auch erledigte Aufgaben werden hier umgeformt. Die Eingabe bleibt unverändert.',
  'Schreibe positiveQuadrate(liste): erst Werte > 0 auswählen, dann quadrieren. Verwende zum Üben filter/map mit Pfeilfunktionen. Speichere positiveQuadrate(zahlen) in const quadrate; gib ihre Länge und jeden Ergebniswert einzeln aus. Eingabe unverändert.',
  'Schreibe ersteOffene(liste), hatOffene(liste) und fertig(liste) nach der Erklärung. Speichere ersteOffene(aufgaben) in const erste. Gib ihren title aus, bei undefined stattdessen "keine". Danach hatOffene(aufgaben) und fertig(aufgaben) jeweils als Boolean ausgeben. Eingabe unverändert.',
  'Schreibe gesamt(liste) und nachDauer(liste). Speichere die Summe in const minuten und die neue Sortierliste in const sortiert. Gib minuten, sortiert.length und danach jeden title in aufsteigender Minutenreihenfolge einzeln aus. Bei gleicher Dauer bleibt die ursprüngliche Reihenfolge erhalten; Eingabe unverändert.',
  prepared18.lessons[6].task,
  'Untersuche die fehlerhafte Schleife in der geführten Spur. Notiere den ersten ungültigen Index. Korrigiere in deiner Datei die Bedingung von <= zu <; behalte function summe(liste) und die übrige Schleifenstruktur bei. Gib anschließend summe(zahlen) einmal aus. Prüfe auch die leere Liste. Die feste Prüfung kontrolliert die Funktionskorrektur, die Selbsteinschätzung zusätzlich dein Verständnis der Spur.',
];

export const JS18_LESSONS = prepared18.lessons.map((base, index) => {
  let explain = [...base.explain];
  if (index === 1) explain.push('Die festen Beispielaufgaben verwenden id als Kennung, title als Titel, minutes als Dauer und done als erledigt-Boolean. Die Konstanten zeigt die Kurskonsole an. Ganze Arrays/Objekte bleiben dort Platzhalter; gib Länge und Titel einzeln aus. Die festen Prüfungen verwenden außerdem andere Listen.');
  if (index === 7) explain = [
    base.explain[0],
    'Öffne hier die geführte Debugger-Spur. Sie zeigt ausschließlich das fest eingebaute Kursbeispiel, unabhängig von deinem Editor. Setze den Haltepunkt vor total += liste[i], halte bei jedem Durchlauf an und vergleiche i, total und liste[i]. Beim letzten fehlerhaften Durchlauf ist liste[i] undefined; die Addition führt zu NaN.',
    'Mit „Einzelner Schritt“ bewegst du dich durch das feste Beispiel; „Bis zum Haltepunkt“ läuft bis zum nächsten gewählten Halt. Der dargestellte Scope und die Aufrufkette gehören zu dieser Modellspur. Der freie Debugger für beliebigen eigenen Code folgt gesondert. Deine eigene Korrektur läuft weiterhin ausschließlich in QuickJS und wird getrennt geprüft.',
  ];
  return {
    ...base, id: ids18[index], chapter: 18, jsStep: true, stage: 700,
    version: 'js-18.1', status: 'Übung eingebunden', explain, task: tasks18[index],
    prerequisite: index === 0 ? prepared18.prerequisite : `Vorherige Lektion: ${prepared18.lessons[index - 1].title}.`,
    solution: base.solution + output18[index], rules: ['js-link', 'js-run', 'js-result'],
    traceStep: index === 7,
    criteria: index === 7 ? ['Die korrigierte Funktion besteht leere, positive und gemischte Zahlenlisten ohne Mutation.', 'In der geführten Spur den ersten ungültigen Index, NaN und den Halt vor der Addition erklären. Freier Quellcodedebugger bleibt separat.'] : base.criteria,
    reference: index === 7 ? 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Debugging_JavaScript' : base.reference,
  };
});

export function js18CourseFiles(lesson, starter = false) {
  let source = lesson.solution;
  if (starter) source = lesson.traceStep
    ? 'function summe(liste) {\n  let total = 0;\n  for (let i = 0; i <= liste.length; i++) {\n    total += liste[i];\n  }\n  return total;\n}\nconsole.log(summe(zahlen));\n'
    : '// Löse hier die Aufgabe.\n// Angezeigte Testkonstanten sind bereits gegeben.\n';
  return {
    'index.html': { kind: 'text', content: '<!doctype html>\n<html lang="de">\n<head>\n<meta charset="utf-8">\n<title>Arraymethoden und Fehlersuche</title>\n<script src="js/uebung.js" defer></script>\n</head>\n<body><h1>Daten verarbeiten und Fehler finden</h1><p>Starte dein Programm bewusst in der Kurskonsole.</p></body>\n</html>' },
    'js/uebung.js': { kind: 'text', content: source + '\n' },
  };
}
