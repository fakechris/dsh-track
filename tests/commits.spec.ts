/**
 * M3 — git artifact scan: parse commit lines, session/issue alignment,
 * idempotence, dry-run, and the git-runner error path (no real git exec).
 * @module tests/commits.spec
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import { buildSessionGraph } from '../src/graph/build.ts'
import { parseCommitLines, scanProjectCommits, commitIdFor, type GitRunner } from '../src/graph/commits.ts'
import { createPluginHarness } from './harness.ts'

const CWD = '/ws/repo-a'
const SHA = 'abc123def456abc123def456abc123def456abc1'

const hdr: SessionHeader = { version: 0, id: 'c-sess-1', createdAt: 1000, cwd: CWD } as SessionHeader
const events = [
  { type: 'turn/start', seq: 1, time: 1010, data: { turn: 1 } },
  { type: 'user/message', seq: 2, time: 1500, data: { content: [{ type: 'text', text: '实现 X' }], source: { kind: 'user' }, id: 'msg-x' } },
] as unknown as SessionEvent[]

const fakeGit: GitRunner = () => SHA + '\0' + new Date(1500).toISOString() + '\0feat: 实现 X 功能\n'

describe('parseCommitLines', () => {
  it('parses NUL-separated lines and drops malformed ones', () => {
    const raw = SHA + '\0' + new Date(1500).toISOString() + '\0feat: 实现 X\n'
    const commits = parseCommitLines(raw, CWD)
    expect(commits).toHaveLength(1)
    expect(commits[0]?.sha).toBe(SHA)
    expect(commits[0]?.authorAt).toBe(1500)
    expect(commits[0]?.subject).toBe('feat: 实现 X')
    expect(commits[0]?.id).toBe(commitIdFor(SHA))
    expect(parseCommitLines('badline\n', CWD)).toHaveLength(0)
  })
});

describe('scanProjectCommits', () => {
  let store: Awaited<ReturnType<typeof createPluginHarness>>['store'];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    const h = await createPluginHarness()
    store = h.store;
    dispose = h.dispose;
  })

  afterAll(async () => { await dispose() })

  it('links commits to sessions by time window and to issues by title overlap', async () => {
    await store.upsertGraph(buildSessionGraph('c-sess-1', events, hdr, 5000))
    await store.upsertIssue({
      id: 'track_issue_c1',
      identifier: 'INV-9',
      title: '实现 X',
      description: '',
      priority: 2,
      state: 'todo' as const,
      teamId: 'INV',
      labels: [],
      linkedSessionIds: ['c-sess-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as never)

    const result = await scanProjectCommits(store, CWD, { runGit: fakeGit })
    expect(result.error).toBeUndefined()
    expect(result.commits).toBe(1)
    expect(result.sessionsLinked).toBe(1)
    expect(result.issuesLinked).toBe(1)
    const links = await store.listLinks()
    expect(links.some((l) => l.kind === 'landed-in' && l.fromType === 'session' && l.fromId === 'c-sess-1' && l.toType === 'commit')).toBe(true)
    expect(links.some((l) => l.kind === 'implements' && l.fromType === 'issue' && l.fromId === 'track_issue_c1' && l.toType === 'commit')).toBe(true)
    expect((await store.listCommits()).some((c) => c.sha === SHA)).toBe(true)
  })

  it('is idempotent — re-scan writes the same logical links', async () => {
    const before = (await store.listLinks()).length
    const again = await scanProjectCommits(store, CWD, { runGit: fakeGit })
    expect(again.sessionsLinked).toBe(1)
    expect(again.issuesLinked).toBe(1)
    expect((await store.listLinks()).length).toBe(before)
    expect((await store.listCommits()).length).toBe(1)
  })

  it('dry-run previews without writing', async () => {
    const commitsBefore = (await store.listCommits()).length
    const preview = await scanProjectCommits(store, CWD, { dryRun: true, runGit: fakeGit })
    expect(preview.commits).toBe(1)
    expect((await store.listCommits()).length).toBe(commitsBefore)
  })

  it('surfaces git errors instead of throwing', async () => {
    const failing: GitRunner = () => { throw new Error('not a git repo') }
    const result = await scanProjectCommits(store, '/no/git', { runGit: failing })
    expect(result.error).toContain('not a git repo')
    expect(result.commits).toBe(0)
  })
});
