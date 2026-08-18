# HANDOFF — 需求级项目归属修复（attributeIssuesBySpan）（2026-08-18）

## 背景（用户用修正版 HTML 指出）
- 19 条会话线里需求跨项目 = 0，但 36 个 session tool 层触碰 2-4 仓库
- 结论：抽取缺陷——issue.projectId 全绑 session 首个 repo（projects.ts repos[0]），需求级归属没做

## 修复
- repos.ts：新增 reposOfEventsInRange(events, start, end)——需求 span 窗口内触碰的仓库
- projects.ts：新增 attributeIssuesBySpan——issue 的 projectId = 它自己 span 窗口触碰的仓库；旧 issue 无 span 时按「该 session 下第 k 个需求」锚定第 k 条 user message 构造 span
- index.ts link-all：graph 构建后先跑 attributeIssuesBySpan（读事件），再 induceProjects
- 299/299 单测

## v4 修复
- repoTouch 存进 graph.header（构建时算好 seq→repo 索引），attributeIssuesBySpan 直接查表，不再 readSession（性能从超时→秒级）
- GRAPH_VERSION 6 强制全量重建

## v3 优化
- buildRepoTouchIndex + reposInRange 二分索引：每 session 一次构建，需求 span 二分查表（不再每 issue 全事件扫描）
- attributeIssuesBySpan 只处理多 repo session（单 repo 跳过），按 session 缓存事件，每 session 只读一次日志

## 重启后验收
1. 重启 3080（host 改动）
2. POST /api/track/graph/link-all {} → attributed > 0
3. GET /api/track/calendar → 需求层跨项目 > 0（同一 session 的需求分属不同仓库）
