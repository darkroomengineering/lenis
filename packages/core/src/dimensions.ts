import { debounce } from './debounce'

/**
 * Dimensions class to handle the size of the content and wrapper
 *
 * @example
 * const dimensions = new Dimensions(wrapper, content)
 * dimensions.on('resize', (e) => {
 *   console.log(e.width, e.height)
 * })
 */
export class Dimensions {
  width = 0
  height = 0
  scrollHeight = 0
  scrollWidth = 0

  // These are instanciated in the constructor as they need information from the options
  private debouncedResize?: (...args: unknown[]) => void
  private wrapperResizeObserver?: ResizeObserver
  private contentResizeObserver?: ResizeObserver

  constructor(
    private wrapper: HTMLElement | Window | Element,
    private content: HTMLElement | Element,
    { autoResize = true, debounce: debounceValue = 250 } = {}
  ) {
    if (autoResize) {
      this.debouncedResize = debounce(this.resize, debounceValue)

      if (this.wrapper instanceof Window) {
        window.addEventListener('resize', this.debouncedResize, false)
      } else {
        this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize)
        this.wrapperResizeObserver.observe(this.wrapper)
      }

      this.contentResizeObserver = new ResizeObserver(this.debouncedResize)
      this.contentResizeObserver.observe(this.content)
    }

    this.resize()
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()

    if (this.wrapper === window && this.debouncedResize) {
      window.removeEventListener('resize', this.debouncedResize, false)
    }
  }

  resize = () => {
    this.onWrapperResize()
    this.onContentResize()
  }

  onWrapperResize = () => {
    if (this.wrapper instanceof Window) {
      this.width = window.innerWidth
      this.height = window.innerHeight
    } else {
      this.width = this.wrapper.clientWidth
      this.height = this.wrapper.clientHeight
    }
  }

  onContentResize = () => {
    if (this.wrapper instanceof Window) {
      this.scrollHeight = this.content.scrollHeight
      this.scrollWidth = this.content.scrollWidth
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
