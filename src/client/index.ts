/**
 * Involute Bridge client plugin — browser half.
 *
 * Visible surfaces:
 * 1. A sidebar entry row ("Involute") injected below New Session — the
 *    primary entry point (sidebar slots are single-occupant; DOM injection
 *    is the task-board precedent).
 * 2. A center-column panel (capture wall + pending decisions + issues)
 *    toggled by the entry, fed by the host HTTP API (/api/involute/*).
 * 3. A composer-dock strip showing pending counts.
 * @module @deepseek-ai/dsh-involute/client
 */

import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// Type-only: pulls ui-conversation's SlotMap merge (composer.dock list slot).
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { InvoluteStripProps } from './strip-contract.ts'
import { InvoluteStrip } from './strip.tsx'
import { en, NS, zh, type InvoluteKey } from './locales.ts'
import { mountRightPanel } from './right-panel.ts'

export type { InvoluteStripProps } from './strip-contract.ts'
export type { InvoluteKey } from './locales.ts'

/** Required services: slot registration and locale dictionaries. */
export const inject = ['slots', 'locale']

/**
 * Client plugin body: sidebar entry + center panel + composer strip.
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  console.log('[dsh-involute] client apply called')
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-involute: dictionaries')

  // ---- right-side panel (lazyfish/side-panel pattern) ----
  const panelDisposer = mountRightPanel()
  ctx.effect(() => panelDisposer, 'dsh-involute: right panel')

  // Pending decision count for the composer strip (live poll of the host API).
  let pendingCount = 0
  const pollPending = (): void => {
    fetch('/api/involute/decisions')
      .then((r) => r.json())
      .then((d) => { pendingCount = (d.decisions ?? []).filter((x: { status: string }) => x.status === 'pending').length })
      .catch(() => undefined)
  }
  pollPending()
  const pendingTimer = window.setInterval(pollPending, 5000)
  ctx.effect(() => () => window.clearInterval(pendingTimer), 'dsh-involute: pending poll')

  // ---- composer-dock strip (counts) ----
  const injectActions = (): InvoluteStripProps => ({
    decisions: pendingCount,
    captures: 0,
  })
  ctx.slots.inject('conversation.composer.dock', () =>
    ctx.slots.register({
      name: 'conversation.composer.dock',
      id: 'involute',
      order: 20,
      locale: NS,
      inject: injectActions,
    }, InvoluteStrip))
}
