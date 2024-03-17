import Lenis from '../dist/lenis.mjs'
import { setupCounter } from './counter.js'
// import './jank.js'
import './style.css'

const lenis = new Lenis({
  smoothWheel: true,
  syncTouch: true,
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
