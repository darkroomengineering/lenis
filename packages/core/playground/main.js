import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../dist/lenis.mjs'
import './style.css'

document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
  200
)

const lenis = new Lenis()
window.lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
