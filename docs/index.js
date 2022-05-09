import Lenis from '../src/index.mjs'

const lenis = new Lenis({ lerp: 0.1, smooth: true })

function raf() {
  requestAnimationFrame(raf)
  lenis.raf()
}

raf()
