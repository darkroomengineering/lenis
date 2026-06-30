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
  lerp: 0.1,
  syncTouch: true,
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
const _section6 = document.querySelector<HTMLDivElement>('.section-6')!

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
