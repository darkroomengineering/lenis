// import { LoremIpsum } from 'lorem-ipsum'
// import Snap from '../../../dist/lenis-snap.mjs'
import Lenis from '../../core/src/index.ts'
import Snap from '../src/index.ts'
import './style.css'

// document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
//   200
// )

if (true) {
  const lenis = new Lenis({
    // lerp: 1,
  })
  window.lenis = lenis

  const snap = new Snap(lenis, {
    type: 'mandatory', // 'mandatory', 'proximity'
  })
  window.snap = snap

  const section2 = document.querySelector('.section-2')
  const section3 = document.querySelector('.section-3')

  snap.add(section2, {
    align: ['start', 'end'], // 'start', 'center', 'end'
  })

  snap.add(section3, {
    align: 'center', // 'start', 'center', 'end'
  })

  function raf(time) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}
