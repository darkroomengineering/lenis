import Slide from './slide'

export default class Snap {
  constructor(lenis, { type = 'mandatory' } = {}) {
    this.lenis = lenis
    this.type = type
    this.elements = new Map()
    this.snaps = new Map()

    this.viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    }
    this.onWindowResize()
    window.addEventListener('resize', this.onWindowResize)

    this.lenis.on('scroll', this.onScroll)
  }

  // debug() {
  //   const element = document.createElement('div')
  //   element.style.cssText = `
  //     position: fixed;
  //     background: red;
  //     border-bottom: 1px solid red;
  //     left: 0;
  //     right: 0;
  //     top: 0;
  //     z-index: 9999;
  //   `
  //   document.body.appendChild(element)
  // }

  destroy() {
    this.lenis.off('scroll', this.onScroll)
    window.removeEventListener('resize', this.onWindowResize)
    this.elements.forEach((slide) => slide.destroy())
  }

  add(value) {
    const id = crypto.randomUUID()

    this.snaps.set(id, value)

    return () => this.remove(id)
  }

  remove(id) {
    this.elements.delete(element)
  }

  addElement(element, options = {}) {
    const id = crypto.randomUUID()

    this.elements.set(id, new Slide(element, options))

    return () => this.removeElement(id)
  }

  removeElement(id) {
    this.elements.delete(id)
  }

  onWindowResize = () => {
    this.viewport.width = window.innerWidth
    this.viewport.height = window.innerHeight
  }

  onScroll = ({ scroll, limit, velocity, isScrolling }, extra) => {
    console.log('scroll', extra)

    const { userData } = extra

    if (Math.abs(velocity) < 1 && userData?.initiator !== 'snap') {
      scroll = Math.ceil(scroll)
      // console.log('not scrolling anymore')

      let snaps = [0, ...this.snaps.values(), limit]

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
        // this.__isScrolling = true
        this.lenis.scrollTo(snap, {
          userData: { initiator: 'snap' },
        })
      }

      // console.timeEnd('scroll')
    }
  }
}
