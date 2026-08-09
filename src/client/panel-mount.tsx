/**
 * Involute panel mounting: appends a container inside the center column's
 * grid item and renders the InvolutePanel React tree. Toggling is a data
 * attribute on <html> — no React involvement, so the conversation subtree
 * underneath stays mounted and stateful (task-board precedent).
 * @module @deepseek-ai/dsh-involute/client/panel-mount
 */

import { createRoot, type Root } from 'react-dom/client'
import { InvolutePanel } from './panel/InvolutePanel.tsx'

/** The injected panel container. */
export const PANEL_SELECTOR = '[data-dsh-involute-panel]'

const ACTIVE_ATTR = 'data-dsh-involute-active'

/**
 * The center column is the frame's second child (CenterColumn renders the
 * conversation slot; CSS-module-hashed class — locate structurally).
 */
function conversationColumn(): HTMLElement | undefined {
  const frame = document.querySelector<HTMLElement>('[data-details-collapsed]')
  return frame?.children[1] as HTMLElement | undefined
}

export interface PanelController {
  isOpen(): boolean
  toggle(): void
  dispose(): void
}

/**
 * Mount the panel React tree into the center column; returns a controller
 * that toggles visibility and a disposer that tears everything down.
 */
export function mountPanel(): { controller: PanelController; disposer: () => void } {
  let root: Root | undefined
  let container: HTMLDivElement | undefined
  let open = false

  const ensure = (): void => {
    if (container !== undefined) return
    const column = conversationColumn()
    if (column === undefined) return
    container = document.createElement('div')
    container.dataset.dshInvolutePanel = ''
    container.style.cssText = 'position:absolute;inset:0;z-index:40;display:none;background:var(--dsw-specific-bg-base, #1a1a1a)'
    column.style.position = column.style.position || 'relative'
    column.appendChild(container)
    root = createRoot(container)
    root.render(<InvolutePanel />)
  }

  // The frame mounts after boot settlement; watch for the column's arrival.
  const waitObserver = new MutationObserver(() => { ensure() })
  waitObserver.observe(document.body, { childList: true, subtree: true })

  const applyActive = (): void => {
    if (container === undefined) return
    container.style.display = open ? '' : 'none'
    if (open) document.documentElement.setAttribute(ACTIVE_ATTR, '')
    else document.documentElement.removeAttribute(ACTIVE_ATTR)
  }

  const controller: PanelController = {
    isOpen: () => open,
    toggle: () => { open = !open; applyActive() },
    dispose: () => {
      waitObserver.disconnect()
      document.documentElement.removeAttribute(ACTIVE_ATTR)
      root?.unmount()
      container?.remove()
      root = undefined
      container = undefined
    },
  }

  ensure()
  applyActive()
  return { controller, disposer: () => controller.dispose() }
}
