/**
 * M1 — graph service: build/refresh per-session execution graphs and batch
 * build a workspace's history. Reads raw logs through the harness
 * session-query service (web profile) and persists into the TrackStore.
 * @module @fakechris/dsh-track/graph/service
 */
import { buildSessionGraph, GRAPH_VERSION } from "./build.js";
/** Last event seq of a log (the header line has no seq). */
export function logSeqEnd(events) {
    return events.reduce((m, e) => (typeof e.seq === 'number' ? Math.max(m, e.seq) : m), 0);
}
/**
 * Build (or reuse) the execution graph of one session and persist it.
 * Idempotent: a stored graph that already covers the log's last seq is
 * returned as-is unless rebuild=true — the deterministic builder makes
 * rebuilds cheap and safe (same log → same nodes/edges).
 */
export async function ensureSessionGraph(deps, sessionId, rebuild = false, now = Date.now()) {
    const snap = await deps.sessionQuery.readSession(sessionId);
    if (!rebuild) {
        const existing = await deps.store.getGraph(sessionId);
        if (existing !== undefined && existing.seqEnd >= logSeqEnd(snap.events) && existing.version >= GRAPH_VERSION)
            return existing;
    }
    const graph = buildSessionGraph(sessionId, snap.events, snap.session, now);
    await deps.store.upsertGraph(graph);
    await deps.store.markGraphBuilt(sessionId);
    return graph;
}
/**
 * Batch build graphs for a workspace's sessions (newest-first, bounded).
 * Sessions whose stored graph already covers the log are skipped — a re-run
 * only folds sessions that grew since the last pass.
 */
export async function buildWorkspaceGraphs(deps, cwd, maxSessions = 200, now = Date.now()) {
    const records = await deps.sessionQuery.filterSessions([{ kind: 'cwd', values: [cwd] }]);
    const list = records.slice(0, maxSessions);
    const result = { total: list.length, built: 0, skipped: 0, failed: 0 };
    for (const rec of list) {
        try {
            const snap = await deps.sessionQuery.readSession(rec.header.id);
            const existing = await deps.store.getGraph(rec.header.id);
            if (existing !== undefined && existing.seqEnd >= logSeqEnd(snap.events) && existing.version >= GRAPH_VERSION) {
                result.skipped += 1;
                continue;
            }
            const graph = buildSessionGraph(rec.header.id, snap.events, snap.session, now);
            await deps.store.upsertGraph(graph);
            await deps.store.markGraphBuilt(rec.header.id);
            result.built += 1;
        }
        catch {
            result.failed += 1;
        }
    }
    return result;
}
