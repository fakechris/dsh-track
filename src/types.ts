/**
 * Track Bridge data shapes — Linear-compatible issue model plus Track's
 * capture/decision/link extensions. KV records keep these exact shapes so a
 * future export to a real Linear-compatible GraphQL service is a straight
 * mapping (see docs/track-bridge-plugin-plan.md).
 * @module @deepseek-ai/dsh-track/types
 */

/** Capture wall entry: an unstructured thought from any source. */
export interface Capture {
  /** Stable id: `track_capture_<uuid>`. */
  id: string
  /** The thought itself (user's words or an agent summary). */
  content: string
  /** Where the thought came from. */
  source: 'user' | 'agent' | 'session'
  /** Source session id when the thought was captured from a session. */
  sourceSessionId?: string
  /** Lifecycle state. */
  status: 'open' | 'promoted' | 'archived' | 'rejected'
  /** Free-form tags for clustering. */
  tags: string[]
  /** ISO 8601 creation time. */
  createdAt: string
  /** Issue id when this capture was promoted. */
  promotedToIssueId?: string
}

/** Issue state (Linear-compatible subset). */
export type IssueState = 'todo' | 'in_progress' | 'done' | 'canceled'

/** Linear-compatible priority: 0=urgent, 1=high, 2=medium, 3=low, 4=no priority. */
export type IssuePriority = 0 | 1 | 2 | 3 | 4

/** Structured work unit — mirrors Linear's Issue core fields. */
export interface Issue {
  /** Stable id: `track_issue_<uuid>`. */
  id: string
  /** Linear-style identifier, e.g. `INV-12`. */
  identifier: string
  /** One-line title. */
  title: string
  /** Full description. */
  description: string
  /** Linear-compatible priority. */
  priority: IssuePriority
  /** Lifecycle state. */
  state: IssueState
  /** Assignee: 'user', 'agent', or a session id. */
  assignee?: string
  /** Parent epic or issue id. */
  parentId?: string
  /** Workspace / team id. */
  teamId: string
  /** Labels. */
  labels: string[]
  /** Acceptance criteria — the contract field Track owns. */
  acceptanceCriteria?: string
  /** Sessions that executed this issue (one issue, many sessions). */
  linkedSessionIds: string[]
  /** ISO 8601 timestamps. */
  createdAt: string
  updatedAt: string
}

/** Epic (Linear Project-shaped simplification). */
export interface Epic {
  id: string
  name: string
  description: string
  status: 'backlog' | 'active' | 'done'
  teamId: string
  issueIds: string[]
  createdAt: string
  updatedAt: string
}

/** Relation edge in the capture↔issue↔session↔epic graph. */
export interface Link {
  id: string
  fromType: 'capture' | 'issue' | 'session' | 'epic'
  fromId: string
  toType: 'capture' | 'issue' | 'session' | 'epic'
  toId: string
  kind: 'relates' | 'blocks' | 'derives' | 'belongs'
  createdAt: string
}

/** Decision point: AI-raised, user-answered, recorded in both session and KV. */
export interface Decision {
  id: string
  /** Session where the decision point arose. */
  sessionId: string
  /** One-line question. */
  question: string
  /** Candidate options. */
  options: string[]
  /** AI's preferred option. */
  aiPreference: string
  /** AI's rationale. */
  aiRationale: string
  /** Impact of the choice. */
  impact: string
  /** What the user must do. */
  need: 'confirm' | 'choose' | 'supplement'
  /** Lifecycle. */
  status: 'pending' | 'answered' | 'dismissed'
  /** User's answer. */
  answer?: string
  answeredAt?: string
  createdAt: string
}

/** Engine metadata stored in the KV global slot. */
export interface TrackGlobal {
  version: 1
  teams: Record<string, { id: string; name: string; cwd?: string }>
  identifierCounter: number
  /**
   * Incremental-sync cursor per workspace: last synced activity timestamp
   * (epoch ms) keyed by session `cwd`. Sync only folds sessions whose
   * lastActivityAt exceeds the cursor, so a re-run is idempotent.
   */
  lastSync?: Record<string, number>
}

/** KV unit descriptor for the track unit. */
export const TRACK_UNIT = {
  name: 'track',
  version: 1,
  tables: ['captures', 'issues', 'epics', 'links', 'decisions'],
  hasGlobal: true,
} as const

// Session event declaration merge: `track/decision` is a durable,
// whole-value session event carrying the complete decision snapshot, so
// replay and resume recover it by last-write-wins (same rule as goal/change).
declare module '@deepseek-ai/dsh-session' {
  interface SessionEventMap {
    'track/decision': Decision
  }
}
