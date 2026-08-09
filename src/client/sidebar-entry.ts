/**
 * Sidebar entry injection for the Involute panel.
 *
 * The dsh sidebar shell exposes no slot an external plugin can register into
 * (`sidebar.workspaces` / `sidebar.settings` are single-occupant and already
 * taken), so — following the task-board precedent of DOM-level extension —
 * the entry row is injected between the shell's New Session button and the
 * workspace browser. A MutationObserver self-heals re-renders.
 * @module @deepseek-ai/dsh-involute/client/sidebar-entry
 */

/** Stable data attribute identifying the injected entry row. */
export const ENTRY_SELECTOR = '[data-dsh-involute-entry]'

/**
 * The layout frame carries data-sidebar-collapsed / data-details-collapsed;
 * its first child is the sidebar column (CSS-module-hashed class, so we
 * locate structurally rather than by class — task-board's [data-pane] marker
 * no longer exists in current snapshots).
 */
function frameRoot(): HTMLElement | undefined {
  return document.querySelector<HTMLElement>('[data-details-collapsed]') ?? undefined
}

/** Inline icon (matches the shell's 16px nav-icon look). */
const ICON = `<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 2.5h10v11H3z" rx="1.5"/><path d="M3 6.5h10M6 2.5v4M10 2.5v4"/></svg>`

/** Find the sidebar shell root element, or undefined while not yet mounted. */
function sidebarRoot(): HTMLElement | undefined {
  const frame = frameRoot()
  return frame?.firstElementChild as HTMLElement | undefined
}

/**
 * The New Session button: the shell's first button whose text starts with the
 * new-session label (the sidebar header row nests it inside a DIV). Query the
 * whole shell subtree so layout changes don't break the anchor.
 */
function newSessionButton(root: HTMLElement): HTMLButtonElement | undefined {
  const buttons = Array.from(root.querySelectorAll('button'))
  return buttons.find((b) => b.textContent?.includes('New Session')) ?? buttons[0]
}

/** Build the entry row (a detached button; insert once the shell is up). */
function createEntry(toggle: () => void, pending: number): HTMLButtonElement {
  const entry = document.createElement('button')
  entry.type = 'button'
  entry.dataset.dshInvoluteEntry = ''
  entry.setAttribute('aria-label', 'Involute')
  entry.style.cssText = [
    'display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;',
    'border:none;background:transparent;color:inherit;font-size:13px;cursor:pointer;text-align:left',
  ].join('')
  entry.innerHTML = `<span style="display:inline-flex;flex:none">${ICON}</span><span style="flex:1">Involute</span>`
  const badge = document.createElement('span')
  badge.dataset.dshInvoluteBadge = ''
  badge.style.cssText = [
    'padding:0 6px;border-radius:999px;background:#4c8dff;color:#fff;',
    'font-size:11px;line-height:16px;display:none',
  ].join('')
  badge.textContent = String(pending)
  entry.appendChild(badge)
  entry.addEventListener('click', toggle)
  return entry
}

/** Re-insert the entry after the New Session button (before the browser region). */
function placeEntry(root: HTMLElement, entry: HTMLButtonElement): boolean {
  const button = newSessionButton(root)
  if (button === undefined) return false
  if (entry.parentElement !== root) {
    button.insertAdjacentElement('afterend', entry)
  }
  return true
}

/**
 * Inject the Involute entry row into the sidebar, self-healing across
 * React re-renders. Returns a disposer that removes the row and observer.
 */
export function mountSidebarEntry(toggle: () => void, pending: () => number): () => void {
  let entry: HTMLButtonElement | null = null
  let observer: MutationObserver | null = null

  const sync = (): void => {
    const root = sidebarRoot()
    if (root === undefined || entry === null) return
    placeEntry(root, entry)
    const badge = entry.querySelector<HTMLElement>('[data-dsh-involute-badge]')
    const n = pending()
    if (badge !== null) {
      badge.textContent = String(n)
      badge.style.display = n > 0 ? '' : 'none'
    }
  }

  const ensure = (): void => {
    if (entry !== null) { sync(); return }
    entry = createEntry(toggle, pending())
    const root = sidebarRoot()
    if (root !== undefined) placeEntry(root, entry)
    // Self-heal: re-insert whenever React re-renders the sidebar.
    observer = new MutationObserver(sync)
    observer.observe(document.body, { childList: true, subtree: true })
  }

  ensure()
  const timer = window.setInterval(sync, 2000)
  return () => {
    window.clearInterval(timer)
    observer?.disconnect()
    entry?.remove()
    entry = null
  }
}
