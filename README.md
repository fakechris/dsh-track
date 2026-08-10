# dsh-track — Track Bridge

DeepSeek Harness 插件：嵌入式任务管理引擎。零外部依赖，数据面全部在 harness 内
（session 事件 + storage KV）。参考设计见 [`docs/track-bridge-plugin-plan.md`](docs/track-bridge-plugin-plan.md)。

## 定位

- **Fat skill + thin harness**：决策点判据/协议在 [`skills/dsh-track/SKILL.md`](skills/dsh-track/SKILL.md)；
  harness 只注册 `report_decision_point` / `capture_thought` / `track_*` 工具，不做判断。
- **方案 C 存储归位**：决策点/todo 留 session 事件（可回放）；Capture/Issue/Epic/关联存
  `ctx.storage` KV（跨 session 独立）；KV 数据为 **Linear 兼容形状**（随时可迁）。
- **Web UI 侧边栏**（规划中）：汇集墙 + 决策点待确认角标。

## 安装

```sh
# 从 GitHub 安装（需 dsh 内测环境）
dsh plugin --profile web add github:dsh-external/dsh-track

# skill 装入默认扫描目录
mkdir -p ~/.dsh/skills && cp -r skills/dsh-track ~/.dsh/skills/

# 重启 dsh web，工具自动挂载
dsh web
```

## 工具

| 工具 | 作用 |
|---|---|
| `capture_thought(content, tags?)` | 把念头零摩擦收进汇集墙 |
| `report_decision_point(question, options, my_preference, rationale, impact, need)` | AI 遇到不可逆/风险/范围/验收决策时上报，用户轻决策回答 |
| `track_create_issue(title, description?, priority?, acceptance?, parent_id?)` | 创建 Linear 兼容 issue |
| `track_list_issues(team_id?, state?)` | 列出 issue |

## 开发

```sh
pnpm install
pnpm run build      # tsc 产物 lib/
pnpm test           # vitest
```

## 目录

```
src/index.ts        host 插件：工具注册 + 事件订阅 + store 接线
src/store.ts        TrackStore：KV 单元封装（串行写链）
src/types.ts        Linear 兼容数据形状
skills/dsh-track fat skill：决策点判据/格式/纪律
cordis.patch.yml    bundle patch（dsh plugin add 自动应用）
```
