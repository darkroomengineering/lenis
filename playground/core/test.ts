import Lenis from 'lenis'
import { LoremIpsum } from 'lorem-ipsum'

document.querySelector('#nested-content')!.innerHTML =
  new LoremIpsum().generateParagraphs(60)
document.querySelector('#nested-horizontal-content')!.innerHTML =
  new LoremIpsum().generateParagraphs(3)
document
  .querySelector('#app')!
  .insertAdjacentText('afterbegin', new LoremIpsum().generateParagraphs(20))
document
  .querySelector('#app')!
  .insertAdjacentText(
    'beforeend',
    `${new LoremIpsum().generateParagraphs(40)}test123`
  )

// document.querySelector('main')?.addEventListener('scrollend', () => {
//   console.log('scrollend')
// })

window.addEventListener('scroll', (_e) => {
  // console.log('window scroll', e)
})

window.addEventListener('scrollend', (e) => {
  // console.log('window scrollend', e)
})

document.querySelector('#nested')?.addEventListener('scrollend', (_e) => {
  // console.log('nested scrollend', e)
})

window.addEventListener('hashchange', () => {
  console.log('hashchange')
})

const lenis = new Lenis({
  wheel: {
    smooth: true,
  },
  touch: {
    smooth: true,
    // duration: 5,
  },
  dimensions: {
    mode: 'read',
  },
  onGesture: (data, lenis) => {
    // console.log(data)
    // return {
    //   ...data,
    //   deltaX: data.deltaX * 2,
    //   deltaY: data.deltaY * 2,
    // }
  },
})

// const _nestedLenis = new Lenis({
//   wrapper: document.querySelector('#nested')!,
//   content: document.querySelector('#nested-content')!,
//   autoRaf: true,
//   // overscroll: false,
//   // orientation: 'horizontal',
//   // gestureOrientation: 'horizontal',
//   // infinite: true,
// })

lenis.on('scroll', (lenis) => {
  console.log(lenis.limit)
  // console.log('scroll', e)
})

// document.querySelectorAll('a[href*="#"]').forEach((node) => {
//   node.addEventListener('click', (e) => {
//     // lenis.reset()
//     // e.preventDefault()
//     // console.log(node.href)
//   })
// })

// window.addEventListener('hashchange', () => {
//   console.log('hashchange')
// })

// const nestedLenis = new Lenis({
//   wrapper: document.querySelector('#nested')!,
//   content: document.querySelector('#nested-content')!,
//   autoRaf: true,
//   // overscroll: false,
//   // orientation: 'horizontal',
//   // gestureOrientation: 'horizontal',
//   // infinite: true,

//   // smoothWheel: false,
// })

// window.nestedLenis = nestedLenis

// console.log(lenis.dimensions.height)
lenis.on('scroll', (_e) => {
  // console.log(e.isScrolling)
  // console.log(e.scroll, e.velocity)
  // console.log(e.scroll, e.velocity, e.isScrolling, e.userData)
})
// lenis.on('virtual-scroll', (e) => {
//   // console.log(e)
//   // e.deltaY *= 10
//   // e.cancel = true
// })
// window.lenis = lenis

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

// document.documentElement.addEventListener('wheel', (e) => {
//   console.log('wheel')
// })

// function raf(time: number) {
//   lenis.raf(time)
//   nestedLenis.raf(time)
//   requestAnimationFrame(raf)
// }

// requestAnimationFrame(raf)

document.getElementById('stop')?.addEventListener('click', () => {
  // document.documentElement.style.overflow = 'hidden'
  lenis.stop()
})

document.getElementById('start')?.addEventListener('click', () => {
  // document.documentElement.style.overflow = 'auto'
  lenis.start()
})

document.getElementById('scroll-start')?.addEventListener('click', () => {
  lenis.scrollTo(100, {
    lock: true,
    duration: 1,
    onComplete: () => {
      console.log('onComplete')
    },
  })
})

document.getElementById('scroll-center')?.addEventListener('click', () => {
  lenis.scrollTo(lenis.limit / 2, {
    // duration: 10,
    // easing: (t) => t,
  })
})

document.getElementById('scroll-end')?.addEventListener('click', () => {
  lenis.scrollTo(lenis.limit - 100)
})

// const stopButton = document.getElementById('stop')
// const startButton = document.getElementById('start')

// stopButton?.addEventListener('click', () => {
//   lenis.stop()
//   console.log('stop')
// })

// startButton?.addEventListener('click', () => {
//   lenis.start()
// })
