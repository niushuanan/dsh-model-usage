/**
 * Provider quota data layer (node half): resolves API keys from the local
 * environment and well-known config files — read-only, never mutating — and
 * queries each vendor's usage endpoint. Four channel shapes exist:
 *
 * - DeepSeek: official balance API, real money (CNY/USD).
 * - Kimi: two key families. `sk-kimi-*` keys belong to the Kimi Code platform
 *   (`api.kimi.com`) and answer with quota windows; ordinary `sk-*` keys from
 *   the Moonshot open platform answer with real money.
 * - Z.ai / GLM: the console monitor endpoint, quota only (no money).
 * - Codex: the installed Codex app-server, using the account already signed in
 *   on this Mac. No OpenAI token or account identifier enters the snapshot.
 *
 * All endpoints here were verified live against real accounts.
 */
import { spawn } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';
const REQUEST_TIMEOUT_MS = 12_000;
const CODEX_RPC_TIMEOUT_MS = 15_000;
/** Ambient env read: the checkout narrows ProcessEnv, so read through a record. */
function envValue(name) {
    const value = process.env[name];
    return value !== undefined && value.length > 0 ? value : undefined;
}
/* ------------------------------------------------------------------ */
/* Key resolution (read-only)                                          */
/* ------------------------------------------------------------------ */
async function readJson(path) {
    try {
        return JSON.parse(await readFile(path, 'utf8'));
    }
    catch {
        return undefined;
    }
}
function providerEntry(source, name) {
    const providers = source?.providers;
    if (providers === null || typeof providers !== 'object')
        return undefined;
    const entry = providers[name];
    return entry !== null && typeof entry === 'object' ? entry : undefined;
}
function stringField(source, key) {
    const value = source?.[key];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}
/**
 * DeepSeek: the multi-gateway account is the user's selected balance account.
 * When it exists, do not silently replace it with an environment or DSH key
 * belonging to a different account. Older locations remain migration fallbacks.
 */
async function resolveDeepSeekKeys() {
    const gateway = await readJson(join(homedir(), '.claude', 'multi-gateway', 'config.json'));
    const selected = stringField(providerEntry(gateway, 'deepseek'), 'api_key');
    if (selected !== undefined)
        return [selected];
    const keys = [];
    const add = (key) => {
        if (key !== undefined && !keys.includes(key))
            keys.push(key);
    };
    const envKey = envValue('DEEPSEEK_API_KEY');
    add(envKey);
    try {
        const env = await readFile(join(homedir(), '.dsh', '.env'), 'utf8');
        const match = env.match(/^DEEPSEEK_API_KEY=(\S+)\s*$/m);
        add(match?.[1]);
    }
    catch { /* file absent */ }
    return keys;
}
/** Kimi: env → ~/.claude/multi-gateway/config.json. */
async function resolveKimiKey() {
    const envKey = envValue('KIMI_API_KEY') ?? envValue('MOONSHOT_API_KEY');
    if (envKey !== undefined)
        return envKey;
    const gateway = await readJson(join(homedir(), '.claude', 'multi-gateway', 'config.json'));
    return stringField(providerEntry(gateway, 'kimi'), 'api_key');
}
/**
 * Z.ai: env → ~/.zcode/v2/config.json provider table. A z.ai API key is a
 * plain hex-ish string; entries whose apiKey looks like a JWT (`eyJ…`) are
 * OAuth session tokens for the zcode proxy plan, not API keys, and skipped.
 */
async function resolveZaiKey() {
    const envKey = envValue('ZAI_API_KEY');
    if (envKey !== undefined)
        return { key: envKey, base: 'api.z.ai' };
    const zcode = await readJson(join(homedir(), '.zcode', 'v2', 'config.json'));
    const providers = zcode?.provider;
    if (providers === null || typeof providers !== 'object')
        return undefined;
    let fallback;
    for (const entry of Object.values(providers)) {
        if (entry === null || typeof entry !== 'object')
            continue;
        const options = entry.options;
        if (options === null || typeof options !== 'object')
            continue;
        const apiKey = stringField(options, 'apiKey');
        const baseURL = stringField(options, 'baseURL') ?? '';
        if (apiKey === undefined || apiKey.startsWith('eyJ'))
            continue;
        const name = stringField(entry, 'name') ?? '';
        if (baseURL.includes('api.z.ai')) {
            const hit = { key: apiKey, base: 'api.z.ai' };
            if (name === 'Z.ai - API Key')
                return hit;
            fallback ??= hit;
        }
        else if (baseURL.includes('bigmodel.cn')) {
            fallback ??= { key: apiKey, base: 'open.bigmodel.cn' };
        }
    }
    return fallback;
}
/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */
async function getJson(url, key) {
    const controller = new AbortController();
    const timer = setTimeout(() => { controller.abort(); }, REQUEST_TIMEOUT_MS);
    try {
        const resp = await fetch(url, {
            headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
            signal: controller.signal,
        });
        const text = await resp.text();
        let body;
        try {
            body = JSON.parse(text);
        }
        catch {
            body = text.slice(0, 200);
        }
        if (!resp.ok) {
            const detail = typeof body === 'string' ? body : JSON.stringify(body).slice(0, 200);
            throw new Error(`HTTP ${resp.status}: ${detail}`);
        }
        if (body === null || typeof body !== 'object')
            throw new Error('unexpected response body');
        return body;
    }
    finally {
        clearTimeout(timer);
    }
}
function num(value) {
    const n = typeof value === 'string' ? Number(value) : value;
    return typeof n === 'number' && Number.isFinite(n) ? n : undefined;
}
function isoFromEpochMs(value) {
    const n = num(value);
    return n === undefined ? undefined : new Date(n).toISOString();
}
function isoFromEpochSeconds(value) {
    const n = num(value);
    return n === undefined ? undefined : new Date(n * 1_000).toISOString();
}
/* ------------------------------------------------------------------ */
/* Provider queries                                                    */
/* ------------------------------------------------------------------ */
async function queryDeepSeek(key) {
    const data = await getJson('https://api.deepseek.com/user/balance', key);
    const infos = data.balance_infos;
    const info = Array.isArray(infos) && infos.length > 0 ? infos[0] : undefined;
    if (info === undefined)
        throw new Error('no balance_infos in response');
    return {
        id: 'deepseek',
        name: 'DeepSeek',
        kind: 'money',
        status: 'ok',
        money: {
            currency: stringField(info, 'currency') ?? 'CNY',
            total: num(info.total_balance) ?? 0,
            toppedUp: num(info.topped_up_balance),
            granted: num(info.granted_balance),
        },
    };
}
async function queryKimiCode(key) {
    const [usage, me] = await Promise.all([
        getJson('https://api.kimi.com/coding/v1/usages', key),
        // The nickname ride-along is best-effort; the quota payload stands alone.
        getJson('https://api.kimi.com/coding/v1/me', key).catch(() => undefined),
    ]);
    const quotas = [];
    const weekly = usage.usage;
    if (weekly !== null && typeof weekly === 'object') {
        const w = weekly;
        quotas.push({ key: 'weekly', used: num(w.used), limit: num(w.limit), resetAt: stringField(w, 'resetTime') });
    }
    const limits = usage.limits;
    const rolling = Array.isArray(limits) && limits.length > 0 ? limits[0] : undefined;
    const detail = (rolling?.detail ?? rolling);
    if (detail !== undefined) {
        quotas.push({
            key: 'rolling-5h',
            used: kimiQuotaUsed(detail),
            limit: num(detail.limit),
            resetAt: stringField(detail, 'resetTime'),
        });
    }
    const wallet = usage.boosterWallet;
    const moneyOf = (node) => {
        if (node === null || typeof node !== 'object')
            return {};
        const n = node;
        return { cents: num(n.priceInCents), currency: stringField(n, 'currency') };
    };
    const monthlyUsed = moneyOf(wallet?.monthlyUsed);
    const monthlyLimit = moneyOf(wallet?.monthlyChargeLimit);
    const parallel = num(usage.parallel?.limit);
    const user = usage.user;
    const membership = user?.membership;
    const plan = (me !== undefined ? stringField(me, 'user_level_name') : undefined) ?? stringField(membership, 'level');
    return {
        id: 'kimi',
        name: 'Kimi Code',
        kind: 'quota',
        status: 'ok',
        plan,
        account: me !== undefined ? stringField(me, 'nickname') : undefined,
        quotas,
        booster: wallet === undefined ? undefined : {
            enabled: stringField(wallet, 'status') !== 'STATUS_DISABLED',
            monthlyUsedCents: monthlyUsed.cents,
            monthlyLimitCents: monthlyLimit.cents,
            currency: monthlyUsed.currency ?? monthlyLimit.currency,
        },
        parallel,
    };
}
async function queryMoonshot(key) {
    const data = await getJson('https://api.moonshot.cn/v1/users/me/balance', key);
    const d = data.data;
    if (d === undefined)
        throw new Error('no data in response');
    return {
        id: 'kimi',
        name: 'Moonshot (Kimi)',
        kind: 'money',
        status: 'ok',
        money: {
            currency: 'CNY',
            total: num(d.available_balance) ?? 0,
            toppedUp: num(d.cash_balance),
            granted: num(d.voucher_balance),
        },
    };
}
async function queryKimi(key) {
    // `sk-kimi-*` keys live on the Kimi Code platform; plain `sk-*` keys are
    // Moonshot open-platform keys with a money balance endpoint.
    return key.startsWith('sk-kimi-') ? queryKimiCode(key) : queryMoonshot(key);
}
async function queryZai(key, base) {
    const data = await getJson(`https://${base}/api/monitor/usage/quota/limit`, key);
    // This endpoint answers HTTP 200 with {"code":401} for a bad key.
    if (num(data.code) !== 200)
        throw new Error(stringField(data, 'msg') ?? `code ${String(data.code)}`);
    const payload = data.data;
    const limits = Array.isArray(payload?.limits) ? payload.limits : [];
    const quotas = [];
    for (const item of limits) {
        if (stringField(item, 'type') === 'TIME_LIMIT') {
            // Monthly tool quota (search-prime / web-reader / zread calls).
            quotas.push({
                key: 'mcp-monthly',
                used: num(item.currentValue),
                limit: num(item.usage),
                resetAt: isoFromEpochMs(item.nextResetTime),
            });
        }
        else {
            // Token windows. Unit semantics are reverse-engineered from the reset
            // cadence: 3 rolls within hours, 6 resets on a weekly cadence.
            const unit = num(item.unit);
            const key_ = unit === 3 ? 'tokens-5h' : unit === 6 ? 'tokens-weekly' : `tokens-${String(unit ?? 'x')}`;
            quotas.push({ key: key_, percentUsed: num(item.percentage), resetAt: isoFromEpochMs(item.nextResetTime) });
        }
    }
    return {
        id: 'zai',
        name: 'GLM',
        kind: 'quota',
        status: 'ok',
        plan: payload !== undefined ? stringField(payload, 'level') : undefined,
        quotas,
    };
}
/** Kimi reports `remaining` instead of `used` immediately after some resets. */
export function kimiQuotaUsed(detail) {
    const used = num(detail.used);
    if (used !== undefined)
        return used;
    const limit = num(detail.limit);
    const remaining = num(detail.remaining);
    return limit === undefined || remaining === undefined ? undefined : Math.max(0, limit - remaining);
}
/**
 * GPT exposes only the account's weekly subscription window in this product.
 * Model-specific rolling buckets are intentionally not merged into it.
 */
export function codexQuotaRows(snapshot) {
    if (snapshot === undefined)
        return [];
    for (const window of [snapshot.primary, snapshot.secondary]) {
        if (window === null || window === undefined || window.windowDurationMins !== 10_080)
            continue;
        return [{
                key: 'weekly',
                percentUsed: num(window.usedPercent),
                resetAt: isoFromEpochSeconds(window.resetsAt),
            }];
    }
    return [];
}
async function resolveCodexBinary() {
    const configured = envValue('CODEX_BINARY');
    const candidates = [
        configured,
        '/Applications/ChatGPT.app/Contents/Resources/codex',
        join(homedir(), 'Applications', 'ChatGPT.app', 'Contents', 'Resources', 'codex'),
    ].filter((candidate) => candidate !== undefined);
    for (const candidate of candidates) {
        try {
            await access(candidate);
            return candidate;
        }
        catch { /* try the next installed location */ }
    }
    return 'codex';
}
/** Create a JSON-lines writer whose stream failures stay inside the owning provider query. */
export function createJsonLineWriter(stream, onError) {
    let failed = false;
    const fail = (error) => {
        if (failed)
            return;
        failed = true;
        onError(error);
    };
    stream.on('error', fail);
    return (payload) => {
        if (stream.destroyed || stream.writableEnded) {
            fail(new Error('Codex app-server input closed before the request completed'));
            return;
        }
        stream.write(`${JSON.stringify(payload)}\n`, (error) => {
            if (error !== null && error !== undefined)
                fail(error);
        });
    };
}
/** Read the signed-in desktop account through Codex's official local app-server. */
async function queryCodex() {
    const binary = await resolveCodexBinary();
    return await new Promise((resolve, reject) => {
        const child = spawn(binary, ['app-server', '--stdio'], { stdio: ['pipe', 'pipe', 'pipe'] });
        let settled = false;
        let buffer = '';
        let accountResult;
        let limitsResult;
        let accountSeen = false;
        let limitsSeen = false;
        let stderr = '';
        const stop = () => {
            clearTimeout(timer);
            child.kill('SIGTERM');
        };
        const finish = (fn) => {
            if (settled)
                return;
            settled = true;
            stop();
            fn();
        };
        const send = createJsonLineWriter(child.stdin, (error) => {
            finish(() => { reject(error); });
        });
        const maybeResolve = () => {
            if (!accountSeen || !limitsSeen)
                return;
            const account = accountResult?.account;
            if (account === null || account === undefined || stringField(account, 'type') !== 'chatgpt') {
                finish(() => { resolve({ id: 'codex', name: 'GPT', kind: 'quota', status: 'no-key' }); });
                return;
            }
            const byId = limitsResult?.rateLimitsByLimitId;
            const byIdRecord = byId !== null && typeof byId === 'object'
                ? byId
                : undefined;
            const codex = byIdRecord?.codex;
            const raw = codex !== null && typeof codex === 'object'
                ? codex
                : limitsResult?.rateLimits;
            const snapshot = raw === undefined ? undefined : {
                planType: stringField(raw, 'planType'),
                primary: raw.primary,
                secondary: raw.secondary,
            };
            finish(() => {
                resolve({
                    id: 'codex',
                    name: 'GPT',
                    kind: 'quota',
                    status: 'ok',
                    plan: snapshot?.planType ?? stringField(account, 'planType'),
                    quotas: codexQuotaRows(snapshot),
                });
            });
        };
        const timer = setTimeout(() => {
            finish(() => { reject(new Error('Codex account query timed out')); });
        }, CODEX_RPC_TIMEOUT_MS);
        child.once('error', (error) => {
            finish(() => {
                const code = error.code;
                if (code === 'ENOENT')
                    resolve({ id: 'codex', name: 'GPT', kind: 'quota', status: 'no-key' });
                else
                    reject(error);
            });
        });
        child.stderr.setEncoding('utf8');
        child.stderr.on('data', (chunk) => { stderr = `${stderr}${chunk}`.slice(-400); });
        child.stdout.setEncoding('utf8');
        child.stdout.on('data', (chunk) => {
            buffer += chunk;
            let newline = buffer.indexOf('\n');
            while (newline >= 0) {
                const line = buffer.slice(0, newline).trim();
                buffer = buffer.slice(newline + 1);
                newline = buffer.indexOf('\n');
                if (line.length === 0)
                    continue;
                let response;
                try {
                    response = JSON.parse(line);
                }
                catch {
                    continue;
                }
                if (response.error !== undefined) {
                    finish(() => { reject(new Error(response.error?.message ?? 'Codex app-server request failed')); });
                    return;
                }
                if (response.id === 0) {
                    send({ method: 'initialized', params: {} });
                    send({ id: 1, method: 'account/read', params: { refreshToken: false } });
                    send({ id: 2, method: 'account/rateLimits/read', params: {} });
                }
                else if (response.id === 1) {
                    accountSeen = true;
                    accountResult = response.result;
                    maybeResolve();
                }
                else if (response.id === 2) {
                    limitsSeen = true;
                    limitsResult = response.result;
                    maybeResolve();
                }
            }
        });
        child.once('close', (code) => {
            if (settled)
                return;
            finish(() => {
                reject(new Error(`Codex app-server exited (${String(code)}): ${stderr.trim() || 'no response'}`));
            });
        });
        send({
            id: 0,
            method: 'initialize',
            params: { clientInfo: { name: 'deepseek-harness-provider-quota', version: '0.1.0' }, capabilities: {} },
        });
    });
}
/* ------------------------------------------------------------------ */
/* Aggregation                                                         */
/* ------------------------------------------------------------------ */
function message(error) {
    return error instanceof Error ? error.message : String(error);
}
async function runProvider(id, name, kind, query) {
    try {
        return await query();
    }
    catch (error) {
        return { id, name, kind, status: 'error', error: message(error) };
    }
}
/** Query every configured provider; each resolves its own key and fails soft. */
export async function collectUsage() {
    const providers = await Promise.all([
        runProvider('deepseek', 'DeepSeek', 'money', async () => {
            const keys = await resolveDeepSeekKeys();
            if (keys.length === 0)
                return { id: 'deepseek', name: 'DeepSeek', kind: 'money', status: 'no-key' };
            let lastError;
            for (const key of keys) {
                try {
                    return await queryDeepSeek(key);
                }
                catch (error) {
                    lastError = error;
                }
            }
            throw lastError;
        }),
        runProvider('kimi', 'Kimi Code', 'quota', async () => {
            const key = await resolveKimiKey();
            if (key === undefined)
                return { id: 'kimi', name: 'Kimi Code', kind: 'quota', status: 'no-key' };
            return queryKimi(key);
        }),
        runProvider('zai', 'GLM', 'quota', async () => {
            const resolved = await resolveZaiKey();
            if (resolved === undefined)
                return { id: 'zai', name: 'GLM', kind: 'quota', status: 'no-key' };
            return queryZai(resolved.key, resolved.base);
        }),
        runProvider('codex', 'GPT', 'quota', queryCodex),
    ]);
    return { updatedAt: Date.now(), providers };
}
//# sourceMappingURL=quota.js.map