// import Lenis from '../dist/lenis.mjs'
import Lenis from '@studio-freight/lenis-test'
import { setupCounter } from './counter.js'
// import './jank.js'
import './style.css'

console.log('Lenis', Lenis)

const lenis = new Lenis({
  smoothWheel: true,
  // syncTouch: true,
})

window.lenis = lenis

function update(deltaTime) {
  lenis.raf(deltaTime)
  requestAnimationFrame(update)

  // console.log(window.scrollY, Math.floor(lenis.scroll))
  // if (window.scrollY !== Math.floor(lenis.scroll)) {
  //   console.log('unsynced', window.scrollY, lenis.scroll)
  // }

  // console.log(window.scrollY, lenis.scroll)
}

requestAnimationFrame((deltaTime) => {
  update(deltaTime)
})

setupCounter(document.querySelector('#counter'))

setInterval(() => {
  // lenis.stop(); // stopping lenis also does not help
  lenis.scrollTo(lenis.limit * Math.random(), {
    lock: true,
  })
}, 4000)
