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
window.lenis = lenis

const i = 0

const snap = new Snap(lenis, {
  type: 'lock', // 'mandatory', 'proximity', 'lock'
  // velocityThreshold: 1.2,
  distanceThreshold: '50%',
  debounce: 500,
  // duration: 2,
  // easing: (t) => t,
  onSnapStart: (snap) => {
    console.log('onSnapStart', snap)
  },
  onSnapComplete: (snap) => {
    console.log('onSnapComplete', snap)
  },
})
declare global {
  interface Window {
    snap: Snap
  }
}

window.snap = snap

const section1 = document.querySelector<HTMLDivElement>('.section-1')!
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

snap.addElement(section2, {
  align: 'center',
})

snap.addElement(section3, {
  align: ['start', 'end'],
})

snap.addElement(section4, {
  align: ['center'],
})

snap.addElement(section5, {
  align: ['center'],
})

// snap.addElement(section6, {
//   align: ['end'],
// })

// snap.addElement(section4, {
//   align: ['start', 'end'], // 'start', 'center', 'end'
// })

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
