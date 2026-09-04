import { debounce } from '../../utils/debounce'
import type { SnapAlign, SnapAlignOption, SnapTargetOptions } from './types'

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
 * Each element produces one snap target per `align` entry, on the active
 * axis (vertical unless the parent Lenis is horizontal). In 2D (`'both'`) a
 * value or list applies to both axes and the x and y lists combine, every x
 * with every y — `['start', 'end']` is the four corners:
 *
 *   align: 'center'                    // one point, centered
 *   align: ['start', 'center', 'end']  // three points on the same element
 *   align: { x: 'start', y: 'end' }    // per axis (2D: x = start, y = end)
 *   align: { x: ['start', 'end'] }     // x only — an omitted axis is 'none'
 */
export type SnapElementOptions = SnapTargetOptions & {
  align?: SnapAlignOption
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
  /** `[xAlign, yAlign]` pairs — every pair adds a snap point. */
  align: [SnapAlign, SnapAlign][]
  // @ts-expect-error
  rect: Rect = {}
  wrapperResizeObserver: ResizeObserver
  resizeObserver: ResizeObserver
  debouncedWrapperResize: () => void

  constructor(
    element: HTMLElement,
    {
      align = 'start',
      ignoreSticky = true,
      ignoreTransform = false,
      ...target
    }: SnapElementOptions = {},
    // The Lenis scroll container — rects are expressed in its scroll space.
    private wrapper: HTMLElement = document.documentElement
  ) {
    this.element = element
    this.options = { align, ignoreSticky, ignoreTransform, ...target }

    const toList = (value: SnapAlign | SnapAlign[] = 'none') =>
      Array.isArray(value) ? value : [value]
    const { x, y } =
      typeof align === 'object' && !Array.isArray(align)
        ? align
        : { x: align, y: align }
    this.align = toList(x).flatMap((xAlign) =>
      toList(y).map((yAlign): [SnapAlign, SnapAlign] => [xAlign, yAlign])
    )

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
