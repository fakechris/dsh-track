/**
 * M1 — graph service: build/refresh per-session execution graphs and batch
 * build a workspace's history. Reads raw logs through the harness
 * session-query service (web profile) and persists into the TrackStore.
 * @module @fakechris/dsh-track/graph/service
 */

import type { SessionId } from '@deepseek-ai/dsh-session'
import type { SessionQueryEngine } from '@deepseek-ai/dsh-session-query'
import type { SessionGraph } from '../types.ts'
import { buildSessionGraph, GRAPH_VERSION } from './build.ts'
import type { TrackStore } from '../store.ts'

/** What the graph service needs from the harness + store. */
export interface GraphServiceDeps {
  sessionQuery: Pick<SessionQueryEngine, 'readSession' | 'filterSessions'>
  store: TrackStore
}

/** Result of one workspace batch build. */
export interface BuildWorkspaceResult {
  total: number
  built: number
  skipped: number
  failed: number
}

/** Last event seq of a log (the header line has no seq). */
export function logSeqEnd(events: readonly { seq?: number }[]): number {
  return events.reduce((m, e) => (typeof e.seq === 'number' ? Math.max(m, e.seq) : m), 0)
}

/**
 * Build (or reuse) the execution graph of one session and persist it.
 * Idempotent: a stored graph that already covers the log's last seq is
 * returned as-is unless rebuild=true — the deterministic builder makes
 * rebuilds cheap and safe (same log → same nodes/edges).
 */
export async function ensureSessionGraph(
  deps: GraphServiceDeps,
  sessionId: string,
  rebuild = false,
  now = Date.now(),
): Promise<SessionGraph> {
  const snap = await deps.sessionQuery.readSession(sessionId as SessionId)
  if (!rebuild) {
    const existing = await deps.store.getGraph(sessionId)
    if (existing !== undefined && existing.seqEnd >= logSeqEnd(snap.events) && existing.version >= GRAPH_VERSION) return existing
  }
  const graph = buildSessionGraph(sessionId, snap.events, snap.session, now)
  await deps.store.upsertGraph(graph)
  await deps.store.markGraphBuilt(sessionId)
  return graph
}

/**
 * Batch build graphs for a workspace's sessions (newest-first, bounded).
 * Sessions whose stored graph already covers the log are skipped — a re-run
 * only folds sessions that grew since the last pass.
 */
export async function buildWorkspaceGraphs(
  deps: GraphServiceDeps,
  cwd: string,
  maxSessions = 200,
  now = Date.now(),
): Promise<BuildWorkspaceResult> {
  const records = await deps.sessionQuery.filterSessions([{ kind: 'cwd', values: [cwd] }])
  const list = records.slice(0, maxSessions)
  const result: BuildWorkspaceResult = { total: list.length, built: 0, skipped: 0, failed: 0 }
  for (const rec of list) {
    try {
      const snap = await deps.sessionQuery.readSession(rec.header.id)
      const existing = await deps.store.getGraph(rec.header.id)
      if (existing !== undefined && existing.seqEnd >= logSeqEnd(snap.events) && existing.version >= GRAPH_VERSION) {
        result.skipped += 1; continue
      }
      const graph = buildSessionGraph(rec.header.id, snap.events, snap.session, now)
      await deps.store.upsertGraph(graph)
      await deps.store.markGraphBuilt(rec.header.id)
      result.built += 1
    } catch {
      result.failed += 1
    }
  }
  return result
}
/**
 * Multi-session relations (M6 seed): for one session, resolve its parent
 * (forked from) and children (sessions whose graph header carries it as
 * parentSession) — the cross-session aggregation surface.
 */
export interface RelatedSession {
  sessionId: string
  title: string
  cwd?: string
}
export interface RelatedSessions {
  parent?: RelatedSession
  children: RelatedSession[]
}
export async function relatedSessions(store: TrackStore, sessionId: string): Promise<RelatedSessions> {
  const graphs = await store.listGraphs()
  const titleOf = (g: { sessionId: string; header: { cwd?: string }; nodes: Array<{ kind: string; title?: string }> }): string => {
    const root = g.nodes.find((n) => n.kind === 'session')
    return root?.title ?? g.sessionId
  }
  const self = graphs.find((g) => g.sessionId === sessionId)
  const children: RelatedSession[] = []
  for (const g of graphs) {
    if (g.header.parentSession === sessionId) children.push({ sessionId: g.sessionId, title: titleOf(g), cwd: g.header.cwd })
  }
  children.sort((a, b) => a.sessionId.localeCompare(b.sessionId))
  const parent = self?.header.parentSession
  let parentInfo: RelatedSession | undefined
  if (parent) {
    const p = graphs.find((g) => g.sessionId === parent)
    parentInfo = { sessionId: parent, title: p ? titleOf(p) : parent, cwd: p?.header.cwd }
  }
  return { parent: parentInfo, children }
}
