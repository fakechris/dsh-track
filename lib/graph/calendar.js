/**
 * Calendar-yarn data (v1) — the 会话结构图 tab's main view. Deterministic
 * projection of the store: sessions as lines across natural days, per-day
 * dominant project lanes, work segments (requirement + directives + turn
 * outcomes) derived from executed-in issues + the v3 session graph. The
 * 'requirement vs directive' split is an approximation of the utterance
 * extraction — the drill-down doubles as its acceptance tool.
 * @module @fakechris/dsh-track/graph/calendar
 */
const HUE_PALETTE = ['#E06A4E', '#E3A63B', '#3FA79B', '#5B8DE0', '#C77DDF', '#E0609E', '#8AA05B', '#D0604E'];
const UNK_ID = 'unk';
/** Deterministic hue from a project id (stable across re-runs). */
export function hueFor(id) {
    let h = 0;
    for (let i = 0; i < id.length; i++)
        h = (h * 31 + id.charCodeAt(i)) | 0;
    return HUE_PALETTE[Math.abs(h) % HUE_PALETTE.length];
}
const dayIndexOf = (t, base) => Math.floor((t - base) / 86400000);
/** Day label (MM-DD) for a window day. */
export function dayLabel(day, base) {
    const t = new Date(base + day * 86400000);
    return String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
}
/**
 * Build the calendar-yarn dataset for one project (cwd).
 * @param store track store.
 * @param cwd project workspace path.
 * @param days window length (default 18).
 * @param now injectable clock.
 */
export async function buildCalendar(store, cwd, days = 18, now = Date.now()) {
    const projects = (await store.listProjects()).filter((p) => p.path === cwd);
    const projById = new Map(projects.map((p) => [p.id, p]));
    const base = Math.floor(now / 86400000) * 86400000 - (days - 1) * 86400000;
    const graphs = (await store.listGraphs()).filter((g) => g.header.cwd === cwd);
    const issues = await store.listIssues();
    const links = await store.listLinks();
    // executed-in: sessionId -> issues (sorted by sourceSpan.seqStart).
    const issuesBySession = new Map();
    for (const l of links) {
        if (l.kind !== 'executed-in' || l.fromType !== 'issue' || l.toType !== 'session')
            continue;
        const issue = issues.find((i) => i.id === l.fromId);
        if (!issue)
            continue;
        const list = issuesBySession.get(l.toId) ?? [];
        list.push(issue);
        issuesBySession.set(l.toId, list);
    }
    for (const list of issuesBySession.values()) {
        list.sort((a, b) => (a.sourceSpan?.seqStart ?? 0) - (b.sourceSpan?.seqStart ?? 0));
    }
    const sessions = [];
    for (const g of graphs) {
        const nodes = [...g.nodes].sort((a, b) => a.citation.seqStart - b.citation.seqStart);
        const userMsgs = nodes.filter((n) => n.kind === 'user-message');
        const turnNodes = nodes.filter((n) => n.kind === 'turn');
        const toolNodes = nodes.filter((n) => n.kind === 'tool');
        const segIssues = issuesBySession.get(g.sessionId) ?? [];
        const bounds = [];
        for (let k = 0; k < segIssues.length; k++) {
            const start = segIssues[k].sourceSpan?.seqStart ?? (userMsgs[k]?.citation.seqStart ?? 0);
            const end = k + 1 < segIssues.length ? (segIssues[k + 1].sourceSpan?.seqStart ?? Number.MAX_SAFE_INTEGER) : Number.MAX_SAFE_INTEGER;
            bounds.push({ start, end });
        }
        if (segIssues.length === 0 && userMsgs.length > 0) {
            // No issues yet: one synthetic segment per the session's first utterance.
            const first = userMsgs[0];
            bounds.push({ start: first.citation.seqStart, end: Number.MAX_SAFE_INTEGER });
        }
        const segments = [];
        for (let k = 0; k < bounds.length; k++) {
            const issue = segIssues[k];
            const bnd = bounds[k];
            const inRange = nodes.filter((n) => n.citation.seqEnd >= bnd.start && n.citation.seqStart < bnd.end);
            const inUser = userMsgs.filter((n) => n.citation.seqEnd >= bnd.start && n.citation.seqStart < bnd.end);
            const lead = inUser[0];
            const day = lead ? dayIndexOf(lead.createdAt, base) : (g.header.createdAt ? dayIndexOf(g.header.createdAt, base) : 0);
            const instr = inUser.slice(1).map((n) => ({ text: n.title, messageId: n.messageId }));
            const turns = inRange.filter((n) => n.kind === 'turn' && n.outcome !== undefined).map((n) => ({ outcome: n.outcome }));
            const tools = Array.from(new Set(inRange.filter((n) => n.kind === 'tool' && n.toolName).map((n) => n.toolName))).slice(0, 6);
            segments.push({
                day: Math.max(0, Math.min(days - 1, day)),
                proj: issue?.projectId ?? UNK_ID,
                req: issue?.title ?? (lead?.title ?? '(未归入需求)'),
                reqMessageId: issue?.promptMessageId ?? lead?.messageId,
                sessionId: g.sessionId,
                instr,
                events: inRange.length,
                turns,
                tools,
            });
        }
        // perDay: aggregate by day (dom = argmax events over segments, multi = ≥2 projects).
        const perDayMap = new Map();
        for (const seg of segments) {
            const acc = perDayMap.get(seg.day) ?? { dom: seg.proj, events: 0, multi: false, projCount: new Map() };
            acc.events += seg.events;
            acc.projCount.set(seg.proj, (acc.projCount.get(seg.proj) ?? 0) + seg.events);
            acc.dom = [...acc.projCount.entries()].sort((a, b) => b[1] - a[1])[0][0];
            acc.multi = [...acc.projCount.keys()].filter((p) => p !== UNK_ID).length > 1;
            perDayMap.set(seg.day, acc);
        }
        // Nodes with no segment (e.g. pre-issue chatter) still count as activity.
        for (const n of nodes) {
            const day = dayIndexOf(n.createdAt, base);
            if (day < 0 || day >= days)
                continue;
            const acc = perDayMap.get(day) ?? { dom: UNK_ID, events: 0, multi: false, projCount: new Map() };
            acc.events += 1;
            perDayMap.set(day, acc);
        }
        const perDay = [...perDayMap.entries()].sort((a, b) => a[0] - b[0]).map(([day, acc]) => ({ day, dom: acc.dom, events: acc.events, multi: acc.multi }));
        const known = segments.filter((s) => s.proj !== UNK_ID).map((s) => s.proj);
        let switches = 0;
        for (let k = 1; k < known.length; k++)
            if (known[k] !== known[k - 1])
                switches++;
        const root = nodes.find((n) => n.kind === 'session');
        sessions.push({
            id: g.sessionId,
            title: root?.title ?? g.sessionId,
            startDay: perDay[0]?.day ?? 0,
            activeDays: perDay.map((p) => p.day),
            perDay,
            segments,
            switches,
            nReq: segments.length,
            nInstr: segments.reduce((a, s) => a + s.instr.length, 0),
            projects: [...new Set(known)],
        });
    }
    sessions.sort((a, b) => a.startDay - b.startDay);
    return {
        days,
        dayBase: new Date(base).toISOString(),
        projects: projects.map((p) => ({ id: p.id, name: p.name, hue: hueFor(p.id) })),
        sessions,
    };
}
