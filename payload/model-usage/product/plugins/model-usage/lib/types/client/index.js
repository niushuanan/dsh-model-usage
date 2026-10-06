import { QuotaAction } from "./QuotaAction.js";
import { en, NS, zh } from "./locales.js";
/** Required services for locale registration and header-slot contribution. */
export const inject = ['slots', 'locale'];
/**
 * Client plugin body: register the dictionaries and the header action.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ui-provider-quota: dictionaries');
    ctx.slots.inject('conversation.session.header.actions', () => ctx.slots.register({
        name: 'conversation.session.header.actions',
        id: 'provider-quota',
        // After the background-job list: process state reads before account state.
        order: 30,
        locale: NS,
    }, QuotaAction));
}
//# sourceMappingURL=index.js.map