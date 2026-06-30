import Lenis from 'lenis'
import Snap from 'lenis/snap'

const lenis = new Lenis()

// Slideshow feel: every flick advances exactly one full-viewport slide.
// - mode 'directional' → the gesture *direction* picks the next slide (magnitude ignored)
// - lock: true         → ignore input while a snap is animating (no skipping ahead)
// - debounce: 0        → snap the instant the gesture ends, no settle delay
// - distanceThreshold '100%' → slides are viewport-sized, so allow a full-viewport jump
const snap = new Snap(lenis, {
  mode: 'directional',
  lock: true,
  debounce: 0,
  distanceThreshold: '100%',
  duration: 1,
})

const slides = document.querySelectorAll<HTMLElement>('.slide')
snap.addElements(Array.from(slides), { align: 'start' })

// Each element makes one snap target, so the tall 3rd slide (300vh) gets a
// second one at its bottom edge — `'end'` aligns the section's bottom with the
// viewport's bottom.
const section3 = document.querySelector<HTMLElement>('.slide-3')!
snap.addElement(section3, { align: 'end' })

declare global {
  interface Window {
    snap: Snap
  }
}
window.snap = snap
