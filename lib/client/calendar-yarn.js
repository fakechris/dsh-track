import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Calendar-yarn view for the 会话结构图 tab — adapted from the design mock
 * (dsh-track-calendar-yarn.jsx): sessions as lines across natural days,
 * project lanes, per-day activity nodes, drill-down segment sequence.
 * Key nodes are clickable to jump into the conversation.
 * @module @fakechris/dsh-track/client/calendar-yarn
 */
import { useMemo, useState } from 'react';
const T = {
    bg: '#10151C', panel: '#171E27', line: '#26303C',
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
/** Main calendar-yarn SVG: lanes = projects, x = days, one line per session. */
function CalendarYarn(props) {
    const { data, selId, setSelId, hover, setHover, onJump } = props;
    const DAY_W = 60, LANE_H = 86, TOPH = 30;
    const base = Date.parse(data.dayBase);
    const lanes = [...data.projects, { id: 'unk', name: '未归属', hue: UNK_HUE }];
    const laneY = (pid) => {
        const k = lanes.findIndex((l) => l.id === pid);
        return TOPH + (k === -1 ? lanes.length - 1 : k) * LANE_H + LANE_H / 2;
    };
    const dodge = useMemo(() => {
        const m = {};
        data.sessions.forEach((s) => {
            for (const pd of s.perDay) {
                const key = pd.day + '|' + pd.dom;
                (m[key] = m[key] ?? []).push(s.id);
            }
        });
        const off = {};
        for (const [key, ids] of Object.entries(m))
            ids.forEach((id, k) => { off[key + '|' + id] = (k - (ids.length - 1) / 2) * 16; });
        return off;
    }, [data]);
    const W = data.days * DAY_W + 20;
    const H = TOPH + lanes.length * LANE_H + 16;
    const focus = hover ?? (selId ? selId : null);
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    const px = (s, pd) => pd.day * DAY_W + DAY_W / 2 + ((s.id.length * 7) % 11) - 5;
    const py = (s, pd) => laneY(pd.dom) + (dodge[pd.day + '|' + pd.dom + '|' + s.id] ?? 0);
    return (_jsxs("div", { style: { display: 'flex', height: '100%', minHeight: 0 }, children: [_jsx("div", { style: { width: 96, flexShrink: 0, position: 'relative', borderRight: '1px solid ' + T.line }, children: lanes.map((l) => (_jsx("div", { style: { position: 'absolute', top: laneY(l.id) - 9, right: 8, fontFamily: T.mono, fontSize: 10.5, color: l.hue }, children: l.name }, l.id))) }), _jsx("div", { style: { flex: 1, overflow: 'auto' }, children: _jsxs("svg", { width: W, height: H, style: { display: 'block' }, children: [lanes.map((l, k) => (_jsx("rect", { x: 0, y: TOPH + k * LANE_H, width: W, height: LANE_H, fill: l.id === 'unk' ? 'rgba(90,102,116,0.05)' : rgba(l.hue, k % 2 ? 0.045 : 0.028) }, l.id))), Array.from({ length: data.days }, (_, d) => (_jsxs("g", { children: [_jsx("line", { x1: d * DAY_W, y1: TOPH, x2: d * DAY_W, y2: H - 10, stroke: '#1C242F', strokeWidth: 0.7 }), _jsx("text", { x: d * DAY_W + DAY_W / 2, y: 16, textAnchor: 'middle', fill: T.faint, fontSize: 9, fontFamily: T.mono, children: dayLabelOf(base, d) })] }, d))), data.sessions.map((s) => {
                            const dimmed = focus !== null && focus !== s.id;
                            const pts = s.perDay.map((pd) => ({ x: px(s, pd), y: py(s, pd), pd }));
                            if (pts.length === 0)
                                return null;
                            return (_jsxs("g", { opacity: dimmed ? 0.14 : 1, style: { cursor: 'pointer' }, onMouseEnter: () => setHover(s.id), onMouseLeave: () => setHover(null), onClick: () => setSelId(selId === s.id ? null : s.id), children: [pts.slice(1).map((p, k) => {
                                        const a = pts[k];
                                        const mx = (a.x + p.x) / 2;
                                        const gap = p.pd.day - a.pd.day > 1;
                                        return (_jsx("path", { d: 'M ' + a.x + ' ' + a.y + ' C ' + mx + ' ' + a.y + ', ' + mx + ' ' + p.y + ', ' + p.x + ' ' + p.y, fill: 'none', stroke: hueOf(p.pd.dom), strokeWidth: 1.7, strokeDasharray: gap ? '3 4' : 'none', opacity: 0.8 }, k));
                                    }), pts.map((p, k) => {
                                        const r = 3 + Math.sqrt(p.pd.events) / 2.4;
                                        return (_jsxs("g", { children: [p.pd.multi && _jsx("circle", { cx: p.x, cy: p.y, r: r + 3, fill: 'none', stroke: GOLD, strokeWidth: 1.2 }), _jsx("circle", { cx: p.x, cy: p.y, r: r, fill: rgba(hueOf(p.pd.dom), 0.9), stroke: T.bg, strokeWidth: 1, children: _jsx("title", { children: s.id + ' · ' + dayLabelOf(base, p.pd.day) + ' · ' + p.pd.events + ' events · 主导 ' + (p.pd.dom === 'unk' ? '未归属' : p.pd.dom) + (p.pd.multi ? ' · 当日跨项目' : '') }) })] }, k));
                                    }), _jsx("text", { x: pts[0].x, y: pts[0].y - (3 + Math.sqrt(pts[0].pd.events) / 2.4) - 5, textAnchor: 'middle', fill: dimmed ? T.faint : T.muted, fontSize: 8.5, fontFamily: T.mono, children: s.id.slice(0, 12) }), _jsx("line", { x1: pts[pts.length - 1].x + 9, y1: pts[pts.length - 1].y - 5, x2: pts[pts.length - 1].x + 9, y2: pts[pts.length - 1].y + 5, stroke: T.muted, strokeWidth: 1.6 })] }, s.id));
                        })] }) })] }));
}
/** Drill-down: the session's segment sequence across active days (trajectory-style). */
function SegmentDrawer(props) {
    const { s, data, onJump, onClose } = props;
    const base = Date.parse(data.dayBase);
    const hueOf = (pid) => (pid === 'unk' ? UNK_HUE : (data.projects.find((p) => p.id === pid)?.hue ?? '#999'));
    return (_jsxs("div", { style: { borderTop: '1px solid ' + T.line, background: T.panel, flexShrink: 0, maxHeight: '46%', overflowY: 'auto' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'baseline', gap: 14, padding: '8px 16px 4px', flexWrap: 'wrap' }, children: [_jsx("span", { style: { fontFamily: T.mono, fontSize: 12, color: T.text }, children: s.id.slice(0, 14) }), _jsx("button", { onClick: () => onJump({ sessionId: s.id }), style: { fontFamily: T.mono, fontSize: 10.5, color: '#5B8DE0', background: 'transparent', border: '1px solid ' + T.line, borderRadius: 3, padding: '1px 8px', cursor: 'pointer' }, children: "\u21A9 \u6253\u5F00\u5BF9\u8BDD" }), _jsxs("span", { style: { fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: ["\u8DE8 ", s.activeDays[s.activeDays.length - 1] - s.startDay + 1, " \u5929\uFF08\u6D3B\u8DC3 ", s.activeDays.length, "\uFF09"] }), _jsxs("span", { style: { fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: ["\u9700\u6C42 ", s.nReq, " \u00B7 \u6307\u793A ", s.nInstr, " \u00B7 \u5207\u6362 ", s.switches, s.projects.length > 1 ? ' · 缠绕' : ''] }), _jsx("button", { onClick: onClose, style: { marginLeft: 'auto', fontFamily: T.mono, fontSize: 10.5, color: T.faint, background: 'transparent', border: 'none', cursor: 'pointer' }, children: "\u2715" })] }), _jsx("div", { style: { display: 'flex', gap: 14, padding: '0 16px 8px', overflowX: 'auto', alignItems: 'flex-end' }, children: s.activeDays.map((day) => {
                    const segs = s.segments.filter((g) => g.day === day);
                    return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }, children: [_jsx("div", { style: { fontFamily: T.mono, fontSize: 9, color: T.faint, marginBottom: 2 }, children: dayLabelOf(base, day) }), segs.length === 0 && _jsx("div", { style: { fontFamily: T.mono, fontSize: 9, color: T.faint }, children: "\u2014" }), segs.map((g, k) => {
                                const w = Math.min(180, Math.max(64, g.events * 1.6));
                                const hue = hueOf(g.proj);
                                return (_jsxs("div", { style: { width: w, borderLeft: '3px solid ' + hue, background: rgba(hue, 0.08), borderRadius: 2, padding: '4px 6px', flexShrink: 0 }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, fontFamily: T.sans, color: T.text }, children: [_jsx("span", { style: { color: hue }, children: "\u25C6" }), _jsx("button", { onClick: () => onJump({ sessionId: s.id, messageId: g.reqMessageId }), style: { flex: 1, textAlign: 'left', background: 'none', border: 'none', color: T.text, cursor: g.reqMessageId ? 'pointer' : 'default', fontSize: 10.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: g.req, children: g.req.length > 16 ? g.req.slice(0, 16) + '…' : g.req })] }), g.instr.slice(0, 3).map((d, di) => (_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, color: T.muted, marginTop: 1 }, children: [_jsx("span", { style: { color: T.faint }, children: "\u25B7" }), _jsx("button", { onClick: () => onJump({ sessionId: s.id, messageId: d.messageId }), style: { background: 'none', border: 'none', color: T.muted, cursor: d.messageId ? 'pointer' : 'default', fontSize: 9.5, padding: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, title: d.text, children: d.text.length > 14 ? d.text.slice(0, 14) + '…' : d.text })] }, di))), g.instr.length > 3 && _jsxs("div", { style: { fontSize: 9, color: T.faint, marginTop: 1 }, children: ["+", g.instr.length - 3, " \u6307\u793A"] }), _jsx("div", { style: { display: 'flex', gap: 2, marginTop: 3, fontSize: 10, color: T.faint }, children: g.turns.length === 0 ? _jsx("span", { style: { color: T.faint }, children: "\u2014" }) : g.turns.slice(0, 8).map((t, ti) => _jsx("span", { style: { color: OUTCOME_GLYPH[t.outcome] === '✕' ? '#E06A6A' : T.muted }, children: OUTCOME_GLYPH[t.outcome] }, ti)) }), g.tools.length > 0 && _jsxs("div", { style: { fontSize: 9, color: T.faint, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: ["\u2699 ", g.tools.join(' · ')] })] }, k));
                            })] }, day));
                }) })] }));
}
/** Session table: 首个需求 / 需求数 / 指示数 / 切换数 / 缠绕. */
function SessionTable(props) {
    const { data, selId, setSelId, onJump } = props;
    const rows = data.sessions.slice().sort((a, b) => a.startDay - b.startDay || b.activeDays.length - a.activeDays.length);
    return (_jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', fontFamily: T.mono, fontSize: 10.5, color: T.muted }, children: [_jsx("thead", { children: _jsxs("tr", { style: { color: T.faint }, children: [_jsx("th", { style: { textAlign: 'left', padding: '4px 8px' }, children: "\u4F1A\u8BDD" }), _jsx("th", { style: { textAlign: 'left', padding: '4px 8px' }, children: "\u9996\u4E2A\u9700\u6C42" }), _jsx("th", { style: { textAlign: 'right', padding: '4px 8px' }, children: "\u9700\u6C42" }), _jsx("th", { style: { textAlign: 'right', padding: '4px 8px' }, children: "\u6307\u793A" }), _jsx("th", { style: { textAlign: 'right', padding: '4px 8px' }, children: "\u5207\u6362" }), _jsx("th", { style: { textAlign: 'left', padding: '4px 8px' }, children: "\u9879\u76EE" })] }) }), _jsx("tbody", { children: rows.map((s) => {
                    const first = s.segments[0];
                    return (_jsxs("tr", { onClick: () => setSelId(selId === s.id ? null : s.id), style: { borderTop: '1px solid ' + T.line, cursor: 'pointer', background: selId === s.id ? rgba(GOLD, 0.06) : 'transparent' }, children: [_jsx("td", { style: { padding: '3px 8px', color: T.text }, children: s.id.slice(0, 12) }), _jsx("td", { style: { padding: '3px 8px', maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: first && _jsx("button", { onClick: (e) => { e.stopPropagation(); onJump({ sessionId: s.id, messageId: first.reqMessageId }); }, style: { background: 'none', border: 'none', color: T.text, cursor: first.reqMessageId ? 'pointer' : 'default', padding: 0, fontSize: 10.5, fontFamily: T.sans, textAlign: 'left' }, children: first.req.length > 26 ? first.req.slice(0, 26) + '…' : first.req }) }), _jsx("td", { style: { textAlign: 'right', padding: '3px 8px' }, children: s.nReq }), _jsx("td", { style: { textAlign: 'right', padding: '3px 8px' }, children: s.nInstr }), _jsx("td", { style: { textAlign: 'right', padding: '3px 8px', color: s.switches > 0 ? GOLD : T.muted }, children: s.switches }), _jsx("td", { style: { padding: '3px 8px' }, children: s.projects.length > 1 ? '缠绕(' + s.projects.length + ')' : s.projects[0] ? s.projects[0].slice(0, 8) : '—' })] }, s.id));
                }) })] }));
}
/** Root: main yarn + drill-down drawer + table, all in one scrollable column. */
export function CalendarYarnRoot(props) {
    const { data, onJump } = props;
    const [selId, setSelId] = useState(null);
    const [hover, setHover] = useState(null);
    const sel = selId !== null ? data.sessions.find((s) => s.id === selId) ?? null : null;
    return (_jsxs("div", { style: { height: '100%', display: 'flex', flexDirection: 'column', background: T.bg, color: T.text, fontFamily: T.sans }, children: [_jsxs("div", { style: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }, children: [_jsx("div", { style: { flex: 1, minHeight: 0 }, children: _jsx(CalendarYarn, { data: data, selId: selId, setSelId: setSelId, hover: hover, setHover: setHover, onJump: onJump }) }), sel !== null && _jsx(SegmentDrawer, { s: sel, data: data, onJump: onJump, onClose: () => setSelId(null) })] }), _jsx("div", { style: { flexShrink: 0, borderTop: '1px solid ' + T.line, maxHeight: '34%', overflowY: 'auto' }, children: _jsx(SessionTable, { data: data, selId: selId, setSelId: setSelId, onJump: onJump }) })] }));
}
import { createRoot } from 'react-dom/client';
let calRoot = null;
/** Mount (or re-mount) the calendar-yarn view into a container. */
export function mountCalendar(container, data, onJump) {
    if (calRoot === null)
        calRoot = createRoot(container);
    calRoot.render(_jsx(CalendarYarnRoot, { data: data, onJump: onJump }));
}
