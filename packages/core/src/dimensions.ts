import { debounce } from './debounce'

type DimensionsOptions = {
  wrapper: Window | HTMLElement
  content: HTMLElement
  autoResize?: boolean
  debounce?: number
}

export class Dimensions {
  wrapper: Window | HTMLElement
  content: HTMLElement
  width: number = 0
  height: number = 0
  scrollWidth: number = 0
  scrollHeight: number = 0
  debouncedResize?: Function
  wrapperResizeObserver?: ResizeObserver
  contentResizeObserver?: ResizeObserver

  // @ts-ignore
  constructor({
    wrapper,
    content,
    autoResize = true,
    debounce: debounceValue = 250,
  }: DimensionsOptions = {}) {
    this.wrapper = wrapper
    this.content = content

    if (autoResize) {
      this.debouncedResize = debounce(this.resize, debounceValue)

      if (this.wrapper === window) {
        window.addEventListener(
          'resize',
          this.debouncedResize as EventListener,
          false
        )
      } else {
        this.wrapperResizeObserver = new ResizeObserver(
          this.debouncedResize as ResizeObserverCallback
        )
        this.wrapperResizeObserver.observe(this.wrapper as HTMLElement)
      }

      this.contentResizeObserver = new ResizeObserver(
        this.debouncedResize as ResizeObserverCallback
      )
      this.contentResizeObserver.observe(this.content)
    }

    this.resize()
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()
    window.removeEventListener(
      'resize',
      this.debouncedResize as EventListener,
      false
    )
  }

  resize = () => {
    this.onWrapperResize()
    this.onContentResize()
  }

  onWrapperResize = () => {
    if (this.wrapper === window) {
      this.width = window.innerWidth
      this.height = window.innerHeight
    } else if (this.wrapper instanceof HTMLElement) {
      this.width = this.wrapper.clientWidth
      this.height = this.wrapper.clientHeight
    }
  }

  onContentResize = () => {
    if (this.wrapper === window) {
      this.scrollHeight = this.content.scrollHeight
      this.scrollWidth = this.content.scrollWidth
    } else if (this.wrapper instanceof HTMLElement) {
      this.scrollHeight = this.wrapper.scrollHeight
      this.scrollWidth = this.wrapper.scrollWidth
    }
  }

  get limit(): {
    x: number
    y: number
  } {
    return {
      x: this.scrollWidth - this.width,
      y: this.scrollHeight - this.height,
    }
  }
}
