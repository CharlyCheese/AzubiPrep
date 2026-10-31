import { afterEach, describe, expect, it } from 'vitest';
import { createHash, generateKeyPairSync } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { createChatgptAuth } from '../src/chatgpt-auth.js';

const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const issuer = 'https://auth.openai.com'; const clientId = 'oaiapp_synthetic';
const plan = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const services = [];
afterEach(() => services.splice(0).forEach(auth => auth.cancel()));
function fixture() {
  let data = { schema: 1, hostId: 'urn:uuid:11111111-1111-4111-8111-111111111111', accounts: [], activeId: null };
  let chain = Promise.resolve(); let nonce; let transform = x => x; let transformToken = x => x; let granted = plan; const calls = [];
  const vault = { load: async () => structuredClone(data), save: async value => { data = structuredClone(value); }, locked: run => { const promise = chain.then(run); chain = promise.catch(() => {}); return promise; } };
  const request = async (url, options = {}) => {
    calls.push({ url, ...options });
    if (url.endsWith('openid-configuration')) return { issuer, jwks_uri: `${issuer}/jwks`, revocation_endpoint: `${issuer}/revoke` };
    if (url.endsWith('/jwks')) return { keys: [{ ...publicKey.export({ format: 'jwk' }), kid: 'synthetic', alg: 'RS256', use: 'sig' }] };
    if (url.endsWith('/revoke')) return {};
    if (url.endsWith('/token')) {
      const claims = transform({ iss: issuer, aud: options.body.client_id, sub: 'synthetic-subject', email: 'learner@example.invalid', nonce, exp: Math.floor(Date.now() / 1000) + 3600 });
      return { access_token: 'synthetic-access', refresh_token: 'synthetic-refresh', id_token: transformToken(jwt.sign(claims, privateKey, { algorithm: 'RS256', keyid: 'synthetic' })), token_type: 'Bearer', expires_in: 3600, scope: granted };
    }
    throw Error('Unbekannter synthetischer Endpunkt');
  };
  const auth = createChatgptAuth({}, { vault, request }); services.push(auth);
  return { auth, vault, calls, get: () => data, transform: fn => { transform = fn; }, token: fn => { transformToken = fn; }, scopes: value => { granted = value; },
    async begin(id) { const value = await auth.start(id); const url = new URL(value.authorizeUrl); nonce = url.searchParams.get('nonce'); return url; },
    async callback(url, change = {}) { const target = new URL(url.searchParams.get('redirect_uri')); target.search = new URLSearchParams({ state: url.searchParams.get('state'), code: 'synthetic-code', client_id: clientId, ...change }).toString(); return fetch(target); },
  };
}
describe('ChatGPT-Abo OAuth ohne echte Anmeldung', () => {
  it('verlangt in einem unabhängigen Profil eigene Anmeldung statt eine bestehende Verbindung zu verwenden', async () => {
    const existing = fixture(); await existing.callback(await existing.begin()); expect((await existing.auth.status()).connected).toBe(true);
    const fresh = fixture(); expect((await fresh.auth.status()).connected).toBe(false);
    await expect(fresh.auth.session()).rejects.toMatchObject({ code: 'signin_required' }); expect(fresh.calls).toEqual([]);
    const start = await fresh.begin(); expect(start.searchParams.get('client_id')).toBe('dynamic_agent_client'); expect((await existing.auth.status()).connected).toBe(true);
  });
  it('bindet State, Nonce, PKCE, ausgegebene Client-ID und getrennte Kontoregistrierung', async () => {
    const f = fixture(); const url = await f.begin();
    expect(url.searchParams.get('client_id')).toBe('dynamic_agent_client'); expect(url.searchParams.get('agent_name_hint')).toBe('AzubiPrep');
    expect((await f.callback(url, { state: 'wrong' })).status).toBe(400); expect(f.calls).toEqual([]);
    expect((await f.callback(url)).status).toBe(200);
    const exchange = f.calls.find(call => call.url.endsWith('/token')).body;
    expect(exchange.client_id).toBe(clientId); expect(exchange.redirect_uri).toBe(url.searchParams.get('redirect_uri'));
    expect(createHash('sha256').update(exchange.code_verifier).digest('base64url')).toBe(url.searchParams.get('code_challenge'));
    const status = await f.auth.status(); expect(status.connected).toBe(true); expect(status.planEnabled).toBe(true);
    expect(JSON.stringify(status)).not.toContain('synthetic-access'); expect(JSON.stringify(status)).not.toContain('synthetic-refresh');
    const returning = await f.begin(status.activeId); expect(returning.searchParams.get('client_id')).toBe(clientId); expect(returning.searchParams.has('id_token_hint')).toBe(false); expect(returning.searchParams.get('ext_agent_host_id')).toBe(url.searchParams.get('ext_agent_host_id'));
  });
  it.each(['nonce', 'aud', 'iss', 'exp', 'sub'])('weist ungültige JWT-Bindung %s zurück', async field => {
    const f = fixture(); f.transform(claims => ({ ...claims, [field]: field === 'exp' ? 1 : field === 'sub' ? '' : 'incorrect' }));
    expect((await f.callback(await f.begin())).status).toBe(400); expect((await f.auth.status()).connected).toBe(false);
  });
  it('nutzt nur vom Tokenendpunkt gewährte Scopes, nicht die Callbackbehauptung', async () => {
    const f = fixture(); f.scopes('openid profile'); expect((await f.callback(await f.begin(), { scope: plan })).status).toBe(200);
    expect((await f.auth.status()).planEnabled).toBe(false); await expect(f.auth.access()).rejects.toMatchObject({ code: 'signin_required' });
  });
  it('weist manipulierte Signatur und fremden Schlüssel sowie geänderte Rückkehridentität ab', async () => {
    const f = fixture(); f.token(token => { const parts = token.split('.'); parts[2] = (parts[2][0] === 'a' ? 'b' : 'a') + parts[2].slice(1); return parts.join('.'); }); expect((await f.callback(await f.begin())).status).toBe(400);
    f.token(() => jwt.sign({ iss: issuer, aud: clientId, sub: 'synthetic' }, privateKey, { algorithm: 'RS256', keyid: 'unknown-key' })); expect((await f.callback(await f.begin())).status).toBe(400);
    f.token(x => x); await f.callback(await f.begin()); const id = f.get().activeId;
    f.transform(claims => ({ ...claims, sub: 'different-subject' })); expect((await f.callback(await f.begin(id))).status).toBe(400); expect(f.get().accounts.find(a => a.id === id).subject).toBe('synthetic-subject');
  });
  it('verwirft einen während des langsamen Starts abgebrochenen Versuch', async () => {
    const f = fixture(); let release; const gate = new Promise(resolve => { release = resolve; });
    const load = f.vault.load; f.vault.load = async () => { await gate; return load(); };
    const attempt = f.auth.start(); f.auth.cancel(); release(); await expect(attempt).rejects.toMatchObject({ code: 'changed' }); expect((await f.auth.status()).loginState).toBe('idle');
  });
  it('bindet Sitzung auch über getrennte Serviceinstanzen an den gespeicherten Kontostand', async () => {
    const f = fixture(); await f.callback(await f.begin()); const snapshot = await f.auth.session();
    const other = createChatgptAuth({}, { vault: f.vault, request: async () => { throw Error('synthetic offline'); } }); services.push(other);
    await other.select(f.get().activeId); await expect(f.auth.assertSession(snapshot)).rejects.toMatchObject({ code: 'changed' });
    const login = await f.begin(f.get().activeId); await other.select(f.get().activeId);
    expect((await f.callback(login)).status).toBe(400);
  });
  it('serialisiert Refresh und verwirft lokale Tokens bei Abmeldung', async () => {
    const f = fixture(); await f.callback(await f.begin()); f.get().accounts[0].expiresAt = 1; f.calls.length = 0;
    await Promise.all([f.auth.access(), f.auth.access()]); expect(f.calls.filter(c => c.body?.grant_type === 'refresh_token')).toHaveLength(1);
    const before = f.get().accounts[0].clientId; const out = await f.auth.signout(); expect(out.revoked).toBe(true);
    expect(f.get().accounts[0].clientId).toBe(before); expect(f.get().accounts[0].accessToken).toBeUndefined(); expect((await f.auth.status()).connected).toBe(false);
  });
});
