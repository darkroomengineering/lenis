import Lenis from 'lenis'

const lenis = new Lenis({})

lenis.on('scroll', (lenis) => {
  console.log(lenis.isScrolling, lenis.isTouch, lenis.isWheel)
})

window.lenis = lenis
