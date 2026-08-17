# HANDOFF — 日历纱线可视化部署（2026-08-17）

## 内容
- PR #74 已 squash merge 进 main（7067d5a）
- 新分支 feat/calendar-yarn @ 26b1c7d：日历纱线视图替换力导向图
  - 主视图：x=自然日 18 列、y=项目泳道，每 session 一根线（活跃日节点大小=事件量、
    金环=当日跨项目、虚线=间歇天、线尾终止标记）
  - 下钻：段条按项目着色，◆需求/▷指示/✓⊘✕ turn 结局/⚙工具轨迹（Trajectory 风格）
  - 会话表：首个需求/需求数/指示数/切换数/缠绕
  - 关键节点可点跳转对话（jumpToConversation）
- host：graph/calendar.ts buildCalendar + GET /api/track/calendar?cwd=
- builder v3：turn 节点记录 outcome + 全区间；269/269 单测

## 重启后验收
1. 硬刷新 →「会话结构图」tab = 日历纱线（暗色）
2. link-all 重建 v2→v3 图（turn 结局出现）
3. curl /api/track/calendar?cwd=/Users/chris/source/dsh-involute
4. 点 ◆/▷/会话行 → 跳转对话
5. push + PR