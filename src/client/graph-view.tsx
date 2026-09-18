/**
 * Conversation view tab: 会话结构图 (calendar yarn). Registered as a
 * 'conversation.view' slot entry — the host renders the tab, tracks
 * aria-selected / active underline, and mounts only the active view. This
 * follows the ui-trajectory pattern exactly (no DOM tab injection).
 *
 * The tab carries its OWN build toolbar (构建当前会话 / 构建全部会话): the
 * calendar is derived from stored session graphs, so when the store is empty
 * the user must be able to generate the graphs right here — the old hint
 * ("先在右侧 Track 面板点「构建」") pointed at buttons that no longer exist.
 */
import { useEffect, useMemo, useState } from 'react'
import { CalendarYarnRoot, type CalData, type CalJump } from './calendar-yarn.tsx'
import { buildCurrentGraph, buildAllWorkspaces } from './right-panel.ts'

export interface GraphViewProps {
  /** Standard kit: the framework-resolved session id. */
  sessionId: string
  /** Jump handler: open a conversation + optional message. */
  onJump: (j: CalJump) => void
}

const calStyles: React.CSSProperties = {
  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
  background: 'var(--dsw-alias-bg-base, #10151C)', color: '#D6DEE8',
  fontFamily: "-apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
  minWidth: 0, minHeight: 0,
}

const toolBtn: React.CSSProperties = {
  background: 'transparent', border: '1px solid #2A3542', color: '#A9B7C6',
  borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer',
  fontFamily: 'inherit', lineHeight: 1.5,
}

/**
 * Fetch the whole-store calendar dataset (all projects). The yarn is global
 * (not per-session); sessionId drives refresh + is available for future
 * per-session drill-down.
 */
async function fetchCalendar(): Promise<CalData | null> {
  try {
    const r = await fetch('/api/track/calendar').then((res) => res.json())
    return r.calendar ?? null
  } catch {
    return null
  }
}

export function GraphView(props: GraphViewProps) {
  const { sessionId, onJump } = props
  const [cal, setCal] = useState<CalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [building, setBuilding] = useState<'cur' | 'all' | null>(null)
  useEffect(() => {
    let alive = true
    const load = (): void => {
      setLoading(true)
      void fetchCalendar().then((d) => { if (alive) { setCal(d); setLoading(false) } })
    }
    load()
    // Refresh when a build finishes (build buttons dispatch this).
    const onBuilt = (): void => { load() }
    window.addEventListener('track:graph-built', onBuilt)
    return () => { alive = false; window.removeEventListener('track:graph-built', onBuilt) }
  }, [sessionId])
  const run = (kind: 'cur' | 'all'): void => {
    setBuilding(kind)
    void (kind === 'cur' ? buildCurrentGraph() : buildAllWorkspaces())
      .finally(() => setBuilding(null))
  }
  const body = useMemo(() => {
    if (loading) return <div style={{ ...calStyles, alignItems: 'center', justifyContent: 'center', color: '#74839A', fontSize: 12 }}>加载日历纱线…</div>
    if (cal === null || cal.sessions.length === 0) {
      return (
        <div style={{ ...calStyles, alignItems: 'center', justifyContent: 'center', gap: 10, color: '#74839A', fontSize: 12 }}>
          <div>暂无日历数据 — 点击上方「构建全部会话」生成会话图（或先「构建当前会话」）</div>
        </div>
      )
    }
    return <CalendarYarnRoot data={cal} onJump={onJump} />
  }, [loading, cal, onJump])
  return (
    <div style={{ position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', flexShrink: 0,
        borderBottom: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,.07))',
        background: 'var(--dsw-alias-bg-base, #10151C)',
      }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#D6DEE8', marginRight: 4 }}>会话结构图</span>
        <button style={toolBtn} disabled={building !== null} onClick={() => run('cur')}>
          {building === 'cur' ? '构建中…' : '构建当前会话'}
        </button>
        <button style={toolBtn} disabled={building !== null} onClick={() => run('all')}>
          {building === 'all' ? '构建中…' : '构建全部会话'}
        </button>
        <span style={{ fontSize: 10.5, color: '#74839A', marginLeft: 'auto' }}>构建后生成 日历纱线 · 矩阵 · 会话表</span>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>{body}</div>
    </div>
  )
}
