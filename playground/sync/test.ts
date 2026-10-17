import Lenis from 'lenis'

// `?native` leaves touch to the browser (compositor scroll): the ghosts lag
// behind their boxes on a phone. Default drives touch on the main thread, so
// every same-frame pair below stays glued.
const native = new URLSearchParams(location.search).has('native')

const lenis = new Lenis({ touch: { smooth: !native }, anchors: true })

// exposed for headless tests
Object.assign(window, { lenis })

const mode = document.getElementById('mode') as HTMLAnchorElement
mode.textContent = native ? 'touch: native → smooth' : 'touch: smooth → native'
mode.href = native ? '?' : '?native'

const readout = document.getElementById('readout')!
const progress = document.getElementById('progress')!
lenis.on('scroll', ({ scroll, targetScroll, velocity, progress: p }) => {
  readout.textContent = `scroll ${scroll.toFixed(1)} · target ${targetScroll.toFixed(1)} · velocity ${velocity.toFixed(1)}`
  progress.style.transform = `scaleX(${p})`
})

// ─── #canvas: a fixed layer above the page, synced to boxes in the content ───
// Cache each box's rect in document coordinates through the offsetParent
// chain (scroll-independent, no layout read per frame), then extrapolate its
// on-screen position as rect.top - scroll. All pairs get the same numbers;
// they differ in *when*: lenis.on fires inside the raf right after Lenis
// writes the window, the window's scroll event fires in the next rendering
// update (one frame late), and a raf poll registered after Lenis reads this
// frame's write so it is on time too.
function offsetTop(element: HTMLElement, accumulator = 0): number {
  const top = accumulator + element.offsetTop
  return element.offsetParent
    ? offsetTop(element.offsetParent as HTMLElement, top)
    : top
}

function offsetLeft(element: HTMLElement, accumulator = 0): number {
  const left = accumulator + element.offsetLeft
  return element.offsetParent
    ? offsetLeft(element.offsetParent as HTMLElement, left)
    : left
}

class SyncedGhost {
  rect = { top: 0, left: 0, width: 0, height: 0 }

  constructor(
    readonly box: HTMLElement,
    readonly ghost: HTMLElement
  ) {
    new ResizeObserver(this.measure).observe(box)
    addEventListener('resize', this.measure)
    this.measure()
  }

  measure = () => {
    this.rect = {
      top: offsetTop(this.box),
      left: offsetLeft(this.box),
      width: this.box.offsetWidth,
      height: this.box.offsetHeight,
    }
    this.ghost.style.width = `${this.rect.width}px`
    this.ghost.style.height = `${this.rect.height}px`
    this.update(lenis.scroll)
  }

  /** extrapolate the on-screen position from the cached rect and a scroll value */
  update(scroll: number) {
    this.ghost.style.transform = `translate3d(${this.rect.left}px, ${this.rect.top - scroll}px, 0)`
  }
}

const viaLenis = new SyncedGhost(
  document.getElementById('sync-lenis')!,
  document.getElementById('ghost-lenis')!
)
const viaDom = new SyncedGhost(
  document.getElementById('sync-dom')!,
  document.getElementById('ghost-dom')!
)
const viaRaf = new SyncedGhost(
  document.getElementById('sync-raf')!,
  document.getElementById('ghost-raf')!
)
const viaSticky = new SyncedGhost(
  document.getElementById('sync-sticky')!,
  document.getElementById('ghost-sticky')!
)

lenis.on('scroll', ({ scroll }) => viaLenis.update(scroll))
addEventListener('scroll', () => viaDom.update(scrollY))
// no event at all: read the position every frame. Registered after the
// Lenis raf, so it runs after it in the same frame
;(function poll() {
  viaRaf.update(scrollY)
  requestAnimationFrame(poll)
})()
// the sticky canvas rides a native rubber-band (?native on iOS) with the
// content, so it wants the clamped value; an unclamped one would move it twice
lenis.on('scroll', ({ scroll, maxScroll }) =>
  viaSticky.update(Math.min(Math.max(scroll, 0), maxScroll))
)

// IntersectionObserver fixture
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      e.target.classList.toggle('in-view', e.isIntersecting)
    }
  },
  { threshold: 0.5 }
)
for (const s of document.querySelectorAll('section')) io.observe(s)
