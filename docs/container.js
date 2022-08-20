// import Lenis from '../dist/lenis.modern'
import Lenis from '../src/lenis'
import './styles/global.css'
import './styles/container.css'
import Stats from 'stats.js'

const lenis = new Lenis({
  lerp: 0.1,
  smooth: true,
  direction: 'vertical',
  wrapper: document.querySelector('#scroll-wrapper'),
  content: document.querySelector('#scroll-content'),
})
window.lenis = lenis

lenis.on('scroll', (e) => {
  console.log(e)
})

const nestedLenis = new Lenis({
  lerp: 0.1,
  smooth: true,
  direction: 'vertical',
  wrapper: document.querySelector('#nested-scroll-wrapper'),
  content: document.querySelector('#nested-scroll-content'),
})

nestedLenis.on('scroll', (e) => {
  console.log(e)
})

const stats = new Stats()
stats.showPanel(0)
document.body.appendChild(stats.dom)

function raf() {
  stats.begin()

  requestAnimationFrame(raf)
  lenis.raf()
  nestedLenis.raf()

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
