// import { LoremIpsum } from 'lorem-ipsum'
import Lenis from 'lenis'
import Snap from 'lenis/snap'

// import Snap from '../src/index.ts'

// document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
//   200
// )

const lenis = new Lenis({
  // wrapper: document.querySelector('#wrapper'),
  // content: document.querySelector('#content'),
  wheel: { lerp: 0.1 },
  touch: { smooth: true },
  drag: { enabled: true },
})

const _i = 0

const snap = new Snap(lenis, {
  // lock: true,
  // velocityThreshold: 1.2,
  duration: 1,
  // Directional gates by `|snap - currentScroll| ≤ distanceThreshold`. The
  // sections in this playground are 50–250vh, so adjacent snaps can sit
  // 2+ viewports apart — `Infinity` disables the gate so any flick
  // reaches the next snap. Lower to e.g. `'100%'` to see the gate clip
  // far jumps.
  distanceThreshold: Number.POSITIVE_INFINITY,
  mode: 'directional',
  debounce: 500,
  // duration: 2,
  // easing: (t) => t,
  // onSnapStart: (snap) => {
  //   console.log('onSnapStart', snap)
  // },
  // onSnapComplete: (snap) => {
  //   console.log('onSnapComplete', snap)
  // },
})
declare global {
  interface Window {
    snap: Snap
  }
}

window.snap = snap

const _section1 = document.querySelector<HTMLDivElement>('.section-1')!
const section2 = document.querySelector<HTMLDivElement>('.section-2')!
const section3 = document.querySelector<HTMLDivElement>('.section-3')!
const section4 = document.querySelector<HTMLDivElement>('.section-4')!
const section5 = document.querySelector<HTMLDivElement>('.section-5')!
const section6 = document.querySelector<HTMLDivElement>('.section-6')!

// snap.add(0, {
//   index: 0,
// })

// snap.add(643, {
//   index: 1,
// })

// snap.addElement(section1, {
//   align: ['start', 'end'],
// })

const _unsub1 = snap.addElement(section2, {
  align: 'center',
})

// console.log('unsub1', unsub1)
// unsub1()

snap.addElement(section3, {
  align: ['start', 'end'],
})

// snap.addElement(section4, {
//   align: ['center'],
// })

// snap.addElement(section5, {
//   align: ['center'],
// })

const _unsubs = snap.addElements([section4, section5], {
  align: ['center'],
})

// console.log('unsubs', unsubs)
// unsubs()

// snap.addElement(section6, {
//   align: ['end'],
// })

// snap.addElement(section4, {
//   align: ['start', 'end'], // 'start', 'center', 'end'
// })

// Lenis defaults to `autoRaf: true` and runs its own RAF loop, so no manual
// `requestAnimationFrame(raf)` is needed here. Pass `autoRaf: false` to the
// Lenis constructor and re-add a manual loop if you want to drive ticks
// from an external clock (e.g. Tempus).

// ─── CSS interop gauntlet ───────────────────────────────────────────────
// style.css sets scroll-padding on <html> and scroll-margin on section-2/3.
// Recompute each expected snap Y straight from the CSS scroll snap formula
// (margin-outset area aligned against the padding-inset snapport) using
// independent primitives (getBoundingClientRect), then diff against what
// Snap computed. Logs ✓/✗ on load and on resize.

// y 'none' in vertical mode ⇒ section-6 must contribute no snap at all
const snapCountBeforeNone = internals().length
snap.addElement(section6, { align: ['center', 'none'] })

function internals() {
  return (snap as unknown as { computeSnaps(): { y?: number }[] })
    .computeSnaps()
    .map((s) => s.y!)
}

function px(value: string, base: number) {
  return value.endsWith('%')
    ? (Number.parseFloat(value) / 100) * base
    : Number.parseFloat(value) || 0
}

function expectedY(element: HTMLElement, align: 'center' | 'end') {
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
  return align === 'center'
    ? (areaStart + areaEnd) / 2 - (portStart + portEnd) / 2
    : areaEnd - portEnd
}

function verifyCSSInterop() {
  const ys = internals()
  const cases: [string, number][] = [
    ['section-2 center (scroll-margin-top)', expectedY(section2, 'center')],
    ['section-3 end (scroll-margin-bottom)', expectedY(section3, 'end')],
    ['section-4 center (scroll-padding only)', expectedY(section4, 'center')],
    ['section-5 center (scroll-padding only)', expectedY(section5, 'center')],
  ]
  let pass = true
  for (const [name, expected] of cases) {
    // ±1 tolerates Math.ceil rounding in computeSnaps
    if (!ys.some((y) => Math.abs(y - expected) <= 1)) {
      pass = false
      console.error(`✗ ${name}: expected ~${Math.round(expected)}, got`, ys)
    }
  }
  if (ys.length !== snapCountBeforeNone) {
    pass = false
    console.error('✗ align "none": section-6 leaked a snap', ys)
  }
  if (pass)
    console.log(
      `✓ CSS interop: scroll-margin + scroll-padding + align 'none' (${ys.join(', ')})`
    )
}

verifyCSSInterop()
window.addEventListener('resize', () => {
  snap.resize()
  verifyCSSInterop()
})
