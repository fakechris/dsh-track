/**
 * Rule-based auto-capture tests — todo_write and git-branch signals produce
 * captures from the structured tool stream, dedupe, skip housekeeping, and
 * dispose cleanly. Pure rules: no timers, no LLM.
 * @module tests/auto-capture.spec
 */

import { describe, expect, it, vi } from 'vitest'
import { Context } from 'cordis'
import { createAutoCapture } from '../src/capture/observe.ts'
import type { TrackStore } from '../src/store.ts'

/** Fake store capturing upsertCapture payloads. */
function makeStore() {
  const captures: Array<Record<string, unknown>> = []
  return {
    captures,
    upsertCapture: vi.fn(async (c: Record<string, unknown>) => { captures.push(c) }),
  } as unknown as TrackStore & { captures: Array<Record<string, unknown>> }
}

/** Emit a tool/call through the observer with a session stub. */
function emitTool(ctx: Context, sessionId: string, name: string, args: unknown): void {
  ctx.emit('session/event', { id: sessionId }, {
    type: 'tool/call',
    data: { name, arguments: JSON.stringify(args) },
  })
}

describe('createAutoCapture', () => {
  it('captures the first todo_write per session (planning signal)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 'session-a', 'todo_write', {
      todos: [
        { content: 'Create feature worktree (feat/right-panel-actions)', status: 'in_progress' },
        { content: 'Server: add routes', status: 'pending' },
      ],
    })
    expect(store.upsertCapture).toHaveBeenCalledTimes(1)
    const cap = store.captures[0]!
    expect(cap.content).toBe('Create feature worktree (feat/right-panel-actions)')
    expect(cap.source).toBe('session')
    expect(cap.sourceSessionId).toBe('session-a')
    expect(cap.tags).toContain('todo')
    expect(cap.status).toBe('open')
    dispose()
  })

  it('dedupes repeated todo_write calls within one session', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 'session-a', 'todo_write', { todos: [{ content: 'first plan' }] })
    emitTool(ctx, 'session-a', 'todo_write', { todos: [{ content: 'updated plan' }] })
    expect(store.upsertCapture).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('captures per-session for different sessions', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 'session-a', 'todo_write', { todos: [{ content: 'plan A' }] })
    emitTool(ctx, 'session-b', 'todo_write', { todos: [{ content: 'plan B' }] })
    expect(store.upsertCapture).toHaveBeenCalledTimes(2)
    dispose()
  })

  it('captures git branch creation from bash commands (execution signal)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 'session-a', 'bash', { command: 'cd /repo && git worktree add -b feat/track-observability ../dsh-track-obs' })
    expect(store.upsertCapture).toHaveBeenCalledTimes(1)
    expect(store.captures[0]!.content).toBe('新建分支 feat/track-observability')
    expect(store.captures[0]!.tags).toContain('git-branch')
    dispose()
  })

  it('matches git checkout -b and git switch -c variants', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b feat/a' })
    emitTool(ctx, 's2', 'bash', { command: 'git switch -c fix/b' })
    expect(store.upsertCapture).toHaveBeenCalledTimes(2)
    expect(store.captures.map((c) => c.content)).toEqual(['新建分支 feat/a', '新建分支 fix/b'])
    dispose()
  })

  it('dedupes the same branch name across sessions', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b feat/dup' })
    emitTool(ctx, 's2', 'bash', { command: 'git worktree add -b feat/dup ../x' })
    expect(store.upsertCapture).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('skips housekeeping branches (main/master)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b main' })
    emitTool(ctx, 's2', 'bash', { command: 'git checkout -b master' })
    expect(store.upsertCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('ignores non-branch git commands and non-tool events', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'bash', { command: 'git branch -d feat/gone' })
    emitTool(ctx, 's1', 'bash', { command: 'git checkout feat/existing' })
    ctx.emit('session/event', { id: 's1' }, { type: 'user/message', data: { text: 'hi' } })
    expect(store.upsertCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('ignores malformed arguments without throwing', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    ctx.emit('session/event', { id: 's1' }, { type: 'tool/call', data: { name: 'todo_write', arguments: 'not-json{' } })
    ctx.emit('session/event', { id: 's1' }, { type: 'tool/call', data: { name: 'bash', arguments: 'nope' } })
    expect(store.upsertCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('dispose unregisters the listener', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })
    dispose()

    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: 'should not capture' }] })
    expect(store.upsertCapture).not.toHaveBeenCalled()
  })

  it('attaches the latest explicit user request as context (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    // A user request (source.kind === 'user') is the motivation context.
    ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: {
        content: [{ type: 'text', text: '做一个模块，记录所有 track 发起的 llm 数据，计算开销' }],
        source: { kind: 'user' },
      },
    })
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '调研 StreamChunk usage/token 字段' }] })

    expect(store.upsertCapture).toHaveBeenCalledTimes(1)
    const cap = store.captures[0]!
    expect(cap.content).toBe('调研 StreamChunk usage/token 字段')
    expect(cap.context).toContain('记录所有 track 发起的 llm 数据')
    dispose()
  })

  it('context is the LATEST user request, not the first (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    const userMsg = (text: string) => ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: { content: [{ type: 'text', text }], source: { kind: 'user' } },
    })
    userMsg('第一件事：整理文档')
    userMsg('第二件事：做一个 llm 用量计量模块')
    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b feat/track-llm-usage' })

    const cap = store.captures[0]!
    expect(cap.context).toContain('llm 用量计量模块')
    expect(cap.context).not.toContain('整理文档')
    dispose()
  })

  it('plugin/system user/message events do NOT become context (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    // system-reminder style: no source.kind === 'user' → ignored.
    ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: { content: [{ type: 'text', text: 'The following workspace instructions…' }], source: { kind: 'plugin' } },
    })
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '做 X' }] })

    const cap = store.captures[0]!
    expect(cap.context).toBeUndefined()
    dispose()
  })

  it('context-less capture (no prior user request) still captures (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '开头的需求' }] })
    const cap = store.captures[0]!
    expect(cap.content).toBe('开头的需求')
    expect(cap.context).toBeUndefined()
    dispose()
  })
})
