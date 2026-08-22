import Lenis from 'lenis'
import Snap from 'lenis/snap'

const lenis = new Lenis({
  touch: { smooth: true },
})

const snap = new Snap(lenis, {
  duration: 1,
})

// Snap to each wrapper's flow position (ignoreSticky, the default, measures
// the un-stuck position even while a card is pinned).
snap.addElements(
  Array.from(document.querySelectorAll<HTMLElement>('.card-wrapper')),
  { align: 'start' }
)

;(window as unknown as { lenis: Lenis; snap: Snap }).lenis = lenis
;(window as unknown as { lenis: Lenis; snap: Snap }).snap = snap
