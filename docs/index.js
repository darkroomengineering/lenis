// import Lenis from '../dist/lenis.modern'
import Stats from 'stats.js'
import Lenis from '../src/lenis'
import './styles/main.css'

const lenis = new Lenis({ lerp: 0.1, smooth: true, direction: 'vertical' })
window.lenis = lenis

lenis.on('scroll', ({ scroll, limit, velocity }) => {
  console.log({ scroll, limit, velocity })
})

const stats = new Stats()
stats.showPanel(0)
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
    lenis.scrollTo('#top')
  },
  false
)
