import Slide from './slide'

export default class Snap {
  constructor(lenis) {
    this.lenis = lenis
    this.elements = new Map()

    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize)

    this.lenis.on('scroll', this.onScroll)
  }

  destroy() {
    this.lenis.off('scroll', this.onScroll)
    window.removeEventListener('resize', this.onWindowResize)
    this.elements.forEach((slide) => slide.destroy())
  }

  add(element, options = {}) {
    this.elements.set(element, new Slide(element, options))
  }

  remove(element) {
    this.elements.delete(element)
  }

  onWindowResize = () => {
    this.viewport.width = window.innerWidth
    this.viewport.height = window.innerHeight
  }

  onScroll = (e) => {
    console.log(e.isNativeScroll, e.velocity)
    // console.log('scroll', e.isScrolling)

    // console.log('scroll', e.scroll, e.velocity, e.isScrolling)

    if (e.velocity === 0) {
      // console.log('not scrolling anymore')

      this.elements.forEach(({ rect, type, align }) => {
        let snap

        if (align === 'start') {
          snap = rect.top
        } else if (align === 'center') {
          snap = rect.top + rect.height / 2 - this.viewport.height / 2
        } else if (align === 'end') {
          snap = rect.top + rect.height - this.viewport.height
        }

        console.log('snap', snap)

        if (
          snap !== undefined
          // && e.scroll > snap - this.viewport.height / 2 &&
          // e.scroll < snap + this.viewport.height / 2
        ) {
          // this.lenis.scrollTo(snap)
        }

        // setTimeout(() => {
        // console.log('scroll to', slide.rect.top + slide.rect.height / 2)

        // }, 0)
        // console.log(
        //   e.scroll,
        //   slide.type,
        //   slide.align,
        //   slide.rect.top + slide.rect.height / 2
        // )
      })
    }
  }
}
