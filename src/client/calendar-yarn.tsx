/**
 * Calendar-yarn view for the 会话结构图 tab — adapted from the design mock
 * (dsh-track-calendar-yarn.jsx): sessions as lines across natural days,
 * project lanes, per-day activity nodes, drill-down segment sequence.
 * Key nodes are clickable to jump into the conversation.
 * @module @fakechris/dsh-track/client/calendar-yarn
 */

import { useMemo, useState } from 'react'

const T = {
  bg: '#10151C', panel: '#171E27', line: '#26303C',
  text: '#D6DEE8', muted: '#74839A', faint: '#4A5568',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  sans: "-apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
};
const GOLD = '#E0B34E';
const UNK_HUE = '#5A6674';
const rgba = (hex: string, a: number): string => {
  const n = parseInt(hex.slice(1), 16);
  return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
};

export interface CalProject { id: string; name: string; hue: string }
export interface CalTurn { outcome: 'completed' | 'aborted' | 'error' | 'blocked' }
export interface CalDirective { text: string; messageId?: string }
export interface CalSegment {
  day: number; proj: string; req: string; reqMessageId?: string; sessionId: string;
  instr: CalDirective[]; events: number; turns: CalTurn[]; tools: string[];
}
export interface CalPerDay { day: number; dom: string; events: number; multi: boolean }
export interface CalSession {
  id: string; title: string; startDay: number; activeDays: number[];
  perDay: CalPerDay[]; segments: CalSegment[]; switches: number;
  nReq: number; nInstr: number; projects: string[];
}
export interface CalData { days: number; dayBase: string; projects: CalProject[]; sessions: CalSession[] }

export interface CalJump { sessionId: string; messageId?: string }
export interface CalProps { data: CalData; onJump: (j: CalJump) => void }

const OUTCOME_GLYPH: Record<string, string> = { completed: '✓', aborted: '⊘', error: '✕', blocked: '✕' };
const dayLabelOf = (base: number, day: number): string => {
  const t = new Date(base + day * 86400000);
  return String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
};

/** Main calendar-yarn SVG: lanes = projects, x = days, one line per session. */
function CalendarYarn(props: {
  data: CalData;
  selId: string | null;
  setSelId: (id: string | null) => void;
  hover: string | null;
  setHover: (h: string | null) => void;
  onJump: (j: CalJump) => void;
}) {
  const { data, selId, setSelId, hover, setHover, onJump } = props;
  const DAY_W = 60, LANE_H = 86, TOPH = 30;
  const base = Date.parse(data.dayBase);
  const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
  const laneY = (pid: string): number => {
    const k = lanes.findIndex((l) => l.id === pid);
    return TOPH + (k === -1 ? lanes.length - 1 : k) * LANE_H + LANE_H / 2;
  };
  const dodge = useMemo(() => {
    const m: Record<string, string[]> = {};
    data.sessions.forEach((s) => {
      for (const pd of s.perDay) {
        const key = pd.day + '|' + pd.dom;
        (m[key] = m[key] ?? []).push(s.id);
      }
    });
    const off: Record<string, number> = {};
    for (const [key, ids] of Object.entries(m)) ids.forEach((id, k) => { off[key + '|' + id] = (k - (ids.length - 1) / 2) * 16 });
    return off;
  }, [data]);
  const W = data.days * DAY_W + 20;
  const H = TOPH + lanes.length * LANE_H + 16;
  const focus = hover ?? (selId ? selId : null);
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  const px = (s: CalSession, pd: CalPerDay): number => pd.day * DAY_W + DAY_W / 2 + ((s.id.length * 7) % 11) - 5;
  const py = (s: CalSession, pd: CalPerDay): number => laneY(pd.dom) + (dodge[pd.day + '|' + pd.dom + '|' + s.id] ?? 0);
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <div style={{ width: 96, flexShrink: 0, position: 'relative', borderRight: '1px solid ' + T.line }}>
        {lanes.map((l) => (
          <div key={l.id} style={{ position: 'absolute', top: laneY(l.id) - 9, right: 8, fontFamily: T.mono, fontSize: 10.5, color: l.hue }}>{l.name}</div>
        ))}
      </div>
      <div style={{ flex: 1, overflow: 'auto' }}>
        <svg width={W} height={H} style={{ display: 'block' }}>
          {lanes.map((l, k) => (
            <rect key={l.id} x={0} y={TOPH + k * LANE_H} width={W} height={LANE_H} fill={l.id === 'unk' ? 'rgba(90,102,116,0.05)' : rgba(l.hue, k % 2 ? 0.045 : 0.028)} />
          ))}
          {Array.from({ length: data.days }, (_, d) => (
            <g key={d}>
              <line x1={d * DAY_W} y1={TOPH} x2={d * DAY_W} y2={H - 10} stroke='#1C242F' strokeWidth={0.7} />
              <text x={d * DAY_W + DAY_W / 2} y={16} textAnchor='middle' fill={T.faint} fontSize={9} fontFamily={T.mono}>{dayLabelOf(base, d)}</text>
            </g>
          ))}
          {data.sessions.map((s) => {
            const dimmed = focus !== null && focus !== s.id;
            const pts = s.perDay.map((pd) => ({ x: px(s, pd), y: py(s, pd), pd }));
            if (pts.length === 0) return null;
            return (
              <g key={s.id} opacity={dimmed ? 0.14 : 1} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(s.id)} onMouseLeave={() => setHover(null)}
                onClick={() => setSelId(selId === s.id ? null : s.id)}>
                {pts.slice(1).map((p, k) => {
                  const a = pts[k]!;
                  const mx = (a.x + p.x) / 2;
                  const gap = p.pd.day - a.pd.day > 1;
                  return (
                    <path key={k} d={'M ' + a.x + ' ' + a.y + ' C ' + mx + ' ' + a.y + ', ' + mx + ' ' + p.y + ', ' + p.x + ' ' + p.y}
                      fill='none' stroke={hueOf(p.pd.dom)} strokeWidth={1.7}
                      strokeDasharray={gap ? '3 4' : 'none'} opacity={0.8} />
                  );
                })}
                {pts.map((p, k) => {
                  const r = 3 + Math.sqrt(p.pd.events) / 2.4;
                  return (
                    <g key={k}>
                      {p.pd.multi && <circle cx={p.x} cy={p.y} r={r + 3} fill='none' stroke={GOLD} strokeWidth={1.2} />}
                      <circle cx={p.x} cy={p.y} r={r} fill={rgba(hueOf(p.pd.dom), 0.9)} stroke={T.bg} strokeWidth={1}>
                        <title>{s.id + ' · ' + dayLabelOf(base, p.pd.day) + ' · ' + p.pd.events + ' events · 主导 ' + (p.pd.dom === 'unk' ? '未归属' : p.pd.dom) + (p.pd.multi ? ' · 当日跨项目' : '')}</title>
                      </circle>
                    </g>
                  );
                })}
                <text x={pts[0]!.x} y={pts[0]!.y - (3 + Math.sqrt(pts[0]!.pd.events) / 2.4) - 5} textAnchor='middle'
                  fill={dimmed ? T.faint : T.muted} fontSize={8.5} fontFamily={T.mono}>{s.id.slice(0, 12)}</text>
                <line x1={pts[pts.length - 1]!.x + 9} y1={pts[pts.length - 1]!.y - 5} x2={pts[pts.length - 1]!.x + 9} y2={pts[pts.length - 1]!.y + 5} stroke={T.muted} strokeWidth={1.6} />
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** Drill-down: the session's segment sequence across active days (trajectory-style). */
function SegmentDrawer(props: { s: CalSession; data: CalData; onJump: (j: CalJump) => void; onClose: () => void }) {
  const { s, data, onJump, onClose } = props;
  const base = Date.parse(data.dayBase);
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  return (
    <div style={{ borderTop: '1px solid ' + T.line, background: T.panel, flexShrink: 0, maxHeight: '46%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '8px 16px 4px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{s.id.slice(0, 14)}</span>
        <button onClick={() => onJump({ sessionId: s.id })} style={{ fontFamily: T.mono, fontSize: 10.5, color: '#5B8DE0', background: 'transparent', border: '1px solid ' + T.line, borderRadius: 3, padding: '1px 8px', cursor: 'pointer' }}>↩ 打开对话</button>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>跨 {s.activeDays[s.activeDays.length - 1] - s.startDay + 1} 天（活跃 {s.activeDays.length}）</span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>需求 {s.nReq} · 指示 {s.nInstr} · 切换 {s.switches}{s.projects.length > 1 ? ' · 缠绕' : ''}</span>
        <button onClick={onClose} style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 10.5, color: T.faint, background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
      </div>
      <div style={{ display: 'flex', gap: 14, padding: '0 16px 8px', overflowX: 'auto', alignItems: 'flex-end' }}>
        {s.activeDays.map((day) => {
          const segs = s.segments.filter((g) => g.day === day);
          return (
            <div key={day} style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint, marginBottom: 2 }}>{dayLabelOf(base, day)}</div>
              {segs.length === 0 && <div style={{ fontFamily: T.mono, fontSize: 9, color: T.faint }}>—</div>}
              {segs.map((g, k) => {
                const w = Math.min(180, Math.max(64, g.events * 1.6));
                const hue = hueOf(g.proj);
                return (
                  <div key={k} style={{ width: w, borderLeft: '3px solid ' + hue, background: rgba(hue, 0.08), borderRadius: 2, padding: '4px 6px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontFamily: T.sans, color: T.text }}>
                      <span style={{ color: hue }}>◆</span>
                      <button onClick={() => onJump({ sessionId: s.id, messageId: g.reqMessageId })} style={{ flex: 1, textAlign: 'left', background: 'none', border: 'none', color: T.text, cursor: g.reqMessageId ? 'pointer' : 'default', fontSize: 10.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={g.req}>
                        {g.req.length > 16 ? g.req.slice(0, 16) + '…' : g.req}
                      </button>
                    </div>
                    {g.instr.slice(0, 3).map((d, di) => (
                      <div key={di} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: T.muted, marginTop: 1 }}>
                        <span style={{ color: T.faint }}>▷</span>
                        <button onClick={() => onJump({ sessionId: s.id, messageId: d.messageId })} style={{ background: 'none', border: 'none', color: T.muted, cursor: d.messageId ? 'pointer' : 'default', fontSize: 9.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={d.text}>
                          {d.text.length > 14 ? d.text.slice(0, 14) + '…' : d.text}
                        </button>
                      </div>
                    ))}
                    {g.instr.length > 3 && <div style={{ fontSize: 9, color: T.faint, marginTop: 1 }}>+{g.instr.length - 3} 指示</div>}
                    <div style={{ display: 'flex', gap: 2, marginTop: 3, fontSize: 10, color: T.faint }}>
                      {g.turns.length === 0 ? <span style={{ color: T.faint }}>—</span> : g.turns.slice(0, 8).map((t, ti) => <span key={ti} style={{ color: OUTCOME_GLYPH[t.outcome] === '✕' ? '#E06A6A' : T.muted }}>{OUTCOME_GLYPH[t.outcome]}</span>)}
                    </div>
                    {g.tools.length > 0 && <div style={{ fontSize: 9, color: T.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>⚙ {g.tools.join(' · ')}</div>}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Session table: 首个需求 / 需求数 / 指示数 / 切换数 / 缠绕. */
function SessionTable(props: { data: CalData; selId: string | null; setSelId: (id: string | null) => void; onJump: (j: CalJump) => void }) {
  const { data, selId, setSelId, onJump } = props;
  const rows = data.sessions.slice().sort((a, b) => a.startDay - b.startDay || b.activeDays.length - a.activeDays.length);
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>
      <thead>
        <tr style={{ color: T.faint }}>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>会话</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>首个需求</th>
          <th style={{ textAlign: 'right', padding: '4px 8px' }}>需求</th>
          <th style={{ textAlign: 'right', padding: '4px 8px' }}>指示</th>
          <th style={{ textAlign: 'right', padding: '4px 8px' }}>切换</th>
          <th style={{ textAlign: 'left', padding: '4px 8px' }}>项目</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((s) => {
          const first = s.segments[0];
          return (
            <tr key={s.id} onClick={() => setSelId(selId === s.id ? null : s.id)} style={{ borderTop: '1px solid ' + T.line, cursor: 'pointer', background: selId === s.id ? rgba(GOLD, 0.06) : 'transparent' }}>
              <td style={{ padding: '3px 8px', color: T.text }}>{s.id.slice(0, 12)}</td>
              <td style={{ padding: '3px 8px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {first && <button onClick={(e) => { e.stopPropagation(); onJump({ sessionId: s.id, messageId: first.reqMessageId }) }} style={{ background: 'none', border: 'none', color: T.text, cursor: first.reqMessageId ? 'pointer' : 'default', padding: 0, fontSize: 10.5, fontFamily: T.sans, textAlign: 'left' }}>{first.req.length > 26 ? first.req.slice(0, 26) + '…' : first.req}</button>}
              </td>
              <td style={{ textAlign: 'right', padding: '3px 8px' }}>{s.nReq}</td>
              <td style={{ textAlign: 'right', padding: '3px 8px' }}>{s.nInstr}</td>
              <td style={{ textAlign: 'right', padding: '3px 8px', color: s.switches > 0 ? GOLD : T.muted }}>{s.switches}</td>
              <td style={{ padding: '3px 8px' }}>{s.projects.length > 1 ? '缠绕(' + s.projects.length + ')' : s.projects[0] ? s.projects[0].slice(0, 8) : '—'}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/** Root: main yarn + drill-down drawer + table, all in one scrollable column. */
export function CalendarYarnRoot(props: CalProps) {
  const { data, onJump } = props;
  const [selId, setSelId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const sel = selId !== null ? data.sessions.find((s) => s.id === selId) ?? null : null;
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, fontFamily: T.sans }}>
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <CalendarYarn data={data} selId={selId} setSelId={setSelId} hover={hover} setHover={setHover} onJump={onJump} />
        </div>
        {sel !== null && <SegmentDrawer s={sel} data={data} onJump={onJump} onClose={() => setSelId(null)} />}
      </div>
      <div style={{ flexShrink: 0, borderTop: '1px solid ' + T.line, maxHeight: '34%', overflowY: 'auto' }}>
        <SessionTable data={data} selId={selId} setSelId={setSelId} onJump={onJump} />
      </div>
    </div>
  );
}

import { createRoot, type Root } from 'react-dom/client'

let calRoot: Root | null = null

/** Mount (or re-mount) the calendar-yarn view into a container. */
export function mountCalendar(container: HTMLElement, data: CalData, onJump: (j: CalJump) => void): void {
  if (calRoot === null) calRoot = createRoot(container)
  calRoot.render(<CalendarYarnRoot data={data} onJump={onJump} />)
}
