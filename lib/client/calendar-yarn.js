import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Calendar-yarn view — 3 tabs (日历纱线 / 矩阵 / 会话表), ported from the
 * dsh-track-calendar-yarn design. Yarn nodes = REQUIREMENTS (issues/captures)
 * on a day×project grid; sessions thread their requirements. Key nodes are
 * clickable to jump into the conversation.
 * @module @fakechris/dsh-track/client/calendar-yarn
 */
import { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
const T = {
    bg: '#10151C', panel: '#171E27', panelHi: '#1D2632', line: '#26303C',
    text: '#D6DEE8', muted: '#74839A', faint: '#4A5568',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    sans: "-apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
};
const GOLD = '#E0B34E';
const UNK_HUE = '#5A6674';
const rgba = (hex, a) => {
    const n = parseInt(hex.slice(1), 16);
    return 'rgba(' + ((n >> 16) & 255) + ',' + ((n >> 8) & 255) + ',' + (n & 255) + ',' + a + ')';
};
const OUTCOME_GLYPH = { completed: '✓', aborted: '⊘', error: '✕', blocked: '✕' };
const dayLabelOf = (base, day) => {
    const t = new Date(base + day * 86400000);
    return String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
};
const DAY_W = 60, LANE_H = 86, TOPH = 30;
/** Yarn: x = days, lanes = projects; nodes = REQUIREMENTS; threads = sessions. */
function YarnView(props) {
    const { data, selId, setSelId, hover, setHover, onJump } = props;
    const base = Date.parse(data.dayBase);
    const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
    const laneY = (pid) => {
        const k = lanes.findIndex((l) => l.id === pid);
        return TOPH + (k === -1 ? lanes.length - 1 : k) * LANE_H + LANE_H / 2;
    };
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    // Group requirements by (day, proj) to dodge overlaps.
    const dodge = useMemo(() => {
        const m = {};
        for (const r of data.requirements) {
            const key = r.day + '|' + r.proj;
            m[key] = (m[key] ?? 0) + 1;
        }
        const off = {};
        const seen = {};
        for (const r of data.requirements) {
            const key = r.day + '|' + r.proj;
            const k = seen[key] ?? 0;
            seen[key] = k + 1;
            off[r.id] = (k - (m[key] - 1) / 2) * 18;
        }
        return off;
    }, [data]);
    const W = data.days * DAY_W + 20;
    const H = TOPH + lanes.length * LANE_H + 16;
    const focus = hover ?? (selId ? selId : null);
    // Session threads: requirements of one session in day order.
    const threads = useMemo(() => {
        const bySession = new Map();
        for (const r of data.requirements) {
            const list = bySession.get(r.sessionId) ?? [];
            list.push(r);
            bySession.set(r.sessionId, list);
        }
        for (const list of bySession.values())
            list.sort((a, b) => a.day - b.day || a.events - b.events);
        return bySession;
    }, [data]);
    const px = (r) => r.day * DAY_W + DAY_W / 2 + ((r.sessionId.length * 7) % 11) - 5;
    const py = (r) => laneY(r.proj) + (dodge[r.id] ?? 0);
    return (_jsxs("div", { style: { display: 'flex', height: '100%', minHeight: 0 }, children: [_jsx("div", { style: { width: 104, flexShrink: 0, position: 'relative', borderRight: '1px solid ' + T.line }, children: lanes.map((l) => (_jsx("div", { style: { position: 'absolute', top: laneY(l.id) - 9, right: 10, fontFamily: T.mono, fontSize: 10.5, color: l.hue }, children: l.name.length > 10 ? l.name.slice(0, 10) + '…' : l.name }, l.id))) }), _jsx("div", { style: { flex: 1, overflow: 'auto' }, children: _jsxs("svg", { width: W, height: H, style: { display: 'block' }, children: [lanes.map((l, k) => (_jsx("rect", { x: 0, y: TOPH + k * LANE_H, width: W, height: LANE_H, fill: l.id === 'unk' ? 'rgba(90,102,116,0.05)' : rgba(l.hue, k % 2 ? 0.045 : 0.028) }, l.id))), Array.from({ length: data.days }, (_, d) => (_jsxs("g", { children: [_jsx("line", { x1: d * DAY_W, y1: TOPH, x2: d * DAY_W, y2: H - 10, stroke: '#1C242F', strokeWidth: 0.7 }), _jsx("text", { x: d * DAY_W + DAY_W / 2, y: 16, textAnchor: 'middle', fill: T.faint, fontSize: 9, fontFamily: T.mono, children: dayLabelOf(base, d) })] }, d))), [...threads.entries()].map(([sid, reqs]) => {
                            const dimmed = focus !== null && focus !== sid;
                            if (reqs.length < 2)
                                return null;
                            const pts = reqs.map((r) => ({ x: px(r), y: py(r) }));
                            return (_jsx("path", { d: pts.map((p, k) => (k === 0 ? 'M ' + p.x + ' ' + p.y : ' L ' + p.x + ' ' + p.y)).join(' '), fill: 'none', stroke: T.line, strokeWidth: 1.2, strokeDasharray: '2 3', opacity: dimmed ? 0.2 : 0.7 }, 't' + sid));
                        }), data.requirements.map((r) => {
                            const dimmed = focus !== null && focus !== r.sessionId;
                            const radius = 4 + Math.sqrt(r.events) / 2.2;
                            const sess = data.sessions.find((s) => s.id === r.sessionId);
                            const tangled = sess !== undefined && sess.projects.length > 1;
                            return (_jsxs("g", { opacity: dimmed ? 0.14 : 1, style: { cursor: 'pointer' }, onMouseEnter: () => setHover(r.sessionId), onMouseLeave: () => setHover(null), onClick: () => setSelId(selId === r.sessionId ? null : r.sessionId), children: [tangled && _jsx("circle", { cx: px(r), cy: py(r), r: radius + 3, fill: 'none', stroke: GOLD, strokeWidth: 1.2 }), _jsx("circle", { cx: px(r), cy: py(r), r: radius, fill: rgba(hueOf(r.proj), 0.9), stroke: T.bg, strokeWidth: 1, children: _jsx("title", { children: r.req + ' · ' + dayLabelOf(base, r.day) + ' · ' + r.events + ' events · ' + (r.proj === 'unk' ? '未归属' : r.proj.slice(0, 10)) + (tangled ? ' · 缠绕' : '') }) }), _jsx("button", { onClick: (ev) => { ev.stopPropagation(); onJump({ sessionId: r.sessionId, messageId: r.messageId }); }, style: { position: 'absolute', left: px(r) + radius + 2, top: py(r) - radius - 8, background: 'none', border: 'none', color: T.faint, fontFamily: T.mono, fontSize: 8.5, cursor: r.messageId ? 'pointer' : 'default', padding: 0 }, children: "\u21A9" })] }, r.id));
                        })] }) })] }));
}
/** Drill-down: the session's segment sequence (◆需求 ▷指示 ✓⊘✕结局 ⚙工具). */
function SegmentDrawer(props) {
    const { s, data, onJump, onClose } = props;
    const base = Date.parse(data.dayBase);
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    return (_jsxs("div", { style: { borderTop: '1px solid ' + T.line, background: T.panel, flexShrink: 0, maxHeight: '42%', overflowY: 'auto' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 14, padding: '8px 16px 4px', flexWrap: 'wrap' }, children: [_jsx("span", { style: { fontFamily: T.mono, fontSize: 12, color: T.text }, children: s.id.slice(0, 14) }), _jsx("button", { onClick: () => onJump({ sessionId: s.id }), style: { fontFamily: T.mono, fontSize: 10.5, color: '#5B8DE0', background: 'transparent', border: '1px solid ' + T.line, borderRadius: 3, padding: '1px 8px', cursor: 'pointer' }, children: "\u21A9 \u6253\u5F00\u5BF9\u8BDD" }), _jsxs("span", { style: { fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: ["\u8DE8 ", s.activeDays[s.activeDays.length - 1] - s.startDay + 1, " \u5929\uFF08\u6D3B\u8DC3 ", s.activeDays.length, "\uFF09"] }), _jsxs("span", { style: { fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: ["\u9700\u6C42 ", s.nReq, " \u00B7 \u6307\u793A ", s.nInstr, " \u00B7 \u9879\u76EE\u5207\u6362 ", _jsx("span", { style: { color: s.switches ? GOLD : T.faint }, children: s.switches }), " \u6B21"] }), _jsx("span", { style: { display: 'inline-flex', gap: 4 }, children: s.projects.map((pid) => (_jsx("span", { style: { width: 9, height: 9, borderRadius: 2, background: hueOf(pid) } }, pid))) }), _jsx("span", { style: { marginLeft: 'auto', fontFamily: T.mono, fontSize: 9.5, color: T.faint }, children: "\u989C\u8272=\u9879\u76EE \u00B7 \u25C6\u9700\u6C42 \u25B7\u6307\u793A \u00B7 \u2713\u5B8C\u6210 \u2298\u4E2D\u6B62 \u2715\u62A5\u9519" }), _jsx("button", { onClick: onClose, style: { background: 'none', border: '1px solid ' + T.line, borderRadius: 4, color: T.muted, fontFamily: T.mono, fontSize: 10, padding: '2px 8px', cursor: 'pointer' }, children: "\u6536\u8D77" })] }), _jsx("div", { style: { display: 'flex', gap: 14, padding: '0 16px 8px', overflowX: 'auto', alignItems: 'flex-end' }, children: s.activeDays.map((day) => {
                    const segs = s.segments.filter((g) => g.day === day);
                    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }, children: [_jsx("div", { style: { fontFamily: T.mono, fontSize: 9, color: T.faint, marginBottom: 2 }, children: dayLabelOf(base, day) }), segs.length === 0 && _jsx("div", { style: { fontFamily: T.mono, fontSize: 9, color: T.faint }, children: "\u2014" }), segs.map((g, k) => {
                                const w = Math.min(180, Math.max(64, g.events * 1.6));
                                const hue = hueOf(g.proj);
                                return (_jsxs("div", { style: { width: w, borderLeft: '3px solid ' + hue, background: rgba(hue, 0.08), borderRadius: 2, padding: '4px 6px', flexShrink: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontFamily: T.sans, color: T.text }, children: [_jsx("span", { style: { color: hue }, children: "\u25C6" }), _jsx("button", { onClick: () => onJump({ sessionId: s.id, messageId: g.reqMessageId }), style: { flex: 1, textAlign: 'left', background: 'none', border: 'none', color: T.text, cursor: g.reqMessageId ? 'pointer' : 'default', fontSize: 10.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: g.req, children: g.req.length > 16 ? g.req.slice(0, 16) + '…' : g.req })] }), g.instr.slice(0, 3).map((d, di) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: T.muted, marginTop: 1 }, children: [_jsx("span", { style: { color: T.faint }, children: "\u25B7" }), _jsx("button", { onClick: () => onJump({ sessionId: s.id, messageId: d.messageId }), style: { background: 'none', border: 'none', color: T.muted, cursor: d.messageId ? 'pointer' : 'default', fontSize: 9.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: d.text, children: d.text.length > 14 ? d.text.slice(0, 14) + '…' : d.text })] }, di))), g.instr.length > 3 && _jsxs("div", { style: { fontSize: 9, color: T.faint, marginTop: 1 }, children: ["+", g.instr.length - 3, " \u6307\u793A"] }), _jsx("div", { style: { display: 'flex', gap: 2, marginTop: 3, fontSize: 10, color: T.faint }, children: g.turns.length === 0 ? _jsx("span", { style: { color: T.faint }, children: "\u2014" }) : g.turns.slice(0, 8).map((t, ti) => _jsx("span", { style: { color: OUTCOME_GLYPH[t.outcome] === '✕' ? '#E06A6A' : T.muted }, children: OUTCOME_GLYPH[t.outcome] }, ti)) }), g.tools.length > 0 && _jsxs("div", { style: { fontSize: 9, color: T.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: ["\u2699 ", g.tools.join(' · ')] })] }, k));
                            })] }, day));
                }) })] }));
}
/** 矩阵: sessions × project lanes, cell intensity ∝ events, 切换 column. */
function MatrixView(props) {
    const { data, selId, setSelId } = props;
    const base = Date.parse(data.dayBase);
    const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
    const rows = data.sessions.slice().sort((a, b) => b.switches - a.switches || b.nReq - a.nReq);
    const maxV = Math.max(1, ...rows.map((s) => Math.max(1, ...lanes.map((p) => s.segments.filter((g) => g.proj === p.id).reduce((a, g) => a + g.events, 0)))));
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    return (_jsx("div", { style: { overflow: 'auto', height: '100%', padding: '14px 18px' }, children: _jsxs("table", { style: { borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 10.5 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { position: 'sticky', top: 0, background: T.bg, textAlign: 'left', padding: '4px 10px 8px 0', color: T.muted, fontWeight: 400 }, children: "session" }), lanes.map((p) => (_jsx("th", { style: { position: 'sticky', top: 0, background: T.bg, padding: '4px 4px 8px', fontWeight: 400 }, children: _jsx("div", { style: { color: p.hue, writingMode: 'vertical-rl', transform: 'rotate(180deg)', margin: '0 auto', fontSize: 10 }, children: p.name.length > 10 ? p.name.slice(0, 10) + '…' : p.name }) }, p.id))), _jsx("th", { style: { position: 'sticky', top: 0, background: T.bg, color: GOLD, padding: '4px 8px 8px', fontWeight: 400 }, children: "\u5207\u6362" })] }) }), _jsx("tbody", { children: rows.map((s) => {
                        const isSel = selId === s.id;
                        return (_jsxs("tr", { onClick: () => setSelId(isSel ? null : s.id), style: { cursor: 'pointer', background: isSel ? T.panelHi : 'transparent' }, children: [_jsxs("td", { style: { padding: '1px 10px 1px 0', color: isSel ? T.text : T.muted, whiteSpace: 'nowrap' }, children: [s.id.slice(0, 14), " ", _jsx("span", { style: { color: T.faint }, children: dayLabelOf(base, s.startDay) })] }), lanes.map((p) => {
                                    const v = s.segments.filter((g) => g.proj === p.id).reduce((a, g) => a + g.events, 0);
                                    return (_jsx("td", { style: { padding: 1 }, children: _jsx("div", { title: v ? p.name + ' · ' + v + ' events' : '', style: {
                                                width: 26, height: 15, borderRadius: 2,
                                                background: v ? rgba(hueOf(p.id), 0.15 + 0.85 * Math.sqrt(v / maxV)) : '#161C25',
                                                outline: isSel && v ? '1px solid ' + hueOf(p.id) : 'none',
                                            } }) }, p.id));
                                }), _jsx("td", { style: { textAlign: 'center', color: s.switches ? GOLD : T.faint }, children: s.switches || '·' })] }, s.id));
                    }) })] }) }));
}
/** 会话表: ID / 存续 / 首个需求 / 需求 / 指示 / 项目 / 切换. */
function TableView(props) {
    const { data, selId, setSelId, onJump } = props;
    const base = Date.parse(data.dayBase);
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    const th = { textAlign: 'left', padding: '6px 14px 8px 0', color: T.muted, fontWeight: 400, fontFamily: T.mono, fontSize: 10, letterSpacing: 1.2, borderBottom: '1px solid ' + T.line, position: 'sticky', top: 0, background: T.bg };
    const rows = data.sessions.slice().sort((a, b) => b.switches - a.switches || b.nReq - a.nReq);
    return (_jsx("div", { style: { overflow: 'auto', height: '100%', padding: '6px 18px' }, children: _jsxs("table", { style: { borderCollapse: 'collapse', width: '100%', fontFamily: T.sans, fontSize: 12.5 }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: th, children: "ID" }), _jsx("th", { style: th, children: "\u5B58\u7EED" }), _jsx("th", { style: th, children: "\u9996\u4E2A\u9700\u6C42" }), _jsx("th", { style: { ...th, textAlign: 'right' }, children: "\u9700\u6C42" }), _jsx("th", { style: { ...th, textAlign: 'right' }, children: "\u6307\u793A" }), _jsx("th", { style: th, children: "\u9879\u76EE" }), _jsx("th", { style: { ...th, textAlign: 'right' }, children: "\u5207\u6362" })] }) }), _jsx("tbody", { children: rows.map((s) => {
                        const isSel = selId === s.id;
                        const span = s.activeDays[s.activeDays.length - 1] - s.startDay + 1;
                        const first = s.segments[0];
                        return (_jsxs("tr", { onClick: () => setSelId(isSel ? null : s.id), style: { cursor: 'pointer', background: isSel ? T.panelHi : 'transparent', borderBottom: '1px solid #1B222C' }, children: [_jsx("td", { style: { padding: '7px 14px 7px 0', fontFamily: T.mono, fontSize: 11, color: T.muted }, children: s.id.slice(0, 12) }), _jsxs("td", { style: { padding: '7px 14px 7px 0', fontFamily: T.mono, fontSize: 11, color: T.muted }, children: [dayLabelOf(base, s.startDay), " \u8D77 ", span, " \u5929", span > 1 ? ' · 活跃 ' + s.activeDays.length : ''] }), _jsx("td", { style: { padding: '7px 14px 7px 0', color: T.text, maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: first && _jsxs("button", { onClick: (ev) => { ev.stopPropagation(); onJump({ sessionId: s.id, messageId: first.reqMessageId }); }, style: { background: 'none', border: 'none', color: T.text, cursor: first.reqMessageId ? 'pointer' : 'default', padding: 0, fontSize: 12.5, fontFamily: T.sans }, children: ["\u25C6 ", first.req.length > 28 ? first.req.slice(0, 28) + '…' : first.req] }) }), _jsx("td", { style: { padding: '7px 14px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }, children: s.nReq }), _jsx("td", { style: { padding: '7px 14px 7px 0', textAlign: 'right', fontFamily: T.mono, color: T.muted }, children: s.nInstr }), _jsx("td", { style: { padding: '7px 14px 7px 0' }, children: s.projects.map((pid) => (_jsx("span", { style: { display: 'inline-block', width: 9, height: 9, borderRadius: 2, background: hueOf(pid), marginRight: 4 }, title: pid }, pid))) }), _jsx("td", { style: { padding: '7px 0', textAlign: 'right', fontFamily: T.mono, color: s.switches ? GOLD : T.faint }, children: s.switches || '·' })] }, s.id));
                    }) })] }) }));
}
/** Root: 3 tabs + header + filters + drill-down. */
export function CalendarYarnRoot(props) {
    const { data, onJump } = props;
    const [tab, setTab] = useState('yarn');
    const [activeP, setActiveP] = useState(new Set());
    const [originOn, setOriginOn] = useState({ user: true, subagent: true, auto: false });
    const [onlyTangled, setOnlyTangled] = useState(false);
    const [onlyMultiDay, setOnlyMultiDay] = useState(false);
    const [selId, setSelId] = useState(null);
    const [hover, setHover] = useState(null);
    const toggleP = (id) => setActiveP((prev) => {
        const n = new Set(prev);
        n.has(id) ? n.delete(id) : n.add(id);
        return n;
    });
    const list = useMemo(() => data.sessions.filter((s) => originOn[s.origin] && (activeP.size === 0 || s.projects.some((p) => activeP.has(p))) && (!onlyTangled || s.projects.length > 1) && (!onlyMultiDay || s.activeDays.length > 1)), [data, activeP, originOn, onlyTangled, onlyMultiDay]);
    const reqList = useMemo(() => data.requirements.filter((r) => list.some((s) => s.id === r.sessionId)), [data, list]);
    const tangled = list.filter((s) => s.projects.length > 1);
    const totReq = list.reduce((a, s) => a + s.nReq, 0);
    const totIns = list.reduce((a, s) => a + s.nInstr, 0);
    const sel = selId !== null ? data.sessions.find((s) => s.id === selId) ?? null : null;
    const tabs = [['yarn', '日历纱线'], ['matrix', '矩阵'], ['table', '会话表']];
    return (_jsxs("div", { style: { height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, fontFamily: T.sans, minWidth: 0 }, children: [_jsxs("div", { style: { borderBottom: '1px solid ' + T.line, padding: '10px 18px 0', flexShrink: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }, children: [_jsxs("div", { style: { fontFamily: T.mono, fontSize: 14, letterSpacing: 1 }, children: ["dsh-track", _jsx("span", { style: { color: T.faint }, children: " / " }), _jsx("span", { style: { color: T.muted }, children: "\u65E5\u5386\u7EB1\u7EBF" })] }), _jsxs("div", { style: { fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: [list.length, " sessions \u00B7 ", _jsxs("span", { style: { color: GOLD }, children: [tangled.length, " \u7F20\u7ED5"] }), " \u00B7 \u9700\u6C42 ", totReq, " \u00B7 \u6307\u793A ", totIns] }), _jsxs("div", { style: { fontFamily: T.mono, fontSize: 10, color: T.faint }, children: ["\u7528\u6237 ", data.sessions.filter((s) => s.origin === 'user').length, " \u00B7 \u5B50\u4EE3\u7406 ", data.sessions.filter((s) => s.origin === 'subagent').length, " \u00B7 \u81EA\u52A8 ", data.sessions.filter((s) => s.origin === 'auto').length] }), _jsx("div", { style: { marginLeft: 'auto', fontFamily: T.mono, fontSize: 9.5, color: T.faint }, children: "\u8282\u70B9=\u9700\u6C42(\u5927\u5C0F=\u4E8B\u4EF6\u91CF) \u00B7 \u865A\u7EBF=\u4F1A\u8BDD\u7EBF \u00B7 \u91D1\u73AF=\u7F20\u7ED5 \u00B7 \u5207\u6362\u6309\u5DE5\u4F5C\u6BB5\u8BA1" })] }), _jsxs("div", { style: { display: 'flex', gap: 6, margin: '10px 0', flexWrap: 'wrap' }, children: [['user', 'subagent', 'auto'].map((o) => {
                                const label = o === 'user' ? '用户输入' : o === 'subagent' ? '子代理' : '自动';
                                const on = originOn[o];
                                const color = o === 'user' ? '#3FA79B' : o === 'subagent' ? '#5B8DE0' : '#8A97A6';
                                return (_jsxs("button", { onClick: () => setOriginOn((prev) => ({ ...prev, [o]: !prev[o] })), style: {
                                        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                        background: on ? rgba(color, 0.14) : 'transparent', border: '1px solid ' + (on ? rgba(color, 0.5) : T.line),
                                        color: on ? T.text : T.faint, borderRadius: 3, padding: '1px 7px',
                                        fontFamily: T.mono, fontSize: 10, lineHeight: 1.6,
                                    }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: 2, background: on ? color : T.faint } }), label] }, o));
                            }), _jsx("span", { style: { width: 12 } }), data.projects.map((p) => {
                                const on = activeP.size === 0 || activeP.has(p.id);
                                return (_jsxs("button", { onClick: () => toggleP(p.id), style: {
                                        display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                                        background: on ? rgba(p.hue, 0.14) : 'transparent', border: '1px solid ' + (on ? rgba(p.hue, 0.5) : T.line),
                                        color: on ? T.text : T.faint, borderRadius: 3, padding: '1px 7px',
                                        fontFamily: T.mono, fontSize: 10, lineHeight: 1.6,
                                    }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: 2, background: on ? p.hue : T.faint } }), p.name.length > 12 ? p.name.slice(0, 12) + '…' : p.name] }, p.id));
                            }), _jsx("span", { style: { width: 12 } }), _jsxs("button", { onClick: () => setOnlyTangled(!onlyTangled), style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: onlyTangled ? rgba(GOLD, 0.14) : 'transparent', border: '1px solid ' + (onlyTangled ? rgba(GOLD, 0.5) : T.line), color: onlyTangled ? T.text : T.faint, borderRadius: 3, padding: '1px 7px', fontFamily: T.mono, fontSize: 10 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: 2, background: onlyTangled ? GOLD : T.faint } }), "\u53EA\u770B\u7F20\u7ED5"] }), _jsxs("button", { onClick: () => setOnlyMultiDay(!onlyMultiDay), style: { display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', background: onlyMultiDay ? rgba('#8A97A6', 0.14) : 'transparent', border: '1px solid ' + (onlyMultiDay ? rgba('#8A97A6', 0.5) : T.line), color: onlyMultiDay ? T.text : T.faint, borderRadius: 3, padding: '1px 7px', fontFamily: T.mono, fontSize: 10 }, children: [_jsx("span", { style: { width: 7, height: 7, borderRadius: 2, background: onlyMultiDay ? '#8A97A6' : T.faint } }), "\u53EA\u770B\u8DE8\u5929"] })] }), _jsx("div", { style: { display: 'flex', gap: 2 }, children: tabs.map(([id, label]) => (_jsx("button", { onClick: () => setTab(id), style: {
                                background: 'none', border: 'none', borderBottom: tab === id ? '2px solid #E06A4E' : '2px solid transparent',
                                color: tab === id ? T.text : T.muted, fontFamily: T.mono, fontSize: 12, letterSpacing: 1.5,
                                padding: '8px 14px', cursor: 'pointer',
                            }, children: label }, id))) })] }), _jsxs("div", { style: { flex: 1, minHeight: 0 }, children: [tab === 'yarn' && _jsx(YarnView, { data: { ...data, sessions: list, requirements: reqList }, selId: selId, setSelId: setSelId, hover: hover, setHover: setHover, onJump: onJump }), tab === 'matrix' && _jsx(MatrixView, { data: { ...data, sessions: list }, selId: selId, setSelId: setSelId }), tab === 'table' && _jsx(TableView, { data: { ...data, sessions: list }, selId: selId, setSelId: setSelId, onJump: onJump })] }), sel !== null && _jsx(SegmentDrawer, { s: sel, data: data, onJump: onJump, onClose: () => setSelId(null) })] }));
}
let calRoot = null;
/** Mount (or re-mount) the calendar view into a container. */
export function mountCalendar(container, data, onJump) {
    if (calRoot === null)
        calRoot = createRoot(container);
    calRoot.render(_jsx(CalendarYarnRoot, { data: data, onJump: onJump }));
}
