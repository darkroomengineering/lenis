import Lenis from '../src'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
// https://codepen.io/GreenSock/pen/ExPdqKy?editors=1010

gsap.registerPlugin(ScrollTrigger)

console.log(window)

const lenis = new Lenis({
  wrapper: document.querySelector('#scroll-wrapper'),
  content: document.querySelector('#scroll-content'),
  lerp: 0.1,
  smooth: true,
  customScrollbar: false,
})

gsap.ticker.add(() => {
  lenis.raf()
})

// lenis.on("scroll", ({ lerpedScroll }) => {
//   console.log(lerpedScroll.y)
// })

// function raf() {
//   lenis.raf()
//   requestAnimationFrame(raf)
// }

// requestAnimationFrame(raf)

// window.lenis = lenis

// console.log(lenis)

ScrollTrigger.defaults({ markers: true })

if (lenis.smooth === true) {
  lenis.on('scroll', ScrollTrigger.update)

  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      // return arguments.length
      //   ? lenis.scrollTo(value, true)
      //   : lenis.lerpedScroll.y
      return lenis.lerpedScroll.y
    },
    getBoundingClientRect() {
      return {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }
    },
    fixedMarkers: true,
    pinType: 'transform',
  })

  // // each time the window updates, we should refresh ScrollTrigger and then update LocomotiveScroll.
  ScrollTrigger.addEventListener('refresh', () => lenis.update())

  // after everything is set up, refresh() ScrollTrigger and update LocomotiveScroll because padding may have been added for pinning, etc.
  ScrollTrigger.refresh()
}

const parallaxElements = [...document.querySelectorAll('[data-scroll-speed]')]

parallaxElements.forEach((element) => {
  const speed = parseFloat(element.getAttribute('data-scroll-speed'))

  gsap
    .timeline({
      scrollTrigger: {
        invalidateOnRefresh: true,
        id: 'parallax',
        trigger: element,
        scrub: true,
        start: `top bottom`,
        end: () => {
          const y = window.innerHeight * speed
          return `bottom-=${y * 2} top`
        },
      },
      defaults: { ease: 'none' },
    })
    .fromTo(
      element,
      {
        y: () => {
          const y = window.innerHeight * speed
          return y
        },
      },
      {
        y: () => {
          const y = window.innerHeight * speed
          return -y
        },
      }
    )
})

// // --- RED PANEL ---
// gsap.from('.line-1', {
//   scrollTrigger: {
//     id: 'red',
//     trigger: '.line-1',
//     scrub: true,
//     start: 'top bottom',
//     end: 'bottom top',
//   },
//   scaleX: 0,
//   transformOrigin: 'left center',
//   ease: 'none',
// })

// // --- ORANGE PANEL ---
// gsap.from('.line-2', {
//   scrollTrigger: {
//     id: 'orange',
//     trigger: '.orange',
//     scrub: true,
//     pin: true,
//     start: 'top top',
//     end: '+=100%',
//     onUpdate: (self) => {
//       console.log(self.progress)
//     },
//   },
//   scaleX: 0,
//   transformOrigin: 'left center',
//   ease: 'none',
// })

// // --- PURPLE/GREEN PANEL ---
// var tl = gsap.timeline({
//   scrollTrigger: {
//     id: 'PURPLE',
//     trigger: '.purple',
//     // scroller: ".smooth-scroll",
//     scrub: true,
//     pin: true,
//     start: 'top top',
//     end: '+=100%',
//   },
// })

// tl.from('.purple p', { scale: 0.3, rotation: 45, autoAlpha: 0, ease: 'power2' })
//   .from(
//     '.line-3',
//     { scaleX: 0, transformOrigin: 'left center', ease: 'none' },
//     0
//   )
//   .to('.purple', { backgroundColor: '#28a92b' }, 0)
