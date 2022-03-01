export function offsetTop(element, accumulator = 0) {
  const top = accumulator + element.offsetTop
  if (element.offsetParent) {
    return offsetTop(element.offsetParent, top)
  }
  return top
}

export function offsetLeft(element, accumulator = 0) {
  const left = accumulator + element.offsetLeft
  if (element.offsetParent) {
    return offsetLeft(element.offsetParent, left)
  }
  return left
}

export class Rect {
  constructor(element) {
    this.element = element

    this.update()
  }

  update() {
    this.windowWidth = Math.min(
      document.documentElement.clientWidth,
      window.innerWidth
    )
    this.windowHeight = Math.min(
      document.documentElement.clientHeight,
      window.innerWidth
    )

    this.top = offsetTop(this.element)
    this.left = offsetLeft(this.element)

    const { width, height } = this.element.getBoundingClientRect()
    this.width = width
    this.height = height

    this.right = this.left + this.width
    this.bottom = this.top + this.height
  }

  computeRect(x = 0, y = 0) {
    const rect = {
      top: this.top - y,
      left: this.left - x,
      height: this.height,
      width: this.width,
      bottom: this.windowHeight - (this.top - y + this.height),
      right: this.windowWidth - (this.left - x + this.width),
    }

    return rect
  }

  computeIntersection(x, y, margin = 0) {
    const rect = this.computeRect(x, y)

    const inView =
      rect.top + rect.height > -margin && rect.bottom + rect.height > -margin

    return inView
  }
}
