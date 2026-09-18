# HANDOFF — 日历纱线按修正版重构（2026-08-18）

## 用户反馈
效果差的原因不在数据，而在可视化按 mock 均匀分布假设设计；真实数据是幂律的。

## 已按 /Users/chris/Downloads/track-calendar-fixed.html 重构 YarnView
- 泳道按事件量降序 + 零活动仓库折叠「其他 ×N」+ 未归属最后
- 列宽/行高自适应铺满（ResizeObserver）
- 格内贪心螺旋装填（pack 零重叠）
- 同 session 需求串贝塞尔灰线 + 跨泳道金色菱形
- 删节点金环 + 「只看缠绕线」线级过滤 + 顶部统计
- 点节点/线 → SegmentDrawer（◆需求 ▷指示 ✓⊘✕）

## 数据调查（前一 commit 6653368）
- 需求层跨项目 = 0 是真实事实（dsh-track 主会话前 14 需求全在 dsh-track，后段才碰 test-fakechris）；归属修复让数据更准（attributed 5），不伪造跨项目

## 验收
1. 硬刷新 3080 → 泳道按事件量排、空仓折叠、节点零重叠、会话灰线 + 金色菱形切换点
2. 顶部统计显示缠绕线数；「只看缠绕线」过滤
3. 点节点/线 → 底部抽屉段序列

---

# HANDOFF — 会话结构图修复（2026-08-21）

## 用户反馈（两条）
1. 空状态文案「先在右侧 Track 面板点『构建』生成会话图」指向的按钮**不存在**（#80 移除 DOM-hack 图页时连同「构建/全构建」按钮一起删了，click handler 成了死代码）；用户要求按钮放在 session graph 面板内。
2. 「更新之后，所有日历纱线数据都丢失了」——根因是 **projects 表被清空**（induceProjects 的 prune 在某次 graph 集缺 repo 时把项目全删了），导致 yarn 全部塌缩为「未归属」单泳道（当时 7 sessions / 0 缠绕 / 需求 9）。

## 本次改动
- `src/client/graph-view.tsx`：会话结构图 tab 顶部新增工具栏「构建当前会话」（POST /api/track/graph）+「构建全部会话」（POST /api/track/graph/link-all，一键 全工作区 graph+links+projects+attribution）；空状态文案改为指向本面板按钮。
- `src/client/right-panel.ts`：导出 `buildCurrentGraph`，新增 `buildAllWorkspaces`。
- `src/graph/calendar.ts`：**自愈项目泳道**——projects 表为空/过期时从 graph header.repos 现场反推 repo-project id + 名字（确定性 id，与 issue.projectId 一致），不再塌缩为未归属。
- `tests/calendar.spec.ts`：新增自愈回归测试（300 tests 全绿）。
- `tsconfig.worktree.json`：**npm 轮换后 slot-a 失去 packages/ 源码树，旧 paths 全部失效**；已重写指向 rc.1 profile 已安装包类型（`~/.dsh/source/slot-a/profiles/node_modules/@deepseek-ai/*/lib/types`）+ staging 的 react/types（该文件被 .gitignore，属本地生成物）。构建命令：`DSH_SOURCE=~/.dsh/source/staging-20260809T141636Z DSH_TSCONFIG=tsconfig.worktree.json pnpm run build`。

## 数据修复（无需重启，已生效）
- 对运行中 3080 执行 `POST /api/track/graph/link-all {"max_sessions":200}`：**8 个 project 重新归纳**、163 个 graph（1 built / 162 fresh）、165 条 link、8 issue 归属修正。
- 验证：`/api/track/calendar` 现在 8 projects（dsh-track/test-fakechris/dsh-harness-ops/brew/gstack/…）、163 sessions、33 缠绕；GUI 会话结构图显示 108 user sessions · 32 缠绕 · 多泳道。

## ⚠️ 待办：host 侧 calendar.ts 自愈需要重启 3080 才生效
- 当前运行中的 server 仍是旧 buildCalendar（projects 表已恢复所以纱线正常）；**重启后** calendar 自愈才会激活（防止 projects 表再被清空时塌缩）。
- 重启会杀死 agent 运行时，本会话未替你执行。确认重启时先读本文件，然后：
  `sh skills/dsh-session-recovery/scripts/restart-dsh-web.sh`（或 `dsh web` 常规重启）
- client 改动已同步进 slot-a vendored 副本，**浏览器硬刷新（Cmd+Shift+R）即可看到构建按钮与新纱线**。

## 证据纪律
- 本次链路：确定性图（graph/links/projects 由 store 事实推导）与语义层分离；link-all 写入的 links 均为确定性方法；project 归纳 id 为 repo URL 哈希（可重复验证）。
