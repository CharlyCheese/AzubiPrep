import https from 'node:https';
import { URLSearchParams } from 'node:url';
import { AiError } from './ai-error.js';
import { createChatgptAuth } from './chatgpt-auth.js';

export const CLOUD_LIMITS = Object.freeze({ responseBytes: 512000, catalogBytes: 8 * 1024 * 1024 });

export function openaiRequest(url, { body, token, form, signal, timeoutMs = 15000, stream = false } = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== 'https:' || !['auth.openai.com', 'api.openai.com'].includes(parsed.hostname) || parsed.port || parsed.username || parsed.password || parsed.hash) throw new AiError('configuration', 'Nicht freigegebene OpenAI-Verbindung.', 503);
  const catalog = !body && !stream && parsed.origin === 'https://api.openai.com' && parsed.pathname === '/v1/models' && !parsed.search && !parsed.href.endsWith('?');
  const byteLimit = catalog ? CLOUD_LIMITS.catalogBytes : CLOUD_LIMITS.responseBytes;
  return new Promise((resolve, reject) => {
    let size = 0; let finished = false; let pending = ''; let output = ''; let completed = false;
    const finish = (error, result) => { if (finished) return; finished = true; clearTimeout(timer); signal?.removeEventListener('abort', abort); if (error) { request.destroy(); reject(error); } else resolve(result); };
    const unavailable = () => finish(new AiError('unavailable', 'ChatGPT ist nicht erreichbar. Prüfe die Internetverbindung oder lerne ohne KI weiter.', 503));
    const abort = () => finish(new AiError('aborted', 'Die KI-Anfrage wurde abgebrochen.', 499));
    const request = https.request(parsed, { agent: false, method: body ? 'POST' : 'GET', headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': form ? 'application/x-www-form-urlencoded' : 'application/json' } : {}) } }, response => {
      if (response.statusCode !== 200) {
        response.resume(); const status = response.statusCode;
        finish(new AiError(status === 401 ? 'signin_required' : status === 429 ? 'usage_limit' : status === 403 ? 'plan_unavailable' : 'service', status === 429 ? 'Dein ChatGPT-Nutzungslimit ist erreicht. Öffne die Nutzungsverwaltung oder lerne ohne KI weiter.' : status === 401 ? 'Bitte melde dich erneut mit ChatGPT an.' : 'ChatGPT hat die Anfrage abgelehnt. Prüfe Konto, Freigabe und Modellauswahl.', status === 429 ? 429 : 503)); return;
      }
      response.setEncoding('utf8');
      response.on('data', chunk => {
        try {
        size += Buffer.byteLength(chunk); if (size > byteLimit) { finish(new AiError('response_limit', catalog ? 'Der ChatGPT-Modellkatalog überschreitet die erlaubte Größe.' : 'Die Cloudantwort überschreitet die erlaubte Größe.', 502)); return; }
        pending += chunk;
        if (!stream) return;
        pending = pending.replaceAll('\r\n', '\n'); let boundary;
        while ((boundary = pending.indexOf('\n\n')) !== -1) {
          const block = pending.slice(0, boundary); pending = pending.slice(boundary + 2);
          const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n'); if (!data || data === '[DONE]') continue;
          let event; try { event = JSON.parse(data); } catch { finish(new AiError('response', 'Die ChatGPT-Antwort ist nicht lesbar.', 502)); return; }
          if (completed) { finish(new AiError('response', 'Die Modellantwort enthielt unerwartete Daten nach ihrem Abschluss.', 502)); return; }
          if (!event || typeof event !== 'object' || Array.isArray(event) || typeof event.type !== 'string' || (event.type === 'response.output_text.delta' && typeof event.delta !== 'string') || (event.type === 'response.completed' && (!event.response || !Array.isArray(event.response.output)))) { finish(new AiError('response', 'Die ChatGPT-Antwort hat ein unerwartetes Format.', 502)); return; }
          if (event.type === 'response.output_text.delta') { output += event.delta; if (output.length > 18000) { finish(new AiError('response_limit', 'Die KI-Antwort ist zu lang. Frage nach einem kleineren Teil.', 502)); return; } }
          if (event.type === 'response.failed' || event.type === 'error' || event.type === 'response.incomplete') { const code = event.response?.error?.code || event.error?.code || event.code; const limit = typeof code === 'string' && /usage_limit|subscription_sharing_usage/.test(code); finish(new AiError(limit ? 'usage_limit' : 'response', limit ? 'Dein ChatGPT-Kontingent ist nicht verfügbar. Öffne die Nutzungsverwaltung.' : 'ChatGPT hat keine vollständige Antwort geliefert.', limit ? 429 : 502)); return; }
          if (event.type === 'response.completed') { if (event.response.status !== 'completed' || event.response.output.some(item => !item || !['message', 'reasoning'].includes(item.type))) { finish(new AiError('response', 'Die Modellantwort enthält keine freigegebene Lernantwort.', 502)); return; } completed = true; }
        }
        } catch { finish(new AiError('response', 'Die Modellantwort hatte ein unerwartetes Format.', 502)); }
      });
      response.on('end', () => {
        if (finished) return;
        if (stream) { if (!completed || !output.trim()) finish(new AiError('response', 'Die ChatGPT-Verbindung endete vor einer vollständigen Antwort.', 502)); else finish(null, output); }
        else { try { finish(null, pending ? JSON.parse(pending) : {}); } catch { finish(new AiError('response', 'OpenAI hat keine lesbare Rückmeldung geliefert.', 502)); } }
      });
      response.on('error', unavailable); response.on('aborted', unavailable);
    });
    const timer = setTimeout(() => finish(new AiError('timeout', 'ChatGPT hat zu lange gebraucht. Versuche es erneut.', 504)), timeoutMs);
    request.on('error', unavailable); signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    request.end(body ? form ? new URLSearchParams(body).toString() : JSON.stringify(body) : undefined);
  });
}
export function createChatgptService(settings, dependencies = {}) {
  const request = dependencies.request || openaiRequest;
  const auth = dependencies.auth || createChatgptAuth(settings, { request });
  async function models(signal, snapshot) {
    const session = snapshot || await auth.session(); const value = await request('https://api.openai.com/v1/models', { token: session.token, signal });
    await auth.assertSession(session);
    if (!value || !Array.isArray(value.models)) throw new AiError('response', 'Die ChatGPT-Modellliste ist nicht lesbar.', 502);
    return value.models.filter(item => item && item.visibility === 'list' && typeof item.slug === 'string' && /^[a-zA-Z0-9._:-]{1,80}$/.test(item.slug)).slice(0, 30).map(item => ({ name: item.slug, label: typeof item.display_name === 'string' && item.display_name ? item.display_name.slice(0, 100) : item.slug }));
  }
  return { auth, models,
    async status(signal) { const account = await auth.status(); if (!account.connected || !account.planEnabled) return { state: account.connected ? 'plan_unavailable' : 'signin_required', models: [], ...account, localOnly: false }; const list = await models(signal); return { state: list.length ? 'ready' : 'no_model', models: list, defaultModel: list[0]?.name || '', ...account, localOnly: false }; },
    async generate({ model, messages, schema, signal }) {
      const revision = auth.revision(); const session = await auth.session(); const available = await models(signal, session);
      if (!available.some(item => item.name === model)) throw new AiError('no_model', 'Das gewählte Modell ist für dieses ChatGPT-Konto nicht verfügbar. Prüfe die Verbindung erneut.', 400);
      await auth.assertSession(session); const token = session.token;
      if (signal?.aborted || revision !== auth.revision()) throw new AiError('changed', 'Konto oder Anfrage hat sich geändert. Es wurde keine neue Modellanfrage gestartet.', 409);
      const content = await request('https://api.openai.com/v1/responses', { token, signal, timeoutMs: settings.aiTimeoutMs, stream: true, body: { model, instructions: messages[0].content, input: [{ role: 'user', content: messages[1].content }], store: false, stream: true, text: { format: { type: 'json_schema', name: 'learning_answer', strict: true, schema } } } });
      await auth.assertSession(session);
      if (revision !== auth.revision()) throw new AiError('changed', 'Das ChatGPT-Konto hat sich geändert. Bitte erneut anfragen.', 409);
      return { done: true, message: { role: 'assistant', content } };
    },
  };
}
