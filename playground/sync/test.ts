import LenisSync from 'lenis/sync'

const lenis = new LenisSync()

// exposed for headless tests
Object.assign(window, { lenisSync: lenis })

const readout = document.getElementById('readout')!
lenis.on('scroll', ({ scroll, targetScroll, velocity }) => {
  readout.textContent = `scroll ${scroll.toFixed(1)} · target ${targetScroll} · velocity ${velocity.toFixed(1)}`
})

// ─── #canvas: a fixed layer above the wrapper, synced to boxes in the content ───
// Same approach as SnapElement: cache each box's rect in content coordinates
// through the offsetParent chain (scroll-independent, no layout read per
// frame), then extrapolate its on-screen position as rect.top - scroll.
// Both pairs get the same numbers; they differ in *when*: lenis.on fires
// inside the raf before paint, the wrapper's scroll event fires in the next
// rendering update (one frame late).
const wrapper = lenis.rootElement

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

lenis.on('scroll', ({ scroll }) => viaLenis.update(scroll))
wrapper.addEventListener('scroll', () => viaDom.update(wrapper.scrollTop))

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
