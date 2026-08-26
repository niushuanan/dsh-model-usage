/**
 * Provider-quota plugin, node half: serves the aggregated usage snapshot at
 * `/plugins/ui-provider-quota/api/usage` (longest-prefix-wins over the bundle
 * server's `/plugins` route). Same-origin serving is what lets the browser
 * half call vendor APIs without CORS or key exposure — keys never leave the
 * host, and the response carries no key material.
 *
 * The snapshot is cached for five minutes per process; `?force=1` bypasses.
 */
import type { Context } from '@deepseek-ai/cordis';
export type { ProviderReport, QuotaRow, UsageSnapshot } from './quota.ts';
/** The route mount needs the web carrier service. */
export declare const inject: string[];
/** Host plugin body: mount the usage route for the lifetime of the fiber. */
export declare function apply(ctx: Context): void;
//# sourceMappingURL=index.d.ts.map