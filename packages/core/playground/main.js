import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../src/index.ts'
import './style.css'

document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
  200
)

const lenis = new Lenis({
  // duration: 2,
  // easing: (t) => t,
  // prevent: () => {
  //   return true
  // },
})
lenis.on('scroll', (e) => {
  console.log(e.scroll, e.velocity, e.isScrolling, e.userData)
})
window.lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
