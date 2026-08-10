/**
 * P2 — session-internal topic segmentation (v2-design §3.4).
 *
 * Splits a session's user-request sequence into EvidenceSpans so a
 * multi-topic session yields multiple issue candidates instead of one blob.
 * Hard boundaries are deterministic signals (interrupted turn, todo-list
 * reset, long idle, explicit topic markers); ambiguous boundaries are left for
 * an optional LLM judge. Rule-only output is the downgrade path when no LLM is
 * available.
 * @module @deepseek-ai/dsh-track/sync/segment
 */

import type { RawEvent } from './raw-event.ts'

/** One evidence span: a contiguous run of the session that is one candidate task. */
export interface EvidenceSpan {
  id: string
  sessionId: string
  seqStart: number
  seqEnd: number
  /** First user-request text of the span (fallback title material). */
  leadRequest: string
  /** User requests inside the span, in order. */
  requests: string[]
  /** Deterministic boundary signals that opened this span. */
  openedBy: string[]
  /** Interrupted turns inside the span (topic-shift evidence). */
  interruptedCount: number
  /** todo/write resets inside the span. */
  todoResetCount: number
  /** Idle gap (ms) between the previous span end and this span start. */
  idleBeforeMs: number
}

/** Topic-shift phrases that mark a new task (deterministic heuristics). */
const TOPIC_MARKERS = [
  '另一个', '另外一个', '另外', '回到之前', '之前那个', '回到我们', '还有个', '顺便',
  '先不', '先别', '先不要', '下一个', '第二', '第三', '还有',
  '接下来', '下一步', '换个', '重新',
]

/** Idle threshold: a gap longer than this (ms) suggests a topic boundary. */
export const IDLE_BOUNDARY_MS = 15 * 60 * 1000

/** todo list "reset" heuristic: previous snapshot non-empty, next snapshot empty. */
export function isTodoReset(prevCount: number, nextCount: number): boolean {
  return prevCount > 0 && nextCount === 0
}

/** Hard boundary signals at a user request. */
export interface BoundarySignals {
  interrupted: boolean
  todoReset: boolean
  idle: boolean
  topicMarker: boolean
}

/**
 * Rule-based segmentation over raw events.
 *
 * Walks the raw event log, tracks the current span, and opens a new span at a
 * user request when a HARD signal fires: interrupted turn, long idle, or
 * explicit topic marker. todo-list resets are too noisy in real logs (agents
 * clear the list frequently) — they are recorded as an auxiliary `openedBy`
 * note but never trigger a split by themselves. Tool/assistant/lifecycle
 * events are attributed to the current span (extending seqEnd).
 */
export function segmentByRules(sessionId: string, events: readonly RawEvent[]): EvidenceSpan[] {
  const spans: EvidenceSpan[] = []
  let current: EvidenceSpan | undefined
  let interruptedBefore = false
  let todosBefore = 0
  let lastUserTime: number | undefined

  const openSpan = (seq: number, time: number, text: string, openedBy: string[], idleBeforeMs: number) => {
    current = {
      id: `span_${sessionId}_${seq}`,
      sessionId,
      seqStart: seq,
      seqEnd: seq,
      leadRequest: text,
      requests: [text],
      openedBy,
      interruptedCount: 0,
      todoResetCount: 0,
      idleBeforeMs,
    }
    spans.push(current)
  }

  for (const e of events) {
    if (e.eventType === 'user/message' && e.authority === 'user-request') {
      const reqText = e.userText ?? ''
      const idleBeforeMs = lastUserTime !== undefined ? e.occurredAt - lastUserTime : 0
      const interrupted = interruptedBefore
      const todoReset = isTodoReset(todosBefore, 0)
      const idle = idleBeforeMs > IDLE_BOUNDARY_MS
      const topicMarker = TOPIC_MARKERS.some((m) => reqText.includes(m))

      // Hard signals that trigger a split.
      const splitBy: string[] = []
      if (interrupted) splitBy.push('interrupted-turn')
      if (idle) splitBy.push('long-idle')
      if (topicMarker) splitBy.push('topic-marker')
      // Auxiliary notes (never split alone).
      if (todoReset) splitBy.push('todo-reset')

      if (current === undefined) {
        openSpan(e.seq, e.occurredAt, reqText, splitBy.length ? splitBy : ['session-start'], idleBeforeMs)
      } else if (splitBy.some((s) => s !== 'todo-reset') && current.requests.length > 0) {
        openSpan(e.seq, e.occurredAt, reqText, splitBy, idleBeforeMs)
      } else {
        current.requests.push(reqText)
        current.seqEnd = Math.max(current.seqEnd, e.seq)
        if (todoReset) current.todoResetCount += 1
      }
      if (current!.interruptedCount === 0 && interrupted) current!.interruptedCount += 1
      lastUserTime = e.occurredAt
      interruptedBefore = false
    } else if (e.eventType === 'turn/end' && e.turnEndReason === 'interrupted') {
      interruptedBefore = true
      if (current) current.interruptedCount += 1
    } else if (e.eventType === 'todo/write') {
      const count = e.todoCount ?? 0
      todosBefore = count
    } else {
      if (current) current.seqEnd = Math.max(current.seqEnd, e.seq)
    }
  }

  return spans
}
