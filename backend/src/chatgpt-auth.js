import http from 'node:http';
import { createHash, randomBytes, randomUUID, createPublicKey, timingSafeEqual } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createAiVault } from './ai-vault.js';
import { AiError } from './ai-error.js';

const ISSUER = 'https://auth.openai.com'; const RESOURCE = 'https://api.openai.com/v1';
const scopes = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const secret = () => randomBytes(32).toString('base64url');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && a.length === b.length && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const clientValid = value => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,150}$/.test(value) && value !== 'dynamic_agent_client';
const hasPlan = account => account?.scopes?.includes('resource.invoke') && account.scopes.includes('chatgpt.tokens.use.direct');
function endpoint(value) { const url = new URL(value); if (url.origin !== ISSUER || url.username || url.password || url.search || url.hash) throw new AiError('configuration', 'Die OpenAI-Anmeldekonfiguration ist nicht freigegeben.', 503); return url.href; }

export function createChatgptAuth(settings, { request, vault: suppliedVault } = {}) {
  let vault; const disk = () => suppliedVault || (vault ||= createAiVault(settings));
  let pending = null; let serial = 0; let loginState = 'idle'; let message = '';
  async function discovery() {
    const value = await request(`${ISSUER}/.well-known/openid-configuration`);
    if (value.issuer !== ISSUER) throw new AiError('configuration', 'Die Identität des Anmeldedienstes stimmt nicht.', 503);
    return { jwks: endpoint(value.jwks_uri), revoke: value.revocation_endpoint ? endpoint(value.revocation_endpoint) : null };
  }
  async function verify(value, clientId, nonce, expected) {
    if (typeof value !== 'string' || value.length > 20000) throw new AiError('signin', 'Die Anmeldung enthält keinen gültigen Identitätsnachweis.', 400);
    const decoded = jwt.decode(value, { complete: true });
    if (!decoded || !['RS256', 'ES256'].includes(decoded.header.alg) || typeof decoded.header.kid !== 'string') throw new AiError('signin', 'Der Identitätsnachweis ist nicht freigegeben.', 400);
    const info = await discovery(); const set = await request(info.jwks);
    const key = Array.isArray(set.keys) && set.keys.slice(0, 30).find(item => item.kid === decoded.header.kid && (!item.use || item.use === 'sig') && (!item.alg || item.alg === decoded.header.alg));
    try {
      if (!key) throw Error('key');
      const payload = jwt.verify(value, createPublicKey({ key, format: 'jwk' }), { algorithms: [decoded.header.alg], issuer: ISSUER, audience: clientId, clockTolerance: 20 });
      if (typeof payload.sub !== 'string' || !payload.sub || !Number.isFinite(payload.exp) || (Number.isFinite(payload.iat) && payload.iat > Date.now() / 1000 + 20) || (Array.isArray(payload.aud) && payload.aud.length > 1 && payload.azp !== clientId) || (nonce && !equal(payload.nonce, nonce)) || (expected && payload.sub !== expected)) throw Error('identity');
      return { subject: payload.sub, email: typeof payload.email === 'string' ? payload.email.slice(0, 180) : '' };
    } catch { throw new AiError('signin', 'Die ChatGPT-Identität konnte nicht sicher bestätigt werden. Bitte neu anmelden.', 400); }
  }
  async function tokens(body, account, nonce) {
    const value = await request(`${ISSUER}/api/accounts/oauth/token`, { body, form: true });
    for (const field of ['access_token', 'refresh_token', 'id_token']) if (value[field] !== undefined && (typeof value[field] !== 'string' || value[field].length > 20000 || !value[field])) throw new AiError('signin', 'Die Zugangsdaten haben ein unerwartetes Format.', 502);
    if (!value.access_token || !/^bearer$/i.test(value.token_type || '') || !Number.isFinite(value.expires_in) || value.expires_in <= 0 || value.expires_in > 86400) throw new AiError('signin', 'Die Anmeldung hat keine gültigen Zugangsdaten geliefert.', 502);
    const identity = value.id_token ? await verify(value.id_token, account.clientId, nonce, account.subject) : nonce ? null : { subject: account.subject, email: account.email };
    if (!identity) throw new AiError('signin', 'Der Identitätsnachweis fehlt.', 502);
    const granted = typeof value.scope === 'string' ? value.scope.split(/\s+/).filter(Boolean) : nonce ? [] : account.scopes || [];
    return { ...account, ...identity, accessToken: value.access_token, refreshToken: value.refresh_token || account.refreshToken || '', idToken: value.id_token || account.idToken || '', expiresAt: Date.now() + value.expires_in * 1000, scopes: granted };
  }
  function stopPending() { if (pending) { clearTimeout(pending.timer); pending.server.close(); pending = null; } }
  async function status() {
    const data = await disk().load(); const current = data.accounts.find(a => a.id === data.activeId);
    return { connected: Boolean(current?.accessToken), planEnabled: Boolean(current?.accessToken && hasPlan(current)), activeId: data.activeId, accounts: data.accounts.map((a, n) => ({ id: a.id, label: `${a.label || `ChatGPT-Konto ${n + 1}`}${a.email ? ` · ${a.email}` : ''}`, connected: Boolean(a.accessToken) })), loginState, message, revision: `${serial}:${data.epoch || ''}` };
  }
  async function start(accountId) {
    stopPending(); const version = ++serial; loginState = 'pending'; message = '';
    let server;
    const stillCurrent = () => { if (version !== serial) throw new AiError('changed', 'Die Anmeldung wurde inzwischen abgebrochen.', 409); };
    try {
      const data = await disk().locked(async () => { const value = await disk().load(); value.epoch ||= randomUUID(); await disk().save(value); return value; });
      stillCurrent();
      const account = accountId ? data.accounts.find(a => a.id === accountId) : null;
      if (accountId && !account) throw new AiError('input', 'Dieses gespeicherte Konto ist nicht vorhanden.');
      if (!account && data.accounts.length >= 8) throw new AiError('accounts', 'Es können höchstens acht Kontoverbindungen gespeichert werden.');
      const state = secret(), nonce = secret(), verifier = secret();
      server = http.createServer();
      await new Promise((resolve, reject) => { server.once('error', () => reject(new AiError('signin', 'Der lokale Anmelderückweg konnte nicht gestartet werden.', 503))); server.listen({ host: '127.0.0.1', port: 0, exclusive: true }, resolve); });
      stillCurrent();
      const redirect = `http://127.0.0.1:${server.address().port}/auth/callback`;
      const timer = setTimeout(() => { if (version === serial) { stopPending(); loginState = 'expired'; message = 'Die Anmeldung ist abgelaufen. Bitte erneut starten.'; } }, 5 * 60 * 1000); timer.unref();
      pending = { server, timer };
      server.on('request', async (req, res) => {
        res.setHeader('Cache-Control', 'no-store'); res.setHeader('Referrer-Policy', 'no-referrer'); res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'"); res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        let query;
        try {
          const url = new URL(req.url, redirect);
          if (req.method !== 'GET' || url.origin !== new URL(redirect).origin || url.pathname !== '/auth/callback' || req.headers.host !== new URL(redirect).host || ['state', 'code', 'client_id', 'error'].some(key => url.searchParams.getAll(key).length > 1) || !equal(url.searchParams.get('state'), state) || version !== serial || !pending) throw Error('state');
          query = url.searchParams;
        } catch { res.statusCode = 400; res.end('Dieser Anmelderückweg ist ungültig.'); return; }
        stopPending();
        try {
          if (query.has('error')) throw new AiError('signin_cancelled', 'Die Anmeldung wurde nicht freigegeben.');
          const code = query.get('code'), clientId = query.get('client_id') || account?.clientId;
          if (!code || code.length > 4096 || !clientValid(clientId) || (account && clientId !== account.clientId)) throw new AiError('signin', 'Die Anmelderegistrierung ist unvollständig.');
          const connected = await tokens({ grant_type: 'authorization_code', client_id: clientId, code, code_verifier: verifier, redirect_uri: redirect, resource: RESOURCE }, account || { id: randomUUID(), clientId, label: `ChatGPT-Konto ${data.accounts.length + 1}` }, nonce);
          if (version !== serial) throw new AiError('changed', 'Die Anmeldung wurde inzwischen verworfen.');
          await disk().locked(async () => { const fresh = await disk().load(); if (version !== serial || fresh.epoch !== data.epoch) throw new AiError('changed', 'Konto oder Anmeldung wurde inzwischen geändert.'); await disk().save({ ...fresh, epoch: randomUUID(), activeId: connected.id, accounts: [...fresh.accounts.filter(a => a.id !== connected.id), connected] }); });
          loginState = 'complete'; message = hasPlan(connected) ? 'ChatGPT wurde verbunden.' : 'Das Konto ist angemeldet, die Nutzung des ChatGPT-Abos wurde aber nicht freigegeben.';
          res.end('Anmeldung abgeschlossen. Du kannst dieses Fenster schließen und zu AzubiPrep zurückkehren.');
        } catch (e) { if (version === serial) { loginState = 'error'; message = e instanceof AiError ? e.message : 'Die Anmeldung ist fehlgeschlagen. Bitte erneut versuchen.'; } res.statusCode = 400; res.end('Die Anmeldung konnte nicht abgeschlossen werden. Prüfe die Rückmeldung in AzubiPrep.'); }
      });
      const authorize = new URL(`${ISSUER}/api/accounts/authorize`);
      const values = { client_id: account?.clientId || 'dynamic_agent_client', ext_agent_host_id: data.hostId, response_type: 'code', redirect_uri: redirect, scope: scopes, resource: RESOURCE, state, nonce, code_challenge_method: 'S256', code_challenge: createHash('sha256').update(verifier).digest('base64url'), ...(!account ? { agent_name_hint: 'AzubiPrep' } : {}) };
      // Keine ID-/Access-/Refresh-Tokens im Browser oder in URLs.
      for (const [key, value] of Object.entries(values)) authorize.searchParams.set(key, value);
      return { authorizeUrl: authorize.href };
    } catch (e) { if (server?.listening) server.close(); if (version === serial) { stopPending(); loginState = 'error'; message = 'Die Anmeldung konnte nicht gestartet werden.'; } throw e; }
  }
  async function session() {
    return disk().locked(async () => {
      const data = await disk().load(); let account = data.accounts.find(a => a.id === data.activeId);
      if (!account?.accessToken || !hasPlan(account)) throw new AiError('signin_required', 'Bitte mit ChatGPT anmelden und die Nutzung des Abos freigeben.', 401);
      if (account.expiresAt < Date.now() + 60000) {
        if (!account.refreshToken) throw new AiError('signin_required', 'Die Anmeldung ist abgelaufen. Bitte erneut mit ChatGPT anmelden.', 401);
        const previous = account;
        account = await tokens({ grant_type: 'refresh_token', client_id: account.clientId, refresh_token: account.refreshToken, resource: RESOURCE }, account);
        await disk().save({ ...data, accounts: data.accounts.map(a => a.id === previous.id ? account : a) });
        if (!hasPlan(account)) throw new AiError('plan_unavailable', 'Das ChatGPT-Abo ist für diese Anwendung nicht freigegeben.', 403);
      }
      return { token: account.accessToken, accountId: account.id, epoch: data.epoch };
    });
  }
  async function assertSession(value) { const data = await disk().load(); if (data.activeId !== value.accountId || data.epoch !== value.epoch || !data.accounts.some(a => a.id === value.accountId && a.accessToken && hasPlan(a))) throw new AiError('changed', 'Das ChatGPT-Konto hat sich geändert. Bitte erneut anfragen.', 409); }
  return { status, start, session, assertSession, access: async () => (await session()).token, revision: () => serial,
    cancel() { serial++; stopPending(); loginState = 'idle'; message = ''; return { cancelled: true }; },
    async select(id) { serial++; stopPending(); await disk().locked(async () => { const data = await disk().load(); if (!data.accounts.some(a => a.id === id)) throw new AiError('input', 'Unbekanntes ChatGPT-Konto.'); await disk().save({ ...data, epoch: randomUUID(), activeId: id }); }); return status(); },
    async signout() {
      serial++; stopPending(); let revoked = true;
      await disk().locked(async () => {
        const data = await disk().load(); const account = data.accounts.find(a => a.id === data.activeId);
        if (account?.refreshToken) { revoked = false; for (let n = 0; n < 2 && !revoked; n++) { try { const info = await discovery(); if (info.revoke) { await request(info.revoke, { form: true, body: { token: account.refreshToken, token_type_hint: 'refresh_token', client_id: account.clientId } }); revoked = true; } } catch { if (n === 0) await new Promise(resolve => setTimeout(resolve, 250)); } } }
        await disk().save({ ...data, epoch: randomUUID(), accounts: data.accounts.map(a => a.id === data.activeId ? { id: a.id, label: a.label, clientId: a.clientId, subject: a.subject, email: a.email, scopes: [] } : a) });
      });
      loginState = 'idle'; message = ''; return { signedOut: true, revoked, message: revoked ? 'Lokal abgemeldet.' : 'Lokal abgemeldet. Der Widerruf bei OpenAI konnte nicht bestätigt werden. Trenne die Anwendung zusätzlich in deinen ChatGPT-Einstellungen.' };
    },
  };
}
