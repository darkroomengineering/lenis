import { debounce } from './debounce'

// Cache for computed styles to avoid repeated getComputedStyle calls
const stickyStyleCache = new WeakMap<
  Element,
  { position: string; originalPosition?: string }
>()

// Shared ResizeObserver for document.body to avoid creating multiple observers
let sharedBodyResizeObserver: ResizeObserver | null = null
const bodyResizeCallbacks = new Set<() => void>()

function getSharedBodyResizeObserver() {
  if (!sharedBodyResizeObserver) {
    sharedBodyResizeObserver = new ResizeObserver(() => {
      bodyResizeCallbacks.forEach((cb) => cb())
    })
    sharedBodyResizeObserver.observe(document.body)
  }
  return {
    subscribe: (cb: () => void) => {
      bodyResizeCallbacks.add(cb)
      return () => {
        bodyResizeCallbacks.delete(cb)
        // Clean up observer if no more callbacks
        if (bodyResizeCallbacks.size === 0 && sharedBodyResizeObserver) {
          sharedBodyResizeObserver.disconnect()
          sharedBodyResizeObserver = null
        }
      }
    },
  }
}

function removeParentSticky(element: HTMLElement | null) {
  while (element && element !== document.body) {
    let cached = stickyStyleCache.get(element)
    if (!cached) {
      cached = { position: getComputedStyle(element).position }
      stickyStyleCache.set(element, cached)
    }
    if (cached.position === 'sticky') {
      cached.originalPosition = element.style.position
      element.style.position = 'static'
    }
    element = element.offsetParent as HTMLElement | null
  }
}

function addParentSticky(element: HTMLElement | null) {
  while (element && element !== document.body) {
    const cached = stickyStyleCache.get(element)
    if (cached?.position === 'sticky') {
      if (cached.originalPosition) {
        element.style.position = cached.originalPosition
      } else {
        element.style.removeProperty('position')
      }
    }
    element = element.offsetParent as HTMLElement | null
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

function scrollTop(element: HTMLElement, accumulator = 0) {
  const top = accumulator + element.scrollTop
  if (element.offsetParent) {
    return scrollTop(element.offsetParent as HTMLElement, top)
  }
  return top + window.scrollY
}

function scrollLeft(element: HTMLElement, accumulator = 0) {
  const left = accumulator + element.scrollLeft
  if (element.offsetParent) {
    return scrollLeft(element.offsetParent as HTMLElement, left)
  }
  return left + window.scrollX
}

export type SnapElementOptions = {
  align?: string | string[]
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
  align: string[]
  rect: Rect
  resizeObserver: ResizeObserver
  debouncedWrapperResize: () => void
  private unsubscribeBodyResize: () => void

  constructor(
    element: HTMLElement,
    {
      align = ['start'],
      ignoreSticky = true,
      ignoreTransform = false,
    }: SnapElementOptions = {}
  ) {
    this.element = element

    this.options = { align, ignoreSticky, ignoreTransform }

    this.align = [align].flat()

    // Initialize rect with default values before any resize calculations
    this.rect = {
      top: 0,
      left: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      bottom: 0,
      right: 0,
      element: this.element,
    }

    this.debouncedWrapperResize = debounce(this.onWrapperResize, 500)

    // Use shared ResizeObserver for document.body
    this.unsubscribeBodyResize = getSharedBodyResizeObserver().subscribe(
      this.debouncedWrapperResize
    )
    this.onWrapperResize()

    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.element)
    this.setRect({
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
    })
  }

  destroy() {
    this.unsubscribeBodyResize()
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
    // Batch reads before writes to avoid layout thrashing
    const needsStickyFix = this.options.ignoreSticky

    // Remove sticky (write)
    if (needsStickyFix) removeParentSticky(this.element)

    // Batch all reads together
    let top: number
    let left: number
    if (this.options.ignoreTransform) {
      top = offsetTop(this.element)
      left = offsetLeft(this.element)
    } else {
      const rect = this.element.getBoundingClientRect()
      const scrollTopVal = scrollTop(this.element)
      const scrollLeftVal = scrollLeft(this.element)
      top = rect.top + scrollTopVal
      left = rect.left + scrollLeftVal
    }

    // Restore sticky (write)
    if (needsStickyFix) addParentSticky(this.element)

    // Update rect (write)
    this.setRect({ top, left })
  }

  onResize = ([entry]: ResizeObserverEntry[]) => {
    if (!entry?.borderBoxSize[0]) return
    const width = entry.borderBoxSize[0].inlineSize
    const height = entry.borderBoxSize[0].blockSize

    this.setRect({ width, height })
  }
}
