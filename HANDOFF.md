# HANDOFF — 项目归纳改为 repo-touch（2026-08-17）

## 内容
- 问题：把 workspace 目录当项目（explorer 83 会话变成 1 个项目）；用户实际在 explorer 里改 track / harness-ops / 调试 dsh web
- 修复：项目 = 会话 tool call 实际触碰的 git 仓库（file_path / workdir / git -C 目标）
- repos.ts：pathsOfEvent → repoRootOf（含 worktree .git 文件解析，slot-a→test-fakechris）→ repoUrlOf → reposOfEvents
- service.ts：graph 构建时写 header.repos；freshness 要求 repos 存在（缺失即重建）
- projects.ts：induceProjects 按 header.repos 分组（repoProjectIdFor(url)，name=URL 尾段）；空 repos=[] 会话不映射（归 unk，不再创建 cwd 项目）；undefined repos（旧 fixture）回退 cwd
- prune：删除不再被 graph 引用的旧 cwd 项目（explorer/scripts/slot-a/坏 .git 产物）
- dangling 修复：无 repo 会话的 issue 清空 projectId；calendar 对未知项目 id 回退 unk
- store.ts：新增 deleteProject
- GRAPH_VERSION 5（强制全量重建）
- 已部署验证：projects = dsh-track / dsh-harness-ops / test-fakechris / turtle-ui / gstack / brew / dsh-skill-session-recovery / Involute；需求分布 test-fakechris 45 / dsh-track 26 / unk 23 / dsh-harness-ops 7；origin 99/39/13
- 分支 feat/repo-touch-projects；276/276 单测

## 验收
1. GET /api/track/calendar → 项目列表 = 真实仓库名，无 explorer/scripts
2. 硬刷新 → 左侧泳道 = 真实仓库；explorer 会话节点落到其触碰的仓库
