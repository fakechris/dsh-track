# Track 自动维护机制设计（auto-maintenance）

> 目标：capture → issue → done 管线持续自动运行，不再靠突击式手动 sync。
> 原则（2026-08-14 讨论 + 调研结论 docs/research-task-state-machine.md）：
> 1. 机器只提议完成/取消（pendingConfirm），用户确认是最后一关（done/canceled 状态门控）
> 2. 确定性规则可以自动执行（标题去重、capture 促转），LLM 判定保持人工/按需触发
> 3. 所有自动动作留审计痕迹（audit 表 + 日志）

## 三个自动循环（同一个 6h 定时器，全部确定性、零 LLM 成本）

- 循环1 生命周期 sweep：重估所有 in_progress issue（完成证据→done 提议；14d 无进展→canceled 提议；闲置>2d 且无证据→review 提议）。写 pendingConfirm，不改 state，用户面板确认/驳回
- 循环2 capture triage：open capture 内容精确等于某 issue 标题 → 自动促转；>14d 未促转的 stale capture 计数上报
- 循环3 精确重复归并：非终态 issue 按 normalized title 分组，>1 的组把后序归并进最早 identifier（union 会话），源置 canceled。仅精确同名才自动（机械判定）；近似重复只记日志不自动

定时器：web 启动即跑一次 + 每 6h（SWEEP_INTERVAL_MS）。

## 触发式路径（LLM 重，保持按需）

- v2 sync（track_sync_history / POST /api/track/sync）：从会话提取新任务 + 促转匹配 capture。不建议定时自动跑：内存峰值曾压垮 3080（本机 swap 长期 14/14GB）、每轮 600k+ tokens。建议每周一次 + 用户主动触发，maxSessions 限额
- 待确认消化：面板「待确认」区一键确认完成/取消/驳回——用户侧唯一的手动闭环

## 自动状态迁移规则（回答『怎么自动变成确认完成或其他状态』）

1. todo → in_progress：证据足够（活动/回合完成/模型提议）→ 自动提交（可逆，已实现）
2. in_progress → done_candidate：todo 全完成 + 回合正常结束（或用户说『可以了』）→ pendingConfirm.done，等用户确认（已实现；调研结论：todo 全 done 只作守卫）
3. in_progress → canceled_candidate：14d 无进展 → pendingConfirm.canceled（已实现）
4. in_progress → review_candidate：闲置>2d 且无任何生命周期证据（sync 建 issue 典型形态）→ 面板三按钮：确认完成/确认取消/还在做（已实现）
5. duplicate → merged/canceled：精确同名自动归并（本轮新增）
6. open capture → promoted：标题精确匹配已有 issue 自动促转（本轮新增）

## 讨论中的可选项（未实现，等拍板）

- auto-confirm canceled：pendingConfirm.canceled 悬挂 >N 天无人处理 → 自动确认取消（垃圾回收语义；与 done 必须人确认不同，canceled 自动化风险低——需用户点头才开）
- 定时 v2 sync：配置 daily/weekly + maxSessions 上限 + 内存告警时跳过
- 近似重复提议：sim≥0.55 的组 → 面板「疑似重复」区（而非自动归并），一键归并
- 面板 stale capture 提示：捕获想法区标题显示待整理数

## 验收（2026-08-14 落地）

- 本轮 PR：mergeIntoCanonical + triageCaptures + autoMergeExactDuplicates + POST /issues/:id/merge + 维护循环接线
- 238 tests 全过；部署后 15 个已完成 capture 已删、7 组重复 issue 归并
- 现场效果：启动日志 `[dsh-track] capture triage: N promoted, M stale of K open` / `dup-merge: X merged into Y canonical(s)`