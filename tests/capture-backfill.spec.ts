/**
 * Capture context backfill tests — legacy open captures get context from
 * their source session logs; idempotent; session-less captures skipped.
 * @module tests/capture-backfill.spec
 */

import { describe, expect, it, vi } from 'vitest'
import { backfillCaptureContext } from '../src/capture/backfill.ts'
import { latestUserRequestFromEvents } from '../src/capture/context.ts'
import type { TrackStore } from '../src/store.ts'

function makeStore(captures: any[]) {
  const upserted: any[] = []
  return {
    captures,
    upserted,
    listCaptures: vi.fn(async () => captures),
    upsertCapture: vi.fn(async (c: any) => { upserted.push(c) }),
  } as unknown as TrackStore & { upserted: any[] }
}

const sessionQuery = (eventsBySession: Record<string, any[]>) => ({
  readSession: async (id: string) => ({ events: eventsBySession[id] ?? [] }),
})

const cap = (id: string, extra: any = {}) => ({
  id, content: `content-${id}`, source: 'session', status: 'open', tags: [],
  createdAt: '2026-01-01T00:00:00.000Z', ...extra,
})

describe('latestUserRequestFromEvents', () => {
  it('returns the most recent explicit user request', () => {
    const events = [
      { type: 'user/message', data: { content: [{ type: 'text', text: '第一个请求' }], source: { kind: 'user' } } },
      { type: 'user/message', data: { content: [{ type: 'text', text: '第二个请求' }], source: { kind: 'user' } } },
      { type: 'tool/call', data: { name: 'bash', arguments: '{}' } },
    ]
    expect(latestUserRequestFromEvents(events)).toBe('第二个请求')
  })

  it('ignores non-user sources (plugin/system injections)', () => {
    const events = [
      { type: 'user/message', data: { content: [{ type: 'text', text: '系统注入' }], source: { kind: 'plugin' } } },
      { type: 'user/message', data: { content: [{ type: 'text', text: '真实请求' }], source: { kind: 'user' } } },
    ]
    expect(latestUserRequestFromEvents(events)).toBe('真实请求')
  })

  it('returns undefined when there is no explicit user request', () => {
    expect(latestUserRequestFromEvents([])).toBeUndefined()
    expect(latestUserRequestFromEvents([{ type: 'tool/call', data: {} }])).toBeUndefined()
  })
})

describe('backfillCaptureContext', () => {
  const userMsg = (text: string) => ({
    type: 'user/message' as const,
    data: { content: [{ type: 'text' as const, text }], source: { kind: 'user' as const } },
  })

  it('fills context on legacy open captures from their session logs', async () => {
    const store = makeStore([
      cap('c1', { sourceSessionId: 's1' }),
      cap('c2', { sourceSessionId: 's2' }),
    ])
    const sq = sessionQuery({
      s1: [userMsg('s1 的请求')],
      s2: [userMsg('s2 的请求')],
    })
    const result = await backfillCaptureContext(store, sq)
    expect(result.scanned).toBe(2)
    expect(result.filled).toBe(2)
    expect(store.upserted[0]!.context).toBe('s1 的请求')
    expect(store.upserted[1]!.context).toBe('s2 的请求')
  })

  it('skips captures that already have context (idempotent)', async () => {
    const store = makeStore([
      cap('c1', { sourceSessionId: 's1', context: '已有' }),
      cap('c2', { sourceSessionId: 's2' }),
    ])
    const sq = sessionQuery({
      s2: [userMsg('s2 的请求')],
    })
    const result = await backfillCaptureContext(store, sq)
    expect(result.scanned).toBe(1) // c1 有 context，不算
    expect(result.filled).toBe(1)
    expect(store.upserted).toHaveLength(1)
  })

  it('skips captures without a source session, and counts skipped for no-request sessions', async () => {
    const store = makeStore([
      cap('c1'), // no sourceSessionId → not scanned
      cap('c2', { sourceSessionId: 's2' }), // session with no user request → skipped
    ])
    const sq = sessionQuery({ s2: [{ type: 'tool/call', data: {} }] })
    const result = await backfillCaptureContext(store, sq)
    expect(result.scanned).toBe(1)
    expect(result.filled).toBe(0)
    expect(result.skipped).toBe(1)
    expect(store.upserted).toHaveLength(0)
  })

  it('tolerates a missing sessionQuery (no-op with counts)', async () => {
    const store = makeStore([cap('c1', { sourceSessionId: 's1' })])
    const result = await backfillCaptureContext(store, undefined)
    expect(result.scanned).toBe(1)
    expect(result.filled).toBe(0)
    expect(result.skipped).toBe(1)
  })
})
