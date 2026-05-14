import Lenis from 'lenis'

const lenis = new Lenis({
  wrapper: document.querySelector('#grid')!,
  orientation: 'both',
  infinite: true,
  touch: {
    smooth: true,
    // ios: {
    //   smooth: true,
    // },
  },
  wheel: {
    smooth: true,
  },
  // onGesture: (data) => {
  //   console.log(data.type, data.deltaX, data.deltaY)
  // },
})

lenis.on('scroll', (lenis) => {
  // console.log(lenis.isScrolling, lenis.isTouch, lenis.isWheel)
  console.log({
    scroll: lenis.y.scroll,
    // rounded: Math.round(lenis.x.scroll),
    actuallScroll: lenis.y.actualScroll,
  })
  // console.log({
  //   scroll: lenis.y.scroll,
  //   rounded: Math.round(lenis.y.scroll),
  //   actualScroll: lenis.y.actualScroll,
  // })

  if (lenis.x.scroll !== lenis.x.actualScroll) {
    console.log('x is not actualScroll')
  }
})

window.lenis = lenis

// const wrapper = document.querySelector('#grid')!

// wrapper.addEventListener('wheel', (e) => {
//   // e.preventDefault()
//   console.log('wheel', e.deltaX, e.deltaY)
// })
