import { LoremIpsum } from 'lorem-ipsum'
import Lenis from '../src/index.ts'
import './style.css'

document.querySelector('#app').innerHTML = new LoremIpsum().generateParagraphs(
  200
)

const lenis = new Lenis({
  virtualScroll: (e) => {
    // e.deltaY *= 10
    return !e.event.shiftKey
    // return true
  },
  // duration: 2,
  // easing: (t) => t,
  // prevent: () => {
  //   return true
  // },
})
// console.log(lenis.dimensions.height)
lenis.on('scroll', (e) => {
  console.log(e.scroll, e.velocity)
  // console.log(e.scroll, e.velocity, e.isScrolling, e.userData)
})
lenis.on('virtual-scroll', (e) => {
  // console.log(e)
  // e.deltaY *= 10
  // e.cancel = true
})
window.lenis = lenis

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)
