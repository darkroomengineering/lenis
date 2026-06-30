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

// Custom scrollbar: one segment per slide, sized by `flex-grow` = the slide's
// own pixel height, so segment heights mirror section heights (the 300vh 3rd
// slide is 3x a 100vh one). A thumb tracks the viewport over the content.
const bar = document.createElement('div')
bar.className = 'scrollbar'
const track = document.createElement('div')
track.className = 'scrollbar-track'
for (const slide of slides) {
  const segment = document.createElement('div')
  segment.className = 'scrollbar-segment'
  segment.style.flexGrow = String(slide.offsetHeight)
  track.append(segment)
}
const thumb = document.createElement('div')
thumb.className = 'scrollbar-thumb'
bar.append(track, thumb)
document.body.append(bar)

function updateThumb() {
  const trackHeight = track.clientHeight
  const viewport = lenis.dimensions.height || window.innerHeight
  const content = lenis.limit + viewport // total scrollable content height
  const thumbHeight = Math.max(16, (viewport / content) * trackHeight)
  const offset =
    lenis.limit > 0 ? (lenis.scroll / lenis.limit) * (trackHeight - thumbHeight) : 0
  thumb.style.height = `${thumbHeight}px`
  thumb.style.transform = `translateY(${offset}px)`
}
lenis.on('scroll', updateThumb)
updateThumb()

declare global {
  interface Window {
    snap: Snap
  }
}
window.snap = snap
