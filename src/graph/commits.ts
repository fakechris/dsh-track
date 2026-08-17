/**
 * M3 — git artifact scan: read a project's commit log, persist commits, and
 * align them with sessions (activity time window → landed-in) and issues
 * (title token overlap + session-window → implements). The git runner is
 * injected so tests never exec git; production uses execFileSync.
 * @module @fakechris/dsh-track/graph/commits
 */

import { execFileSync } from 'node:child_process'
import { hashCanonical } from '../sync/raw-event.ts'
import { contentTokens } from '../sync/align.ts'
import { titleSimilarity } from '../store.ts'
import { semanticLinkId } from './links.ts'
import { projectIdFor } from './projects.ts'
import type { TrackStore } from '../store.ts'
import type { CommitArtifact, Link } from '../types.ts'

/** Git command runner — injectable (tests use a fake; prod execs git). */
export type GitRunner = (args: string[]) => string

export const defaultGitRunner: GitRunner = (args) =>
  execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

export interface CommitScanResult {
  commits: number
  sessionsLinked: number
  issuesLinked: number
  byKind: Record<string, number>
  error?: string
}

/** Grace added to a session's last-activity window when matching commits. */
export const SESSION_GRACE_MS = 10 * 60 * 1000

/** Title-overlap threshold for issue → commit implements links. */
export const IMPLEMENTS_OVERLAP = 0.5

export function commitIdFor(sha: string): string {
  return 'track_commit_' + hashCanonical([sha])
}

/**
 * Parse `git log --format=%H%x00%aI%x00%s` output lines into commit artifacts.
 */
export function parseCommitLines(raw: string, repo: string): CommitArtifact[] {
  return raw.split('\n').filter(Boolean).map((line) => {
    const [sha, dateIso, subject] = line.split('\0')
    const authorAt = Date.parse(dateIso ?? '')
    if (!sha || !Number.isFinite(authorAt)) return undefined
    return {
      id: commitIdFor(sha),
      sha,
      projectId: projectIdFor(repo),
      repo,
      authorAt,
      subject: (subject ?? '').slice(0, 200),
      createdAt: new Date().toISOString(),
    }
  }).filter((c): c is CommitArtifact => c !== undefined)
}

/**
 * Scan one project repo: persist commits, then align with sessions (time
 * window) and issues (title overlap / session window). Idempotent: commit ids
 * and link ids are deterministic hashes.
 * @param store track store.
 * @param cwd repo working directory.
 * @param opts dryRun previews counts without writing; limit caps the log;
 *        runGit injects the git runner (default execs git).
 */
export async function scanProjectCommits(
  store: TrackStore,
  cwd: string,
  opts: { dryRun?: boolean; limit?: number; runGit?: GitRunner } = {},
): Promise<CommitScanResult> {
  const runGit = opts.runGit ?? defaultGitRunner
  const limit = opts.limit ?? 200
  const dryRun = opts.dryRun ?? false
  let raw: string
  try {
    raw = runGit(['-C', cwd, 'log', '--max-count=' + limit, '--format=%H%x00%aI%x00%s'])
  } catch (e) {
    return { commits: 0, sessionsLinked: 0, issuesLinked: 0, byKind: {}, error: e instanceof Error ? e.message : String(e) }
  }
  const commits = parseCommitLines(raw, cwd)
  const byKind: Record<string, number> = {}
  let count = 0;
  const put = async (fromType: Link['fromType'], fromId: string, toType: Link['toType'], toId: string, kind: Link['kind'], eventTime?: number, linkMethod?: string): Promise<void> => {
    count += 1;
    byKind[kind] = (byKind[kind] ?? 0) + 1;
    if (dryRun) return
    const link: Link = {
      id: semanticLinkId(fromType, fromId, toType, toId, kind),
      fromType, fromId, toType, toId, kind,
      createdAt: new Date().toISOString(),
      eventTime,
      ingestedAt: new Date().toISOString(),
      linkMethod: linkMethod ?? 'deterministic',
    }
    await store.upsertLink(link)
  };
  if (!dryRun) {
    for (const c of commits) await store.upsertCommit(c)
  }

  // Session alignment: commits whose author date falls inside a session's
  // activity window [createdAt, lastActivityAt + grace] landed in that session.
  const graphs = await store.listGraphs()
  const cwdGraphs = graphs.filter((g) => g.header.cwd === cwd)
  let sessionsLinked = 0;
  for (const g of cwdGraphs) {
    const start = g.header.createdAt;
    // lastActivityAt is present on v2+ graphs; conservative fallback = no window.
    const end = (g.lastActivityAt ?? g.header.createdAt) + SESSION_GRACE_MS;
    for (const c of commits) {
      if (c.authorAt >= start && c.authorAt <= end) {
        await put('session', g.sessionId, 'commit', c.id, 'landed-in', c.authorAt, 'commit-window')
        sessionsLinked += 1;
      }
    }
  }

  // Issue alignment: a commit implements an issue when its subject overlaps
  // the title (token similarity) OR it landed in a session that executed the
  // issue (the session-window rule above).
  const issues = await store.listIssues()
  let issuesLinked = 0;
  const commitById = new Map(commits.map((c) => [c.id, c]));
  for (const i of issues) {
    const issueSessions = new Set(i.linkedSessionIds ?? []);
    const titleTokens = contentTokens(i.title);
    for (const c of commits) {
      const windowHit = [...issueSessions].some((sid) => {
        const g = cwdGraphs.find((x) => x.sessionId === sid);
        return g !== undefined && c.authorAt >= g.header.createdAt && c.authorAt <= (g.lastActivityAt ?? g.header.createdAt) + SESSION_GRACE_MS;
      });
      const overlapHit = titleSimilarity(titleTokens, contentTokens(c.subject)) >= IMPLEMENTS_OVERLAP;
      if (windowHit || overlapHit) {
        await put('issue', i.id, 'commit', c.id, 'implements', c.authorAt, windowHit ? 'commit-window' : 'title-overlap')
        issuesLinked += 1;
      }
    }
    void commitById;
  }

  return { commits: commits.length, sessionsLinked, issuesLinked, byKind }
}
