import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

document.querySelector('#nested-content')!.innerHTML =
  new LoremIpsum().generateParagraphs(30)
document
  .querySelector('#app')!
  .insertAdjacentText('afterbegin', new LoremIpsum().generateParagraphs(20))
document
  .querySelector('#app')!
  .insertAdjacentText('beforeend', new LoremIpsum().generateParagraphs(20))

const lenis = new Lenis({
  autoRaf: true,
  syncTouch: true,
  // autoResize: false,
  // lerp: 0.9,
  // virtualScroll: (e) => {
  //   // e.deltaY *= 10
  //   return !e.event.shiftKey
  //   // return true
  // },
  // duration: 2,
  // easing: (t) => t,
  // prevent: () => {
  //   return true
  // },
  // prevent: (node) => {
  //   return (
  //     node.classList?.contains('lenis-scrolling') &&
  //     node.classList?.contains('lenis-smooth') &&
  //     !node.classList?.contains('lenis-stopped')
  //   )
  // },
})

const nestedLenis = new Lenis({
  wrapper: document.querySelector('#nested')!,
  content: document.querySelector('#nested-content')!,
  autoRaf: true,
  // overscroll: false,
  // orientation: 'horizontal',
  // gestureOrientation: 'horizontal',
  // infinite: true,

  // smoothWheel: false,
})

window.nestedLenis = nestedLenis

// console.log(lenis.dimensions.height)
lenis.on('scroll', (e) => {
  // console.log(e.scroll, e.velocity)
  // console.log(e.scroll, e.velocity, e.isScrolling, e.userData)
})
// lenis.on('virtual-scroll', (e) => {
//   // console.log(e)
//   // e.deltaY *= 10
//   // e.cancel = true
// })
window.lenis = lenis

declare global {
  interface Window {
    lenis: Lenis
  }
}

// window.addEventListener('resize', () => {
//   lenis.resize()

//   console.log(lenis.actualScroll, lenis.scroll, window.scrollY)
// })

// Proxy test for lenis
// const proxyLenis = new Proxy(lenis, {})

// const scroll100 = document.getElementById('scroll-100')

// scroll100?.addEventListener('click', () => {
//   // proxyLenis?.scrollTo(100, {
//   //   lerp: 0.1,
//   // })
//   lenis.scrollTo(100, {
//     lerp: 0.1,
//   })
// })

document.documentElement.addEventListener('wheel', (e) => {
  console.log('wheel')
})

// function raf(time: number) {
//   lenis.raf(time)
//   nestedLenis.raf(time)
//   requestAnimationFrame(raf)
// }

// requestAnimationFrame(raf)

const stopButton = document.getElementById('stop')
const startButton = document.getElementById('start')

stopButton?.addEventListener('click', () => {
  lenis.stop()
  console.log('stop')
})

startButton?.addEventListener('click', () => {
  lenis.start()
})
