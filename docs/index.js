// import Lenis from '../dist/lenis.modern'
import Lenis from '../src/lenis'
import './styles/main.css'
import Stats from 'stats.js'

const lenis = new Lenis({ lerp: 0.1, smooth: true, direction: 'vertical' })
window.lenis = lenis

lenis.on('scroll', ({ scroll, limit }) => {
  console.log({ scroll, limit })
})

const stats = new Stats()
stats.showPanel(0) // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom)

function raf() {
  stats.begin()

  requestAnimationFrame(raf)
  lenis.raf()

  stats.end()
}

raf()

const button = document.querySelector('a[href="#top"]')
button.addEventListener(
  'click',
  (e) => {
    // e.preventDefault()
    lenis.scrollTo('#top')
  },
  false
)
