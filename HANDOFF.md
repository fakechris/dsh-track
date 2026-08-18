# HANDOFF — 日历纱线：跨项目 session + 更多关联线（2026-08-18）

## 用户反馈
- 图很抽象，点之间几乎没有联系
- session 几乎只跟一个项目关联，和直觉不符

## 根因
- session.projects 只取 segments 的 proj（= issue.projectId = 第一个 repo），完全忽略 graph.header.repos（36 个 session 实际有 2-4 个 repo：dsh-track 主会话也碰 test-fakechris/harness-ops）
- 日历只画 forked-from（17 条），derives/executed-in 没接

## 修复
- calendar.ts：session.projects = graph.header.repos 全部 repo（映射到日历项目 id）；补 executed-in 跨会话连线（同一需求被多 session 执行 → 连接它们的节点）；CalLink kind 加 executed-in
- calendar-yarn.tsx：渲染青虚线(executed-in)；图例更新「泳道=会话触碰的全部仓库」
- 299/299 单测；bundle 100.74kB

## v2 修复
- executed-in 跨会话连线：同一 issue 在多个 session 各有节点，用 (id, toSession) 定位连接（修复 to===rid 跳过 bug）

## 重启后验收
1. 重启 3080（host 改动 calendar.ts）
2. 硬刷新 → 主 session 泳道显示多项目（dsh-track + test-fakechris + harness-ops）
3. 出现青虚线（跨会话共执行）
