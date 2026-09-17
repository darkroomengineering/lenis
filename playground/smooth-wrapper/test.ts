// "gsap ScrollSmoother" style scroll sync, no Lenis: the window is the target
// (native input, 1:1), the fixed overflow:hidden wrapper is the smoothed
// position, written with scrollTo every frame.
const wrapper = document.getElementById('smooth-wrapper')!
const content = document.getElementById('smooth-content')!

// body height mirrors the wrapper's scrollable extent, so window max
// scroll == wrapper max scrollTop by construction
new ResizeObserver(() => {
  document.body.style.height = `${wrapper.scrollHeight}px`
}).observe(content)

let target = 0
let scroll = 0
let raf = 0

// no lerp on touch: the wrapper mirrors the window every frame, the feel stays
// native and the sync (one scroll value, velocity, events) stays. Passive
// listeners only tag the input, nothing is intercepted.
let lerp = 0
addEventListener('wheel', () => (lerp = 0.1), { passive: true })
addEventListener('touchstart', () => (lerp = 1), { passive: true })

function update() {
  scroll += (target - scroll) * lerp
  if (Math.abs(target - scroll) < 0.5) scroll = target
  wrapper.scrollTo(0, scroll)
  raf = scroll === target ? 0 : requestAnimationFrame(update)
}

addEventListener('scroll', () => {
  target = scrollY
  if (!raf) raf = requestAnimationFrame(update)
})

// the browser moved the wrapper itself (focus, anchor, scrollIntoView,
// scroll anchoring): adopt it as the new position and bring the window along
wrapper.addEventListener('scroll', () => {
  if (Math.abs(wrapper.scrollTop - scroll) < 1) return // our own write
  scroll = target = wrapper.scrollTop
  window.scrollTo(0, scroll)
})

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
