/**
 * P2 — LLM facade over the harness `ctx.llm` service.
 *
 * All semantic judgement in the v2 pipeline (intent layering, segmentation
 * boundary decisions, candidate synthesis) funnels through this module. It
 * provides a single JSON-output call that:
 * - streams via `ctx.llm.stream(GenerateOptions)` and assembles text blocks
 *   through the harness BlockAssembler,
 * - requests JSON via a `system` instruction + structural validation,
 * - degrades gracefully when the llm service is unavailable or a call fails
 *   (returns `undefined` so callers fall back to rule-only behavior).
 *
 * Keyless-safe: `getLlm` returns undefined without the service; every caller
 * must handle the undefined path (v2-design §3.2 downgrade policy).
 * @module @deepseek-ai/dsh-track/sync/llm
 */

import type { Context } from 'cordis'
import { BlockAssembler } from '@deepseek-ai/dsh-llm'
import type { GenerateOptions, Message, StreamChunk } from '@deepseek-ai/dsh-llm'

/** Minimal surface of the harness llm service we consume. */
export interface LlmLike {
  stream(options: GenerateOptions): AsyncIterable<StreamChunk>
}

/** Resolve the llm service non-throwingly (same pattern as sessionQuery). */
export function getLlm(ctx: Context): LlmLike | undefined {
  const reflect = (ctx as unknown as { reflect?: { get: (name: string, strict?: boolean) => unknown } }).reflect
  return reflect?.get('llm', false) as LlmLike | undefined
}

/** Build a user message from text (source: plugin). */
export function userMessage(text: string): Message {
  return {
    id: `p2-${Math.random().toString(36).slice(2, 10)}` as Message['id'],
    role: 'user',
    content: [{ type: 'text', text }],
    source: { kind: 'plugin', plugin: '@deepseek-ai/dsh-track' },
  }
}

/** System message from text. */
export function systemMessage(text: string): Message {
  return {
    id: `p2s-${Math.random().toString(36).slice(2, 10)}` as Message['id'],
    role: 'system',
    content: [{ type: 'text', text }],
    source: { kind: 'plugin', plugin: '@deepseek-ai/dsh-track' },
  }
}

/** Assemble a text-only completion from a stream. */
export async function assembleText(llm: LlmLike, options: GenerateOptions): Promise<string | undefined> {
  try {
    const assembler = new BlockAssembler()
    for await (const chunk of llm.stream(options)) {
      assembler.push(chunk)
    }
    const blocks = assembler.blocks()
    if (blocks.some((b) => b.type === 'tool-call')) return undefined
    const text = blocks
      .filter((b): b is Extract<typeof blocks[number], { type: 'text' }> => b.type === 'text')
      .map((b) => b.text)
      .join(' ')
      .trim()
    return text || undefined
  } catch {
    return undefined
  }
}

/**
 * Request one JSON object from the model.
 *
 * The system prompt instructs "output ONLY a JSON object, no markdown fence";
 * we also strip a surrounding ```json fence if the model adds one. Structural
 * check: result is an object and every key in `requiredKeys` is present (extra
 * keys allowed). No schema library — keep the dependency surface zero.
 */
export async function llmJson(
  llm: LlmLike,
  opts: {
    provider: string
    model: string
    system: string
    prompt: string
    requiredKeys: string[]
    maxTokens?: number
    temperature?: number
    signal?: AbortSignal
    purpose?: string
  },
): Promise<Record<string, unknown> | undefined> {
  const text = await assembleText(llm, {
    provider: opts.provider,
    model: opts.model,
    system: opts.system,
    messages: [userMessage(opts.prompt)],
    maxTokens: opts.maxTokens ?? 800,
    temperature: opts.temperature ?? 0.2,
    signal: opts.signal,
    purpose: opts.purpose as GenerateOptions['purpose'],
  })
  if (!text) return undefined
  let body = text.trim()
  const fence = body.match(/^```(?:json)?\s*([\s\S]*?)```$/i)
  if (fence) body = fence[1]!.trim()
  try {
    const parsed = JSON.parse(body)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined
    for (const key of opts.requiredKeys) {
      if (!(key in parsed)) return undefined
    }
    return parsed as Record<string, unknown>
  } catch {
    return undefined
  }
}
