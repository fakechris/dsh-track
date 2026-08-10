/**
 * Alignment — reconcile clustered candidates against the existing Track store
 * so a re-run is idempotent: a session already linked to an issue updates that
 * issue instead of creating a duplicate.
 * @module @deepseek-ai/dsh-track/sync/align
 */

import type { Issue, IssueState } from '../types.ts'
import type { EpicCandidate, IssueCandidate } from './cluster.ts'
import { normalizeTitle } from './cluster.ts'

/** What to do with one candidate. */
export type IssueAction =
  | { kind: 'create'; candidate: IssueCandidate }
  | { kind: 'update'; candidate: IssueCandidate; existing: Issue; changes: string[] }
  | { kind: 'skip'; candidate: IssueCandidate; existing: Issue; reason: string }

export interface AlignResult {
  /** One action per candidate, in input order. */
  actions: IssueAction[]
  /** Epic candidates that exist (matched by key) vs new. */
  epicActions: Array<
    | { kind: 'create'; candidate: EpicCandidate; existingKey?: undefined }
    | { kind: 'skip'; candidate: EpicCandidate; existingKey: string }
  >
}

/**
 * Reconcile candidates against existing issues.
 *
 * Match rules (v1):
 * - `linkedSessionIds` contains the candidate's session → update (session already tracked).
 * - Otherwise, normalized-title equality → update (same work, new session folded in).
 * - Otherwise → create.
 *
 * State evolution: a candidate never downgrades an existing issue's state, and
 * never auto-moves an existing issue to `done` (that stays human-confirmed).
 */
export function alignCandidates(
  candidates: IssueCandidate[],
  existingIssues: Issue[],
  epicCandidates: EpicCandidate[] = [],
  existingEpicKeys: readonly string[] = [],
): AlignResult {
  const bySession = new Map<string, Issue>()
  const byTitle = new Map<string, Issue>()
  for (const issue of existingIssues) {
    for (const sid of issue.linkedSessionIds ?? []) bySession.set(sid, issue)
    byTitle.set(normalizeTitle(issue.title), issue)
  }

  const existingEpicKeySet = new Set(existingEpicKeys)

  const actions: IssueAction[] = candidates.map((candidate) => {
    const sessionMatch = bySession.get(candidate.sessionId)
    if (sessionMatch) {
      const changes = diffChanges(sessionMatch, candidate)
      return {
        kind: 'update',
        candidate,
        existing: sessionMatch,
        changes: changes.length ? changes : ['no field changes'],
      }
    }
    const titleMatch = byTitle.get(normalizeTitle(candidate.title))
    if (titleMatch) {
      const changes = diffChanges(titleMatch, candidate)
      return {
        kind: 'update',
        candidate,
        existing: titleMatch,
        changes: changes.length ? changes : ['no field changes'],
      }
    }
    return { kind: 'create', candidate }
  })

  const epicActions: AlignResult['epicActions'] = epicCandidates.map((candidate) => {
    if (existingEpicKeySet.has(candidate.key)) {
      return { kind: 'skip', candidate, existingKey: candidate.key }
    }
    return { kind: 'create', candidate, existingKey: undefined }
  })

  return { actions, epicActions }
}

/** Compute the human-readable field changes between an existing issue and its candidate. */
function diffChanges(existing: Issue, candidate: IssueCandidate): string[] {
  const changes: string[] = []
  if (existing.state !== candidate.suggestedState) {
    changes.push(`state ${existing.state} → ${candidate.suggestedState}`)
  }
  const newSessions = candidate.linkedSessionIds.filter((id) => !(existing.linkedSessionIds ?? []).includes(id))
  if (newSessions.length) changes.push(`link sessions ${newSessions.join(', ')}`)
  if (existing.title !== candidate.title) changes.push(`title "${existing.title}" → "${candidate.title}"`)
  if (!existing.description && candidate.description) changes.push('add description')
  return changes
}

/** Merge an update action's candidate into the existing issue shape. */
export function mergeIntoIssue(existing: Issue, candidate: IssueCandidate): Issue {
  const linkedSessionIds = Array.from(new Set([...(existing.linkedSessionIds ?? []), ...candidate.linkedSessionIds]))
  // State evolution: promote, never demote, and never auto-done.
  const state = promoteState(existing.state, candidate.suggestedState)
  return {
    ...existing,
    state,
    linkedSessionIds,
    description: existing.description || candidate.description,
    labels: Array.from(new Set([...existing.labels, ...candidate.labels])),
    updatedAt: new Date().toISOString(),
  }
}

/** next = candidate suggestion; keep existing unless the candidate strictly advances. */
function promoteState(existing: IssueState, suggested: IssueState): IssueState {
  if (existing === suggested) return existing
  const rank: Record<IssueState, number> = { todo: 0, in_progress: 1, done: 2, canceled: 3 }
  return rank[suggested] > rank[existing] && suggested !== 'done' ? suggested : existing
}
