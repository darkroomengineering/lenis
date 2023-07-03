import { Emitter } from './emitter'

export class OverflowObserver {
  constructor(element, { orientation } = {}) {
    this.element = element
    this.orientation = orientation

    this.emitter = new Emitter()

    let oldClassList = Object.values(element.classList)

    this.observer = new MutationObserver(([mutation]) => {
      if (mutation.attributeName === 'style') {
        this.check()
      } else if (mutation.attributeName === 'class') {
        const classList = Object.values(element.classList)
        const difference = classList
          .filter((x) => !oldClassList.includes(x))
          .concat(oldClassList.filter((x) => !classList.includes(x)))

        if (
          !difference.some((item) =>
            [
              'lenis',
              'lenis-scrolling',
              'lenis-stopped',
              'lenis-smooth',
            ].includes(item)
          )
        ) {
          this.check()
        }
        oldClassList = classList
      }
    })

    this.observer.observe(element, {
      attributes: true,
      attributeFilter: ['style', 'class'],
    })
  }

  on(event, callback) {
    return this.emitter.on(event, callback)
  }

  check() {
    const { overflowX, overflowY } = getComputedStyle(this.element)
    const overflow = this.orientation === 'horizontal' ? overflowX : overflowY
    const isVisible = !['hidden', 'clip'].includes(overflow)

    this.emitter.emit('change', isVisible)
  }

  destroy() {
    this.emitter.destroy()
    this.observer.disconnect()
  }
}
