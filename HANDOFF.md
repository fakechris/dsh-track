# HANDOFF — M3 git 落地关联部署（2026-08-16）

## M3 内容
- graph/commits.ts：扫描仓库 git log（注入式 runner，默认 execFileSync），持久化 commit，
  按会话活动时间窗对齐（landed-in）＋按标题 token 重叠/会话窗对齐 issue（implements）；dry-run
- types：CommitArtifact + commits 表 + Link 边 landed-in/implements + SessionGraph.lastActivityAt
- 入口：track_git_artifacts 工具（默认 dry-run，支持 project_level）+ POST /api/track/git/scan + GET /api/track/commits
- 分支 feat/session-graph-m1 @ 8e6a7a7（M1 f30635b + M2 1eb51dc + M3）；typecheck ✅ 261/261 单测 ✅

## 部署状态
- lib/ 已同步 vendored（graph/commits.js）；host 改动需重启 3080；client 无改动

## 重启后验收
1. POST /api/track/git/scan {cwd: /Users/chris/source/dsh-involute} → commits 计数 + landed-in/implements 链接数
2. GET /api/track/commits → commit 列表（sha/subject/authorAt）
3. track_git_artifacts 工具（dry-run 先看）
4. 验收后：push（PR #74 含 M1+M2+M3）