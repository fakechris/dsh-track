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

import type { ClientContext, ISessions, SessionId } from '@deepseek-ai/dsh-client-runtime/client'
import { jumpToConversation } from './right-panel.ts'

const POLL_MS = 120
/** How long to wait for the target session to appear in the session list. */
const LIST_WAIT_MS = 20_000

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** A deep-link target parsed out of the URL. */
export interface DeepLinkTarget {
  sessionId: string
  messageId?: string
  /** True when the target came from `?open=` (one-shot; stripped after jump). */
  fromQuery: boolean
}

/** Parse a deep-link target out of the current location, or null. */
export function parseDeepLink(location: Location): DeepLinkTarget | null {
  // Query form: ?open=<sessionId>[&message=<messageId>]
  const params = new URLSearchParams(location.search)
  const querySession = params.get('open')
  if (querySession !== null) {
    return {
      sessionId: querySession,
      messageId: params.get('message') ?? undefined,
      fromQuery: true,
    }
  }
  // Path form: /s/<sessionId>[/<messageId>]
  const match = location.pathname.match(/^\/s\/([^/]+)(?:\/([^/]+))?$/)
  if (match !== null) {
    return { sessionId: match[1]!, messageId: match[2], fromQuery: false }
  }
  return null
}

/**
 * Wait until `sessionId` is present in the session list store. On a fresh
 * page load the list arrives from the Host asynchronously (mux stream), and
 * `sessions.open()` fails loud on unknown ids — so the jump must wait for the
 * row instead of racing it.
 */
async function waitForSessionListed(sessions: ISessions, sessionId: string, timeoutMs = LIST_WAIT_MS): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const list = sessions.list.getSnapshot()
    if (list.ids.includes(sessionId as SessionId) || list.byId[sessionId as SessionId] !== undefined) return true
    await sleep(POLL_MS)
  }
  return false
}

/** Remove `?open=` / `?message=` from the URL (one-shot jump), keeping other params. */
function stripQueryParams(location: Location): void {
  const params = new URLSearchParams(location.search)
  if (!params.has('open') && !params.has('message')) return
  params.delete('open')
  params.delete('message')
  const search = params.toString()
  window.history.replaceState(null, '', location.pathname + (search !== '' ? `?${search}` : '') + location.hash)
}

/** Jump to one target: wait for the list, open + scroll, then clean up if one-shot. */
async function jumpOnce(sessions: ISessions, target: DeepLinkTarget): Promise<void> {
  if (!(await waitForSessionListed(sessions, target.sessionId))) return
  await jumpToConversation({ sessionId: target.sessionId, messageId: target.messageId })
  if (target.fromQuery) stripQueryParams(window.location)
}

/**
 * Install the deep-link listener: jump on boot and on every URL change
 * (popstate covers back/forward and address-bar edits; hashchange is a cheap
 * extra). Returns a disposer that removes both listeners.
 */
export function installDeepLink(ctx: ClientContext): () => void {
  // The browser `ctx.sessions` is the client SessionsService (ISessions); the
  // host package augments the same Context property with its own SessionStore
  // type — cast past that, same as right-panel.ts.
  let sessions: ISessions | null = null
  try {
    sessions = (ctx as unknown as { sessions: ISessions }).sessions
  } catch {
    return () => { /* sessions service unavailable — nothing to jump to */ }
  }
  const jump = (): void => {
    if (sessions === null) return
    const target = parseDeepLink(window.location)
    if (target === null) return
    void jumpOnce(sessions, target)
  }
  jump() // boot: a fresh tab opened at a deep link jumps immediately
  window.addEventListener('popstate', jump)
  window.addEventListener('hashchange', jump)
  return () => {
    window.removeEventListener('popstate', jump)
    window.removeEventListener('hashchange', jump)
  }
}
