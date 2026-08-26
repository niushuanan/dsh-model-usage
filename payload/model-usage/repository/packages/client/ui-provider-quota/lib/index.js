import { access, readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
//#region lib/types/quota.js
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
const REQUEST_TIMEOUT_MS = 12e3;
const CODEX_RPC_TIMEOUT_MS = 15e3;
/** Ambient env read: the checkout narrows ProcessEnv, so read through a record. */
function envValue(name) {
	const value = process.env[name];
	return value !== void 0 && value.length > 0 ? value : void 0;
}
async function readJson(path) {
	try {
		return JSON.parse(await readFile(path, "utf8"));
	} catch {
		return;
	}
}
function providerEntry(source, name) {
	const providers = source?.providers;
	if (providers === null || typeof providers !== "object") return void 0;
	const entry = providers[name];
	return entry !== null && typeof entry === "object" ? entry : void 0;
}
function stringField(source, key) {
	const value = source?.[key];
	return typeof value === "string" && value.length > 0 ? value : void 0;
}
/**
* DeepSeek: the multi-gateway account is the user's selected balance account.
* When it exists, do not silently replace it with an environment or DSH key
* belonging to a different account. Older locations remain migration fallbacks.
*/
async function resolveDeepSeekKeys() {
	const selected = stringField(providerEntry(await readJson(join(homedir(), ".claude", "multi-gateway", "config.json")), "deepseek"), "api_key");
	if (selected !== void 0) return [selected];
	const keys = [];
	const add = (key) => {
		if (key !== void 0 && !keys.includes(key)) keys.push(key);
	};
	add(envValue("DEEPSEEK_API_KEY"));
	try {
		add((await readFile(join(homedir(), ".dsh", ".env"), "utf8")).match(/^DEEPSEEK_API_KEY=(\S+)\s*$/m)?.[1]);
	} catch {}
	return keys;
}
/** Kimi: env → ~/.claude/multi-gateway/config.json. */
async function resolveKimiKey() {
	const envKey = envValue("KIMI_API_KEY") ?? envValue("MOONSHOT_API_KEY");
	if (envKey !== void 0) return envKey;
	return stringField(providerEntry(await readJson(join(homedir(), ".claude", "multi-gateway", "config.json")), "kimi"), "api_key");
}
/**
* Z.ai: env → ~/.zcode/v2/config.json provider table. A z.ai API key is a
* plain hex-ish string; entries whose apiKey looks like a JWT (`eyJ…`) are
* OAuth session tokens for the zcode proxy plan, not API keys, and skipped.
*/
async function resolveZaiKey() {
	const envKey = envValue("ZAI_API_KEY");
	if (envKey !== void 0) return {
		key: envKey,
		base: "api.z.ai"
	};
	const providers = (await readJson(join(homedir(), ".zcode", "v2", "config.json")))?.provider;
	if (providers === null || typeof providers !== "object") return void 0;
	let fallback;
	for (const entry of Object.values(providers)) {
		if (entry === null || typeof entry !== "object") continue;
		const options = entry.options;
		if (options === null || typeof options !== "object") continue;
		const apiKey = stringField(options, "apiKey");
		const baseURL = stringField(options, "baseURL") ?? "";
		if (apiKey === void 0 || apiKey.startsWith("eyJ")) continue;
		const name = stringField(entry, "name") ?? "";
		if (baseURL.includes("api.z.ai")) {
			const hit = {
				key: apiKey,
				base: "api.z.ai"
			};
			if (name === "Z.ai - API Key") return hit;
			fallback ??= hit;
		} else if (baseURL.includes("bigmodel.cn")) fallback ??= {
			key: apiKey,
			base: "open.bigmodel.cn"
		};
	}
	return fallback;
}
async function getJson(url, key) {
	const controller = new AbortController();
	const timer = setTimeout(() => {
		controller.abort();
	}, REQUEST_TIMEOUT_MS);
	try {
		const resp = await fetch(url, {
			headers: {
				Authorization: `Bearer ${key}`,
				Accept: "application/json"
			},
			signal: controller.signal
		});
		const text = await resp.text();
		let body;
		try {
			body = JSON.parse(text);
		} catch {
			body = text.slice(0, 200);
		}
		if (!resp.ok) {
			const detail = typeof body === "string" ? body : JSON.stringify(body).slice(0, 200);
			throw new Error(`HTTP ${resp.status}: ${detail}`);
		}
		if (body === null || typeof body !== "object") throw new Error("unexpected response body");
		return body;
	} finally {
		clearTimeout(timer);
	}
}
function num(value) {
	const n = typeof value === "string" ? Number(value) : value;
	return typeof n === "number" && Number.isFinite(n) ? n : void 0;
}
function isoFromEpochMs(value) {
	const n = num(value);
	return n === void 0 ? void 0 : new Date(n).toISOString();
}
function isoFromEpochSeconds(value) {
	const n = num(value);
	return n === void 0 ? void 0 : (/* @__PURE__ */ new Date(n * 1e3)).toISOString();
}
async function queryDeepSeek(key) {
	const infos = (await getJson("https://api.deepseek.com/user/balance", key)).balance_infos;
	const info = Array.isArray(infos) && infos.length > 0 ? infos[0] : void 0;
	if (info === void 0) throw new Error("no balance_infos in response");
	return {
		id: "deepseek",
		name: "DeepSeek",
		kind: "money",
		status: "ok",
		money: {
			currency: stringField(info, "currency") ?? "CNY",
			total: num(info.total_balance) ?? 0,
			toppedUp: num(info.topped_up_balance),
			granted: num(info.granted_balance)
		}
	};
}
async function queryKimiCode(key) {
	const [usage, me] = await Promise.all([getJson("https://api.kimi.com/coding/v1/usages", key), getJson("https://api.kimi.com/coding/v1/me", key).catch(() => void 0)]);
	const quotas = [];
	const weekly = usage.usage;
	if (weekly !== null && typeof weekly === "object") {
		const w = weekly;
		quotas.push({
			key: "weekly",
			used: num(w.used),
			limit: num(w.limit),
			resetAt: stringField(w, "resetTime")
		});
	}
	const limits = usage.limits;
	const rolling = Array.isArray(limits) && limits.length > 0 ? limits[0] : void 0;
	const detail = rolling?.detail ?? rolling;
	if (detail !== void 0) quotas.push({
		key: "rolling-5h",
		used: kimiQuotaUsed(detail),
		limit: num(detail.limit),
		resetAt: stringField(detail, "resetTime")
	});
	const wallet = usage.boosterWallet;
	const moneyOf = (node) => {
		if (node === null || typeof node !== "object") return {};
		const n = node;
		return {
			cents: num(n.priceInCents),
			currency: stringField(n, "currency")
		};
	};
	const monthlyUsed = moneyOf(wallet?.monthlyUsed);
	const monthlyLimit = moneyOf(wallet?.monthlyChargeLimit);
	const parallel = num(usage.parallel?.limit);
	const membership = usage.user?.membership;
	return {
		id: "kimi",
		name: "Kimi Code",
		kind: "quota",
		status: "ok",
		plan: (me !== void 0 ? stringField(me, "user_level_name") : void 0) ?? stringField(membership, "level"),
		account: me !== void 0 ? stringField(me, "nickname") : void 0,
		quotas,
		booster: wallet === void 0 ? void 0 : {
			enabled: stringField(wallet, "status") !== "STATUS_DISABLED",
			monthlyUsedCents: monthlyUsed.cents,
			monthlyLimitCents: monthlyLimit.cents,
			currency: monthlyUsed.currency ?? monthlyLimit.currency
		},
		parallel
	};
}
async function queryMoonshot(key) {
	const d = (await getJson("https://api.moonshot.cn/v1/users/me/balance", key)).data;
	if (d === void 0) throw new Error("no data in response");
	return {
		id: "kimi",
		name: "Moonshot (Kimi)",
		kind: "money",
		status: "ok",
		money: {
			currency: "CNY",
			total: num(d.available_balance) ?? 0,
			toppedUp: num(d.cash_balance),
			granted: num(d.voucher_balance)
		}
	};
}
async function queryKimi(key) {
	return key.startsWith("sk-kimi-") ? queryKimiCode(key) : queryMoonshot(key);
}
async function queryZai(key, base) {
	const data = await getJson(`https://${base}/api/monitor/usage/quota/limit`, key);
	if (num(data.code) !== 200) throw new Error(stringField(data, "msg") ?? `code ${String(data.code)}`);
	const payload = data.data;
	const limits = Array.isArray(payload?.limits) ? payload.limits : [];
	const quotas = [];
	for (const item of limits) if (stringField(item, "type") === "TIME_LIMIT") quotas.push({
		key: "mcp-monthly",
		used: num(item.currentValue),
		limit: num(item.usage),
		resetAt: isoFromEpochMs(item.nextResetTime)
	});
	else {
		const unit = num(item.unit);
		const key_ = unit === 3 ? "tokens-5h" : unit === 6 ? "tokens-weekly" : `tokens-${String(unit ?? "x")}`;
		quotas.push({
			key: key_,
			percentUsed: num(item.percentage),
			resetAt: isoFromEpochMs(item.nextResetTime)
		});
	}
	return {
		id: "zai",
		name: "GLM",
		kind: "quota",
		status: "ok",
		plan: payload !== void 0 ? stringField(payload, "level") : void 0,
		quotas
	};
}
/** Kimi reports `remaining` instead of `used` immediately after some resets. */
function kimiQuotaUsed(detail) {
	const used = num(detail.used);
	if (used !== void 0) return used;
	const limit = num(detail.limit);
	const remaining = num(detail.remaining);
	return limit === void 0 || remaining === void 0 ? void 0 : Math.max(0, limit - remaining);
}
/**
* GPT exposes only the account's weekly subscription window in this product.
* Model-specific rolling buckets are intentionally not merged into it.
*/
function codexQuotaRows(snapshot) {
	if (snapshot === void 0) return [];
	for (const window of [snapshot.primary, snapshot.secondary]) {
		if (window === null || window === void 0 || window.windowDurationMins !== 10080) continue;
		return [{
			key: "weekly",
			percentUsed: num(window.usedPercent),
			resetAt: isoFromEpochSeconds(window.resetsAt)
		}];
	}
	return [];
}
async function resolveCodexBinary() {
	const candidates = [
		envValue("CODEX_BINARY"),
		"/Applications/ChatGPT.app/Contents/Resources/codex",
		join(homedir(), "Applications", "ChatGPT.app", "Contents", "Resources", "codex")
	].filter((candidate) => candidate !== void 0);
	for (const candidate of candidates) try {
		await access(candidate);
		return candidate;
	} catch {}
	return "codex";
}
/** Create a JSON-lines writer whose stream failures stay inside the owning provider query. */
function createJsonLineWriter(stream, onError) {
	let failed = false;
	const fail = (error) => {
		if (failed) return;
		failed = true;
		onError(error);
	};
	stream.on("error", fail);
	return (payload) => {
		if (stream.destroyed || stream.writableEnded) {
			fail(/* @__PURE__ */ new Error("Codex app-server input closed before the request completed"));
			return;
		}
		stream.write(`${JSON.stringify(payload)}\n`, (error) => {
			if (error !== null && error !== void 0) fail(error);
		});
	};
}
/** Read the signed-in desktop account through Codex's official local app-server. */
async function queryCodex() {
	const binary = await resolveCodexBinary();
	return await new Promise((resolve, reject) => {
		const child = spawn(binary, ["app-server", "--stdio"], { stdio: [
			"pipe",
			"pipe",
			"pipe"
		] });
		let settled = false;
		let buffer = "";
		let accountResult;
		let limitsResult;
		let accountSeen = false;
		let limitsSeen = false;
		let stderr = "";
		const stop = () => {
			clearTimeout(timer);
			child.kill("SIGTERM");
		};
		const finish = (fn) => {
			if (settled) return;
			settled = true;
			stop();
			fn();
		};
		const send = createJsonLineWriter(child.stdin, (error) => {
			finish(() => {
				reject(error);
			});
		});
		const maybeResolve = () => {
			if (!accountSeen || !limitsSeen) return;
			const account = accountResult?.account;
			if (account === null || account === void 0 || stringField(account, "type") !== "chatgpt") {
				finish(() => {
					resolve({
						id: "codex",
						name: "GPT",
						kind: "quota",
						status: "no-key"
					});
				});
				return;
			}
			const byId = limitsResult?.rateLimitsByLimitId;
			const codex = (byId !== null && typeof byId === "object" ? byId : void 0)?.codex;
			const raw = codex !== null && typeof codex === "object" ? codex : limitsResult?.rateLimits;
			const snapshot = raw === void 0 ? void 0 : {
				planType: stringField(raw, "planType"),
				primary: raw.primary,
				secondary: raw.secondary
			};
			finish(() => {
				resolve({
					id: "codex",
					name: "GPT",
					kind: "quota",
					status: "ok",
					plan: snapshot?.planType ?? stringField(account, "planType"),
					quotas: codexQuotaRows(snapshot)
				});
			});
		};
		const timer = setTimeout(() => {
			finish(() => {
				reject(/* @__PURE__ */ new Error("Codex account query timed out"));
			});
		}, CODEX_RPC_TIMEOUT_MS);
		child.once("error", (error) => {
			finish(() => {
				if (error.code === "ENOENT") resolve({
					id: "codex",
					name: "GPT",
					kind: "quota",
					status: "no-key"
				});
				else reject(error);
			});
		});
		child.stderr.setEncoding("utf8");
		child.stderr.on("data", (chunk) => {
			stderr = `${stderr}${chunk}`.slice(-400);
		});
		child.stdout.setEncoding("utf8");
		child.stdout.on("data", (chunk) => {
			buffer += chunk;
			let newline = buffer.indexOf("\n");
			while (newline >= 0) {
				const line = buffer.slice(0, newline).trim();
				buffer = buffer.slice(newline + 1);
				newline = buffer.indexOf("\n");
				if (line.length === 0) continue;
				let response;
				try {
					response = JSON.parse(line);
				} catch {
					continue;
				}
				if (response.error !== void 0) {
					finish(() => {
						reject(new Error(response.error?.message ?? "Codex app-server request failed"));
					});
					return;
				}
				if (response.id === 0) {
					send({
						method: "initialized",
						params: {}
					});
					send({
						id: 1,
						method: "account/read",
						params: { refreshToken: false }
					});
					send({
						id: 2,
						method: "account/rateLimits/read",
						params: {}
					});
				} else if (response.id === 1) {
					accountSeen = true;
					accountResult = response.result;
					maybeResolve();
				} else if (response.id === 2) {
					limitsSeen = true;
					limitsResult = response.result;
					maybeResolve();
				}
			}
		});
		child.once("close", (code) => {
			if (settled) return;
			finish(() => {
				reject(/* @__PURE__ */ new Error(`Codex app-server exited (${String(code)}): ${stderr.trim() || "no response"}`));
			});
		});
		send({
			id: 0,
			method: "initialize",
			params: {
				clientInfo: {
					name: "deepseek-harness-provider-quota",
					version: "0.1.0"
				},
				capabilities: {}
			}
		});
	});
}
function message(error) {
	return error instanceof Error ? error.message : String(error);
}
async function runProvider(id, name, kind, query) {
	try {
		return await query();
	} catch (error) {
		return {
			id,
			name,
			kind,
			status: "error",
			error: message(error)
		};
	}
}
/** Query every configured provider; each resolves its own key and fails soft. */
async function collectUsage() {
	const providers = await Promise.all([
		runProvider("deepseek", "DeepSeek", "money", async () => {
			const keys = await resolveDeepSeekKeys();
			if (keys.length === 0) return {
				id: "deepseek",
				name: "DeepSeek",
				kind: "money",
				status: "no-key"
			};
			let lastError;
			for (const key of keys) try {
				return await queryDeepSeek(key);
			} catch (error) {
				lastError = error;
			}
			throw lastError;
		}),
		runProvider("kimi", "Kimi Code", "quota", async () => {
			const key = await resolveKimiKey();
			if (key === void 0) return {
				id: "kimi",
				name: "Kimi Code",
				kind: "quota",
				status: "no-key"
			};
			return queryKimi(key);
		}),
		runProvider("zai", "GLM", "quota", async () => {
			const resolved = await resolveZaiKey();
			if (resolved === void 0) return {
				id: "zai",
				name: "GLM",
				kind: "quota",
				status: "no-key"
			};
			return queryZai(resolved.key, resolved.base);
		}),
		runProvider("codex", "GPT", "quota", queryCodex)
	]);
	return {
		updatedAt: Date.now(),
		providers
	};
}
//#endregion
//#region lib/types/index.js
/**
* Provider-quota plugin, node half: serves the aggregated usage snapshot at
* `/plugins/ui-provider-quota/api/usage` (longest-prefix-wins over the bundle
* server's `/plugins` route). Same-origin serving is what lets the browser
* half call vendor APIs without CORS or key exposure — keys never leave the
* host, and the response carries no key material.
*
* The snapshot is cached for five minutes per process; `?force=1` bypasses.
*/
/** The route mount needs the web carrier service. */
const inject = ["webServer"];
const ROUTE_PATH = "/plugins/ui-provider-quota/api";
const ZCODE_ICON_PATH = new URL("../assets/zcode.png", import.meta.url);
const CACHE_TTL_MS = 5 * 6e4;
let cached;
let inflight;
async function usageSnapshot(force) {
	if (!force && cached !== void 0 && cached.expiresAt > Date.now()) return cached.snapshot;
	inflight ??= collectUsage().then((snapshot) => {
		cached = {
			snapshot,
			expiresAt: Date.now() + CACHE_TTL_MS
		};
		return snapshot;
	}).finally(() => {
		inflight = void 0;
	});
	return inflight;
}
function send(res, status, body) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json; charset=utf-8");
	res.setHeader("Cache-Control", "no-store");
	res.end(body);
}
async function sendZCodeIcon(res) {
	try {
		const icon = await readFile(ZCODE_ICON_PATH);
		res.statusCode = 200;
		res.setHeader("Content-Type", "image/png");
		res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
		res.end(icon);
	} catch (error) {
		send(res, 500, JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
	}
}
async function handler(req, res) {
	const url = new URL(req.url ?? "/", "http://127.0.0.1");
	if (url.pathname.endsWith("/assets/zcode.png")) {
		if (req.method !== "GET") {
			send(res, 405, JSON.stringify({ error: "method not allowed" }));
			return;
		}
		await sendZCodeIcon(res);
		return;
	}
	if (!url.pathname.endsWith("/usage")) {
		send(res, 404, JSON.stringify({ error: "not found" }));
		return;
	}
	if (req.method !== "GET") {
		send(res, 405, JSON.stringify({ error: "method not allowed" }));
		return;
	}
	try {
		const snapshot = await usageSnapshot(url.searchParams.get("force") === "1");
		send(res, 200, JSON.stringify(snapshot));
	} catch (error) {
		send(res, 500, JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
	}
}
/** Host plugin body: mount the usage route for the lifetime of the fiber. */
function apply(ctx) {
	ctx.effect(() => {
		return ctx.webServer.register({
			kind: "prefix",
			path: ROUTE_PATH,
			handler
		});
	}, "ui-provider-quota: usage route");
}
//#endregion
export { apply, inject };
