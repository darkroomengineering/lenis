import LenisSync from 'lenis/sync'

const outer = document.getElementById('outer')!
const inner = document.getElementById('inner')!

// the panel scrolls natively (it owns the input); sync pins its child and
// mirrors it. The page stays a plain page: wheel past the panel's end
// chains to it.
const lenis = new LenisSync({ scroller: outer })

// exposed for headless tests
Object.assign(window, { lenisSyncNested: lenis })

const readout = document.getElementById('readout')!
lenis.on('scroll', ({ scroll, targetScroll, velocity, limit }) => {
  readout.textContent = `panel scroll ${scroll.toFixed(1)} · target ${targetScroll} · limit ${limit} · velocity ${velocity.toFixed(1)}`
})

// IntersectionObserver fixture, rooted on the pinned wrapper
const io = new IntersectionObserver(
  (entries) => {
    for (const e of entries) {
      e.target.classList.toggle('in-view', e.isIntersecting)
    }
  },
  { root: inner, threshold: 0.5 }
)
for (const s of inner.querySelectorAll('section')) io.observe(s)
