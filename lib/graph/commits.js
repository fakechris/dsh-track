/**
 * M3 — git artifact scan: read a project's commit log, persist commits, and
 * align them with sessions (activity time window → landed-in) and issues
 * (title token overlap + session-window → implements). The git runner is
 * injected so tests never exec git; production uses execFileSync.
 * @module @fakechris/dsh-track/graph/commits
 */
import { execFileSync } from 'node:child_process';
import { hashCanonical } from "../sync/raw-event.js";
import { contentTokens } from "../sync/align.js";
import { titleSimilarity } from "../store.js";
import { semanticLinkId } from "./links.js";
import { projectIdFor } from "./projects.js";
export const defaultGitRunner = (args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
/** Grace added to a session's last-activity window when matching commits. */
export const SESSION_GRACE_MS = 10 * 60 * 1000;
/** Title-overlap threshold for issue → commit implements links. */
export const IMPLEMENTS_OVERLAP = 0.5;
export function commitIdFor(sha) {
    return 'track_commit_' + hashCanonical([sha]);
}
/**
 * Parse `git log --format=%H%x00%aI%x00%s` output lines into commit artifacts.
 */
export function parseCommitLines(raw, repo) {
    return raw.split('\n').filter(Boolean).map((line) => {
        const [sha, dateIso, subject] = line.split('\0');
        const authorAt = Date.parse(dateIso ?? '');
        if (!sha || !Number.isFinite(authorAt))
            return undefined;
        return {
            id: commitIdFor(sha),
            sha,
            projectId: projectIdFor(repo),
            repo,
            authorAt,
            subject: (subject ?? '').slice(0, 200),
            createdAt: new Date().toISOString(),
        };
    }).filter((c) => c !== undefined);
}
/**
 * Scan one project repo: persist commits, then align with sessions (time
 * window) and issues (title overlap / session window). Idempotent: commit ids
 * and link ids are deterministic hashes.
 * @param store track store.
 * @param cwd repo working directory.
 * @param opts dryRun previews counts without writing; limit caps the log;
 *        runGit injects the git runner (default execs git).
 */
export async function scanProjectCommits(store, cwd, opts = {}) {
    const runGit = opts.runGit ?? defaultGitRunner;
    const limit = opts.limit ?? 200;
    const dryRun = opts.dryRun ?? false;
    let raw;
    try {
        raw = runGit(['-C', cwd, 'log', '--max-count=' + limit, '--format=%H%x00%aI%x00%s']);
    }
    catch (e) {
        return { commits: 0, sessionsLinked: 0, issuesLinked: 0, byKind: {}, error: e instanceof Error ? e.message : String(e) };
    }
    const commits = parseCommitLines(raw, cwd);
    const byKind = {};
    let count = 0;
    const put = async (fromType, fromId, toType, toId, kind, eventTime) => {
        count += 1;
        byKind[kind] = (byKind[kind] ?? 0) + 1;
        if (dryRun)
            return;
        const link = {
            id: semanticLinkId(fromType, fromId, toType, toId, kind),
            fromType, fromId, toType, toId, kind,
            createdAt: new Date().toISOString(),
            eventTime,
            ingestedAt: new Date().toISOString(),
        };
        await store.upsertLink(link);
    };
    if (!dryRun) {
        for (const c of commits)
            await store.upsertCommit(c);
    }
    // Session alignment: commits whose author date falls inside a session's
    // activity window [createdAt, lastActivityAt + grace] landed in that session.
    const graphs = await store.listGraphs();
    const cwdGraphs = graphs.filter((g) => g.header.cwd === cwd);
    let sessionsLinked = 0;
    for (const g of cwdGraphs) {
        const start = g.header.createdAt;
        // lastActivityAt is present on v2+ graphs; conservative fallback = no window.
        const end = (g.lastActivityAt ?? g.header.createdAt) + SESSION_GRACE_MS;
        for (const c of commits) {
            if (c.authorAt >= start && c.authorAt <= end) {
                await put('session', g.sessionId, 'commit', c.id, 'landed-in', c.authorAt);
                sessionsLinked += 1;
            }
        }
    }
    // Issue alignment: a commit implements an issue when its subject overlaps
    // the title (token similarity) OR it landed in a session that executed the
    // issue (the session-window rule above).
    const issues = await store.listIssues();
    let issuesLinked = 0;
    const commitById = new Map(commits.map((c) => [c.id, c]));
    for (const i of issues) {
        const issueSessions = new Set(i.linkedSessionIds ?? []);
        const titleTokens = contentTokens(i.title);
        for (const c of commits) {
            const windowHit = [...issueSessions].some((sid) => {
                const g = cwdGraphs.find((x) => x.sessionId === sid);
                return g !== undefined && c.authorAt >= g.header.createdAt && c.authorAt <= (g.lastActivityAt ?? g.header.createdAt) + SESSION_GRACE_MS;
            });
            const overlapHit = titleSimilarity(titleTokens, contentTokens(c.subject)) >= IMPLEMENTS_OVERLAP;
            if (windowHit || overlapHit) {
                await put('issue', i.id, 'commit', c.id, 'implements', c.authorAt);
                issuesLinked += 1;
            }
        }
        void commitById;
    }
    return { commits: commits.length, sessionsLinked, issuesLinked, byKind };
}
