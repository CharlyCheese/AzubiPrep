export const PREPARED_STATUS = 'Inhaltlich vorbereitet · technische/praktische Abnahme offen';
export const refs = {
  arrays: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
  functions: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions',
  errors: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling',
  debug: 'https://developer.chrome.com/docs/devtools/javascript',
  dom: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/DOM_scripting',
  events: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events',
  forms: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Forms/Form_validation',
  storage: 'https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API',
  json: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON',
  async: 'https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Promises',
  fetch: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
  modules: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules',
  git: 'https://git-scm.com/book/en/v2/Git-Basics-Recording-Changes-to-the-Repository',
  npm: 'https://docs.npmjs.com/cli/v11/commands/npm-ci',
  vite: 'https://vite.dev/guide/',
  tests: 'https://nodejs.org/api/test.html',
  a11y: 'https://www.w3.org/WAI/tutorials/forms/notifications/',
  performance: 'https://developer.mozilla.org/en-US/docs/Web/API/Performance/now',
  ts: 'https://www.typescriptlang.org/docs/handbook/2/everyday-types.html',
  narrow: 'https://www.typescriptlang.org/docs/handbook/2/narrowing.html',
  react: 'https://react.dev/learn',
  effects: 'https://react.dev/learn/synchronizing-with-effects',
  routing: 'https://reactrouter.com/6.30.1/start/tutorial',
  publish: 'https://vite.dev/guide/static-deploy.html',
};

export function chapter(number, title, prerequisite, environment, reference, units) {
  return {
    number, title, prerequisite, environment, reference,
    lessons: units.map((unit, index) => ({
      ...unit, id: `prepared-${number}-${index + 1}`, chapter: number,
      prerequisite: index === 0 ? prerequisite : `Vorherige Lektionen dieses Kapitels, zuletzt: ${units[index - 1].title}.`,
      reference: unit.reference || reference, status: PREPARED_STATUS, version: 'content-1.0', checked: '2026-10-31',
    })),
  };
}

// Ausschließlich öffentliche, erfundene Kursdaten. Keine Laufzeitfreigabe.
export const taskData = `const tasks = [
  { id: 1, title: "HTML wiederholen", minutes: 20, done: false },
  { id: 2, title: "CSS üben", minutes: 30, done: true },
  { id: 3, title: "JS lesen", minutes: 10, done: false }
];`;

export const plannerHtml = `<!doctype html>
<html lang="de"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Lernplan</title><script src="app.js" defer></script></head>
<body><main><h1>Mein Lernplan</h1>
<form id="task-form">
<label for="title">Lernziel</label><input id="title" required maxlength="80">
<label for="minutes">Minuten</label><input id="minutes" type="number" min="1" max="240" step="1" required>
<button>Hinzufügen</button></form>
<p id="message" role="status"></p><ul id="tasks"></ul>
<p id="summary"></p></main></body></html>`;
