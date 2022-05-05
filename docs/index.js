import Lenis from '../src'

const lenis = new Lenis()

function raf() {
  requestAnimationFrame(raf)
  lenis.raf()
}

raf()
