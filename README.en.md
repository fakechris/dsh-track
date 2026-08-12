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
| `report_decision_point(question, options, my_preference, rationale, impact, need)` | raise a decision point when the AI hits irreversible/risky/scope/acceptance decisions; the user answers with a lightweight choice; auto-persisted to the decision ledger |
| `track_respond_decision(decision_id, choice, rationale?)` | record the user's answer (choice + rationale) after they respond; idempotent; `dismissed` to skip |
| `track_list_decisions(state?, since?, session_id?)` | read decision history (pending / answered / dismissed) |
| `track_attach_issue(issue_id)` | declare the current session is driving an issue; execution evidence is then recorded against it automatically |
| `track_update_issue_state(issue_id, target, note?, confirmed_by_user?)` | propose or confirm a state change; done/canceled require `confirmed_by_user=true` (the system never auto-marks done) |
| `track_issue_evidence(issue_id)` | read one issue's evidence ledger and inferred state |
| `track_create_issue(title, description?, priority?, acceptance?, parent_id?)` | create a Linear-compatible issue |
| `track_list_issues(team_id?, state?)` | list issues |
| `track_sync_history(workspace?, since?, dry_run?, max_sessions?, engine?)` | fold workspace session history into epic/issue candidates (dry-run by default) |
| `track_usage(since?)` | report LLM cost incurred by the track engine: request counts, input/output/cache/reasoning tokens, wall time, estimated cost per provider/model route |
| `track_backfill_captures()` | backfill motivation context on legacy open captures: fills the context of pre-#20 captures from their source session logs (most recent explicit user request); idempotent |

## Decision ledger

Decisions are among the most valuable data track holds — the user's **choice and
rationale** on each tradeoff. `report_decision_point` pre-allocates an id and
writes to the KV `decisions` table; the first line of the returned text
(`Decision recorded: dec_xxx`) is the stable pointer in the transcript (no
custom session events — honoring the post-20260811 session-log boundary). After
the user answers, the model records it via `track_respond_decision`
(`choice='dismissed'` to skip). Query surfaces: the `track_list_decisions` tool,
`GET /api/track/decisions`, the panel (planned), and `decisions.answerRate` in
the funnel. Retention is independent of session logs (KV outlives conversations).

## Task lifecycle (evidence-driven)

The local runtime has no structured CI/deploy signals (git and builds go through
bash), so `done` cannot be auto-claimed from "looks finished". Design
(2026-08-12, external-research Q3):

- **Two fields**: `state` (confirmed truth, Linear 4-value) vs `inferred`
  (machine proposal: state + confidence + evidence ledger).
- **Evidence observer** (`lifecycle/observe.ts`) converts the structured event
  stream (todo snapshots, turn/end reasons, tool errors, file activity, user
  confirm phrases) into EvidenceRefs, recorded only against the currently
  ATTACHED issue.
- **State machine** (`lifecycle/state-machine.ts`, pure): the only auto-committed
  transition is the reversible todo → in_progress; **done / canceled always need
  a user nod** (panel / `confirmed_by_user=true`); 14 days without progress
  proposes cancellation. Model entry points: `track_attach_issue` /
  `track_update_issue_state` / `track_issue_evidence` (SKILL.md「任务推进」discipline).

## Capture motivation context

Auto-capture (`capture/observe.ts`) watches the structured tool stream for
execution signals (first todo_write entry, git branch creation). To keep the
capture wall from becoming a list of context-free fragments ("调研 StreamChunk
usage/token 字段" without knowing it serves cost metering), every capture
carries **context = the session's most recent explicit user request**
(`source.kind === 'user'`):

- live: the observer keeps a per-session cache and attaches it at capture time (A)
- continued sessions (post-restart splice): `seedContext` backfills the most
  recent user request from the persisted log (#21)
- legacy: `track_backfill_captures` one-shot backfill for captures created
  before #20 (#22)

The v2 pipeline consumes context in three places: synthesis feeds it to the
LLM (titles lift from execution level to requirement level, e.g. "调研
StreamChunk…为 LLM 用量记录模块做准备"); align's `captureOverlaps` matches
content OR context (execution-level captures map to their requirement
candidate); same-context captures promote as a group (fragments of one
requirement fold into one issue — no orphans).

## LLM usage ledger

The v2 sync engine (`engine: 'v2'`) calls the harness `ctx.llm` directly for
semantic judgement (intent layering / candidate synthesis / relation
classification). These plugin-direct calls never surface as session events, so
the harness-wide token-meter cannot see them — **track meters them itself at
the single funnel in `src/sync/llm.ts`**:

- Every streamed call appends one `LlmUsageRecord` to the `usage` KV table:
  timestamp, call-site label, provider/model, `inputTokens` / `outputTokens` /
  `cacheReadTokens` / `cacheWriteTokens` / `reasoningTokens`, finish reason
  (stop/max-tokens/error/aborted), and wall time; each `llmJson` retry attempt
  is one record (one retry = one real request).
- Query surfaces: the `track_usage` tool (the model can just ask "how many
  tokens/dollars did track spend") and `GET /api/track/usage?since=<epoch-ms>&limit=<n>`
  (summary + recent records).
- Cost estimation uses the `PRICING` table in `src/usage.ts` (USD per 1M
  tokens): built-in `deepseek-official` rates (verified 2026-08-01:
  `deepseek-v4-flash` input $0.14/1M, cache hit $0.0028/1M, output $0.28/1M;
  `deepseek-v4-pro` input $0.435/1M, cache hit $0.003625/1M, output $0.87/1M).
  Routes outside the table still count tokens but report cost as unpriced.
- Metering is a fire-and-forget observability surface: a failed write only
  logs; it never affects the sync pipeline. With no llm service / no recorder
  it degrades to zero cost.

## Development

```sh
pnpm install
pnpm run build      # tsc artifacts to lib/
pnpm test           # vitest
```

## Session-log boundary (plugin event convention)

> Background (2026-08-11 incident): early dsh-track wrote custom events into
> session logs (`track/decision`, `track/sync-preview`). Since the 0811
> snapshot, the harness session-event whitelist (`KNOWN_SESSION_EVENT_TYPES`) is
> generated at compile time from the in-repo `SessionEventMap`, and
> **out-of-repo plugin events are outside it by construction**; the reader
> REFUSES the whole log for an unknown type without an `ignorable` marker
> (better refuse than misread — it assumes a newer harness wrote it). That made
> 6 old sessions unopenable on the new harness (fixed with
> `repair-unknown-events.mjs` adding `ignorable: true`, zero content loss).

**Rules (must follow):**

1. **No business data in session logs** — persistent data (tasks/issues/
   decisions/usage) lives in your own storage (TrackStore KV here); do not
   append custom session events.
2. **Observe sessions via official events** — subscribe to `session/event` and
   the official structured event stream; read-only, never write.
3. **Do not write custom session events** — the official registration surface
   is explicitly deferred until a real consumer exists; until then any write is
   an "unknown type" that breaks old sessions on newer harnesses.
4. If a side-channel record is genuinely needed (audit/preview/cache — safe to
   lose), it **must carry `ignorable: true`** — that marker's contract is "this
   event may be skipped without affecting reconstruction", so it must never
   carry critical data.
5. Existing logs with unknown events → `dsh-session-recovery` skill's
   `repair-unknown-events.mjs --id <session-id>` (or `--all`) marks them
   ignorable.

## Layout

```
src/index.ts        host plugin: tool registration + event subscription + store wiring
src/store.ts        TrackStore: KV cell wrapper (serial write chain)
src/types.ts        Linear-compatible data shapes
src/usage.ts        LLM usage ledger: recorder factory + aggregation + cost estimation + rendering
src/sync/llm.ts     LLM facade: unified streaming JSON calls + usage metering hook
skills/dsh-track    fat skill: decision-point criteria/format/discipline
cordis.patch.yml    bundle patch (auto-applied by dsh plugin add)
```
