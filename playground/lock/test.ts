import Lenis from 'lenis'

const lenis = new Lenis()
window.lenis = lenis

const status = document.querySelector('#status') as HTMLElement
const lockButton = document.querySelector('#lock') as HTMLButtonElement
const scrollButton = document.querySelector('#scrollto') as HTMLButtonElement

// Manual instance lock — must survive middle-click / navigation resets
lockButton.addEventListener('click', () => {
  if (lenis.isLocked) {
    lenis.unlock()
  } else {
    lenis.lock()
  }
})

// Operation-scoped lock — released on complete, but also when the scroll is
// interrupted (middle-click paste/autoscroll triggers `reset`)
scrollButton.addEventListener('click', () => {
  const target = lenis.scroll < lenis.maxScroll / 2 ? 'bottom' : 'top'
  lenis.scrollTo(target, { lock: true, duration: 5 })
})

function raf() {
  status.textContent = `isLocked: ${lenis.isLocked}\nisScrolling: ${lenis.isScrolling}`
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)
