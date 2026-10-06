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
import type { Writable } from 'node:stream';
/** One normalized quota row: counted (used/limit) or percentage-only. */
export interface QuotaRow {
    key: string;
    used?: number | undefined;
    limit?: number | undefined;
    percentUsed?: number | undefined;
    /** ISO time or epoch-ms string; absent means unknown. */
    resetAt?: string | undefined;
}
export interface ProviderReport {
    id: 'deepseek' | 'kimi' | 'zai' | 'codex';
    name: string;
    kind: 'money' | 'quota';
    status: 'ok' | 'no-key' | 'error';
    plan?: string | undefined;
    account?: string | undefined;
    money?: {
        currency: string;
        total: number;
        toppedUp?: number | undefined;
        granted?: number | undefined;
    } | undefined;
    quotas?: QuotaRow[] | undefined;
    /** Kimi Code only: subscription booster wallet facts. */
    booster?: {
        enabled: boolean;
        monthlyUsedCents?: number | undefined;
        monthlyLimitCents?: number | undefined;
        currency?: string | undefined;
    } | undefined;
    /** Kimi Code only: parallel request cap. */
    parallel?: number | undefined;
    error?: string | undefined;
}
export interface UsageSnapshot {
    updatedAt: number;
    providers: ProviderReport[];
}
interface CodexRateLimitWindow {
    usedPercent?: number | undefined;
    windowDurationMins?: number | undefined;
    resetsAt?: number | undefined;
}
interface CodexRateLimitSnapshot {
    planType?: string | undefined;
    primary?: CodexRateLimitWindow | null | undefined;
    secondary?: CodexRateLimitWindow | null | undefined;
}
/** Kimi reports `remaining` instead of `used` immediately after some resets. */
export declare function kimiQuotaUsed(detail: Record<string, unknown>): number | undefined;
/**
 * GPT exposes only the account's weekly subscription window in this product.
 * Model-specific rolling buckets are intentionally not merged into it.
 */
export declare function codexQuotaRows(snapshot: CodexRateLimitSnapshot | undefined): QuotaRow[];
/** Create a JSON-lines writer whose stream failures stay inside the owning provider query. */
export declare function createJsonLineWriter(stream: Writable, onError: (error: Error) => void): (payload: Record<string, unknown>) => void;
/** Query every configured provider; each resolves its own key and fails soft. */
export declare function collectUsage(): Promise<UsageSnapshot>;
export {};
//# sourceMappingURL=quota.d.ts.map