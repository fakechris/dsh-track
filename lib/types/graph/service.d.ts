/**
 * M1 — graph service: build/refresh per-session execution graphs and batch
 * build a workspace's history. Reads raw logs through the harness
 * session-query service (web profile) and persists into the TrackStore.
 * @module @fakechris/dsh-track/graph/service
 */
import type { SessionQueryEngine } from '@deepseek-ai/dsh-session-query';
import type { TrackStore } from '../store.ts';
import type { SessionGraph } from '../types.ts';
/** What the graph service needs from the harness + store. */
export interface GraphServiceDeps {
    sessionQuery: Pick<SessionQueryEngine, 'readSession' | 'filterSessions'>;
    store: TrackStore;
}
/** Result of one workspace batch build. */
export interface BuildWorkspaceResult {
    total: number;
    built: number;
    skipped: number;
    failed: number;
}
/** Last event seq of a log (the header line has no seq). */
export declare function logSeqEnd(events: readonly {
    seq?: number;
}[]): number;
/**
 * Build (or reuse) the execution graph of one session and persist it.
 * Idempotent: a stored graph that already covers the log's last seq is
 * returned as-is unless rebuild=true — the deterministic builder makes
 * rebuilds cheap and safe (same log → same nodes/edges).
 */
export declare function ensureSessionGraph(deps: GraphServiceDeps, sessionId: string, rebuild?: boolean, now?: number): Promise<SessionGraph>;
/**
 * Batch build graphs for a workspace's sessions (newest-first, bounded).
 * Sessions whose stored graph already covers the log are skipped — a re-run
 * only folds sessions that grew since the last pass.
 */
export declare function buildWorkspaceGraphs(deps: GraphServiceDeps, cwd: string, maxSessions?: number, now?: number): Promise<BuildWorkspaceResult>;
