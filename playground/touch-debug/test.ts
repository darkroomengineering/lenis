import { LoremIpsum } from 'lorem-ipsum'

// No Lenis here — we only want to observe whether dragging a native selection
// handle dispatches touch events to the page.

// Fill the page so there's something to scroll and to select.
document.querySelector('#content')!.innerHTML =
  new LoremIpsum().generateParagraphs(30)

// --- touch HUD ---------------------------------------------------------------
const hud = document.querySelector<HTMLElement>('#hud')!
const flash = document.querySelector<HTMLElement>('#flash')!
const dot = document.querySelector<HTMLElement>('#dot')!
const counts = { touchstart: 0, touchmove: 0, touchend: 0 }
const log: string[] = []

function render(type: string, t?: Touch) {
  const sel = window.getSelection()
  const selText = sel && !sel.isCollapsed ? sel.toString().slice(0, 30) : '—'
  log.unshift(
    `${type.padEnd(10)} x=${t ? Math.round(t.clientX) : '-'} y=${t ? Math.round(t.clientY) : '-'}`
  )
  log.length = 12
  hud.textContent =
    `start:${counts.touchstart}  move:${counts.touchmove}  end:${counts.touchend}\n` +
    `selection: ${selText}\n` +
    `userAgent: ${navigator.userAgent.slice(0, 60)}\n\n` +
    log.join('\n')
}

function onTouch(e: TouchEvent) {
  counts[e.type as keyof typeof counts]++
  const t = e.touches[0] ?? e.changedTouches[0]
  if (e.type === 'touchmove') {
    flash.style.opacity = '0.35'
    setTimeout(() => (flash.style.opacity = '0'), 50)
  }
  if (t) {
    dot.style.opacity = e.type === 'touchend' ? '0' : '1'
    dot.style.transform = `translate(${t.clientX}px, ${t.clientY}px)`
  }
  render(e.type, t)
}

// passive so we observe without interfering with native selection/scroll
for (const type of ['touchstart', 'touchmove', 'touchend'] as const) {
  document.addEventListener(type, onTouch, { passive: true })
}
