# HANDOFF — 会话结构图遵循 host conversation.view tab 规范（2026-08-17）

## 问题（用户反馈）
- 点 Chat/Trajectory tab 下划线高亮跟随激活 tab 走，但点「会话结构图」无状态变化
- 根因：之前是 DOM hack（mountTab 手工 clone button + setGraphMode 隐藏 chat scrollBody + 网格覆盖），完全绕开 host 的 tab 状态机制

## 修复（遵循规范，非复刻样式）
- 注册 conversation.view slot 条目（id: track-graph, label: 会话结构图），照 ui-trajectory 范式：
  host 自动渲染 tab / 管理 aria-selected 与下划线 / actions.setView 切换 / 只挂载激活视图
- 新增 src/client/graph-view.tsx（GraphView：fetch /api/track/calendar → CalendarYarnRoot，监听 track:graph-built）
- index.ts：ctx.slots.inject('conversation.view', ...) 注册
- right-panel.ts：删 mountTab/setGraphMode/graphview DOM 注入 + CSS（panel 保留）；构建按钮 dispatch track:graph-built
- 分支 feat/native-view-tab @ 143ee21；PR #80；276/276 单测；client bundle 96.07kB 已 rsync 到 3080（硬刷新即生效）

## 验收
1. 硬刷新 3080 → tab 条出现「会话结构图」，点击后下划线高亮跟随（与 Chat/Trajectory 一致）
2. 会话切换时 tab 状态保持（host 管理）
3. 右侧 Track 面板照常（FAB ◆ 打开）
