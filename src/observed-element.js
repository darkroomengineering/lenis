export class ObservedElement {
  constructor(element) {
    this.element = element

    // If the element is the window, add a resize event listener and trigger it initially
    if (element === window) {
      window.addEventListener('resize', this.onWindowResize)
      this.onWindowResize()
    } else {
      // If the element is not the window, observe its size using ResizeObserver
      this.width = this.element.offsetWidth
      this.height = this.element.offsetHeight

      this.resizeObserver = new ResizeObserver(this.onResize)
      this.resizeObserver.observe(this.element)
    }
  }

  // Clean up event listeners and disconnect the ResizeObserver when destroying the instance
  destroy() {
    window.removeEventListener('resize', this.onWindowResize)
    this.resizeObserver.disconnect()
  }

  // Update the width and height properties based on the observed element's size
  onResize = ([entry]) => {
    if (entry) {
      const { width, height } = entry.contentRect
      this.width = width
      this.height = height
    }
  }

  // Update the width and height properties based on the window's size
  onWindowResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }
}
