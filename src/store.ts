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
 * @module @deepseek-ai/dsh-track/store
 */

import type { KvFacet, KvUnit, KvUnitDescriptor } from '@deepseek-ai/dsh-storage'
import {
  TRACK_UNIT,
  type Capture,
  type Decision,
  type Epic,
  type TrackGlobal,
  type Issue,
  type Link,
} from './types.ts'

/** Branded identifier prefixes keep record ids recognizable and collision-free. */
export const ID_PREFIX = {
  capture: 'track_capture_',
  issue: 'track_issue_',
  epic: 'track_epic_',
  link: 'track_link_',
  decision: 'track_decision_',
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

  // ---- decisions ----

  async listDecisions(status?: Decision['status']): Promise<Decision[]> {
  await this.ready()
    const { tables } = await this.unit.loadAll()
    const ds = Object.values(tables.decisions ?? {}) as Decision[]
    return status ? ds.filter((d) => d.status === status) : ds
  }

  async upsertDecision(decision: Decision): Promise<void> {
  await this.ready()
    await this.chain('decisions', () => this.unit.putRecord('decisions', decision.id, decision))
  }
}

export type { KvFacet }
