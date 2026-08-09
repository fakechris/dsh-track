/**
 * InvoluteStrip: the composer-dock strip surfacing decision-point and
 * capture-wall state. Renders a labeled count row with a badge; the whole
 * strip is a button affordance (Phase 0b: click target reserved — answering
 * and capture-wall navigation land in the next step).
 * @module @deepseek-ai/dsh-involute/client/strip
 */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the locale merge (LocaleNamespaceMap['involute']) into this
// program so t('strip.*') literal keys type-check.
import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { InvoluteStripProps } from './strip-contract.ts'
import type { InvoluteKey } from './locales.ts'
// Type-only: the entry module carries the LocaleNamespaceMap merge via the
// same declaration-merge pattern as ui-goal's client/index.ts.
import type {} from './index.ts'
import css from './strip.module.css'

/** Involute strip component: label + pending decision / capture counts. */
export function InvoluteStrip({ decisions, captures, t }: InvoluteStripProps & PropsLocale<'involute'>) {
  const hasWork = decisions > 0 || captures > 0
  return (
    <button type="button" className={css.strip} data-testid="involute-strip">
      <span className={css.label}>{t('strip.label')}</span>
      {hasWork ? (
        <span className={css.counts}>
          {decisions > 0 && (
            <span className={css.badge} data-kind="decisions" title={t('strip.decisions', { n: decisions, plural: decisions === 1 ? '' : 's' })}>
              {t('strip.decisions', { n: decisions, plural: decisions === 1 ? '' : 's' })}
            </span>
          )}
          {captures > 0 && (
            <span className={css.muted}>{t('strip.captures', { n: captures, plural: captures === 1 ? '' : 's' })}</span>
          )}
        </span>
      ) : (
        <span className={css.empty}>{t('strip.empty')}</span>
      )}
    </button>
  )
}
