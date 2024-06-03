import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../src/index.ts'
import './style.css'

document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
  200
)

const lenis = new Lenis({
  // prevent: () => {
  //   return true
  // },
})
lenis.on('scroll', (e) => {
  console.log(e.velocity, e.isScrolling)
})
window.lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
