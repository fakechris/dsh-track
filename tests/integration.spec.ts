/**
 * Integration smoke: mount a real storage hub + json backend + tools registry,
 * apply the involute plugin, and assert the four tools register and the
 * store round-trips through an actual json unit on disk.
 * @module tests/integration.spec
 */

import { describe, expect, it, beforeAll, afterAll } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Context } from 'cordis'
import Storage from '@deepseek-ai/dsh-storage'
import SystemPrompt from '@deepseek-ai/dsh-system-prompt'
import ToolRegistry from '@deepseek-ai/dsh-tools'
import { apply as applyStorageJson } from '@deepseek-ai/dsh-storage-json'
import { apply as applyInvolute } from '../src/index.ts'
import { involuteStore, store } from '../src/index.ts'

describe('involute integration with real storage', () => {
  let ctx: Context
  let dir: string

  beforeAll(async () => {
    dir = await mkdtemp(join(tmpdir(), 'involute-int-'))
    ctx = new Context()
    // Mount the service chain: storage hub → system-prompt → tool registry,
    // then the json backend, then involute.
    await ctx.plugin(Storage)
    await ctx.plugin(SystemPrompt)
    await ctx.plugin(ToolRegistry)
    applyStorageJson(ctx, { root: dir })
    applyInvolute(ctx, { teamKey: 'INV' } as never)
    // Let effects (store open) settle.
    await new Promise((r) => setTimeout(r, 20))
  })

  afterAll(async () => {
    await rm(dir, { recursive: true, force: true })
  })

  it('opens the involute kv unit on the json backend', async () => {
    // The plugin's apply opens the store in an effect; give the effect a tick.
    await new Promise((r) => setTimeout(r, 10))
    expect(store.isOpen).toBe(true)
  })

  it('registers the four involute tools on ctx.tools', () => {
    const registry = ctx.tools as unknown as { get: (name: string) => unknown }
    for (const name of ['capture_thought', 'report_decision_point', 'involute_create_issue', 'involute_list_issues']) {
      expect(registry.get(name), `tool ${name} should be registered`).toBeDefined()
    }
  })

  it('round-trips a capture and mints an identifier through the real unit', async () => {
    const id = await involuteStore.nextIdentifier('INV')
    expect(id).toMatch(/^INV-\d+$/)
  })

  it('writes a capture to the real json unit on disk and reads it back', async () => {
    const id = 'involute_capture_e2e_check'
    await involuteStore.upsertCapture({
      id,
      content: 'end-to-end check',
      source: 'user',
      status: 'open',
      tags: [],
      createdAt: new Date().toISOString(),
    })
    const caps = await involuteStore.listCaptures()
    expect(caps.some((c) => c.id === id)).toBe(true)
    expect(store.isOpen).toBe(true)
  })
})
