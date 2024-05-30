import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../src/index.ts'
import './style.css'

document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
  200
)

const lenis = new Lenis({
  prevent: (node) => {
    console.log(node)
    return false
  },
})
lenis.on('scroll', (e) => {
  // console.log(e.userData, e.velocity, e.isScrolling)
})
window.lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
