import { debounce } from './debounce'

export class Dimensions {
  constructor(wrapper, content) {
    this.wrapper = wrapper
    this.content = content

    if (this.wrapper === window) {
      window.addEventListener('resize', this.onWindowResize, false)
      this.onWindowResize()
    } else {
      this.width = this.wrapper.clientWidth
      this.height = this.wrapper.clientHeight
      this.scrollHeight = this.wrapper.scrollHeight
      this.scrollWidth = this.wrapper.scrollWidth

      this.wrapperResizeObserver = new ResizeObserver(
        debounce(this.onWrapperResize, 100)
      )
      this.wrapperResizeObserver.observe(this.wrapper)
    }

    this.contentResizeObserver = new ResizeObserver(
      debounce(this.onContentResize, 100)
    )
    this.contentResizeObserver.observe(this.content)
  }

  onWindowResize = () => {
    this.width = window.innerWidth
    this.height = window.innerHeight
  }

  destroy() {
    window.removeEventListener('resize', this.onWindowResize, false)

    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()
  }

  onWrapperResize = () => {
    this.width = this.wrapper.clientWidth
    this.height = this.wrapper.clientHeight
  }

  onContentResize = () => {
    if (this.wrapper === window) {
      this.scrollHeight = document.documentElement.scrollHeight
      this.scrollWidth = document.documentElement.scrollWidth
    } else {
      this.scrollHeight = this.wrapper.scrollHeight
      this.scrollWidth = this.wrapper.scrollWidth
    }
  }

  get limit() {
    return {
      x: this.scrollWidth - this.width,
      y: this.scrollHeight - this.height,
    }
  }
}
