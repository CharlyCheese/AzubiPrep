const ROOT = 'azubiprep-frontendpilot-v1';
const MAX = 32 * 1024 * 1024;
let queue = Promise.resolve();
async function directory() {
  if (!navigator.storage?.getDirectory) throw new Error('Dieser Browser bietet keinen Projektspeicher. Bitte regelmäßig exportieren.');
  return (await navigator.storage.getDirectory()).getDirectoryHandle(ROOT, { create: true });
}
async function read(dir, name) {
  const file = await (await dir.getFileHandle(name)).getFile();
  if (file.size > MAX) throw new Error('Gespeicherter Stand zu groß.');
  return JSON.parse(await file.text());
}
async function write(dir, name, data) {
  const text = JSON.stringify(data);
  if (new TextEncoder().encode(text).length > MAX) throw new Error('Entwürfe zu groß. Bitte Projekte exportieren.');
  const stream = await (await dir.getFileHandle(name, { create: true })).createWritable();
  try { await stream.write(text); await stream.close(); }
  catch (error) { await stream.abort().catch(() => {}); throw error; }
}
export async function loadCourse() {
  if (window.azubiDesktop?.version === 1) return window.azubiDesktop.loadCourse();
  const dir = await directory();
  let head;
  try { head = await read(dir, 'head.json'); }
  catch (error) { if (error.name === 'NotFoundError') return null; throw error; }
  if (head.schema !== 1 || !/^[ab]$/.test(head.slot)) throw new Error('Unbekanntes Speicherformat; bestehende Daten bleiben erhalten.');
  try { const value = await read(dir, `${head.slot}.json`); if (value.schema !== 1) throw new Error('Unbekannte Speicherversion.'); return value; }
  catch { throw new Error('Gespeicherter Entwurf nicht lesbar. Vorhandene Daten werden nicht überschrieben.'); }
}
export function saveCourse(value) {
  if (window.azubiDesktop?.version === 1) return window.azubiDesktop.saveCourse(value);
  const task = queue.catch(() => {}).then(async () => {
    const dir = await directory();
    let head = null;
    try { head = await read(dir, 'head.json'); } catch (error) { if (error.name !== 'NotFoundError') throw error; }
    if (head && (head.schema !== 1 || !/^[ab]$/.test(head.slot))) throw new Error('Unbekannte Speicherversion bleibt erhalten.');
    const slot = head?.slot === 'a' ? 'b' : 'a';
    await write(dir, `${slot}.json`, value);
    await write(dir, 'head.json', { schema: 1, slot });
  });
  queue = task;
  return task;
}
