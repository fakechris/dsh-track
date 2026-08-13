/**
 * Rule-based auto-capture — the deterministic half of Track observability.
 *
 * The model-facing `capture_thought` tool depends on the agent's judgment,
 * which in practice almost never fires (measured ~1/148 in 62 sessions). This
 * observer instead watches the *structured tool stream* (session/event) for
 * ONE signal that is reliable by construction, with zero model cost:
 *
 *  - todo_write (planning path): an agent that plans a work unit issues a
 *    todo_write whose FIRST entry is the requirement summary. Only the first
 *    change of the first entry captures once (B — a later refresh is the same
 *    requirement's execution, not a new thought).
 *
 * Git branch creation was REMOVED as a signal (2026-08-11): "新建分支 feat/…"
 * is an execution carrier, not a requirement — in practice it dominated the
 * capture wall with noise (9 of 17 captures) even when context was attached.
 * The todo_write signal covers the same work lines with the requirement's
 * own wording.
 *
 * Exact pattern match on structured fields — no LLM, no semantic guesswork,
 * no per-message cost. Captures land with `source: 'session'` and an
 * `auto:*` tag so they are distinguishable from explicit `capture_thought`
 * calls.
 *
 * Motivation context (A): every capture carries `context` = the most recent
 * FULL user instruction (user/message with source.kind === 'user', skipping
 * terse acks — see capture/context.ts), so an execution-level capture
 * ("调研 StreamChunk usage/token 字段") keeps its "why" ("做一个模块记录所有
 * llm 数据计算开销"). The observer keeps a per-session one-entry cache of the
 * latest full user request.
 *
 * Reentrancy: our own appends (track/* events) never match the signal.
 * @module @fakechris/dsh-track/capture/observe
 */

import type { Context } from '@deepseek-ai/cordis'
import { makeId } from '../store.ts'
import type { TrackStore } from '../store.ts'
import { isShortAck, type UserPromptRef } from './context.ts'

/** Signals the observer reacts to, for testability and logging. */
export interface AutoCaptureOptions {
  /** Tag applied to rule-captured thoughts. */
  tag?: string
}

const DEFAULT_TAG = 'auto'

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
  id?: string
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
 *
 * `deps.recentUser` (optional): a caller-owned per-session cache of the latest
 * explicit user request (`UserPromptRef` — text + message id). The observer
 * writes into it on every live `user/message` and on seed; the model-facing
 * tools (capture_thought, report_decision_point, track_create_issue) read the
 * same map so captures/decisions/issues carry the message id of the prompt
 * they happened under — the web panel's deep-link target.
 */
export function createAutoCapture(ctx: Context, deps: {
  store: TrackStore
  seedContext?: (sessionId: string) => Promise<string | { text: string; id?: string } | undefined>
  recentUser?: Map<string, UserPromptRef>
}, options: AutoCaptureOptions = {}): () => void {
  const tag = options.tag ?? DEFAULT_TAG
  /** sessionId → captured (todo_write dedup: first change of first entry per session). */
  const todoSeen = new Set<string>()
  /** sessionId → most recent FULL user instruction (motivation context, A). */
  const lastUserRequest = deps.recentUser ?? new Map<string, UserPromptRef>()
  /** sessionIds already seeded from the persisted log (or attempted). */
  const seeded = new Set<string>()

  /** Ensure the context cache has an entry for the session (seed once from log). */
  const ensureContext = async (sessionId: string): Promise<void> => {
    if (lastUserRequest.has(sessionId) || seeded.has(sessionId)) return
    seeded.add(sessionId)
    if (!deps.seedContext) return
    try {
      const seed = await deps.seedContext(sessionId)
      if (seed) {
        const ref = typeof seed === 'string' ? { text: seed } : seed
        lastUserRequest.set(sessionId, { text: ref.text.slice(0, 200), id: ref.id })
      }
    } catch { /* seeding is best-effort */ }
  }

  const capture = (sessionId: string | undefined, content: string, tags: string[], prompt?: UserPromptRef): void => {
    void deps.store.upsertCapture({
      id: makeId('capture'),
      content,
      source: 'session',
      sourceSessionId: sessionId,
      sourceMessageId: prompt?.id,
      status: 'open',
      tags,
      context: prompt?.text,
      createdAt: new Date().toISOString(),
    }).catch(() => { /* capture is best-effort; never break the stream */ })
  }

  const onEvent = (session: unknown, event: { type: string; data?: unknown }): void => {
    const sessionId = (session as { id?: string } | undefined)?.id

    // Track the most recent FULL user instruction as motivation context (A).
    // MUST run before pre-warm so a live user/message fills the cache and the
    // seed (persisted log) is not consulted for an already-warm session.
    // Terse acks ("可以", "pr merge") are skipped — they are acknowledgements,
    // not motivation; an earlier full instruction stays the context.
    if (event.type === 'user/message') {
      const data = event.data as UserMessageData | undefined
      const kind = data?.source?.kind
      if (kind === 'user' && sessionId !== undefined) {
        const text = (data?.content ?? [])
          .filter((c) => c.type === 'text')
          .map((c) => c.text ?? '')
          .join('')
          .trim()
        if (text && !isShortAck(text)) lastUserRequest.set(sessionId, { text: text.slice(0, 200), id: data?.id })
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
    const prompt = sessionId !== undefined ? lastUserRequest.get(sessionId) : undefined

    if (data.name === 'todo_write' && sessionId !== undefined && !todoSeen.has(sessionId)) {
      todoSeen.add(sessionId)
      let first: string | undefined
      try {
        const parsed = JSON.parse(data.arguments ?? '{}') as TodoWriteArgs
        first = parsed.todos?.[0]?.content
      } catch { /* malformed arguments — skip */ }
      if (first && first.trim()) {
        capture(sessionId, first.trim(), [tag, 'todo'], prompt)
      }
    }
  }

  return ctx.on('session/event', onEvent)
}
