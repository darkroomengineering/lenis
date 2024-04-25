// import { LoremIpsum } from 'lorem-ipsum'
// import Snap from '../../../dist/lenis-snap.mjs'
import Lenis from '../../core/src/index.ts'
import Snap from '../src/index.ts'
import './style.css'

// document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
//   200
// )

const lenis = new Lenis()
window.lenis = lenis

const snap = new Snap(lenis)
window.snap = snap

console.log('snap', snap)

const section2 = document.querySelector('.section-2')

console.log('section2', section2)

snap.add(section2, {
  align: 'end', // 'start', 'center', 'end'
  type: 'mandatory', // 'mandatory', 'proximity'
})

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
