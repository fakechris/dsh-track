# HANDOFF — 日历纱线 v2（三 tab + 需求节点 + 全项目）部署（2026-08-17）

## 修复（用户四连击）
1. 三 tab 完整原型：日历纱线/矩阵/会话表 + 头部计数 + 项目筛选 chips + 只看缠绕/跨天
2. 项目事实：link-all 无 cwd 时遍历全语料 distinct cwds 建图 + 归纳全部项目；
   calendar 覆盖全部项目（dsh-track/harness-ops/harness…）
3. 纱线节点 = 需求（issue/capture），会话虚线串起；金环=缠绕；点节点跳转需求 prompt
4. 日期窗 = 数据实际范围（无空头日期）；样式对齐 mock（暗色 tokens/chips/tab 下划线）
- 分支 feat/calendar-yarn @ 04a6304；269/269 单测

## 重启后验收
1. 硬刷新 →「会话结构图」= 三 tab 暗色视图
2. POST /api/track/graph/link-all {}（无 cwd）→ 全部工作区建图 → 项目数应 >1
3. GET /api/track/calendar → requirements 数组 + 多项目
4. push + PR #76