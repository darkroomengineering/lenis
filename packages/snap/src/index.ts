import Slide from './slide'

export default class Snap {
  constructor(lenis, { type = 'mandatory' } = {}) {
    this.lenis = lenis
    this.type = type
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

  onScroll = ({ scroll, limit, velocity }) => {
    console.log(velocity)
    if (Math.abs(velocity) < 1) {
      scroll = Math.ceil(scroll)
      // console.log('not scrolling anymore')

      let snaps = [0, limit]

      this.elements.forEach(({ rect, align }) => {
        let snap

        align.forEach((align) => {
          if (align === 'start') {
            snap = rect.top
          } else if (align === 'center') {
            snap = rect.top + rect.height / 2 - this.viewport.height / 2
          } else if (align === 'end') {
            snap = rect.top + rect.height - this.viewport.height
          }

          if (snap !== undefined) {
            snaps.push(Math.ceil(snap))
          }
        })
      })

      snaps = snaps.sort((a, b) => Math.abs(a) - Math.abs(b))

      let prevSnap = snaps.findLast((snap) => snap <= scroll)
      if (prevSnap === undefined) prevSnap = snaps[0]
      const distanceToPrevSnap = Math.abs(scroll - prevSnap)

      let nextSnap = snaps.find((snap) => snap >= scroll)
      if (nextSnap === undefined) nextSnap = snaps[snaps.length - 1]
      const distanceToNextSnap = Math.abs(scroll - nextSnap)

      const snap = distanceToPrevSnap < distanceToNextSnap ? prevSnap : nextSnap

      const distance = Math.abs(scroll - snap)

      if (
        this.type === 'mandatory' ||
        (this.type === 'proximity' && distance <= this.viewport.height / 2)
      ) {
        this.lenis.scrollTo(snap)
      }
    }
  }
}
