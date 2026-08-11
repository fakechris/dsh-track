/**
 * Rule-based auto-capture — the deterministic half of Track observability.
 *
 * The model-facing `capture_thought` tool depends on the agent's judgment,
 * which in practice almost never fires (measured ~1/148 in 62 sessions). This
 * observer instead watches the *structured tool stream* (session/event) for
 * two signals that are reliable by construction, with zero model cost:
 *
 *  - todo_write (planning path): an agent that plans a work unit issues a
 *    todo_write whose FIRST entry is the requirement summary. Only the first
 *    change of the first entry captures once (B — a later refresh is the same
 *    requirement's execution, not a new thought).
 *  - git branch creation (execution path): `git worktree add -b`, `git
 *    checkout -b`, `git switch -c` carry the requirement in the branch name
 *    ("feat/track-observability").
 *
 * Both are exact pattern matches on structured fields — no LLM, no semantic
 * guesswork, no per-message cost. Captures land with `source: 'session'` and
 * an `auto:*` tag so they are distinguishable from explicit `capture_thought`
 * calls.
 *
 * Motivation context (A): every capture carries `context` = the most recent
 * explicit user request (user/message with source.kind === 'user') in the
 * session, so an execution-level capture ("调研 StreamChunk usage/token 字段")
 * keeps its "why" ("做一个模块记录所有 llm 数据计算开销"). The observer keeps
 * a per-session one-entry cache of the latest user request.
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

/** One user/message event's data. */
interface UserMessageData {
  content?: Array<{ type?: string; text?: string }>
  source?: { kind?: string }
}

/**
 * Wire the rule-based capture observer onto session/event. Returns a
 * disposer that unregisters the listener.
 *
 * `deps.seedContext` (optional): on the FIRST event of a session, the observer
 * has no in-memory context (fresh process — e.g. after a restart, where the
 * spliced continuation session's earlier user requests happened in the
 * PREVIOUS process). seedContext backfills the most recent explicit user
 * request from the persisted session log so a continued session still gets
 * motivation context. Without it, continued sessions never capture context.
 */
export function createAutoCapture(ctx: Context, deps: { store: TrackStore; seedContext?: (sessionId: string) => Promise<string | undefined> }, options: AutoCaptureOptions = {}): () => void {
  const tag = options.tag ?? DEFAULT_TAG
  /** sessionId → captured (todo_write dedup: first change of first entry per session). */
  const todoSeen = new Set<string>()
  /** branch → captured (git dedup: each branch name once, globally). */
  const branchSeen = new Set<string>()
  /** sessionId → most recent explicit user request (motivation context, A). */
  const lastUserRequest = new Map<string, string>()
  /** sessionIds already seeded from the persisted log (or attempted). */
  const seeded = new Set<string>()

  /** Ensure the context cache has an entry for the session (seed once from log). */
  const ensureContext = async (sessionId: string): Promise<void> => {
    if (lastUserRequest.has(sessionId) || seeded.has(sessionId)) return
    seeded.add(sessionId)
    if (!deps.seedContext) return
    try {
      const text = await deps.seedContext(sessionId)
      if (text) lastUserRequest.set(sessionId, text.slice(0, 200))
    } catch { /* seeding is best-effort */ }
  }

  const capture = (sessionId: string | undefined, content: string, tags: string[], context?: string): void => {
    void deps.store.upsertCapture({
      id: makeId('capture'),
      content,
      source: 'session',
      sourceSessionId: sessionId,
      status: 'open',
      tags,
      context,
      createdAt: new Date().toISOString(),
    }).catch(() => { /* capture is best-effort; never break the stream */ })
  }

  const onEvent = (session: unknown, event: { type: string; data?: unknown }): void => {
    const sessionId = (session as { id?: string } | undefined)?.id

    // Track the most recent explicit user request as motivation context (A).
    // MUST run before pre-warm so a live user/message fills the cache and the
    // seed (persisted log) is not consulted for an already-warm session.
    if (event.type === 'user/message') {
      const data = event.data as UserMessageData | undefined
      const kind = data?.source?.kind
      if (kind === 'user' && sessionId !== undefined) {
        const text = (data?.content ?? [])
          .filter((c) => c.type === 'text')
          .map((c) => c.text ?? '')
          .join('')
          .trim()
        if (text) lastUserRequest.set(sessionId, text.slice(0, 200))
      }
      return
    }

    // Pre-warm the context cache for this session (idempotent, fire-and-forget).
    // In a continued (spliced) session the persisted-log seed resolves during
    // the many events between splice and the first todo/branch signal, so the
    // signal below reads a warm cache synchronously.
    if (sessionId !== undefined) void ensureContext(sessionId)

    if (event.type !== 'tool/call') return
    const data = event.data as ToolCallData | undefined
    if (!data || typeof data.name !== 'string') return
    const context = sessionId !== undefined ? lastUserRequest.get(sessionId) : undefined

    if (data.name === 'todo_write' && sessionId !== undefined && !todoSeen.has(sessionId)) {
      todoSeen.add(sessionId)
      let first: string | undefined
      try {
        const parsed = JSON.parse(data.arguments ?? '{}') as TodoWriteArgs
        first = parsed.todos?.[0]?.content
      } catch { /* malformed arguments — skip */ }
      if (first && first.trim()) {
        capture(sessionId, first.trim(), [tag, 'todo'], context)
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
          capture(sessionId, `新建分支 ${branch}`, [tag, 'git-branch'], context)
        }
      }
    }
  }

  return ctx.on('session/event', onEvent)
}
