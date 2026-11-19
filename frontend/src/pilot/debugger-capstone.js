export function initialDebuggerCapstoneProject() {
  return {
    schema: 1, mode: 'module', entry: 'main.js',
    html: '<h1>Mein Lernplan: das Gesamtprojekt</h1>\n<p>Verwalte bis zu sechs Aufgaben. Alle Antworten und der Übungsspeicher bleiben in diesem Debuglauf.</p>\n<form id="task-form"><label for="task-title">Aufgabe</label><input id="task-title" type="text" placeholder="Zum Beispiel SQL üben"><label for="task-minutes">Minuten (1–240)</label><input id="task-minutes" type="text" value="25"><button type="submit">Aufgabe hinzufügen</button></form>\n<ul id="task-list"></ul>\n<p id="task-count">Noch keine Aufgaben angezeigt.</p>\n<div class="actions"><button id="save" type="button">Im Übungsspeicher sichern</button><button id="restore" type="button">Gesicherten Stand lesen</button></div>\n<div class="actions"><button id="load-slow" type="button">Langsam laden</button><button id="load-fast" type="button">Schnell laden</button><button id="load-invalid" type="button">Ungültige Daten laden</button><button id="cancel-load" type="button">Laden abbrechen</button></div>\n<p id="status">Der Lernplan wird vorbereitet.</p>\n<h2>So probierst du den Debugger aus</h2>\n<p>Übernimm die Texteingaben in die Debugvorschau, füge eine Aufgabe hinzu und sichere den Stand. Entferne eine Aufgabe und lies den gesicherten Stand wieder ein.</p>\n<p>Setze in main.js einen Halt vor fetch und vor tasks = loaded. Setze in data.js einen Halt am Anfang von validateState. Vergleiche den Aufrufparameter mit den geprüften Aufgaben und nutze Einzelner Schritt, Funktion überspringen und Weiter.</p>\n<p>Starte Langsam laden und setze bis zur Ereignisbereitschaft fort. Starte dann Schnell laden: Die Ausgabe „Geladen: Schnelle Antwort“ und zwei Aufgaben bleiben erhalten. Lade erneut langsam und brich ab; die Liste bleibt unverändert. Ungültige Daten werden vor der Übernahme abgewiesen.</p>',
    css: 'body { font-family: sans-serif; padding: 16px; color: #163344; background-color: #f3f7fa; }\nform { display: flex; flex-direction: column; gap: 8px; max-width: 420px; }\ninput, button { font-size: 16px; padding: 10px; }\n.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }\nul { padding-left: 0; list-style-type: none; }\n.task { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 10px; margin-bottom: 8px; background-color: #ffffff; border-width: 1px; border-style: solid; border-color: #28776b; }\n.task span { overflow-wrap: anywhere; min-width: 0; }\n#status { padding: 12px; background-color: #d1f3ec; }',
    fixtures: { schema: 1, routes: [
      { path: '/uebung/langsam', kind: 'http', status: 200, delayMs: 3000, body: '{"version":1,"tasks":[{"id":"slow-1","title":"Alte Antwort untersuchen","minutes":45}]}' },
      { path: '/uebung/schnell', kind: 'http', status: 200, delayMs: 150, body: '{"version":1,"tasks":[{"id":"fast-1","title":"Neue Antwort verstehen","minutes":20},{"id":"fast-2","title":"Fehlerbehandlung prüfen","minutes":15}]}' },
      { path: '/uebung/ungueltig', kind: 'http', status: 200, delayMs: 250, body: '{"version":1,"tasks":[{"id":"bad-1","title":"Diese Antwort darf nicht übernommen werden","minutes":"zwanzig"}]}' },
    ] },
    files: {
      'data.js': `export function validateState(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) || value.version !== 1) {
    throw new Error("Erwartet wird ein Aufgabenstand mit Version 1.");
  }
  if (!Array.isArray(value.tasks) || value.tasks.length > 6) {
    throw new Error("Ein Aufgabenstand darf höchstens sechs Aufgaben enthalten.");
  }
  const ids = [];
  const checked = [];
  for (const task of value.tasks) {
    if (!task || typeof task !== "object" || Array.isArray(task)) {
      throw new Error("Jede Aufgabe muss ein Datenobjekt sein.");
    }
    if (typeof task.id !== "string" || !task.id.trim() || task.id.length > 40 || ids.includes(task.id)) {
      throw new Error("Aufgaben benötigen eindeutige Text-IDs bis 40 Zeichen.");
    }
    if (typeof task.title !== "string" || !task.title.trim() || task.title.length > 80) {
      throw new Error("Ein Aufgabentitel braucht 1 bis 80 Zeichen.");
    }
    if (!Number.isInteger(task.minutes) || task.minutes < 1 || task.minutes > 240) {
      throw new Error("Die Minuten müssen eine ganze Zahl von 1 bis 240 sein.");
    }
    ids.push(task.id);
    // Nur die geprüften Felder werden in einen neuen Zustand übernommen.
    checked.push({ id: task.id, title: task.title.trim(), minutes: task.minutes });
  }
  return checked;
}`,
      'main.js': `import { validateState } from "./data.js";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const minutesInput = document.getElementById("task-minutes");
const taskList = document.getElementById("task-list");
const taskCount = document.getElementById("task-count");
const status = document.getElementById("status");
const cancelButton = document.getElementById("cancel-load");
const storageKey = "lernplan-v1";
const rows = [];
let tasks = validateState({ version: 1, tasks: [
  { id: "start-1", title: "Haltepunkte ausprobieren", minutes: 15 }
] });
let nextId = 1;
let generation = 0;
let activeController = null;

function cancelPending() {
  // Erst die Generation ändern: Alte catch/finally dürfen nichts verändern.
  generation += 1;
  if (activeController !== null) {
    activeController.abort();
    activeController = null;
  }
  cancelButton.disabled = true;
  return generation;
}

function render() {
  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    if (index < tasks.length) {
      row.label.textContent = tasks[index].title + " · " + tasks[index].minutes + " Min";
      taskList.append(row.element);
    } else {
      row.element.remove();
    }
  }
  taskCount.textContent = tasks.length + " von höchstens sechs Aufgaben";
}

function createRows() {
  // Sechs Zeilen einmal anlegen und bei jedem Rendern wiederverwenden.
  for (let index = 0; index < 6; index++) {
    const element = document.createElement("li");
    const label = document.createElement("span");
    const removeButton = document.createElement("button");
    element.className = "task";
    removeButton.type = "button";
    removeButton.textContent = "Entfernen";
    removeButton.addEventListener("click", () => {
      cancelPending();
      const selected = tasks[index];
      if (!selected) return;
      tasks = tasks.filter(task => task.id !== selected.id);
      render();
      status.textContent = "Aufgabe entfernt. Der gesicherte Stand bleibt erhalten.";
      console.log("Entfernt: " + selected.title);
    });
    element.append(label, removeButton);
    rows.push({ element: element, label: label });
  }
}

function nextTaskId() {
  let id = "eigene-" + nextId;
  while (tasks.some(task => task.id === id)) {
    nextId += 1;
    id = "eigene-" + nextId;
  }
  nextId += 1;
  return id;
}

async function loadFixture(path, label) {
  const request = cancelPending();
  const controller = new AbortController();
  activeController = controller;
  cancelButton.disabled = false;
  status.textContent = label + " wird geladen …";
  try {
    const response = await fetch(path, { signal: controller.signal });
    if (request !== generation) return;
    if (!response.ok) throw new Error("HTTP-Fehler " + response.status);
    const value = await response.json();
    if (request !== generation) return;
    const loaded = validateState(value);
    tasks = loaded;
    render();
    status.textContent = label + " übernommen: " + tasks.length + " Aufgaben.";
    console.log("Geladen: " + label);
  } catch (error) {
    if (request !== generation) return;
    status.textContent = error.name === "AbortError" ? "Laden abgebrochen." : "Nicht übernommen: " + error.message;
    console.log("Ladefehler: " + error.name);
  } finally {
    if (request === generation) {
      activeController = null;
      cancelButton.disabled = true;
      console.log("Ladevorgang beendet: " + label);
    }
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  cancelPending();
  try {
    const candidate = tasks.slice();
    candidate.push({ id: nextTaskId(), title: titleInput.value.trim(), minutes: +minutesInput.value });
    const checked = validateState({ version: 1, tasks: candidate });
    tasks = checked;
    titleInput.value = "";
    render();
    status.textContent = "Aufgabe hinzugefügt. Du kannst den Stand jetzt sichern.";
    console.log("Hinzugefügt: " + tasks.length + " Aufgaben");
  } catch (error) {
    status.textContent = "Nicht hinzugefügt: " + error.message;
  }
});

document.getElementById("save").addEventListener("click", () => {
  cancelPending();
  try {
    const text = JSON.stringify({ version: 1, tasks: tasks });
    localStorage.setItem(storageKey, text);
    status.textContent = "Stand im Übungsspeicher gesichert: " + tasks.length + " Aufgaben.";
    console.log("Gesichert: " + tasks.length + " Aufgaben");
  } catch (error) {
    status.textContent = "Nicht gesichert: " + error.message;
  }
});

document.getElementById("restore").addEventListener("click", () => {
  cancelPending();
  try {
    const text = localStorage.getItem(storageKey);
    if (text === null) throw new Error("Es ist noch kein Stand gesichert.");
    const checked = validateState(JSON.parse(text));
    tasks = checked;
    render();
    status.textContent = "Gesicherten Stand übernommen: " + tasks.length + " Aufgaben.";
    console.log("Wiederhergestellt: " + tasks.length + " Aufgaben");
  } catch (error) {
    status.textContent = "Nicht wiederhergestellt: " + error.message;
  }
});

document.getElementById("load-slow").addEventListener("click", () => {
  loadFixture("/uebung/langsam", "Langsame Antwort");
});
document.getElementById("load-fast").addEventListener("click", () => {
  loadFixture("/uebung/schnell", "Schnelle Antwort");
});
document.getElementById("load-invalid").addEventListener("click", () => {
  loadFixture("/uebung/ungueltig", "Ungültige Antwort");
});
cancelButton.addEventListener("click", () => {
  cancelPending();
  status.textContent = "Laden abgebrochen. Die Aufgaben bleiben erhalten.";
  console.log("Laden abgebrochen");
});

createRows();
render();
cancelButton.disabled = true;
status.textContent = "Bereit: eine Aufgabe zum Ausprobieren.";`,
    },
  };
}
