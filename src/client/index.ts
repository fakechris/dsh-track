/**
 * Involute Bridge client plugin — browser half. Registers the Involute strip
 * into the conversation composer dock (a `list` slot where ui-goal already
 * sits), surfacing decision-point and capture-wall state with an interaction
 * affordance. This is the visible entry point of the embedded task engine.
 *
 * Phase 0b scope: the strip renders pending-decision count + capture count
 * with a click affordance; live counts ride the session projection when the
 * host contributes one, and fall back to an empty state otherwise.
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

export type { InvoluteStripProps } from './strip-contract.ts'
export type { InvoluteKey } from './locales.ts'

/** Required services: slot registration and locale dictionaries. */
export const inject = ['slots', 'locale']

/**
 * Register the Involute strip into the composer dock once the dock slot is on
 * the ledger (declaration-aware, same pattern as the subagent tree plugin).
 * @param ctx - client root context.
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-involute: dictionaries')

  const injectActions = (): InvoluteStripProps => ({
    // Phase 0b: static surface. The host-side decision/capture counts are
    // wired through the api-remotes RPC in the next step; until then the strip
    // renders the empty state with the affordance visible.
    decisions: 0,
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
