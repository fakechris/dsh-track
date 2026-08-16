/**
 * M2 — project induction: group graph docs by header.cwd into Project nodes
 * (name = basename, repoUrl parsed from .git/config remote origin — no exec),
 * then assign issue.projectId from the first linked session's graph cwd.
 * Deterministic: project ids are hashes of the cwd, so re-runs are idempotent.
 * @module @fakechris/dsh-track/graph/projects
 */
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { hashCanonical } from "../sync/raw-event.js";
/** Deterministic project id from the workspace cwd. */
export function projectIdFor(cwd) {
    return 'track_project_' + hashCanonical([cwd]);
}
/** Parse <cwd>/.git/config for the origin remote URL (pure fs read). */
export function repoUrlOf(cwd) {
    try {
        const config = readFileSync(cwd + '/.git/config', 'utf8');
        const origin = config.match(/\[remote\s+"?origin"?\][^\[]*?url\s*=\s*(\S+)/);
        return origin?.[1];
    }
    catch {
        return undefined;
    }
}
/**
 * Induct projects from stored graphs and assign issues to them.
 * @param store track store.
 * @param dryRun preview without writing (default false).
 */
export async function induceProjects(store, dryRun = false, now = Date.now()) {
    const graphs = await store.listGraphs();
    const byCwd = new Map();
    for (const g of graphs) {
        if (!g.header.cwd)
            continue;
        const list = byCwd.get(g.header.cwd) ?? [];
        list.push(g.sessionId);
        byCwd.set(g.header.cwd, list);
    }
    let sessionsMapped = 0;
    for (const [cwd, sessionIds] of byCwd) {
        sessionsMapped += sessionIds.length;
        if (dryRun)
            continue;
        const id = projectIdFor(cwd);
        const existing = await store.getProject(id);
        const project = {
            id,
            name: basename(cwd) || cwd,
            path: cwd,
            repoUrl: repoUrlOf(cwd),
            sessionIds: Array.from(new Set([...(existing?.sessionIds ?? []), ...sessionIds])),
            createdAt: existing?.createdAt ?? new Date(now).toISOString(),
            updatedAt: new Date(now).toISOString(),
        };
        await store.upsertProject(project);
    }
    // Assign issue.projectId from the first linked session's cwd.
    const issues = await store.listIssues();
    const cwdBySession = new Map();
    for (const g of graphs)
        if (g.header.cwd)
            cwdBySession.set(g.sessionId, g.header.cwd);
    let issuesAssigned = 0;
    for (const issue of issues) {
        const sid = issue.linkedSessionIds?.[0];
        const cwd = sid !== undefined ? cwdBySession.get(sid) : undefined;
        if (cwd === undefined)
            continue;
        const projectId = projectIdFor(cwd);
        if (issue.projectId === projectId)
            continue;
        if (dryRun) {
            issuesAssigned += 1;
            continue;
        }
        await store.upsertIssue({ ...issue, projectId, updatedAt: new Date(now).toISOString() });
        issuesAssigned += 1;
    }
    return { projects: byCwd.size, sessionsMapped, issuesAssigned };
}
