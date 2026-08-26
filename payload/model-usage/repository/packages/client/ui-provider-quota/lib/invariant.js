//#region lib/types/invariant.js
/**
* Package-owned invariant companion for the provider quota panel.
* @module @deepseek-ai/dsh-client-ui-provider-quota/invariant
*/
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-provider-quota";
/** Cordis companion plugin name. */
const name = "client-ui-provider-quota-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the plugin reads external provider snapshots on demand,
* exposes them through one read-only HTTP route, and owns no authoritative
* event stream or cross-plugin mutable relationship that can be checked.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
