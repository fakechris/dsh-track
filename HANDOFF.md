# HANDOFF — 会话来源分类（用户/子代理/自动）部署（2026-08-17）

## 内容（用户反馈：自动拉的 session 污染事实源）
- 分类规则：subagent（header.origin/delegationDepth）> user（有真实用户话语）> auto（零用户消息）
- 实测 151 会话：99 用户 / 39 子代理 / 13 自动
- calendar.ts：CalSession.origin + userMsgCount；CalRequirement.origin
- calendar-yarn.tsx：用户输入/子代理/自动 筛选 chips（自动默认隐藏）+ 头部计数
- 分支 feat/calendar-yarn @ 264eb41；269/269 单测

## 重启后验收
1. 硬刷新 → 视图头部显示 用户/子代理/自动 计数；自动会话默认被过滤
2. 点「自动」chip 可看被过滤的会话
3. push（PR #76）