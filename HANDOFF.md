# HANDOFF — 软删除 + Output-first 交付度量（P0/P1/P2）部署（2026-08-18）

## 本次改动（已实现 + 290 单测全绿 + build 通过 + lib 已同步 vendored 副本）

### 1. 软删除（用户反馈：删掉 INV-154 后无任何记录）
- 删除 = 墓碑标记，绝不删数据：`Issue`/`Capture` 增加 `deletedAt/deletedBy/deletedReason`；store `deleteIssue`/`deleteCapture` 改软删（`purgeIssue`/`purgeCapture` 才是硬删，仅测试/清理用）
- 删除有强否定意义：`user-delete` 证据信号（weight -1）写进 issue 证据账本 + `track_delete_issue`/`track_delete_capture` audit 记录；identifier 永不复用
- 默认列表隐藏墓碑，`includeDeleted` 可查全记录；GET /issues 现在支持 `?includeDeleted=1`
- 文件：`src/types.ts`、`src/store.ts`、`src/index.ts`、`tests/soft-delete.spec.ts`（新）

### 2. P0 — Output 门禁（lifecycle 接 commit 证据）
- `commit-observed` 信号（weight 0.55）进状态机；done 提议现在要求 `todo-all-done + turn-completed + commit-observed`（或用户显式确认——确认文案会提示「无 commit 证据（确认无代码产出？）」）
- `track_git_artifacts` 扫描时把新鲜 implements 链接写进 issue 证据账本（幂等）
- 面板任务墙：done 且无 commit 证据 → 「⚠ 无落地」徽标；仅启发式关联 → 「≈ 弱证据」
- 文件：`src/lifecycle/state-machine.ts`、`src/graph/commits.ts`、`src/index.ts`（GET /issues 注解）、`src/client/right-panel.ts`

### 3. P1 — Link 证据分级（对齐 Better Harness）
- `Link` 增加 `evidenceKind (declared/observed/candidate/unmapped)` + `confidence` + `limitations`；`linkMethod` 语义修正（'deterministic' 旧默认已废，改为 trailer/commit-window/title-overlap）
- 置信度阶梯：trailer → declared 1.0；issue 自身 session 时间窗 → candidate 0.55；仅标题重叠 → candidate 0.25；landed-in 时间窗 → candidate 0.4（没有文件证据/工具观测，middle tier 暂缺——诚实标注 candidate，不冒充 observed）
- 面板图（会话结构图）边样式按证据强度：实线绿=声明 / 虚线琥珀=启发，图例+提示文案；谱系视图 commit 行带证据徽标
- 文件：`src/graph/commits.ts`、`src/graph/service.ts`、`src/graph/lineage.ts`、`src/client/right-panel.ts`

### 4. P2 — 显式链接通道 + committer time
- `git log -z`（新解析：多行 body 不再被 \n 拆坏）；`%cI` committer time 做关联锚点、`%aI` author time 仅展示
- commit body 类型化 trailer：`Track-Issue: INV-12` / `Harness-Session: <session-id>` → declared 1.0 显式链接，优先于启发式（explicitPairs 防重复）
- 文件：`src/graph/commits.ts`、`src/types.ts`（CommitArtifact +trailers/committedAt/body）

### 5. 研究文档
- `docs/better-harness-research.md`（Better Harness / Harness Inspector 完整研究 + 差距对照）
- 已建 issue INV-155（Output-first 度量，本 HANDOFF 即其实现）

### 6. 性能修复（重扫不再分钟级卡死）
- 实测发现：KV 后端每次 putRecord 都整文件原子写（track.json 47MB），旧扫描每写一条链接/commit 都全量写一次 → 一次真实扫描 ~460 次整文件写 = 4-8 分钟
- 修复：`scanProjectCommits` 预载 links/commits 一次，语义载荷（不含时间戳）相等则跳过写入（重扫近零写入）；P0 证据改 `recordIssueEvidenceMany` 批量（一次 loadAll + 每 issue 一次写）
- 验证：首次真实扫描后 links 已带 evidenceKind=candidate（229 条）、commits 带 committedAt/trailers；INV-153 已收到 commit-observed 证据（← 4dec1c80，P0 线上生效）；重扫应秒级完成

## 测试
- `vitest run`：29 files / 291 tests 全绿（新增 soft-delete 5 条、commits 10 条、P0 gate 用例、批量证据、compare-and-skip）
- typecheck + `pnpm run build`（DSH_SOURCE=slot-a DSH_TSCONFIG=tsconfig.worktree.json）通过

## 部署状态
- lib/ 已 rsync 进 slot-b vendored 副本（`~/.dsh/source/slot-b/profiles/node_modules/.pnpm/@fakechris+dsh-track@0.2.1_.../node_modules/@fakechris/dsh-track/lib/`）
- client 改动：硬刷新（Cmd+Shift+R）即生效
- host 改动（index.js/store.js/graph/commits.js 等）：**需重启 3080**（第一次重启已做，本次为性能修复后的第二次）

## 重启后验收
1. 面板任务墙：已 done 但无 commit 链接的 issue 出现「⚠ 无落地」徽标（存量 74 条）
2. 删除一个 issue：卡片消失，但 `?includeDeleted=1` 能查回完整记录；`track_issue_evidence` 可见 `user-delete` 证据
3. 会话结构图：landed-in/implements 边按证据强度着色（实线声明 / 虚线启发）
4. 跑一次 `track_git_artifacts` 或 git/scan：**重扫应秒级完成**（compare-and-skip），新链接带 evidenceKind/confidence；近期完成且 commit 在 24h 内的 issue 会收到 done 提议（commit-observed）
5. 谱系视图「代码落地」行带 声明/启发 徽标
6. 对存量 95 issue 重扫 dry-run，done-without-commit 数量应显性可见（INV-155 AC-5）

## 未做（留给后续）
- 提交未做（工作树有全部改动，未 branch/PR）——L4 流程由用户决定何时走
- 中间证据档（观测到 create-commit 工具调用 / 时间窗+文件重叠）需要 session 文件事实，暂缺——已诚实标 candidate
