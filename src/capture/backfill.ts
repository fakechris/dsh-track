/**
 * Capture context backfill — one-shot migration for legacy captures.
 *
 * Captures created before the motivation-context work (PR #20) have no
 * `context`. The observer only seeds LIVE sessions, so legacy captures stay
 * context-less forever and C2/C3 (context-based fold) cannot map them.
 * This pass reads each open capture's source session log and writes the most
 * recent explicit user request as its context.
 * @module @deepseek-ai/dsh-track/capture/backfill
 */

import type { TrackStore } from '../store.ts'
import type { Capture } from '../types.ts'
import { latestUserRequest, type ContextSessionQuery } from './context.ts'

export interface BackfillResult {
  /** Captures inspected (open, no context, with a source session). */
  scanned: number
  /** Captures that received a context. */
  filled: number
  /** Captures whose session had no explicit user request (left as-is). */
  skipped: number
}

/**
 * Backfill `context` on legacy open captures from their source session logs.
 * Idempotent: skips captures that already have context; safe to re-run.
 */
export async function backfillCaptureContext(
  store: TrackStore,
  sessionQuery: ContextSessionQuery | undefined,
): Promise<BackfillResult> {
  const captures = await store.listCaptures()
  const candidates = captures.filter(
    (c: Capture) => c.status === 'open' && !c.context && c.sourceSessionId,
  )
  let filled = 0
  let skipped = 0
  for (const capture of candidates) {
    const text = await latestUserRequest(sessionQuery, capture.sourceSessionId!)
    if (!text) {
      skipped += 1
      continue
    }
    await store.upsertCapture({ ...capture, context: text })
    filled += 1
  }
  return { scanned: candidates.length, filled, skipped }
}
