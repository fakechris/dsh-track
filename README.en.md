# dsh-track — Track Bridge

English | [中文](README.md)

DeepSeek Harness plugin: an embedded task-management engine. Zero external dependencies;
all data lives inside the harness (session events + storage KV). Reference design:
[`docs/track-bridge-plugin-plan.md`](docs/track-bridge-plugin-plan.md).

## Positioning

- **Fat skill + thin harness**: the decision-point criteria/protocol live in
  [`skills/dsh-track/SKILL.md`](skills/dsh-track/SKILL.md); the harness only registers
  the `report_decision_point` / `capture_thought` / `track_*` tools and makes no judgment.
- **Option-C storage**: decision points/todos stay in session events (replayable);
  Capture/Issue/Epic/links go into `ctx.storage` KV (independent across sessions); KV data
  is **Linear-compatible in shape** (migratable anytime).
- **Web UI sidebar** (planned): capture wall + decision-point pending badge.

## Install

```sh
# Install from GitHub (requires the dsh internal-test environment)
dsh plugin --profile web add github:dsh-external/dsh-track

# Install the skill into the default scan directory
mkdir -p ~/.dsh/skills && cp -r skills/dsh-track ~/.dsh/skills/

# Restart dsh web; the tools mount automatically
dsh web
```

## Tools

| Tool | Purpose |
|---|---|
| `capture_thought(content, tags?)` | capture a thought into the wall with zero friction |
| `report_decision_point(question, options, my_preference, rationale, impact, need)` | raise a decision point when the AI hits irreversible/risky/scope/acceptance decisions; the user answers with a lightweight choice |
| `track_create_issue(title, description?, priority?, acceptance?, parent_id?)` | create a Linear-compatible issue |
| `track_list_issues(team_id?, state?)` | list issues |

## Development

```sh
pnpm install
pnpm run build      # tsc artifacts to lib/
pnpm test           # vitest
```

## Layout

```
src/index.ts        host plugin: tool registration + event subscription + store wiring
src/store.ts        TrackStore: KV cell wrapper (serial write chain)
src/types.ts        Linear-compatible data shapes
skills/dsh-track    fat skill: decision-point criteria/format/discipline
cordis.patch.yml    bundle patch (auto-applied by dsh plugin add)
```
