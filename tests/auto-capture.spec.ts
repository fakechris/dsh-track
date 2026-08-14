/**
 * Rule-based auto-capture tests — the todo_write signal produces captures
 * from the structured tool stream, dedupe, carry motivation context (live
 * cache + persisted-log seed), and dispose cleanly. Git branch creation is
 * NOT a signal (removed 2026-08-11 — execution carrier, not a requirement).
 * Pure rules: no timers, no LLM.
 * @module tests/auto-capture.spec
 */

import { describe, expect, it, vi } from 'vitest'
import { Context } from 'cordis'
import { createAutoCapture } from '../src/capture/observe.ts'
import type { TrackStore } from '../src/store.ts'

/** Fake store capturing createCapture payloads. */
function makeStore() {
  const captures: Array<Record<string, unknown>> = []
  return {
    captures,
    upsertCapture: vi.fn(async (c: Record<string, unknown>) => { captures.push(c) }),
    // The observer now gates every capture through createCapture (dedup).
    createCapture: vi.fn(async (c: Record<string, unknown>, _opts?: { dedupeBySession?: boolean }) => {
      captures.push(c)
      return { status: 'created', capture: c }
    }),
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
    expect(store.createCapture).toHaveBeenCalledTimes(1)
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
    expect(store.createCapture).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('captures per-session for different sessions', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 'session-a', 'todo_write', { todos: [{ content: 'plan A' }] })
    emitTool(ctx, 'session-b', 'todo_write', { todos: [{ content: 'plan B' }] })
    expect(store.createCapture).toHaveBeenCalledTimes(2)
    dispose()
  })

  it('does NOT capture git branch creation (signal removed — execution carrier, not a requirement)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    // Branch creation used to capture "新建分支 feat/…" but dominated the wall
    // with noise (9/17 in practice); todo_write covers the same work lines
    // with the requirement's own wording.
    emitTool(ctx, 'session-a', 'bash', { command: 'cd /repo && git worktree add -b feat/track-observability ../dsh-track-obs' })
    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b feat/a' })
    emitTool(ctx, 's2', 'bash', { command: 'git switch -c fix/b' })
    emitTool(ctx, 's1', 'bash', { command: 'git checkout -b main' })
    expect(store.createCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('ignores non-branch git commands and non-tool events', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    emitTool(ctx, 's1', 'bash', { command: 'git branch -d feat/gone' })
    emitTool(ctx, 's1', 'bash', { command: 'git checkout feat/existing' })
    ctx.emit('session/event', { id: 's1' }, { type: 'user/message', data: { text: 'hi' } })
    expect(store.createCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('ignores malformed arguments without throwing', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    ctx.emit('session/event', { id: 's1' }, { type: 'tool/call', data: { name: 'todo_write', arguments: 'not-json{' } })
    ctx.emit('session/event', { id: 's1' }, { type: 'tool/call', data: { name: 'bash', arguments: 'nope' } })
    expect(store.createCapture).not.toHaveBeenCalled()
    dispose()
  })

  it('dispose unregisters the listener', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })
    dispose()

    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: 'should not capture' }] })
    expect(store.createCapture).not.toHaveBeenCalled()
  })

  it('attaches the latest explicit user request as context (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    // A user request (source.kind === 'user') is the motivation context.
    ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: {
        id: 'msg-live-1',
        content: [{ type: 'text', text: '做一个模块，记录所有 track 发起的 llm 数据，计算开销' }],
        source: { kind: 'user' },
      },
    })
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '调研 StreamChunk usage/token 字段' }] })

    expect(store.createCapture).toHaveBeenCalledTimes(1)
    const cap = store.captures[0]!
    expect(cap.content).toBe('调研 StreamChunk usage/token 字段')
    expect(cap.context).toContain('记录所有 track 发起的 llm 数据')
    expect(cap.sourceMessageId).toBe('msg-live-1')
    dispose()
  })

  it('context is the LATEST full instruction, not the first (A)', () => {
    const ctx = new Context()
    const store = makeStore()
    const dispose = createAutoCapture(ctx, { store })

    const userMsg = (text: string) => ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: { content: [{ type: 'text', text }], source: { kind: 'user' } },
    })
    userMsg('第一件事：请整理 dsh-harness-ops 的文档目录结构')
    userMsg('第二件事：做一个 llm 用量计量模块，记录所有 track 发起的调用')
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '调研 StreamChunk usage/token 字段' }] })

    const cap = store.captures[0]!
    expect(cap.content).toBe('调研 StreamChunk usage/token 字段')
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

  it('seeds context from the persisted log on first signal (continued session)', async () => {
    const ctx = new Context()
    const store = makeStore()
    // Continued (spliced) session: no user/message flows through this process,
    // so seedContext backfills from the log (text + message id).
    const seedContext = vi.fn(async () => ({ text: '重启前的用户请求：做一个 llm 用量计量模块', id: 'msg-seed-9' }))
    const dispose = createAutoCapture(ctx, { store, seedContext })

    // Realistic splice: many events pass BEFORE the first signal — each
    // pre-warms the cache; the seed resolves before the todo_write lands.
    ctx.emit('session/event', { id: 's1' }, { type: 'turn/start' })
    await new Promise((r) => setTimeout(r, 10))
    expect(seedContext).toHaveBeenCalledWith('s1')

    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '调研 StreamChunk usage/token 字段' }] })
    const cap = store.captures[0]!
    expect(cap.content).toBe('调研 StreamChunk usage/token 字段')
    expect(cap.context).toContain('llm 用量计量模块')
    expect(cap.sourceMessageId).toBe('msg-seed-9')
    dispose()
  })

  it('seeds only once per session (seedContext not called repeatedly)', async () => {
    const ctx = new Context()
    const store = makeStore()
    const seedContext = vi.fn(async () => '用户意图 A')
    const dispose = createAutoCapture(ctx, { store, seedContext })

    ctx.emit('session/event', { id: 's1' }, { type: 'turn/start' })
    await new Promise((r) => setTimeout(r, 10))
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '需求 A 的完整描述' }] })
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '需求 B 的完整描述' }] })
    await new Promise((r) => setTimeout(r, 10))
    expect(seedContext).toHaveBeenCalledTimes(1)
    dispose()
  })

  it('live user/message beats the seed (cache updated by the stream)', async () => {
    const ctx = new Context()
    const store = makeStore()
    const seedContext = vi.fn(async () => ({ text: '旧意图（不该被用）', id: 'msg-stale-1' }))
    const dispose = createAutoCapture(ctx, { store, seedContext })

    // A real user request arrives AFTER the observer starts → cache is warm.
    ctx.emit('session/event', { id: 's1' }, {
      type: 'user/message',
      data: {
        id: 'msg-live-2',
        content: [{ type: 'text', text: '新意图：请修复侧边栏不可见的问题并补测试' }], source: { kind: 'user' },
      },
    })
    emitTool(ctx, 's1', 'todo_write', { todos: [{ content: '排查 side panel' }] })
    await new Promise((r) => setTimeout(r, 10))
    expect(seedContext).not.toHaveBeenCalled() // cache already warm
    const cap = store.captures[0]!
    expect(cap.context).toContain('修复侧边栏')
    expect(cap.sourceMessageId).toBe('msg-live-2')
    dispose()
  })
})
