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
  align?: string[]
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
  // @ts-ignore
  rect: Rect = {}
  wrapperResizeObserver: ResizeObserver
  resizeObserver: ResizeObserver

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

    // this.ignoreSticky = ignoreSticky
    // this.ignoreTransform = ignoreTransform

    this.align = [align].flat()

    // TODO: assing rect immediately

    this.wrapperResizeObserver = new ResizeObserver(this.onWrapperResize)
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
    let top, left

    if (this.options.ignoreSticky) removeParentSticky(this.element)
    if (this.options.ignoreTransform) {
      top = offsetTop(this.element)
      left = offsetLeft(this.element)
    } else {
      const rect = this.element.getBoundingClientRect()
      top = rect.top + scrollTop(this.element)
      left = rect.left + scrollLeft(this.element)
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
