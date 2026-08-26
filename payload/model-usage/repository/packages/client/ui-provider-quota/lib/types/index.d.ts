/**
 * Provider-quota plugin, node half: serves the aggregated usage snapshot at
 * `/plugins/ui-provider-quota/api/usage` (longest-prefix-wins over the bundle
 * server's `/plugins` route). Same-origin serving is what lets the browser
 * half call vendor APIs without CORS or key exposure — keys never leave the
 * host, and the response carries no key material.
 *
 * Caching is the latency contract for the panel: the newest snapshot lives in
 * memory for five minutes, is mirrored to `~/.dsh/provider-quota-cache.json`
 * so the first open after a restart is instant, and an expired entry is served
 * immediately while one background revalidation refreshes it. Only `?force=1`
 * (the refresh button and the open-state poll) collects against the vendors
 * on the critical path; a cold start with no cached snapshot anywhere is the
 * one case that still waits for collection.
 */
import type { Context } from '@deepseek-ai/cordis';
export type { ProviderReport, QuotaRow, UsageSnapshot } from './quota.ts';
/** The route mount needs the web carrier service. */
export declare const inject: string[];
/** Host plugin body: mount the usage route for the lifetime of the fiber. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map