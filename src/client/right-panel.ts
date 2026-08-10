/**
 * Track right-side panel mounting — the lazyfish/side-panel pattern:
 * locate the conversation container, take over its grid as
 * `grid-template-columns: minmax(0,2fr) minmax(0,1fr)` (conversation 2/3 +
 * panel 1/3, draggable), and mount the Track panel at grid-column 2.
 * A floating toggle button (FAB) shows when the panel is closed.
 *
 * This is the right-side sidebar the user asked for — not a full-screen
 * overlay (which the previous implementation wrongly did).
 * @module @deepseek-ai/dsh-track/client/right-panel
 */

import type { Capture, Decision, Issue } from '../types.ts'

/** Stable ids for the injected panel and toggle. */
export const PANEL_ID = 'dsh-track-panel'
export const FAB_ID = 'dsh-track-fab'

const OPEN_KEY = 'dsh.track.open'
const WIDTH_KEY = 'dsh.track.width'

/** ---- data fetching (host HTTP API) ---- */

interface Snapshot {
  captures: Capture[]
  decisions: Decision[]
  issues: Issue[]
}

const EMPTY: Snapshot = { captures: [], decisions: [], issues: [] }

async function fetchSnapshot(): Promise<Snapshot> {
  const [c, d, i] = await Promise.all([
    fetch('/api/track/captures').then((r) => r.json()).catch(() => ({ captures: [] })),
    fetch('/api/track/decisions').then((r) => r.json()).catch(() => ({ decisions: [] })),
    fetch('/api/track/issues').then((r) => r.json()).catch(() => ({ issues: [] })),
  ])
  return {
    captures: c.captures ?? [],
    decisions: d.decisions ?? [],
    issues: i.issues ?? [],
  }
}

/** ---- panel HTML (plain DOM — the lazyfish pattern keeps it React-free) ---- */

function buildPanelHtml(): string {
  return `
  <div class="inv-head">
    <span class="inv-title">Track</span>
    <button class="inv-refresh" title="刷新">⟳</button>
    <button class="inv-close" title="收起">×</button>
  </div>
  <div class="inv-body">
    <div class="inv-section">
      <div class="inv-section-title">捕获想法</div>
      <div class="inv-input-row">
        <input class="inv-input" placeholder="记录一个念头…" />
        <button class="inv-capture" type="button">捕获</button>
      </div>
      <div class="inv-captures"></div>
    </div>
    <div class="inv-section">
      <div class="inv-section-title">待确认决策点 <span class="inv-decision-count"></span></div>
      <div class="inv-decisions"></div>
    </div>
    <div class="inv-section">
      <div class="inv-section-title">任务</div>
      <div class="inv-issues"></div>
    </div>
  </div>
  <div class="inv-width-resizer" title="拖动调整面板宽度"></div>
  `
}

const PANEL_CSS = `
#${FAB_ID} {
  position: fixed;
  right: 14px;
  bottom: 110px;
  z-index: 10000;
  width: 42px;
  height: 42px;
  border: 0;
  border-radius: 12px;
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  background: var(--dsw-alias-bg-layer-2, #f7f7f8);
  color: var(--dsw-alias-label-primary, #171719);
  box-shadow: 0 4px 14px rgba(0,0,0,.2);
}
#${FAB_ID}[hidden] { display: none; }
.inv-host {
  display: grid !important;
  grid-template-rows: auto minmax(0, 1fr) !important;
}
.inv-host-header {
  grid-column: 1 / -1 !important;
  grid-row: 1 !important;
}
.inv-host-scroll {
  grid-column: 1 !important;
  grid-row: 2 !important;
  min-width: 0 !important;
  overflow-y: auto;
}
#${PANEL_ID} {
  position: relative;
  z-index: 1;
  grid-column: 2 !important;
  grid-row: 2 !important;
  min-width: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--dsw-alias-bg-base, #fff);
  color: var(--dsw-alias-label-primary, #171719);
  border-left: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.1));
  font: 13px/1.5 ui-sans-serif, system-ui, sans-serif;
}
#${PANEL_ID}[hidden] { display: none; }
#${PANEL_ID} .inv-head {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  height: 36px;
  border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.06));
  flex: none;
}
#${PANEL_ID} .inv-title { flex: 1; font-weight: 600; }
#${PANEL_ID} .inv-refresh, #${PANEL_ID} .inv-close {
  width: 24px; height: 24px; border: 0; border-radius: 6px;
  background: transparent; color: var(--dsw-alias-label-secondary, #555);
  font-size: 14px; cursor: pointer;
}
#${PANEL_ID} .inv-body {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
#${PANEL_ID} .inv-section { display: flex; flex-direction: column; gap: 6px; }
#${PANEL_ID} .inv-section-title {
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  opacity: .65;
}
#${PANEL_ID} .inv-input-row { display: flex; gap: 6px; }
#${PANEL_ID} .inv-input {
  flex: 1; padding: 5px 8px; border: 1px solid var(--dsw-alias-border-l2, rgba(0,0,0,.15));
  border-radius: 6px; background: transparent; color: inherit; font-size: 13px;
}
#${PANEL_ID} .inv-capture {
  padding: 5px 10px; border: 0; border-radius: 6px;
  background: #4c8dff; color: #fff; font-size: 13px; cursor: pointer;
}
#${PANEL_ID} .inv-card {
  padding: 7px 9px; border: 1px solid var(--dsw-alias-border-l1, rgba(0,0,0,.12));
  border-radius: 6px; font-size: 12.5px;
}
#${PANEL_ID} .inv-meta { font-size: 11px; opacity: .6; margin-top: 3px; }
#${PANEL_ID} .inv-empty { opacity: .5; font-size: 12px; font-style: italic; }
#${PANEL_ID} .inv-width-resizer {
  position: absolute; left: -3px; top: 0; bottom: 0; width: 6px;
  cursor: col-resize; z-index: 2;
}
`

/** ---- mounting ---- */

interface HostRefs {
  candidate: HTMLElement
  header: HTMLElement | null
  scrollBody: HTMLElement | null
  tablist: HTMLElement | null
}

let panel: HTMLElement | null = null
let fab: HTMLButtonElement | null = null
let host: HostRefs | null = null
let prior: {
  display?: string
  gridColumns?: string
  gridRows?: string
  flexDirection?: string
  headerColumn?: string
  headerRow?: string
  scrollColumn?: string
  scrollRow?: string
  scrollFlex?: string
  scrollMinWidth?: string
} = {}
let panelOpen = false
let panelWidthPx: number | null = null

function readStoredNumber(key: string): number | null {
  try {
    const v = Number(localStorage.getItem(key))
    return Number.isFinite(v) && v > 0 ? v : null
  } catch { return null }
}

function readOpenState(): boolean {
  try { return localStorage.getItem(OPEN_KEY) === '1' } catch { return false }
}

function syncGrid(): void {
  if (host === null || !panelOpen) return
  host.candidate.style.gridTemplateColumns = panelWidthPx !== null
    ? `minmax(0, 1fr) ${panelWidthPx}px`
    : 'minmax(0, 2fr) minmax(0, 1fr)'
}

function render(snapshot: Snapshot): void {
  if (panel === null) return
  const q = (sel: string): HTMLElement | null => panel!.querySelector(sel)
  const openCaptures = snapshot.captures.filter((c) => c.status === 'open')
  const pendingDecisions = snapshot.decisions.filter((d) => d.status === 'pending')

  const capEl = q('.inv-captures')
  if (capEl !== null) {
    capEl.innerHTML = openCaptures.length === 0
      ? '<div class="inv-empty">暂无捕获</div>'
      : openCaptures.slice(0, 8).map((c) =>
        `<div class="inv-card">${escapeHtml(c.content)}<div class="inv-meta">${c.tags.map(escapeHtml).join(' · ') || ''}${c.tags.length ? ' · ' : ''}${new Date(c.createdAt).toLocaleString()}</div></div>`).join('')
  }
  const decEl = q('.inv-decisions')
  const decCount = q('.inv-decision-count')
  if (decEl !== null) {
    decEl.innerHTML = pendingDecisions.length === 0
      ? '<div class="inv-empty">暂无待确认决策</div>'
      : pendingDecisions.slice(0, 5).map((d) =>
        `<div class="inv-card">${escapeHtml(d.question)}<div class="inv-meta">我的倾向：${escapeHtml(d.aiPreference)}</div></div>`).join('')
  }
  if (decCount !== null) decCount.textContent = pendingDecisions.length > 0 ? `(${pendingDecisions.length})` : ''
  const issEl = q('.inv-issues')
  if (issEl !== null) {
    issEl.innerHTML = snapshot.issues.length === 0
      ? '<div class="inv-empty">暂无任务</div>'
      : snapshot.issues.slice(0, 5).map((i) =>
        `<div class="inv-card">${escapeHtml(i.identifier)} [${i.state}] ${escapeHtml(i.title)}</div>`).join('')
  }
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)
}

function refresh(): void {
  void fetchSnapshot().then(render)
}

function restoreLayout(): void {
  trackTab?.remove()
  trackTab = null
  if (host === null) return
  host.candidate.classList.remove('inv-host')
  if (host.header !== null) host.header.classList.remove('inv-host-header')
  if (host.scrollBody !== null) host.scrollBody.classList.remove('inv-host-scroll')
  if (prior.display !== undefined) host.candidate.style.display = prior.display
  if (prior.gridColumns !== undefined) host.candidate.style.gridTemplateColumns = prior.gridColumns
  if (prior.gridRows !== undefined) host.candidate.style.gridTemplateRows = prior.gridRows
}

function setPanelOpen(open: boolean): void {
  panelOpen = open
  if (panel !== null) panel.hidden = !open
  if (fab !== null) fab.hidden = open
  if (trackTab !== null) trackTab.setAttribute('aria-selected', String(!open))
  try { localStorage.setItem(OPEN_KEY, open ? '1' : '0') } catch { /* ignore */ }
  if (open) syncGrid()
  else if (host !== null) restoreLayout()
}

function attach(candidate: HTMLElement, header: HTMLElement | null): void {
  if (host?.candidate === candidate) return
  restoreLayout()
  host = { candidate, header, scrollBody: candidate.querySelector<HTMLElement>('[data-conversation-scroll]'), tablist: candidate.querySelector<HTMLElement>('[role="tablist"]') ?? null }
  prior = {
    display: candidate.style.display,
    gridColumns: candidate.style.gridTemplateColumns,
    gridRows: candidate.style.gridTemplateRows,
    flexDirection: candidate.style.flexDirection,
    headerColumn: header?.style.gridColumn,
    headerRow: header?.style.gridRow,
    scrollColumn: host.scrollBody?.style.gridColumn,
    scrollRow: host.scrollBody?.style.gridRow,
    scrollFlex: host.scrollBody?.style.flex,
    scrollMinWidth: host.scrollBody?.style.minWidth,
  }
  // Grid takeover: mark the conversation root with a class; the injected
  // stylesheet forces the grid with !important so React re-renders cannot
  // reset the inline display (verified: React clears inline display but the
  // columns survive — class-based !important wins over both).
  candidate.classList.add('inv-host')
  candidate.style.gridTemplateColumns = 'minmax(0, 2fr) minmax(0, 1fr)'
  if (header !== null) header.classList.add('inv-host-header')
  if (host.scrollBody !== null) host.scrollBody.classList.add('inv-host-scroll')
  if (panel !== null) {
    if (panel.isConnected) panel.remove()
    candidate.append(panel)
  }
  // side-panel pattern: append an "Track" tab to the session tab strip so
  // the panel has a native tab entry (like Trajectory / goal tabs).
  mountTab()
  syncGrid()
}

let trackTab: HTMLButtonElement | null = null

/** Append an Track tab to the conversation tab strip (side-panel pattern). */
function mountTab(): void {
  const tl = host?.tablist
  if (tl === null || tl === undefined) return
  if (tl.querySelector('.inv-tab') !== null) return
  const reference = tl.querySelector<HTMLButtonElement>(':scope > button[role="tab"][aria-selected="false"]')
    ?? tl.querySelector<HTMLButtonElement>(':scope > button[role="tab"]')
  if (reference === null) return
  const tab = document.createElement('button')
  tab.type = 'button'
  tab.role = 'tab'
  tab.className = `${reference.className} inv-tab`
  const label = document.createElement('span')
  label.textContent = 'Track'
  tab.append(label)
  tab.setAttribute('aria-selected', String(!panelOpen))
  tab.addEventListener('click', () => { setPanelOpen(!panelOpen) })
  tl.append(tab)
  trackTab = tab
}

function locateHost(): HostRefs | null {
  // side-panel pattern: find the session tab strip (contains the Trajectory
  // tab), climb to its header, take over the header's parent (the
  // conversation root). This is the container side-panel/lazyfish grid-
  // take over successfully.
  const tablists = document.querySelectorAll<HTMLElement>('[role="tablist"]')
  for (const tl of tablists) {
    const hasSessionTab = [...tl.querySelectorAll<HTMLElement>(':scope > button[role="tab"]')]
      .some((tab) => tab.textContent?.trim() === 'Trajectory')
    if (!hasSessionTab) continue
    const header = tl.closest('header')
    if (header instanceof HTMLElement && header.parentElement instanceof HTMLElement) {
      return {
        candidate: header.parentElement,
        header,
        scrollBody: header.parentElement.querySelector<HTMLElement>('[data-conversation-scroll]'),
        tablist: tl,
      }
    }
  }
  // Fallback: any tablist header's parent (multi-tab sessions).
  for (const tl of tablists) {
    const header = tl.closest('header')
    if (header instanceof HTMLElement && header.parentElement instanceof HTMLElement) {
      return { candidate: header.parentElement, header, scrollBody: header.parentElement.querySelector<HTMLElement>('[data-conversation-scroll]'), tablist: tl }
    }
  }
  // Fallback: the scroll body's parent (single-tab sessions have no tablist).
  const scroll = document.querySelector<HTMLElement>('[data-conversation-scroll]')
  if (scroll instanceof HTMLElement && scroll.parentElement instanceof HTMLElement) {
    const root = scroll.parentElement
    const header = root.querySelector<HTMLElement>('header')
    return { candidate: root, header, scrollBody: scroll, tablist: root.querySelector<HTMLElement>('[role="tablist"]') }
  }
  return null
}

function tryMount(): void {
  if (host !== null && host.candidate.isConnected) {
    // Self-heal: React re-renders reset inline styles; re-apply the takeover
    // classes and grid columns on every DOM change (lazyfish attach pattern).
    if (panel !== null && panel.parentElement !== host.candidate) host.candidate.append(panel)
    host.candidate.classList.add('inv-host')
    if (host.header !== null) host.header.classList.add('inv-host-header')
    if (host.scrollBody !== null) host.scrollBody.classList.add('inv-host-scroll')
    syncGrid()
    return
  }
  restoreLayout()
  host = null
  const h = locateHost()
  if (h !== null) {
    attach(h.candidate, h.header)
    setPanelOpen(readOpenState())
  }
}

/** Build the panel DOM, FAB, and wire events. Returns a disposer. */
export function mountRightPanel(): () => void {
  // ---- style ----
  const style = document.createElement('style')
  style.textContent = PANEL_CSS
  document.head.appendChild(style)

  // ---- panel ----
  panel = document.createElement('aside')
  panel.id = PANEL_ID
  panel.hidden = true
  panel.innerHTML = buildPanelHtml()

  // ---- fab ----
  fab = document.createElement('button')
  fab.id = FAB_ID
  fab.type = 'button'
  fab.title = 'Track'
  fab.textContent = '◆'
  fab.hidden = false
  document.body.appendChild(fab)

  // ---- panel events ----
  panel.querySelector('.inv-close')?.addEventListener('click', () => setPanelOpen(false))
  panel.querySelector('.inv-refresh')?.addEventListener('click', refresh)
  const captureBtn = panel.querySelector<HTMLElement>('.inv-capture')
  const inputEl = panel.querySelector<HTMLInputElement>('.inv-input')
  const doCapture = (): void => {
    const content = inputEl?.value.trim()
    if (!content) return
    void fetch('/api/track/captures', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content, tags: [] }),
    }).then(() => { if (inputEl) inputEl.value = ''; refresh() })
  }
  captureBtn?.addEventListener('click', doCapture)
  inputEl?.addEventListener('keydown', (e) => { if (e.key === 'Enter') doCapture() })

  // ---- width resizer ----
  const resizer = panel.querySelector<HTMLElement>('.inv-width-resizer')
  let dragStartX = 0
  let dragStartWidth = 0
  const widthMove = (e: PointerEvent): void => {
    const w = dragStartWidth + dragStartX - e.clientX
    if (w < 220) return
    panelWidthPx = w
    syncGrid()
  }
  const widthUp = (): void => {
    window.removeEventListener('pointermove', widthMove)
    window.removeEventListener('pointerup', widthUp)
    if (panelWidthPx !== null) {
      try { localStorage.setItem(WIDTH_KEY, String(panelWidthPx)) } catch { /* ignore */ }
    }
  }
  resizer?.addEventListener('pointerdown', (e: PointerEvent) => {
    e.preventDefault()
    dragStartX = e.clientX
    dragStartWidth = panelWidthPx ?? 360
    window.addEventListener('pointermove', widthMove)
    window.addEventListener('pointerup', widthUp)
  })

  // ---- fab toggle ----
  fab.addEventListener('click', () => { setPanelOpen(!panelOpen) })

  // ---- self-healing mount ----
  panelWidthPx = readStoredNumber(WIDTH_KEY)
  const observer = new MutationObserver(tryMount)
  observer.observe(document.body, { childList: true, subtree: true })
  tryMount()
  refresh()

  return () => {
    observer.disconnect()
    restoreLayout()
    panel?.remove()
    fab?.remove()
    style.remove()
    panel = null
    fab = null
    host = null
  }
}
