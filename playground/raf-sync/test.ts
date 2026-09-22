// No lenis. The page scrolls natively and a fixed layer (#canvas, think a
// WebGL canvas) follows a box in the content by reading scrollY once per
// frame. No scroll event: scroll steps run before raf callbacks in the same
// rendering update, so the value read here is the one this frame paints with.
const box = document.getElementById('box')!
const ghost = document.getElementById('ghost')!
const readout = document.getElementById('readout')!

// cache the box's rect in document coordinates (scroll-independent), so the
// frame does no layout read: on-screen top = rect.top - scrollY
let rect = { top: 0, left: 0 }
function measure() {
  const { top, left, width, height } = box.getBoundingClientRect()
  rect = { top: top + scrollY, left: left + scrollX }
  ghost.style.width = `${width}px`
  ghost.style.height = `${height}px`
}
new ResizeObserver(measure).observe(box)
addEventListener('resize', measure)
measure()

;(function raf() {
  ghost.style.transform = `translate3d(${rect.left}px, ${rect.top - scrollY}px, 0)`
  readout.textContent = `scrollY ${scrollY}`
  requestAnimationFrame(raf)
})()
