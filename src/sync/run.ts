/**
 * Sync pipeline — review workspace sessions and fold epic/issue-level task
 * history into the Track store.
 *
 * The "plugin command" entry: `track_sync_history` (model tool) and
 * `POST /api/track/sync` (panel) both funnel through `runSync`. The pipeline
 * is dependency-injected (session-query service + store) so it is testable
 * without a live harness, and dry-run-first so write-back stays human/track
 * confirmed (the triage discipline).
 * @module @deepseek-ai/dsh-track/sync/run
 */

import type { SessionQueryService } from '@deepseek-ai/dsh-session-query'
import type { TrackStore } from '../store.ts'
import type { Issue } from '../types.ts'
import { alignCandidates, mergeIntoIssue, type IssueAction } from './align.ts'
import { clusterWorklogs, normalizeTitle, type EpicCandidate, type IssueCandidate } from './cluster.ts'
import { extractWorklog } from './extract.ts'

/** Sync scope and write-back control. */
export interface SyncOptions {
  /** Exact workspace `cwd` to scan (same equality rule as session-query). */
  cwd: string
  /** Only fold sessions with activity after this epoch ms (default: 7 days ago). */
  since?: number
  /** Preview only — do not write. Default true. */
  dryRun?: boolean
  /** Safety cap on sessions scanned per run. */
  maxSessions?: number
}

/** Structured result of one sync run. */
export interface SyncReport {
  /** Sessions scanned (after cursor/since filtering). */
  scannedSessions: number
  /** Sessions skipped by the incremental cursor or `since`. */
  skippedByCursor: number
  /** Total user-initiated requests folded across scanned sessions. */
  userRequests: number
  /** Issue candidates produced by clustering. */
  issueCandidates: IssueCandidate[]
  /** Epic candidates produced by clustering. */
  epicCandidates: EpicCandidate[]
  /** Per-candidate reconcile action (create/update/skip). */
  actions: IssueAction[]
  /** Counts after write-back (dry-run reports what *would* happen). */
  created: number
  updated: number
  skipped: number
}

/** Minimal service surface runSync needs — easy to stub in tests. */
export interface SyncDeps {
  sessionQuery: Pick<SessionQueryService, 'filterSessions' | 'readSession' | 'readTitle'>
  store: TrackStore
  /** Optional refiner hook (LLM enhancement, P4); default identity. */
  refine?: (candidates: IssueCandidate[], epics: EpicCandidate[]) => Promise<{ issues: IssueCandidate[]; epics: EpicCandidate[] }>
}

const DEFAULT_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

/**
 * Run one sync pass.
 *
 * Pipeline: filterSessions(cwd) → readSession+readTitle per session →
 * extractWorklog → clusterWorklogs → alignCandidates → dry-run report or
 * write-back (upsert issues/epics + advance the cursor).
 */
export async function runSync(deps: SyncDeps, options: SyncOptions): Promise<SyncReport> {
  const { sessionQuery, store, refine } = deps
  const dryRun = options.dryRun ?? true
  const since = options.since ?? Date.now() - DEFAULT_WINDOW_MS
  const maxSessions = options.maxSessions ?? 200

  // ---- 1. enumerate sessions in this workspace ----
  const records = await sessionQuery.filterSessions([{ kind: 'cwd', values: [options.cwd] }])
  const cursor = (await store.readGlobal())?.lastSync?.[options.cwd] ?? 0
  const scanFrom = Math.max(since, cursor)

  // ---- 2. read logs + titles ----
  const worklogs = []
  const metas: Record<string, { id: string; title?: string; teamKey: string; createdAt: number }> = {}
  let skippedByCursor = 0

  for (const record of records) {
    if (worklogs.length >= maxSessions) break
    // newest-first; incremental: skip sessions fully before the cursor window
    const snapshot = await sessionQuery.readSession(record.header.id)
    const lastActivity = snapshot.events.at(-1)?.time ?? 0
    if (lastActivity <= scanFrom) {
      skippedByCursor += 1
      continue
    }
    const worklog = extractWorklog(record.header.id, snapshot.events)
    const title = await sessionQuery.readTitle(record.header.id)
    metas[record.header.id] = {
      id: record.header.id,
      title: title?.title,
      teamKey: 'INV',
      createdAt: record.header.createdAt ?? Date.now(),
    }
    worklogs.push(worklog)
  }

  const userRequests = worklogs.reduce((n, w) => n + w.requests.length, 0)

  // ---- 3. cluster ----
  let { epics, issues } = clusterWorklogs(worklogs, metas)

  // ---- 3b. optional refiner (LLM) ----
  if (refine) {
    const refined = await refine(issues, epics)
    issues = refined.issues
    epics = refined.epics
  }

  // ---- 4. align against existing store ----
  const existingIssues = await store.listIssues()
  const existingEpics = await store.listEpics()
  const aligned = alignCandidates(
    issues,
    existingIssues,
    epics,
    existingEpics.map((e) => normalizeTitle(e.name)),
  )

  const report: SyncReport = {
    scannedSessions: worklogs.length,
    skippedByCursor,
    userRequests,
    issueCandidates: issues,
    epicCandidates: epics,
    actions: aligned.actions,
    created: aligned.actions.filter((a) => a.kind === 'create').length,
    updated: aligned.actions.filter((a) => a.kind === 'update').length,
    skipped: aligned.actions.filter((a) => a.kind === 'skip').length,
  }

  if (dryRun) return report

  // ---- 5. write-back ----
  let created = 0
  let updated = 0
  for (const action of aligned.actions) {
    if (action.kind === 'create') {
      const issue: Issue = {
        id: `track_issue_${crypto.randomUUID().replaceAll('-', '')}`,
        identifier: await store.nextIdentifier('INV'),
        title: action.candidate.title,
        description: action.candidate.description,
        priority: action.candidate.priority,
        state: action.candidate.suggestedState,
        assignee: undefined,
        parentId: undefined,
        teamId: 'INV',
        labels: action.candidate.labels,
        acceptanceCriteria: undefined,
        linkedSessionIds: action.candidate.linkedSessionIds,
        createdAt: action.candidate.createdAt,
        updatedAt: action.candidate.updatedAt,
      }
      await store.upsertIssue(issue)
      created += 1
    } else if (action.kind === 'update') {
      const merged = mergeIntoIssue(action.existing, action.candidate)
      await store.upsertIssue(merged)
      updated += 1
    }
  }
  // Upsert epics (new ones only; existing kept as-is).
  for (const ea of aligned.epicActions) {
    if (ea.kind === 'create') {
      await store.upsertEpic({
        id: `track_epic_${crypto.randomUUID().replaceAll('-', '')}`,
        name: ea.candidate.name,
        description: ea.candidate.description,
        status: ea.candidate.status,
        teamId: 'INV',
        issueIds: [],
        createdAt: ea.candidate.createdAt,
        updatedAt: ea.candidate.updatedAt,
      })
    }
  }

  // ---- 6. advance cursor ----
  const global = (await store.readGlobal()) ?? {
    version: 1 as const,
    teams: {},
    identifierCounter: 0,
  }
  const newestActivity = worklogs.reduce((max, w) => Math.max(max, w.signals.lastActivityAt), 0)
  if (newestActivity > 0) {
    global.lastSync = { ...global.lastSync, [options.cwd]: newestActivity }
    await store.writeGlobal(global)
  }

  report.created = created
  report.updated = updated
  report.skipped = aligned.actions.filter((a) => a.kind === 'skip').length
  return report
}
