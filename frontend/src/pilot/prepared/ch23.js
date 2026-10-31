import { chapter, refs, plannerHtml } from './shared.js';
import { validTasksCode } from './ch22.js';

export const plannerSolution = `${validTasksCode}
const form = document.querySelector("#task-form");
const titleInput = document.querySelector("#title");
const minutesInput = document.querySelector("#minutes");
const list = document.querySelector("#tasks");
const summary = document.querySelector("#summary");
const message = document.querySelector("#message");
let tasks = [];
let writable = true;
try {
  const raw = localStorage.getItem("lernplan-v1");
  if (raw !== null) {
    const value = JSON.parse(raw);
    if (!value || value.version !== 1 || !validTasks(value.tasks)) throw new Error("Format");
    tasks = value.tasks;
  }
} catch {
  writable = false;
  message.textContent = "Alter Stand nicht lesbar. Er bleibt unverändert. Änderungen nur im Arbeitsspeicher.";
}
let nextId = 1;
function newId() {
  while (tasks.some(task => task.id === String(nextId))) nextId++;
  return String(nextId++);
}
function commit(next, focusId) {
  tasks = next;
  if (writable) {
    try {
      localStorage.setItem("lernplan-v1", JSON.stringify({ version: 1, tasks }));
      message.textContent = "Lokal gespeichert";
    } catch { message.textContent = "Nicht gespeichert: Änderungen nur im Arbeitsspeicher."; }
  }
  render(focusId);
}
function render(focusId) {
  list.replaceChildren();
  let focusTarget = null;
  for (const task of tasks) {
    const li = document.createElement("li");
    const label = document.createElement("span");
    label.textContent = task.title + " · " + task.minutes + " Minuten · " + (task.done ? "erledigt" : "offen");
    const toggle = document.createElement("button"); toggle.type = "button";
    toggle.textContent = task.done ? "Wieder öffnen" : "Erledigen";
    toggle.setAttribute("aria-label", toggle.textContent + ": " + task.title);
    toggle.addEventListener("click", () => commit(tasks.map(item => item.id === task.id ? { ...item, done: !item.done } : item), task.id));
    const remove = document.createElement("button"); remove.type = "button";
    remove.textContent = "Entfernen"; remove.setAttribute("aria-label", "Entfernen: " + task.title);
    remove.addEventListener("click", () => { commit(tasks.filter(item => item.id !== task.id)); titleInput.focus(); });
    li.append(label, toggle, remove); list.append(li);
    if (task.id === focusId) focusTarget = toggle;
  }
  const open = tasks.filter(task => !task.done);
  summary.textContent = tasks.length === 0 ? "Noch keine Lernziele" : open.length + " offen · " + open.reduce((sum, task) => sum + task.minutes, 0) + " Minuten";
  if (focusTarget) focusTarget.focus();
}
function checkTitle() { titleInput.setCustomValidity(titleInput.value.trim() ? "" : "Bitte ein Lernziel eingeben."); }
titleInput.addEventListener("input", checkTitle);
checkTitle();
form.addEventListener("submit", event => {
  event.preventDefault();
  const title = titleInput.value.trim(); const raw = minutesInput.value.trim(); const minutes = Number(raw);
  if (!title || title.length > 80 || !raw || !Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
    message.textContent = "Bitte Titel und Dauer von 1 bis 240 Minuten prüfen."; return;
  }
  if (tasks.length >= 200) { message.textContent = "Höchstens 200 Lernziele."; return; }
  commit([...tasks, { id: newId(), title, minutes, done: false }]);
  form.reset(); checkTitle(); titleInput.focus();
});
render();`;

export default chapter(23, 'Projekt 4: Interaktiver Lernplan', 'Kapitel 22: Zustand, JSON und Speicherfehler.', 'Später: isolierte Browseransicht mit getrenntem Übungsspeicher.', refs.dom, [
  {
    title: 'Anforderungen und Ansichten planen', goal: 'Eine kleine App vor dem Programmieren spezifizieren.',
    explain: ['Der Lernplan verbindet deine bisherigen Bausteine: gültige Aufgaben anlegen, erledigen, wieder öffnen und entfernen; offene Minuten und Leerzustand anzeigen; nach Reload wiederherstellen. Begrenze bewusst auf 200 Aufgaben. Titel sind keine eindeutigen IDs.', 'Plane das HTML und eine Aktionstabelle: Auslöser, Datenänderung, Darstellung, Fokusziel und Speicherversuch. Verzichte zunächst auf Filter und zusätzliche Funktionen. Ein kleiner vollständig erklärbarer Kern ist der erste Meilenstein.'],
    example: plannerHtml,
    task: 'Erstelle den Projektordner mit index.html, style.css und app.js. Schreibe die Aktionstabelle und mindestens sechs Prüffälle auf. Baue zunächst nur semantisches HTML und mobile Grundgestaltung mit sichtbarem Fokus.',
    hints: ['Für jede Aktion zuerst Zustand und Fokus beschreiben.', 'Nach Hinzufügen: Titel zurücksetzen/fokussieren; nach Umschalten: entsprechenden Button wieder fokussieren.'],
    solution: 'Aktionstabelle:\nHinzufügen -> neue ID und Aufgabe -> Liste/Summe neu -> Titelfeld -> speichern\nErledigen/Öffnen -> nur done der ID umkehren -> Liste/Summe neu -> gleicher Aktionsbutton -> speichern\nEntfernen -> ID herausfiltern -> Liste/Summe neu -> Titelfeld -> speichern\nStart -> lesen/prüfen -> rendern -> kein erzwungener Fokus -> nicht ungefragt schreiben\n' + plannerHtml,
    criteria: ['Aktionen, Leerzustand und Lade-/Speicherfehler geplant.', 'Formular mit Labels, mobile Breite und sichtbarer Tastaturfokus.'],
  },
  {
    title: 'Den Kern ohne Speicherung umsetzen', goal: 'Unabhängige Aktionen auf stabilen IDs aufbauen.',
    explain: ['Arbeite zuerst nur im Arbeitsspeicher. Nutze eine zentrale commit(next)-Funktion: neuen Zustand zuweisen und rendern. Später ergänzt diese Stelle die Sicherung. Damit hat jede Aktion denselben nachvollziehbaren Ablauf.', 'Listener dürfen die ID des erzeugten Eintrags behalten. Der aktuelle Zustand tasks wird erst beim Klick gelesen. Beim vollen Neuaufbau müssen Fokusziele ausdrücklich wiederhergestellt werden; du darfst nicht aus dem Listentext den Datensatz rekonstruieren.'],
    example: 'function commit(next) { tasks = next; render(); }\n// Löschen: commit(tasks.filter(task => task.id !== id));',
    task: 'Implementiere Anlegen, Umschalten und Entfernen mit stabilen String-IDs. Zwei gleiche Titel müssen getrennt bedienbar sein. Zeige offene Minuten und den Leerzustand. Noch keine Speicherung.',
    hints: ['Zum Ändern map mit neuer Objektkopie, zum Entfernen filter.', 'IDs fortlaufend erzeugen; vor Verwendung gegen vorhandene IDs prüfen.'],
    solution: 'let tasks = [];\nlet nextId = 1;\nfunction newId() {\n  while (tasks.some(task => task.id === String(nextId))) nextId++;\n  return String(nextId++);\n}\nfunction commit(next, focusId) { tasks = next; render(focusId); }\nfunction add(title, minutes) { commit([...tasks, { id: newId(), title, minutes, done: false }]); titleInput.focus(); }\nfunction toggle(id) { commit(tasks.map(task => task.id === id ? { ...task, done: !task.done } : task), id); }\nfunction remove(id) { commit(tasks.filter(task => task.id !== id)); titleInput.focus(); }\n// render(focusId) baut die Buttons neu und fokussiert den Button mit dieser ID.\n// Vollständiger Zusammenhang mit Elementerzeugung folgt in der Abschlusslektion.',
    criteria: ['Gleiche Titel, letzte Aufgabe löschen und mehrmaliges Umschalten korrekt.', 'Ein Listener pro neuem Button; kein Doppelzählen nach Renderaufrufen.'],
  },
  {
    title: 'Persistenz und Ausfälle ergänzen', goal: 'Eine funktionierende App auch bei Fehlern bedienbar halten.',
    explain: ['Lies beim Start zuerst den alten Stand und prüfe ihn mit validTasks. Bei kaputtem Stand bleibt er erhalten, und die App arbeitet ausdrücklich nur im Arbeitsspeicher. Ein eigenes bewusstes Zurücksetzen kann später hinzukommen; dieser Kern löscht nicht ungefragt.', 'Ein erfolgreicher Datenwechsel kann trotz gescheitertem Speichern weiter sichtbar bleiben. Formuliere die Meldung eindeutig. Nach dem Laden muss die ID-Vergabe bestehende IDs überspringen, damit neue Aufgaben keine alten ersetzen.'],
    example: 'let writable = true;\n// Bei Ladefehler: writable = false;\n// commit speichert nur bei writable und fängt Schreibfehler ab.',
    task: 'Erweitere commit und den Startablauf. Teste gültigen Reload, beschädigtes JSON und eine simulierte Speicher-Ausnahme. Die defekte Sicherung darf beim Start nicht mit [] ersetzt werden.',
    hints: ['Kein pauschales catch { save([]) } verwenden.', 'Beim Start nur rendern; erst eine tatsächliche Aktion speichert, sofern der Altstand lesbar war.'],
    solution: 'try {\n  const raw = localStorage.getItem("lernplan-v1");\n  if (raw !== null) {\n    const value = JSON.parse(raw);\n    if (!value || value.version !== 1 || !validTasks(value.tasks)) throw new Error("Format");\n    tasks = value.tasks;\n  }\n} catch { writable = false; message.textContent = "Alter Stand nicht lesbar; unverändert. Nur Arbeitsspeicher."; }\n// Im commit nach tasks = next:\n// try setItem(...), bei Fehler ausdrücklich "Nicht gespeichert" melden.',
    criteria: ['Reload erhält IDs und Werte; neues Anlegen bleibt eindeutig.', 'Fehlertexte ehrlich; kaputte Altdaten ohne Nutzeraktion unangetastet.'],
  },
  {
    title: 'Projekt prüfen, erklären und übertragen', goal: 'Fachliche, Bedien- und Fehlerkriterien gemeinsam nachweisen.',
    explain: ['Prüfe jetzt einen vollständigen Ablauf ohne Musterlösung: zwei gleichnamige Aufgaben anlegen, eine erledigen, die andere löschen, neu laden. Vergleiche Zustand, Liste und offene Minuten nach jedem Schritt. Nutze danach einmal einen HTML-artigen Titel.', 'Die Referenz ist eine mögliche kompakte Umsetzung. Sie verwendet die bekannte validTasks-Prüfung und enthält bewusst keine Cloud-, App- oder Dateischnittstelle. Ergänze selbst style.css mit responsivem Layout und sichtbaren Fokusregeln aus den CSS-Kapiteln.'],
    example: 'Abnahmeprotokoll: Aktion | erwartete Daten | sichtbarer Text | Fokus | gespeichert?\nTransfer: aus Lernzielen werden Haushaltsaufgaben, dieselben Zustandsregeln bleiben.',
    task: 'Gib drei Quelldateien, Prüftabelle und eine Begründung für IDs, Daten/DOM-Trennung und Speicherfehler ab. Übertrage die Oberfläche danach auf Haushaltsaufgaben. Teste mit Tastatur, 200% Zoom, schmaler Breite und fehlerhaften Daten.',
    hints: ['Vergleiche deine Aktionstabelle mit dem tatsächlich beobachteten Ablauf.', 'Teste mindestens Leerzustand, Grenzwerte, gleiche Titel, Persistenz, kaputte Sicherung und Speicherausfall.'],
    solution: '// index.html aus der ersten Etappe; app.js vollständig:\n' + plannerSolution + '\n/* style.css, zusätzlich im head verlinken:\nbody { font-family: sans-serif; max-width: 55rem; margin: auto; padding: 1rem; }\nform { display: grid; gap: .5rem; }\nli { overflow-wrap: anywhere; margin-block: 1rem; }\nbutton, input { font: inherit; padding: .6rem; }\n:focus-visible { outline: 3px solid navy; outline-offset: 3px; }\n*/',
    criteria: ['Alle beschriebenen Abläufe samt Fehlerfällen dokumentiert; kein automatischer Erfolg in dieser Inhaltsfassung.', 'Eigene Umsetzung erklären; Referenz angesehen ist kein selbstständiger Transfer.'],
  },
]);
