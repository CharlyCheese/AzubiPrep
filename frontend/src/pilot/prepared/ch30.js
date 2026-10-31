import { chapter, refs } from './shared.js';

export const reactPlanner = `import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Link, Route, Routes, useLocation, useParams } from "react-router-dom";
type Task = { id: string; title: string; minutes: number; done: boolean };
type Snapshot = { tasks: Task[]; writable: boolean; error: string };
// isTask aus Kapitel 29 unverändert importieren:
import { isTask } from "./validation";
function readInitial(): Snapshot {
  try {
    const raw = localStorage.getItem("react-plan-v1");
    if (raw === null) return { tasks: [], writable: true, error: "" };
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || !("version" in value) || value.version !== 1
      || !("tasks" in value) || !Array.isArray(value.tasks) || value.tasks.length > 200 || !value.tasks.every(isTask)) throw new Error("Format");
    const tasks: Task[] = value.tasks;
    if (new Set(tasks.map(task => task.id)).size !== tasks.length) throw new Error("Doppelte ID");
    return { tasks, writable: true, error: "" };
  } catch { return { tasks: [], writable: false, error: "Altstand nicht lesbar; bleibt unverändert. Nur Arbeitsspeicher." }; }
}
function RouteHeading({ title }: { title: string }) {
  const heading = useRef<HTMLHeadingElement>(null);
  const location = useLocation();
  useEffect(() => { document.title = title; heading.current?.focus(); }, [location.pathname, title]);
  return <h1 ref={heading} tabIndex={-1}>{title}</h1>;
}
function TaskForm({ onAdd }: { onAdd: (title: string, minutes: number) => boolean }) {
  const [title, setTitle] = useState(""); const [raw, setRaw] = useState(""); const [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const minutes = Number(raw);
    if (!title.trim() || title.trim().length > 80 || !raw.trim() || !Number.isInteger(minutes) || minutes < 1 || minutes > 240) {
      setError("Titel und ganze Minuten von 1 bis 240 prüfen."); return;
    }
    if (!onAdd(title.trim(), minutes)) { setError("Höchstens 200 Aufgaben."); return; }
    setTitle(""); setRaw(""); setError(""); input.current?.focus();
  }
  return <form onSubmit={submit}>
    <label htmlFor="title">Lernziel</label><input id="title" ref={input} value={title} maxLength={80} required onChange={event => setTitle(event.target.value)} />
    <label htmlFor="minutes">Minuten</label><input id="minutes" type="number" min="1" max="240" step="1" required value={raw} onChange={event => setRaw(event.target.value)} />
    <button>Hinzufügen</button><p role="status">{error}</p>
  </form>;
}
function TaskDetail({ tasks }: { tasks: Task[] }) {
  const { id } = useParams(); const task = tasks.find(task => task.id === id);
  return <><RouteHeading title="Lernziel im Detail" />{task ? <p>{task.title} · {task.minutes} Minuten · {task.done ? "erledigt" : "offen"}</p> : <p>Aufgabe nicht gefunden</p>}<Link to="/">Zur Übersicht</Link></>;
}
function Planner() {
  const [initial] = useState(readInitial);
  const [tasks, setTasks] = useState<Task[]>(initial.tasks);
  const [query, setQuery] = useState(""); const [storageMessage, setStorageMessage] = useState(initial.error);
  const listHeading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!initial.writable) return;
    try { localStorage.setItem("react-plan-v1", JSON.stringify({ version: 1, tasks })); setStorageMessage("Lokal gespeichert"); }
    catch { setStorageMessage("Speichern fehlgeschlagen; nur Arbeitsspeicher."); }
  }, [tasks, initial.writable]);
  function add(title: string, minutes: number): boolean {
    if (tasks.length >= 200) return false;
    const id = crypto.randomUUID();
    setTasks(previous => [...previous, { id, title, minutes, done: false }]); return true;
  }
  function toggle(id: string) { setTasks(previous => previous.map(task => task.id === id ? { ...task, done: !task.done } : task)); }
  function remove(id: string) { setTasks(previous => previous.filter(task => task.id !== id)); listHeading.current?.focus(); }
  const visible = tasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));
  const open = tasks.filter(task => !task.done);
  return <><nav><Link to="/">Lernplan</Link></nav><main>
    <Routes>
      <Route path="/" element={<><RouteHeading title="Mein Lernplan" />
        <TaskForm onAdd={add} /><p role="status">{storageMessage}</p>
        <label htmlFor="search">Suchen</label><input id="search" value={query} onChange={event => setQuery(event.target.value)} />
        <h2 ref={listHeading} tabIndex={-1}>Lernziele</h2>
        <p role="status">{visible.length} Treffer</p>
        {tasks.length === 0 ? <p>Noch keine Lernziele</p> : visible.length === 0 ? <p>Keine passenden Lernziele</p> : null}
        <ul>{visible.map(task => <li key={task.id}>
          <Link to={"/tasks/" + encodeURIComponent(task.id)}>{task.title}</Link> · {task.minutes} Minuten · {task.done ? "erledigt" : "offen"}
          <button type="button" aria-label={(task.done ? "Öffnen: " : "Erledigen: ") + task.title} onClick={() => toggle(task.id)}>{task.done ? "Öffnen" : "Erledigen"}</button>
          <button type="button" aria-label={"Entfernen: " + task.title} onClick={() => remove(task.id)}>Entfernen</button>
        </li>)}</ul><p>{open.length} offen · {open.reduce((sum, task) => sum + task.minutes, 0)} Minuten</p>
      </>} />
      <Route path="/tasks/:id" element={<TaskDetail tasks={tasks} />} />
      <Route path="*" element={<><RouteHeading title="Seite nicht gefunden" /><Link to="/">Zur Übersicht</Link></>} />
    </Routes></main></>;
}
export default function App() { return <BrowserRouter><Planner /></BrowserRouter>; }`;

export default chapter(30, 'React: die bekannte Anwendung in Komponenten', 'Kapitel 29, modulare Projekte, Browserzustand und Tests.', 'Später: geprüfte React-18-/Router-6-/TS-Vorlage im eigenen Projekt. Keine Installation in AzubiPrep.', refs.react, [
  {
    title: 'JSX und der Einstiegspunkt', goal: 'Deklarative Darstellung von DOM-Handarbeit unterscheiden.',
    explain: ['React beschreibt die gewünschte Oberfläche als Ergebnis einer Funktion. JSX ähnelt HTML, ist aber JS-Syntaxerweiterung und wird vom Werkzeug übersetzt. className ersetzt class, htmlFor ersetzt for; Tags werden geschlossen. Geschweifte Klammern betten JS-Ausdrücke ein, keine beliebigen Anweisungen wie if.', 'Der vorbereitete Einstieg importiert createRoot aus react-dom/client und mountet App in ein vorhandenes div#root. Bearbeite zunächst nur App.tsx. React verwaltet die Kinder dieses Roots; baue sie nicht parallel mit document.createElement um.'],
    example: 'function App() {\n  const title = "Lernplan";\n  return <main className="page"><h1>{title}</h1><p>Willkommen</p></main>;\n}\n// main.tsx: createRoot(root).render(<App />), root zuvor auf null prüfen.',
    task: 'Schreibe eine App-Komponente mit main, h1 und Absatz. Verwende einen title-Wert als Ausdruck und eine CSS-Klasse. Erkläre JSX, Komponente und den einzigen Einstiegspunkt.',
    hints: ['Ein Komponentenname beginnt groß.', 'Mehrere Nachbarknoten brauchen einen gemeinsamen Elternknoten oder ein Fragment <>...</>.'],
    solution: 'export default function App() {\n  const title = "Mein Lernplan";\n  return <main className="page"><h1>{title}</h1><p>Heute lerne ich React.</p></main>;\n}\n// In der Vorlage: index.html mit div#root, main.tsx mit geprüftem createRoot-Aufruf.',
    criteria: ['Geschlossene JSX-Tags, className und sichtbare Variable.', 'Kein manueller konkurrierender DOM-Aufbau im React-Root.'],
  },
  {
    title: 'Komponenten und Props', goal: 'Wiederverwendbare Ausgabe mit klaren Eingaben bauen.',
    explain: ['Eine Komponente erhält Props als Eingabeobjekt. function Card({ title }) nutzt Objekt-Destrukturierung: Sie liest title aus dem Propsobjekt direkt in eine lokale Bindung. In TS beschreibt { title: string } den erwarteten Vertrag.', 'Props werden vom Kind nicht verändert. Die Komponente berechnet nur JSX. Für zwei Aufgaben verwendest du dieselbe Komponente mit verschiedenen Eingaben, statt ihren Quelltext zweimal zu kopieren.'],
    example: 'function Card({ title }: { title: string }) { return <article><h2>{title}</h2></article>; }\n// Verwendung: <Card title="HTML" />',
    task: 'Schreibe TaskCard mit title:string und minutes:number. Rendere zwei Karten mit unterschiedlichen Werten und erkläre, woher deren Daten kommen. Verändere keine Props.',
    hints: ['Beide Werte werden im Propsvertrag benannt.', 'function TaskCard({ title, minutes }: { title:string; minutes:number }) { ... }'],
    solution: 'function TaskCard({ title, minutes }: { title: string; minutes: number }) {\n  return <article><h2>{title}</h2><p>{minutes} Minuten</p></article>;\n}\nexport default function App() { return <main><h1>Lernziele</h1><TaskCard title="HTML" minutes={20} /><TaskCard title="CSS" minutes={30} /></main>; }',
    criteria: ['Zwei unterschiedliche Karten aus derselben Komponente.', 'Zahl über {20} als Zahl, nicht als Stringprop übergeben.'],
  },
  {
    title: 'Listen, Bedingungen und stabile Schlüssel', goal: 'Datenlisten ohne Identitätsverwechslung darstellen.',
    explain: ['map kann JSX für jeden Eintrag erzeugen. Das äußerste Element pro Eintrag braucht key mit stabiler ID. Der Index ist bei veränderlichen Listen ungeeignet, und Math.random bei jedem Rendern zerstört die beständige Identität.', 'Ein ternärer Ausdruck condition ? a : b wählt zwischen zwei Darstellungen. Er wird hier ausdrücklich eingeführt. Für einen Leerzustand ist er verständlicher als eine Liste, die einfach unsichtbar bleibt. React behandelt normale Stringausdrücke als Text; dangerouslySetInnerHTML verwenden wir nicht.'],
    example: '{tasks.length === 0 ? <p>Noch keine Aufgaben</p> : <ul>{tasks.map(task => <li key={task.id}>{task.title}</li>)}</ul>}',
    task: 'Baue TaskList mit Task[] als Prop und sichtbarem Leerzustand. Zwei Aufgaben dürfen denselben Titel besitzen. Teste außerdem einen HTML-artigen Titel als Text.',
    hints: ['Die ID liefert key; der Titel liefert den sichtbaren Text.', 'Array.map gibt pro task ein li mit key={task.id} zurück.'],
    solution: 'type Task = { id: string; title: string; minutes: number; done: boolean };\nfunction TaskList({ tasks }: { tasks: Task[] }) {\n  return tasks.length === 0 ? <p>Noch keine Aufgaben</p>\n    : <ul>{tasks.map(task => <li key={task.id}>{task.title} · {task.minutes} Minuten</li>)}</ul>;\n}',
    criteria: ['Leertext und Liste wechseln korrekt.', 'Stabile IDs, keine Titel-/Indexschlüssel; HTML-artiger Text erzeugt kein Element.'],
  },
  {
    title: 'useState und funktionale Aktualisierung', goal: 'Lokalen Zustand ohne Mutation verändern.',
    explain: ['useState liefert ein Paar: aktuellen Wert und Setter. const [count, setCount] = useState(0) ist Array-Destrukturierung. Ein Setter plant einen neuen Render; die aktuelle Handlerausführung sieht weiterhin ihren bisherigen Zustandsschnappschuss.', 'Wenn die Änderung vom vorherigen Wert abhängt, verwende setCount(previous => previous + 1). Zwei solche Aufrufe erhöhen um 2. Setter-Updater müssen rein sein: kein Speichern, keine ID-Erzeugung oder sonstige Seiteneffekte darin. Hooks stehen immer auf oberster Komponentenebene, nicht in if oder Schleifen.'],
    example: 'const [count, setCount] = useState(0);\n<button onClick={() => setCount(previous => previous + 1)}>Zählen</button>',
    task: 'Baue einen Zähler mit +1, +2 und Zurücksetzen. +2 soll zwei funktionale Updates verwenden. Erkläre den Unterschied zu zwei setCount(count + 1)-Aufrufen im selben Handler.',
    hints: ['Der Zustand in der laufenden Funktion springt nicht nach jedem Setter sofort um.', 'onClick={() => { setCount(p => p + 1); setCount(p => p + 1); }}'],
    solution: 'import { useState } from "react";\nexport default function Counter() {\n  const [count, setCount] = useState(0);\n  return <><p>{count}</p><button onClick={() => setCount(p => p + 1)}>+1</button>\n    <button onClick={() => { setCount(p => p + 1); setCount(p => p + 1); }}>+2</button>\n    <button onClick={() => setCount(0)}>Zurücksetzen</button></>;\n}',
    criteria: ['+2 erhöht tatsächlich um 2; Reset funktioniert.', 'Hooks bedingungslos; Updater ohne Seiteneffekte.'],
  },
  {
    title: 'Kontrollierte Formulare und lokale Fehler', goal: 'Formularwerte und Zustand zusammenhalten.',
    explain: ['Ein kontrolliertes Feld erhält value aus dem Zustand und meldet Änderungen über onChange an den Setter. Auch das Zahlenfeld bleibt beim Bearbeiten ein String, damit der leere Zwischenstand möglich ist. Umwandlung und fachliche Prüfung erfolgen beim Absenden.', 'onSubmit erhält ein React.FormEvent<HTMLFormElement>. preventDefault verhindert wie bisher den Seitenwechsel. Fehler gehören in sichtbaren Text; ungültige Werte bleiben zur Korrektur stehen. Native required/min/max helfen zusätzlich.'],
    example: 'const [title, setTitle] = useState("");\n<label htmlFor="title">Lernziel</label><input id="title" value={title} onChange={event => setTitle(event.target.value)} />',
    task: 'Baue TaskForm mit Titel und Minuten als Strings, Fehlertext und onSubmit. Prüfe Titel 1–80 getrimmte Zeichen und ganze Minuten 1–240. Zeige zunächst nur den gültigen Text, ohne eine Aufgabenliste zu verändern.',
    hints: ['Leeren raw-Text prüfen, bevor Number als gültige 0 missverstanden wird.', 'Gültigkeit erst prüfen, danach Ergebnis oder Fehlermeldung setzen.'],
    solution: 'import { useState } from "react";\nfunction TaskForm() {\n  const [title, setTitle] = useState(""); const [raw, setRaw] = useState(""); const [message, setMessage] = useState("");\n  function submit(event: React.FormEvent<HTMLFormElement>) {\n    event.preventDefault(); const n = Number(raw);\n    if (!title.trim() || title.trim().length > 80 || !raw.trim() || !Number.isInteger(n) || n < 1 || n > 240) { setMessage("Titel und Minuten prüfen"); return; }\n    setMessage(title.trim() + " · " + n + " Minuten");\n  }\n  return <form onSubmit={submit}><label htmlFor="title">Lernziel</label><input id="title" required value={title} onChange={e => setTitle(e.target.value)} />\n    <label htmlFor="minutes">Minuten</label><input id="minutes" type="number" required min="1" max="240" step="1" value={raw} onChange={e => setRaw(e.target.value)} />\n    <button>Übernehmen</button><p role="status">{message}</p></form>;\n}',
    criteria: ['Leer-/Grenz-/Korrekturfälle wie im JS-Formular.', 'Feldwerte sind kontrolliert; keine Mischung aus DOM-Auslesen und React-Zustand.'],
  },
  {
    title: 'Zustand anheben und Aktionen als Props', goal: 'Geschwisterkomponenten über ihren gemeinsamen Elternteil verbinden.',
    explain: ['Wenn Formular und Liste dieselben Aufgaben brauchen, liegt tasks im gemeinsamen Elternteil. Das Formular erhält onAdd als Callback, die Liste erhält tasks. Das Kind meldet eine Absicht; der Elternteil ändert den Zustand.', 'Eine stabile ID wird genau beim erfolgreichen Anlegen erzeugt, nicht beim Rendern oder im Setter-Updater. crypto.randomUUID erzeugt im späteren sicheren lokalen Browserkontext eine zufällige UUID. Es ersetzt keine serverseitige Autorisierung. Hier identifiziert sie nur lokale Aufgaben.'],
    example: 'function add(title: string, minutes: number) {\n  const id = crypto.randomUUID();\n  setTasks(previous => [...previous, { id, title, minutes, done: false }]);\n}',
    task: 'Verbinde TaskForm und TaskList über App. TaskForm erhält onAdd:(title:string, minutes:number)=>boolean; false bedeutet Limit 200 erreicht. Leere Felder nur bei erfolgreichem Anlegen.',
    hints: ['Das Formular erzeugt keine zweite eigene Aufgabenliste.', 'App prüft das Limit, erzeugt die ID und aktualisiert tasks funktional.'],
    solution: 'const [tasks, setTasks] = useState<Task[]>([]);\nfunction add(title: string, minutes: number): boolean {\n  if (tasks.length >= 200) return false;\n  const id = crypto.randomUUID();\n  setTasks(previous => [...previous, { id, title, minutes, done: false }]);\n  return true;\n}\n// App: <TaskForm onAdd={add} /><TaskList tasks={tasks} />\n// Im gültigen submit: if (onAdd(title.trim(), n)) { setTitle(""); setRaw(""); }\n// sonst sichtbare Limitmeldung.',
    criteria: ['Ein Zustand für Formular und Liste, kein doppeltes Synchronisieren.', 'Gleiche Titel bekommen verschiedene IDs; Limitfehler erhält Eingabe.'],
  },
  {
    title: 'Ändern, Filtern und abgeleitete Werte', goal: 'Nur den notwendigen Zustand speichern.',
    explain: ['Erledigen nutzt map mit neuer Objektkopie, Entfernen filter. Suchtext ist ein eigener Zustand; sichtbare Liste und offene Minuten werden daraus berechnet. Speichere diese Ableitungen nicht zusätzlich und synchronisiere sie nicht mit Effekten.', 'Einfacher Code ist hier schnell genug. useMemo ist kein Pflichtmittel für jede Filterfunktion; es kann später anhand echter Messungen helfen. Zuerst müssen Datenfluss, Identität und fachliche Ergebnisse stimmen.'],
    example: 'const visible = tasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));\nconst minutes = tasks.filter(task => !task.done).reduce((sum, task) => sum + task.minutes, 0);',
    task: 'Ergänze Suche, Umschalten und Entfernen. Die Minutensumme soll alle offenen Aufgaben zählen, unabhängig vom Suchfilter; Trefferzahl zählt die sichtbaren. Erkläre diese zwei verschiedenen Bezugsgrößen.',
    hints: ['Der Zustand tasks bleibt die vollständige Liste.', 'setTasks(previous => previous.filter(task => task.id !== id)) entfernt gezielt.'],
    solution: 'function toggle(id: string) { setTasks(previous => previous.map(task => task.id === id ? { ...task, done: !task.done } : task)); }\nfunction remove(id: string) { setTasks(previous => previous.filter(task => task.id !== id)); }\nconst visible = tasks.filter(task => task.title.toLowerCase().includes(query.trim().toLowerCase()));\nconst remaining = tasks.filter(task => !task.done).reduce((sum, task) => sum + task.minutes, 0);\n// Suche value={query}/onChange, Liste visible, Summe remaining. Keine zusätzlichen Effekte nötig.',
    criteria: ['Filter löscht keine Daten; Summe hat den ausdrücklich vereinbarten Bezug.', 'Originalobjekte nicht mutiert; gleiche Titel getrennt bedienbar.'],
  },
  {
    title: 'Refs für gezielten Fokus', goal: 'Eine eng begrenzte DOM-Aufgabe korrekt ausführen.',
    explain: ['useRef hält einen Wert über Renderaufrufe hinweg, ohne durch eine Änderung einen neuen Render auszulösen. Mit ref am input erhältst du einen Bezug auf das echte Element. input.current kann null sein; ?. führt den Aufruf nur aus, wenn der Wert vorhanden ist.', 'React verwaltet weiterhin die Darstellung. Verwende Refs hier ausschließlich für Fokus, nicht um Werte und Inhalte neben React zu pflegen. Nach dem Entfernen eines Listeneintrags kannst du eine verbleibende Überschrift mit tabIndex={-1} fokussieren.'],
    example: 'const input = useRef<HTMLInputElement>(null);\n// JSX: <input ref={input} ... />\n// Nach erfolgreicher Übernahme: input.current?.focus();',
    task: 'Setze nach erfolgreichem Anlegen den Fokus ins Titelfeld. Nach Entfernen fokussiere eine bestehende h2 "Lernziele". Teste den Ablauf später ohne Maus und mit einem leeren Suchergebnis.',
    hints: ['Die Überschrift braucht tabIndex={-1}, um programmatisch fokussierbar zu sein.', 'Der Ref-Typ passt zum Element: HTMLInputElement beziehungsweise HTMLHeadingElement.'],
    solution: 'const input = useRef<HTMLInputElement>(null);\nconst heading = useRef<HTMLHeadingElement>(null);\n// Im Formular: <input ref={input} ... />\n// Nach erfolgreichem Anlegen: input.current?.focus();\n// Liste: <h2 ref={heading} tabIndex={-1}>Lernziele</h2>\nfunction remove(id: string) {\n  setTasks(previous => previous.filter(task => task.id !== id));\n  heading.current?.focus();\n}',
    criteria: ['Fokusziel existiert auch nach Löschen des letzten Treffers.', 'Ref ändert keine Formulardaten oder Kindinhalte hinter Reacts Rücken.'],
  },
  {
    title: 'Effekte für lokale Speicherung', goal: 'Externe Synchronisation von Berechnung trennen.', reference: refs.effects,
    explain: ['useEffect synchronisiert nach dem Rendern mit etwas außerhalb von React, hier localStorage. Der Abhängigkeitsarray benennt verwendete reaktive Werte. Ein Initialisierer useState(readInitial) liest den Anfangszustand; er muss ohne Schreibeffekte arbeiten.', 'Im Strict Mode können Entwicklungsläufe Initialisierer und Effekte zusätzlich ausführen, um Fehler sichtbar zu machen. Eine reine Initialisierung und idempotentes Schreiben desselben Zustands vertragen das. Bei einem unlesbaren Altstand sperrst du automatische Speicherung, damit [] ihn nicht überschreibt.'],
    example: 'useEffect(() => {\n  if (!initial.writable) return;\n  try { localStorage.setItem("react-plan-v1", JSON.stringify({ version:1, tasks })); }\n  catch { setMessage("Nicht gespeichert; nur Arbeitsspeicher."); }\n}, [tasks, initial.writable]);',
    task: 'Ergänze readInitial mit JSON-/Schema-Prüfung und writable-Flag. Schreibe nur bei lesbarem Altstand. Teste später gültigen Reload, kaputtes JSON und Schreibausfall. Speichere nicht in jedem Renderkörper.',
    hints: ['Ein catch beim Lesen liefert tasks:[], writable:false und einen ehrlichen Fehlertext.', 'Die Schema-Prüfung aus Kapitel 29 plus eindeutige IDs bleibt erforderlich.'],
    solution: '// Vollständige readInitial-Funktion siehe Kapitelabschluss.\nconst [initial] = useState(readInitial);\nconst [tasks, setTasks] = useState<Task[]>(initial.tasks);\nconst [message, setMessage] = useState(initial.error);\nuseEffect(() => {\n  if (!initial.writable) return;\n  try { localStorage.setItem("react-plan-v1", JSON.stringify({ version: 1, tasks })); setMessage("Lokal gespeichert"); }\n  catch { setMessage("Speichern fehlgeschlagen; nur Arbeitsspeicher."); }\n}, [tasks, initial.writable]);',
    criteria: ['Keine Schreiboperation im Render oder Initialisierer.', 'Kaputter Altstand unangetastet; Strict-Mode-Wiederholungen verursachen keine doppelten Aufgaben.'],
  },
  {
    title: 'Asynchrone Effekte mit Aufräumen', goal: 'Veraltete Ergebnisse beim Wechsel verwerfen.', reference: refs.effects,
    explain: ['Ein Effect selbst ist nicht async: Er darf eine Aufräumfunktion zurückgeben. Starte darin eine eigene async-Funktion. Beim Wechsel der Abhängigkeiten oder Entfernen der Komponente läuft das Cleanup. void run() startet die Funktion und verwirft bewusst ihren Rückgabewert; Fehler müssen weiterhin innerhalb von run behandelt werden.', 'Ein active-Flag verhindert spätere Zustandsupdates aus einem veralteten Lauf. Beim späteren kontrollierten fetch-Adapter ergänzt ein AbortController echten Abbruch. Alle vom Effekt verwendeten reaktiven Werte müssen in den Abhängigkeiten berücksichtigt werden; verstecke sie nicht hinter einem leeren Array.'],
    example: 'useEffect(() => {\n  let active = true;\n  async function run() { const items = await loadTopics(request); if (active) setItems(items); }\n  void run();\n  return () => { active = false; };\n}, [request]);\n// Fehlerweg im eigenen Code ergänzen.',
    task: 'Baue eine Katalogkomponente mit Lade-/Fehler-/Leerzustand. request kommt als stabile Prop aus der Vorlage. Ergänze catch und das active-Flag in beiden Ergebniswegen. Teste Wechsel A langsam/B schnell und Entfernen der Komponente.',
    hints: ['Das Flag gilt auch im catch, damit ein alter Fehler keine neuen Daten ersetzt.', 'Der Elternteil darf request nicht ohne Grund bei jedem Render als neue Funktion erzeugen.'],
    solution: 'useEffect(() => {\n  let active = true; setState({ status: "loading" });\n  async function run() {\n    try { const items = await loadTopics(request); if (active) setState({ status: "ready", items }); }\n    catch { if (active) setState({ status: "error", error: "Laden fehlgeschlagen" }); }\n  }\n  void run();\n  return () => { active = false; };\n}, [request]);\n// loadTopics prüft HTTP/JSON/Schema aus Kapitel 24; State als Union aus Kapitel 29.',
    criteria: ['Keine veralteten Erfolgs-/Fehlerübernahmen; Cleanup erklärt.', 'Kein async-Effect direkt, keine verschluckte unbehandelte Ablehnung.'],
  },
  {
    title: 'Navigation und Detailansichten', goal: 'Eine URL als Teil des Anwendungszustands behandeln.', reference: refs.routing,
    explain: ['Für diese Kursvorlage verwenden wir ausdrücklich die bekannte React-Router-6-API: BrowserRouter, Routes, Route und Link. Der Pfad /tasks/:id enthält einen Parameter; useParams liest ihn. Eine fehlende ID oder unbekannte Aufgabe benötigt eine verständliche Ansicht.', 'Clientnavigation muss auch Titel und Fokus berücksichtigen. useLocation liefert den aktuellen Pfad; ein Effekt kann die neue h1 fokussieren und document.title setzen. Beim späteren Hosting braucht BrowserRouter eine passende Rückfallroute zu index.html für direkte URLs.'],
    example: '<Routes>\n  <Route path="/" element={<Overview />} />\n  <Route path="/tasks/:id" element={<Detail />} />\n  <Route path="*" element={<NotFound />} />\n</Routes>',
    task: 'Ergänze Übersicht, Detail und unbekannte Route. Verlinke Aufgaben per ID, benutze useParams und zeige "Aufgabe nicht gefunden", wenn sie fehlt. Prüfe später Zurück/Vor, direkte URL und Fokus.',
    hints: ['Die Liste nutzt Link statt erzwungener location-Zuweisung.', 'tasks.find(task => task.id === id) kann undefined ergeben.'],
    solution: 'function Detail({ tasks }: { tasks: Task[] }) {\n  const { id } = useParams();\n  const task = tasks.find(task => task.id === id);\n  return <><h1>Details</h1>{task ? <p>{task.title} · {task.minutes} Minuten</p> : <p>Aufgabe nicht gefunden</p>}<Link to="/">Zurück</Link></>;\n}\n// Provider und Routen wie Beispiel; RouteHeading mit Fokus/Titel im vollständigen Abschlusscode.',
    criteria: ['Unbekannte ID und unbekannter Pfad getrennt behandelt.', 'Zurück/Vor und direkter Aufruf geplant; Router-6-Vorlage statt versionsloser Installationsanweisung.'],
  },
  {
    title: 'Geführtes React-Projekt vollständig zusammenführen', goal: 'Die bekannte Anwendung als typisierte Komponentenanwendung erklären.',
    explain: ['Führe die Bausteine zu einem Lernplan zusammen: Formular, Suche, Aufgabenaktionen, offene Minuten, Speicherung und Detailroute. isTask stammt aus Kapitel 29. Die Referenz benutzt zusätzlich Set zur ID-Duplikatprüfung: new Set(ids).size zählt verschiedene Werte.', 'Die Null-sichere Schreibweise ?. wurde bei Refs eingeführt. encodeURIComponent kodiert eine einzelne ID für den URL-Pfad. Teile die kompakte Referenz später in Typ-, Prüf-, Formular-, Listen- und Routingmodule auf. Gestaltung und Testmatrix übernimmst du aus den vorherigen Projekten.'],
    example: 'Dateien: main.tsx, App.tsx, validation.ts, model.ts, style.css, index.html sowie Paket-/TS-Konfiguration der späteren Vorlage.',
    task: 'Baue den Lernplan in Etappen nach, ohne alles auf einmal zu kopieren. Gib Modulstruktur, Modelltests und Browserprüfplan ab. Erkläre Zustand, Props, Setter, abgeleitete Werte, Ref, Effect/Cleanup und Routing an deiner Umsetzung.',
    hints: ['Erst ohne Speicherung/Routing einen bedienbaren Kern schaffen, dann jeweils einen Baustein ergänzen.', 'isTask exportieren; Hauptdatei importiert App. Stil und Fokus aus den bekannten CSS-Regeln ergänzen.'],
    solution: '// App.tsx, benötigt validation.ts mit exportiertem isTask aus Kapitel 29:\n' + reactPlanner + '\n// main.tsx in der Vorlage:\n// import { StrictMode } from "react"; import { createRoot } from "react-dom/client"; import App from "./App";\n// const root = document.getElementById("root"); if (!root) throw new Error("Root fehlt");\n// createRoot(root).render(<StrictMode><App /></StrictMode>);',
    criteria: ['Verhalten aus Projekt 4 erhalten, Suche und Detailroute ergänzt.', 'Typprüfung/Tests/Build/Bedienung jeweils separat nachweisen; technische Integration dieser Inhaltsfassung bleibt offen.'],
  },
]);
