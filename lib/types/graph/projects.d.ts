/**
 * M2 — project induction: group graph docs by header.cwd into Project nodes
 * (name = basename, repoUrl parsed from .git/config remote origin — no exec),
 * then assign issue.projectId from the first linked session's graph cwd.
 * Deterministic: project ids are hashes of the cwd, so re-runs are idempotent.
 * @module @fakechris/dsh-track/graph/projects
 */
import type { TrackStore } from '../store.ts';
export interface ProjectInductionResult {
    projects: number;
    sessionsMapped: number;
    issuesAssigned: number;
}
/** Deterministic project id from the workspace cwd. */
export declare function projectIdFor(cwd: string): string;
/** Parse <cwd>/.git/config for the origin remote URL (pure fs read). */
export declare function repoUrlOf(cwd: string): string | undefined;
/**
 * Induct projects from stored graphs and assign issues to them.
 * @param store track store.
 * @param dryRun preview without writing (default false).
 */
export declare function induceProjects(store: TrackStore, dryRun?: boolean, now?: number): Promise<ProjectInductionResult>;
