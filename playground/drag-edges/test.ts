import Lenis from 'lenis'

const lenis = new Lenis({
  drag: { enabled: true },
  touch: { smooth: true },
})
;(window as unknown as { lenis: Lenis }).lenis = lenis

// input inside a shadow root — exercises the composedPath()[0] carve-out:
// from outside the shadow root, event.target is the host, not the input
const shadow = document
  .getElementById('shadow-host')!
  .attachShadow({ mode: 'open' })
shadow.innerHTML = `<input type="text" value="drag across this shadow input to select" style="width: 100%;" />`

// HUD — makes phantom drag state visible: after a missed pointerup (released
// outside the window, over an iframe…) isDragging stays true while no mouse
// button is held. That combination is the "STUCK" failure of the readiness list.
const hud = document.getElementById('hud')!
let lastPointerType = '—'
let buttons = 0

function render() {
  const stuck = lenis.isDragging && buttons === 0
  hud.classList.toggle('stuck', stuck)
  hud.textContent = [
    `pointerType : ${lastPointerType}`,
    `buttons     : ${buttons}`,
    `isDragging  : ${lenis.isDragging}`,
    `isScrolling : ${lenis.isScrolling}`,
    `scroll      : ${Math.round(lenis.scroll)}`,
    stuck ? '⚠ STUCK — dragging with no button held' : '',
  ]
    .filter(Boolean)
    .join('\n')
}

window.addEventListener(
  'pointermove',
  (event) => {
    lastPointerType = event.pointerType
    buttons = event.buttons
    render()
  },
  { passive: true }
)
window.addEventListener(
  'pointerdown',
  (event) => {
    lastPointerType = event.pointerType
    buttons = event.buttons
    render()
  },
  { passive: true }
)
lenis.on('scroll', render)
render()
