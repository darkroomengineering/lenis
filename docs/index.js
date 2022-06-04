// import Lenis from '../dist/lenis.modern'
import Lenis from '../src/lenis'
import './styles/main.css'

const lenis = new Lenis({ lerp: 0.1, smooth: true })
window.lenis = lenis

lenis.on('scroll', ({ scroll }) => {
  console.log({ scroll })
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
