/**
 * Track strip injected face: the props the dock owner supplies to the
 * strip component. Phase 0b carries counts through the host RPC; the shape is
 * stable so the next step only fills the numbers.
 * @module @deepseek-ai/dsh-track/client/strip
 */

/** Track strip props: pending decision and capture counts. */
export interface TrackStripProps {
  /** Pending (unanswered) decision points across sessions. */
  decisions: number
  /** Open captures in the capture wall. */
  captures: number
}
