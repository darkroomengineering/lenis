import { debounce } from './debounce'
import type { OnSnapCallback, SnapAlign } from './types'

function removeParentSticky(element: HTMLElement) {
  const position = getComputedStyle(element).position

  const isSticky = position === 'sticky'

  if (isSticky) {
    element.style.setProperty('position', 'static')
    element.dataset.sticky = 'true'
  }

  if (element.offsetParent) {
    removeParentSticky(element.offsetParent as HTMLElement)
  }
}

function addParentSticky(element: HTMLElement) {
  if (element?.dataset?.sticky === 'true') {
    element.style.removeProperty('position')
    delete element.dataset.sticky
  }

  if (element.offsetParent) {
    addParentSticky(element.offsetParent as HTMLElement)
  }
}

function offsetTop(element: HTMLElement, accumulator = 0) {
  const top = accumulator + element.offsetTop
  if (element.offsetParent) {
    return offsetTop(element.offsetParent as HTMLElement, top)
  }
  return top
}

function offsetLeft(element: HTMLElement, accumulator = 0) {
  const left = accumulator + element.offsetLeft
  if (element.offsetParent) {
    return offsetLeft(element.offsetParent as HTMLElement, left)
  }
  return left
}

/**
 * Each element produces a single 2D snap target. The `align` option controls
 * how that target is anchored on each axis:
 *
 *   align: 'center'                  // both axes centered
 *   align: ['start']                 // both axes start (shorthand)
 *   align: ['start', 'end']          // x = start, y = end
 *   align: ['none', 'center']        // x skipped, y centered
 *
 * Extra entries are ignored; missing entries fall back to the first.
 */
export type SnapElementOptions = {
  align?: SnapAlign | SnapAlign[]
  /** Lock the scroll while snapping to this element. Overridden by the instance-level `lock`. */
  lock?: boolean
  /** Fired when the scroll lands on this element's snap point. */
  onSnap?: OnSnapCallback
  ignoreSticky?: boolean
  ignoreTransform?: boolean
}

type Rect = {
  top: number
  left: number
  width: number
  height: number
  x: number
  y: number
  bottom: number
  right: number
  element: HTMLElement
}

export class SnapElement {
  element: HTMLElement
  options: SnapElementOptions
  /** [xAlign, yAlign] — both always defined. */
  align: [SnapAlign, SnapAlign]
  /** Per-element lock, hoisted from options like `align`. */
  lock?: boolean
  /** Per-element snap callback, hoisted from options like `align`. */
  onSnap?: OnSnapCallback
  // @ts-expect-error
  rect: Rect = {}
  wrapperResizeObserver: ResizeObserver
  resizeObserver: ResizeObserver
  debouncedWrapperResize: () => void

  constructor(
    element: HTMLElement,
    {
      align = 'start',
      lock,
      onSnap,
      ignoreSticky = true,
      ignoreTransform = false,
    }: SnapElementOptions = {},
    // The Lenis scroll container — rects are expressed in its scroll space.
    private wrapper: HTMLElement = document.documentElement
  ) {
    this.element = element
    this.options = { align, lock, onSnap, ignoreSticky, ignoreTransform }

    const list = Array.isArray(align) ? align : [align]
    const xAlign = (list[0] ?? 'start') as SnapAlign
    const yAlign = (list[1] ?? list[0] ?? 'start') as SnapAlign
    this.align = [xAlign, yAlign]
    this.lock = lock
    this.onSnap = onSnap

    this.debouncedWrapperResize = debounce(this.onWrapperResize, 500)

    this.wrapperResizeObserver = new ResizeObserver(this.debouncedWrapperResize)
    this.wrapperResizeObserver.observe(document.body)
    this.onWrapperResize()

    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.element)
    this.setRect({
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    })
  }

  destroy() {
    this.wrapperResizeObserver.disconnect()
    this.resizeObserver.disconnect()
  }

  setRect({
    top,
    left,
    width,
    height,
    element,
  }: {
    top?: number
    left?: number
    width?: number
    height?: number
    element?: HTMLElement
  } = {}) {
    top = top ?? this.rect.top
    left = left ?? this.rect.left
    width = width ?? this.rect.width
    height = height ?? this.rect.height
    element = element ?? this.rect.element

    if (
      top === this.rect.top &&
      left === this.rect.left &&
      width === this.rect.width &&
      height === this.rect.height &&
      element === this.rect.element
    )
      return

    this.rect.top = top
    this.rect.y = top
    this.rect.width = width
    this.rect.height = height
    this.rect.left = left
    this.rect.x = left
    this.rect.bottom = top + height
    this.rect.right = left + width
  }

  onWrapperResize = () => {
    let top: number | undefined
    let left: number | undefined

    if (this.options.ignoreSticky) removeParentSticky(this.element)
    if (this.options.ignoreTransform) {
      top = offsetTop(this.element)
      left = offsetLeft(this.element)
    } else {
      // Position in the wrapper's scroll space: viewport-relative rect, made
      // scroll-invariant by adding the wrapper's own scroll back. Walking
      // offsetParents doesn't work here — an unpositioned `overflow: auto`
      // wrapper is not an offsetParent, so its scroll would be missed.
      const rect = this.element.getBoundingClientRect()
      if (this.wrapper === document.documentElement) {
        top = rect.top + window.scrollY
        left = rect.left + window.scrollX
      } else {
        const wrapperRect = this.wrapper.getBoundingClientRect()
        top = rect.top - wrapperRect.top + this.wrapper.scrollTop
        left = rect.left - wrapperRect.left + this.wrapper.scrollLeft
      }
    }
    if (this.options.ignoreSticky) addParentSticky(this.element)

    this.setRect({ top, left })
  }

  onResize = ([entry]: ResizeObserverEntry[]) => {
    if (!entry?.borderBoxSize[0]) return
    const width = entry.borderBoxSize[0].inlineSize
    const height = entry.borderBoxSize[0].blockSize

    this.setRect({ width, height })
  }
}
