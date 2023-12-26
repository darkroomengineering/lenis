import { debounce } from './debounce'

export class Dimensions {
  constructor({ wrapper, content, autoResize = true } = {}) {
    this.wrapper = wrapper
    this.content = content

    if (autoResize) {
      const resize = debounce(this.resize, 250)

      if (this.wrapper !== window) {
        this.wrapperResizeObserver = new ResizeObserver(resize)
        this.wrapperResizeObserver.observe(this.wrapper)
      }

      this.contentResizeObserver = new ResizeObserver(resize)
      this.contentResizeObserver.observe(this.content)
    }

    this.resize()
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()
  }

  resize = () => {
    this.onWrapperResize()
    this.onContentResize()
  }

  onWrapperResize = () => {
    if (this.wrapper === window) {
      this.width = window.innerWidth
      this.height = window.innerHeight
    } else {
      this.width = this.wrapper.clientWidth
      this.height = this.wrapper.clientHeight
    }
  }

  onContentResize = () => {
    this.scrollHeight = this.content.scrollHeight
    this.scrollWidth = this.content.scrollWidth
  }

  get limit() {
    return {
      x: this.scrollWidth - this.width,
      y: this.scrollHeight - this.height,
    }
  }
}
