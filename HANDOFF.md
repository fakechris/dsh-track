# HANDOFF — 图谱只占中间内容格、侧边栏保留部署（2026-08-17）

## 修复（用户反馈第四轮）
- 图谱 = grid-column 1 / grid-row 2（chat 消息的确切格子）+ z-index 10 + 实底，盖住 scroll body
- 绝不隐藏右侧边栏（Track 面板）——像 Chat 切换一样只换中间内容；tab 行不动
- 图 tab 不再关闭面板
- 分支 feat/session-graph-m1 @ 4d6f2dd

## 重启后验收
1. 硬刷新 → 打开右侧栏（FAB ◆）→ 点「会话结构图」：中间内容区换图，右侧栏和 tab 行保留
2. 切回 Chat：正常
3. push