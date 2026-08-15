import Lenis from 'lenis'
import Snap from 'lenis/snap'

// /snap — general 'closest'-mode playground for lenis/snap.
// (One-flick-per-slide 'directional' mode lives in /slideshow.)
//
// Use cases on show, one per section (explanations live in the page itself):
//  - raw point            snap.add(500) — the dashed marker line
//  - align variants       center (2), end (3), batch center (4+5)
//  - align 'none'         (6) contributes no snap on y
//  - CSS scroll-margin    (2, 3) outsets a snap area, read live each compute
//  - CSS scroll-padding   html — insets the snapport for every element snap
//  - per-element lock     (7) grabs: snaps the instant it's picked, holds until landed
//  - callbacks + goTo/next/previous — HUD (top right)

const lenis = new Lenis({
  
  wheel: { lerp: 0.1 },
  touch: { smooth: true },
  drag: { enabled: true },
  infinite:true,
})

const snap = new Snap(lenis, {
  mode:'directional',
  duration: 1,
  
  // debounce:100,
  onSnapStart: (item) => hudLog('start', item),
  onSnapComplete: (item) => hudLog('complete', item),
})

declare global {
  interface Window {
    snap: Snap
  }
}
window.snap = snap

const $ = (selector: string) =>
  document.querySelector<HTMLElement>(selector)!

// 1 — raw snap point: exact scroll position, no CSS adjustments (marker line);
// per-point onSnap fires when the scroll lands on it (watch the HUD)
snap.add(500, { onSnap: (item) => hudLog('onSnap raw', item) })

// 2 — center align; CSS scroll-margin-top: 48px shifts the snap up 24px;
// per-element onSnap fires on arrival
snap.addElement($('.section-2'), {
  align: 'center',
  onSnap: (item) => hudLog('onSnap §2', item),
})

// 3 — end align on y; CSS scroll-margin-bottom pushes the snap 24px further
snap.addElement($('.section-3'), { align: ['start', 'end'] })

// 4+5 — batch registration, center; only global scroll-padding applies
snap.addElements(
  document.querySelectorAll<HTMLElement>('.section-4, .section-5'),
  { align: ['center'] }
)

// 6 — y 'none': contributes no snap in this vertical setup
snap.addElement($('.section-6'), { align: ['center', 'none'] })

// 7 — per-element lock: grabs — snaps here the instant this section is picked
// in the gesture's direction (no debounce wait), uninterruptible until landed
snap.addElement($('.section-7'), { align: 'start', lock: true })

// ─── HUD ────────────────────────────────────────────────────────────────

// TS-private internals, runtime-accessible — playground introspection only
const internals = snap as unknown as {
  computeSnaps(): { x?: number; y?: number; lock?: boolean }[]
}

const hudState = $('#hud-state')
let lastEvent = '—'

function hudLog(
  phase: string,
  item: { index?: number; y?: number; lock?: boolean }
) {
  lastEvent = `${phase} → #${item.index} @ ${Math.round(item.y ?? 0)}${item.lock ? ' 🔒' : ''}`
  render()
}

function render() {
  hudState.textContent = [
    `targetScroll : ${Math.round(lenis.targetScroll)}`,
    `rawTarget    : ${Math.round(lenis.rawTargetScroll)}`,
    `snap index   : ${snap.currentSnapIndex ?? '—'}`,
    `isScrolling  : ${lenis.isScrolling}`,
    `isLocked     : ${lenis.isLocked}`,
    `last event   : ${lastEvent}`,
  ].join('\n')
}

$('#prev').addEventListener('click', () => snap.previous())
$('#next').addEventListener('click', () => snap.next())
lenis.on('scroll', render)
render()

// ─── CSS interop gauntlet ───────────────────────────────────────────────
// Recompute each expected snap position straight from the CSS scroll snap
// formula (margin-outset area aligned against the padding-inset snapport)
// using independent primitives (getBoundingClientRect + computed styles),
// then diff against Snap's. Logs ✓/✗ on load and on resize.

function px(value: string, base: number) {
  return value.endsWith('%')
    ? (Number.parseFloat(value) / 100) * base
    : Number.parseFloat(value) || 0
}

function expectedY(element: HTMLElement, align: 'start' | 'center' | 'end') {
  const rect = element.getBoundingClientRect()
  const style = getComputedStyle(element)
  const rootStyle = getComputedStyle(document.documentElement)
  const vh = window.innerHeight
  const areaStart =
    rect.top + window.scrollY - Number.parseFloat(style.scrollMarginTop)
  const areaEnd =
    rect.bottom + window.scrollY + Number.parseFloat(style.scrollMarginBottom)
  const portStart = px(rootStyle.scrollPaddingTop, vh)
  const portEnd = vh - px(rootStyle.scrollPaddingBottom, vh)
  if (align === 'start') return areaStart - portStart
  if (align === 'center')
    return (areaStart + areaEnd) / 2 - (portStart + portEnd) / 2
  return areaEnd - portEnd
}

function verifyCSSInterop() {
  const snaps = internals.computeSnaps()
  const ys = snaps.map((s) => s.y!)
  const cases: [string, number][] = [
    ['raw snap.add(500)', 500],
    ['section-2 center (scroll-margin-top)', expectedY($('.section-2'), 'center')],
    ['section-3 end (scroll-margin-bottom)', expectedY($('.section-3'), 'end')],
    ['section-4 center (scroll-padding only)', expectedY($('.section-4'), 'center')],
    ['section-5 center (scroll-padding only)', expectedY($('.section-5'), 'center')],
    ['section-7 start (lock)', expectedY($('.section-7'), 'start')],
  ]
  let pass = true
  for (const [name, expected] of cases) {
    // ±1 tolerates Math.ceil rounding in computeSnaps
    if (!ys.some((y) => Math.abs(y - expected) <= 1)) {
      pass = false
      console.error(`✗ ${name}: expected ~${Math.round(expected)}, got`, ys)
    }
  }
  // section-6 (y 'none') must not contribute — exactly the 6 targets above
  if (snaps.length !== cases.length) {
    pass = false
    console.error(`✗ expected ${cases.length} snaps (align 'none' leaked?), got`, ys)
  }
  // section-7's target must carry its per-element lock
  const lockY = expectedY($('.section-7'), 'start')
  if (!snaps.some((s) => Math.abs((s.y ?? Infinity) - lockY) <= 1 && s.lock === true)) {
    pass = false
    console.error('✗ section-7 snap does not carry lock: true', snaps)
  }
  if (pass)
    console.log(
      `✓ CSS interop: scroll-margin + scroll-padding + align 'none' + lock (${ys.join(', ')})`
    )
}

verifyCSSInterop()
window.addEventListener('resize', () => {
  snap.resize()
  verifyCSSInterop()
})
