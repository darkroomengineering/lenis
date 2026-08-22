import Lenis from 'lenis'

const lenis = new Lenis({
  orientation: 'both',
  drag: { enabled: true },
  touch: { smooth: true },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis
