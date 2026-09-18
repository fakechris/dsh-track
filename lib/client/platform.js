/**
 * Client platform surface after the 0.1.5-rc.2 package split.
 *
 * 0.1.5-rc.2 deleted the `@deepseek-ai/dsh-client-runtime` package that used to
 * re-export all of this from one place:
 *   - `ClientContext` was nothing but `export type ClientContext = Context`
 *   - `SessionId` was re-exported from `@deepseek-ai/dsh-client-connection`
 *   - `ISessions` came from the runtime's own sessions contract
 * Keeping the old names here means the rest of the client code reads unchanged,
 * while this file records where each one actually lives now.
 * @module @fakechris/dsh-track/client/platform
 */
/**
 * Build a stable collision-free key for one Definition-local business identity.
 *
 * Upstream used to export this from `dsh-client-runtime/client`. 0.1.5-rc.2
 * keeps it private to `dsh-client-ui-conversation` — it is declared in that
 * package's `contract/conversation` but is NOT part of its `/client` exports —
 * so there is no public module to import it from. The formula is byte-identical
 * in both versions (compare `dsh-client-ui-conversation` and
 * `dsh-client-runtime` `lib/client.js`), and this repo only uses it to write the
 * `data-chat-flow-key` attribute, so it is reproduced verbatim here rather than
 * reaching into a private module path.
 * @param kind - Definition kind.
 * @param id - Definition-local business identity.
 * @returns engine-owned Context key.
 */
export function conversationContextKey(kind, id) {
    return `${kind.length}:${kind}${id}`;
}
