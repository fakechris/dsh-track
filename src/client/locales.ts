/**
 * Track strip copy — locale keys and zh/en dictionaries.
 * @module @deepseek-ai/dsh-track/client/locales
 */

// Type-only: the LocaleNamespaceMap merge target lives on ui-slots.
import type {} from '@deepseek-ai/dsh-client-ui-slots'

/** Simplified Chinese dictionary (the key-set source of truth). */
export const zh = {
  'strip.label': 'Track',
  'strip.decisions': '{n} 个待确认决策点',
  'strip.captures': '{n} 条捕获',
  'strip.empty': '没有待确认的决策',
} satisfies Record<string, string>

/** The track namespace key union. */
export type TrackKey = keyof typeof zh

/** English dictionary, checked complete against the zh key set. */
export const en = {
  'strip.label': 'Track',
  'strip.decisions': '{n} decision{plural} to answer',
  'strip.captures': '{n} capture{plural}',
  'strip.empty': 'No pending decisions',
} satisfies Record<TrackKey, string>

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Track strip copy. */
    track: TrackKey
  }
}

/** Locale namespace registered on the client locale service. */
export const NS = 'track'
