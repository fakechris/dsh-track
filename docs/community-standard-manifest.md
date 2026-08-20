# dsh-plugin.json — DSH 社区标准（oh-my-dsh/dsh-community-standard）采用状态

> 状态：**Draft 声明**（2026-08）。本 manifest 是社区标准（Draft v0.15）的**真实插件样本**，不是"已验证遵循"的凭证。

## 文件

- [`dsh-plugin.json`](../dsh-plugin.json) —— 位于包根目录，通过 `schemas/dsh-plugin.schema.json`（社区仓库 Draft v0.15）校验。

## 能力映射（views.dsh/v1alpha1 → dsh-track 实际实现）

| manifest 视图 | location | 实际实现 |
| --- | --- | --- |
| `…sidebar` | `sidebar.footer` | 左侧边栏 "Track" 入口（DOM 注入，官方 sidebar 单座 slot 的 task-board 先例） |
| `…details` | `details.panel` | 右侧 Track 面板（grid 接管右 1/3，lazyfish/side-panel 模式） |
| `…graph-tab` | `conversation.tab` | "Session graph" 会话结构图 tab（注册官方 `conversation.view` slot） |
| `…strip` | `composer.dock` | 输入框下方 pending 计数条（注册官方 `conversation.composer.dock` slot） |

`component` 统一指向 `lib/client.js`（单一客户端 bundle 注册全部视图，与标准"每视图一个预构建 bundle"的形态不同 —— 属实现差异，记录于此）。

## 未声明的契约（有意为之）

- **urlstate.dsh/v1alpha1**：本插件的深链（`/s/<id>[/<msg>]` + `?open=`）是**插件侧** URL 解析（读 `location`），而该契约要求"插件不碰 location、宿主统一序列化与回填"。语义不匹配，故**不声明**。
- **storage.dsh/v1alpha1**：Track 数据走自有 host 存储（`/api/track/*`），不是契约定义的"插件私有键值存储"。
- **commands.dsh/v1alpha1**：本插件无 slash command。

## 表述边界（按 conformance.md §2）

- ✅ 已获得：**Schema validation**（第 1 类证据）—— manifest 通过 JSON Schema 校验。
- ❌ 未获得：**Plugin validation / Interop evidence** —— 当前没有任何宿主实现 defineFacet 适配层，无法跑 conformance 套件；**任何实现不能自我认证**，故本仓库不声称"遵循标准"。
- 对外表述仅限："提交了符合 Draft v0.15 schema 的 manifest 样本"。
