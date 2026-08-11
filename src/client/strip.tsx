/**
 * TrackStrip: the composer-dock strip surfacing decision-point and
 * capture-wall state. Styles are inline (no CSS modules) so the client
 * bundle needs no CSS pipeline.
 * @module @deepseek-ai/dsh-track/client/strip
 */

import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { TrackStripProps } from './strip-contract.ts'
import type { TrackKey } from './locales.ts'

const style = {
  strip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '2px 8px',
    border: '1px solid rgba(128, 128, 128, 0.3)',
    borderRadius: 6,
    background: 'transparent',
    color: 'inherit',
    fontSize: 12,
    cursor: 'pointer',
  } as const,
  label: { fontWeight: 600 } as const,
  badge: {
    padding: '0 6px',
    borderRadius: 999,
    background: '#4c8dff',
    color: '#fff',
    fontSize: 11,
    lineHeight: '16px',
  } as const,
  muted: { opacity: 0.7 } as const,
  empty: { opacity: 0.55, fontStyle: 'italic' } as const,
}

/** Track strip component: label + pending decision / capture counts. */
export function TrackStrip({ decisions, captures, t }: TrackStripProps & PropsLocale<'track'>) {
  const hasWork = decisions > 0 || captures > 0
  const plural = (n: number) => (n === 1 ? '' : 's')
  return (
    <button type="button" style={style.strip} data-testid="track-strip">
      <span style={style.label}>{t('strip.label')}</span>
      {hasWork ? (
        <span>
          {decisions > 0 && (
            <span style={style.badge} title={t('strip.decisions', { n: decisions, plural: plural(decisions) })}>
              {t('strip.decisions', { n: decisions, plural: plural(decisions) })}
            </span>
          )}
          {captures > 0 && (
            <span style={style.muted}>{t('strip.captures', { n: captures, plural: plural(captures) })}</span>
          )}
        </span>
      ) : (
        <span style={style.empty}>{t('strip.empty')}</span>
      )}
    </button>
  )
}
