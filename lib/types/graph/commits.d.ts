/**
 * M3 — git artifact scan: read a project's commit log, persist commits, and
 * align them with sessions (activity time window → landed-in) and issues
 * (title token overlap + session-window → implements). The git runner is
 * injected so tests never exec git; production uses execFileSync.
 * @module @fakechris/dsh-track/graph/commits
 */
import type { TrackStore } from '../store.ts';
import type { CommitArtifact } from '../types.ts';
/** Git command runner — injectable (tests use a fake; prod execs git). */
export type GitRunner = (args: string[]) => string;
export declare const defaultGitRunner: GitRunner;
export interface CommitScanResult {
    commits: number;
    sessionsLinked: number;
    issuesLinked: number;
    byKind: Record<string, number>;
    error?: string;
}
/** Grace added to a session's last-activity window when matching commits. */
export declare const SESSION_GRACE_MS: number;
/** Title-overlap threshold for issue → commit implements links. */
export declare const IMPLEMENTS_OVERLAP = 0.5;
export declare function commitIdFor(sha: string): string;
/**
 * Parse `git log --format=%H%x00%aI%x00%s` output lines into commit artifacts.
 */
export declare function parseCommitLines(raw: string, repo: string): CommitArtifact[];
/**
 * Scan one project repo: persist commits, then align with sessions (time
 * window) and issues (title overlap / session window). Idempotent: commit ids
 * and link ids are deterministic hashes.
 * @param store track store.
 * @param cwd repo working directory.
 * @param opts dryRun previews counts without writing; limit caps the log;
 *        runGit injects the git runner (default execs git).
 */
export declare function scanProjectCommits(store: TrackStore, cwd: string, opts?: {
    dryRun?: boolean;
    limit?: number;
    runGit?: GitRunner;
}): Promise<CommitScanResult>;
