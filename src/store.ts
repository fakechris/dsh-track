/**
 * TrackStore — the single data face of the Track Bridge engine.
 *
 * Wraps one `ctx.storage` KV unit (`track`) with typed CRUD over
 * captures / issues / epics / links / decisions. The KV contract puts write
 * ordering on the caller, so every mutation funnels through one serialized
 * write chain per table (a simple in-flight promise queue).
 *
 * Storage is host-side only: the model never touches this store directly;
 * model-facing tools registered in index.ts are the only entry points.
 * @module @fakechris/dsh-track/store
 */

import type { KvFacet, KvUnit, KvUnitDescriptor } from '@deepseek-ai/dsh-storage'
import {
  TRACK_UNIT,
  type AuditEntry,
  type Capture,
  type Decision,
  type Epic,
  type TrackGlobal,
  type Issue,
  type Link,
  type LlmUsageRecord,
  type EvidenceRef,
} from './types.ts'
import { MAX_EVIDENCE, isAutoCommit, nextInferred } from './lifecycle/state-machine.ts'

/** Branded identifier prefixes keep record ids recognizable and collision-free. */
export const ID_PREFIX = {
  capture: 'track_capture_',
  issue: 'track_issue_',
  epic: 'track_epic_',
  link: 'track_link_',
  decision: 'track_decision_',
  audit: 'track_audit_',
  usage: 'track_usage_',
} as const

/** Random id with the given brand prefix. */
export function makeId(kind: keyof typeof ID_PREFIX): string {
  const rand = crypto.randomUUID().replaceAll('-', '')
  return `${ID_PREFIX[kind]}${rand}`
}

/** One serialized write chain per table keeps KV ordering sane. */
type WriteChain = Promise<unknown>

export class TrackStore {
  private unit!: KvUnit
  private chains: Record<string, WriteChain> = {}
  private opened = false
  private openPromise: Promise<void> | null = null

  constructor(private readonly descriptor: KvUnitDescriptor = TRACK_UNIT) {}

  /** Open the unit on a kv facet (json or sqlite backend). Call once at plugin apply. */
  open(kvFacet: KvFacet): Promise<void> {
    this.openPromise ??= kvFacet.open(this.descriptor).then((unit) => {
      this.unit = unit
      this.opened = true
    })
    return this.openPromise
  }

  /** Wait for the unit to be open before any store operation. */
  private async ready(): Promise<void> {
    if (this.opened) return
    if (this.openPromise) {
      await this.openPromise
      return
    }
    throw new Error('track: store is not open — the plugin did not complete initialization')
  }

  get isOpen(): boolean {
    return this.opened
  }

  /** Close the unit and drain in-flight writes. */
  async close(): Promise<void> {
    if (!this.opened) return
    await this.unit.close()
    this.opened = false
  }

  /** Serialize one write on a table: next write waits for the previous. */
  private chain<T>(table: string, run: () => Promise<T>): Promise<T> {
    const prev = this.chains[table] ?? Promise.resolve()
    const next = prev.then(run)
    // Keep the chain alive but swallow errors for the next waiter.
    this.chains[table] = next.catch(() => undefined)
    return next
  }

  // ---- global ----

  async readGlobal(): Promise<TrackGlobal | null> {
  await this.ready()
    const g = await this.unit.loadAll().then(({ global }) => global as TrackGlobal | null)
    return g
  }

  async writeGlobal(g: TrackGlobal): Promise<void> {
  await this.ready()
    await this.chain('__global', () => this.unit.setGlobal(g))
  }

  /** Mint the next Linear-style identifier, e.g. `INV-12`. */
  async nextIdentifier(teamKey = 'INV'): Promise<string> {
  await this.ready()
    const g = (await this.readGlobal()) ?? {
      version: 1 as const,
      teams: {},
      identifierCounter: 0,
    }
    g.identifierCounter += 1
    await this.writeGlobal(g)
    return `${teamKey}-${g.identifierCounter}`
  }

  // ---- captures ----

  async listCaptures(status?: Capture['status']): Promise<Capture[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    const caps = Object.values(tables.captures ?? {}) as Capture[]
    return status ? caps.filter((c) => c.status === status) : caps
  }

  async upsertCapture(capture: Capture): Promise<void> {
  await this.ready()
    await this.chain('captures', () =>
      this.unit.putRecord('captures', capture.id, capture))
  }

  async getCapture(id: string): Promise<Capture | undefined> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return (tables.captures ?? {})[id] as Capture | undefined
  }

  async deleteCapture(id: string): Promise<void> {
  await this.ready()
    await this.chain('captures', () => this.unit.deleteRecord('captures', id))
  }

  /**
   * Promote an open capture into a real issue: mint the issue from the
   * capture content and flip the capture to `promoted` with the issue id
   * attached (the same dedup contract the sync align pass uses).
   * @returns the freshly created issue.
   */
  async promoteCaptureToIssue(captureId: string, teamKey = 'INV'): Promise<Issue> {
  await this.ready()
    const capture = await this.getCapture(captureId)
    if (!capture) throw new Error(`capture not found: ${captureId}`)
    if (capture.status === 'promoted' && capture.promotedToIssueId) {
      const existing = await this.getIssue(capture.promotedToIssueId)
      if (existing) return existing
    }
    const issue: Issue = {
      id: makeId('issue'),
      identifier: await this.nextIdentifier(teamKey),
      title: capture.content,
      description: capture.content,
      priority: 2,
      state: 'todo',
      teamId: teamKey,
      labels: [...capture.tags],
      linkedSessionIds: capture.sourceSessionId ? [capture.sourceSessionId] : [],
      promptMessageId: capture.sourceMessageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await this.chain('issues', () => this.unit.putRecord('issues', issue.id, issue))
    await this.chain('captures', () =>
      this.unit.putRecord('captures', capture.id, {
        ...capture,
        status: 'promoted' as const,
        promotedToIssueId: issue.id,
      }))
    return issue
  }

  // ---- decisions ----

  async upsertDecision(decision: Decision): Promise<void> {
  await this.ready()
    await this.chain('decisions', () => this.unit.putRecord('decisions', decision.id, decision))
  }

  async getDecision(id: string): Promise<Decision | undefined> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return (tables.decisions ?? {})[id] as Decision | undefined
  }

  /**
   * List decisions, newest first. Filters are optional and composable.
   * @param state   lifecycle filter (pending | answered | dismissed)
   * @param since   only decisions created at/after this epoch ms
   * @param sessionId  only decisions raised in this session
   */
  async listDecisions(state?: Decision['status'], since?: number, sessionId?: string): Promise<Decision[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    let decisions = Object.values(tables.decisions ?? {}) as Decision[]
    if (state) decisions = decisions.filter((d) => d.status === state)
    if (sessionId) decisions = decisions.filter((d) => d.sessionId === sessionId)
    if (since !== undefined) decisions = decisions.filter((d) => Date.parse(d.createdAt) >= since)
    return decisions.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
  }

  // ---- issues ----

  async listIssues(teamId?: string, state?: Issue['state']): Promise<Issue[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    let issues = Object.values(tables.issues ?? {}) as Issue[]
    if (teamId) issues = issues.filter((i) => i.teamId === teamId)
    if (state) issues = issues.filter((i) => i.state === state)
    return issues
  }

  async getIssue(id: string): Promise<Issue | undefined> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return (tables.issues ?? {})[id] as Issue | undefined
  }

  async upsertIssue(issue: Issue): Promise<void> {
  await this.ready()
    await this.chain('issues', () => this.unit.putRecord('issues', issue.id, issue))
  }

  async deleteIssue(id: string): Promise<void> {
  await this.ready()
    await this.chain('issues', () => this.unit.deleteRecord('issues', id))
  }

  /** Resolve an issue by its store id OR Linear-style identifier (INV-12). */
  async getIssueByInput(input: string): Promise<Issue | undefined> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    const issues = Object.values(tables.issues ?? {}) as Issue[]
    return issues.find((i) => i.id === input || i.identifier === input)
  }

  /**
   * Declare that `sessionId` is driving this issue (track_attach_issue).
   * Sets attachSessionId, appends the session to linkedSessionIds (R8
   * traceability), and clears any previous attachment so one session owns
   * one issue at a time.
   */
  async attachSession(issueId: string, sessionId: string): Promise<Issue | undefined> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    const issues = Object.values(tables.issues ?? {}) as Issue[]
    const target = issues.find((i) => i.id === issueId || i.identifier === issueId)
    if (!target) return undefined
    // Clear a stale attachment pointing at another issue from the same session.
    for (const other of issues) {
      if (other.id !== target.id && other.attachSessionId === sessionId) {
        await this.chain('issues', () => this.unit.putRecord('issues', other.id, { ...other, attachSessionId: undefined }))
      }
    }
    const updated: Issue = {
      ...target,
      attachSessionId: sessionId,
      linkedSessionIds: target.linkedSessionIds.includes(sessionId)
        ? target.linkedSessionIds
        : [...target.linkedSessionIds, sessionId],
      updatedAt: new Date().toISOString(),
    }
    await this.chain('issues', () => this.unit.putRecord('issues', target.id, updated))
    return updated
  }

  /**
   * Record one evidence signal against an issue, re-evaluate the state
   * machine, and apply the result: write `inferred`, update `lastProgressAt`
   * on positive signals, and auto-commit `state` only for the safe
   * todo → in_progress transition. Confirmation-gated proposals (done /
   * canceled) are returned in `confirm` and NOT written to `state`.
   */
  async recordIssueEvidence(issueId: string, signal: EvidenceRef, sessionId: string, now = Date.now()): Promise<{ issue: Issue; confirm?: { to: Issue['state']; reason: string } } | null> {
  await this.ready()
    const issue = await this.getIssue(issueId)
    if (!issue) return null
    const evidence = [...(issue.inferred?.evidence ?? []), signal].slice(-MAX_EVIDENCE)
    const next = nextInferred(issue, evidence, now)
    const updated: Issue = {
      ...issue,
      lastProgressAt: signal.weight > 0 && signal.signal !== 'user-confirm'
        ? Math.max(issue.lastProgressAt ?? 0, signal.at)
        : issue.lastProgressAt,
      inferred: next.inferred,
      updatedAt: new Date().toISOString(),
    }
    // Auto-commit only the reversible todo → in_progress transition.
    if (isAutoCommit(next, issue)) {
      updated.state = 'in_progress'
    }
    await this.chain('issues', () => this.unit.putRecord('issues', issue.id, updated))
    return { issue: updated, confirm: next.confirm }
  }

  /**
   * Commit a state change on explicit confirmation (user nod / panel / a
   * confirmed_by_user tool call). Writes `state` and records the confirmed
   * state as the current inference.
   */
  async confirmIssueState(issueId: string, state: Issue['state'], by: 'user' | 'model' = 'user', now = Date.now()): Promise<Issue | undefined> {
  await this.ready()
    const issue = await this.getIssue(issueId)
    if (!issue) return undefined
    const updated: Issue = {
      ...issue,
      state,
      inferred: {
        state,
        confidence: 1,
        evidence: issue.inferred?.evidence ?? [],
        at: now,
        by,
      },
      updatedAt: new Date().toISOString(),
    }
    await this.chain('issues', () => this.unit.putRecord('issues', issue.id, updated))
    return updated
  }

  // ---- epics ----

  async listEpics(): Promise<Epic[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return Object.values(tables.epics ?? {}) as Epic[]
  }

  async upsertEpic(epic: Epic): Promise<void> {
  await this.ready()
    await this.chain('epics', () => this.unit.putRecord('epics', epic.id, epic))
  }

  // ---- links ----

  async listLinks(): Promise<Link[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return Object.values(tables.links ?? {}) as Link[]
  }

  async upsertLink(link: Link): Promise<void> {
  await this.ready()
    await this.chain('links', () => this.unit.putRecord('links', link.id, link))
  }

  /** All links touching one entity id (either direction). */
  async linksFor(id: string): Promise<Link[]> {
  await this.ready()
    const links = await this.listLinks()
    return links.filter((l) => l.fromId === id || l.toId === id)
  }

  // ---- audit (observability) ----

  async appendAudit(entry: AuditEntry): Promise<void> {
  await this.ready()
    await this.chain('audit', () => this.unit.putRecord('audit', entry.id, entry))
  }

  async listAudit(): Promise<AuditEntry[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return Object.values(tables.audit ?? {}) as AuditEntry[]
  }

  // ---- llm usage ledger (observability / cost accounting) ----

  /** Append one LLM usage record (append-only ledger, one per real request). */
  async appendUsage(record: LlmUsageRecord): Promise<void> {
  await this.ready()
    await this.chain('usage', () => this.unit.putRecord('usage', record.id, record))
  }

  async listUsage(): Promise<LlmUsageRecord[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    return Object.values(tables.usage ?? {}) as LlmUsageRecord[]
  }

  /**
   * Funnel summary over the audit trail — the observability face for the
   * capture/issue/decision pipeline. Answers "how many times was each tool
   * invoked, and what is the capture conversion" directly from the store,
   * instead of archaeology over session logs.
   */
  async funnel(): Promise<{
    tools: Record<string, { calls: number; ok: number; fail: number }>
    captures: { open: number; promoted: number }
    issues: { total: number }
    decisions: { pending: number; answered: number; dismissed: number; answerRate: number | null }
    captureConversion: number | null
  }> {
  await this.ready()
    const audit = await this.listAudit()
    const tools: Record<string, { calls: number; ok: number; fail: number }> = {}
    for (const entry of audit) {
      const acc = (tools[entry.tool] ??= { calls: 0, ok: 0, fail: 0 })
      acc.calls += 1
      if (entry.ok) acc.ok += 1
      else acc.fail += 1
    }
    const captures = await this.listCaptures()
    const open = captures.filter((c) => c.status === 'open').length
    const promoted = captures.filter((c) => c.status === 'promoted').length
    const issues = await this.listIssues()
    const decisions = await this.listDecisions()
    const pending = decisions.filter((d) => d.status === 'pending').length
    const answered = decisions.filter((d) => d.status === 'answered').length
    const dismissed = decisions.filter((d) => d.status === 'dismissed').length
    const captureCalls = tools['capture_thought']?.calls ?? 0
    return {
      tools,
      captures: { open, promoted },
      issues: { total: issues.length },
      decisions: {
        pending,
        answered,
        dismissed,
        answerRate: decisions.length > 0 ? Number((answered / decisions.length).toFixed(3)) : null,
      },
      captureConversion: captureCalls > 0 ? Number((promoted / captureCalls).toFixed(3)) : null,
    }
  }
}

export type { KvFacet }
