/**
 * Phase 0b — automatic aggregation preview.
 *
 * The session/event observation point becomes real: after a workspace's
 * session goes idle for `idleMs`, run a dry-run sync and append a
 * `track/sync-preview` event to the last active session so the agent (and
 * through it the user) sees "there is work here — approve write-back or
 * inspect candidates". Write-back is NEVER automatic (triage discipline,
 * v2-design §3.12): preview only.
 *
 * Reentrancy: the appended preview event itself flows back through
 * session/event, so `track/*` events are ignored by the observer.
 * @module @deepseek-ai/dsh-track/sync/auto
 */

import type { Context } from 'cordis'
import type { SyncOptions, SyncReport, SyncDeps } from './run.ts'
import type { TrackStore } from '../store.ts'

/** What a sync preview event carries (summary, never the full candidate dump). */
export interface SyncPreview {
  /** Workspace the preview was computed for. */
  cwd: string
  /** Epoch ms when the preview was computed. */
  at: number
  /** Engine that produced it. */
  engine: 'v1' | 'v2'
  /** Dry-run counts (what a write-back WOULD do). */
  report: Pick<SyncReport, 'created' | 'updated' | 'skipped' | 'promotedCaptures'>
  /** Candidate titles, so the agent can surface them without the full report. */
  titles: string[]
}

export interface AutoSyncDeps {
  store: TrackStore
  /** Resolve the session-query service lazily (web profile only). */
  getSessionQuery: () => unknown
  /** Run one sync pass; the real wiring funnels into runSync. */
  runSync: (options: SyncOptions) => Promise<SyncReport>
}

export interface AutoSyncOptions {
  /** Idle time before a preview is computed (default 60s). */
  idleMs?: number
  /** Maximum candidate titles carried in the preview event. */
  maxTitles?: number
  /** Engine for the preview pass (default v1 — deterministic, no LLM cost). */
  engine?: 'v1' | 'v2'
  /** Maximum previews per workspace within a window (default 1 per 10 min). */
  cooldownMs?: number
}

const DEFAULT_IDLE_MS = 60_000
const DEFAULT_COOLDOWN_MS = 10 * 60_000
const DEFAULT_MAX_TITLES = 8

/**
 * Wire the automatic aggregation observer. Returns a dispose function that
 * cancels pending timers and unregisters the listener.
 *
 * The listener is fire-and-forget: failures are logged, never thrown into the
 * session event dispatch (post-commit feed semantics — observer failures are
 * contained by the emitter anyway, but we stay quiet on purpose).
 */
export function createAutoSync(ctx: Context, deps: AutoSyncDeps, options: AutoSyncOptions = {}): () => void {
  const idleMs = options.idleMs ?? DEFAULT_IDLE_MS
  const cooldownMs = options.cooldownMs ?? DEFAULT_COOLDOWN_MS
  const maxTitles = options.maxTitles ?? DEFAULT_MAX_TITLES
  const engine = options.engine ?? 'v1'

  /** cwd → pending idle timer. */
  const timers = new Map<string, ReturnType<typeof setTimeout>>()
  /** cwd → last preview time, to throttle repeated previews. */
  const lastPreviewAt = new Map<string, number>()
  /** cwd → the last session that was active there (preview target). */
  const lastSession = new Map<string, unknown>()
  let disposed = false

  const disposeTimer = (cwd: string): void => {
    const timer = timers.get(cwd)
    if (timer) {
      clearTimeout(timer)
      timers.delete(cwd)
    }
  }

  const runPreview = async (cwd: string): Promise<void> => {
    timers.delete(cwd)
    if (disposed) return
    const now = Date.now()
    const last = lastPreviewAt.get(cwd) ?? 0
    if (now - last < cooldownMs) return
    const session = lastSession.get(cwd)
    const sessionQuery = deps.getSessionQuery()
    if (!session || !sessionQuery) return
    // Guard: an append inside a session/event listener is allowed (post-commit
    // feed) but must never throw into the emitter's dispatch.
    try {
      const report = await deps.runSync({ cwd, dryRun: true, engine })
      lastPreviewAt.set(cwd, Date.now())
      if (report.issueCandidates.length === 0) return
      const preview: SyncPreview = {
        cwd,
        at: Date.now(),
        engine,
        report: {
          created: report.created,
          updated: report.updated,
          skipped: report.skipped,
          promotedCaptures: report.promotedCaptures,
        },
        titles: report.issueCandidates.slice(0, maxTitles).map((c) => c.title),
      }
      ;(session as { append?: (type: string, data: unknown) => void }).append?.('track/sync-preview', preview)
    } catch (error) {
      console.error('[dsh-track] auto-sync preview failed:', error)
    }
  }

  const onSessionEvent = (session: unknown, event: { type: string }): void => {
    if (disposed) return
    // Never react to our own appends (reentrancy) — preview events and any
    // future track/* events are terminal for the observer.
    if (event.type.startsWith('track/')) return
    const cwd = (session as { header?: { cwd?: string } }).header?.cwd
    if (!cwd) return
    lastSession.set(cwd, session)
    disposeTimer(cwd)
    timers.set(cwd, setTimeout(() => { void runPreview(cwd) }, idleMs))
  }

  ctx.on('session/event', onSessionEvent)

  return () => {
    disposed = true
    for (const cwd of timers.keys()) disposeTimer(cwd)
    timers.clear()
  }
}
