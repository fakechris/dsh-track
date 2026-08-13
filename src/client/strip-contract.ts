/**
 * Track strip injected face: the props the dock owner supplies to the
 * strip component. Phase 0b carries counts through the host RPC; the shape is
 * stable so the next step only fills the numbers.
 * @module @fakechris/dsh-track/client/strip
 */

/** Track strip props: open capture count. */
export interface TrackStripProps {
  /** Open captures in the capture wall. */
  captures: number
}
