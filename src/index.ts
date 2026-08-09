/**
 * Involute Bridge — embedded task-management engine for DeepSeek Harness.
 *
 * The model-facing tools (capture_thought, report_decision_point, involute_*)
 * are the ONLY entry points to the store; the model never touches storage or
 * session events directly (storage is host-side; cross-session reads are
 * cwd-fenced for the model). This plugin is the thin data face: it owns the
 * KV store, subscribes to session events, and registers the tools the fat
 * skill (skills/dsh-involute/SKILL.md) instructs the model to call.
 *
 * Registrations are effects: unloading the plugin disposes tools and store.
 * @module @deepseek-ai/dsh-involute
 */

import type { Context } from 'cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { KvFacet } from '@deepseek-ai/dsh-storage'
import { InvoluteStore, makeId } from './store.ts'
import type { Capture, Decision, Issue } from './types.ts'

export const name = '@deepseek-ai/dsh-involute'
export const inject = ['tools', 'storage']

/** Involute Bridge plugin configuration. */
export interface Config {
  /** Workspace / team key used for Linear-style identifiers (default INV). */
  teamKey?: string
}

/** Default team key when config omits it. */
export const DEFAULT_TEAM_KEY = 'INV'

export const store = new InvoluteStore()

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
      const backend = ctx.storage.backend.get('json') ?? ctx.storage.backend.get('sqlite')
      return backend?.kv ?? null
    }
    const found = check()
    if (found) { resolve(found); return }
    const timer = setInterval(() => {
      const kv = check()
      if (kv) { clearInterval(timer); if (deadline) clearTimeout(deadline); resolve(kv) }
    }, 100)
    deadline = setTimeout(() => {
      clearInterval(timer)
      reject(new Error('involute: no storage backend with kv facet mounted (json or sqlite)'))
    }, 5000)
  })
}

export function apply(ctx: Context, config?: Config) {
  const teamKey = config?.teamKey ?? DEFAULT_TEAM_KEY

  // Open the KV unit once a kv-capable backend lands (see resolveKv).
  ctx.effect(async () => {
    const kv = await resolveKv(ctx)
    await store.open(kv)
    return () => store.close()
  })

  // ---- capture_thought: drop a thought into the capture wall ----
  ctx.tools.register(defineTool({
    name: 'capture_thought',
    description:
      'Capture an unstructured thought into the Involute capture wall for later triage. '
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
      exec.agent.session.append('involute/decision', decision)
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

  // ---- involute_create_issue: promote structured work ----
  ctx.tools.register(defineTool({
    name: 'involute_create_issue',
    description:
      'Create a structured issue (Linear-compatible) in the Involute store. '
      + 'Use when a captured thought or a derived requirement becomes concrete work with '
      + 'acceptance criteria. Issues map to Involute/Linear-style epics and teams.',
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

  // ---- involute_list_issues: read back issues (Linear shape) ----
  ctx.tools.register(defineTool({
    name: 'involute_list_issues',
    description:
      'List issues from the Involute store, optionally filtered by team and state. '
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

  // ---- session event subscription: capture derived requirements ----
  // The engine observes session events so derived work can be surfaced, but it
  // does NOT auto-create issues — triage stays human/agent confirmed.
  ctx.on('session/event', (_session, event) => {
    // Reserved: fold todo/write, plan/mode, goal/change into linked issues.
    // MVP keeps this as an observation point; auto-aggregation is Phase 0b.
    void event
  })
}

export { store as involuteStore }
