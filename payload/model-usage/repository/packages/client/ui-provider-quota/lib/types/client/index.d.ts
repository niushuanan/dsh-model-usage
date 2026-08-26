/**
 * Provider-quota plugin, browser half: contributes one session-header action
 * whose popover lists DeepSeek, KIMI, GLM, and the signed-in GPT account.
 * Data arrives over the plugin's same-origin usage route, so the half holds
 * no keys and no state beyond popover visibility and the last snapshot.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type QuotaKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Provider-quota panel copy. */
        'quota': QuotaKey;
    }
}
export type { QuotaActionProps } from './QuotaAction.tsx';
/** Required services for locale registration and header-slot contribution. */
export declare const inject: string[];
/**
 * Client plugin body: register the dictionaries and the header action.
 * @param ctx - client root context.
 */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map