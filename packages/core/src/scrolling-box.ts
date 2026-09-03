import { debounce } from '../../utils/debounce'
import { Emitter } from '../../utils/emitter'
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

export class ScrollingBox {
  width?: number
  height?: number
  scrollHeight?: number
  scrollWidth?: number
  private mode: 'observe' | 'read'
  private debounceValue: number
  private autoResize: boolean
  private cache: {
    x?: number
    y?: number
    timestamp: number
  } = {
    x: undefined,
    y: undefined,
    timestamp: 0,
  }
  private readonly emitter = new Emitter()
  isScrollContainer!: {
    x: boolean
    y: boolean
  }

  // These are instanciated in the constructor as they need information from the options
  private debouncedResize?: ReturnType<typeof debounce<() => void>>
  private wrapperResizeObserver?: ResizeObserver
  private contentResizeObserver?: ResizeObserver

  /**
   * Add an event listener for the given event and callback
   *
   * @param event Event name
   * @param callback Callback function
   * @returns Unsubscribe function
   */
  on(
    event: 'overflow style changed',
    callback: (changed: { x: boolean; y: boolean }) => void
  ) {
    return this.emitter.on(event, callback as (...args: unknown[]) => void)
  }

  constructor(
    private wrapper: HTMLElement | Element,
    private content?: HTMLElement | Element,
    {
      autoResize = true,
      debounce: debounceValue = 500,
      mode = content ? 'observe' : 'read',
    }: DimensionsOptions = {}
  ) {
    if (
      !content &&
      wrapper !== document.documentElement &&
      mode === 'observe'
    ) {
      console.warn(
        'dimensions.mode "observe" is ignored if "content" is undefined, automatically fallback to "read" mode'
      )
      mode = 'read'
    }

    this.autoResize = autoResize ?? true
    this.debounceValue = debounceValue ?? 500
    this.mode = mode
    this.wrapper = wrapper
    this.content = content

    this.wrapper.addEventListener(
      'transitionend',
      this.onTransitionEnd as EventListener
    )
    this.wrapper.addEventListener(
      'transitioncancel',
      this.onTransitionEnd as EventListener
    )

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
    }

    this.resize()
  }

  destroy() {
    this.wrapperResizeObserver?.disconnect()
    this.contentResizeObserver?.disconnect()
    this.wrapper.removeEventListener(
      'transitionend',
      this.onTransitionEnd as EventListener
    )
    this.wrapper.removeEventListener(
      'transitioncancel',
      this.onTransitionEnd as EventListener
    )
    this.debouncedResize?.cancel()
    this.emitter.destroy()
  }

  resize = () => {
    this.onWrapperResize()
    this.onContentResize()
    this.onOverflowStyleChange()
  }

  private onWrapperResize = () => {
    this.width = this.wrapper.clientWidth
    this.height = this.wrapper.clientHeight
  }

  private onContentResize = () => {
    this.scrollHeight = this.wrapper.scrollHeight
    this.scrollWidth = this.wrapper.scrollWidth
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTopMax
  get maxScroll() {
    if (this.mode === 'observe') {
      return {
        x: this.scrollWidth! - this.width!,
        y: this.scrollHeight! - this.height!,
      }
    }

    if (Date.now() > this.cache.timestamp + this.debounceValue) {
      this.onWrapperResize()
      this.onContentResize()
      this.cache.x = this.scrollWidth! - this.width!
      this.cache.y = this.scrollHeight! - this.height!
      this.cache.timestamp = Date.now()
    }

    return {
      x: this.cache.x!,
      y: this.cache.y!,
    }
  }

  get isRootElement() {
    return this.wrapper === document.documentElement
  }

  // https://developer.mozilla.org/en-US/docs/Glossary/Scroll_container
  onOverflowStyleChange() {
    const check = (axis: 'overflow-x' | 'overflow-y') => {
      let value = getComputedStyle(this.wrapper).getPropertyValue(axis)

      // https://drafts.csswg.org/css-overflow/#overflow-propagation
      if (this.isRootElement) {
        if (value === 'visible')
          value = getComputedStyle(document.body).getPropertyValue(axis)
        return !['hidden', 'clip'].includes(value)
      }
      return ['scroll', 'auto'].includes(value)
    }

    const previous = this.isScrollContainer

    this.isScrollContainer = {
      x: check('overflow-x'),
      y: check('overflow-y'),
    }

    // Per-axis change flags so listeners can react to the flipped axis only
    const changed = {
      x: previous?.x !== this.isScrollContainer.x,
      y: previous?.y !== this.isScrollContainer.y,
    }

    if (changed.x || changed.y) {
      this.emitter.emit('overflow style changed', changed)
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#determine_if_the_content_of_an_element_is_overflowing
  get isOverflowing() {
    const { x, y } = this.maxScroll
    return {
      x: x > 0,
      y: y > 0,
    }
  }

  // requires css property transition-behavior: allow-discrete;
  private onTransitionEnd = (event: TransitionEvent) => {
    if (
      event.propertyName?.includes('overflow') &&
      (event.target === this.wrapper ||
        (this.isRootElement && event.target === document.body))
    ) {
      this.onOverflowStyleChange()
    }
  }

  get isScrollable() {
    const isScrollContainer = this.isScrollContainer
    const isOverflowing = this.isOverflowing

    return {
      x: isScrollContainer.x && isOverflowing.x,
      y: isScrollContainer.y && isOverflowing.y,
    }
  }
}
