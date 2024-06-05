// import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../../core/src/index.ts'
import Snap from '../dist/lenis-snap.mjs'
// import Snap from '../src/index.ts'
import './style.css'

// document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
//   200
// )

if (true) {
  const lenis = new Lenis({
    lerp: 0.1,
  })
  window.lenis = lenis

  const i = 0

  const snap = new Snap(lenis, {
    type: 'mandatory', // 'mandatory', 'proximity'
    velocityThreshold: 1,
    // duration: 2,
    // easing: (t) => t,
    onSnapStart: (snap) => {
      console.log('onSnapStart', snap)
    },
    onSnapComplete: (snap) => {
      console.log('onSnapComplete', snap)
    },
  })
  window.snap = snap

  const section2 = document.querySelector('.section-2')
  const section3 = document.querySelector('.section-3')

  // snap.add(500)

  snap.addElement(section2, {
    align: ['start', 'end'], // 'start', 'center', 'end'
  })

  snap.addElement(section3, {
    align: 'center', // 'start', 'center', 'end'
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}
