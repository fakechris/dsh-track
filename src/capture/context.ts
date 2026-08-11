/**
 * Capture context helpers — extracting motivation context (the most recent
 * explicit user request) from a persisted session log.
 *
 * Shared by:
 *  - observe.ts seed (fresh process after restart: backfill per-session)
 *  - backfill (one-shot migration: fill context on legacy open captures)
 *  - index.ts seedContext wiring
 * @module @deepseek-ai/dsh-track/capture/context
 */

/** Minimal event shape we read from a session snapshot. */
export interface ContextEvent {
  type: string
  data?: {
    content?: Array<{ type?: string; text?: string }>
    source?: { kind?: string }
  }
}

/** Minimal sessionQuery surface for reading one session. */
export interface ContextSessionQuery {
  readSession(id: string): Promise<{ events: ContextEvent[] }>
}

/**
 * Most recent explicit user request (source.kind === 'user') in a session log,
 * or undefined when the session has none. Scans from the tail — the latest
 * request is the current motivation.
 */
export function latestUserRequestFromEvents(events: readonly ContextEvent[]): string | undefined {
  for (const event of [...events].reverse()) {
    if (event.type !== 'user/message') continue
    const source = event.data?.source
    if (source?.kind !== 'user') continue
    const text = (event.data?.content ?? [])
      .filter((c) => c.type === 'text')
      .map((c) => c.text ?? '')
      .join('')
      .trim()
    if (text) return text.slice(0, 200)
  }
  return undefined
}

/** Read the latest explicit user request for a session (best-effort). */
export async function latestUserRequest(
  sessionQuery: ContextSessionQuery | undefined,
  sessionId: string,
): Promise<string | undefined> {
  if (!sessionQuery) return undefined
  try {
    const snapshot = await sessionQuery.readSession(sessionId)
    return latestUserRequestFromEvents(snapshot.events)
  } catch {
    return undefined
  }
}
