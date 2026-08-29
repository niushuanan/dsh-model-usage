# Project Context

## 1. 这个项目是干什么的

本仓库是 Xiaozhuang DSH“模型用量”插件的独立分发镜像。它不在这里独立开发，而是从 `niushuanan/xiaozhuang-dsh` 主仓库单向导出，让用户可以只安装模型用量面板及其必要运行文件。

## 2. 代码结构是什么

- `payload/`：按主仓库原相对路径保存的插件源码、类型声明、构建产物和品牌资源。
- `manifest.json`：插件组成、Cordis 行、来源路径、主仓库提交和逐文件 SHA-256。
- `INSTALL.md`、`AGENTS.md`：安装、兼容调整和安全边界。
- `README.md`、`README.en.md`、`docs/`：双语产品说明与真实界面截图。

## 3. 关键入口在哪里

- `payload/model-usage/repository/packages/client/ui-provider-quota/src/client/QuotaAction.tsx`：浏览器端模型用量面板和刷新交互。
- `payload/model-usage/repository/packages/client/ui-provider-quota/src/index.ts`：Host 端用量聚合路由。
- `payload/model-usage/repository/packages/client/ui-provider-quota/src/quota.ts`：各模型厂商用量采集与缓存。
- `manifest.json`：安装工具读取的插件闭包和完整性清单。

## 4. 最近改了什么

### 2026-08-29 - 手动刷新即时反馈

- 本次任务：同步主仓库中模型用量刷新图标“点了像没反应”的修复。
- 改了哪些文件：重新导出 `payload/model-usage/repository/packages/client/ui-provider-quota/`，更新 `manifest.json`、双语 README 和本文件。
- 改了什么：用户在后台静默刷新进行中再次点击刷新时，按钮会立即旋转并暂时禁用，等待同一个请求完成后恢复，不会重复请求厂商接口。
- 为什么这样改：旧版本在请求去重时没有呈现交互状态，用户会误以为刷新按钮失效。
- 影响了哪些模块：只影响模型用量面板的刷新反馈和插件分发内容；不改变供应商凭据、额度计算或 GLM 查询协议。
