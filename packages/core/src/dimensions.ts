import { debounce } from './debounce'
import type { DimensionsOptions } from './types'

// Technical explanation
// - listen to 'resize' events on the wrapper and content
// - if 'observe' mode is enabled, use ResizeObserver to calculate the dimensions lazy
// - if 'read' mode is enabled, use naive dimensions (scrollHeight/clientHeight) immediately (can cause reflows)
// - cache the dimensions to avoid recalculating them too often
// - return the cached dimensions if the last calculation was less than the debounce value ago
// - return the new dimensions if the last calculation was more than the debounce value ago
// - resize the dimensions when the wrapper or content is resized
// - resize the dimensions when the debounce value changes
// note: document.documentElement is a special case, it's both valid as a wrapper and content

export class Dimensions {
  width?: number
  height?: number
  scrollHeight?: number
  scrollWidth?: number
  mode: 'observe' | 'read'
  debounceValue: number
  autoResize: boolean
  cache: {
    x?: number
    y?: number
    timestamp: number
  } = {
    x: undefined,
    y: undefined,
    timestamp: 0,
  }

  // These are instanciated in the constructor as they need information from the options
  private debouncedResize?: ReturnType<typeof debounce<() => void>>
  private wrapperResizeObserver?: ResizeObserver
  private contentResizeObserver?: ResizeObserver

  constructor(
    private wrapper: HTMLElement | Element,
    private content?: HTMLElement | Element,
    {
      autoResize = true,
      debounce: debounceValue = 500,
      mode = content ? 'observe' : 'read',
    }: DimensionsOptions = {}
  ) {
    if (!content && wrapper !== document.documentElement) {
      console.warn(
        'dimensions.mode "observe" is useless if "content" is undefined, automatically fallback to "read" mode'
      )
      mode = 'read'
    }

    this.autoResize = autoResize ?? true
    this.debounceValue = debounceValue ?? 500
    this.mode = mode ?? 'read'
    this.wrapper = wrapper
    this.content = content

    if (this.mode === 'observe') {
      if (this.autoResize) {
        this.debouncedResize = debounce(this.resize, this.debounceValue)

        this.wrapperResizeObserver = new ResizeObserver(this.debouncedResize)
        this.wrapperResizeObserver.observe(this.wrapper)

        if (this.content && this.content !== this.wrapper) {
          // avoid observing the wrapper if it's the same as the content
          this.contentResizeObserver = new ResizeObserver(this.debouncedResize)
          this.contentResizeObserver.observe(this.content)
        }
      }

      this.resize()
    }
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()
    this.debouncedResize?.cancel()
  }

  resize = () => {
    this.onWrapperResize()
    this.onContentResize()
  }

  onWrapperResize = () => {
    this.width = this.wrapper.clientWidth
    this.height = this.wrapper.clientHeight
  }

  onContentResize = () => {
    this.scrollHeight = this.wrapper.scrollHeight
    this.scrollWidth = this.wrapper.scrollWidth
  }

  get limit() {
    if (this.mode === 'observe') {
      return {
        x: this.scrollWidth! - this.width!,
        y: this.scrollHeight! - this.height!,
      }
    }

    if (Date.now() > this.cache.timestamp + this.debounceValue) {
      this.cache.x = this.wrapper.scrollWidth - this.wrapper.clientWidth
      this.cache.y = this.wrapper.scrollHeight - this.wrapper.clientHeight
      this.cache.timestamp = Date.now()
    }

    return {
      x: this.cache.x!,
      y: this.cache.y!,
    }
  }
}
