/**
 * Calendar-yarn view — 3 tabs (日历纱线 / 矩阵 / 会话表), ported from the
 * dsh-track-calendar-yarn design. Yarn nodes = REQUIREMENTS (issues/captures)
 * on a day×project grid; sessions thread their requirements. Key nodes are
 * clickable to jump into the conversation.
 * @module @fakechris/dsh-track/client/calendar-yarn
 */

import { useMemo, useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'

const T = {
  bg: '#10151C', panel: '#171E27', panelHi: '#1D2632', line: '#26303C',
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
export interface CalRequirement {
  id: string; sessionId: string; proj: string; req: string; day: number; events: number; messageId?: string; origin: CalOrigin;
}
export type CalOrigin = 'user' | 'subagent' | 'auto'
export interface CalPerDay { day: number; dom: string; events: number; multi: boolean }
export interface CalSession {
  id: string; title: string; origin: CalOrigin; userMsgCount: number; startDay: number; activeDays: number[];
  perDay: CalPerDay[]; segments: CalSegment[]; switches: number;
  nReq: number; nInstr: number; projects: string[];
}
export interface CalData {
  days: number; dayBase: string; projects: CalProject[];
  sessions: CalSession[]; requirements: CalRequirement[];
}

export interface CalJump { sessionId: string; messageId?: string }
export interface CalProps { data: CalData; onJump: (j: CalJump) => void }

const OUTCOME_GLYPH: Record<string, string> = { completed: '✓', aborted: '⊘', error: '✕', blocked: '✕' };
const dayLabelOf = (base: number, day: number): string => {
  const t = new Date(base + day * 86400000);
  return String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
};

const DAY_W = 60, LANE_H = 86, TOPH = 30;

/** Yarn: x = days, lanes = projects; nodes = REQUIREMENTS; threads = sessions. */
function YarnView(props: {
  data: CalData; selId: string | null; setSelId: (id: string | null) => void;
  hover: string | null; setHover: (h: string | null) => void; onJump: (j: CalJump) => void;
}) {
  const { data, selId, setSelId, hover, setHover, onJump } = props;
  const base = Date.parse(data.dayBase);
  const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
  const laneY = (pid: string): number => {
    const k = lanes.findIndex((l) => l.id === pid);
    return TOPH + (k === -1 ? lanes.length - 1 : k) * LANE_H + LANE_H / 2;
  };
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  // Group requirements by (day, proj) to dodge overlaps.
  const dodge = useMemo(() => {
    const m: Record<string, number> = {};
    for (const r of data.requirements) {
      const key = r.day + '|' + r.proj;
      m[key] = (m[key] ?? 0) + 1;
    }
    const off: Record<string, number> = {};
    const seen: Record<string, number> = {};
    for (const r of data.requirements) {
      const key = r.day + '|' + r.proj;
      const k = seen[key] ?? 0;
      seen[key] = k + 1;
      off[r.id] = (k - (m[key]! - 1) / 2) * 18;
    }
    return off;
  }, [data]);
  const W = data.days * DAY_W + 20;
  const H = TOPH + lanes.length * LANE_H + 16;
  const focus = hover ?? (selId ? selId : null);
  // Session threads: requirements of one session in day order.
  const threads = useMemo(() => {
    const bySession = new Map<string, CalRequirement[]>();
    for (const r of data.requirements) {
      const list = bySession.get(r.sessionId) ?? [];
      list.push(r);
      bySession.set(r.sessionId, list);
    }
    for (const list of bySession.values()) list.sort((a, b) => a.day - b.day || a.events - b.events);
    return bySession;
  }, [data]);
  const px = (r: CalRequirement): number => r.day * DAY_W + DAY_W / 2 + ((r.sessionId.length * 7) % 11) - 5;
  const py = (r: CalRequirement): number => laneY(r.proj) + (dodge[r.id] ?? 0);
  return (
    <div style={{ display: 'flex', height: '100%', minHeight: 0 }}>
      <div style={{ width: 104, flexShrink: 0, position: 'relative', borderRight: '1px solid ' + T.line }}>
        {lanes.map((l) => (
          <div key={l.id} style={{ position: 'absolute', top: laneY(l.id) - 9, right: 10, fontFamily: T.mono, fontSize: 10.5, color: l.hue }}>{l.name.length > 10 ? l.name.slice(0, 10) + '…' : l.name}</div>
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
          {[...threads.entries()].map(([sid, reqs]) => {
            const dimmed = focus !== null && focus !== sid;
            if (reqs.length < 2) return null;
            const pts = reqs.map((r) => ({ x: px(r), y: py(r) }));
            return (
              <path key={'t' + sid} d={pts.map((p, k) => (k === 0 ? 'M ' + p.x + ' ' + p.y : ' L ' + p.x + ' ' + p.y)).join(' ')}
                fill='none' stroke={T.line} strokeWidth={1.2} strokeDasharray='2 3' opacity={dimmed ? 0.2 : 0.7} />
            );
          })}
          {data.requirements.map((r) => {
            const dimmed = focus !== null && focus !== r.sessionId;
            const radius = 4 + Math.sqrt(r.events) / 2.2;
            const sess = data.sessions.find((s) => s.id === r.sessionId);
            const tangled = sess !== undefined && sess.projects.length > 1;
            return (
              <g key={r.id} opacity={dimmed ? 0.14 : 1} style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHover(r.sessionId)} onMouseLeave={() => setHover(null)}
                onClick={() => setSelId(selId === r.sessionId ? null : r.sessionId)}>
                {tangled && <circle cx={px(r)} cy={py(r)} r={radius + 3} fill='none' stroke={GOLD} strokeWidth={1.2} />}
                <circle cx={px(r)} cy={py(r)} r={radius} fill={rgba(hueOf(r.proj), 0.9)} stroke={T.bg} strokeWidth={1}>
                  <title>{r.req + ' · ' + dayLabelOf(base, r.day) + ' · ' + r.events + ' events · ' + (r.proj === 'unk' ? '未归属' : r.proj.slice(0, 10)) + (tangled ? ' · 缠绕' : '')}</title>
                </circle>
                <button onClick={(ev) => { ev.stopPropagation(); onJump({ sessionId: r.sessionId, messageId: r.messageId }) }}
                  style={{ position: 'absolute', left: px(r) + radius + 2, top: py(r) - radius - 8, background: 'none', border: 'none', color: T.faint, fontFamily: T.mono, fontSize: 8.5, cursor: r.messageId ? 'pointer' : 'default', padding: 0 }}>↩</button>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

/** Drill-down: the session's segment sequence (◆需求 ▷指示 ✓⊘✕结局 ⚙工具). */
function SegmentDrawer(props: { s: CalSession; data: CalData; onJump: (j: CalJump) => void; onClose: () => void }) {
  const { s, data, onJump, onClose } = props;
  const base = Date.parse(data.dayBase);
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  return (
    <div style={{ borderTop: '1px solid ' + T.line, background: T.panel, flexShrink: 0, maxHeight: '42%', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, padding: '8px 16px 4px', flexWrap: 'wrap' }}>
        <span style={{ fontFamily: T.mono, fontSize: 12, color: T.text }}>{s.id.slice(0, 14)}</span>
        <button onClick={() => onJump({ sessionId: s.id })} style={{ fontFamily: T.mono, fontSize: 10.5, color: '#5B8DE0', background: 'transparent', border: '1px solid ' + T.line, borderRadius: 3, padding: '1px 8px', cursor: 'pointer' }}>↩ 打开对话</button>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>跨 {s.activeDays[s.activeDays.length - 1] - s.startDay + 1} 天（活跃 {s.activeDays.length}）</span>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>需求 {s.nReq} · 指示 {s.nInstr} · 项目切换 <span style={{ color: s.switches ? GOLD : T.faint }}>{s.switches}</span> 次</span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {s.projects.map((pid) => (<span key={pid} style={{ width: 9, height: 9, borderRadius: 2, background: hueOf(pid) }} />))}
        </span>
        <span style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 9.5, color: T.faint }}>颜色=项目 · ◆需求 ▷指示 · ✓完成 ⊘中止 ✕报错</span>
        <button onClick={onClose} style={{ background: 'none', border: '1px solid ' + T.line, borderRadius: 4, color: T.muted, fontFamily: T.mono, fontSize: 10, padding: '2px 8px', cursor: 'pointer' }}>收起</button>
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

/** 矩阵: sessions × project lanes, cell intensity ∝ events, 切换 column. */
function MatrixView(props: { data: CalData; selId: string | null; setSelId: (id: string | null) => void }) {
  const { data, selId, setSelId } = props;
  const base = Date.parse(data.dayBase);
  const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
  const rows = data.sessions.slice().sort((a, b) => b.switches - a.switches || b.nReq - a.nReq);
  const maxV = Math.max(1, ...rows.map((s) => Math.max(1, ...lanes.map((p) => s.segments.filter((g) => g.proj === p.id).reduce((a, g) => a + g.events, 0)))));
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  return (
    <div style={{ overflow: 'auto', height: '100%', padding: '14px 18px' }}>
      <table style={{ borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 10.5 }}>
        <thead><tr>
          <th style={{ position: 'sticky', top: 0, background: T.bg, textAlign: 'left', padding: '4px 10px 8px 0', color: T.muted, fontWeight: 400 }}>session</th>
          {lanes.map((p) => (
            <th key={p.id} style={{ position: 'sticky', top: 0, background: T.bg, padding: '4px 4px 8px', fontWeight: 400 }}>
              <div style={{ color: p.hue, writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', fontSize: 10 }}>{p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name}</div>
            </th>
          ))}
          <th style={{ position: 'sticky', top: 0, background: T.bg, color: GOLD, padding: '4px 8px 8px', fontWeight: 400 }}>切换</th>
        </tr></thead>
        <tbody>
          {rows.map((s) => {
            const isSel = selId === s.id;
            return (
              <tr key={s.id} onClick={() => setSelId(isSel ? null : s.id)} style={{ cursor: 'pointer', background: isSel ? T.panelHi : 'transparent' }}>
                <td style={{ padding: '1px 10px 1px 0', color: isSel ? T.text : T.muted, whiteSpace: 'nowrap' }}>{s.id.slice(0, 14)} <span style={{ color: T.faint }}>{dayLabelOf(base, s.startDay)}</span></td>
                {lanes.map((p) => {
                  const v = s.segments.filter((g) => g.proj === p.id).reduce((a, g) => a + g.events, 0);
                  return (
                    <td key={p.id} style={{ padding: 1 }}>
                      <div title={v ? p.name + ' · ' + v + ' events' : ''} style={{
                        width: 26, height: 15, borderRadius: 2,
                        background: v ? rgba(hueOf(p.id), 0.15 + 0.85 * Math.sqrt(v / maxV)) : '#161C25',
                        outline: isSel && v ? '1px solid ' + hueOf(p.id) : 'none',
                      }} />
                    </td>
                  );
                })}
                <td style={{ textAlign: 'center', color: s.switches ? GOLD : T.faint }}>{s.switches || '·'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** 会话表: ID / 存续 / 首个需求 / 需求 / 指示 / 项目 / 切换. */
function TableView(props: { data: CalData; selId: string | null; setSelId: (id: string | null) => void; onJump: (j: CalJump) => void }) {
  const { data, selId, setSelId, onJump } = props;
  const base = Date.parse(data.dayBase);
  const hueOf = (pid: string): string => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
  const th: React.CSSProperties = { textAlign: 'left' as const, padding: '6px 14px 8px 0', color: T.muted, fontWeight: 400, fontFamily: T.mono, fontSize: 10, letterSpacing: 1.2, borderBottom: '1px solid ' + T.line, position: 'sticky', top: 0, background: T.bg };
  const rows = data.sessions.slice().sort((a, b) => b.switches - a.switches || b.nReq - a.nReq);
  return (
    <div style={{ overflow: 'auto', height: '100%', padding: '6px 18px' }}>
      <table style={{ borderCollapse: 'collapse', width: '100%', fontFamily: T.sans, fontSize: 12.5 }}>
        <thead><tr>
          <th style={th}>ID</th><th style={th}>存续</th><th style={th}>首个需求</th>
          <th style={{ ...th, textAlign: 'right' as const }}>需求</th><th style={{ ...th, textAlign: 'right' as const }}>指示</th>
          <th style={th}>项目</th><th style={{ ...th, textAlign: 'right' as const }}>切换</th>
        </tr></thead>
        <tbody>
          {rows.map((s) => {
            const isSel = selId === s.id;
            const span = s.activeDays[s.activeDays.length - 1] - s.startDay + 1;
            const first = s.segments[0];
            return (
              <tr key={s.id} onClick={() => setSelId(isSel ? null : s.id)} style={{ cursor: 'pointer', background: isSel ? T.panelHi : 'transparent', borderBottom: '1px solid #1B222C' }}>
                <td style={{ padding: '7px 14px 7px 0', fontFamily: T.mono, fontSize: 11, color: T.muted }}>{s.id.slice(0, 12)}</td>
                <td style={{ padding: '7px 14px 7px 0', fontFamily: T.mono, fontSize: 11, color: T.muted }}>{dayLabelOf(base, s.startDay)} 起 {span} 天{span > 1 ? ' · 活跃 ' + s.activeDays.length : ''}</td>
                <td style={{ padding: '7px 14px 7px 0', color: T.text, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {first && <button onClick={(ev) => { ev.stopPropagation(); onJump({ sessionId: s.id, messageId: first.reqMessageId }) }} style={{ background: 'none', border: 'none', color: T.text, cursor: first.reqMessageId ? 'pointer' : 'default', padding: 0, fontSize: 12.5, fontFamily: T.sans }}>◆ {first.req.length > 28 ? first.req.slice(0, 28) + '…' : first.req}</button>}
                </td>
                <td style={{ padding: '7px 14px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }}>{s.nReq}</td>
                <td style={{ padding: '7px 14px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }}>{s.nInstr}</td>
                <td style={{ padding: '7px 14px 7px 0' }}>{s.projects.map((pid) => (<span key={pid} style={{ display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: hueOf(pid), marginRight: 4 }} title={pid} />))}</td>
                <td style={{ padding: '7px 0', textAlign: 'right', fontFamily: T.mono, color: s.switches ? GOLD : T.faint }}>{s.switches || '·'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/** Root: 3 tabs + header + filters + drill-down. */
export function CalendarYarnRoot(props: CalProps) {
  const { data, onJump } = props;
  const [tab, setTab] = useState<'yarn' | 'matrix' | 'table'>('yarn');
  const [activeP, setActiveP] = useState<Set<string>>(new Set());
  const [originOn, setOriginOn] = useState<Record<CalOrigin, boolean>>({ user: true, subagent: true, auto: false });
  const [onlyTangled, setOnlyTangled] = useState(false);
  const [onlyMultiDay, setOnlyMultiDay] = useState(false);
  const [selId, setSelId] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const toggleP = (id: string): void => setActiveP((prev) => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const list = useMemo(() => data.sessions.filter((s) => originOn[s.origin] && (activeP.size === 0 || s.projects.some((p) => activeP.has(p))) && (!onlyTangled || s.projects.length > 1) && (!onlyMultiDay || s.activeDays.length > 1)), [data, activeP, originOn, onlyTangled, onlyMultiDay]);
  const reqList = useMemo(() => data.requirements.filter((r) => list.some((s) => s.id === r.sessionId)), [data, list]);
  const tangled = list.filter((s) => s.projects.length > 1);
  const totReq = list.reduce((a, s) => a + s.nReq, 0);
  const totIns = list.reduce((a, s) => a + s.nInstr, 0);
  const sel = selId !== null ? data.sessions.find((s) => s.id === selId) ?? null : null;
  const tabs: Array<[string, string]> = [['yarn', '日历纱线'], ['matrix', '矩阵'], ['table', '会话表']];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, fontFamily: T.sans, minWidth: 0 }}>
      <div style={{ borderBottom: '1px solid ' + T.line, padding: '10px 18px 0', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ fontFamily: T.mono, fontSize: 14, letterSpacing: 1 }}>dsh-track<span style={{ color: T.faint }}> / </span><span style={{ color: T.muted }}>日历纱线</span></div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, color: T.muted }}>{list.length} sessions · <span style={{ color: GOLD }}>{tangled.length} 缠绕</span> · 需求 {totReq} · 指示 {totIns}</div>
          <div style={{ fontFamily: T.mono, fontSize: 10, color: T.faint }}>用户 {data.sessions.filter((s) => s.origin === 'user').length} · 子代理 {data.sessions.filter((s) => s.origin === 'subagent').length} · 自动 {data.sessions.filter((s) => s.origin === 'auto').length}</div>
          <div style={{ marginLeft: 'auto', fontFamily: T.mono, fontSize: 9.5, color: T.faint }}>节点=需求(大小=事件量) · 虚线=会话线 · 金环=缠绕 · 切换按工作段计</div>
        </div>
        <div style={{ display: 'flex', gap: 6, margin: '10px 0', flexWrap: 'wrap' }}>
          {(['user', 'subagent', 'auto'] as CalOrigin[]).map((o) => {
            const label = o === 'user' ? '用户输入' : o === 'subagent' ? '子代理' : '自动';
            const on = originOn[o];
            const color = o === 'user' ? '#3FA79B' : o === 'subagent' ? '#5B8DE0' : '#8A97A6';
            return (
              <button key={o} onClick={() => setOriginOn((prev) => ({ ...prev, [o]: !prev[o] }))} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: on ? rgba(color, 0.14) : 'transparent', border: '1px solid ' + (on ? rgba(color, 0.5) : T.line),
                color: on ? T.text : T.faint, borderRadius: 3, padding: '1px 7px',
                fontFamily: T.mono, fontSize: 10, lineHeight: 1.6,
              }}><span style={{ width: 7, height: 7, borderRadius: 2, background: on ? color : T.faint }} />{label}</button>
            );
          })}
          <span style={{ width: 12 }} />
          {data.projects.map((p) => {
            const on = activeP.size === 0 || activeP.has(p.id);
            return (
              <button key={p.id} onClick={() => toggleP(p.id)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: on ? rgba(p.hue, 0.14) : 'transparent', border: '1px solid ' + (on ? rgba(p.hue, 0.5) : T.line),
                color: on ? T.text : T.faint, borderRadius: 3, padding: '1px 7px',
                fontFamily: T.mono, fontSize: 10, lineHeight: 1.6,
              }}><span style={{ width: 7, height: 7, borderRadius: 2, background: on ? p.hue : T.faint }} />{p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name}</button>
            );
          })}
          <span style={{ width: 12 }} />
          <button onClick={() => setOnlyTangled(!onlyTangled)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: onlyTangled ? rgba(GOLD, 0.14) : 'transparent', border: '1px solid ' + (onlyTangled ? rgba(GOLD, 0.5) : T.line), color: onlyTangled ? T.text : T.faint, borderRadius: 3, padding: '1px 7px', fontFamily: T.mono, fontSize: 10 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: onlyTangled ? GOLD : T.faint }} />只看缠绕</button>
          <button onClick={() => setOnlyMultiDay(!onlyMultiDay)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: onlyMultiDay ? rgba('#8A97A6', 0.14) : 'transparent', border: '1px solid ' + (onlyMultiDay ? rgba('#8A97A6', 0.5) : T.line), color: onlyMultiDay ? T.text : T.faint, borderRadius: 3, padding: '1px 7px', fontFamily: T.mono, fontSize: 10 }}><span style={{ width: 7, height: 7, borderRadius: 2, background: onlyMultiDay ? '#8A97A6' : T.faint }} />只看跨天</button>
        </div>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(([id, label]) => (
            <button key={id} onClick={() => setTab(id as 'yarn' | 'matrix' | 'table')} style={{
              background: 'none', border: 'none', borderBottom: tab === id ? '2px solid #E06A4E' : '2px solid transparent',
              color: tab === id ? T.text : T.muted, fontFamily: T.mono, fontSize: 12, letterSpacing: 1.5,
              padding: '8px 14px', cursor: 'pointer',
            }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        {tab === 'yarn' && <YarnView data={{ ...data, sessions: list, requirements: reqList }} selId={selId} setSelId={setSelId} hover={hover} setHover={setHover} onJump={onJump} />}
        {tab === 'matrix' && <MatrixView data={{ ...data, sessions: list }} selId={selId} setSelId={setSelId} />}
        {tab === 'table' && <TableView data={{ ...data, sessions: list }} selId={selId} setSelId={setSelId} onJump={onJump} />}
      </div>
      {sel !== null && <SegmentDrawer s={sel} data={data} onJump={onJump} onClose={() => setSelId(null)} />}
    </div>
  );
}

let calRoot: Root | null = null

/** Mount (or re-mount) the calendar view into a container. */
export function mountCalendar(container: HTMLElement, data: CalData, onJump: (j: CalJump) => void): void {
  if (calRoot === null) calRoot = createRoot(container)
  calRoot.render(<CalendarYarnRoot data={data} onJump={onJump} />)
}
