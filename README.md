# dsh-model-usage

当前 master 面向 Harness **0.2.1-alpha.1**，已使用 [dsh-plugin-upgrade-skill](https://github.com/oh-my-dsh/dsh-plugin-upgrade-skill/) 完成原生插件适配。下载当前分支获得本次源码更新；既有 Release 保持各自原版本。

[English](README.en.md) | 中文

[![DSH Plugin](https://img.shields.io/badge/DSH-Plugin-111111)](https://github.com/niushuanan/xiaozhuang-dsh) [![Release](https://img.shields.io/badge/release-xiaozhuang--v0.4.3-2563eb)](https://github.com/niushuanan/dsh-model-usage/releases/tag/xiaozhuang-v0.4.3) [![MIT](https://img.shields.io/badge/license-MIT-16a34a)](LICENSE)

在设置页按提供方查看模型额度、周期和刷新状态；手动刷新会立即显示进度，即使后台刷新已经开始也不会出现“点不动”的感觉。

<p align="center"><img src="docs/14-model-usage.webp" alt="多个模型提供方的用量卡片" width="800"></p>

## 安装

1. 打开 [Releases](https://github.com/niushuanan/dsh-model-usage/releases/latest)，下载附带的 ZIP。
2. 把 ZIP 交给能够读取并修改目标 DSH 项目的 AI。
3. 对 AI 说：**先阅读压缩包里的 AGENTS.md、INSTALL.md 和 manifest.json，只安装这个插件，并保留现有插件、数据、对话、附件和设置。**
4. 安装 AI 会按目标 DSH 的当前结构合入代码和 Cordis 行，只验证本插件直接涉及的入口。

## 内容

- <code>payload/</code>：从主仓库复制的插件代码和必要运行资源。
- <code>manifest.json</code>：插件组成、来源、主仓库 commit 和逐文件 SHA-256。
- <code>INSTALL.md</code>：直接安装、冲突适配、失败恢复和最小验证说明。
- <code>docs/</code>：当前版本的真实产品截图。

## 来源与许可

本仓库是 [Xiaozhuang DSH](https://github.com/niushuanan/xiaozhuang-dsh) 的单向发布副本，不是独立开发源。当前内容同步自主仓库 commit [`149c96fdc1`](https://github.com/niushuanan/xiaozhuang-dsh/commit/149c96fdc1518fdd076a0d974647717dd1f217b3)，版本为 [`xiaozhuang-v0.4.3`](https://github.com/niushuanan/dsh-model-usage/releases/tag/xiaozhuang-v0.4.3)。代码采用 [MIT License](LICENSE)。
