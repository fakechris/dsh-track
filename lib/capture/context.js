/**
 * Capture context helpers — extracting motivation context (the most recent
 * explicit user request) from a persisted session log.
 *
 * Shared by:
 *  - observe.ts seed (fresh process after restart: backfill per-session)
 *  - backfill (one-shot migration: fill context on legacy open captures)
 *  - index.ts seedContext wiring
 * @module @fakechris/dsh-track/capture/context
 */
/**
 * Most recent explicit user request (source.kind === 'user') in a session log,
 * or undefined when the session has none. Scans from the tail — the latest
 * request is the current motivation.
 *
 * Short-confirmation skip: very short requests ("可以", "pr merge", "CA先做",
 * "restart") are execution-level acknowledgements, not motivation. We skip
 * them and keep scanning back to the nearest full instruction — the request
 * that actually states the goal. A request counts as a full instruction when
 * it is long enough (≥ SHORT_ACK_MAX chars) OR ends with sentence punctuation
 * (。？！?!) that signals a real question/statement rather than a terse ack.
 */
const SHORT_ACK_MAX = 12;
/** Is this request a terse acknowledgement rather than a full instruction? */
export function isShortAck(text) {
    if (text.length >= SHORT_ACK_MAX)
        return false;
    return !/[。？！?!]$/.test(text);
}
export function latestUserRequestFromEvents(events) {
    for (const event of [...events].reverse()) {
        if (event.type !== 'user/message')
            continue;
        const source = event.data?.source;
        if (source?.kind !== 'user')
            continue;
        const text = (event.data?.content ?? [])
            .filter((c) => c.type === 'text')
            .map((c) => c.text ?? '')
            .join('')
            .trim();
        if (!text)
            continue;
        // Terse acks are not motivation — keep scanning for the full instruction.
        if (isShortAck(text))
            continue;
        return { text: text.slice(0, 200), id: event.data?.id };
    }
    return undefined;
}
/** Read the latest explicit user request for a session (best-effort). */
export async function latestUserRequest(sessionQuery, sessionId) {
    if (!sessionQuery)
        return undefined;
    try {
        const snapshot = await sessionQuery.readSession(sessionId);
        return latestUserRequestFromEvents(snapshot.events);
    }
    catch {
        return undefined;
    }
}
