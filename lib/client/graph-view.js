import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useMemo, useState } from 'react';
import { CalendarYarnRoot } from "./calendar-yarn.js";
import { buildCurrentGraph, buildAllWorkspaces } from "./right-panel.js";
const calStyles = {
    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
    background: 'var(--dsw-alias-bg-base, #10151C)', color: '#D6DEE8',
    fontFamily: "-apple-system, 'Segoe UI', Roboto, 'PingFang SC', 'Microsoft YaHei', sans-serif",
    minWidth: 0, minHeight: 0,
};
const toolBtn = {
    background: 'transparent', border: '1px solid #2A3542', color: '#A9B7C6',
    borderRadius: 4, padding: '3px 10px', fontSize: 12, cursor: 'pointer',
    fontFamily: 'inherit', lineHeight: 1.5,
};
/**
 * Fetch the whole-store calendar dataset (all projects). The yarn is global
 * (not per-session); sessionId drives refresh + is available for future
 * per-session drill-down.
 */
async function fetchCalendar() {
    try {
        const r = await fetch('/api/track/calendar').then((res) => res.json());
        return r.calendar ?? null;
    }
    catch {
        return null;
    }
}
export function GraphView(props) {
    const { sessionId, onJump } = props;
    const [cal, setCal] = useState(null);
    const [loading, setLoading] = useState(true);
    const [building, setBuilding] = useState(null);
    useEffect(() => {
        let alive = true;
        const load = () => {
            setLoading(true);
            void fetchCalendar().then((d) => { if (alive) {
                setCal(d);
                setLoading(false);
            } });
        };
        load();
        // Refresh when a build finishes (build buttons dispatch this).
        const onBuilt = () => { load(); };
        window.addEventListener('track:graph-built', onBuilt);
        return () => { alive = false; window.removeEventListener('track:graph-built', onBuilt); };
    }, [sessionId]);
    const run = (kind) => {
        setBuilding(kind);
        void (kind === 'cur' ? buildCurrentGraph() : buildAllWorkspaces())
            .finally(() => setBuilding(null));
    };
    const body = useMemo(() => {
        if (loading)
            return _jsx("div", { style: { ...calStyles, alignItems: 'center', justifyContent: 'center', color: '#74839A', fontSize: 12 }, children: "\u52A0\u8F7D\u65E5\u5386\u7EB1\u7EBF\u2026" });
        if (cal === null || cal.sessions.length === 0) {
            return (_jsx("div", { style: { ...calStyles, alignItems: 'center', justifyContent: 'center', gap: 10, color: '#74839A', fontSize: 12 }, children: _jsx("div", { children: "\u6682\u65E0\u65E5\u5386\u6570\u636E \u2014 \u70B9\u51FB\u4E0A\u65B9\u300C\u6784\u5EFA\u5168\u90E8\u4F1A\u8BDD\u300D\u751F\u6210\u4F1A\u8BDD\u56FE\uFF08\u6216\u5148\u300C\u6784\u5EFA\u5F53\u524D\u4F1A\u8BDD\u300D\uFF09" }) }));
        }
        return _jsx(CalendarYarnRoot, { data: cal, onJump: onJump });
    }, [loading, cal, onJump]);
    return (_jsxs("div", { style: { position: 'relative', flex: 1, minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }, children: [_jsxs("div", { style: {
                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', flexShrink: 0,
                    borderBottom: '1px solid var(--dsw-alias-border-l1, rgba(255,255,255,.07))',
                    background: 'var(--dsw-alias-bg-base, #10151C)',
                }, children: [_jsx("span", { style: { fontSize: 12, fontWeight: 600, color: '#D6DEE8', marginRight: 4 }, children: "\u4F1A\u8BDD\u7ED3\u6784\u56FE" }), _jsx("button", { style: toolBtn, disabled: building !== null, onClick: () => run('cur'), children: building === 'cur' ? '构建中…' : '构建当前会话' }), _jsx("button", { style: toolBtn, disabled: building !== null, onClick: () => run('all'), children: building === 'all' ? '构建中…' : '构建全部会话' }), _jsx("span", { style: { fontSize: 10.5, color: '#74839A', marginLeft: 'auto' }, children: "\u6784\u5EFA\u540E\u751F\u6210 \u65E5\u5386\u7EB1\u7EBF \u00B7 \u77E9\u9635 \u00B7 \u4F1A\u8BDD\u8868" })] }), _jsx("div", { style: { position: 'relative', flex: 1, minHeight: 0 }, children: body })] }));
}
