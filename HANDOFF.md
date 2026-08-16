# HANDOFF — M3 修复 + 重建部署（2026-08-16 第二轮）

## 修复内容
- GRAPH_VERSION=2：旧 v1 图（无 lastActivityAt）在 freshness 检查中判为 stale → 自动重建
- commits.ts：lastActivityAt 缺失时回退到 header.createdAt（保守，无窗口）
- 分支 feat/session-graph-m1 @ df60dc4；261/261 单测 ✅

## 部署状态
- lib/ 已同步 vendored；host 改动需重启 3080

## 重启后验收
1. POST /api/track/graph/link-all {cwd} → 应重建 v1→v2 图（built 数 > 0）
2. POST /api/track/git/scan {cwd} → landed-in/implements 链接数应 > 0
3. GET /api/track/commits → commit 列表
4. 验收后 push（PR #74）