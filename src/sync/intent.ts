/**
 * P2 — request intent layering (v2-design §3.5).
 *
 * Decides whether a user request is a task candidate (requirement), an
 * execution step (directive), or a correction (interruption). This is a
 * SEMANTIC judgement — the LLM judges it few-shot using workspace context;
 * rules only provide cheap pre-filters (verb/object heuristics) that the LLM
 * can override. Without an LLM, the rule pre-filter is the downgrade path.
 *
 * The golden proto's intentLayering block is the few-shot exemplar set.
 * @module @deepseek-ai/dsh-track/sync/intent
 */

import type { Context } from 'cordis'
import { getLlm, llmJson } from './llm.ts'

export type RequestIntent = 'requirement' | 'directive' | 'interruption'

export interface IntentVerdict {
  intent: RequestIntent
  /** LLM judgment: whether the object belongs to the product domain. */
  objectDomainRelevant?: boolean
  confidence: number
  decidedBy: 'rule' | 'model'
  /** Human-readable reason (for triage display). */
  reason: string
}

/** Cheap rule pre-filter: verbs/objects that lean directive. */
const DIRECTIVE_HINTS = [
  /\b(fork|restart|commit|push|pull|pr|clone|install|configure|build|submit)\b/i,
  /(帮我|你来|试一?下|继续|接着)/,
  /^cd\b|\bls\b|\bgit\b/,
]

/** Objects that lean environment-domain (only used as a pre-filter hint; the LLM decides). */
const ENV_OBJECT_HINTS = /\b(pnpm|npm|yarn|node|brew|pip|cargo|docker|git|redis|postgres|mysql)\b/i

/** Rule-only pre-filter. Never authoritative alone — the LLM can override. */
export function ruleIntentPrefilter(text: string): { intent: RequestIntent; confidence: number; reason: string } {
  if (DIRECTIVE_HINTS.some((re) => re.test(text))) {
    return { intent: 'directive', confidence: 0.4, reason: 'directive verb/object hint' }
  }
  if (ENV_OBJECT_HINTS.test(text) && /(装|安装|配置|setup|install)/i.test(text)) {
    return { intent: 'directive', confidence: 0.5, reason: 'environment-domain install hint' }
  }
  return { intent: 'requirement', confidence: 0.3, reason: 'no directive hint' }
}

/** System prompt for the intent judge. */
const INTENT_SYSTEM = `You classify whether a user request in an AI coding session is a TASK (requirement), an EXECUTION STEP (directive), or a CORRECTION (interruption).

- requirement: a high-level goal, problem/bug report, or investigation with an independently verifiable deliverable. Creates an issue.
- directive: a detail-level execution instruction (fork/restart/commit/pr/push/install/configure/build/clone/submit/continue). A step toward some requirement — does NOT create an issue by itself.
- interruption: a correction or acceptance feedback ("you messed up", "no, that's wrong"). Only creates an issue if it articulates a new independently verifiable goal.

Key nuance — object-domain relevance: "install/configure X" is a directive if X is generic dev tooling (pnpm, git, node, brew), but a requirement if X is a product-domain object (a component of the product being built, e.g. installing/configuring the product's own TUI client). Judge from the workspace context: what is the product?

Output ONLY a JSON object:
{"intent": "requirement"|"directive"|"interruption", "objectDomainRelevant": true|false, "confidence": 0.0-1.0, "reason": "one short sentence"}`

/** LLM intent verdict for one request. Returns undefined on failure (downgrade). */
export async function judgeIntent(
  ctx: Context,
  opts: { provider: string; model: string; requestText: string; workspaceContext?: string },
): Promise<IntentVerdict | undefined> {
  const llm = getLlm(ctx)
  if (!llm) return undefined
  const context = opts.workspaceContext
    ? `Workspace context (what the product is):\n${opts.workspaceContext.slice(0, 2000)}\n\n`
    : ''
  const json = await llmJson(llm, {
    provider: opts.provider,
    model: opts.model,
    system: INTENT_SYSTEM,
    prompt: `${context}User request:\n${opts.requestText.slice(0, 1500)}\n\nClassify it.`,
    requiredKeys: ['intent', 'confidence'],
    maxTokens: 300,
    temperature: 0,
    purpose: 'session-title', // closed enum; the value is metadata only
  })
  if (!json) return undefined
  const intent = json.intent
  if (intent !== 'requirement' && intent !== 'directive' && intent !== 'interruption') return undefined
  const confidence = typeof json.confidence === 'number' ? Math.min(1, Math.max(0, json.confidence)) : 0.5
  return {
    intent,
    objectDomainRelevant: typeof json.objectDomainRelevant === 'boolean' ? json.objectDomainRelevant : undefined,
    confidence,
    decidedBy: 'model',
    reason: typeof json.reason === 'string' ? json.reason : 'model judgement',
  }
}

/** Resolve the final verdict: prefer the LLM, fall back to the rule pre-filter. */
export async function resolveIntent(
  ctx: Context,
  opts: { provider: string; model: string; requestText: string; workspaceContext?: string },
): Promise<IntentVerdict> {
  const rule = ruleIntentPrefilter(opts.requestText)
  const model = await judgeIntent(ctx, opts)
  if (!model) return { ...rule, decidedBy: 'rule' }
  // LLM overrides the rule pre-filter.
  return model
}
