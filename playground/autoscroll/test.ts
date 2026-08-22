import Lenis from 'lenis'

const lenis = new Lenis({
  infinite: true,
})

lenis.on('scroll', (lenis) => {
  console.log(lenis.scroll, lenis.targetScroll)
})

let time = performance.now()

function raf() {
  requestAnimationFrame(raf)

  const now = performance.now()
  const deltaTime = now - time
  time = performance.now()

  if (lenis.isScrolling !== 'smooth') {
    lenis.scrollTo(lenis.scroll + deltaTime * 0.1, {
      immediate: true,
    })
  }
}

requestAnimationFrame(raf)
