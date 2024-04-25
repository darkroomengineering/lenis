function removeParentSticky(element) {
  const position = getComputedStyle(element).position

  const isSticky = position === 'sticky'

  if (isSticky) {
    element.style.setProperty('position', 'static')
    element.dataset.sticky = 'true'
  }

  if (element.offsetParent) {
    removeParentSticky(element.offsetParent)
  }
}

function addParentSticky(element) {
  if (element?.dataset?.sticky === 'true') {
    element.style.removeProperty('position')
    element.dataset.sticky = 'true'
    delete element.dataset.sticky
  }

  if (element.parentNode) {
    addParentSticky(element.parentNode)
  }
}

function offsetTop(element, accumulator = 0) {
  const top = accumulator + element.offsetTop
  if (element.offsetParent) {
    return offsetTop(element.offsetParent, top)
  }
  return top
}

function offsetLeft(element, accumulator = 0) {
  const left = accumulator + element.offsetLeft
  if (element.offsetParent) {
    return offsetLeft(element.offsetParent, left)
  }
  return left
}

function scrollTop(element, accumulator = 0) {
  const top = accumulator + element.scrollTop
  if (element.offsetParent) {
    return scrollTop(element.offsetParent, top)
  }
  return top + window.scrollY
}

function scrollLeft(element, accumulator = 0) {
  const left = accumulator + element.scrollLeft
  if (element.offsetParent) {
    return scrollLeft(element.offsetParent, left)
  }
  return left + window.scrollX
}

const ignoreSticky = true
const ignoreTransform = false

export default class Slide {
  constructor(element, { align = 'start', type = 'mandatory' } = {}) {
    this.element = element
    this.align = align
    this.type = type

    this.rect = {}

    this.wrapperResizeObserver = new ResizeObserver(this.onWrapperResize)
    this.wrapperResizeObserver.observe(document.body)

    this.resizeObserver = new ResizeObserver(this.onResize)
    this.resizeObserver.observe(this.element)
  }

  destroy() {
    this.wrapperResizeObserver.disconnect()
    this.resizeObserver.disconnect()
  }

  setRect({ top, left, width, height, element }) {
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

    if (ignoreSticky) removeParentSticky(this.element)
    if (ignoreTransform) {
      top = offsetTop(this.element)
      left = offsetLeft(this.element)
    } else {
      const rect = this.element.getBoundingClientRect()
      top = rect.top + scrollTop(this.element)
      left = rect.left + scrollLeft(this.element)
    }
    if (ignoreSticky) addParentSticky(this.element)

    this.setRect({ top, left })
  }

  onResize = ([entry]) => {
    const width = entry.borderBoxSize[0].inlineSize
    const height = entry.borderBoxSize[0].blockSize

    this.setRect({ width, height })
  }
}
