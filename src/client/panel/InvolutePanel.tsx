/**
 * InvolutePanel: the center-column panel toggled by the sidebar entry.
 * Shows the capture wall (add + list), pending decisions, and issues.
 * Data rides the host HTTP API (/api/involute/*); the panel re-fetches on
 * open and after each mutation.
 * @module @deepseek-ai/dsh-involute/client/panel
 */

import { useEffect, useState } from 'react'
import type { Capture, Decision, Issue } from '../../types.ts'

interface Snapshot {
  captures: Capture[]
  decisions: Decision[]
  issues: Issue[]
}

const EMPTY: Snapshot = { captures: [], decisions: [], issues: [] }

async function fetchSnapshot(): Promise<Snapshot> {
  const [c, d, i] = await Promise.all([
    fetch('/api/involute/captures').then((r) => r.json()),
    fetch('/api/involute/decisions').then((r) => r.json()),
    fetch('/api/involute/issues').then((r) => r.json()),
  ])
  return {
    captures: c.captures ?? [],
    decisions: d.decisions ?? [],
    issues: i.issues ?? [],
  }
}

const style = {
  panel: {
    display: 'flex', flexDirection: 'column' as const, height: '100%',
    padding: 16, gap: 12, overflowY: 'auto' as const,
  },
  header: { fontSize: 16, fontWeight: 600 } as const,
  section: { display: 'flex', flexDirection: 'column' as const, gap: 6 },
  sectionTitle: { fontSize: 12, fontWeight: 600, opacity: 0.7, textTransform: 'uppercase' as const },
  inputRow: { display: 'flex', gap: 8 } as const,
  input: {
    flex: 1, padding: '6px 10px', border: '1px solid rgba(128,128,128,.35)',
    borderRadius: 6, background: 'transparent', color: 'inherit', fontSize: 13,
  } as const,
  button: {
    padding: '6px 12px', border: 'none', borderRadius: 6, background: '#4c8dff',
    color: '#fff', fontSize: 13, cursor: 'pointer',
  } as const,
  card: {
    padding: '8px 10px', border: '1px solid rgba(128,128,128,.25)',
    borderRadius: 6, fontSize: 13,
  } as const,
  meta: { fontSize: 11, opacity: 0.6, marginTop: 4 } as const,
  empty: { opacity: 0.5, fontSize: 12, fontStyle: 'italic' } as const,
}

/** The center-column Involute panel. */
export function InvolutePanel() {
  const [snapshot, setSnapshot] = useState<Snapshot>(EMPTY)
  const [draft, setDraft] = useState('')

  const refresh = (): void => {
    fetchSnapshot().then(setSnapshot).catch(() => setSnapshot(EMPTY))
  }
  useEffect(refresh, [])

  const submit = async (): Promise<void> => {
    const content = draft.trim()
    if (!content) return
    await fetch('/api/involute/captures', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, tags: [] }),
    })
    setDraft('')
    refresh()
  }

  const pendingDecisions = snapshot.decisions.filter((d) => d.status === 'pending')
  const openCaptures = snapshot.captures.filter((c) => c.status === 'open')

  return (
    <div style={style.panel} data-testid="involute-panel">
      <div style={style.header}>Involute</div>

      <div style={style.section}>
        <div style={style.sectionTitle}>捕获想法</div>
        <div style={style.inputRow}>
          <input
            style={style.input}
            placeholder="记录一个念头…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void submit() }}
          />
          <button type="button" style={style.button} onClick={() => void submit()}>捕获</button>
        </div>
        {openCaptures.length === 0
          ? <div style={style.empty}>暂无捕获</div>
          : openCaptures.slice(0, 8).map((c) => (
            <div key={c.id} style={style.card}>
              {c.content}
              <div style={style.meta}>
                {c.tags.join(' · ')}{c.tags.length > 0 ? ' · ' : ''}{new Date(c.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
      </div>

      <div style={style.section}>
        <div style={style.sectionTitle}>待确认决策点 ({pendingDecisions.length})</div>
        {pendingDecisions.length === 0
          ? <div style={style.empty}>暂无待确认决策</div>
          : pendingDecisions.slice(0, 5).map((d) => (
            <div key={d.id} style={style.card}>
              {d.question}
              <div style={style.meta}>我的倾向：{d.aiPreference}</div>
            </div>
          ))}
      </div>

      <div style={style.section}>
        <div style={style.sectionTitle}>任务 ({snapshot.issues.length})</div>
        {snapshot.issues.length === 0
          ? <div style={style.empty}>暂无任务</div>
          : snapshot.issues.slice(0, 5).map((i) => (
            <div key={i.id} style={style.card}>
              {i.identifier} [{i.state}] {i.title}
            </div>
          ))}
      </div>
    </div>
  )
}
