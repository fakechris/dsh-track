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
/** Minimal event shape we read from a session snapshot. */
export interface ContextEvent {
    type: string;
    data?: {
        id?: string;
        content?: Array<{
            type?: string;
            text?: string;
        }>;
        source?: {
            kind?: string;
        };
    };
}
/** Minimal sessionQuery surface for reading one session. */
export interface ContextSessionQuery {
    readSession(id: string): Promise<{
        events: ContextEvent[];
    }>;
}
/** A user prompt plus the message id that carries it (the deep-link target). */
export interface UserPromptRef {
    /** Request text, truncated to the motivation-context bound. */
    text: string;
    /** `user/message` `data.id` — stable message identity for the web panel. */
    id?: string;
}
/** Is this request a terse acknowledgement rather than a full instruction? */
export declare function isShortAck(text: string): boolean;
export declare function latestUserRequestFromEvents(events: readonly ContextEvent[]): UserPromptRef | undefined;
/** Read the latest explicit user request for a session (best-effort). */
export declare function latestUserRequest(sessionQuery: ContextSessionQuery | undefined, sessionId: string): Promise<UserPromptRef | undefined>;
