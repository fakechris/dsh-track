# HANDOFF — 日历纱线数据修复（需求定位 + 跨会话关联 + 节点语义）（2026-08-18）

## 用户反馈的三个问题
1. 圆点大小意义不明确
2. session 之间（源点之间）关联极少
3. 8/9 dsh-track 一串大圆点叠在一起，不理解

## 根因
- 95/96 个 issue 无 sourceSpan（旧数据）→ bounds 退化为 (0, MAX) → 所有需求共用第一条用户消息的日期、events=整个 session 节点数（3000-4500）→ 大圆点全部叠在 session 开始那天
- 跨 session 关联（forked-from 47 条 / derives 11 条）存在于 links 表但日历从未渲染

## 修复
- calendar.ts：需求按序分摊到用户消息（第 k 个需求锚定第 k 条 user message，bounds=[msg[k].seq, msg[k+1].seq)）→ 每个需求落在自己触发的消息那天、events=该段真实工作量；输出 CalLink[]（forked-from 紫线 / derives 黄虚线，两端都是日历节点时可见）
- calendar-yarn.tsx：渲染跨需求连线；radius 改为 log2 压缩（2.5..11px）；移除单需求会话无线门槛；图例更新「大小=该需求工作量」
- 新增测试：无 sourceSpan 需求按消息分摊到不同天
- 277/277 单测；client bundle 96.86kB

## 重启后验收
1. 重启 3080（host 改动 calendar.ts）
2. 硬刷新 → 8/9 的一串大圆点消失（需求分布到各自消息的天）
3. 出现紫线（子代理继承）与黄虚线（需求派生）
4. 圆点大小差异合理（log 压缩）
