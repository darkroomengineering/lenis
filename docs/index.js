import './styles/main.css'
import Lenis from '../src/index.mjs'

const lenis = new Lenis({ lerp: 0.1, smooth: true })
lenis.on('scroll', (e) => {
  console.log(e)
})

function raf() {
  requestAnimationFrame(raf)
  lenis.raf()
}

raf()
