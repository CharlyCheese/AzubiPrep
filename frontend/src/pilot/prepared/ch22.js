import { chapter, refs } from './shared.js';

export const validTasksCode = `function validTasks(value) {
  if (!Array.isArray(value) || value.length > 200) return false;
  const ids = [];
  for (const task of value) {
    if (!task || typeof task !== "object" || Array.isArray(task)) return false;
    if (typeof task.id !== "string" || !task.id || ids.includes(task.id)) return false;
    if (typeof task.title !== "string" || !task.title.trim() || task.title.length > 80) return false;
    if (!Number.isInteger(task.minutes) || task.minutes < 1 || task.minutes > 240) return false;
    if (typeof task.done !== "boolean") return false;
    ids.push(task.id);
  }
  return true;
}`;

export default chapter(22, 'Zustand, JSON und lokale Sicherung', 'Kapitel 21: Formularverarbeitung und reine Prüffunktionen.', 'Später: eigener Speicherbereich der isolierten Übung, ohne Zugriff auf App-Daten.', refs.storage, [
  {
    title: 'Datenzustand als einzige Wahrheit', goal: 'Zustand ändern und daraus rendern.',
    explain: ['Die Aufgabenliste lebt als Array in JS, nicht als ausgelesener Text in li-Elementen. render(tasks) leitet die Ansicht daraus ab. Eine Aktion ändert zuerst die Daten und ruft dann render auf. So haben Filter, Summe und Speicherung dieselbe Grundlage.', 'Jeder Datensatz bekommt eine stabile id. Zwei Aufgaben dürfen gleich heißen. Der Arrayindex ist als dauerhafte Identität ungeeignet, weil Löschen und Sortieren ihn ändern. Für diese lokalen Übungsdaten führen wir zunächst fortlaufende IDs als Strings ein.', 'Zwei Kurzformen kommen dazu: { title, minutes } bedeutet { title: title, minutes: minutes }. Der bedingte Ausdruck bedingung ? wertWennWahr : wertWennFalsch wählt einen von zwei Werten. In map kannst du damit entweder eine geänderte Objektkopie oder den unveränderten Eintrag zurückgeben. { ...task, done: !task.done } kopiert zunächst die Felder und überschreibt danach done.'],
    example: 'let tasks = [];\nlet nextId = 1;\nfunction add(title, minutes) {\n  tasks = [...tasks, { id: String(nextId++), title, minutes, done: false }];\n}',
    task: 'Schreibe toggle(tasks, id), die eine neue Liste mit genau dem passenden done-Wert umkehrt. Nicht passende Objekte dürfen wiederverwendet werden; das geänderte Objekt soll neu sein. Unbekannte ID verändert keine Werte.',
    hints: ['Nutze map und vergleiche task.id mit id.', 'task.id === id ? { ...task, done: !task.done } : task'],
    solution: 'function toggle(tasks, id) {\n  return tasks.map(task => task.id === id ? { ...task, done: !task.done } : task);\n}',
    criteria: ['Doppelte Titel werden anhand ihrer ID getrennt behandelt.', 'Originalarray und ursprüngliches betroffenes Objekt bleiben unverändert.'],
  },
  {
    title: 'Darstellung wiederholbar ableiten', goal: 'Vollständiges Neurendern mit Fokusfolgen verstehen.',
    explain: ['Eine kleine App kann die Liste nach jeder Aktion neu aufbauen. Die Zusammenfassung wird jedes Mal aus tasks berechnet, nicht separat hoch- und heruntergezählt. Dadurch driften Werte nach mehreren Aktionen nicht auseinander.', 'Ein vollständiger Neuaufbau entfernt aber auch den fokussierten Button. Plane deshalb das Fokusziel: nach erfolgreichem Hinzufügen zum Titelfeld, nach einer Aktion möglichst zum entsprechenden neuen Button. Die praktische Fokusprüfung gehört zur späteren Browserabnahme.'],
    example: 'const open = tasks.filter(task => !task.done);\nsummary.textContent = open.length + " offen · " + open.reduce((sum, task) => sum + task.minutes, 0) + " Minuten";',
    task: 'Ergänze render(tasks) mit sicherer Titelliste und offener Minutensumme. Prüfe denselben Zustand zweimal und danach eine vollständig erledigte Liste. Erkläre, warum die Summe nicht in einer zweiten Variablen mitgeführt wird.',
    hints: ['Leere den Listencontainer und berechne die Zusammenfassung aus den aktuellen Daten.', 'Offene Liste filtern, length und reduce mit Startwert 0 verwenden.'],
    solution: 'function render(tasks) {\n  list.replaceChildren();\n  for (const task of tasks) {\n    const li = document.createElement("li");\n    li.textContent = task.title + (task.done ? " · erledigt" : " · offen"); list.append(li);\n  }\n  const open = tasks.filter(task => !task.done);\n  summary.textContent = open.length + " offen · " + open.reduce((sum, task) => sum + task.minutes, 0) + " Minuten";\n}',
    criteria: ['Keine Duplikate oder Summendrift nach mehreren Renderaufrufen.', 'Leere/erledigte Liste: 0 offen und 0 Minuten.'],
  },
  {
    title: 'JSON schreiben und wieder lesen', goal: 'Serialisierung von echten JS-Werten unterscheiden.', reference: refs.json,
    explain: ['JSON.stringify wandelt passende Daten in Text um. JSON.parse liest JSON-Text zurück und kann bei ungültigem Text werfen. JSON ist kein JS-Programm: keine Funktionen, Kommentare oder undefined. Schlüssel benötigen doppelte Anführungszeichen.', 'JSON.parse beweist nicht, dass die gelesene Struktur deinen Anforderungen entspricht. Auch null, 7 oder {"tasks":"falsch"} sind gültiges JSON. Ein gelesener Wert muss anschließend fachlich geprüft werden. Verwende niemals eval zum Einlesen.'],
    example: 'const text = JSON.stringify({ version: 1, tasks: [] });\nconst value = JSON.parse(text);\nconsole.log(value.version); // 1',
    task: 'Erzeuge eine JSON-Sicherung mit version:1 und deiner Aufgabenliste. Lies sie zurück und vergleiche die Feldwerte. Teste gültiges, aber unpassendes JSON und absichtlich abgeschnittenen Text in try/catch.',
    hints: ['Strukturprüfung folgt erst nach erfolgreichem Parsen.', 'JSON.parse("{broken") wirft; JSON.parse("null") nicht.'],
    solution: 'const backup = JSON.stringify({ version: 1, tasks });\ntry {\n  const value = JSON.parse(backup);\n  if (!value || value.version !== 1 || !Array.isArray(value.tasks)) throw new Error("Unpassendes Format");\n  console.log(value.tasks.length);\n} catch (error) { console.log("Sicherung nicht lesbar: " + error.message); }',
    criteria: ['Werte im Roundtrip erhalten, Funktionen nicht Bestandteil der Sicherung.', 'Syntaxfehler und falsche Struktur als verschiedene Fehler erklären.'],
  },
  {
    title: 'Geladene Daten vollständig prüfen', goal: 'Unbekannte Daten an der Grenze zurückweisen.',
    explain: ['Für den Lernplan begrenzen wir auf 200 Aufgaben, Titel 1–80 Zeichen und ganze Minuten 1–240. IDs sind eindeutige nichtleere Strings und done ist ein Boolean. Array.isArray unterscheidet Arrays von anderen Objekten. includes prüft hier, ob eine ID bereits vorkam.', 'Ein Schema schützt vor kaputten Daten und verhindert, dass eine beliebige Textdatei versehentlich als Zustand übernommen wird. Die Größenbegrenzung ist eine bewusste Produktentscheidung für dieses kleine Projekt; sie ist kein allgemeines localStorage-Limit.'],
    example: 'const bad = [{ id: "1", title: "HTML", minutes: "20", done: false }];\n// minutes ist ein String: zurückweisen, nicht stillschweigend umdeuten.',
    task: 'Schreibe validTasks(value) als reine Funktion. Prüfe Typen, Grenzen und doppelte IDs. [] ist gültig, null und doppelte IDs sind ungültig. Erst validierte Daten dürfen einen vorhandenen Zustand ersetzen.',
    hints: ['Prüfe Array und Länge, dann jeden Eintrag. Sammle bereits gesehene IDs.', 'Prüfe typeof vor trim; Number.isInteger vor Zahlenbereich.'],
    solution: validTasksCode,
    criteria: ['null, 201 Einträge, falsche Typen, Leerraumtitel und doppelte IDs zurückgewiesen.', '0/241 Minuten ungültig, 1/240 gültig; [] gültig.'],
  },
  {
    title: 'Speichern kann scheitern', goal: 'Lokale Sicherung mit ehrlicher Rückmeldung bauen.',
    explain: ['localStorage speichert Strings synchron pro Origin. setItem kann beispielsweise wegen Speichergrenzen oder blockiertem Zugriff werfen. Ein gespeicherter Zustand ist geräte-/browsergebunden; Löschen von Browserdaten entfernt ihn. Kein Geheimnis gehört hinein.', 'Fange Lese-, Parse- und Schreibfehler ab. Bei einem Schreibfehler bleiben Daten im Arbeitsspeicher nutzbar; melde ausdrücklich, dass sie nicht dauerhaft gespeichert sind. Überschreibe einen unlesbaren alten Stand nicht automatisch beim Start. Der spätere Übungsspeicher wird von App-Daten getrennt.'],
    example: 'try {\n  localStorage.setItem("lernplan-v1", JSON.stringify({ version: 1, tasks }));\n  message.textContent = "Lokal gespeichert";\n} catch { message.textContent = "Speichern fehlgeschlagen; Änderungen nur im Arbeitsspeicher."; }',
    task: 'Implementiere save(tasks) und load(). load liefert bei fehlendem Schlüssel []; bei falschem Format wirft sie einen verständlichen Fehler. Nutze validTasks. Lege im Fehlerfall keinen leeren Ersatzstand automatisch im Speicher ab.',
    hints: ['getItem liefert null, wenn der Schlüssel fehlt; JSON.parse nur bei vorhandenem Text.', 'Ein try/catch um den Aufrufer kann Ladefehler anzeigen und bewusstes Zurücksetzen anbieten.'],
    solution: 'function save(tasks) {\n  if (!validTasks(tasks)) throw new Error("Ungültiger Zustand");\n  localStorage.setItem("lernplan-v1", JSON.stringify({ version: 1, tasks }));\n}\nfunction load() {\n  const raw = localStorage.getItem("lernplan-v1");\n  if (raw === null) return [];\n  const value = JSON.parse(raw);\n  if (!value || value.version !== 1 || !validTasks(value.tasks)) throw new Error("Sicherung hat ein falsches Format");\n  return value.tasks;\n}\n// Beim Start load in try/catch; kein automatisches save nach Ladefehler.',
    criteria: ['Reload erhält gültigen Stand; fehlender Schlüssel ergibt [].', 'Beschädigter Stand bleibt bei Ladefehler unangetastet; Speicherausfall wird nicht als Erfolg bezeichnet.'],
  },
]);
