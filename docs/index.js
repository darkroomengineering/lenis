import './styles/main.css'
import Lenis from '../src/index.mjs'

const lenis = new Lenis({ lerp: 0.1, smooth: true })
window.lenis = lenis
lenis.on('scroll', (e) => {
  console.log(e)
})

function raf() {
  requestAnimationFrame(raf)
  lenis.raf()
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
