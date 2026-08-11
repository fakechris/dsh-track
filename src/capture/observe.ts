/**
 * Rule-based auto-capture — the deterministic half of Track observability.
 *
 * The model-facing `capture_thought` tool depends on the agent's judgment,
 * which in practice almost never fires (measured ~1/148 in 62 sessions). This
 * observer instead watches the *structured tool stream* (session/event) for
 * two signals that are reliable by construction, with zero model cost:
 *
 *  - todo_write (planning path): an agent that plans a work unit issues a
 *    todo_write whose first entry is the requirement summary
 *    ("Create feature worktree (feat/right-panel-actions)").
 *  - git branch creation (execution path): `git worktree add -b`, `git
 *    checkout -b`, `git switch -c` carry the requirement in the branch name
 *    ("feat/track-observability").
 *
 * Both are exact pattern matches on structured fields — no LLM, no semantic
 * guesswork, no per-message cost. Dedup: one capture per session for
 * todo_write; one per branch name for git. Captures land with
 * `source: 'session'` and an `auto:*` tag so they are distinguishable from
 * explicit `capture_thought` calls.
 *
 * Reentrancy: our own appends (track/* events) never match the two signals.
 * @module @deepseek-ai/dsh-track/capture/observe
 */

import type { Context } from 'cordis'
import { makeId } from '../store.ts'
import type { TrackStore } from '../store.ts'

/** Signals the observer reacts to, for testability and logging. */
export interface AutoCaptureOptions {
  /** Tag applied to rule-captured thoughts. */
  tag?: string
}

const DEFAULT_TAG = 'auto'

/** `git checkout -b <name>` / `git switch -c <name>` / `git worktree add -b <name>`. */
const BRANCH_RE = /\bgit\s+(?:worktree\s+add\s+-b|checkout\s+-b|switch\s+-c)\s+([A-Za-z0-9._/-]+)/
/** Branch names we never capture (housekeeping). */
const SKIP_BRANCH = new Set(['main', 'master', 'develop'])

/** One tool/call event's data (arguments arrive as a JSON string). */
interface ToolCallData {
  name?: string
  arguments?: string
}

/** One todo_write arguments blob. */
interface TodoWriteArgs {
  todos?: Array<{ content?: string }>
}

/**
 * Wire the rule-based capture observer onto session/event. Returns a
 * disposer that unregisters the listener.
 */
export function createAutoCapture(ctx: Context, deps: { store: TrackStore }, options: AutoCaptureOptions = {}): () => void {
  const tag = options.tag ?? DEFAULT_TAG
  /** sessionId → captured (todo_write dedup: first todo_write per session). */
  const todoSeen = new Set<string>()
  /** branch → captured (git dedup: each branch name once, globally). */
  const branchSeen = new Set<string>()

  const capture = (sessionId: string | undefined, content: string, tags: string[]): void => {
    void deps.store.upsertCapture({
      id: makeId('capture'),
      content,
      source: 'session',
      sourceSessionId: sessionId,
      status: 'open',
      tags,
      createdAt: new Date().toISOString(),
    }).catch(() => { /* capture is best-effort; never break the stream */ })
  }

  const onEvent = (session: unknown, event: { type: string; data?: unknown }): void => {
    if (event.type !== 'tool/call') return
    const data = event.data as ToolCallData | undefined
    if (!data || typeof data.name !== 'string') return
    const sessionId = (session as { id?: string } | undefined)?.id

    if (data.name === 'todo_write' && sessionId !== undefined && !todoSeen.has(sessionId)) {
      todoSeen.add(sessionId)
      let first: string | undefined
      try {
        const parsed = JSON.parse(data.arguments ?? '{}') as TodoWriteArgs
        first = parsed.todos?.[0]?.content
      } catch { /* malformed arguments — skip */ }
      if (first && first.trim()) {
        capture(sessionId, first.trim(), [tag, 'todo'])
      }
      return
    }

    if (data.name === 'bash') {
      let command = ''
      try {
        const parsed = JSON.parse(data.arguments ?? '{}') as { command?: string }
        command = parsed.command ?? ''
      } catch { /* malformed arguments — skip */ }
      const match = BRANCH_RE.exec(command)
      if (match) {
        const branch = match[1]!
        if (!branchSeen.has(branch) && !SKIP_BRANCH.has(branch)) {
          branchSeen.add(branch)
          capture(sessionId, `新建分支 ${branch}`, [tag, 'git-branch'])
        }
      }
    }
  }

  return ctx.on('session/event', onEvent)
}
