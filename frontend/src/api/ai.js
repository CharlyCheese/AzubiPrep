import { VALIDATOR_VERSION } from '../pilot/course.js';

const hosts = ['127.0.0.1', 'localhost', '[::1]'];
export function isLocalAi() { return hosts.includes(window.location.hostname); }
async function request(endpoint, { body, signal, method, pdf } = {}) {
  const base = new URL(import.meta.env.VITE_API_BASE_URL || '/api', window.location.origin);
  if (!isLocalAi() || base.origin !== window.location.origin) throw new Error('Die Lernbegleitung ist nur in der lokalen AzubiPrep-Anwendung verfügbar.');
  let response;
  try {
    response = await fetch(`${base.href.replace(/\/$/, '')}/ai/${endpoint}`, { method: method || (body || pdf ? 'POST' : 'GET'), cache: 'no-store', credentials: 'same-origin', signal, headers: { 'X-AzubiPrep-AI': '1', ...(pdf ? { 'Content-Type': 'application/pdf' } : body ? { 'Content-Type': 'application/json' } : {}) }, ...(pdf ? { body: pdf } : body ? { body: JSON.stringify(body) } : {}) });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Der lokale Anwendungsdienst ist nicht erreichbar. Starte AzubiPrep erneut oder nutze die festen Hinweise.');
  }
  let value;
  try { value = await response.json(); } catch { throw new Error('Der lokale Anwendungsdienst hat keine lesbare Antwort geliefert.'); }
  if (response.status === 404 && !value.code) throw new Error('Der laufende Anwendungsdienst unterstützt die Lernbegleitung noch nicht. Starte den aktuellen AzubiPrep-Stand erneut.');
  if (!response.ok) throw new Error(value.error || 'Die lokale Lernbegleitung ist gerade nicht verfügbar.');
  return value;
}
export const ai = {
  status: (signal, provider = 'qwen') => request(provider === 'qwen' ? 'status' : `status?provider=${encodeURIComponent(provider)}`, { signal }), help: (body, signal) => request('help', { body, signal }),
  chatgptStatus: signal => request('chatgpt/status', { signal }),
  chatgptSignin: accountId => request('chatgpt/signin', { body: { ...(accountId ? { accountId } : {}) } }),
  chatgptCancel: () => request('chatgpt/cancel', { body: {} }),
  chatgptSelect: accountId => request('chatgpt/select', { body: { accountId } }),
  chatgptSignout: () => request('chatgpt/signout', { body: {} }),
  materialStatus: signal => request('material/status', { signal }),
  addPdf: (pdf, signal) => { if (!pdf.size || pdf.size > 128 * 1024 * 1024) return Promise.reject(new Error('Bitte eine PDF mit höchstens 128 MiB auswählen.')); return request('material/documents', { pdf, signal }); },
  prepareMaterial: () => request('material/prepare', { body: {} }),
  cancelMaterial: () => request('material/cancel', { body: {} }),
  removeMaterial: (id, model) => request(`material/documents/${encodeURIComponent(id)}`, { method: 'DELETE', body: { model } }),
};

export function courseContext(lesson, project, selected, includeCode, element = null) {
  const textFiles = Object.entries(project.files).filter(([name, file]) => (lesson.jsStep ? /\.(html|css|js)$/i : /\.(html|css)$/i).test(name) && file.kind === 'text');
  textFiles.sort(([a], [b]) => a === selected ? -1 : b === selected ? 1 : a.localeCompare(b));
  const files = includeCode ? textFiles.slice(0, 3).map(([name, file], index) => {
    const limit = index === 0 ? 3000 : 1000;
    return { path: name, content: file.content.slice(0, limit), complete: file.content.length <= limit };
  }) : [];
  const result = project.checks.at(-1);
  return {
    kind: 'course', lessonId: lesson.id, task: lesson.task,
    explanation: lesson.explain.join('\n').slice(0, 2500),
    prerequisite: lesson.prerequisite, stand: project.stand, files,
    checks: result?.stand === project.stand && result.lessonVersion === lesson.version && result.validatorVersion === VALIDATOR_VERSION
      ? [...result.results.filter(item => !item.passed), ...result.results.filter(item => item.passed)].slice(0, 8).map(item => ({ passed: item.passed, file: (item.file || '').slice(0, 220), message: item.message.slice(0, 350) })) : [],
    ...(element && includeCode ? { element: { html: element.html.slice(0, 800), rules: element.rules.join('\n').slice(0, 1200), values: element.values.join('\n').slice(0, 800) } } : {}),
  };
}
