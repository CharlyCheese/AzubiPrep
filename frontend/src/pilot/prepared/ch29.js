import { chapter, refs } from './shared.js';
import { plannerSolution } from './ch23.js';

// Dieselbe Referenz mit echten Element-/Parameterprüfungen; keine Typbehauptung.
export const typedPlanner = `type Task = { id: string; title: string; minutes: number; done: boolean };
function input(selector: string): HTMLInputElement {
  const element = document.querySelector(selector);
  if (!(element instanceof HTMLInputElement)) throw new Error("Eingabefeld fehlt: " + selector);
  return element;
}
function element(selector: string): HTMLElement {
  const value = document.querySelector(selector);
  if (!(value instanceof HTMLElement)) throw new Error("Bereich fehlt: " + selector);
  return value;
}
const formElement = document.querySelector("#task-form");
if (!(formElement instanceof HTMLFormElement)) throw new Error("Formular fehlt");
const form = formElement;
` + plannerSolution
  .replace('function validTasks(value) {', 'function validTasks(value: unknown): value is Task[] {')
  .replace('const ids = [];', 'const ids: string[] = [];')
  .replace('const form = document.querySelector("#task-form");\n', '')
  .replace('const titleInput = document.querySelector("#title");', 'const titleInput = input("#title");')
  .replace('const minutesInput = document.querySelector("#minutes");', 'const minutesInput = input("#minutes");')
  .replace('const list = document.querySelector("#tasks");', 'const list = element("#tasks");')
  .replace('const summary = document.querySelector("#summary");', 'const summary = element("#summary");')
  .replace('const message = document.querySelector("#message");', 'const message = element("#message");')
  .replace('let tasks = [];', 'let tasks: Task[] = [];')
  .replace('const value = JSON.parse(raw);', 'const value: unknown = JSON.parse(raw);')
  .replace('if (!value || value.version !== 1 || !validTasks(value.tasks))', 'if (typeof value !== "object" || value === null || !("version" in value) || value.version !== 1 || !("tasks" in value) || !validTasks(value.tasks))')
  .replace('function commit(next, focusId) {', 'function commit(next: Task[], focusId?: string) {')
  .replace('function render(focusId) {', 'function render(focusId?: string) {')
  .replace('let focusTarget = null;', 'let focusTarget: HTMLButtonElement | null = null;');

export default chapter(29, 'TypeScript auf bekannten Grundlagen', 'Kapitel 28: überprüfbares modulares JavaScript.', 'Später: geprüfte externe TypeScript-Vorlage. TS läuft nicht direkt in der bisherigen JS-Konsole.', refs.ts, [
  {
    title: 'Typprüfung ist keine Laufzeitprüfung', goal: 'Den zusätzlichen Prüfschritt richtig einordnen.',
    explain: ['TypeScript ergänzt JavaScript um statische Typinformationen. Der Compiler prüft sie vor der Ausführung; im Browser läuft nach der Übersetzung JavaScript. Ein Typfehler kann deshalb früh auffallen, während fremde JSON-Daten zur Laufzeit weiterhin geprüft werden müssen.', 'In der späteren Vorlage prüft tsc mit strict und noEmit die Typen, ohne JS-Dateien auszugeben; der Build übersetzt separat. Ein Werkzeug wie Vite kann TS übersetzen, ohne sämtliche Typfehler zu melden. Daher sind Typprüfung und Build getrennte Nachweise.'],
    example: 'const minutes: number = 20;\n// minutes + 2 ist eine Zahl.\n// const other: number = "20"; wäre ein Typfehler.',
    task: 'Ordne drei Fehler zu: falsch geschriebener Eigenschaftsname im eigenen Code, fremdes JSON mit minutes:"20", nicht erreichbare Datenquelle. Welche Prüfung erkennt welchen Fehler? Schreibe eine korrekte number- und string-Bindung.',
    hints: ['Typprüfung kann den Inhalt einer späteren Antwort nicht vorhersagen.', 'JSON braucht Schema-Prüfung; Netzwerkfehler braucht einen Fehlerweg.'],
    solution: 'const minutes: number = 20;\nconst title: string = "HTML üben";\n// Eigenschaftsname: statische Typprüfung bei passendem Objekttyp.\n// JSON-String statt Zahl: Laufzeitprüfung.\n// Datenquelle nicht erreichbar: asynchrone Fehlerbehandlung.\n// Spätere Vorlage: tsc --noEmit plus Build separat.',
    criteria: ['Keine Behauptung, TS sichere automatisch alle Fremddaten ab.', 'Zwei korrekt typisierte Werte und getrennte Prüfschritte.'],
  },
  {
    title: 'Inference und Funktionssignaturen', goal: 'Parameter und Rückgaben als Vertrag formulieren.',
    explain: ['TypeScript kann Typen oft aus Startwerten ableiten: let count = 0 erhält number. Eine spätere Zuweisung eines Strings wäre ungültig. Parameter an einer eigenständig deklarierten Funktion brauchen dagegen in unserer strict-Vorlage ihre Typangaben.', 'function total(minutes: number, count: number): number benennt Eingabe- und Rückgabetyp. number unterscheidet nicht automatisch ganze Zahlen, NaN oder positive Werte. Solche fachlichen Grenzen bleiben Aufgabe deiner Logik.'],
    example: 'function total(minutes: number, count: number): number {\n  return minutes * count;\n}',
    task: 'Typisiere parseMinutes(raw) aus Kapitel 21 mit string als Eingabe und number | null als Rückgabe. | bedeutet eine Vereinigung möglicher Typen. Ein ungültiger Text soll weiterhin null liefern.',
    hints: ['Die Implementierung bleibt bekannt; nur der Vertrag kommt hinzu.', 'function parseMinutes(raw: string): number | null { ... }'],
    solution: 'function parseMinutes(raw: string): number | null {\n  const text = raw.trim(); const value = Number(text);\n  if (!text || !Number.isInteger(value) || value < 1 || value > 240) return null;\n  return value;\n}',
    criteria: ['"15" ergibt 15, "" und "1.5" null.', 'Ein Aufruf mit Zahl statt String wird statisch zurückgewiesen.'],
  },
  {
    title: 'Objekttypen, Arrays und optionale Felder', goal: 'Bekannte Aufgaben präzise beschreiben.',
    explain: ['type Task = { ... } benennt die Struktur eines Objekts. Task[] ist ein Array solcher Objekte. Ein optionales Feld note?: string kann fehlen und muss vor einer Stringmethode geprüft werden. Optional bedeutet nicht, dass jedes Feld beliebige Typen erhalten darf.', 'readonly kann unbeabsichtigte Zuweisungen statisch verhindern; es friert ein Objekt nicht zur Laufzeit ein. Für dieses Kapitel nutzen wir einfache Strukturen und die bekannten unverändernden map/filter-Operationen.'],
    example: 'type Task = { id: string; title: string; minutes: number; done: boolean; note?: string };\nconst tasks: Task[] = [];',
    task: 'Typisiere offeneMinuten(tasks) mit Task[] und number. Schreibe noteText(task): string, die eine vorhandene Notiz getrimmt und sonst "" liefert. Schreibe einen absichtlichen minutes:"20"-Fehler und lies die Typmeldung.',
    hints: ['typeof task.note === "string" grenzt den optionalen Wert ein.', 'Die Summe kann reduce mit Startwert 0 verwenden.'],
    solution: 'type Task = { id: string; title: string; minutes: number; done: boolean; note?: string };\nfunction offeneMinuten(tasks: Task[]): number {\n  return tasks.filter(task => !task.done).reduce((sum, task) => sum + task.minutes, 0);\n}\nfunction noteText(task: Task): string {\n  return typeof task.note === "string" ? task.note.trim() : "";\n}',
    criteria: ['Typfehler erkannt; optionales Feld ohne unsicheren Zugriff behandelt.', 'Leere Liste ergibt 0, erledigte Aufgaben tragen nichts zur Summe bei.'],
  },
  {
    title: 'Vereinigungen durch Prüfungen eingrenzen', goal: 'null und verschiedene Zustände sicher behandeln.', reference: refs.narrow,
    explain: ['Nach if (value === null) return ... weiß TypeScript im folgenden Zweig, dass value nicht null ist. Diese Eingrenzung heißt Narrowing. Vermeide ein ! als bloße Unterdrückung einer null-Warnung; prüfe den tatsächlichen Fall.', 'Eine diskriminierte Union nutzt ein gemeinsames Kennzeichen, hier status. Im ready-Zweig existiert items, im error-Zweig error. Dadurch kann ein Zustand nicht versehentlich gleichzeitig loading und mit einer erfolgreichen Datenliste beschrieben werden.'],
    example: 'type LoadState =\n  | { status: "loading" }\n  | { status: "ready"; items: string[] }\n  | { status: "error"; error: string };',
    task: 'Schreibe statusText(state): string für diese Union. loading -> "Lädt", ready -> Anzahl plus " Einträge", error -> Fehlertext. Greife auf items nur im ready-Zweig zu.',
    hints: ['Prüfe zuerst state.status.', 'Jeder Zweig erhält danach die passenden Eigenschaften.'],
    solution: 'type LoadState = { status: "loading" } | { status: "ready"; items: string[] } | { status: "error"; error: string };\nfunction statusText(state: LoadState): string {\n  if (state.status === "loading") return "Lädt";\n  if (state.status === "error") return state.error;\n  return state.items.length + " Einträge";\n}',
    criteria: ['Alle drei Zustände behandelt, ready mit [] ergibt 0 Einträge.', 'Kein any, blindes ! oder ungesicherter Zugriff auf nicht vorhandene Felder.'],
  },
  {
    title: 'unknown an der Datengrenze', goal: 'Statische Versprechen erst nach echter Prüfung geben.', reference: refs.narrow,
    explain: ['unknown bedeutet: ein Wert ist noch nicht bekannt. Anders als any erlaubt unknown nicht beliebige Zugriffe. Prüfe zuerst null, typeof und Struktur. Der Operator in stellt fest, ob eine Eigenschaft vorhanden ist; er ersetzt nicht deren Typprüfung.', 'Ein eigener Type Guard gibt value is Task zurück. Dieser Vertrag ist mächtig: Der Compiler vertraut der Prüffunktion. Deshalb muss sie wirklich jedes relevante Feld prüfen. Fachliche Grenzen wie positive ganze Minuten gehören ebenfalls hinein.'],
    example: 'function isTitle(value: unknown): value is string {\n  return typeof value === "string" && value.trim().length > 0;\n}',
    task: 'Schreibe isTask(value: unknown): value is Task für id, title, minutes und done (ohne optionale Notiz). Prüfe Stringgrenzen und ganze Minuten 1–240. Kein as Task als Ersatz für die Prüfung.',
    hints: ['Nach typeof value === "object" noch null und Arrays ausschließen.', '"minutes" in value erlaubt anschließend die Typ-/Wertprüfung des Felds.'],
    solution: 'type Task = { id: string; title: string; minutes: number; done: boolean };\nfunction isTask(value: unknown): value is Task {\n  if (typeof value !== "object" || value === null || Array.isArray(value)) return false;\n  return "id" in value && typeof value.id === "string" && value.id.length > 0\n    && "title" in value && typeof value.title === "string" && value.title.trim().length > 0 && value.title.length <= 80\n    && "minutes" in value && typeof value.minutes === "number" && Number.isInteger(value.minutes) && value.minutes >= 1 && value.minutes <= 240\n    && "done" in value && typeof value.done === "boolean";\n}',
    criteria: ['null, Arrays, fehlende Felder und Zahlstrings zurückgewiesen.', 'Gültiges Task danach ohne Assertion verwendbar; Laufzeitfälle gesondert getestet.'],
  },
  {
    title: 'DOM-Typen und bekannte Werkzeuge verbinden', goal: 'Elementauswahl sicher eingrenzen.', reference: refs.narrow,
    explain: ['querySelector kann null oder ein allgemeines Element liefern. instanceof HTMLInputElement prüft zur Laufzeit den konkreten Elementtyp; danach kennt TypeScript value und andere Inputeigenschaften. Ein behaupteter Typ mit as HTMLInputElement prüft dagegen nichts.', 'Die Typbibliotheken für DOM und Compileroptionen liefert später die feste Vorlage. TS-Dateien werden nicht in die bestehende JS-Konsole importiert. Module, Tests und Typecheck bleiben eigenständige Schritte im Übungsprojekt.'],
    example: 'const input = document.querySelector("#title");\nif (!(input instanceof HTMLInputElement)) throw new Error("Titelfeld fehlt");\nconsole.log(input.value);',
    task: 'Typisiere den Leseweg für #title und #minutes im bekannten Formular. Prüfe die Elementarten wirklich. Verwende parseMinutes und behandle null, bevor du mit der Dauer rechnest.',
    hints: ['Zwei instanceof-Prüfungen sichern die Felder.', 'Nach if (minutes === null) return; ist minutes eine Zahl.'],
    solution: 'const titleInput = document.querySelector("#title");\nconst minutesInput = document.querySelector("#minutes");\nif (!(titleInput instanceof HTMLInputElement) || !(minutesInput instanceof HTMLInputElement)) {\n  throw new Error("Formularfelder fehlen");\n}\nconst minutes = parseMinutes(minutesInput.value);\nif (minutes !== null) { console.log(titleInput.value.trim(), minutes * 2); }\n// parseMinutes aus Lektion 2 importieren.',
    criteria: ['Fehlendes/falsches Element erzeugt einen kontrollierten Fehler.', 'Keine Typwarnung durch any oder Behauptung kaschiert; null bewusst behandelt.'],
  },
  {
    title: 'Miniprojekt: Lernplan schrittweise typisieren', goal: 'Bestehendes Verhalten durch Typen absichern.',
    explain: ['Migriere nicht alles auf einmal. Beginne beim Modell Task und den reinen Funktionen. Danach kommen Speichergrenze, Schema-Prüfung und DOM. Nach jedem Schritt laufen die bekannten fachlichen Fälle weiter.', 'Die Referenz zeigt den vollständigen typisierten Lernplan mit Speicherung und DOM-Verarbeitung. Vollständige Abnahme umfasst außerdem Ladefehler, Tastatur und Persistenz aus Projekt 4. Typecheck-Erfolg allein ersetzt diese Fälle nicht. Die Werkzeugvorlage ist noch technisch vorzubereiten.'],
    example: 'Reihenfolge: model.ts -> validation.ts -> storage.ts -> view.ts/app.ts\nNach jedem Schritt: Typprüfung, Modelltests, später Browserablauf.',
    task: 'Übertrage Projekt 4 auf TS. Gib Typen, reine Funktionen und Migrationsprotokoll ab. Dokumentiere mindestens zwei Fehler, die der Compiler findet, und zwei, die nur eine Laufzeit-/Bedienprüfung erkennt.',
    hints: ['Typen zwischen Modulen als export type Task veröffentlichen und mit import type einlesen.', 'IDs, Werte und Speicherformat bleiben unverändert; keine Neuinterpretation alter Sicherungen.'],
    solution: '// app.ts vollständig; HTML/CSS aus Projekt 4, Skripteinbindung über die spätere TS-Vorlage.\n// Den geprüften Stand anschließend nach Kapitel 26 modularisieren.\n' + typedPlanner + '\n// Compiler findet falsche Feldnamen/Zahlstrings; Laufzeit prüft JSON und Fokus nach Löschen.',
    criteria: ['strict-Typprüfung und bestehende fachliche Tests als getrennte Ziele dokumentiert.', 'Kein pauschales any; Migration erhält Daten-/Bedienverhalten; praktische Abnahme noch offen.'],
  },
]);
