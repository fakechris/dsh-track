# dsh-track — Track Bridge
[English](README.en.md) | 中文


DeepSeek Harness 插件：嵌入式任务管理引擎。零外部依赖，数据面全部在 harness 内
（session 事件 + storage KV）。参考设计见 [`docs/track-bridge-plugin-plan.md`](docs/track-bridge-plugin-plan.md)。

## 定位

- **Fat skill + thin harness**：决策点判据/协议在 [`skills/dsh-track/SKILL.md`](skills/dsh-track/SKILL.md)；
  harness 只注册 `report_decision_point` / `capture_thought` / `track_*` 工具，不做判断。
- **方案 C 存储归位**：决策点/todo 留 session 事件（可回放）；Capture/Issue/Epic/关联存
  `ctx.storage` KV（跨 session 独立）；KV 数据为 **Linear 兼容形状**（随时可迁）。
- **Web UI 侧边栏**（规划中）：汇集墙 + 决策点待确认角标。

## 安装

```sh
# 从 GitHub 安装（需 dsh 内测环境）
dsh plugin --profile web add github:dsh-external/dsh-track

# skill 装入默认扫描目录
mkdir -p ~/.dsh/skills && cp -r skills/dsh-track ~/.dsh/skills/

# 重启 dsh web，工具自动挂载
dsh web
```

## 工具

| 工具 | 作用 |
|---|---|
| `capture_thought(content, tags?)` | 把念头零摩擦收进汇集墙 |
| `report_decision_point(question, options, my_preference, rationale, impact, need)` | AI 遇到不可逆/风险/范围/验收决策时上报，用户轻决策回答；自动存入决策账本 |
| `track_respond_decision(decision_id, choice, rationale?)` | 用户回答后落盘选择与理由（幂等；`dismissed` 表示跳过） |
| `track_list_decisions(state?, since?, session_id?)` | 查决策历史（含待确认/已回答/已跳过） |
| `track_attach_issue(issue_id)` | 声明当前会话正在推进某 issue；此后执行证据自动记到该 issue |
| `track_update_issue_state(issue_id, target, note?, confirmed_by_user?)` | 提议/确认状态变更；done/canceled 必须带 `confirmed_by_user=true`（系统永不自动标 done） |
| `track_issue_evidence(issue_id)` | 查某 issue 的证据账本与推断状态 |
| `track_create_issue(title, description?, priority?, acceptance?, parent_id?)` | 创建 Linear 兼容 issue |
| `track_list_issues(team_id?, state?)` | 列出 issue |
| `track_sync_history(workspace?, since?, dry_run?, max_sessions?, engine?)` | 把工作区 session 历史折叠成 epic/issue 候选（默认 dry-run） |
| `track_usage(since?)` | 报告 track 引擎发起的 LLM 调用开销：请求数、input/output/cache/reasoning token、耗时、估算成本（按模型分路由） |
| `track_backfill_captures()` | 存量捕获 context 回填：把动机链功能（PR #20）之前产生的无 context open capture，从源 session 日志补最近用户显式请求；幂等 |

## 决策账本（decision ledger）

决策点是 track 里价值最高的数据之一——用户在某次取舍上的**选择与理由**。
`report_decision_point` 上报时预分配 id 并写入 KV `decisions` 表，返回文本首行
`Decision recorded: dec_xxx` 作为会话里的稳定指针（不写 session 自定义事件，
遵守 20260811 起的会话日志边界约定）；用户回答后由模型调用
`track_respond_decision` 落盘（`choice='dismissed'` 表示跳过）。查询面：
`track_list_decisions` 工具、`GET /api/track/decisions`、面板（规划中）、
funnel 的 `decisions.answerRate`。保留期独立于会话日志（KV 本就不随会话删除）。

## 任务生命周期（evidence-driven lifecycle）

本地运行时没有结构化 CI/deploy 信号（git/构建都走 bash），所以 `done` 不能靠
"看起来做完了"自动达成。设计（2026-08-12，对应外部研究 Q3）：

- **双字段**：`state`（已确认的真相，Linear 4 值）vs `inferred`（机器提案：状态+置信度+证据账本）。
- **证据观察器**（`lifecycle/observe.ts`）把结构化事件流（todo 全量快照、turn/end reason、
  tool 错误、文件活动、用户确认短语）转成 EvidenceRef，只对**当前 attach 的 issue** 记录。
- **状态机**（`lifecycle/state-machine.ts`，纯函数）：唯一自动落盘的是可逆的
  todo → in_progress；**done / canceled 永远需要用户确认**（面板/`confirmed_by_user=true`），
  14 天无进展会提议取消。模型侧入口：`track_attach_issue` / `track_update_issue_state` /
  `track_issue_evidence`（SKILL.md「任务推进」纪律）。

## 捕获动机链（capture motivation context）

自动捕获（`capture/observe.ts`）从结构化工具流抓取执行信号（todo_write 首条、
git 分支创建）。为避免捕获墙变成「无上下文的琐碎动作清单」（如「调研 StreamChunk
usage/token 字段」而不知是「为了实现成本计量」），每条捕获携带 **context = 该会话
最近一条用户显式请求**（`source.kind === 'user'`）：

- 实时：observer 维护 per-session 缓存，捕获时写入（A）
- 续接会话（重启后 splice）：`seedContext` 从持久化日志回填最近用户请求（#21）
- 存量：`track_backfill_captures` 一次性回填 PR #20 之前的旧捕获（#22）

context 在 v2 管线三处消费：synthesize 时喂给 LLM（标题从执行层升到需求层，
如「调研 StreamChunk…为 LLM 用量记录模块做准备」）；align 时 `captureOverlaps`
匹配 content OR context（执行层捕获映射到需求候选）；同 context 的多个捕获
整组 promote（一个需求的碎片一次 fold，不留孤儿）。

## LLM 用量账本（usage ledger）

track 的 v2 同步引擎（`engine: 'v2'`）会直接调用 harness 的 `ctx.llm` 做语义判断
（意图分层 / 候选合成 / 关系分类）。这类插件直连调用不产生 session 事件，harness 全局
token-meter 看不到，因此 **track 在 `src/sync/llm.ts` 的唯一汇聚点自行计量**：

- 每次流式调用记录一条 `LlmUsageRecord`（`usage` KV 表）：时间、调用点 label、
  provider/model、`inputTokens` / `outputTokens` / `cacheReadTokens` / `cacheWriteTokens` /
  `reasoningTokens`、结束原因（stop/max-tokens/error/aborted）、耗时；`llmJson` 的每次
  重试 attempt 各记一条（一次重试 = 一次真实请求）。
- 查询入口：`track_usage` 工具（模型可直接问"track 花了多少 token/钱"）与
  `GET /api/track/usage?since=<epoch-ms>&limit=<n>`（汇总 + 最近明细）。
- 成本估算按 `src/usage.ts` 的 `PRICING` 表（每百万 token 美元）：内置
  `deepseek-official` 官方价（2026-08-01 验证：`deepseek-v4-flash` 输入 $0.14/1M、
  cache hit $0.0028/1M、输出 $0.28/1M；`deepseek-v4-pro` 输入 $0.435/1M、cache hit
  $0.003625/1M、输出 $0.87/1M）。不在表内的路由仍计数 token，成本标记为 unpriced。
- 计量是 fire-and-forget 观测面：写入失败只记日志，绝不影响 sync 主流程；无 llm
  service / 无 recorder 时零成本降级。

## 开发

```sh
pnpm install
pnpm run build      # tsc 产物 lib/
pnpm test           # vitest
```

## 与 Session 日志的边界（插件事件约定）

> 背景（2026-08-11 事故）：dsh-track 早期版本往会话日志写自定义事件（`track/decision`、
> `track/sync-preview`）。0811 快照起，harness 的会话事件白名单（`KNOWN_SESSION_EVENT_TYPES`）
> 是编译期从仓库内 `SessionEventMap` 生成的，**外部插件事件结构上就不在其中**；读取器对
> 未知类型且无 `ignorable` 标记的事件**拒读整份日志**（宁可拒读不误读，防"新 harness 写入"
> 被静默错读）。这导致 6 个旧会话在新 harness 上打不开（已用 `repair-unknown-events.mjs`
> 加 `ignorable: true` 修复，内容零丢失）。

**规则（必须遵守）：**

1. **业务数据不进 session 日志**——任务/issue/决策/用量等持久化数据写自己的 storage
   （本插件即 TrackStore KV），不要 append 自定义 session 事件。
2. **观察会话走官方事件**——监听 `session/event` 等官方结构化事件流，只读不写。
3. **不写 session 自定义事件**——官方注册面（"registration surface"）已明确 deferred，
   等真实消费方出现才可能开放；在那之前写入即"未知类型"，会制造旧会话读不了的问题。
4. 若确需旁路数据（审计/预览/缓存，丢了无妨），**必须带 `ignorable: true`**——该标记的
   语义就是"此事件可跳过、不影响会话重建"，**不可用于承载关键数据**。
5. 存量旧日志含未知事件 → `dsh-session-recovery` skill 的
   `repair-unknown-events.mjs --id <session-id>`（或 `--all`）加 ignorable 标记修复。

## 目录

```
src/index.ts        host 插件：工具注册 + 事件订阅 + store 接线
src/store.ts        TrackStore：KV 单元封装（串行写链）
src/types.ts        Linear 兼容数据形状
src/usage.ts        LLM 用量账本：recorder 工厂 + 汇总 + 成本估算 + 渲染
src/sync/llm.ts     LLM 门面：统一流式 JSON 调用 + 用量计量埋点
skills/dsh-track fat skill：决策点判据/格式/纪律
cordis.patch.yml    bundle patch（dsh plugin add 自动应用）
```
