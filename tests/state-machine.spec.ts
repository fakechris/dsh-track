/**
 * Lifecycle state machine tests (Part B, 2026-08-12) — pure functions over
 * Issue + EvidenceRef[]: composite confidence, todo → in_progress auto-commit,
 * done/canceled confirmation gating, freshness window, abandonment.
 * @module tests/state-machine.spec
 */

import { describe, expect, it } from 'vitest'
import {
  ABANDON_MS,
  compositeConfidence,
  describeEvidence,
  evidenceWeight,
  freshSignals,
  isAutoCommit,
  nextInferred,
} from '../src/lifecycle/state-machine.ts'
import type { Issue } from '../src/types.ts'

function makeIssue(partial: Partial<Issue> = {}): Issue {
  return {
    id: 'track_issue_t',
    identifier: 'INV-1',
    title: 't',
    description: '',
    priority: 2,
    state: 'todo',
    teamId: 'INV',
    labels: [],
    linkedSessionIds: [],
    createdAt: '2026-08-12T00:00:00.000Z',
    updatedAt: '2026-08-12T00:00:00.000Z',
    ...partial,
  }
}

const ev = (signal: Parameters<typeof evidenceWeight>[0], at: number, pointer?: string, target?: Parameters<typeof evidenceWeight>[1]) => ({
  signal,
  at,
  weight: evidenceWeight(signal, target),
  pointer,
})

describe('compositeConfidence', () => {
  it('combines independent positive signals', () => {
    // activity (0.2) + turn-completed (0.3): 1 - 0.8*0.7 = 0.44
    expect(compositeConfidence([ev('activity', 0), ev('turn-completed', 1)])).toBeCloseTo(0.44, 5)
  })

  it('user-confirm saturates to 1.0', () => {
    expect(compositeConfidence([ev('user-confirm', 0)])).toBe(1)
  })

  it('penalties subtract and clamp at 0', () => {
    expect(compositeConfidence([ev('tool-error', 0)])).toBe(0) // negative → clamped
    const heavy = [ev('tool-error', 0), ev('tool-error', 1), ev('turn-error', 2), ev('turn-error', 3), ev('timeout', 4)]
    expect(compositeConfidence(heavy)).toBe(0)
  })
})

describe('nextInferred', () => {
  const now = 1_800_000_000_000

  it('todo → in_progress auto-commits with enough fresh evidence', () => {
    const issue = makeIssue({ state: 'todo' })
    // activity(0.2) ×2 + turn-completed(0.3) → 1 − 0.8·0.8·0.7 = 0.552 ≥ 0.5
    const signals = [ev('activity', now - 2000), ev('activity', now - 1000), ev('turn-completed', now)]
    const next = nextInferred(issue, signals, now)
    expect(next.inferred.state).toBe('in_progress')
    expect(isAutoCommit(next, issue)).toBe(true)
    expect(next.confirm).toBeUndefined()
  })

  it('todo stays todo with weak evidence', () => {
    const issue = makeIssue({ state: 'todo' })
    const next = nextInferred(issue, [ev('activity', now)], now)
    expect(next.inferred.state).toBe('todo')
    expect(isAutoCommit(next, issue)).toBe(false)
  })

  it('in_progress → done proposal requires todo-all-done + turn-completed and gates confirmation', () => {
    const issue = makeIssue({ state: 'in_progress' })
    const signals = [ev('todo-all-done', now - 2000), ev('turn-completed', now - 1000), ev('turn-completed', now)]
    const next = nextInferred(issue, signals, now)
    expect(next.inferred.state).toBe('done')
    expect(next.confirm?.to).toBe('done')
    expect(isAutoCommit(next, issue)).toBe(false) // never auto-commits done
  })

  it('user-confirm alone on in_progress produces a done proposal (still gated)', () => {
    const issue = makeIssue({ state: 'in_progress' })
    const next = nextInferred(issue, [ev('user-confirm', now)], now)
    expect(next.inferred.state).toBe('done')
    expect(next.confirm?.to).toBe('done')
  })

  it('penalties keep an in-progress issue from proposing done', () => {
    const issue = makeIssue({ state: 'in_progress' })
    const signals = [
      ev('todo-all-done', now - 2000),
      ev('turn-completed', now - 1000),
      ev('turn-error', now), // fresh penalty drags confidence down
    ]
    const next = nextInferred(issue, signals, now)
    expect(next.inferred.state).toBe('in_progress')
    expect(next.confirm).toBeUndefined()
  })

  it('abandonment proposes canceled (gated), never auto-cancels', () => {
    const issue = makeIssue({ state: 'in_progress', lastProgressAt: now - ABANDON_MS - 1000 })
    const next = nextInferred(issue, [ev('activity', now - ABANDON_MS - 1000)], now)
    expect(next.inferred.state).toBe('canceled')
    expect(next.confirm?.to).toBe('canceled')
    expect(isAutoCommit(next, issue)).toBe(false)
  })

  it('done/canceled issues do not get canceled proposals', () => {
    for (const state of ['done', 'canceled'] as const) {
      const issue = makeIssue({ state, lastProgressAt: now - ABANDON_MS - 1000 })
      const next = nextInferred(issue, [], now)
      expect(next.inferred.state).toBe(state)
      expect(next.confirm).toBeUndefined()
    }
  })

  it('model proposal for done carries zero weight (no done via propose)', () => {
    const issue = makeIssue({ state: 'in_progress' })
    const signals = [ev('model-propose', now, 'done', 'done')]
    const next = nextInferred(issue, signals, now)
    expect(next.inferred.state).toBe('in_progress')
    expect(next.confirm).toBeUndefined()
  })

  it('model proposal for in_progress counts toward auto-advance from todo', () => {
    const issue = makeIssue({ state: 'todo' })
    const signals = [ev('model-propose', now, 'in_progress', 'in_progress'), ev('activity', now - 1000)]
    const next = nextInferred(issue, signals, now)
    expect(next.inferred.state).toBe('in_progress')
  })
})

describe('freshSignals / describeEvidence', () => {
  it('drops signals outside the 24h window', () => {
    const now = 1_800_000_000_000
    const old = ev('activity', now - 25 * 3600 * 1000)
    const fresh = freshSignals([old, ev('activity', now - 1000)], now)
    expect(fresh).toHaveLength(1)
  })

  it('summarizes evidence for the confirm prompt', () => {
    const now = 1_800_000_000_000
    expect(describeEvidence([ev('todo-all-done', now), ev('turn-completed', now), ev('turn-completed', now - 1)]))
      .toBe('todo-all-done, turn-completed×2')
  })
})
