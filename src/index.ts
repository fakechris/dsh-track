/**
 * Track Bridge — embedded task-management engine for DeepSeek Harness.
 *
 * The model-facing tools (capture_thought, report_decision_point, track_*)
 * are the ONLY entry points to the store; the model never touches storage or
 * session events directly (storage is host-side; cross-session reads are
 * cwd-fenced for the model). This plugin is the thin data face: it owns the
 * KV store, subscribes to session events, and registers the tools the fat
 * skill (skills/dsh-track/SKILL.md) instructs the model to call.
 *
 * Registrations are effects: unloading the plugin disposes tools and store.
 * @module @deepseek-ai/dsh-track
 */

import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from 'cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { KvFacet } from '@deepseek-ai/dsh-storage'
// Type-only: pulls the ctx.httpServer Context merge from dsh-host-webserver.
import type {} from '@deepseek-ai/dsh-host-webserver'
import { TrackStore, makeId } from './store.ts'
import type { Capture, Decision, Issue } from './types.ts'
import { runSync } from './sync/run.ts'
import type { SyncOptions, SyncReport, SyncDeps as SyncReportDeps } from './sync/run.ts'

export const name = '@deepseek-ai/dsh-track'
export const inject = ['tools', 'storage']

/** Track Bridge plugin configuration. */
export interface Config {
  /** Workspace / team key used for Linear-style identifiers (default INV). */
  teamKey?: string
}

/** Default team key when config omits it. */
export const DEFAULT_TEAM_KEY = 'INV'

export const store = new TrackStore()

/**
 * Resolve a kv-capable backend, waiting for storage-json/sqlite to register.
 * Cordis starts plugins with no mutual dependency in parallel, so the json
 * backend may land after this plugin's apply; poll a short grace period and
 * fail loud rather than hanging or silently proceeding without storage.
 */
function resolveKv(ctx: Context): Promise<KvFacet> {
  return new Promise((resolve, reject) => {
    let deadline: ReturnType<typeof setTimeout> | undefined
    const check = (): KvFacet | null => {
      // BackendRegistry.get throws for an unregistered name, so probe the
      // registered names first — a backend may land after this plugin's apply.
      const names = ctx.storage.backend.names()
      const name = ['json', 'sqlite'].find((candidate) => names.includes(candidate))
      if (!name) return null
      return ctx.storage.backend.get(name).kv ?? null
    }
    const found = check()
    if (found) { resolve(found); return }
    // Cordis starts plugins with no mutual dependency in parallel; the json
    // backend may register after this plugin's apply. Poll generously (30s)
    // — the web boot registers storage-json only after its deps settle.
    const timer = setInterval(() => {
      const kv = check()
      if (kv) { clearInterval(timer); if (deadline) clearTimeout(deadline); resolve(kv) }
    }, 200)
    deadline = setTimeout(() => {
      clearInterval(timer)
      reject(new Error('track: no storage backend with kv facet mounted (json or sqlite)'))
    }, 30000)
  })
}

export function apply(ctx: Context, config?: Config) {
  const teamKey = config?.teamKey ?? DEFAULT_TEAM_KEY
  // HTTP handlers may fire before the store effect opens the unit; keep a
  // lazily-resolved open so the API works regardless of boot ordering.
  let openPromise: Promise<void> | null = null
  const ensureStoreOpen = (): Promise<void> => {
    if (store.isOpen) return Promise.resolve()
    openPromise ??= resolveKv(ctx).then((kv) => store.open(kv))
    return openPromise
  }

  // Open the KV unit once a kv-capable backend lands (see resolveKv).
  ctx.effect(async () => {
    try {
      const kv = await resolveKv(ctx)
      console.log('[dsh-track] kv backend resolved, opening store')
      await store.open(kv)
      console.log('[dsh-track] store open:', store.isOpen)
    } catch (e) {
      console.error('[dsh-track] store open failed:', e)
      throw e
    }
    return () => store.close()
  })

  // ---- capture_thought: drop a thought into the capture wall ----
  ctx.tools.register(defineTool({
    name: 'capture_thought',
    description:
      'Capture an unstructured thought into the Track capture wall for later triage. '
      + 'Use when the user mentions something unrelated to the current work, a future plan, '
      + 'or a half-formed idea — never let it interrupt the current task.',
    parameters: {
      content: { type: 'string', required: true, description: 'The thought, in the user\'s words if possible.' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Optional free-form tags for later clustering.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args, exec) {
      const capture: Capture = {
        id: makeId('capture'),
        content: args.content,
        source: exec.agent ? 'session' : 'user',
        sourceSessionId: exec.agent?.id,
        status: 'open',
        tags: args.tags ?? [],
        createdAt: new Date().toISOString(),
      }
      await store.upsertCapture(capture)
      return `Captured: ${capture.id} (open)`
    },
    presentCall: (args) => ({ card: 'generic', title: 'Capture thought', kind: 'other', rawInput: args.content }),
  }))

  // ---- report_decision_point: AI raises a decision, user answers ----
  ctx.tools.register(defineTool({
    name: 'report_decision_point',
    description:
      'Raise a decision point that the user must answer before you continue. '
      + 'Use ONLY when the choice is irreversible, involves risk or values, changes scope or '
      + 'acceptance, or cannot be inferred from context — NOT for reversible routine choices. '
      + 'Always state your preference and rationale so the user makes a lightweight decision. '
      + 'After the user answers, record the outcome.',
    parameters: {
      question: { type: 'string', required: true, description: 'The decision in one sentence.' },
      options: { type: 'array', required: true, items: { type: 'string' }, description: 'Candidate options.' },
      my_preference: { type: 'string', required: true, description: 'Your preferred option.' },
      rationale: { type: 'string', required: true, description: 'Why you prefer it.' },
      impact: { type: 'string', description: 'What choosing your preference means.' },
      need: { type: 'string', enum: ['confirm', 'choose', 'supplement'], description: 'confirm: approve my preference; choose: pick an option; supplement: give me more info.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args, exec) {
      if (!exec.agent) {
        throw new Error('report_decision_point requires an owning agent session')
      }
      const decision: Decision = {
        id: makeId('decision'),
        sessionId: exec.agent.id,
        question: args.question,
        options: args.options,
        aiPreference: args.my_preference,
        aiRationale: args.rationale,
        impact: args.impact ?? '',
        need: args.need ?? 'confirm',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }
      // Durable in-session trace: the decision is a session event.
      exec.agent.session.append('track/decision', decision)
      // Durable in-store record: the decision is a management object.
      await store.upsertDecision(decision)
      return (
        `Decision point raised: ${decision.id}\n`
        + `Question: ${decision.question}\n`
        + `Options: ${decision.options.join(' | ')}\n`
        + `My preference: ${decision.aiPreference} — ${decision.aiRationale}\n`
        + (decision.impact ? `Impact: ${decision.impact}\n` : '')
        + `Waiting on: ${decision.need}`
      )
    },
    presentCall: (args) => ({ card: 'generic', title: 'Decision point', kind: 'other', rawInput: args.question }),
  }))

  // ---- track_create_issue: promote structured work ----
  ctx.tools.register(defineTool({
    name: 'track_create_issue',
    description:
      'Create a structured issue (Linear-compatible) in the Track store. '
      + 'Use when a captured thought or a derived requirement becomes concrete work with '
      + 'acceptance criteria. Issues map to Track/Linear-style epics and teams.',
    parameters: {
      title: { type: 'string', required: true, description: 'One-line title.' },
      description: { type: 'string', description: 'Full description.' },
      priority: { type: 'integer', enum: [0, 1, 2, 3, 4], description: '0=urgent, 1=high, 2=medium, 3=low, 4=no priority (default 2).' },
      acceptance: { type: 'string', description: 'Acceptance criteria — the contract field.' },
      parent_id: { type: 'string', description: 'Parent epic or issue id.' },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          identifier: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: `Created ${value.identifier} (${value.id})` }],
    },
    async execute(args) {
      const issue: Issue = {
        id: makeId('issue'),
        identifier: await store.nextIdentifier(teamKey),
        title: args.title,
        description: args.description ?? '',
        priority: (args.priority ?? 2) as Issue['priority'],
        state: 'todo',
        assignee: undefined,
        parentId: args.parent_id,
        teamId: teamKey,
        labels: [],
        acceptanceCriteria: args.acceptance,
        linkedSessionIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      await store.upsertIssue(issue)
      return { id: issue.id, identifier: issue.identifier }
    },
    presentCall: (args) => ({ card: 'generic', title: 'Create issue', kind: 'other', rawInput: args.title }),
  }))

  // ---- track_list_issues: read back issues (Linear shape) ----
  ctx.tools.register(defineTool({
    name: 'track_list_issues',
    description:
      'List issues from the Track store, optionally filtered by team and state. '
      + 'Returns the Linear-compatible shape (identifier, title, priority, state, labels).',
    parameters: {
      team_id: { type: 'string', description: 'Team/workspace id filter.' },
      state: { type: 'string', enum: ['todo', 'in_progress', 'done', 'canceled'], description: 'State filter.' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      const issues = await store.listIssues(args.team_id, args.state)
      if (issues.length === 0) return 'No issues.'
      return issues
        .map((i) => `${i.identifier} [${i.state}] (${i.priority}) ${i.title}${i.acceptanceCriteria ? ` — acceptance: ${i.acceptanceCriteria}` : ''}`)
        .join('\n')
    },
    presentCall: (args) => ({ card: 'generic', title: 'List issues', kind: 'other', rawInput: args.state ?? 'all' }),
  }))

  // ---- track_sync_history: review workspace sessions → epic/issue history ----
  // The "plugin command": folds user-initiated requests from past sessions in
  // the current workspace into epic/issue-level candidates, aligns them with
  // the existing store, and (after confirmation) writes them back. Requires the
  // session-query service, which the web profile mounts; runs dry-run by
  // default so write-back stays track-confirmed.
  ctx.tools.register(defineTool({
    name: 'track_sync_history',
    description:
      'Review past user sessions in the current workspace and sync epic/issue-level task history into the Track store. '
      + 'Scans sessions whose cwd matches this workspace, extracts user-initiated requests, clusters them into epic/issue '
      + 'candidates, and reconciles with existing issues (create or update). Defaults to a dry-run preview listing candidates '
      + 'and the planned create/update actions; set dry_run=false to write back. Incremental: only folds sessions with new '
      + 'activity since the last sync. Use when the user asks to "sync history", "整理最近的工作", or wants past sessions '
      + 'tracked as tasks.',
    parameters: {
      workspace: { type: 'string', description: 'Exact workspace cwd to scan. Defaults to the current session\'s cwd.' },
      since: { type: 'string', description: 'Only fold sessions active after this ISO timestamp or epoch-ms number. Defaults to 7 days ago.' },
      dry_run: { type: 'boolean', description: 'Preview only — list candidates and planned actions without writing. Default true.' },
      max_sessions: { type: 'integer', description: 'Safety cap on sessions scanned per run (default 200).' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args, exec) {
      if (!exec.agent) {
        throw new Error('track_sync_history requires an owning agent session')
      }
      const sessionQuery = getSessionQuery(ctx)
      if (!sessionQuery) {
        throw new Error('track_sync_history requires the session-query service (mounted by the web profile)')
      }
      const workspace = args.workspace ?? exec.agent.session.header.cwd
      if (!workspace) {
        throw new Error('track_sync_history needs a workspace cwd: pass workspace= or run from a session with one')
      }
      const since = args.since !== undefined
        ? (/^\d+$/.test(String(args.since)) ? Number(args.since) : Date.parse(String(args.since)))
        : undefined
      if (since !== undefined && Number.isNaN(since)) {
        throw new Error(`invalid since timestamp: ${String(args.since)}`)
      }
      const options: SyncOptions = {
        cwd: workspace,
        since,
        dryRun: args.dry_run ?? true,
        maxSessions: args.max_sessions,
      }
      const report: SyncReport = await runSync(
        { sessionQuery: sessionQuery as SyncReportDeps['sessionQuery'], store },
        options,
      )
      return formatSyncReport(report, options.dryRun ?? true)
    },
    presentCall: (args) => ({ card: 'generic', title: 'Sync session history', kind: 'other', rawInput: args.workspace ?? 'current workspace' }),
  }))

  // ---- session event subscription: capture derived requirements ----
  // The engine observes session events so derived work can be surfaced, but it
  // does NOT auto-create issues — triage stays human/agent confirmed.
  ctx.on('session/event', (_session, event) => {
    // Reserved: fold todo/write, plan/mode, goal/change into linked issues.
    // MVP keeps this as an observation point; auto-aggregation is Phase 0b.
    void event
  })

  // ---- HTTP API for the Web client panel (optional: needs httpServer) ----
  // The client plugin fetches captures/decisions/issues over these routes so
  // the panel has a data face without an api-remotes generated pipeline.
  ctx.inject(['httpServer'], (serverCtx) => {
    console.log('[dsh-track] httpServer inject fired')
    const json = (res: ServerResponse, body: unknown, status = 200): void => {
      res.writeHead(status, { 'content-type': 'application/json' })
      res.end(JSON.stringify(body))
    }
    const readBody = (req: IncomingMessage): Promise<Record<string, unknown>> =>
      new Promise((resolve, reject) => {
        let data = ''
        req.on('data', (c) => { data += c })
        req.on('end', () => {
          try { resolve(data ? JSON.parse(data) as Record<string, unknown> : {}) }
          catch (e) { reject(e) }
        })
        req.on('error', reject)
      })

    // Register the three GET routes + the POST capture route immediately.
    // (A prior version wrapped register in an `api(path)` helper that was
    // returned but never invoked — routes were never registered.)
    const registerRoute = (path: string, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> | void) =>
      serverCtx.httpServer.register({
        kind: 'exact',
        path: `/api/track${path}`,
        handler: (req, res) => Promise.resolve(handler(req, res)).catch((e) => {
          json(res, { error: e instanceof Error ? e.message : String(e) }, 500)
        }),
      })
    registerRoute('/captures', async (req, res) => {
      await ensureStoreOpen()
      if (req.method === 'POST') {
        const body = await readBody(req)
        const content = typeof body.content === 'string' ? body.content : ''
        if (!content) { json(res, { error: 'content required' }, 400); return }
        const tags = Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === 'string') : []
        const capture: Capture = {
          id: makeId('capture'),
          content,
          source: 'user',
          status: 'open',
          tags,
          createdAt: new Date().toISOString(),
        }
        await store.upsertCapture(capture)
        json(res, { ok: true, capture }); return
      }
      if (req.method === 'GET') { json(res, { captures: await store.listCaptures() }); return }
      json(res, { error: 'method not allowed' }, 405)
    })
    registerRoute('/decisions', async (_req, res) => {
      await ensureStoreOpen()
      json(res, { decisions: await store.listDecisions() })
    })
    registerRoute('/issues', async (_req, res) => {
      await ensureStoreOpen()
      json(res, { issues: await store.listIssues() })
    })
    registerRoute('/sync', async (req, res) => {
      await ensureStoreOpen()
      if (req.method !== 'POST') { json(res, { error: 'method not allowed' }, 405); return }
      const sessionQuery = getSessionQuery(ctx)
      if (!sessionQuery) {
        json(res, { error: 'session-query service unavailable (web profile only)' }, 503)
        return
      }
      const body = await readBody(req)
      const workspace = typeof body.workspace === 'string' ? body.workspace : undefined
      const since = typeof body.since === 'number' ? body.since : undefined
      const dryRun = typeof body.dry_run === 'boolean' ? body.dry_run : true
      const maxSessions = typeof body.max_sessions === 'number' ? body.max_sessions : undefined
      try {
        const report = await runSync(
          { sessionQuery: sessionQuery as SyncReportDeps['sessionQuery'], store },
          { cwd: workspace ?? (ctx as unknown as { workspace?: { cwd?: string } }).workspace?.cwd ?? '', since, dryRun, maxSessions },
        )
        json(res, { ok: true, dryRun, report })
      } catch (e) {
        json(res, { ok: false, error: e instanceof Error ? e.message : String(e) }, 500)
      }
    })
  })
}

export { store as trackStore }

/**
 * Non-throwing access to the optional session-query service. cordis proxy get
 * throws "without inject" for undeclared services; `reflect.get(name, false)`
 * returns the value or undefined, so the plugin still applies in host
 * compositions that do not mount session-query (tests, headless).
 */
function getSessionQuery(ctx: Context): unknown {
  const reflect = (ctx as unknown as { reflect?: { get: (name: string, strict?: boolean) => unknown } }).reflect
  return reflect?.get('sessionQuery', false)
}

/** Render a sync report as the tool's text result. */
function formatSyncReport(report: SyncReport, dryRun: boolean): string {
  const mode = dryRun ? 'DRY RUN (no writes)' : 'WRITTEN'
  const lines: string[] = [
    `Track history sync — ${mode}`,
    `Scanned ${report.scannedSessions} session(s), ${report.userRequests} user request(s), skipped ${report.skippedByCursor} by cursor.`,
    `Candidates: ${report.issueCandidates.length} issue(s), ${report.epicCandidates.length} epic(s).`,
  ]
  if (report.issueCandidates.length === 0) {
    lines.push('No new session activity in scope.')
    return lines.join('\n')
  }
  lines.push('')
  lines.push('Planned actions:')
  for (const action of report.actions) {
    if (action.kind === 'create') {
      lines.push(`  + create ${action.candidate.title} (${action.candidate.suggestedState})`)
    } else if (action.kind === 'update') {
      lines.push(`  ~ update ${action.existing.identifier} ${action.existing.title} — ${action.changes.join('; ')}`)
    } else {
      lines.push(`  = skip ${action.existing.identifier} (${action.reason})`)
    }
  }
  lines.push('')
  lines.push(`Summary: ${report.created} create / ${report.updated} update / ${report.skipped} skip.`)
  if (dryRun) {
    lines.push('Run again with dry_run=false to write these changes.')
  }
  return lines.join('\n')
}
