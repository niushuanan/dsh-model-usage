/** The usage panel is intentionally Chinese-only; provider brands stay Latin. */
export declare const NS = "quota";
export declare const zh: {
    readonly 'trigger.label': "用量";
    readonly 'trigger.aria': "模型用量";
    readonly 'panel.aria': "模型用量概览";
    readonly 'panel.title': "模型用量";
    readonly refresh: "刷新用量";
    readonly 'auto-refresh': "每 5 分钟自动刷新";
    readonly refreshing: "正在刷新…";
    readonly 'updated.at': "更新于 {time}";
    readonly 'reset.timezone': "重置时间为北京时间";
    readonly 'refresh.failed': "本次刷新失败";
    readonly 'status.no-key': "账号未连接";
    readonly 'status.error': "暂时无法查询";
    readonly 'status.connect': "请在本机登录或配置该厂商账号。";
    readonly 'status.retry': "请点击刷新重试。";
    readonly 'money.total': "账户余额";
    readonly 'quota.weekly': "本周已用";
    readonly 'quota.rolling-5h': "5 小时已用";
    readonly 'quota.percent': "{percent}%";
    readonly 'quota.not-reported': "暂无数据";
    readonly 'quota.reset.at': "{time} 重置";
    readonly 'quota.reset.unused': "未使用，暂无重置";
    readonly 'quota.reset.unknown': "厂商未提供重置时间";
    readonly 'load.error': "暂时无法加载，请点击刷新重试。";
};
export declare const en: Record<QuotaKey, string>;
export type QuotaKey = keyof typeof zh;
//# sourceMappingURL=locales.d.ts.map