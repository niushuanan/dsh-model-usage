import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect, useRef, useState } from 'react';
import { IconChevronDownOutlineRegular, IconDataOutlineRegular, IconRefreshOutlineRegular, useDismissOnOutsidePointer, } from '@deepseek-ai/dsh-client-ui-primitives';
import { BRAND_LOGOS } from "./brandAssets.js";
import css from './QuotaAction.module.css';
const API_URL = '/plugins/ui-provider-quota/api/usage';
const AUTO_REFRESH_MS = 5 * 60_000;
function rowPercent(row) {
    if (row === undefined)
        return undefined;
    if (typeof row.percentUsed === 'number')
        return row.percentUsed;
    if (typeof row.used === 'number' && typeof row.limit === 'number' && row.limit > 0) {
        return (row.used / row.limit) * 100;
    }
    return undefined;
}
function windowRow(provider, key) {
    const aliases = key === 'rolling-5h' ? new Set(['rolling-5h', 'tokens-5h']) : new Set(['weekly', 'tokens-weekly']);
    return provider.quotas?.find(row => aliases.has(row.key));
}
function formatMoney(currency, amount) {
    const symbol = currency === 'CNY' ? '¥' : currency === 'USD' ? '$' : currency + ' ';
    return symbol + amount.toFixed(2);
}
function formatResetAt(resetAt, percent, t) {
    if (resetAt === undefined) {
        return percent === 0 ? t('quota.reset.unused') : t('quota.reset.unknown');
    }
    const date = new Date(/^\d+$/.test(resetAt) ? Number(resetAt) : resetAt);
    if (Number.isNaN(date.getTime()))
        return t('quota.reset.unknown');
    const parts = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(date);
    const value = (type) => parts.find(part => part.type === type)?.value ?? '';
    return t('quota.reset.at', {
        time: `${value('month')}/${value('day')} ${value('hour')}:${value('minute')}`,
    });
}
function WindowMetric({ label, row, t }) {
    const percent = rowPercent(row);
    const percentText = percent === undefined ? t('quota.not-reported') : t('quota.percent', { percent: Math.round(percent) });
    const resetText = formatResetAt(row?.resetAt, percent, t);
    return (_jsxs("div", { className: css.metric, "data-unused": percent === 0 ? 'true' : undefined, children: [_jsxs("div", { className: css.metricTop, children: [_jsx("span", { className: css.metricLabel, children: label }), _jsx("span", { className: percent === undefined ? css.metricMissing : css.metricValue, children: percentText })] }), _jsx("div", { className: css.bar, role: "progressbar", "aria-label": `${label}，${percentText}`, "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": percent === undefined ? undefined : Math.round(percent), children: percent === undefined || percent === 0
                    ? null
                    : _jsx("div", { className: css.barFill, style: { width: `${Math.max(0, Math.min(percent, 100))}%` } }) }), _jsx("span", { className: css.resetTime, children: resetText })] }));
}
function displayPlan(provider) {
    if (provider.id === 'kimi') {
        if (provider.plan === 'LEVEL_ADVANCED')
            return 'ALLEGRO';
        return provider.plan?.replace(/^LEVEL_/, '').toUpperCase();
    }
    if (provider.id === 'zai')
        return provider.plan?.toUpperCase();
    if (provider.id === 'codex')
        return provider.plan?.toLowerCase() === 'pro' ? 'PRO · 20X' : provider.plan?.toUpperCase();
    return undefined;
}
function ProviderCard({ provider, t }) {
    const fiveHour = windowRow(provider, 'rolling-5h');
    const weekly = windowRow(provider, 'weekly');
    const displayName = provider.id === 'kimi' ? 'KIMI' : provider.id === 'zai' ? 'GLM' : provider.id === 'codex' ? 'GPT' : provider.name;
    const plan = displayPlan(provider);
    const logo = BRAND_LOGOS[provider.id];
    return (_jsxs("article", { className: css.providerCard, role: "listitem", children: [_jsxs("div", { className: css.cardTop, children: [_jsx("span", { className: css.logoFrame, "data-provider-id": provider.id, children: logo === undefined ? null : _jsx("img", { className: css.logo, src: logo, alt: "" }) }), _jsx("span", { className: css.providerName, children: displayName }), plan === undefined ? null : _jsx("span", { className: css.planBadge, children: plan })] }), provider.status !== 'ok'
                ? (_jsxs("div", { className: css.providerMessage, title: provider.error, children: [_jsx("span", { children: provider.status === 'no-key' ? t('status.no-key') : t('status.error') }), _jsx("small", { children: provider.status === 'no-key' ? t('status.connect') : t('status.retry') })] }))
                : provider.money !== undefined
                    ? (_jsxs("div", { className: css.moneyMetric, children: [_jsx("span", { className: css.metricLabel, children: t('money.total') }), _jsx("span", { className: css.moneyValue, children: formatMoney(provider.money.currency, provider.money.total) })] }))
                    : (_jsxs("div", { className: provider.id === 'codex' ? css.metricsSingle : css.metrics, children: [provider.id === 'codex' ? null : _jsx(WindowMetric, { label: t('quota.rolling-5h'), row: fiveHour, t: t }), _jsx(WindowMetric, { label: t('quota.weekly'), row: weekly, t: t })] }))] }));
}
/** Four-provider usage panel with live refresh and a five-minute open-state poll. */
export function QuotaAction({ t }) {
    const [open, setOpen] = useState(false);
    const [data, setData] = useState();
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const rootRef = useRef(null);
    const triggerRef = useRef(null);
    const inflightRef = useRef();
    useDismissOnOutsidePointer(rootRef, open, setOpen);
    const load = useCallback(async (force, showLoading = false) => {
        const existing = inflightRef.current;
        if (existing !== undefined) {
            if (!showLoading)
                return;
            setLoading(true);
            try {
                await existing;
            }
            finally {
                setLoading(false);
            }
            return;
        }
        if (showLoading)
            setLoading(true);
        const request = (async () => {
            try {
                const resp = await fetch(API_URL + (force ? '?force=1' : ''), { cache: 'no-store' });
                if (!resp.ok)
                    throw new Error('HTTP ' + String(resp.status));
                return await resp.json();
            }
            catch {
                return undefined;
            }
        })();
        inflightRef.current = request;
        try {
            const next = await request;
            // Clear before publishing the snapshot. React may run the stale-data
            // effect immediately after setData, and that revalidation must be able
            // to start its own request.
            if (inflightRef.current === request)
                inflightRef.current = undefined;
            if (next === undefined) {
                setLoadError(true);
            }
            else {
                setData(next);
                setLoadError(false);
            }
        }
        finally {
            if (inflightRef.current === request)
                inflightRef.current = undefined;
            if (showLoading)
                setLoading(false);
        }
    }, []);
    useEffect(() => {
        if (!open)
            return undefined;
        const timer = window.setInterval(() => { void load(true); }, AUTO_REFRESH_MS);
        return () => { window.clearInterval(timer); };
    }, [load, open]);
    // The host answers an expired or restarted cache instantly; one silent
    // force pass on stale data brings the numbers current without a spinner.
    // Re-evaluating on `data` is what stops the loop: fresh data fails the
    // staleness check and no further pass is scheduled.
    useEffect(() => {
        if (!open || data === undefined)
            return;
        if (Date.now() - data.updatedAt > AUTO_REFRESH_MS)
            void load(true);
    }, [data, load, open]);
    const close = () => {
        setOpen(false);
        triggerRef.current?.focus();
    };
    const onKeyDown = (event) => {
        if (event.key !== 'Escape' || !open)
            return;
        event.preventDefault();
        close();
    };
    const updatedAt = data === undefined
        ? undefined
        : new Date(data.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    return (_jsxs("div", { ref: rootRef, className: css.root, onKeyDown: onKeyDown, children: [_jsxs("button", { ref: triggerRef, type: "button", className: css.trigger, "aria-expanded": open, "aria-label": t('trigger.aria'), onClick: () => {
                    const next = !open;
                    setOpen(next);
                    if (next && data === undefined)
                        void load(false, true);
                }, children: [_jsx(IconDataOutlineRegular, { className: css.triggerIcon, size: 14 }), _jsx("span", { className: css.count, children: t('trigger.label') }), _jsx(IconChevronDownOutlineRegular, { className: open ? css.triggerOpen : undefined })] }), open
                ? (_jsxs("section", { className: css.panel, role: "dialog", "aria-label": t('panel.aria'), children: [_jsxs("header", { className: css.panelHeader, children: [_jsx("h2", { className: css.title, children: t('panel.title') }), _jsx("span", { className: css.autoRefresh, children: t('auto-refresh') }), _jsx("button", { type: "button", className: css.iconButton, "aria-label": t('refresh'), disabled: loading, onClick: () => { void load(true, true); }, children: _jsx("span", { className: loading ? css.refreshSpin : undefined, children: _jsx(IconRefreshOutlineRegular, { size: 20 }) }) })] }), _jsxs("div", { className: css.providerList, role: "list", "data-populated": data?.providers.length ? 'true' : undefined, children: [data === undefined && !loadError
                                    ? _jsx("div", { className: css.stateLine, children: t('refreshing') })
                                    : null, loadError && data === undefined
                                    ? _jsx("div", { className: css.stateLine, children: t('load.error') })
                                    : null, data?.providers.map(provider => _jsx(ProviderCard, { provider: provider, t: t }, provider.id))] }), _jsxs("footer", { className: css.footer, children: [_jsx("span", { children: updatedAt === undefined ? t('refreshing') : t('updated.at', { time: updatedAt }) }), _jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { children: t('reset.timezone') }), loadError && data !== undefined ? _jsx("span", { className: css.inlineError, children: t('refresh.failed') }) : null] })] }))
                : null] }));
}
//# sourceMappingURL=QuotaAction.js.map