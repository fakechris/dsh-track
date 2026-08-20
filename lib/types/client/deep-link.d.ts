/**
 * Deep-link into a specific conversation from outside the app.
 *
 * Two alias forms, both resolved to `jumpToConversation` (which opens the
 * session in the left conversation and scrolls to the message when given):
 *   1. Path form:   `/s/<sessionId>[/<messageId>]` — dsh-session-link
 *      compatible, bookmarkable; kept in the address bar (re-opening and
 *      refresh re-run idempotently).
 *   2. Query form:  `?open=<sessionId>[&message=<messageId>]` — one-shot
 *      instruction; the params are stripped after a successful jump so a
 *      later refresh does not re-jump into an old conversation.
 *
 * The app itself is a router-less SPA (any path falls back to index.html),
 * so nothing upstream parses these — this module is the only consumer.
 * Boot-time jump + `popstate`/`hashchange` listeners cover "open the URL in
 * a fresh tab", back/forward, and pasting the URL into an already-open tab.
 * @module @fakechris/dsh-track/client/deep-link
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
/** A deep-link target parsed out of the URL. */
export interface DeepLinkTarget {
    sessionId: string;
    messageId?: string;
    /** True when the target came from `?open=` (one-shot; stripped after jump). */
    fromQuery: boolean;
}
/** Parse a deep-link target out of the current location, or null. */
export declare function parseDeepLink(location: Location): DeepLinkTarget | null;
/**
 * Install the deep-link listener: jump on boot and on every URL change
 * (popstate covers back/forward and address-bar edits; hashchange is a cheap
 * extra). Returns a disposer that removes both listeners.
 */
export declare function installDeepLink(ctx: ClientContext): () => void;
