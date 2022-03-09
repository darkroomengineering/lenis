import Lenis from "../src"

document.documentElement.classList.add("is-loaded")
document.documentElement.classList.remove("is-loading")

setTimeout(() => {
  document.documentElement.classList.add("is-ready")
}, 300)

const lenis = new Lenis({
  wrapper: document.querySelector("[data-scroll-wrapper]"),
  content: document.querySelector("[data-scroll-content]"),
  direction: "vertical",
  smooth: 0.88,
  effects: true,
  autoRaf: true,
})

window.lenis = lenis

console.log(lenis)

lenis.on("scroll", (e) => {
  // console.log(e.currentElements)
})

lenis.on("call", (a, b, c) => {
  // console.log(a, b, c)
})

// let options = {
//   el: document.querySelector("#js-scroll"),
//   smooth: true,
//   getSpeed: true,
//   getDirection: true,
//   autoRaf: false,
// }

// if (
//   document.querySelector("#js-scroll").getAttribute("data-horizontal") == "true"
// ) {
//   options.direction = "horizontal"
//   options.gestureDirection = "both"
//   options.tablet = {
//     smooth: true,
//     direction: "horizontal",
//     horizontalGesture: true,
//     autoRaf: false,
//   }
//   options.smartphone = {
//     smooth: false,
//   }
//   options.reloadOnContextChange = true
// }

// setTimeout(() => {
//   const scroll = new LocomotiveScroll(options)
//   window.scroll = scroll

//   function onFrame() {
//     scroll.raf()
//     requestAnimationFrame(onFrame)
//   }

//   requestAnimationFrame(onFrame)

//   let dynamicBackgrounds = []
//   let dynamicColorElements = []

//   scroll.on("scroll", (instance) => {
//     const progress = (360 * instance.scroll.y) / instance.limit.y

//     scroll.el.style.backgroundColor = `hsl(${progress}, 11%, 81%)`

//     dynamicBackgrounds.forEach((obj) => {
//       obj.el.style.backgroundColor = `hsl(${progress}, 11%, 81%)`
//     })
//     dynamicColorElements.forEach((obj) => {
//       obj.el.style.color = `hsl(${progress}, 11%, 81%)`
//     })

//     document.documentElement.setAttribute("data-direction", instance.direction)
//   })

//   scroll.on("call", (value, way, obj) => {
//     if (value === "dynamicBackground") {
//       if (way === "enter") {
//         dynamicBackgrounds.push({
//           id: obj.id,
//           el: obj.el,
//         })
//       } else {
//         for (var i = 0; i < dynamicBackgrounds.length; i++) {
//           if (obj.id === dynamicBackgrounds[i].id) {
//             dynamicBackgrounds.splice(i, 1)
//           }
//         }
//       }
//     } else if (value === "dynamicColor") {
//       if (way === "enter") {
//         dynamicColorElements.push({
//           id: obj.id,
//           el: obj.el,
//         })
//       } else {
//         for (var i = 0; i < dynamicColorElements.length; i++) {
//           if (obj.id === dynamicColorElements[i].id) {
//             dynamicColorElements.splice(i, 1)
//           }
//         }
//       }
//     }
//   })
// }, 1000)
