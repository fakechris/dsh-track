/**
 * Phase 0b auto-aggregation tests — the session/event observer schedules a
 * dry-run sync after idle, appends a `track/sync-preview` event, never reacts
 * to its own appends, throttles per workspace, and disposes cleanly.
 * @module tests/auto-sync.spec
 */

import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { Context } from 'cordis'
import { createAutoSync, type AutoSyncDeps, type SyncPreview } from '../src/sync/auto.ts'
import type { SyncOptions, SyncReport } from '../src/sync/run.ts'

/** Minimal session stub with a header and an append recorder. */
function makeSession(cwd: string, appends: Array<{ type: string; data: unknown }>) {
  return {
    header: { cwd },
    append: (type: string, data: unknown) => { appends.push({ type, data }) },
  }
}

const report = (overrides: Partial<SyncReport> = {}): SyncReport => ({
  scannedSessions: 1,
  skippedByCursor: 0,
  userRequests: 1,
  issueCandidates: [{ title: 'candidate one' } as never],
  epicCandidates: [],
  actions: [],
  created: 1,
  updated: 0,
  skipped: 0,
  promotedCaptures: 0,
  ...overrides,
})

function makeDeps(overrides: Partial<AutoSyncDeps> = {}): AutoSyncDeps & { run: ReturnType<typeof vi.fn> } {
  const run = vi.fn(async (options: SyncOptions) => report({ created: options.dryRun ? 1 : 1 }))
  return {
    store: {} as never,
    getSessionQuery: () => ({ /* stub session-query */ }),
    runSync: run as never,
    run,
    ...overrides,
  }
}

describe('createAutoSync', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('runs a dry-run sync after the idle window and appends a preview event', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(1000)

    expect(deps.run).toHaveBeenCalledTimes(1)
    expect(deps.run.mock.calls[0]![0]).toMatchObject({ cwd: '/ws', dryRun: true })
    expect(appends).toHaveLength(1)
    const preview = appends[0]!.data as SyncPreview
    expect(preview.cwd).toBe('/ws')
    expect(preview.engine).toBe('v1')
    expect(preview.titles).toContain('candidate one')
    dispose()
  })

  it('ignores track/* events (reentrancy guard)', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    // The preview event itself flows back through session/event.
    ctx.emit('session/event', session, { type: 'track/sync-preview', seq: 1, time: 1, data: {} })
    await vi.advanceTimersByTimeAsync(1000)

    expect(deps.run).not.toHaveBeenCalled()
    dispose()
  })

  it('does not run without a cwd', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession(undefined as never, appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(1000)

    expect(deps.run).not.toHaveBeenCalled()
    dispose()
  })

  it('resets the idle window on new activity (debounce)', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(900)
    ctx.emit('session/event', session, { type: 'tool/call', seq: 1, time: 900, data: {} })
    await vi.advanceTimersByTimeAsync(900) // still before the second event's idle window

    expect(deps.run).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(200) // crosses the 1000ms idle after the last event
    expect(deps.run).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('throttles repeated previews per workspace within the cooldown', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000, cooldownMs: 60_000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(1000)
    expect(deps.run).toHaveBeenCalledTimes(1)

    // Second idle cycle within cooldown → no second preview.
    ctx.emit('session/event', session, { type: 'user/message', seq: 2, time: 2000, data: {} })
    await vi.advanceTimersByTimeAsync(1000)
    expect(deps.run).toHaveBeenCalledTimes(1)
    expect(appends).toHaveLength(1)
    dispose()
  })

  it('does not append when there are no candidates', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps({
      runSync: vi.fn(async () => report({ issueCandidates: [], created: 0 })) as never,
    })
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(1000)

    expect(deps.runSync).toHaveBeenCalledTimes(1)
    expect(appends).toHaveLength(0)
    dispose()
  })

  it('dispose cancels pending timers', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const deps = makeDeps()
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    dispose()
    await vi.advanceTimersByTimeAsync(1000)

    expect(deps.run).not.toHaveBeenCalled()
  })

  it('survives a failing sync (logged, no throw into the emitter)', async () => {
    const ctx = new Context()
    const appends: Array<{ type: string; data: unknown }> = []
    const session = makeSession('/ws', appends)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const deps = makeDeps({
      runSync: vi.fn(async () => { throw new Error('boom') }) as never,
    })
    const dispose = createAutoSync(ctx, deps, { idleMs: 1000 })

    ctx.emit('session/event', session, { type: 'user/message', seq: 0, time: 0, data: {} })
    await vi.advanceTimersByTimeAsync(1000)

    expect(errorSpy).toHaveBeenCalled()
    expect(appends).toHaveLength(0)
    errorSpy.mockRestore()
    dispose()
  })
})
