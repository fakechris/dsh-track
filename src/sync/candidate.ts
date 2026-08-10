/**
 * P2 — candidate synthesis + deterministic refinement (v2-design §2 stages ④⑤).
 *
 * Each EvidenceSpan that survived intent layering becomes a TaskCandidate.
 * The LLM synthesizes the title/description/acceptance criteria from the
 * span's requests (schema-constrained JSON); the deterministic refiner then
 * validates evidence, strips unsupported claims, lints the title, and marks
 * inferred AC as proposed. Rule-only fallback produces a plain candidate when
 * no LLM is available (downgrade path).
 * @module @deepseek-ai/dsh-track/sync/candidate
 */

import type { Context } from 'cordis'
import type { EvidenceSpan } from './segment.ts'
import { getLlm, llmJson } from './llm.ts'

export type CandidateKind = 'investigation' | 'bug' | 'implementation' | 'refactor' | 'docs' | 'ops' | 'decision' | 'question' | 'follow_up' | 'non_task'

export interface AcceptanceCriterion {
  text: string
  source: 'explicit_user' | 'inferred' | 'test_derived'
  authority: 'proposed' | 'confirmed'
  required: boolean
}

export interface TaskCandidate {
  id: string
  sessionId: string
  span: { seqStart: number; seqEnd: number }
  kind: CandidateKind
  authority: 'explicit_user' | 'agent_proposed' | 'system_inferred'
  title: string
  goal?: string
  deliverable?: string
  scope: string[]
  nonGoals: string[]
  constraints: string[]
  acceptanceCriteria: AcceptanceCriterion[]
  evidenceRefs: string[]
  confidence: number
  decidedBy: 'rule' | 'model'
  /** Raw requests of the span (triage display + provenance). */
  requests: string[]
}

/** Candidate synthesis system prompt (Linear Method criteria + evidence discipline). */
const CANDIDATE_SYSTEM = `You turn a slice of an AI coding session into ONE task candidate.

Rules:
- Title: short, scan-friendly, states the task directly. Never "Hello"/greeting-only. 动词开头, ≤ 80 chars.
- Description fields: goal (what must be achieved), deliverable (independently verifiable output), scope, non-goals, constraints.
- Acceptance criteria: testable items. Mark source: explicit_user (user stated it), inferred (you derived it), test_derived (a test exists as verifier). Unconfirmed inferred AC are authority=proposed.
- evidenceRefs: the user request lines you used (verbatim).
- confidence: 0-1 how sure you are this is a real task.
- kind: investigation | bug | implementation | refactor | docs | ops | decision | question | follow_up | non_task.

Output ONLY a JSON object:
{"kind": "...", "title": "...", "goal": "...", "deliverable": "...", "scope": ["..."], "nonGoals": ["..."], "constraints": ["..."], "acceptanceCriteria": [{"text": "...", "source": "explicit_user|inferred|test_derived", "authority": "proposed|confirmed", "required": true}], "confidence": 0.0, "reason": "one sentence"}`

/** Deterministic refiner (v2-design §2 stage ⑤): validate + strip unsupported fields. */
export function refineCandidate(candidate: TaskCandidate): TaskCandidate {
  const c: TaskCandidate = {
    ...candidate,
    title: candidate.title.trim().slice(0, 80),
    acceptanceCriteria: candidate.acceptanceCriteria
      .filter((ac) => ac.text && ac.text.trim().length > 0)
      .map((ac) => ({
        ...ac,
        text: ac.text.trim().slice(0, 300),
        // Inferred AC default to proposed unless marked confirmed by the user.
        authority: ac.source === 'explicit_user' && ac.authority === 'confirmed' ? 'confirmed' : 'proposed',
      })),
    // Title lint: greeting-only / no-object titles are non_task.
    ...(isGenericTitle(candidate.title) ? { kind: 'non_task' as const, confidence: Math.min(candidate.confidence, 0.2) } : {}),
  }
  return c
}

/** Greeting / no-object / placeholder titles are not tasks (defect #1 fix). */
export function isGenericTitle(title: string): boolean {
  const t = title.trim().toLowerCase()
  if (!t) return true
  if (/^(hi|hello|你好|嗯|ok|好的|谢谢|thanks|bye|测试|test)$/i.test(t)) return true
  // Pure pronoun / filler without an action or object.
  if (/^(这个|那个|它|他|她|我们|你们|我|你)$/.test(t)) return true
  return false
}

/** Rule-only fallback candidate from a span (no LLM). */
export function candidateFromSpan(span: EvidenceSpan): TaskCandidate {
  const title = span.leadRequest.split('\n')[0]?.slice(0, 80) || '(untitled)'
  return refineCandidate({
    id: `cand_${span.sessionId}_${span.seqStart}`,
    sessionId: span.sessionId,
    span: { seqStart: span.seqStart, seqEnd: span.seqEnd },
    kind: 'investigation',
    authority: 'system_inferred',
    title,
    scope: [],
    nonGoals: [],
    constraints: [],
    acceptanceCriteria: [],
    evidenceRefs: span.requests.map((_, i) => `span.request[${i}]`),
    confidence: 0.3,
    decidedBy: 'rule',
    requests: span.requests,
  })
}

/** LLM synthesis for one span. Returns undefined on failure (downgrade to rule). */
export async function synthesizeCandidate(
  ctx: Context,
  opts: { provider: string; model: string; span: EvidenceSpan; workspaceContext?: string },
): Promise<TaskCandidate | undefined> {
  const llm = getLlm(ctx)
  if (!llm) return undefined
  const context = opts.workspaceContext
    ? `Workspace context:\n${opts.workspaceContext.slice(0, 1500)}\n\n`
    : ''
  const requests = opts.span.requests.map((r, i) => `${i + 1}. ${r.slice(0, 400)}`).join('\n')
  const json = await llmJson(llm, {
    provider: opts.provider,
    model: opts.model,
    system: CANDIDATE_SYSTEM,
    prompt: `${context}Session evidence span (${opts.span.seqStart}..${opts.span.seqEnd}):\n${requests}\n\nSynthesize ONE task candidate.`,
    requiredKeys: ['kind', 'title'],
    maxTokens: 700,
    temperature: 0.2,
    purpose: 'session-title',
  })
  if (!json) return undefined

  const kind = json.kind
  if (typeof kind !== 'string' || !['investigation', 'bug', 'implementation', 'refactor', 'docs', 'ops', 'decision', 'question', 'follow_up', 'non_task'].includes(kind)) {
    return undefined
  }
  const title = typeof json.title === 'string' ? json.title : opts.span.leadRequest.slice(0, 80)
  const asStringArray = (v: unknown): string[] => Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []
  const acs = Array.isArray(json.acceptanceCriteria)
    ? json.acceptanceCriteria
        .filter((a): a is Record<string, unknown> => typeof a === 'object' && a !== null && typeof a.text === 'string')
        .map((a) => ({
          text: a.text as string,
          source: (['explicit_user', 'inferred', 'test_derived'].includes(a.source as string) ? a.source : 'inferred') as AcceptanceCriterion['source'],
          authority: a.authority === 'confirmed' ? 'confirmed' as const : 'proposed' as const,
          required: a.required !== false,
        }))
    : []

  const confidence = typeof json.confidence === 'number' ? Math.min(1, Math.max(0, json.confidence)) : 0.5
  return refineCandidate({
    id: `cand_${opts.span.sessionId}_${opts.span.seqStart}`,
    sessionId: opts.span.sessionId,
    span: { seqStart: opts.span.seqStart, seqEnd: opts.span.seqEnd },
    kind: kind as CandidateKind,
    authority: 'system_inferred',
    title,
    goal: typeof json.goal === 'string' ? json.goal : undefined,
    deliverable: typeof json.deliverable === 'string' ? json.deliverable : undefined,
    scope: asStringArray(json.scope),
    nonGoals: asStringArray(json.nonGoals),
    constraints: asStringArray(json.constraints),
    acceptanceCriteria: acs,
    evidenceRefs: opts.span.requests.map((_, i) => `span.request[${i}]`),
    confidence,
    decidedBy: 'model',
    requests: opts.span.requests,
  })
}
