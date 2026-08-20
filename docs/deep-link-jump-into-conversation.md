# 调研：从 DSH 外部跳转到 DSH Web 指定对话（Deep-link into a conversation）

> 状态：调研完成（2026-08，基于本地 slot-b 实际安装的 `0.1.0-rc.6` 包源码 + [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) master 文档）
> **2026-08 更新：路线 A 已在 dsh-track 落地并通过实测** —— `src/client/deep-link.ts`（两种别名：`/s/<sessionId>[/<messageId>]` 路径形式 + `?open=<sessionId>[&message=<messageId>]` 查询形式，触发 `jumpToConversation` 完成会话打开 + 消息滚动定位）。实测：查询形式跳转后自动清理 URL；路径形式保留 URL（可书签）；消息级定位 2 秒内命中。
> 目标：从终端 / jump 类启动器 / 脚本，一键打开浏览器并定位到 DSH Web GUI 的**指定会话**（理想情况下还定位到某条消息）。

---

## 1. 结论摘要（TL;DR）

- **DSH Web 目前没有任何 URL 深链能力**。它是单页应用，只有一个 `/` 入口；前端 bundle 不读 `location.pathname`、`location.hash` 或 `URLSearchParams` 来选会话，官方文档也明确写着 "There is no … trajectory deep link"。
- 会话的稳定标识是 **`SessionId = "session-<uuid>"`**（例：`session-58550315-8d51-49a9-954b-a177fa5aad30`），磁盘上位于 `$DSH_HOME/sessions/<workspace-path-encoded>/session-<uuid>/session.jsonl.zstd`。
- 浏览器端**已有官方选择会话的 API**：`ctx.sessions.open(id)`（`ISessions` 契约）。本仓库的 dsh-track 插件已经用它实现了 GUI 内的"跳回对话 + 滚动到指定消息"（`jumpToConversation`），可以直接复用这套调用序列。
- 从外部跳入有两条可行路线：
  - **路线 A（推荐，最轻）：URL 深链客户端插件**。新增一个小客户端插件，boot 后读取 URL 参数（如 `?open=<sessionId>&message=<messageId>`），等会话列表就绪后调 `sessions.open()`。终端侧只需 `open "http://127.0.0.1:3080/?open=<sessionId>"`。
  - **路线 B（服务器推送）：终端命令 → Host 插件 → 已打开的浏览器切会话**。Host 通过 `/api` RPC 或 WS/SSE mux 广播 `session/open` frame。工程量大（frame 分发在 `dsh-client-connection` 内部，三方插件不能轻易注册新 frame 类型），**不推荐**作为第一步。
- 会话的解析（"我知道标题 / 目录，不知道 id"）可以在终端侧直接扫 `$DSH_HOME/sessions/**/session.jsonl.zstd`（zstd 解压第一行 JSON 就有 `id`/`cwd`/`createdAt`），或用 host 已有的 `session-query`（SQLite 全文本索引，但当前只对浏览器客户端暴露）。

---

## 2. 关键事实与来源

### 2.1 URL 与路由现状：没有深链

- Web 入口：`dsh --profile web` 只解析 `--host / --port / --trusted-host`（`@deepseek-ai/dsh-web-app` 的 `startup.js`，[web-app README](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/bundle/web-app/README.zh.md)）。**没有** `--open <session>` 之类的命令行。
- 前端 dist（`@deepseek-ai/dsh-web-frontend/dist/assets/index-*.js`）全量 grep：无 `location.pathname`、`location.hash`、`URLSearchParams` 的路由逻辑；唯一命中 `hashchange` 是通用事件名列表（DOM 库）。`/client` 等任意路径都回退到同一个 `index.html`（SPA fallback，实测 200）。
- 会话选择是**纯客户端内存状态**：刷新页面后回到"无会话"态（Workspace picker 大卡片，见 [ui-conversation README](https://github.com/deepseek-ai/DeepSeek-Harness/blob/master/packages/client/ui-conversation/README.md) 的 "The resident conversation shell survives no-session and session transitions"）。即：新开一个 tab 打开 GUI，默认不显示任何对话 —— 这正是深链要解决的空档。
- 官方确认无深链：ui-conversation README 的 Known Limitations 写明 *"The details panel has no entry point — … There is no Input/Output/Metadata switch, Prev/Next stepping, or **trajectory deep link**."*

### 2.2 会话标识与存储（终端侧可读）

- 格式：`SessionId(\`session-${randomUUID()}\`)`（`dsh-headless` 源码）。
- 磁盘布局（本机实测）：
  ```
  $DSH_HOME/sessions/--Users-chris-source-dsh-involute--/session-58550315-…/session.jsonl.zstd
  $DSH_HOME/storages/workspace.json   # workspace id → path + sessionIds 清单
  ```
- `session.jsonl.zstd` 解压后首行 JSON：`{"type":"session","version":0,"id":"session-…","createdAt":…,"cwd":"/Users/chris/source/dsh-involute","delegationDepth":0,"agentPreset":"standard"}`。终端工具可以直接 zstd 解压扫标题/目录/时间来找会话。
- Host 侧已有结构化查询：`session-query`（[docs/subsystems/session-query.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session-query.md)，SQLite 全文本索引），但当前入口是浏览器 RPC（`ctx.sessions.search`），对终端不可直接调用（除非新增 Remote 方法）。

### 2.3 客户端选择会话的官方 API（路线 A 的核心）

`@deepseek-ai/dsh-client-runtime` 的 `ISessions` 契约（`lib/types/client/contract/sessions.d.ts`）：

- `open(id: SessionId): void` — 选中一个会话为当前会话（必须已在列表里，未知 id 抛错）。
- `clear(): void` — 回到无会话态。
- `search(query, signal)` — 内容搜索。
- `fork(...)`、`binding(id)`、`list: ObservableSnapshot<SessionListState>` 等。

**现成先例**：dsh-track（本仓库）`src/client/right-panel.ts` 的 `jumpToConversation({sessionId, messageId})` 已经实现完整调用序列：`sessions.open(id)` → 轮询 `sessions.binding(id)?.session`（scope/binding 异步 mint）→ `pollUntil(session.getSnapshot().openState === 'open')` → 在历史窗口里找 `input-message:<messageId>` 节点并滚动/高亮。深链插件只需把它从"按钮点击"改成"URL 参数驱动"。

### 2.4 传输层与信任边界（路线 B 的依据）

- 浏览器 ↔ Host 传输由 `@deepseek-ai/dsh-client-connection` 提供（[docs/api-gateway.md](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/api-gateway.md)）：
  - `/api` — HTTP RPC 桥（node:http ↔ WHATWG fetch，SSE 流式响应）。
  - `/api/events.mux` — 浏览器 mux 流（SSE，可回退 WS）：Host 向浏览器推 frame（`session/projection`、`session/queue`、`question/resolved` 等，`dsh-host-apiproxy` 的 `broadcast()`）。
  - `/api/events.host` — 浏览器 → Host 的 WS。
- 信任边界 `isTrustedApiRequest`：loopback 或 `--trusted-host` 授权域 + 非 cross-site + 无 `Origin` 也放行（终端 curl 不带 Origin 时**可以通过** `/api`）。即：终端写一个 HTTP 客户端调 Host 的 RPC 在技术上可行。
- **路线 B 的难点**：mux frame 的客户端分发在 `dsh-client-connection`/api-gateway client 内部，按 `type` switch 路由；三方客户端插件没有公开的"注册新 frame 类型"入口。要做"Host 推送 → 浏览器切会话"，要么 fork/patch `dsh-client-connection`，要么退化为客户端轮询 —— 都比路线 A 重。

### 2.5 生态参照（社区已有同类插件）

- [awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness)（DSH 插件生态清单）。
- `@dawsondx/dsh-web-open`、`@studyzy/dsh-web-remote-access`（npm）等社区包偏"远程访问/打开 URL"，与本需求的"跳转到指定会话"不是同一件事，未发现现成的会话深链实现 —— 说明这是空白点，值得自己做。

---

## 3. 方案对比

| 维度 | 路线 A：URL 深链客户端插件 | 路线 B：Host 推送切会话 |
|---|---|---|
| 用户操作 | `jump <sessionId>` → 浏览器打开（新 tab 或复用 tab） | `dsh-open <sessionId>` → 已打开的 GUI 直接切过去 |
| 改动范围 | 一个客户端插件（可放本仓库）+ 终端一行 `open`/脚本 | Host 插件 + 客户端 frame 处理（需触碰 connection 内部或轮询）+ 终端 CLI |
| 对已打开 GUI 的支持 | 新 tab 打开即定位；同 tab 粘贴 URL 也可（监听 `popstate`） | 无需新 tab，原地切换 |
| 依赖官方 API | 只有 `sessions.open`（稳定契约） | 依赖未公开的 frame 扩展点 |
| 工作量 | 小（半天到一天，dsh-track 先例可抄） | 中到大 |
| 风险 | 低 | 中（升级 rc 版本可能破坏内部 frame 处理） |

**建议：先做路线 A**，把"会话 → URL → 打开即定位"打通；路线 B 留作后续增强（如果确实需要"原地切换已开着的 tab"，再评估轮询或 patch connection）。

---

## 4. 落地建议（路线 A 实现草图）

### 4.1 URL 约定

```
http://127.0.0.1:3080/?open=<sessionId>[&message=<messageId>]
```

- `open`：目标会话 id（`session-<uuid>`）。
- `message`（可选）：定位到某条用户消息（dsh-track 已用 `input-message:<messageId>` 的 flow key 定位并高亮）。
- 用 query 参数而非 hash/path：现有 SPA 对未知 path 全部回退 index.html，query 参数不影响静态服务；客户端插件读 `new URL(location.href).searchParams` 即可。

### 4.2 客户端插件要点（放在本仓库，dsh-track 或独立小插件）

1. 插件 `inject: ["sessions", …]`（参照 dsh-track 的 right-panel 注入清单；cordis 对未声明服务访问会抛错）。
2. boot 时与 `popstate`/`hashchange`（以及必要时 `setInterval` 兜底）时读 URL 参数。
3. 命中 `?open=` 后：等 `sessions.list` 出现该 id（`open()` 对未知 id 会 loud-fail，先确认在列表里，或重试到列表就绪）→ `sessions.open(id)` → 复用 `jumpToConversation` 的轮询 + 滚动逻辑。
4. 定位完成后可选地把 URL 规整成 `?open=<id>&message=<id>`（或清掉参数），避免刷新时重复跳。

### 4.3 终端侧入口（jump 集成）

- 最简单：shell 别名/函数
  ```sh
  # dsh-open <sessionId> [messageId]
  dsh-open() { open "http://127.0.0.1:3080/?open=$1${2:+&message=$2}"; }
  ```
- 更顺手：一个小 CLI（可做成 `dsh plugin` 无关的独立脚本）：
  1. `jump list [query]`：扫 `$DSH_HOME/sessions/**/session.jsonl.zstd`（`zstd -dc | head -1` 取 `id`/`cwd`/`createdAt`，标题从 session/title 事件或 host 的 title fold 取），按 cwd/标题模糊过滤。
  2. `jump open <id|query> [messageId]`：解析出 id 后调 `open "…/?open=…"`。
- 注：`$DSH_HOME` 默认 `~/.dsh`（本机 slot-b 布局是 `~/.dsh/source/slot-b`，正式部署时从 `$DSH_HOME/sessions` 读；多 slot / A-B 并存时按 `settings.yaml`/运行中的端口区分，或直接读运行中实例的 `DSH_WEB_URL`）。

### 4.4 后续增强（可选）

- **路线 B**：若需要"终端命令让已开着的 tab 原地切会话"，评估两条支路：
  1. Host 注册一个 `/api` RPC channel（`ctx.connection.rpc.handle(channel, handler)`），客户端插件定期（或 SSE 长连）拉"最近一次外部 open 请求"并调 `sessions.open` —— 不碰 connection 内部；
  2. 给官方提 feature：在 `dsh-client-connection` 增加可注册的 frame 类型，届时直接推 `session/open`。
- **深链收口到官方**：`docs/api-gateway.md` 的 Remote 机制允许 Host 暴露 `sessions.search/list` 给终端（加一个 `@Remote` 方法），终端 CLI 就能走官方 API 解析会话而不碰磁盘文件。

---

## 5. 主要来源

- [deepseek-ai/deepseek-harness（GitHub，公开）](https://github.com/deepseek-ai/deepseek-harness)
- [docs/api-gateway.md（Typert Remote / `/api` RPC / Connection 传输）](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/api-gateway.md)
- [docs/subsystems/session-query.md（会话查询词汇）](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session-query.md)
- [docs/subsystems/session-reference.md（`dsh-session:` 跨会话引用）](https://github.com/deepseek-ai/deepseek-harness/blob/master/docs/subsystems/session-reference.md)
- [packages/client/ui-conversation/README.md（会话 UI；"no trajectory deep link"）](https://github.com/deepseek-ai/DeepSeek-Harness/blob/master/packages/client/ui-conversation/README.md)
- [packages/bundle/web-app/README.zh.md（web 启动参数、URL line、DSH_WEB_URL）](https://github.com/deepseek-ai/deepseek-harness/blob/master/packages/bundle/web-app/README.zh.md)
- 本地安装包源码（slot-b `0.1.0-rc.6`）：`dsh-web-frontend`（dist bundle）、`dsh-client-runtime`（`ISessions` 契约、`conversationContextKey`）、`dsh-client-connection`（`/api`、`events.mux`、`events.host`、`isTrustedApiRequest`）、`dsh-host-apiproxy`（`broadcast()`）、`dsh-web-app`（`startup.js`）、`dsh-headless`（SessionId 格式）
- 社区生态：[awesome-deepseek-harness](https://github.com/0xsline/awesome-deepseek-harness)
- [dsh-session-link（npm，Codex 式会话深链 + 快照注入）](https://www.npmjs.com/package/dsh-session-link)

---

## 6. 多会话联动 / 上下文互带生态调研（2026-08）

"跳转到历史会话"（人看）与"上下文互带"（模型读）是正交能力。后者（多会话联动）在生态里分两类：

### 6.1 显式引用（用户主动，快照注入）

- **官方服务**：`@deepseek-ai/dsh-session-reference` —— `dsh-session:<base64url>` 规范 URI + `@[label](dsh-session:…)` mention（Claude Code 式），解析后把源会话只读快照注入提示词（每源 ≤64 KiB、字节预算保留、自引用/超预算容错）。这是"@其他 session"的官方实现底座。
- **Codex `@` 的关系**：Codex 的 `@` 引用**文件/目录**（`@path`），Claude Code 的 `@` 引用文件/文档；dsh 的 `@[label](dsh-session:…)` 是**会话**引用。三者是同一类"上下文注入"机制，只是目标对象不同（文件 vs 会话）。dsh-session-link 的快照注入 = 官方 session-reference 服务的 UI/协议封装，不是独立机制。
- **社区封装**：[dsh-session-link](https://www.npmjs.com/package/dsh-session-link)（`dsh://` 链接 + 跨对话粘贴读上下文）。

### 6.2 自动召回（插件记忆，无需用户主动）

"上下文带或不带"的自动侧 —— 社区已有一批跨会话记忆插件：

| 插件 | 方向 |
|---|---|
| [dsh-memory](https://www.npmjs.com/package/@chenhw7/dsh-memory)（chenhw7） | 跨会话记忆 |
| [dsh-task-memory](https://github.com/wangyihao0001-oss/dsh-task-memory) | 任务隔离长期记忆（remember/recall/search 限定任务边界） |
| [StrataGate-AgentMemory](https://github.com/diqierjia/StrataGate-AgentMemory) | 本地跨会话记忆：自动捕获、Event/Element 卡片、证据门控召回、来源追溯 |
| [dsh-honcho-sync](https://socket.dev/npm/package/@nanpaidashi/dsh-honcho-sync) | Honcho 记忆同步 |
| dsh-tdai-memory / meow-memory / [dsh-mnemon](https://raw.githubusercontent.com/omdsh-dev/dsh-mnemon/main/README.md) | 同类记忆插件 |

另外官方 GUI 本身有**"跨会话召回"渲染**（ui-conversation README：recalled session 以 `跨会话召回` 角色行展示，非 user 消息折叠披露），说明官方 UI 已为"召回会话"留了展示位。

### 6.3 对 dsh-track 深链的含义

跳转场景不需要 6.1/6.2 的任何能力（人是直接看历史会话，不经模型）。若未来要做"从 terminal 跳入并把上下文带给当前对话"，那是 6.1 显式引用的活（`dsh-session:` mention 已是官方标准）。

### 6.4 与 dsh-session-link 共存（2026-08 分析）

同时安装本插件的深链与 [dsh-session-link](https://www.npmjs.com/package/dsh-session-link) **不会冲突**：

- **匹配范围几乎不重叠**：session-link 只匹配 `^/s/([^/]+)$`（单段，boot 时同步执行一次，不监听 popstate/hashchange，不滚动不改 URL）；我们匹配 `/s/<id>[/<msg>]` + `?open=`（boot + popstate + hashchange）。重叠区只有 `/s/<id>`。
- **重叠区幂等**：双方都调 `ctx.sessions.open(id)`，底层 `manager.select(id)` 只做同步赋值 + 一次 `notifyNow()` 广播，不重建 binding、不清 chat 窗口、不重挂载（React `key={sessionId}` 相同）—— 第二次 open 只是温和的重复通知，不打断第一次触发的加载/滚动流程。
- **加载顺序**：`window.__DSH_BOOT__.entries` 数组顺序 = profile 插件行序（`dsh plugin add` 默认 append 到末尾）。先后无关紧要：最终 `selected` 是同一个会话，滚动定位由我们完成。
- 若只需跳转定位，装我们一个即可（覆盖深链 + 消息级 + `?open=`）；session-link 额外提供复制按钮/`dsh://` 协议/跨对话快照注入，两个一起装也安全。
