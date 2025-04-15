import Lenis from 'lenis'

window.lenis = new Lenis({
  orientation: 'horizontal',
  gestureOrientation: 'both',
  autoRaf: true,
  allowNestedScroll: true,
})

// setInterval(() => {
//   document.querySelector('#work').style.width = `${50 + Math.random() * 30}vw`
// }, 1000)
