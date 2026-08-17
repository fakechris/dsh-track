/**
 * Calendar-yarn data (v1): perDay aggregation, segments from executed-in
 * issues, project switches. @module tests/calendar.spec
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import type { SessionEvent, SessionHeader } from '@deepseek-ai/dsh-session'
import { buildSessionGraph } from '../src/graph/build.ts'
import { buildCalendar } from '../src/graph/calendar.ts'
import { projectIdFor } from '../src/graph/projects.ts'
import { createPluginHarness } from './harness.ts'

const CWD = '/ws/cal'
const DAY = 86400000;
const BASE = new Date('2026-08-01T00:00:00Z').getTime();

describe('buildCalendar', () => {
  let store: Awaited<ReturnType<typeof createPluginHarness>>['store'];
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    const h = await createPluginHarness()
    store = h.store;
    dispose = h.dispose;
  })

  afterAll(async () => { await dispose() })

  it('groups sessions by day and derives segments/switches from issues', async () => {
    const projA = projectIdFor(CWD);
    await store.upsertProject({ id: projA, name: 'cal', path: CWD, sessionIds: ['c1'], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    const ev: SessionEvent[] = [
      { type: 'turn/start', seq: 1, time: BASE, data: { turn: 1 } },
      { type: 'user/message', seq: 2, time: BASE + 1000, data: { content: [{ type: 'text', text: '需求一' }], source: { kind: 'user' }, id: 'm1' } },
      { type: 'turn/end', seq: 3, time: BASE + 2000, data: { turn: 1, reason: { kind: 'completed' } } },
      { type: 'user/message', seq: 4, time: BASE + DAY + 1000, data: { content: [{ type: 'text', text: '需求二' }], source: { kind: 'user' }, id: 'm2' } },
    ] as unknown as SessionEvent[];
    const hdr: SessionHeader = { version: 0, id: 'c1', createdAt: BASE, cwd: CWD } as SessionHeader;
    await store.upsertGraph(buildSessionGraph('c1', ev, hdr, BASE + DAY + 2000));
    const issueA = { id: 'track_issue_ca', identifier: 'INV-1', title: '需求一', description: '', priority: 2, state: 'todo' as const, teamId: 'INV', labels: [], linkedSessionIds: ['c1'], projectId: projA, promptMessageId: 'm1', sourceSpan: { sessionId: 'c1', seqStart: 2, seqEnd: 3, kind: 'span' as const }, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() } as never;
    await store.upsertIssue(issueA);
    await store.upsertLink({ id: 'track_link_ca', fromType: 'issue', fromId: 'track_issue_ca', toType: 'session', toId: 'c1', kind: 'executed-in', createdAt: new Date().toISOString(), linkMethod: 'session-link' } as never);

    const cal = await buildCalendar(store);
    expect(cal.sessions).toHaveLength(1);
    const s = cal.sessions[0]!;
    expect(s.nReq).toBe(1);
    expect(s.segments[0]?.req).toBe('需求一');
    expect(s.segments[0]?.proj).toBe(projA);
    // Turn outcome captured (✓).
    expect(s.segments[0]?.turns.some((t) => t.outcome === 'completed')).toBe(true);
    // Active across two days (需求二 user message on day+1 counts as activity).
    expect(s.perDay.length).toBeGreaterThanOrEqual(2);
    expect(s.switches).toBe(0);
    // Yarn nodes = REQUIREMENTS (issue), not sessions.
    expect(cal.requirements).toHaveLength(1);
    expect(cal.requirements[0]?.req).toBe('需求一');
    expect(cal.requirements[0]?.proj).toBe(projA);
    // Day window derives from the DATA range (no empty leading days).
    expect(cal.days).toBeLessThanOrEqual(18);
    expect(cal.projects.some((p) => p.id === projA)).toBe(true);
  })
});
