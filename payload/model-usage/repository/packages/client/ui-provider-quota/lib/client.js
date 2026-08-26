window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-provider-quota",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/brandAssets.js
		/** Public brand artwork from each provider's official brand surface. */
		const BRAND_LOGOS = {
			deepseek: "https://unpkg.com/@lobehub/icons-static-svg@1.94.0/icons/deepseek-color.svg",
			kimi: "https://statics.kimi.ai/kimi-web-seo/assets/kimi-logo-CegIMkbU.png",
			zai: "/plugins/ui-provider-quota/api/assets/zcode.png",
			codex: "https://unpkg.com/@lobehub/icons-static-svg@1.94.0/icons/openai.svg"
		};
		//#endregion
		//#region \0dsh-css:dsh-source/packages/client/ui-provider-quota/src/client/QuotaAction.module.css.mjs
		const css = ".akVvOW_root{position:relative}.akVvOW_trigger{min-height:28px;color:var(--dsh-session-header-action-color,var(--dsw-alias-label-secondary));font-size:var(--dsh-session-header-action-font-size,12px);font-weight:var(--dsh-session-header-action-font-weight,400);line-height:var(--dsh-session-header-action-line-height,18px);cursor:pointer;background:0 0;border:0;border-radius:6px;align-items:center;gap:3px;padding:3px 2px;display:inline-flex}.akVvOW_trigger:hover,.akVvOW_trigger:focus-visible{color:var(--dsh-session-header-action-hover-color,var(--dsw-alias-label-primary))}.akVvOW_trigger svg{transition:transform .12s}.akVvOW_triggerOpen{transform:rotate(180deg)}.akVvOW_triggerIcon{flex:none;width:14px;height:14px;display:inline-block}.akVvOW_count{margin:0 2px 0 1px}.akVvOW_panel{z-index:100;box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);width:min(520px,100vw - 24px);max-height:calc(100vh - 78px);box-shadow:var(--dsw-shadow-lv3);--dsh-scrollbar-thumb:var(--dsw-alias-scrollbar-bg-l2);--dsh-scrollbar-thumb-hover:var(--dsw-alias-scrollbar-hover-l2);border-radius:14px;position:fixed;top:58px;left:50%;overflow:auto;transform:translate(-50%)}.akVvOW_panelHeader{z-index:1;background:var(--dsw-alias-bg-layer-1);grid-template-columns:1fr auto 32px;align-items:center;gap:12px;min-height:48px;padding:0 14px;display:grid;position:sticky;top:0}.akVvOW_iconButton{width:30px;height:30px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:0 0;border:0;border-radius:8px;justify-content:center;align-items:center;padding:0;display:inline-flex}.akVvOW_iconButton:hover:not(:disabled),.akVvOW_iconButton:focus-visible:not(:disabled){background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.akVvOW_iconButton:disabled{opacity:.56;cursor:default}.akVvOW_title{color:var(--dsw-alias-label-primary);letter-spacing:.02em;margin:0;font-size:16px;font-weight:650;line-height:28px}.akVvOW_autoRefresh{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:12px;line-height:20px}.akVvOW_providerList{grid-template-columns:repeat(2,minmax(0,1fr));gap:0;padding:0 12px 8px;display:grid;position:relative}.akVvOW_providerList[data-populated=true]:before,.akVvOW_providerList[data-populated=true]:after{z-index:1;content:\"\";pointer-events:none;background:var(--dsw-alias-border-l2);position:absolute}.akVvOW_providerList[data-populated=true]:before{width:1px;top:12px;bottom:20px;left:50%;transform:translate(-.5px)}.akVvOW_providerList[data-populated=true]:after{height:1px;top:calc(50% - 4px);left:24px;right:24px;transform:translateY(-.5px)}.akVvOW_providerCard{box-sizing:border-box;background:0 0;border:0;border-radius:0;min-width:0;min-height:112px;padding:10px 16px 9px;position:relative}.akVvOW_cardTop{align-items:center;gap:9px;min-width:0;margin-bottom:7px;display:flex}.akVvOW_logoFrame{box-sizing:border-box;width:34px;height:34px;box-shadow:inset 0 0 0 1px color-mix(in srgb, var(--dsw-alias-label-primary) 12%, transparent);background:#fff;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;padding:0;display:inline-flex;overflow:hidden}.akVvOW_logo{object-fit:contain;border-radius:0;width:28px;height:28px;display:block}.akVvOW_logoFrame[data-provider-id=kimi],.akVvOW_logoFrame[data-provider-id=zai]{background:#242424}.akVvOW_logoFrame[data-provider-id=kimi] .akVvOW_logo,.akVvOW_logoFrame[data-provider-id=zai] .akVvOW_logo{width:100%;height:100%}.akVvOW_providerName{color:var(--dsw-alias-label-primary);white-space:nowrap;text-overflow:ellipsis;font-size:15px;font-weight:600;line-height:28px;overflow:hidden}.akVvOW_planBadge{background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);letter-spacing:.02em;white-space:nowrap;border-radius:999px;flex:none;margin-left:auto;padding:1px 6px;font-size:9px;font-weight:600;line-height:18px}.akVvOW_metrics,.akVvOW_metricsSingle{grid-template-columns:repeat(2,minmax(0,1fr));gap:0;display:grid}.akVvOW_metricsSingle{grid-template-columns:1fr}.akVvOW_metric,.akVvOW_moneyMetric,.akVvOW_providerMessage{box-sizing:border-box;min-width:0}.akVvOW_metric,.akVvOW_moneyMetric{flex-direction:column;justify-content:center;gap:3px;display:flex}.akVvOW_metrics>.akVvOW_metric:first-child{padding-right:11px}.akVvOW_metrics>.akVvOW_metric+.akVvOW_metric{border-left:1px solid var(--dsw-alias-border-l2);padding-left:11px}.akVvOW_moneyMetric{flex-direction:row;justify-content:space-between;align-items:baseline}.akVvOW_metricTop{justify-content:space-between;align-items:baseline;gap:6px;display:flex}.akVvOW_metricLabel{color:var(--dsw-alias-label-tertiary);white-space:nowrap;font-size:11px;font-weight:400;line-height:20px}.akVvOW_metricValue,.akVvOW_moneyValue{color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums;font-size:16px;font-weight:600;line-height:28px}.akVvOW_moneyValue{font-size:21px;line-height:28px}.akVvOW_metricMissing{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:20px}.akVvOW_metric[data-unused=true] .akVvOW_metricValue{color:var(--dsw-alias-label-secondary)}.akVvOW_bar{background:var(--dsw-alias-border-l2);border-radius:999px;width:100%;height:4px;overflow:hidden}.akVvOW_resetTime{color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums;white-space:nowrap;text-overflow:ellipsis;font-size:11px;line-height:16px;overflow:hidden}.akVvOW_barFill{border-radius:inherit;background:var(--dsw-alias-button-info-fill);height:100%}.akVvOW_providerMessage{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:4px;font-size:16px;line-height:22px;display:flex}.akVvOW_providerMessage small{color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:18px}.akVvOW_stateLine{color:var(--dsw-alias-label-tertiary);text-align:center;grid-column:1/3;padding:70px 24px;font-size:14px}.akVvOW_footer{min-height:30px;color:var(--dsw-alias-label-tertiary);justify-content:center;align-items:center;gap:5px;font-size:12px;line-height:20px;display:flex}.akVvOW_inlineError{color:var(--dsw-alias-label-secondary);margin-left:10px}.akVvOW_refreshSpin{animation:.76s linear infinite akVvOW_spin;display:inline-flex}@keyframes akVvOW_spin{to{transform:rotate(360deg)}}@media (width<=620px){.akVvOW_panel{border-radius:14px;width:calc(100vw - 20px);max-height:calc(100vh - 56px);top:48px}.akVvOW_panelHeader{grid-template-columns:1fr 32px;gap:10px;min-height:48px;padding:0 12px}.akVvOW_autoRefresh{display:none}.akVvOW_providerList{grid-template-columns:1fr}.akVvOW_providerList[data-populated=true]:before,.akVvOW_providerList[data-populated=true]:after{display:none}.akVvOW_providerCard+.akVvOW_providerCard:before{content:\"\";pointer-events:none;background:var(--dsw-alias-border-l2);height:1px;position:absolute;top:0;left:12px;right:12px}.akVvOW_stateLine{grid-column:1}}";
		const tagId = "@deepseek-ai/dsh-client-ui-provider-quota/QuotaAction.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@deepseek-ai/dsh-client-ui-provider-quota";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var QuotaAction_module_css_default = {
			"autoRefresh": "akVvOW_autoRefresh",
			"bar": "akVvOW_bar",
			"barFill": "akVvOW_barFill",
			"cardTop": "akVvOW_cardTop",
			"count": "akVvOW_count",
			"footer": "akVvOW_footer",
			"iconButton": "akVvOW_iconButton",
			"inlineError": "akVvOW_inlineError",
			"logo": "akVvOW_logo",
			"logoFrame": "akVvOW_logoFrame",
			"metric": "akVvOW_metric",
			"metricLabel": "akVvOW_metricLabel",
			"metricMissing": "akVvOW_metricMissing",
			"metricTop": "akVvOW_metricTop",
			"metricValue": "akVvOW_metricValue",
			"metrics": "akVvOW_metrics",
			"metricsSingle": "akVvOW_metricsSingle",
			"moneyMetric": "akVvOW_moneyMetric",
			"moneyValue": "akVvOW_moneyValue",
			"panel": "akVvOW_panel",
			"panelHeader": "akVvOW_panelHeader",
			"planBadge": "akVvOW_planBadge",
			"providerCard": "akVvOW_providerCard",
			"providerList": "akVvOW_providerList",
			"providerMessage": "akVvOW_providerMessage",
			"providerName": "akVvOW_providerName",
			"refreshSpin": "akVvOW_refreshSpin",
			"resetTime": "akVvOW_resetTime",
			"root": "akVvOW_root",
			"spin": "akVvOW_spin",
			"stateLine": "akVvOW_stateLine",
			"title": "akVvOW_title",
			"trigger": "akVvOW_trigger",
			"triggerIcon": "akVvOW_triggerIcon",
			"triggerOpen": "akVvOW_triggerOpen"
		};
		//#endregion
		//#region lib/types/client/QuotaAction.js
		const API_URL = "/plugins/ui-provider-quota/api/usage";
		const AUTO_REFRESH_MS = 5 * 6e4;
		function rowPercent(row) {
			if (row === void 0) return void 0;
			if (typeof row.percentUsed === "number") return row.percentUsed;
			if (typeof row.used === "number" && typeof row.limit === "number" && row.limit > 0) return row.used / row.limit * 100;
		}
		function windowRow(provider, key) {
			const aliases = key === "rolling-5h" ? new Set(["rolling-5h", "tokens-5h"]) : new Set(["weekly", "tokens-weekly"]);
			return provider.quotas?.find((row) => aliases.has(row.key));
		}
		function formatMoney(currency, amount) {
			return (currency === "CNY" ? "¥" : currency === "USD" ? "$" : currency + " ") + amount.toFixed(2);
		}
		function formatResetAt(resetAt, percent, t) {
			if (resetAt === void 0) return percent === 0 ? t("quota.reset.unused") : t("quota.reset.unknown");
			const date = new Date(/^\d+$/.test(resetAt) ? Number(resetAt) : resetAt);
			if (Number.isNaN(date.getTime())) return t("quota.reset.unknown");
			const parts = new Intl.DateTimeFormat("zh-CN", {
				timeZone: "Asia/Shanghai",
				month: "numeric",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
				hour12: false
			}).formatToParts(date);
			const value = (type) => parts.find((part) => part.type === type)?.value ?? "";
			return t("quota.reset.at", { time: `${value("month")}/${value("day")} ${value("hour")}:${value("minute")}` });
		}
		function WindowMetric({ label, row, t }) {
			const percent = rowPercent(row);
			const percentText = percent === void 0 ? t("quota.not-reported") : t("quota.percent", { percent: Math.round(percent) });
			const resetText = formatResetAt(row?.resetAt, percent, t);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: QuotaAction_module_css_default.metric,
				"data-unused": percent === 0 ? "true" : void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: QuotaAction_module_css_default.metricTop,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: QuotaAction_module_css_default.metricLabel,
							children: label
						}), (0, react_jsx_runtime.jsx)("span", {
							className: percent === void 0 ? QuotaAction_module_css_default.metricMissing : QuotaAction_module_css_default.metricValue,
							children: percentText
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: QuotaAction_module_css_default.bar,
						role: "progressbar",
						"aria-label": `${label}，${percentText}`,
						"aria-valuemin": 0,
						"aria-valuemax": 100,
						"aria-valuenow": percent === void 0 ? void 0 : Math.round(percent),
						children: percent === void 0 || percent === 0 ? null : (0, react_jsx_runtime.jsx)("div", {
							className: QuotaAction_module_css_default.barFill,
							style: { width: `${Math.max(0, Math.min(percent, 100))}%` }
						})
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: QuotaAction_module_css_default.resetTime,
						children: resetText
					})
				]
			});
		}
		function displayPlan(provider) {
			if (provider.id === "kimi") {
				if (provider.plan === "LEVEL_ADVANCED") return "ALLEGRO";
				return provider.plan?.replace(/^LEVEL_/, "").toUpperCase();
			}
			if (provider.id === "zai") return provider.plan?.toUpperCase();
			if (provider.id === "codex") return provider.plan?.toLowerCase() === "pro" ? "PRO · 20X" : provider.plan?.toUpperCase();
		}
		function ProviderCard({ provider, t }) {
			const fiveHour = windowRow(provider, "rolling-5h");
			const weekly = windowRow(provider, "weekly");
			const displayName = provider.id === "kimi" ? "KIMI" : provider.id === "zai" ? "GLM" : provider.id === "codex" ? "GPT" : provider.name;
			const plan = displayPlan(provider);
			const logo = BRAND_LOGOS[provider.id];
			return (0, react_jsx_runtime.jsxs)("article", {
				className: QuotaAction_module_css_default.providerCard,
				role: "listitem",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: QuotaAction_module_css_default.cardTop,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: QuotaAction_module_css_default.logoFrame,
							"data-provider-id": provider.id,
							children: logo === void 0 ? null : (0, react_jsx_runtime.jsx)("img", {
								className: QuotaAction_module_css_default.logo,
								src: logo,
								alt: ""
							})
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: QuotaAction_module_css_default.providerName,
							children: displayName
						}),
						plan === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: QuotaAction_module_css_default.planBadge,
							children: plan
						})
					]
				}), provider.status !== "ok" ? (0, react_jsx_runtime.jsxs)("div", {
					className: QuotaAction_module_css_default.providerMessage,
					title: provider.error,
					children: [(0, react_jsx_runtime.jsx)("span", { children: provider.status === "no-key" ? t("status.no-key") : t("status.error") }), (0, react_jsx_runtime.jsx)("small", { children: provider.status === "no-key" ? t("status.connect") : t("status.retry") })]
				}) : provider.money !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
					className: QuotaAction_module_css_default.moneyMetric,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: QuotaAction_module_css_default.metricLabel,
						children: t("money.total")
					}), (0, react_jsx_runtime.jsx)("span", {
						className: QuotaAction_module_css_default.moneyValue,
						children: formatMoney(provider.money.currency, provider.money.total)
					})]
				}) : (0, react_jsx_runtime.jsxs)("div", {
					className: provider.id === "codex" ? QuotaAction_module_css_default.metricsSingle : QuotaAction_module_css_default.metrics,
					children: [provider.id === "codex" ? null : (0, react_jsx_runtime.jsx)(WindowMetric, {
						label: t("quota.rolling-5h"),
						row: fiveHour,
						t
					}), (0, react_jsx_runtime.jsx)(WindowMetric, {
						label: t("quota.weekly"),
						row: weekly,
						t
					})]
				})]
			});
		}
		/** Four-provider usage panel with live refresh and a five-minute open-state poll. */
		function QuotaAction({ t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [data, setData] = (0, react.useState)();
			const [loading, setLoading] = (0, react.useState)(false);
			const [loadError, setLoadError] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const triggerRef = (0, react.useRef)(null);
			const inflightRef = (0, react.useRef)(false);
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen);
			const load = (0, react.useCallback)(async (force, showLoading = false) => {
				if (inflightRef.current) return;
				inflightRef.current = true;
				if (showLoading) setLoading(true);
				try {
					const resp = await fetch(API_URL + (force ? "?force=1" : ""), { cache: "no-store" });
					if (!resp.ok) throw new Error("HTTP " + String(resp.status));
					setData(await resp.json());
					setLoadError(false);
				} catch {
					setLoadError(true);
				} finally {
					inflightRef.current = false;
					if (showLoading) setLoading(false);
				}
			}, []);
			(0, react.useEffect)(() => {
				if (!open) return void 0;
				const timer = window.setInterval(() => {
					load(true);
				}, AUTO_REFRESH_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, [load, open]);
			const close = () => {
				setOpen(false);
				triggerRef.current?.focus();
			};
			const onKeyDown = (event) => {
				if (event.key !== "Escape" || !open) return;
				event.preventDefault();
				close();
			};
			const updatedAt = data === void 0 ? void 0 : new Date(data.updatedAt).toLocaleTimeString("zh-CN", {
				hour: "2-digit",
				minute: "2-digit"
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: QuotaAction_module_css_default.root,
				onKeyDown,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					ref: triggerRef,
					type: "button",
					className: QuotaAction_module_css_default.trigger,
					"aria-expanded": open,
					"aria-label": t("trigger.aria"),
					onClick: () => {
						const next = !open;
						setOpen(next);
						if (next && data === void 0) load(false, true);
					},
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDataOutline16, {
							className: QuotaAction_module_css_default.triggerIcon,
							size: 14
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: QuotaAction_module_css_default.count,
							children: t("trigger.label")
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: open ? QuotaAction_module_css_default.triggerOpen : void 0 })
					]
				}), open ? (0, react_jsx_runtime.jsxs)("section", {
					className: QuotaAction_module_css_default.panel,
					role: "dialog",
					"aria-label": t("panel.aria"),
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: QuotaAction_module_css_default.panelHeader,
							children: [
								(0, react_jsx_runtime.jsx)("h2", {
									className: QuotaAction_module_css_default.title,
									children: t("panel.title")
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: QuotaAction_module_css_default.autoRefresh,
									children: t("auto-refresh")
								}),
								(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: QuotaAction_module_css_default.iconButton,
									"aria-label": t("refresh"),
									disabled: loading,
									onClick: () => {
										load(true, true);
									},
									children: (0, react_jsx_runtime.jsx)("span", {
										className: loading ? QuotaAction_module_css_default.refreshSpin : void 0,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline16, { size: 20 })
									})
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: QuotaAction_module_css_default.providerList,
							role: "list",
							"data-populated": data?.providers.length ? "true" : void 0,
							children: [
								data === void 0 && !loadError ? (0, react_jsx_runtime.jsx)("div", {
									className: QuotaAction_module_css_default.stateLine,
									children: t("refreshing")
								}) : null,
								loadError && data === void 0 ? (0, react_jsx_runtime.jsx)("div", {
									className: QuotaAction_module_css_default.stateLine,
									children: t("load.error")
								}) : null,
								data?.providers.map((provider) => (0, react_jsx_runtime.jsx)(ProviderCard, {
									provider,
									t
								}, provider.id))
							]
						}),
						(0, react_jsx_runtime.jsxs)("footer", {
							className: QuotaAction_module_css_default.footer,
							children: [
								(0, react_jsx_runtime.jsx)("span", { children: updatedAt === void 0 ? t("refreshing") : t("updated.at", { time: updatedAt }) }),
								(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "·"
								}),
								(0, react_jsx_runtime.jsx)("span", { children: t("reset.timezone") }),
								loadError && data !== void 0 ? (0, react_jsx_runtime.jsx)("span", {
									className: QuotaAction_module_css_default.inlineError,
									children: t("refresh.failed")
								}) : null
							]
						})
					]
				}) : null]
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** The usage panel is intentionally Chinese-only; provider brands stay Latin. */
		const NS = "quota";
		const zh = {
			"trigger.label": "用量",
			"trigger.aria": "模型用量",
			"panel.aria": "模型用量概览",
			"panel.title": "模型用量",
			"refresh": "刷新用量",
			"auto-refresh": "每 5 分钟自动刷新",
			"refreshing": "正在刷新…",
			"updated.at": "更新于 {time}",
			"reset.timezone": "重置时间为北京时间",
			"refresh.failed": "本次刷新失败",
			"status.no-key": "账号未连接",
			"status.error": "暂时无法查询",
			"status.connect": "请在本机登录或配置该厂商账号。",
			"status.retry": "请点击刷新重试。",
			"money.total": "账户余额",
			"quota.weekly": "本周已用",
			"quota.rolling-5h": "5 小时已用",
			"quota.percent": "{percent}%",
			"quota.not-reported": "暂无数据",
			"quota.reset.at": "{time} 重置",
			"quota.reset.unused": "未使用，暂无重置",
			"quota.reset.unknown": "厂商未提供重置时间",
			"load.error": "暂时无法加载，请点击刷新重试。"
		};
		const en = { ...zh };
		//#endregion
		//#region lib/types/client/index.js
		/** Required services for locale registration and header-slot contribution. */
		const inject = ["slots", "locale"];
		/**
		* Client plugin body: register the dictionaries and the header action.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "ui-provider-quota: dictionaries");
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "provider-quota",
				order: 30,
				locale: NS
			}, QuotaAction));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map