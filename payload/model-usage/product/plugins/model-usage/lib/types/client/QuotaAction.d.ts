import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from './locales.ts';
/** Full props for the session-header provider-quota action. */
export type QuotaActionProps = PropsRuntime<'conversation.session.header.actions'> & PropsLocale<typeof NS>;
/** Four-provider usage panel with live refresh and a five-minute open-state poll. */
export declare function QuotaAction({ t }: QuotaActionProps): import("react").JSX.Element;
//# sourceMappingURL=QuotaAction.d.ts.map