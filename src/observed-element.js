export class ObservedElement {
  constructor(element) {
    this.element = element

    if (element === window) {
      window.addEventListener('resize', this.onWindowResize)
      this.onWindowResize()
    } else {
      this.width = this.element.offsetWidth
      this.height = this.element.offsetHeight

      this.resizeObserver = new ResizeObserver(this.onResize)
      this.resizeObserver.observe(this.element)
    }
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize)
    this.resizeObserver.disconnect()
  }

  onResize = ([entry]) => {
    if (entry) {
      const { width, height } = entry.contentRect
      this.width = width
      this.height = height
    }
  }

  onWindowResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }
}
